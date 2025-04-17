import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.0";

// SMTP client for sending emails
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

// Constants
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASS = Deno.env.get("SMTP_PASSWORD") || "";
const EMAIL_FROM = Deno.env.get("SMTP_FROM") || "notifications@invoicesflow.app";
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize SMTP client
const smtp = new SMTPClient({
  connection: {
    hostname: SMTP_HOST,
    port: SMTP_PORT,
    tls: true,
    auth: {
      username: SMTP_USER,
      password: SMTP_PASS,
    },
  },
});

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdatePayload {
  job_id: string;
  new_status: "draft" | "active" | "pending_invoice" | "pending_payment" | "paid";
}

// Multilingual email templates
const emailTemplates = {
  pt: {
    pendingInvoice: {
      subject: (job: any) => `Pedido de Fatura: ${job.clients.name}/${job.campaigns.name}`,
      html: (context: any) => `
        <html>
          <body>
            <h1>Pedido de Fatura</h1>
            <p>Olá ${context.providerName},</p>
            <p>Precisamos que faça o upload da fatura para o seguinte projeto:</p>
            <div>
              <p><strong>Cliente:</strong> ${context.clientName}</p>
              <p><strong>Campanha:</strong> ${context.campaignName}</p>
              <p><strong>Valor:</strong> ${context.jobValue}</p>
              <a href="${context.uploadUrl}">Carregar Documentos</a>
            </div>
          </body>
        </html>
      `
    },
    // Add other template types here
  },
  en: {
    pendingInvoice: {
      subject: (job: any) => `Invoice Request: ${job.clients.name}/${job.campaigns.name}`,
      html: (context: any) => `
        <html>
          <body>
            <h1>Invoice Request</h1>
            <p>Hello ${context.providerName},</p>
            <p>We need you to upload the invoice for the following project:</p>
            <div>
              <p><strong>Client:</strong> ${context.clientName}</p>
              <p><strong>Campaign:</strong> ${context.campaignName}</p>
              <p><strong>Value:</strong> ${context.jobValue}</p>
              <a href="${context.uploadUrl}">Upload Documents</a>
            </div>
          </body>
        </html>
      `
    },
    // Add other template types here
  },
  es: {
    pendingInvoice: {
      subject: (job: any) => `Solicitud de Factura: ${job.clients.name}/${job.campaigns.name}`,
      html: (context: any) => `
        <html>
          <body>
            <h1>Solicitud de Factura</h1>
            <p>Hola ${context.providerName},</p>
            <p>Necesitamos que suba la factura para el siguiente proyecto:</p>
            <div>
              <p><strong>Cliente:</strong> ${context.clientName}</p>
              <p><strong>Campaña:</strong> ${context.campaignName}</p>
              <p><strong>Valor:</strong> ${context.jobValue}</p>
              <a href="${context.uploadUrl}">Subir Documentos</a>
            </div>
          </body>
        </html>
      `
    },
    // Add other template types here
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: StatusUpdatePayload = await req.json();
    const { job_id, new_status } = payload;

    if (!job_id || !new_status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch job details including related entities and provider's language
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        clients:client_id (name),
        campaigns:campaign_id (name),
        providers:provider_id (name, email, language),
        managers:manager_id (name, email)
      `)
      .eq("id", job_id)
      .single();

    if (jobError || !job) {
      console.error("Error fetching job:", jobError);
      return new Response(
        JSON.stringify({ error: "Job not found", details: jobError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format currency for email
    const formatCurrency = (value: number, currency: string) => {
      const symbols: Record<string, string> = {
        euro: "€",
        usd: "$",
        gbp: "£",
      };
      const symbol = symbols[currency.toLowerCase()] || currency;
      return `${symbol}${value.toLocaleString()}`;
    };

    const jobValue = formatCurrency(job.value, job.currency);
    const dueDate = job.due_date ? new Date(job.due_date).toLocaleDateString() : "No deadline set";

    // Generate emails based on status
    let emailsSent = [];

    // Always notify the manager about status changes
    if (job.managers && job.managers.email) {
      const managerEmailHtml = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #3b82f6; }
              .content { padding: 20px; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .details { background-color: #f0f9ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
              h1 { color: #3b82f6; }
              .button { display: inline-block; background-color: #3b82f6; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Job Status Update</h1>
              </div>
              <div class="content">
                <p>Hello ${job.managers.name},</p>
                <p>The status of a job has been updated to <strong>${new_status}</strong>.</p>
                <div class="details">
                  <h3>Job Details:</h3>
                  <p><strong>Client:</strong> ${job.clients.name}</p>
                  <p><strong>Campaign:</strong> ${job.campaigns.name}</p>
                  <p><strong>Provider:</strong> ${job.providers.name}</p>
                  <p><strong>Value:</strong> ${jobValue}</p>
                  <p><strong>Due Date:</strong> ${dueDate}</p>
                </div>
                <p>
                  <a href="${APP_URL}jobs/edit/${job_id}" class="button">View Job Details</a>
                </p>
                <p>Thank you,<br>The InvoicesFlow Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message from InvoicesFlow.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await smtp.send({
        from: EMAIL_FROM,
        to: job.managers.email,
        subject: `Job Status Updated: ${new_status} - ${job.clients.name}/${job.campaigns.name}`,
        html: managerEmailHtml,
      });

      emailsSent.push({ recipient: job.managers.email, role: "manager" });
    }

    // Determine provider's language, fallback to Portuguese
    const providerLanguage = job.providers.language || 'pt';
    
    // If status is "Pending Invoice", notify the provider with upload link
    if (new_status === "pending_invoice" && job.providers && job.providers.email) {
      // Get the public_token (should be generated by the DB trigger)
      const { data: updatedJob, error: tokenError } = await supabase
        .from("jobs")
        .select("public_token")
        .eq("id", job_id)
        .single();

      if (tokenError || !updatedJob.public_token) {
        console.error("Error fetching token:", tokenError);
        return new Response(
          JSON.stringify({ error: "Failed to get public token", details: tokenError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const uploadUrl = `${APP_URL}upload/${job_id}/${updatedJob.public_token}`;

      // Select email template based on provider's language
      const template = emailTemplates[providerLanguage]?.pendingInvoice || emailTemplates['pt'].pendingInvoice;

      await smtp.send({
        from: EMAIL_FROM,
        to: job.providers.email,
        subject: template.subject(job),
        html: template.html({
          providerName: job.providers.name,
          clientName: job.clients.name,
          campaignName: job.campaigns.name,
          jobValue: `€${job.value.toLocaleString()}`,
          uploadUrl
        }),
      });

      emailsSent.push({ recipient: job.providers.email, role: "provider" });
    } else if (new_status === "pending_payment") {
			const { data: setting, error: settingError } = await supabase
				.from("settings")
				.select("*")
				.eq("name", "finance_email_address")
				.single();

				if (settingError || !setting) {
					console.error("Error fetching Finance Email Address:", settingError);
					return new Response(
						JSON.stringify({ error: "Finance Email Address not found", details: settingError }),
						{ status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
					);
				}

				const financeEmailHtml = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #3b82f6; }
              .content { padding: 20px; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .details { background-color: #f0f9ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
              h1 { color: #3b82f6; }
              .button { display: inline-block; background-color: #3b82f6; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Job Status Update</h1>
              </div>
              <div class="content">
                <p>Hello ${job.managers.name},</p>
                <p>The status of a job has been updated to <strong>${new_status}</strong>.</p>
                <div class="details">
                  <h3>Job Details:</h3>
                  <p><strong>Client:</strong> ${job.clients.name}</p>
                  <p><strong>Campaign:</strong> ${job.campaigns.name}</p>
                  <p><strong>Provider:</strong> ${job.providers.name}</p>
                  <p><strong>Value:</strong> ${jobValue}</p>
                  <p><strong>Due Date:</strong> ${dueDate}</p>
                </div>
                <p>
                  <a href="${APP_URL}jobs/edit/${job_id}" class="button">Confirm Payment</a>
                </p>
                <p>Thank you,<br>The InvoicesFlow Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message from InvoicesFlow.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await smtp.send({
        from: EMAIL_FROM,
        to: setting.value,
        subject: `Job Status Updated: ${new_status} - ${job.clients.name}/${job.campaigns.name}`,
        html: financeEmailHtml,
      });

      emailsSent.push({ recipient: setting.value, role: "finance" });
		}

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Status update notifications sent", 
        notifications: emailsSent,
        language: providerLanguage 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } finally {
    try {
      // Close SMTP connection to prevent resource leaks
      await smtp.close();
    } catch (error) {
      console.error("Error closing SMTP connection:", error);
    }
  }
});

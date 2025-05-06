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
  new_status: "draft" | "active" | "pending_invoice" | "pending_payment" | "paid" | "pending_validation";
}

// Multilingual email templates
const emailTemplates = {
  pt: {
    pendingInvoice: {
      subject: (job: any) => `Pedido de Fatura: ${job.campaigns?.clients?.name || 'Unknown Client'}/${job.campaigns?.name || 'Unknown Campaign'}`,
      html: (context: any) => `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #3b82f6; }
              .content { padding: 20px; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .details { background-color: #f0f9ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .important { background-color: #fff0f0; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f43f5e; }
              h1 { color: #3b82f6; }
              .button { display: inline-block; background-color: #3b82f6; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Pedido de Fatura</h1>
              </div>
              <div class="content">
                <p>Olá ${context.providerName},</p>
                <p>Estamos a solicitar uma fatura para o seu trabalho no seguinte projeto:</p>
                <div class="details">
                  <h3>Detalhes do Trabalho:</h3>
                  <p><strong>Cliente:</strong> ${context.clientName}</p>
                  <p><strong>Campanha:</strong> ${context.campaignName}</p>
                  <p><strong>Valor:</strong> ${context.jobValue}</p>
                  <p><strong>Data Limite:</strong> ${context.dueDate}</p>
                  <p><strong>Notas Adicionais:</strong> ${context.publicNotes}</p>
                </div>
								${context.providerMessage ? `
                <div class="important" style="background-color:#fff0f0; padding:15px; margin:15px 0; border-radius:5px; border-left:4px solid #f43f5e;">
                  <h3>Mensagem para o Fornecedor:</h3>
                  <p>${context.providerMessage}</p>
                </div>
                ` : ''}
								<div class="important">
                  <h3>Ação Necessária:</h3>
                  <p>Por favor, carregue a sua fatura e documentos de suporte usando o link seguro abaixo:</p>
                  <p>
                    <a href="${context.uploadUrl}" class="button">Carregar Documentos</a>
                  </p>
                  <p>Nota: Este link é específico para o seu trabalho e expirará quando o estado do trabalho mudar.</p>
                </div>
                <p>Obrigado pela sua atenção a este assunto.</p>
                <p>Cumprimentos,<br>A Equipa InvoicesFlow</p>
              </div>
              <div class="footer">
                <p>Esta é uma mensagem automática do InvoicesFlow. Por favor não responda a este email.</p>
              </div>
            </div>
          </body>
        </html>
      `
    },
  },
  en: {
    pendingInvoice: {
      subject: (job: any) => `Invoice Request: ${job.campaigns?.clients?.name || 'Unknown Client'}/${job.campaigns?.name || 'Unknown Campaign'}`,
      html: (context: any) => `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #3b82f6; }
              .content { padding: 20px; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .details { background-color: #f0f9ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .important { background-color: #fff0f0; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f43f5e; }
              h1 { color: #3b82f6; }
              .button { display: inline-block; background-color: #3b82f6; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Invoice Requested</h1>
              </div>
              <div class="content">
                <p>Hello ${context.providerName},</p>
                <p>We are requesting an invoice for your work on the following project:</p>
                <div class="details">
                  <h3>Job Details:</h3>
                  <p><strong>Client:</strong> ${context.clientName}</p>
                  <p><strong>Campaign:</strong> ${context.campaignName}</p>
                  <p><strong>Value:</strong> ${context.jobValue}</p>
                  <p><strong>Due Date:</strong> ${context.dueDate}</p>
                  <p><strong>Additional Notes:</strong> ${context.publicNotes}</p>
                </div>
								${context.providerMessage ? `
                <div class="important" style="background-color:#fff0f0; padding:15px; margin:15px 0; border-radius:5px; border-left:4px solid #f43f5e;">
                  <h3>Message to Provider:</h3>
                  <p>${context.providerMessage}</p>
                </div>
                ` : ''}
								<div class="important">
                  <h3>Action Required:</h3>
                  <p>Please upload your invoice and any supporting documents using the secure link below:</p>
                  <p>
                    <a href="${context.uploadUrl}" class="button">Upload Documents</a>
                  </p>
                  <p>Note: This link is specific to your job and will expire once the job status changes.</p>
                </div>
                <p>Thank you for your prompt attention to this matter.</p>
                <p>Best regards,<br>The InvoicesFlow Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message from InvoicesFlow. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    },
  },
  es: {
    pendingInvoice: {
      subject: (job: any) => `Solicitud de Factura: ${job.campaigns?.clients?.name || 'Unknown Client'}/${job.campaigns?.name || 'Unknown Campaign'}`,
      html: (context: any) => `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #3b82f6; }
              .content { padding: 20px; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .details { background-color: #f0f9ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .important { background-color: #fff0f0; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f43f5e; }
              h1 { color: #3b82f6; }
              .button { display: inline-block; background-color: #3b82f6; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Solicitud de Factura</h1>
              </div>
              <div class="content">
                <p>Hola ${context.providerName},</p>
                <p>Estamos solicitando una factura por su trabajo en el siguiente proyecto:</p>
                <div class="details">
                  <h3>Detalles del Trabajo:</h3>
                  <p><strong>Cliente:</strong> ${context.clientName}</p>
                  <p><strong>Campaña:</strong> ${context.campaignName}</p>
                  <p><strong>Valor:</strong> ${context.jobValue}</p>
                  <p><strong>Fecha Límite:</strong> ${context.dueDate}</p>
                  <p><strong>Notas Adicionales:</strong> ${context.publicNotes}</p>
                </div>
								${context.providerMessage ? `
									<div class="important" style="background-color:#fff0f0; padding:15px; margin:15px 0; border-radius:5px; border-left:4px solid #f43f5e;">
                  <h3>Mensaje para el Proveedor:</h3>
                  <p>${context.providerMessage}</p>
                </div>
                ` : ''}
								<div class="important">
                  <h3>Acción Requerida:</h3>
                  <p>Por favor, suba su factura y documentos de respaldo usando el enlace seguro a continuación:</p>
                  <p>
                    <a href="${context.uploadUrl}" class="button">Subir Documentos</a>
                  </p>
                  <p>Nota: Este enlace es específico para su trabajo y expirará cuando cambie el estado del trabajo.</p>
                </div>
                <p>Gracias por su pronta atención a este asunto.</p>
                <p>Saludos cordiales,<br>El Equipo de InvoicesFlow</p>
              </div>
              <div class="footer">
                <p>Este es un mensaje automático de InvoicesFlow. Por favor no responda a este correo.</p>
              </div>
            </div>
          </body>
        </html>
      `
    }
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

		console.log('fetching job');

    // Fetch job details including related entities and provider's language
    // Now fetching campaign and then the client through the campaign
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        campaigns:campaign_id (
          name,
          client_id,
          clients:client_id (
            name
          )
        ),
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

    // Extract client info from the campaigns.clients relationship
    const clientName = job.campaigns?.clients?.name || "Unknown Client";
    const clientId = job.campaigns?.client_id || null;

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
    let emailsSent: Array<{ recipient: string, role: string }> = [];

    // Notify the manager about important status changes
    if (job.managers && job.managers.email && new_status === "pending_validation") {
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
                  <p><strong>Client:</strong> ${clientName}</p>
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
        subject: `Job Status Updated: ${new_status} - ${clientName}/${job.campaigns.name}`,
        html: managerEmailHtml,
      });

      emailsSent.push({ recipient: job.managers.email, role: "manager" });
    }

    // Determine provider's language, fallback to Portuguese
    const providerLanguage = job.providers.language || 'pt';
    
    // If status is "Pending Invoice", notify the provider with upload link
    if (new_status === "pending_invoice" && job.providers && job.providers.email) {
			console.log('Sending pending_invoice email to provider');
      // Get the public_token (should be generated by the DB trigger)
      const { data: updatedJob, error: tokenError } = await supabase
        .from("jobs")
        .select("public_token, provider_message")
        .eq("id", job_id)
        .single();

			console.log('Token fetch result:', tokenError ? 'Error' : 'Success');

      if (tokenError || !updatedJob.public_token) {
        console.error("Error fetching token:", tokenError);
        return new Response(
          JSON.stringify({ error: "Failed to get public token", details: tokenError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const uploadUrl = `${APP_URL}upload/${job_id}/${updatedJob.public_token}`;
      console.log("uploadURL created:", uploadUrl);

      // Select email template based on provider's language
      const template = emailTemplates[providerLanguage]?.pendingInvoice || emailTemplates['pt'].pendingInvoice;
      console.log('Selected template language:', providerLanguage);

      try {
        const emailContext = {
          providerName: job.providers.name,
          clientName: clientName,
          campaignName: job.campaigns.name,
          jobValue: jobValue,
          dueDate: dueDate,
          publicNotes: job.public_notes || "",
          uploadUrl,
          providerMessage: updatedJob.provider_message || "",
        };
        
        console.log('Sending email to:', job.providers.email);
        
        const sent = await smtp.send({
          from: EMAIL_FROM,
          to: job.providers.email,
          subject: template.subject(job),
          html: template.html(emailContext),
        });

        console.log('Email sent successfully:', sent);
        emailsSent.push({ recipient: job.providers.email, role: "provider" });
      } catch (error) {
        console.error('Failed to send provider email:', error);
        return new Response(
          JSON.stringify({ error: "Failed to send provider email", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
                  <p><strong>Client:</strong> ${clientName}</p>
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
        subject: `Job Status Updated: ${new_status} - ${clientName}/${job.campaigns.name}`,
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



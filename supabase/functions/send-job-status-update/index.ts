
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

    // Fetch job details including related entities
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        clients:client_id (name),
        campaigns:campaign_id (name),
        providers:provider_id (name, email),
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
      
      const providerEmailHtml = `
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
                <p>Hello ${job.providers.name},</p>
                <p>We are requesting an invoice for your work on the following project:</p>
                <div class="details">
                  <h3>Job Details:</h3>
                  <p><strong>Client:</strong> ${job.clients.name}</p>
                  <p><strong>Campaign:</strong> ${job.campaigns.name}</p>
                  <p><strong>Value:</strong> ${jobValue}</p>
                  <p><strong>Due Date:</strong> ${dueDate}</p>
                </div>
                <div class="important">
                  <h3>Action Required:</h3>
                  <p>Please upload your invoice and any supporting documents using the secure link below:</p>
                  <p>
                    <a href="${uploadUrl}" class="button">Upload Documents</a>
                  </p>
                  <p>Note: This link is specific to your job and will expire once the job status changes.</p>
                </div>
                ${job.public_notes ? `<p><strong>Additional Notes:</strong> ${job.public_notes}</p>` : ''}
                <p>Thank you for your prompt attention to this matter.</p>
                <p>Best regards,<br>The InvoicesFlow Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message from InvoicesFlow. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await smtp.send({
        from: EMAIL_FROM,
        to: job.providers.email,
        subject: `Invoice Request: ${job.clients.name}/${job.campaigns.name}`,
        html: providerEmailHtml,
      });

      emailsSent.push({ recipient: job.providers.email, role: "provider" });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Status update notifications sent", 
        notifications: emailsSent 
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

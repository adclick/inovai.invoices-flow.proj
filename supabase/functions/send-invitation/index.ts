
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3";
import { randomBytes } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, role, created_by } = await req.json();

    // Generate a secure, unique token
    const token = Array.from(randomBytes(32), (byte) => byte.toString(16).padStart(2, '0')).join('');
    
    // Insert invitation record
    const { data: invitationData, error: invitationError } = await supabase
      .from('invitations')
      .insert({
        email,
        role,
        token,
        created_by
      })
      .select()
      .single();

    if (invitationError) throw invitationError;

    // Construct invitation link
    const invitationLink = `${Deno.env.get('SITE_URL') || ''}/accept-invitation?token=${token}`;

    // Send invitation email
    const { error: emailError } = await resend.emails.send({
      from: "InvoicesFlow <onboarding@resend.dev>",
      to: [email],
      subject: "You've been invited to InvoicesFlow",
      html: `
        <h1>Invitation to InvoicesFlow</h1>
        <p>You have been invited to join InvoicesFlow with the role of ${role}.</p>
        <p>Click the link below to accept your invitation:</p>
        <a href="${invitationLink}">Accept Invitation</a>
        <p>This link will expire in 7 days.</p>
      `
    });

    if (emailError) throw emailError;

    return new Response(
      JSON.stringify({ success: true, invitation: invitationData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Invitation creation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

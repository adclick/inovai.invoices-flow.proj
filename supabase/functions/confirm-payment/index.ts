
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Parse the request body
    const { jobId, token } = await req.json();

    if (!jobId || !token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing job ID or token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the token and job status
    const { data: job, error: validationError } = await supabase
      .from('jobs')
      .select('id, status, payment_token')
      .eq('id', jobId)
      .eq('payment_token', token)
      .eq('status', 'pending_payment')
      .single();

    if (validationError || !job) {
      console.error('Invalid token or job status:', validationError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token or job not in pending payment status' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update job status to paid
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ 
        status: 'paid',
        paid: true,
        payment_token: null // Clear the payment token for security
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job status:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update job status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notification about status update
    try {
      const { error: notificationError } = await supabase.functions.invoke('send-job-status-update', {
        body: { 
          job_id: jobId,
          new_status: "paid" 
        }
      });
      
      if (notificationError) {
        console.error("Error sending notification:", notificationError);
      }
    } catch (notifyError) {
      console.error("Error invoking notification function:", notifyError);
      // We don't want to fail the whole request if just the notification fails
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Payment confirmed successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

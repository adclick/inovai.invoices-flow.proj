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
    const { jobId, token } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (!jobId || !token) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Missing job ID or token' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Add a check for expired due_date
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        id, status, public_token, due_date, 
        campaigns (id, name),
        providers (id, name),
        clients (id, name)
      `)
      .eq('id', jobId)
      .eq('public_token', token)
      .eq('status', 'pending_invoice')
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid job token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if due date has passed
    if (job.due_date && new Date(job.due_date) < new Date()) {
      // Automatically update the job status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: 'pending_validation',
          public_token: null 
        })
        .eq('id', jobId);
        
      if (updateError) {
        console.error("Error updating expired job:", updateError);
      } else {
        console.log(`Job ${jobId} marked as expired and token invalidated`);
      }

      return new Response(
        JSON.stringify({ valid: false, expired: true }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, job }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating token:', error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

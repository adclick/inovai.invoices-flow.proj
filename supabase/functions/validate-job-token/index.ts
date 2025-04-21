
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

    // Query the job with the given ID and token
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        id, 
        campaign_id, 
        provider_id, 
        manager_id, 
        value, 
        currency, 
        status, 
        paid, 
        manager_ok, 
        months, 
        due_date, 
        public_notes, 
        private_notes, 
        documents,
        public_token,
        campaigns (name),
        providers (name)
      `)
      .eq('id', jobId)
      .eq('public_token', token)
      .eq('status', 'pending_invoice')
      .single();

    if (error || !job) {
      console.error('Error fetching job or job not found:', error);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid or expired token' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return the job data if the token is valid
    return new Response(
      JSON.stringify({ 
        valid: true, 
        job 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

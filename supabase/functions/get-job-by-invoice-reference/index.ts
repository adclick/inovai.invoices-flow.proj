
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Constants
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
		const { invoiceReference } = await req.json();

		if (!invoiceReference) {
			return new Response(
				JSON.stringify({ error: 'Invoice Reference is required' }),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}
    // Create a Supabase client with the service role key
	const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch jobs with invoice reference including campaign relationships
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        provider:providers(*),
        manager:managers(*),
        job_type:job_types(*),
        job_campaigns(
          campaign_id,
          campaigns(*)
        )
      `)
      .eq('invoice_reference', invoiceReference)

    if (error) {
      throw error
    }

    // Transform jobs to include campaign information
    const transformedJobs = jobs.map(job => {
      const jobCampaigns = job.job_campaigns || [];
      const campaigns = jobCampaigns.map(jc => jc.campaigns).filter(Boolean);
      
      return {
        ...job,
        campaign: campaigns[0] || null, // Keep backward compatibility
        campaigns: campaigns, // New field with all campaigns
      };
    });

    return new Response(
      JSON.stringify({ jobs: transformedJobs }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 

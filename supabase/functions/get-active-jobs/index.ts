import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') || 'https://lovable.dev',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check for API key first (for third-party access)
    const apiKey = req.headers.get('x-api-key')
    let userId: string | null = null

		// Validate API key against environment variable
		const validApiKey = Deno.env.get('API_KEY')
		if (apiKey !== validApiKey) {
			return new Response(
				JSON.stringify({ error: 'Invalid API key' }),
				{ 
					status: 401, 
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			)
		}
		// For API key access, use a system user ID or get from query params
		userId = req.url ? new URL(req.url).searchParams.get('user_id') : null
		if (!userId) {
			return new Response(
				JSON.stringify({ error: 'user_id parameter required for API key access' }),
				{ 
					status: 400, 
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			)
		}

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Log security event
    await supabaseClient.rpc('log_security_event', {
      p_action: 'get_active_jobs_accessed',
      p_resource_type: 'edge_function',
      p_resource_id: 'get-active-jobs',
      p_details: { user_id: userId }
    })

    // Fetch active jobs with proper RLS
    const { data: jobs, error } = await supabaseClient
      .from('jobs')
      .select(`
        id,
        status,
        value,
        due_date,
        created_at,
				company:company_id(name),
        campaign:campaign_id(name, client:client_id(name)),
        provider:provider_id(*),
        manager:manager_id(*),
				job_line_items:job_line_items(
					id,
					campaign:campaign_id(name, client:client_id(name)),
					job_type:job_type_id(name),
					year,
					month,
					value
				)
      `)
      .in('status', ['active'])
      .order('due_date', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Error fetching jobs:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch jobs' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ jobs }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

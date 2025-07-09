
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

    // Get invoice reference from URL params
    const url = new URL(req.url)
    const invoiceReference = url.searchParams.get('reference')
    
    if (!invoiceReference) {
      return new Response(
        JSON.stringify({ error: 'Invoice reference is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log security event
    await supabaseClient.rpc('log_security_event', {
      p_action: 'job_lookup_by_invoice',
      p_resource_type: 'edge_function',
      p_resource_id: 'get-job-by-invoice-reference',
      p_details: { user_id: userId, invoice_reference: invoiceReference }
    })

    // Fetch job by invoice reference with proper RLS
    const { data: job, error } = await supabaseClient
      .from('jobs')
      .select(`
        id,
        status,
        value,
        invoice_reference,
				payment_date,
        created_at,
        campaign:campaign_id(name, client:client_id(name)),
        provider:provider_id(name, email),
        manager:manager_id(name, email)
      `)
      .eq('invoice_reference', invoiceReference)
      .maybeSingle()

    if (error) {
      console.error('Error fetching job:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch job' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ job }),
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

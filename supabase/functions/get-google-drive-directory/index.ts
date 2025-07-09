import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') || 'https://lovable.dev',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // Create a Supabase client with the service role key
		const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

		// Log security event
    await supabase.rpc('log_security_event', {
      p_action: 'get_google_drive_directory_accessed',
      p_resource_type: 'edge_function',
      p_resource_id: 'get-google-drive-directory',
      p_details: { user_id: userId }
    })

    // Fetch pending invoice jobs
    const { data: directory, error } = await supabase
      .from('settings')
      .select(`*`)
      .eq('name', 'invoices_drive_directory_id')
			.single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ directory: directory.value }),
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
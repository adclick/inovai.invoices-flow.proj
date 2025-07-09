
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') || 'https://lovable.dev',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
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
      p_action: 'invoice_received',
      p_resource_type: 'edge_function',
      p_resource_id: 'invoice-received',
      p_details: { user_id: userId }
    })

    // Check if user has admin privileges
    const { data: hasAdminRole } = await supabaseClient.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    })

    const { data: hasSuperAdminRole } = await supabaseClient.rpc('has_role', {
      _user_id: userId,
      _role: 'super_admin'
    })

    if (!hasAdminRole && !hasSuperAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { invoiceUrl, invoiceReference } = await req.json()

    // Validate input
    if (!invoiceReference || !invoiceUrl) {
      return new Response(
        JSON.stringify({ error: 'Invoice reference and invoice URL are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log security event
    await supabaseClient.rpc('log_security_event', {
      p_action: 'invoice_received',
      p_resource_type: 'job',
      p_resource_id: invoiceReference,
      p_details: { 
        user_id: userId, 
        invoice_url: invoiceUrl,
        invoice_reference: invoiceReference
      }
    })

    // Update job status and add document
    const updateData: any = {
      status: 'pending_validation',
      updated_at: new Date().toISOString()
    }

    if (invoiceUrl) {
      updateData.documents = [invoiceUrl]
    }

    const { data: job, error } = await supabaseClient
      .from('jobs')
      .update(updateData)
      .eq('invoice_reference', invoiceReference)
      .select()
      .single()

    if (error) {
      console.error('Error updating job:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update job' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invoice received and job updated'
      }),
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

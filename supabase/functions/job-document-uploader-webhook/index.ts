import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const MAKE_WEBHOOK_URL = Deno.env.get('MAKE_WEBHOOK_JOB_DOCUMENT_UPLOAD_URL');
async function handleDocumentUploadWebhook(req) {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response(null, {
			headers: corsHeaders
		});
	}
	try {
		// Validate that a webhook URL is configured
		if (!MAKE_WEBHOOK_URL) {
			return new Response(JSON.stringify({
				error: 'Webhook URL not configured'
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});
		}
		// Parse the request body
		const payload = await req.json();
		// Required fields validation
		const requiredFields = [
			'job_id',
			'file_url',
			'file_name',
			'timestamp'
		];
		for (const field of requiredFields) {
			if (!payload[field]) {
				return new Response(JSON.stringify({
					error: `Missing required field: ${field}`
				}), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}
		}
		// Forward payload to Make.com webhook
		const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				job_id: payload.job_id,
				file_url: payload.file_url,
				file_name: payload.file_name,
				timestamp: payload.timestamp
			})
		});
		// Check Make webhook response
		if (!makeResponse.ok) {
			const errorText = await makeResponse.text();
			console.error('Webhook forwarding failed:', errorText);
			return new Response(JSON.stringify({
				error: 'Failed to forward webhook',
				details: errorText
			}), {
				status: makeResponse.status,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});
		}
		const makeResponseTextData = await makeResponse.text();
		return new Response(JSON.stringify({
			success: true,
			message: 'Webhook processed successfully',
			data: makeResponseTextData
		}), {
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders
			}
		});
	} catch (error) {
		console.error('Webhook processing error:', error);
		return new Response(JSON.stringify({
			error: 'Internal server error',
			details: error.message
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders
			}
		});
	}
}
serve(handleDocumentUploadWebhook);

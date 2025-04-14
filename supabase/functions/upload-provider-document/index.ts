
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
    const webhookUrl = Deno.env.get('MAKE_WEBHOOK_JOB_DOCUMENT_UPLOAD_URL') || '';

    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Parse the form data
    const formData = await req.formData();
    const jobId = formData.get('jobId')?.toString();
    const token = formData.get('token')?.toString();
    const file = formData.get('file');

    if (!jobId || !token || !file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate the job and token
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, public_token')
      .eq('id', jobId)
      .eq('public_token', token)
      .eq('status', 'pending_invoice')
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid job token or job not pending documents'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${jobId}/${crypto.randomUUID()}.${fileExt}`;
    const filePath = fileName;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('job-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('job-documents')
      .getPublicUrl(filePath);

    // Call the webhook if URL is provided
    let webhookFileUrl = publicUrl;
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "job_id": jobId,
            "file_url": publicUrl,
            "file_name": fileName,
            "timestamp": Date.now()
          }),
        });

        if (webhookResponse.ok) {
          const webhookResponseText = await webhookResponse.text();
          webhookFileUrl = webhookResponseText || publicUrl;
        } else {
          console.error("Webhook error:", await webhookResponse.text());
        }
      } catch (webhookError) {
        console.error("Webhook execution error:", webhookError);
      }
    }

    // Update job documents in database
    const { data: jobData } = await supabase
      .from('jobs')
      .select('documents')
      .eq('id', jobId)
      .single();

    const existingDocuments = jobData?.documents || [];
    const allDocuments = [...existingDocuments, webhookFileUrl];

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ 
        documents: allDocuments, 
        status: "pending_payment",
        public_token: null // Clear the public token for security
      })
      .eq('id', jobId);

    if (updateError) {
      throw updateError;
    }

    try {
      const response = await supabase.functions.invoke('send-job-status-update', {
        body: { 
          job_id: jobId,
          new_status: "pending_payment" 
        }
      });
      
      if (response.error) {
        console.error("Error sending notification:", response.error);
      }
    } catch (error) {
      console.error("Error invoking edge function:", error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        fileUrl: webhookFileUrl
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

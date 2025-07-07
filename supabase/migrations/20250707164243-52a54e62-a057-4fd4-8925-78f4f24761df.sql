
-- Phase 1: Critical Database Security Fixes

-- 1. Make storage bucket private and add proper policies
UPDATE storage.buckets 
SET public = false 
WHERE id = 'job-documents';

-- Create RLS policies for job-documents storage bucket
CREATE POLICY "Authenticated users can view job documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'job-documents' 
  AND auth.role() = 'authenticated'
  AND (
    -- Users can access documents for jobs they have access to
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.documents @> ARRAY[storage.objects.name]
    )
    OR 
    -- Admins can access all documents
    is_admin_or_super_admin()
  )
);

CREATE POLICY "Admins can upload job documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'job-documents' 
  AND auth.role() = 'authenticated'
  AND is_admin_or_super_admin()
);

CREATE POLICY "Admins can update job documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'job-documents' 
  AND auth.role() = 'authenticated'
  AND is_admin_or_super_admin()
);

CREATE POLICY "Admins can delete job documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'job-documents' 
  AND auth.role() = 'authenticated'
  AND is_admin_or_super_admin()
);

-- 2. Add server-side validation functions for role checking
CREATE OR REPLACE FUNCTION public.validate_user_role_access(target_user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only super_admins can modify other users' roles
  IF auth.uid() != target_user_id THEN
    RETURN has_role(auth.uid(), 'super_admin');
  END IF;
  
  -- Users can only downgrade their own roles, not upgrade
  IF required_role IN ('admin', 'super_admin') THEN
    RETURN has_role(auth.uid(), 'super_admin');
  END IF;
  
  RETURN true;
END;
$$;

-- 3. Update user_roles table policies to be more restrictive
DROP POLICY IF EXISTS "Super admins can modify all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can read all roles" ON public.user_roles;

CREATE POLICY "Super admins can read all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Validated role modifications only" 
ON public.user_roles 
FOR ALL 
USING (validate_user_role_access(user_id, role))
WITH CHECK (validate_user_role_access(user_id, role));

-- 4. Add audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can read audit logs
CREATE POLICY "Super admins can read audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

-- System can insert audit logs (via edge functions)
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 5. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_resource_type text DEFAULT NULL,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  );
END;
$$;

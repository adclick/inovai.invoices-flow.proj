
-- Enable Row Level Security on the job_line_items table
ALTER TABLE public.job_line_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job_line_items following the same pattern as other tables
-- Note: Since job_line_items are related to jobs, we should follow the same access pattern as jobs
-- Users should be able to access job line items if they have access to the parent job

-- Policy for SELECT: Allow users to view job line items for jobs they have access to
CREATE POLICY "Users can view job line items they have access to" 
  ON public.job_line_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_line_items.job_id
    )
  );

-- Policy for INSERT: Allow users to create job line items for jobs they can modify
CREATE POLICY "Users can create job line items for accessible jobs" 
  ON public.job_line_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_line_items.job_id
    )
  );

-- Policy for UPDATE: Allow users to update job line items for jobs they can modify
CREATE POLICY "Users can update job line items for accessible jobs" 
  ON public.job_line_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_line_items.job_id
    )
  );

-- Policy for DELETE: Allow users to delete job line items for jobs they can modify
CREATE POLICY "Users can delete job line items for accessible jobs" 
  ON public.job_line_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_line_items.job_id
    )
  );

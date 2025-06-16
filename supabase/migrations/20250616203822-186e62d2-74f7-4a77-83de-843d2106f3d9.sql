
-- Add value column to job_campaigns table
ALTER TABLE public.job_campaigns 
ADD COLUMN value NUMERIC;

-- Add comment to document the new column
COMMENT ON COLUMN public.job_campaigns.value IS 'Individual value for each job-campaign association';

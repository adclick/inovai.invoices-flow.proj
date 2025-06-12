
-- Add year and month columns to the jobs table
ALTER TABLE public.jobs 
ADD COLUMN year INTEGER,
ADD COLUMN month SMALLINT CHECK (month >= 1 AND month <= 12);

-- Add comments to document the new columns
COMMENT ON COLUMN public.jobs.year IS 'Year for the job (e.g., 2024)';
COMMENT ON COLUMN public.jobs.month IS 'Month for the job (1-12)';

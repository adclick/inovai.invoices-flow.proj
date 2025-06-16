-- Add payment_date column to the jobs table
ALTER TABLE public.jobs 
ADD COLUMN payment_date DATE;

-- Add comment to document the new column
COMMENT ON COLUMN public.jobs.payment_date IS 'Date when the job was paid'; 

-- Step 1: Create the new job_line_items table with all required columns
CREATE TABLE public.job_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE RESTRICT,
  company_id UUID REFERENCES public.companies(id) ON DELETE RESTRICT,
  job_type_id UUID REFERENCES public.job_types(id) ON DELETE RESTRICT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 2: Migrate existing data from job_campaigns to job_line_items
-- We'll get the year, month, company_id, and job_type_id from the jobs table
INSERT INTO public.job_line_items (job_id, campaign_id, company_id, job_type_id, year, month, value, created_at)
SELECT 
  jc.job_id,
  jc.campaign_id,
  j.company_id,
  j.job_type_id,
  COALESCE(j.year, EXTRACT(YEAR FROM j.created_at)::INTEGER) as year,
  COALESCE(j.month, EXTRACT(MONTH FROM j.created_at)::INTEGER) as month,
  COALESCE(jc.value, j.value) as value,
  jc.created_at
FROM public.job_campaigns jc
JOIN public.jobs j ON jc.job_id = j.id;

-- Step 3: Drop the old job_campaigns table
DROP TABLE public.job_campaigns;

-- Step 4: Add indexes for better performance
CREATE INDEX idx_job_line_items_job_id ON public.job_line_items(job_id);
CREATE INDEX idx_job_line_items_campaign_id ON public.job_line_items(campaign_id);
CREATE INDEX idx_job_line_items_company_id ON public.job_line_items(company_id);
CREATE INDEX idx_job_line_items_year_month ON public.job_line_items(year, month);

-- Step 5: Add comments to document the new table
COMMENT ON TABLE public.job_line_items IS 'Stores individual line items for jobs with complete context including year, month, company, campaign, job type and value';
COMMENT ON COLUMN public.job_line_items.year IS 'Year for this line item';
COMMENT ON COLUMN public.job_line_items.month IS 'Month for this line item (1-12)';
COMMENT ON COLUMN public.job_line_items.company_id IS 'Company associated with this line item';
COMMENT ON COLUMN public.job_line_items.job_type_id IS 'Job type for this line item';
COMMENT ON COLUMN public.job_line_items.value IS 'Value/amount for this specific line item';

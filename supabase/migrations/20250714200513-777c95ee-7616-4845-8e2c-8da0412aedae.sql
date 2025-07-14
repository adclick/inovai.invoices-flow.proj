-- Phase 1: Database Schema Updates (Corrected)

-- 1. Create new line_item_status enum
CREATE TYPE line_item_status AS ENUM (
  'in_progress',
  'waiting_invoice', 
  'waiting_payment',
  'closed'
);

-- 2. Update job_status enum - add 'closed' since 'active' already exists
ALTER TYPE job_status ADD VALUE 'closed';

-- Update existing jobs to use the simplified status values
UPDATE jobs SET status = 'closed' WHERE status = 'paid';
-- 'active' jobs stay as 'active', others become 'active' as well
UPDATE jobs SET status = 'active' WHERE status IN ('draft', 'pending_invoice', 'pending_validation', 'pending_payment');

-- Now recreate the enum with only 'active' and 'closed'
ALTER TYPE job_status RENAME TO job_status_old;
CREATE TYPE job_status AS ENUM ('active', 'closed');
ALTER TABLE jobs ALTER COLUMN status TYPE job_status USING status::text::job_status;
DROP TYPE job_status_old;

-- 3. Modify jobs table
-- Add unique_invoice field
ALTER TABLE jobs ADD COLUMN unique_invoice BOOLEAN NOT NULL DEFAULT false;

-- Ensure company_id is required (it should already be NOT NULL)
UPDATE jobs SET company_id = (SELECT id FROM companies LIMIT 1) WHERE company_id IS NULL;
ALTER TABLE jobs ALTER COLUMN company_id SET NOT NULL;

-- 4. Expand job_line_items table with new fields
ALTER TABLE job_line_items ADD COLUMN manager_id UUID REFERENCES managers(id);
ALTER TABLE job_line_items ADD COLUMN provider_id UUID REFERENCES providers(id);
ALTER TABLE job_line_items ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE job_line_items ADD COLUMN status line_item_status NOT NULL DEFAULT 'in_progress';
ALTER TABLE job_line_items ADD COLUMN documents TEXT[];
ALTER TABLE job_line_items ADD COLUMN private_notes TEXT;
ALTER TABLE job_line_items ADD COLUMN public_notes TEXT;

-- Make value nullable since it's optional in line items
ALTER TABLE job_line_items ALTER COLUMN value DROP NOT NULL;
ALTER TABLE job_line_items ALTER COLUMN value SET DEFAULT NULL;

-- 5. Create function to automatically update job status based on line item statuses
CREATE OR REPLACE FUNCTION update_job_status_from_line_items()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the job status based on line item statuses
  UPDATE jobs 
  SET status = CASE 
    WHEN EXISTS (
      SELECT 1 FROM job_line_items 
      WHERE job_id = COALESCE(NEW.job_id, OLD.job_id) 
      AND status != 'closed'
    ) THEN 'active'
    ELSE 'closed'
  END
  WHERE id = COALESCE(NEW.job_id, OLD.job_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers to update job status when line items change
CREATE TRIGGER trigger_update_job_status_on_insert
  AFTER INSERT ON job_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_job_status_from_line_items();

CREATE TRIGGER trigger_update_job_status_on_update
  AFTER UPDATE ON job_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_job_status_from_line_items();

CREATE TRIGGER trigger_update_job_status_on_delete
  AFTER DELETE ON job_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_job_status_from_line_items();
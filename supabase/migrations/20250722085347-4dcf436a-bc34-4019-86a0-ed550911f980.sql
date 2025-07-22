-- Fix the update_job_status_from_line_items function to properly cast enum values
CREATE OR REPLACE FUNCTION public.update_job_status_from_line_items()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update the job status based on line item statuses
  UPDATE jobs 
  SET status = CASE 
    WHEN EXISTS (
      SELECT 1 FROM job_line_items 
      WHERE job_id = COALESCE(NEW.job_id, OLD.job_id) 
      AND status != 'closed'
    ) THEN 'active'::job_status
    ELSE 'closed'::job_status
  END
  WHERE id = COALESCE(NEW.job_id, OLD.job_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$
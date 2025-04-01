
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use hardcoded values as fallbacks if environment variables are not available
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ahwdtfgtmjtpiomcwncn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod2R0Zmd0bWp0cGlvbWN3bmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTA3NzQsImV4cCI6MjA1OTAyNjc3NH0.sHqNwwXZ9ir3AVsmxTmmGNB0eaTPBwzIqJiCB1qfWtU';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

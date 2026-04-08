import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ujrgwgpzxtcjlrarnopb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcmd3Z3B6eHRjamxyYXJub3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDM5MTYsImV4cCI6MjA5MTE3OTkxNn0.moJ9siTnton80XyM1ReHwrNboRxoCryNq9b-ZHJ8l28'
)

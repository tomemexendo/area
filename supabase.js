import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://pxpojetrshxvtaznkxkj.supabase.co/rest/v1/"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cG9qZXRyc2h4dnRhem5reGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODgxMDYsImV4cCI6MjA5MzE2NDEwNn0.ClFcL_dtAvdBQdrqZUlDi2CnhGEH_wbATrmxjJhpYYs"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

import { createClient } from '@supabase/supabase-js'

// Remove any trailing slash and ensure URL is clean
const supabaseUrl = 'https://umtsrqavjchglazsojns.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdHNycWF2amNoZ2xhenNvam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTQyMDMsImV4cCI6MjA1ODM5MDIwM30.0ZEBaKoIr8dC9a8enFVgj5yAMD18B70_1JzAjMOc49s'

// Create a Supabase client with the appropriate headers
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
  }
}) 
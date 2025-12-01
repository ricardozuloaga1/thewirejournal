import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uhprgdoidwantxbhtbss.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocHJnZG9pZHdhbnR4Ymh0YnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjM2MjMsImV4cCI6MjA3OTg5OTYyM30.Xh33c2RtWJZHIrHFJea-kmeFaOToPCkE08rDU4ytlKY';

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (same as client for now)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => true;

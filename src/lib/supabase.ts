import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: { id: string; full_name: string | null; avatar_url: string | null; timezone: string; role: 'admin' | 'client'; created_at: string; updated_at: string } };
      availability_rules: { Row: { id: string; user_id: string; rrule: string; start_date: string; end_date: string | null; timezone: string; created_at: string } };
      bookings: { Row: { id: string; user_id: string; client_email: string; client_name: string; client_phone: string | null; starts_at: string; ends_at: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; meeting_type: string; meeting_url: string | null; notes: string | null; cancelled_at: string | null; cancellation_reason: string | null; created_at: string; updated_at: string } };
      contacts: { Row: { id: string; name: string; email: string; interest: string | null; message: string; source: string; status: 'new' | 'contacted' | 'qualified' | 'closed'; assigned_to: string | null; created_at: string; updated_at: string } };
      notifications: { Row: { id: string; user_id: string; type: string; payload: Record<string, unknown>; read_at: string | null; email_sent: boolean; push_sent: boolean; created_at: string } };
    };
  };
};

export async function insertContact(data: { name: string; email: string; interest: string | null; message: string }) {
  const { error } = await getSupabase()
    .from('contacts')
    .insert({
      name: data.name,
      email: data.email.toLowerCase(),
      interest: data.interest,
      message: data.message,
      source: 'web',
      status: 'new'
    });

  if (error) throw error;
  return { ...data, email: data.email.toLowerCase(), source: 'web', status: 'new' };
}
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
      payments: { Row: { id: string; user_id: string; wompi_transaction_id: string | null; wompi_reference: string; amount_in_cents: number; currency: string; payment_method: 'NEQUI' | 'DAVIPLATA' | 'CARD' | 'BANCOLOMBIA_TRANSFER' | 'OTHER'; status: 'pending' | 'approved' | 'declined' | 'voided' | 'error' | 'expired'; customer_email: string; customer_name: string; customer_phone: string | null; reference_type: 'booking' | 'contact' | 'service' | 'other' | null; reference_id: string | null; wompi_response: Record<string, unknown> | null; paid_at: string | null; created_at: string; updated_at: string } };
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

export interface CreatePaymentParams {
  user_id: string;
  wompi_reference: string;
  amount_in_cents: number;
  currency?: string;
  payment_method: 'NEQUI' | 'DAVIPLATA' | 'CARD' | 'BANCOLOMBIA_TRANSFER' | 'OTHER';
  customer_email: string;
  customer_name: string;
  customer_phone?: string | null;
  reference_type?: 'booking' | 'contact' | 'service' | 'other' | null;
  reference_id?: string | null;
}

export async function createPendingPayment(params: CreatePaymentParams) {
  const { data, error } = await getSupabase()
    .rpc('create_pending_payment', {
      p_user_id: params.user_id,
      p_wompi_reference: params.wompi_reference,
      p_amount_in_cents: params.amount_in_cents,
      p_currency: params.currency ?? 'COP',
      p_payment_method: params.payment_method,
      p_customer_email: params.customer_email.toLowerCase(),
      p_customer_name: params.customer_name,
      p_customer_phone: params.customer_phone ?? null,
      p_reference_type: params.reference_type ?? null,
      p_reference_id: params.reference_id ?? null
    });

  if (error) throw error;
  return data as string;
}

export interface UpdatePaymentFromWebhookParams {
  wompi_transaction_id: string;
  wompi_reference: string;
  status: 'pending' | 'approved' | 'declined' | 'voided' | 'error' | 'expired';
  payment_method: 'NEQUI' | 'DAVIPLATA' | 'CARD' | 'BANCOLOMBIA_TRANSFER' | 'OTHER';
  paid_at?: string | null;
  wompi_response: Record<string, unknown>;
}

export async function updatePaymentFromWebhook(params: UpdatePaymentFromWebhookParams) {
  const { data, error } = await getSupabase()
    .rpc('update_payment_from_webhook', {
      p_wompi_transaction_id: params.wompi_transaction_id,
      p_wompi_reference: params.wompi_reference,
      p_status: params.status,
      p_payment_method: params.payment_method,
      p_paid_at: params.paid_at ?? null,
      p_wompi_response: params.wompi_response
    });

  if (error) throw error;
  return data as string;
}
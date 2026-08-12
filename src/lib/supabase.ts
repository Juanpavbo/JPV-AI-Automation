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
      page_views: { Row: { id: string; session_id: string; user_id: string | null; path: string; referrer: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null; utm_term: string | null; user_agent: string | null; ip_hash: string | null; country: string | null; city: string | null; device_type: string | null; browser: string | null; os: string | null; duration_seconds: number | null; created_at: string } };
      leads: { Row: { id: string; contact_id: string | null; name: string; email: string; phone: string | null; company: string | null; role: string | null; source: string; status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'; score: number; interest: string | null; interest_detail: string | null; service_interest: string[] | null; assigned_to: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null; utm_term: string | null; referrer: string | null; landing_page: string | null; first_contact_at: string; last_activity_at: string; qualified_at: string | null; proposed_at: string | null; won_at: string | null; lost_at: string | null; lost_reason: string | null; notes: string | null; created_at: string; updated_at: string } };
      deals: { Row: { id: string; lead_id: string; name: string; service_type: 'automatizacion' | 'bi' | 'ia' | 'lowcode' | 'consultoria' | 'personal' | 'validacion-pagos' | 'otro'; amount_in_cents: number; currency: string; stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'; probability: number; expected_close_date: string | null; actual_close_date: string | null; assigned_to: string | null; description: string | null; terms: string | null; created_at: string; updated_at: string } };
      activities: { Row: { id: string; lead_id: string | null; deal_id: string | null; user_id: string | null; type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'proposal_sent' | 'proposal_viewed' | 'contract_sent' | 'contract_signed' | 'payment_received' | 'meeting_scheduled' | 'meeting_completed' | 'other'; subject: string; description: string | null; duration_minutes: number | null; outcome: string | null; next_action: string | null; next_action_date: string | null; meeting_url: string | null; recording_url: string | null; document_url: string | null; created_at: string } };
      pipeline_stages: { Row: { id: string; name: string; label: string; order_index: number; probability: number; color: string; is_active: boolean; is_closed_won: boolean; is_closed_lost: boolean; created_at: string; updated_at: string } };
    };
  };
};

export async function insertContact(data: { name: string; email: string; interest: string | null; message: string }) {
  const { data: inserted, error } = await getSupabase()
    .from('contacts')
    .insert({
      name: data.name,
      email: data.email.toLowerCase(),
      interest: data.interest,
      message: data.message,
      source: 'web',
      status: 'new'
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: inserted.id, ...data, email: data.email.toLowerCase(), source: 'web', status: 'new' };
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

// ============ CRM HELPERS ============

export interface PageViewParams {
  session_id: string;
  path: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  user_agent?: string | null;
  ip_hash?: string | null;
  country?: string | null;
  city?: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
}

export async function insertPageView(params: PageViewParams) {
  const { error } = await getSupabase().from('page_views').insert(params);
  if (error) throw error;
}

export interface LeadParams {
  contact_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  source?: string;
  interest?: string | null;
  interest_detail?: string | null;
  service_interest?: string[] | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  landing_page?: string | null;
  assigned_to?: string | null;
}

export async function createLead(params: LeadParams) {
  const { data, error } = await getSupabase().rpc('create_lead_from_contact', {
    p_contact_id: params.contact_id ?? null,
    p_name: params.name,
    p_email: params.email.toLowerCase(),
    p_phone: params.phone ?? null,
    p_company: params.company ?? null,
    p_role: params.role ?? null,
    p_interest: params.interest ?? null,
    p_interest_detail: null, // interest_detail no viene del formulario directo
    p_service_interest: params.service_interest ?? null,
    p_source: params.source ?? 'web',
    p_utm_source: params.utm_source ?? null,
    p_utm_medium: params.utm_medium ?? null,
    p_utm_campaign: params.utm_campaign ?? null,
    p_utm_content: params.utm_content ?? null,
    p_utm_term: params.utm_term ?? null,
    p_referrer: params.referrer ?? null,
    p_landing_page: params.landing_page ?? null,
    p_assigned_to: params.assigned_to ?? null
  });

  if (error) throw error;
  return data as string;
}

export interface DealParams {
  lead_id: string;
  name: string;
  service_type: 'automatizacion' | 'bi' | 'ia' | 'lowcode' | 'consultoria' | 'personal' | 'validacion-pagos' | 'otro';
  amount_in_cents?: number;
  currency?: string;
  stage?: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability?: number;
  expected_close_date?: string | null;
  assigned_to?: string | null;
  description?: string | null;
  terms?: string | null;
}

export async function createDeal(params: DealParams) {
  const { data, error } = await getSupabase()
    .from('deals')
    .insert({
      lead_id: params.lead_id,
      name: params.name,
      service_type: params.service_type,
      amount_in_cents: params.amount_in_cents ?? 0,
      currency: params.currency ?? 'COP',
      stage: params.stage ?? 'prospecting',
      probability: params.probability ?? 10,
      expected_close_date: params.expected_close_date ?? null,
      assigned_to: params.assigned_to ?? null,
      description: params.description ?? null,
      terms: params.terms ?? null
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export interface ActivityParams {
  lead_id?: string | null;
  deal_id?: string | null;
  user_id?: string | null;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'proposal_sent' | 'proposal_viewed' | 'contract_sent' | 'contract_signed' | 'payment_received' | 'meeting_scheduled' | 'meeting_completed' | 'other';
  subject: string;
  description?: string | null;
  duration_minutes?: number | null;
  outcome?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
  meeting_url?: string | null;
  recording_url?: string | null;
  document_url?: string | null;
}

export async function logActivity(params: ActivityParams) {
  const { data, error } = await getSupabase().rpc('log_activity', {
    p_lead_id: params.lead_id ?? null,
    p_deal_id: params.deal_id ?? null,
    p_user_id: params.user_id ?? null,
    p_type: params.type,
    p_subject: params.subject,
    p_description: params.description ?? null,
    p_duration_minutes: params.duration_minutes ?? null,
    p_outcome: params.outcome ?? null,
    p_next_action: params.next_action ?? null,
    p_next_action_date: params.next_action_date ?? null,
    p_meeting_url: params.meeting_url ?? null,
    p_recording_url: params.recording_url ?? null,
    p_document_url: params.document_url ?? null
  });

  if (error) throw error;
  return data as string;
}

export async function advanceDealStage(dealId: string, newStage: string, userId: string) {
  const { data, error } = await getSupabase().rpc('advance_deal_stage', {
    p_deal_id: dealId,
    p_new_stage: newStage,
    p_user_id: userId
  });

  if (error) throw error;
  return data as boolean;
}

export async function getPipelineStages() {
  const { data, error } = await getSupabase()
    .from('pipeline_stages')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  return data;
}
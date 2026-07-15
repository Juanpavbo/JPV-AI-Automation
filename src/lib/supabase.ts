import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const { data: result, error } = await supabase
    .from('contacts')
    .insert({
      name: data.name,
      email: data.email.toLowerCase(),
      interest: data.interest,
      message: data.message,
      source: 'web',
      status: 'new'
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function sendContactEmail(data: { name: string; email: string; interest: string | null; message: string }) {
  const resendApiKey = import.meta.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'JPV AI <contacto@jpvai.com>',
      to: ['juanchopvb16@gmail.com'],
      subject: `Nuevo contacto: ${data.name} - ${data.interest || 'Sin categoría'}`,
      html: `
        <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e0e0e0; padding: 24px; border-radius: 12px; border: 1px solid rgba(0,212,255,0.1);">
          <h2 style="color: #00d4ff; margin-bottom: 16px;">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Interés:</strong> ${data.interest || 'No especificado'}</p>
          <div style="margin-top: 16px; padding: 16px; background: rgba(0,212,255,0.05); border-radius: 8px; border: 1px solid rgba(0,212,255,0.1);">
            <strong>Mensaje:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap;">${data.message}</p>
          </div>
          <hr style="border-color: rgba(0,212,255,0.1); margin: 24px 0;" />
          <p style="font-size: 12px; color: #606070;">Enviado desde jpv-ai-automation.vercel.app</p>
        </div>
      `
    })
  });
}
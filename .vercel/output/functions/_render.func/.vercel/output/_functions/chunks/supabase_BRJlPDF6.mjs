function getSupabase() {
  {
    throw new Error("Missing Supabase environment variables");
  }
}
async function insertContact(data) {
  const {
    data: inserted,
    error
  } = await getSupabase().from("contacts").insert({
    name: data.name,
    email: data.email.toLowerCase(),
    interest: data.interest,
    message: data.message,
    source: "web",
    status: "new"
  }).select("id").single();
  if (error) throw error;
  return {
    id: inserted.id,
    ...data,
    email: data.email.toLowerCase(),
    source: "web",
    status: "new"
  };
}
async function createPendingPayment(params) {
  const {
    data,
    error
  } = await getSupabase().rpc("create_pending_payment", {
    p_user_id: params.user_id,
    p_wompi_reference: params.wompi_reference,
    p_amount_in_cents: params.amount_in_cents,
    p_currency: params.currency ?? "COP",
    p_payment_method: params.payment_method,
    p_customer_email: params.customer_email.toLowerCase(),
    p_customer_name: params.customer_name,
    p_customer_phone: params.customer_phone ?? null,
    p_reference_type: params.reference_type ?? null,
    p_reference_id: params.reference_id ?? null
  });
  if (error) throw error;
  return data;
}
async function updatePaymentFromWebhook(params) {
  const {
    data,
    error
  } = await getSupabase().rpc("update_payment_from_webhook", {
    p_wompi_transaction_id: params.wompi_transaction_id,
    p_wompi_reference: params.wompi_reference,
    p_status: params.status,
    p_payment_method: params.payment_method,
    p_paid_at: params.paid_at ?? null,
    p_wompi_response: params.wompi_response
  });
  if (error) throw error;
  return data;
}
async function insertPageView(params) {
  const {
    error
  } = await getSupabase().from("page_views").insert(params);
  if (error) throw error;
}
async function createLead(params) {
  const {
    data,
    error
  } = await getSupabase().rpc("create_lead_from_contact", {
    p_contact_id: params.contact_id ?? null,
    p_name: params.name,
    p_email: params.email.toLowerCase(),
    p_phone: params.phone ?? null,
    p_company: params.company ?? null,
    p_role: params.role ?? null,
    p_interest: params.interest ?? null,
    p_interest_detail: null,
    // interest_detail no viene del formulario directo
    p_service_interest: params.service_interest ?? null,
    p_source: params.source ?? "web",
    p_utm_source: params.utm_source ?? null,
    p_utm_medium: params.utm_medium ?? null,
    p_utm_campaign: params.utm_campaign ?? null,
    p_utm_content: params.utm_content ?? null,
    p_utm_term: params.utm_term ?? null,
    p_referrer: params.referrer ?? null,
    p_landing_page: params.landing_page ?? null,
    p_assigned_to: null
  });
  if (error) throw error;
  return data;
}
async function logActivity(params) {
  const {
    data,
    error
  } = await getSupabase().rpc("log_activity", {
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
  return data;
}

export { insertContact as a, createPendingPayment as b, createLead as c, insertPageView as i, logActivity as l, updatePaymentFromWebhook as u };

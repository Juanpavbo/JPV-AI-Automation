-- 003_crm.sql
-- CRM ligero: page views, leads, deals, activities, pipeline

-- Extensiones
create extension if not exists "uuid-ossp";

-- Tabla de visitas / page views (analytics ligero)
create table public.page_views (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  user_id uuid references auth.users on delete set null,
  path text not null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  user_agent text,
  ip_hash text, -- hash SHA256 de IP para privacidad
  country text,
  city text,
  device_type text, -- mobile, desktop, tablet
  browser text,
  os text,
  duration_seconds integer, -- tiempo en página (opcional, enviado via beacon)
  created_at timestamptz default now()
);

create index idx_page_views_session_created on public.page_views (session_id, created_at desc);
create index idx_page_views_path_created on public.page_views (path, created_at desc);
create index idx_page_views_user_created on public.page_views (user_id, created_at desc);

-- Leads (contactos calificados)
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references public.contacts on delete set null,
  -- Datos del lead
  name text not null,
  email citext not null,
  phone text,
  company text,
  role text, -- cargo en la empresa
  -- Calificación
  source text not null default 'web', -- web, referral, linkedin, whatsapp, event, other
  status text not null check (status in ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')) default 'new',
  score integer default 0, -- lead scoring 0-100
  -- Interés
  interest text, -- valor del select del formulario
  interest_detail text, -- mensaje libre
  service_interest text[], -- array de servicios de interés
  -- Asignación
  assigned_to uuid references auth.users,
  -- Metadatos
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_page text,
  -- Fechas clave
  first_contact_at timestamptz default now(),
  last_activity_at timestamptz default now(),
  qualified_at timestamptz,
  proposed_at timestamptz,
  won_at timestamptz,
  lost_at timestamptz,
  lost_reason text,
  -- Notas
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_leads_status on public.leads (status);
create index idx_leads_assigned on public.leads (assigned_to);
create index idx_leads_email on public.leads (email);
create index idx_leads_created on public.leads (created_at desc);

-- Deals / Oportunidades (servicios adjudicados)
create table public.deals (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads on delete cascade,
  -- Detalles del deal
  name text not null, -- ej: "Validación Pagos Nequi - Cliente X"
  service_type text not null check (service_type in ('automatizacion', 'bi', 'ia', 'lowcode', 'consultoria', 'personal', 'validacion-pagos', 'otro')),
  -- Valor
  amount_in_cents integer not null default 0,
  currency text not null default 'COP',
  -- Pipeline
  stage text not null check (stage in ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')) default 'prospecting',
  probability integer default 10, -- 0-100
  -- Fechas
  expected_close_date date,
  actual_close_date date,
  -- Asignación
  assigned_to uuid references auth.users,
  -- Detalles
  description text,
  terms text,
  -- Fechas clave
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_deals_stage on public.deals (stage);
create index idx_deals_assigned on public.deals (assigned_to);
create index idx_deals_lead on public.deals (lead_id);

-- Actividades / Interacciones (timeline del lead/deal)
create table public.activities (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads on delete cascade,
  deal_id uuid references public.deals on delete cascade,
  user_id uuid references auth.users,
  type text not null check (type in ('call', 'email', 'meeting', 'note', 'task', 'proposal_sent', 'proposal_viewed', 'contract_sent', 'contract_signed', 'payment_received', 'meeting_scheduled', 'meeting_completed', 'other')),
  subject text not null,
  description text,
  -- Metadatos
  duration_minutes integer,
  outcome text, -- positive, negative, neutral
  next_action text,
  next_action_date timestamptz,
  -- Referencias externas
  meeting_url text,
  recording_url text,
  document_url text,
  created_at timestamptz default now()
);

create index idx_activities_lead on public.activities (lead_id, created_at desc);
create index idx_activities_deal on public.activities (deal_id, created_at desc);
create index idx_activities_user on public.activities (user_id, created_at desc);

-- Pipeline stages configurables (para personalizar el funnel)
create table public.pipeline_stages (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  label text not null,
  order_index integer not null default 0,
  probability integer not null default 0, -- probabilidad automática al entrar a esta etapa
  color text default '#00d4ff',
  is_active boolean default true,
  is_closed_won boolean default false,
  is_closed_lost boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stages por defecto (pipeline estándar consultoría)
insert into public.pipeline_stages (name, label, order_index, probability, color, is_closed_won, is_closed_lost) values
  ('prospecting', 'Prospección', 1, 10, '#6b7280', false, false),
  ('qualification', 'Calificación', 2, 25, '#3b82f6', false, false),
  ('proposal', 'Propuesta enviada', 3, 50, '#8b5cf6', false, false),
  ('negotiation', 'Negociación', 4, 75, '#f59e0b', false, false),
  ('closed_won', 'Ganado', 5, 100, '#10b981', true, false),
  ('closed_lost', 'Perdido', 6, 0, '#ef4444', false, true)
on conflict (name) do nothing;

-- RLS Policies
alter table public.page_views enable row level security;
alter table public.leads enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.pipeline_stages enable row level security;

-- page_views: solo admins ven todo; usuario ve sus propias vistas (si logueado)
create policy "admin_page_views" on public.page_views
  for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "own_page_views" on public.page_views
  for select using (auth.uid() = user_id);

-- leads: admin CRUD; assigned user CRUD; lead puede ver su propio (via email en JWT)
create policy "admin_leads" on public.leads
  for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "assigned_leads" on public.leads
  for all using (auth.uid() = assigned_to);

create policy "own_lead_by_email" on public.leads
  for select using (
    auth.uid() is null
    and email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- deals: admin CRUD; assigned user CRUD
create policy "admin_deals" on public.deals
  for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "assigned_deals" on public.deals
  for all using (auth.uid() = assigned_to);

-- activities: admin CRUD; assigned user CRUD; lead owner ve actividades de su lead
create policy "admin_activities" on public.activities
  for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "assigned_activities" on public.activities
  for all using (auth.uid() = user_id);

create policy "lead_activities" on public.activities
  for select using (
    exists (select 1 from public.leads where id = lead_id and (assigned_to = auth.uid() or (auth.uid() is null and email = current_setting('request.jwt.claims', true)::json->>'email')))
  );

-- pipeline_stages: solo admin CRUD; todos leen
create policy "admin_pipeline_stages" on public.pipeline_stages
  for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "read_pipeline_stages" on public.pipeline_stages
  for select to authenticated, anon using (is_active = true);

-- Trigger updated_at
create trigger trg_leads_updated after update on public.leads
  for each row execute function public.handle_updated_at();
create trigger trg_deals_updated after update on public.deals
  for each row execute function public.handle_updated_at();
create trigger trg_activities_updated after update on public.activities
  for each row execute function public.handle_updated_at();
create trigger trg_pipeline_stages_updated after update on public.pipeline_stages
  for each row execute function public.handle_updated_at();

-- Función helper: crear lead desde contacto web
create or replace function public.create_lead_from_contact(
  p_contact_id uuid,
  p_name text,
  p_email citext,
  p_phone text,
  p_company text,
  p_role text,
  p_interest text,
  p_interest_detail text,
  p_service_interest text[],
  p_source text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_utm_content text,
  p_utm_term text,
  p_referrer text,
  p_landing_page text,
  p_assigned_to uuid
) returns uuid language plpgsql security definer as $$
declare
  v_lead_id uuid;
  v_score integer := 10; -- base score
begin
  -- Scoring simple basado en campos completados
  if p_company is not null and p_company != '' then v_score := v_score + 15; end if;
  if p_role is not null and p_role != '' then v_score := v_score + 10; end if;
  if p_phone is not null and p_phone != '' then v_score := v_score + 10; end if;
  if p_service_interest is not null and array_length(p_service_interest, 1) > 1 then v_score := v_score + 20; end if;
  if p_utm_source is not null then v_score := v_score + 5; end if;

  insert into public.leads (
    contact_id, name, email, phone, company, role,
    source, status, score,
    interest, interest_detail, service_interest,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer, landing_page,
    assigned_to
  ) values (
    p_contact_id, p_name, p_email, p_phone, p_company, p_role,
    p_source, 'new', v_score,
    p_interest, p_interest_detail, p_service_interest,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term,
    p_referrer, p_landing_page,
    p_assigned_to
  ) returning id into v_lead_id;

  return v_lead_id;
end $$;

-- Función helper: registrar actividad
create or replace function public.log_activity(
  p_lead_id uuid,
  p_deal_id uuid,
  p_user_id uuid,
  p_type text,
  p_subject text,
  p_description text,
  p_duration_minutes integer,
  p_outcome text,
  p_next_action text,
  p_next_action_date timestamptz,
  p_meeting_url text,
  p_recording_url text,
  p_document_url text
) returns uuid language plpgsql security definer as $$
declare
  v_activity_id uuid;
begin
  insert into public.activities (
    lead_id, deal_id, user_id, type, subject, description,
    duration_minutes, outcome, next_action, next_action_date,
    meeting_url, recording_url, document_url
  ) values (
    p_lead_id, p_deal_id, p_user_id, p_type, p_subject, p_description,
    p_duration_minutes, p_outcome, p_next_action, p_next_action_date,
    p_meeting_url, p_recording_url, p_document_url
  ) returning id into v_activity_id;

  -- Actualizar last_activity_at del lead
  if p_lead_id is not null then
    update public.leads set last_activity_at = now() where id = p_lead_id;
  end if;

  return v_activity_id;
end $$;

-- Función: avanzar deal a siguiente etapa
create or replace function public.advance_deal_stage(p_deal_id uuid, p_new_stage text, p_user_id uuid)
returns boolean language plpgsql security definer as $$
declare
  v_probability integer;
  v_is_won boolean;
  v_is_lost boolean;
begin
  select probability, is_closed_won, is_closed_lost
  into v_probability, v_is_won, v_is_lost
  from public.pipeline_stages where name = p_new_stage;

  if not found then
    raise exception 'Stage % not found', p_new_stage;
  end if;

  update public.deals
  set
    stage = p_new_stage,
    probability = v_probability,
    actual_close_date = case when v_is_won or v_is_lost then current_date else null end,
    updated_at = now()
  where id = p_deal_id;

  -- Log activity
  perform public.log_activity(
    null, p_deal_id, p_user_id, 'note',
    'Cambio de etapa a ' || p_new_stage,
    'Deal movido a etapa: ' || p_new_stage,
    null, 'neutral', null, null, null, null, null
  );

  return true;
end $$;
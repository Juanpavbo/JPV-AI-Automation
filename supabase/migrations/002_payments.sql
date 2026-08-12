-- 002_payments.sql
-- Tabla de pagos (Wompi / Nequi / Daviplata)

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  -- Identificadores Wompi
  wompi_transaction_id text unique,
  wompi_reference text not null,
  -- Datos del pago
  amount_in_cents integer not null,
  currency text not null default 'COP',
  payment_method text not null check (payment_method in ('NEQUI', 'DAVIPLATA', 'CARD', 'BANCOLOMBIA_TRANSFER', 'OTHER')),
  status text not null check (status in ('pending', 'approved', 'declined', 'voided', 'error', 'expired')) default 'pending',
  -- Metadatos del cliente
  customer_email citext not null,
  customer_name text not null,
  customer_phone text,
  -- Contexto de negocio (opcional: vincular a booking, contacto, etc.)
  reference_type text check (reference_type in ('booking', 'contact', 'service', 'other')),
  reference_id uuid,
  -- Respuesta cruda de Wompi para auditoría
  wompi_response jsonb,
  -- Timestamps
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices
create index idx_payments_user_created on public.payments (user_id, created_at desc);
create index idx_payments_reference on public.payments (wompi_reference);
create index idx_payments_status on public.payments (status);
create index idx_payments_customer_email on public.payments (customer_email);

-- RLS
alter table public.payments enable row level security;

-- Dueño ve todos sus pagos
create policy "owner_all_payments" on public.payments
  for all using (auth.uid() = user_id);

-- Cliente ve solo sus pagos (por email en JWT)
create policy "client_own_payments" on public.payments
  for select using (
    auth.uid() is null
    and customer_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Trigger updated_at
create trigger trg_payments_updated after update on public.payments
  for each row execute function public.handle_updated_at();

-- Función helper: crear registro de pago pendiente (llamada desde API create)
create or replace function public.create_pending_payment(
  p_user_id uuid,
  p_wompi_reference text,
  p_amount_in_cents integer,
  p_currency text,
  p_payment_method text,
  p_customer_email citext,
  p_customer_name text,
  p_customer_phone text,
  p_reference_type text,
  p_reference_id uuid
) returns uuid language plpgsql security definer as $$
declare
  v_id uuid;
begin
  insert into public.payments (
    user_id, wompi_reference, amount_in_cents, currency, payment_method,
    customer_email, customer_name, customer_phone,
    reference_type, reference_id, status
  ) values (
    p_user_id, p_wompi_reference, p_amount_in_cents, p_currency, p_payment_method,
    p_customer_email, p_customer_name, p_customer_phone,
    p_reference_type, p_reference_id, 'pending'
  ) returning id into v_id;
  return v_id;
end $$;

-- Función helper: actualizar pago desde webhook (llamada desde API webhook)
create or replace function public.update_payment_from_webhook(
  p_wompi_transaction_id text,
  p_wompi_reference text,
  p_status text,
  p_payment_method text,
  p_paid_at timestamptz,
  p_wompi_response jsonb
) returns uuid language plpgsql security definer as $$
declare
  v_id uuid;
begin
  update public.payments
  set
    wompi_transaction_id = p_wompi_transaction_id,
    status = p_status,
    payment_method = p_payment_method,
    paid_at = case when p_status = 'approved' then p_paid_at else null end,
    wompi_response = p_wompi_response,
    updated_at = now()
  where wompi_reference = p_wompi_reference
  returning id into v_id;
  return v_id;
end $$;
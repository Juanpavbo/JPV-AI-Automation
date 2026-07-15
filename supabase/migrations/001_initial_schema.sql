-- 001_initial_schema.sql
-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";
create extension if not exists "citext";

-- Perfiles de usuario (extiende auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  timezone text default 'America/Bogota',
  role text check (role in ('admin','client')) default 'client',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reglas de disponibilidad (RRULE estilo iCal)
create table public.availability_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  rrule text not null,
  start_date date not null,
  end_date date,
  timezone text not null default 'America/Bogota',
  created_at timestamptz default now()
);

-- Citas agendadas (bookings)
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  client_email citext not null,
  client_name text not null,
  client_phone text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text check (status in ('pending','confirmed','cancelled','completed')) default 'pending',
  meeting_type text not null,
  meeting_url text,
  notes text,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Exclusión para evitar solapes
  exclude using gist (
    user_id with =,
    tsrange(starts_at, ends_at) with &&
  ) where (status in ('pending','confirmed'))
);

-- Contactos / Leads
create table public.contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email citext not null,
  interest text,
  message text not null,
  source text default 'web',
  status text check (status in ('new','contacted','qualified','closed')) default 'new',
  assigned_to uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notificaciones (in-app + email log)
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  type text not null,
  payload jsonb not null,
  read_at timestamptz,
  email_sent boolean default false,
  push_sent boolean default false,
  created_at timestamptz default now()
);

-- Índices útiles
create index idx_bookings_user_starts on public.bookings (user_id, starts_at);
create index idx_contacts_status on public.contacts (status);
create index idx_notifications_user_read on public.notifications (user_id, read_at) where read_at is null;

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.availability_rules enable row level security;
alter table public.bookings enable row level security;
alter table public.contacts enable row level security;
alter table public.notifications enable row level security;

-- profiles: usuario ve/edita su perfil
create policy "own_profile" on public.profiles
  for all using (auth.uid() = id);

-- availability_rules: dueño CRUD
create policy "own_availability" on public.availability_rules
  for all using (auth.uid() = user_id);

-- bookings: dueño ve todas; cliente ve solo las suyas (por email en JWT)
create policy "owner_all_bookings" on public.bookings
  for all using (auth.uid() = user_id);
create policy "client_own_bookings" on public.bookings
  for select using (
    auth.uid() is null
    and client_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- contacts: solo admins
create policy "admin_contacts" on public.contacts
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- notifications: usuario ve las suyas
create policy "own_notifications" on public.notifications
  for all using (auth.uid() = user_id);

-- Trigger updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_profiles_updated at update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger trg_availability_updated at update on public.availability_rules
  for each row execute function public.handle_updated_at();
create trigger trg_bookings_updated at update on public.bookings
  for each row execute function public.handle_updated_at();
create trigger trg_contacts_updated at update on public.contacts
  for each row execute function public.handle_updated_at();

-- Cron: limpieza diaria de notificaciones leídas > 30 días
select cron.schedule('cleanup-notifications', '0 3 * * *', $$
  delete from public.notifications
  where read_at is not null and read_at < now() - interval '30 days';
$$);

-- Cron: recordatorios de citas (1 hora antes)
select cron.schedule('booking-reminders', '*/15 * * * *', $$
  insert into public.notifications (user_id, type, payload)
  select b.user_id, 'booking_reminder', jsonb_build_object(
    'booking_id', b.id,
    'client_name', b.client_name,
    'starts_at', b.starts_at,
    'meeting_type', b.meeting_type,
    'meeting_url', b.meeting_url
  )
  from public.bookings b
  where b.status = 'confirmed'
    and b.starts_at between now() + interval '55 minutes' and now() + interval '65 minutes'
    and not exists (
      select 1 from public.notifications n
      where n.user_id = b.user_id
        and n.type = 'booking_reminder'
        and n.payload->>'booking_id' = b.id::text
    );
$$);
-- 004_rues_local.sql
-- BD RUES local: empresas activas de Bogotá + Cundinamarca (micro, pequeña, no definida)
-- Fuente: ReporteRUES.txt (datos.gov.co / cámaras de comercio)
-- Importar con: pnpm import:rues (ver scripts/import-rues.mjs)

-- Extensión para búsqueda difusa por nombre (trigram)
create extension if not exists pg_trgm;

-- Tabla principal
create table if not exists public.rues_empresas (
  id bigint generated always as identity primary key,
  razon_social text not null,
  numero_identificacion text,
  digito_verificacion text,
  clase_identificacion text,
  tipo_sociedad text,
  organizacion_juridica text,
  estado_matricula text not null default 'ACTIVA',
  camara_comercio text,
  representante_legal text,
  num_identificacion_representante_legal text,
  cod_ciiu_act_econ_pri text,
  cod_ciiu_act_econ_sec text,
  ciiu3 text,
  ciiu4 text,
  ultimo_ano_renovado text,
  fecha_matricula date,
  codigo_tamano_empresa text,
  categoria_matricula text,
  municipio text,
  departamento text,
  direccion text,
  telefono text,
  correo_electronico text,
  cantidad_mujeres_empleadas integer,
  fecha_actualizacion timestamptz
);

-- Índices para búsqueda por NIT, nombre, municipio, cámara y CIIU
create index if not exists idx_rues_numero_id on public.rues_empresas (numero_identificacion);
create index if not exists idx_rues_nit_dv on public.rues_empresas (numero_identificacion, digito_verificacion);
create index if not exists idx_rues_razon_trgm on public.rues_empresas using gin (razon_social gin_trgm_ops);
create index if not exists idx_rues_municipio on public.rues_empresas (municipio);
create index if not exists idx_rues_departamento on public.rues_empresas (departamento);
create index if not exists idx_rues_camara on public.rues_empresas (camara_comercio);
create index if not exists idx_rues_tamano on public.rues_empresas (codigo_tamano_empresa);
create index if not exists idx_rues_ciiu_pri on public.rues_empresas (cod_ciiu_act_econ_pri);
create index if not exists idx_rues_email on public.rues_empresas (correo_electronico);

-- RLS: solo lectura pública (los datos RUES son públicos), escritura solo con service_role
alter table public.rues_empresas enable row level security;

drop policy if exists "rues_empresas_select_public" on public.rues_empresas;
create policy "rues_empresas_select_public" on public.rues_empresas
  for select using (true);

-- Función: búsqueda por NIT (numero_identificacion + digito verificacion)
create or replace function public.search_rues_by_nit(p_nit text)
returns setof public.rues_empresas
language sql stable security invoker as $$
  select * from public.rues_empresas
  where numero_identificacion = regexp_replace(p_nit, '\D', '', 'g')
  order by ultimo_ano_renovado desc
  limit 5;
$$;

-- Función: búsqueda por razón social (similarity / trigram)
create or replace function public.search_rues_by_name(p_name text, p_limit integer default 10)
returns setof public.rues_empresas
language sql stable security invoker as $$
  select * from public.rues_empresas
  where razon_social % p_name
     or razon_social ilike '%' || p_name || '%'
  order by similarity(razon_social, p_name) desc
  limit p_limit;
$$;

-- Función: búsqueda por municipio + filtros (tamaño, cámara, CIIU, departamento)
create or replace function public.search_rues_by_filters(
  p_municipio text default null,
  p_departamento text default null,
  p_camara text default null,
  p_tamano text default null,
  p_ciiu text default null,
  p_limit integer default 25
)
returns setof public.rues_empresas
language sql stable security invoker as $$
  select * from public.rues_empresas
  where (p_municipio is null or municipio ilike '%' || p_municipio || '%')
    and (p_departamento is null or departamento = p_departamento)
    and (p_camara is null or camara_comercio ilike '%' || p_camara || '%')
    and (p_tamano is null or codigo_tamano_empresa = p_tamano)
    and (p_ciiu is null or cod_ciiu_act_econ_pri = p_ciiu or cod_ciiu_act_econ_sec = p_ciiu)
    and estado_matricula = 'ACTIVA'
  order by ultimo_ano_renovado desc
  limit p_limit;
$$;

-- Función: conteos por municipio (para exploración de la campaña)
create or replace function public.rues_counts_by_municipio(p_departamento text default null)
returns table (municipio text, total bigint, con_email bigint)
language sql stable security invoker as $$
  select
    municipio,
    count(*) as total,
    count(*) filter (where correo_electronico is not null and correo_electronico <> '') as con_email
  from public.rues_empresas
  where (p_departamento is null or departamento = p_departamento)
    and municipio is not null
  group by municipio
  order by total desc;
$$;

-- Permisos de ejecución
grant execute on function public.search_rues_by_nit(text) to anon, authenticated;
grant execute on function public.search_rues_by_name(text, integer) to anon, authenticated;
grant execute on function public.search_rues_by_filters(text, text, text, text, text, integer) to anon, authenticated;
grant execute on function public.rues_counts_by_municipio(text) to anon, authenticated;
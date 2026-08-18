import { ciiuCode } from './ciiu';

export interface RuesRecord {
  razon_social?: string;
  numero_identificacion?: string;
  nit?: string;
  digito_verificacion?: string;
  clase_identificacion?: string;
  organizacion_juridica?: string;
  tipo_sociedad?: string;
  estado_matricula?: string;
  camara_comercio?: string;
  representante_legal?: string;
  clase_identificacion_rl?: string;
  num_identificacion_representante_legal?: string;
  cod_ciiu_act_econ_pri?: string;
  cod_ciiu_act_econ_sec?: string;
  ciiu3?: string;
  ciiu4?: string;
  ultimo_ano_renovado?: string;
  fecha_matricula?: string;
  fecha_vigencia?: string;
  fecha_cancelacion?: string;
  fecha_actualizacion?: string;
  [key: string]: unknown;
}

const RUES_ENDPOINT = 'https://www.datos.gov.co/resource/c82u-588k.json';

function esc(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function parseSocrataDate(value: string | undefined): string {
  if (!value) return 'No disponible';
  const digits = value.replace(/[^\d]/g, '');
  if (digits === '99991231') return 'Indefinida';
  if (digits.length >= 8) {
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    if (/^\d{4}$/.test(y) && /^\d{2}$/.test(m) && /^\d{2}$/.test(d)) {
      return `${d}/${m}/${y}`;
    }
  }
  return value;
}

function cleanName(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

// ============ FUENTE LOCAL: tabla rues_empresas en Supabase ============
// Se consulta primero (más rápida, datos locales de Bogotá/Cundinamarca).
// Si las env vars de Supabase no están configuradas o falla, se hace fallback
// a la API pública de datos.gov.co.

interface LocalRuesRow {
  razon_social: string | null;
  numero_identificacion: string | null;
  digito_verificacion: string | null;
  clase_identificacion: string | null;
  tipo_sociedad: string | null;
  organizacion_juridica: string | null;
  estado_matricula: string | null;
  camara_comercio: string | null;
  representante_legal: string | null;
  num_identificacion_representante_legal: string | null;
  cod_ciiu_act_econ_pri: string | null;
  cod_ciiu_act_econ_sec: string | null;
  ciiu3: string | null;
  ciiu4: string | null;
  ultimo_ano_renovado: string | null;
  fecha_matricula: string | null;
  fecha_actualizacion: string | null;
  codigo_tamano_empresa: string | null;
  categoria_matricula: string | null;
  municipio: string | null;
  departamento: string | null;
  direccion: string | null;
  telefono: string | null;
  correo_electronico: string | null;
  cantidad_mujeres_empleadas: number | null;
}

function localRowToRecord(r: LocalRuesRow): RuesRecord {
  return {
    razon_social: r.razon_social ?? undefined,
    numero_identificacion: r.numero_identificacion ?? undefined,
    digito_verificacion: r.digito_verificacion ?? undefined,
    clase_identificacion: r.clase_identificacion ?? undefined,
    tipo_sociedad: r.tipo_sociedad ?? undefined,
    organizacion_juridica: r.organizacion_juridica ?? undefined,
    estado_matricula: r.estado_matricula ?? undefined,
    camara_comercio: r.camara_comercio ?? undefined,
    representante_legal: r.representante_legal ?? undefined,
    num_identificacion_representante_legal: r.num_identificacion_representante_legal ?? undefined,
    cod_ciiu_act_econ_pri: r.cod_ciiu_act_econ_pri ?? undefined,
    cod_ciiu_act_econ_sec: r.cod_ciiu_act_econ_sec ?? undefined,
    ciiu3: r.ciiu3 ?? undefined,
    ciiu4: r.ciiu4 ?? undefined,
    ultimo_ano_renovado: r.ultimo_ano_renovado ?? undefined,
    fecha_matricula: r.fecha_matricula ?? undefined,
    fecha_actualizacion: r.fecha_actualizacion ?? undefined,
    codigo_tamano_empresa: r.codigo_tamano_empresa ?? undefined,
    categoria_matricula: r.categoria_matricula ?? undefined,
    municipio: r.municipio ?? undefined,
    departamento: r.departamento ?? undefined,
    direccion: r.direccion ?? undefined,
    telefono: r.telefono ?? undefined,
    correo_electronico: r.correo_electronico ?? undefined,
    cantidad_mujeres_empleadas: r.cantidad_mujeres_empleadas ?? undefined
  };
}

function hasLocalSource(): boolean {
  return Boolean(import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_ANON_KEY);
}

async function queryLocalByNit(nit: string): Promise<RuesRecord[] | null> {
  if (!hasLocalSource()) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.SUPABASE_URL as string,
      import.meta.env.SUPABASE_ANON_KEY as string
    );
    const { data, error } = await supabase.rpc('search_rues_by_nit', { p_nit: nit });
    if (error) throw error;
    if (!Array.isArray(data) || data.length === 0) return [];
    return (data as LocalRuesRow[]).map(localRowToRecord);
  } catch {
    return null; // fallback a datos.gov.co
  }
}

async function queryLocalByName(name: string, limit = 10): Promise<RuesRecord[] | null> {
  if (!hasLocalSource()) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.SUPABASE_URL as string,
      import.meta.env.SUPABASE_ANON_KEY as string
    );
    const { data, error } = await supabase.rpc('search_rues_by_name', { p_name: name, p_limit: limit });
    if (error) throw error;
    if (!Array.isArray(data) || data.length === 0) return [];
    return (data as LocalRuesRow[]).map(localRowToRecord);
  } catch {
    return null; // fallback a datos.gov.co
  }
}

export async function queryRuesByNit(nit: string): Promise<RuesRecord[]> {
  const cleanNit = nit.replace(/[^0-9]/g, '');
  if (!/^\d{6,10}$/.test(cleanNit)) return [];

  const local = await queryLocalByNit(cleanNit);
  if (local !== null) return local;

  const url =
    `${RUES_ENDPOINT}?` +
    `$where=numero_identificacion%20%3D%20${esc(cleanNit).replace(/"/g, '%22').replace(/\s/g, '%20')}` +
    `&$limit=5`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`datos.gov.co ${res.status}`);
  const data = (await res.json()) as RuesRecord[];
  return data.map((r) => ({
    ...r,
    razon_social: cleanName(r.razon_social ?? ''),
    camara_comercio: cleanName(r.camara_comercio ?? '')
  }));
}

export async function queryRuesByName(name: string, limit = 10): Promise<RuesRecord[]> {
  const clean = cleanName(name);
  if (!clean) return [];

  const local = await queryLocalByName(clean, limit);
  if (local !== null) return local;

  const url =
    `${RUES_ENDPOINT}?` +
    `$q=${encodeURIComponent(clean)}` +
    `&$where=estado_matricula%20like%20%22ACTIVA%22` +
    `&$select=razon_social,numero_identificacion,nit,digito_verificacion,clase_identificacion,organizacion_juridica,tipo_sociedad,estado_matricula,camara_comercio,representante_legal,num_identificacion_representante_legal,cod_ciiu_act_econ_pri,cod_ciiu_act_econ_sec,ciiu3,ciiu4,ultimo_ano_renovado,fecha_matricula,fecha_vigencia` +
    `&$order=ultimo_ano_renovado%20DESC` +
    `&$limit=${limit}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`datos.gov.co ${res.status}`);
  const data = (await res.json()) as RuesRecord[];
  return data.map((r) => ({
    ...r,
    razon_social: cleanName(r.razon_social ?? ''),
    camara_comercio: cleanName(r.camara_comercio ?? '')
  }));
}

export interface RuesFilterParams {
  municipio?: string;
  departamento?: string;
  camara?: string;
  tamano?: string;
  ciiu?: string;
  limit?: number;
}

export async function queryRuesByFilters(params: RuesFilterParams): Promise<RuesRecord[]> {
  if (!hasLocalSource()) return [];
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.SUPABASE_URL as string,
      import.meta.env.SUPABASE_ANON_KEY as string
    );
    const { data, error } = await supabase.rpc('search_rues_by_filters', {
      p_municipio: params.municipio ?? null,
      p_departamento: params.departamento ?? null,
      p_camara: params.camara ?? null,
      p_tamano: params.tamano ?? null,
      p_ciiu: params.ciiu ?? null,
      p_limit: params.limit ?? 25
    });
    if (error) throw error;
    if (!Array.isArray(data)) return [];
    return (data as LocalRuesRow[]).map(localRowToRecord);
  } catch {
    return [];
  }
}

export interface MunicipioCount {
  municipio: string | null;
  total: number;
  con_email: number;
}

export async function queryRuesCountsByMunicipio(departamento?: string): Promise<MunicipioCount[]> {
  if (!hasLocalSource()) return [];
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.SUPABASE_URL as string,
      import.meta.env.SUPABASE_ANON_KEY as string
    );
    const { data, error } = await supabase.rpc('rues_counts_by_municipio', {
      p_departamento: departamento ?? null
    });
    if (error) throw error;
    if (!Array.isArray(data)) return [];
    return data as MunicipioCount[];
  } catch {
    return [];
  }
}

export function formatRuesRecord(r: RuesRecord): string {
  const id = r.nit || r.numero_identificacion || 'No disponible';
  const dv = r.digito_verificacion ? `-${r.digito_verificacion}` : '';
  const actPri = r.cod_ciiu_act_econ_pri ? ciiuCode(r.cod_ciiu_act_econ_pri) : null;
  const actSec = r.cod_ciiu_act_econ_sec ? ciiuCode(r.cod_ciiu_act_econ_sec) : null;
  const actOtras = [r.ciiu3, r.ciiu4].filter((c): c is string => Boolean(c)).map(ciiuCode);
  const lines = [
    `Razón social: ${r.razon_social || 'No disponible'}`,
    `Identificación: ${r.clase_identificacion || ''} ${id}${dv}`,
    `Tipo: ${r.tipo_sociedad || 'No disponible'} / ${r.organizacion_juridica || 'No disponible'}`,
    `Estado: ${r.estado_matricula || 'No disponible'}`,
    `Cámara de comercio: ${r.camara_comercio || 'No disponible'}`,
    `Representante legal: ${r.representante_legal || 'No disponible'}`,
    `Actividad económica principal: ${actPri || 'No disponible'}`,
    ...(actSec ? [`Actividad económica secundaria: ${actSec}`] : []),
    ...(actOtras.length ? [`Otras actividades (CIIU): ${actOtras.join(' | ')}`] : []),
    `Matrícula desde: ${parseSocrataDate(r.fecha_matricula)}`,
    `Vigencia: ${parseSocrataDate(r.fecha_vigencia)}`,
    `Último año renovado: ${r.ultimo_ano_renovado || 'No disponible'}`
  ];
  return lines.join('\n');
}

export function ruesContext(matches: RuesRecord[]): string {
  if (matches.length === 0) {
    return 'No se encontraron registros en el Registro Único Empresarial y Social (RUES) para la empresa consultada.';
  }
  const head = matches.length === 1 ? 'Registro encontrado en RUES:' : `Registros encontrados en RUES (mostrando ${matches.length}):`;
  return `${head}\n${matches.map((m, i) => `${i + 1}. ${formatRuesRecord(m)}`).join('\n\n')}`;
}
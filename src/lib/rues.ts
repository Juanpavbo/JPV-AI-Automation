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

export async function queryRuesByNit(nit: string): Promise<RuesRecord[]> {
  const cleanNit = nit.replace(/[^0-9]/g, '');
  if (!/^\d{6,10}$/.test(cleanNit)) return [];
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
  const url =
    `${RUES_ENDPOINT}?` +
    `$q=${encodeURIComponent(clean)}` +
    `&$where=estado_matricula%20like%20%22ACTIVA%22` +
    `&$select=razon_social,numero_identificacion,nit,digito_verificacion,clase_identificacion,organizacion_juridica,tipo_sociedad,estado_matricula,camara_comercio,representante_legal,num_identificacion_representante_legal,cod_ciiu_act_econ_pri,ultimo_ano_renovado,fecha_matricula,fecha_vigencia` +
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

export function formatRuesRecord(r: RuesRecord): string {
  const id = r.nit || r.numero_identificacion || 'No disponible';
  const dv = r.digito_verificacion ? `-${r.digito_verificacion}` : '';
  const lines = [
    `Razón social: ${r.razon_social || 'No disponible'}`,
    `Identificación: ${r.clase_identificacion || ''} ${id}${dv}`,
    `Tipo: ${r.tipo_sociedad || 'No disponible'} / ${r.organizacion_juridica || 'No disponible'}`,
    `Estado: ${r.estado_matricula || 'No disponible'}`,
    `Cámara de comercio: ${r.camara_comercio || 'No disponible'}`,
    `Representante legal: ${r.representante_legal || 'No disponible'}`,
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
// scripts/import-rues.mjs
// Importa RUES_Bogota_Cundinamarca_MIPYME.csv a la tabla public.rues_empresas en Supabase.
//
// Uso:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-rues.mjs [path.csv]
//   - path por defecto: ../Downloads/RUES_Bogota_Cundinamarca_MIPYME.csv
//   - --reset : vacía la tabla antes de importar (para re-importaciones limpias)
//   - Migración 004_rues_local.sql aplicada
//   - El CSV usa '|' como separador, UTF-8, primera línea = encabezado
//   - 1.26M filas => ~2.5-6 min según red (lotes de 500)

import { createClient } from '@supabase/supabase-js';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESET = process.argv.includes('--reset');
const CSV_PATH = process.argv.find((a) => a.endsWith('.csv')) ?? path.join(__dirname, '..', '..', 'Downloads', 'RUES_Bogota_Cundinamarca_MIPYME.csv');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const BATCH = 500;
const COLS = [
  'razon_social', 'numero_identificacion', 'digito_verificacion', 'clase_identificacion',
  'tipo_sociedad', 'organizacion_juridica', 'estado_matricula', 'camara_comercio',
  'representante_legal', 'num_identificacion_representante_legal', 'cod_ciiu_act_econ_pri',
  'cod_ciiu_act_econ_sec', 'ciiu3', 'ciiu4', 'ultimo_ano_renovado', 'fecha_matricula',
  'codigo_tamano_empresa', 'categoria_matricula', 'municipio', 'departamento',
  'direccion', 'telefono', 'correo_electronico', 'cantidad_mujeres_empleadas', 'fecha_actualizacion'
];

function parseDateYYYYMMDD(v) {
  if (!v || !/^\d{8}$/.test(v)) return null;
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
}

function parseTimestamp(v) {
  if (!v) return null;
  const m = v.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`;
}

function rowToRecord(fields) {
  const r = {};
  COLS.forEach((col, i) => {
    let v = fields[i] ?? '';
    v = v.trim();
    if (col === 'fecha_matricula') v = parseDateYYYYMMDD(v);
    else if (col === 'fecha_actualizacion') v = parseTimestamp(v);
    else if (col === 'cantidad_mujeres_empleadas') v = v === '' ? null : Number(v);
    r[col] = v === '' ? null : v;
  });
  return r;
}

async function resetTable() {
  console.log('[reset] Vacía tabla public.rues_empresas...');
  // DELETE via filtro no nulo (PostgREST no permite truncate)
  let deleted = 0;
  for (;;) {
    const { error } = await supabase
      .from('rues_empresas')
      .delete()
      .neq('id', 0)
      .select('id', { count: 'exact', head: true });
    if (error) {
      console.error('[reset] Error:', error.message);
      process.exit(1);
    }
    // DELETE sin lote: elimina todo lo que matchee; repetimos hasta 0 filas
    const { count } = await supabase.from('rues_empresas').select('*', { count: 'exact', head: true });
    deleted += count;
    if (count === 0) break;
  }
  console.log(`[reset] Eliminadas ${deleted} filas.`);
}

async function main() {
  if (RESET) await resetTable();

  const readline = createInterface({ input: createReadStream(CSV_PATH, 'utf8'), crlfDelay: Infinity });
  const start = Date.now();
  let total = 0;
  let batch = [];
  let failed = 0;

  const flush = async () => {
    if (batch.length === 0) return;
    const rows = batch;
    batch = [];
    const { error } = await supabase
      .from('rues_empresas')
      .insert(rows);
    if (error) {
      failed += rows.length;
      console.error(`  ✗ lote ${total} falló: ${error.message}`);
    }
    total += rows.length;
    if (total % 25000 < BATCH) {
      const mb = Math.round((process.memoryUsage().rss / 1024 / 1024));
      console.log(`  ${total.toLocaleString()} filas (${mb}MB, ${Math.round((Date.now() - start) / 1000)}s)`);
    }
  };

  let isFirst = true;
  for await (const line of readline) {
    if (isFirst) { isFirst = false; continue; } // encabezado
    if (!line.trim()) continue;
    const fields = line.split('|');
    if (fields.length < COLS.length) continue;
    batch.push(rowToRecord(fields));
    if (batch.length >= BATCH) await flush();
  }
  await flush();
  readline.close();

  const secs = Math.round((Date.now() - start) / 1000);
  console.log(`\nImportación completada: ${total.toLocaleString()} filas en ${secs}s. Fallidas: ${failed.toLocaleString()}.`);
  if (failed > 0) process.exit(2);
}

main().catch((err) => { console.error(err); process.exit(1); });

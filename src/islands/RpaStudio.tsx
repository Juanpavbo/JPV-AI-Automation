import { useMemo, useState } from 'preact/hooks';
import {
  FileText,
  ShieldCheck,
  Mail,
  BarChart2,
  Package,
  Check,
  X,
  Clock,
  Coins,
  TrendingUp,
} from 'lucide-preact';

interface RpaProcess {
  id: string;
  category: string;
  name: string;
  desc: string;
  hoursPerMonth: number;
  costEstimate: number;
}

const CATEGORIES = ['Facturación y cobros', 'Conciliación y pagos', 'Correo y atención', 'Reportes y datos', 'Inventario y logística'];

const PROCESSES: RpaProcess[] = [
  { id: 'factura-ocr', category: 'Facturación y cobros', name: 'Facturas entrantes → OCR → Contabilidad', desc: 'Lee facturas PDF/foto, extrae datos y los contabiliza sin digitación.', hoursPerMonth: 18, costEstimate: 1800000 },
  { id: 'factura-dian', category: 'Facturación y cobros', name: 'Emisión factura electrónica DIAN', desc: 'Genera, firma y envía facturas electrónicas con CUNE automáticamente.', hoursPerMonth: 15, costEstimate: 1500000 },
  { id: 'cobranza', category: 'Facturación y cobros', name: 'Recordatorios y cobranza recurrente', desc: 'Envía recordatorios de pago por email/WhatsApp y escala cartera vencida.', hoursPerMonth: 20, costEstimate: 1200000 },
  { id: 'conciliacion', category: 'Conciliación y pagos', name: 'Conciliación bancaria automática', desc: 'Cruza extractos bancarios vs. contabilidad y detecta diferencias al instante.', hoursPerMonth: 25, costEstimate: 2000000 },
  { id: 'validacion-pagos', category: 'Conciliación y pagos', name: 'Validación pagos Nequi/Daviplata', desc: 'Webhook que valida cada pago en tiempo real: monto, referencia y estado.', hoursPerMonth: 30, costEstimate: 2400000 },
  { id: 'extractos', category: 'Conciliación y pagos', name: 'Descarga automática de extractos', desc: 'Descarga y archiva extractos de bancos y billeteras digitales sin intervención.', hoursPerMonth: 10, costEstimate: 800000 },
  { id: 'clasificar-correos', category: 'Correo y atención', name: 'Clasificación automática de correos', desc: 'Ordena inbox por prioridad y enruta cada correo al flujo correcto.', hoursPerMonth: 15, costEstimate: 1000000 },
  { id: 'faq-ia', category: 'Correo y atención', name: 'Respuestas automáticas a consultas frecuentes', desc: 'Un agente IA responde FAQs 24/7 y escala lo complejo a tu equipo.', hoursPerMonth: 20, costEstimate: 1800000 },
  { id: 'reportes', category: 'Reportes y datos', name: 'Reportes mensuales automáticos', desc: 'Genera y envía reportes de ventas, cartera e inventario por email/Teams.', hoursPerMonth: 12, costEstimate: 900000 },
  { id: 'bi', category: 'Reportes y datos', name: 'Dashboard BI que se actualiza solo', desc: 'Tablero en vivo con KPIs de negocio sin tocar Excel.', hoursPerMonth: 15, costEstimate: 2200000 },
  { id: 'inventario', category: 'Inventario y logística', name: 'Sincronización de inventario', desc: 'Conecta POS, ERP y tienda web para que el stock siempre cuadre.', hoursPerMonth: 18, costEstimate: 1600000 },
  { id: 'tracking', category: 'Inventario y logística', name: 'Tracking de guías y notificaciones', desc: 'Sigue envíos y notifica al cliente en cada etapa automáticamente.', hoursPerMonth: 12, costEstimate: 1000000 },
];

const cop = (n: number) => n.toLocaleString('es-CO');

export default function RpaStudio() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['conciliacion', 'factura-ocr']));
  const [hourlyRate, setHourlyRate] = useState(25000);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(PROCESSES.map((p) => p.id)));
  const clearAll = () => setSelected(new Set());

  const totals = useMemo(() => {
    const chosen = PROCESSES.filter((p) => selected.has(p.id));
    const hoursPerMonth = chosen.reduce((acc, p) => acc + p.hoursPerMonth, 0);
    const investment = chosen.reduce((acc, p) => acc + p.costEstimate, 0);
    const hoursPerYear = hoursPerMonth * 12;
    const savingsPerYear = hoursPerYear * hourlyRate;
    const paybackMonths = investment > 0 && savingsPerYear > 0 ? Math.ceil((investment / savingsPerYear) * 12) : 0;
    const roi = investment > 0 ? Math.round(((savingsPerYear - investment) / investment) * 100) : 0;
    return { count: chosen.length, hoursPerMonth, investment, hoursPerYear, savingsPerYear, paybackMonths, roi };
  }, [selected, hourlyRate]);

  return (
    <div class="grid lg:grid-cols-3 gap-8 lg:gap-10">
      {/* Catalog */}
      <div class="lg:col-span-2">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p class="body text-[var(--text-secondary)]">Selecciona los procesos que quieres automatizar:</p>
          <div class="flex gap-2">
            <button type="button" onClick={selectAll} class="btn btn-ghost btn-sm">Seleccionar todo</button>
            <button type="button" onClick={clearAll} class="btn btn-ghost btn-sm">Limpiar</button>
          </div>
        </div>

        <div class="space-y-6">
          {CATEGORIES.map((cat) => {
            const items = PROCESSES.filter((p) => p.category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat}>
                <h3 class="heading-sm text-[var(--text)] mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                  {cat}
                </h3>
                <div class="grid sm:grid-cols-2 gap-3">
                  {items.map((p) => {
                    const isOn = selected.has(p.id);
                    return (
                      <button
                        type="button"
                        onClick={() => toggle(p.id)}
                        aria-pressed={isOn}
                        class={`text-left p-4 rounded-xl border transition-all duration-200 ${
                          isOn
                            ? 'border-[var(--brand)] bg-[var(--brand-bg)] shadow-sm'
                            : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <div class="flex items-start justify-between gap-3">
                          <div>
                            <div class={`font-semibold text-sm ${isOn ? 'text-[var(--brand-dark)]' : 'text-[var(--text)]'}`}>{p.name}</div>
                            <div class="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{p.desc}</div>
                          </div>
                          <span class={`flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center mt-0.5 ${
                            isOn ? 'bg-[var(--brand)] border-[var(--brand)] text-white' : 'border-[var(--border-strong)] text-transparent'
                          }`}>
                            <Check class="w-4 h-4" />
                          </span>
                        </div>
                        <div class="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
                          <span class="flex items-center gap-1"><Clock class="w-3.5 h-3.5" /> {p.hoursPerMonth}h/mes</span>
                          <span class="flex items-center gap-1"><Coins class="w-3.5 h-3.5" /> desde ${cop(p.costEstimate)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Calculator */}
      <aside class="lg:col-span-1">
        <div class="lg:sticky lg:top-24 space-y-4">
          <div class="card card-elevated">
            <h3 class="heading-sm text-[var(--text)] mb-1">Tu cotización estimada</h3>
            <p class="caption text-[var(--text-muted)] mb-5">Estimación preliminar · 100% ajustable en el diagnóstico</p>

            <div class="mb-5">
              <label for="hourly-rate" class="form-label text-sm mb-1 block">Costo hora del equipo (COP)</label>
              <div class="flex items-center gap-3">
                <input
                  id="hourly-rate"
                  type="range"
                  min={8000}
                  max={60000}
                  step={1000}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number((e.target as HTMLInputElement).value))}
                  class="flex-1 accent-[var(--brand)]"
                />
                <span class="text-sm font-semibold text-[var(--text)] whitespace-nowrap">${cop(hourlyRate)}</span>
              </div>
            </div>

            <dl class="space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <dt class="text-[var(--text-secondary)]">Procesos seleccionados</dt>
                <dd class="font-semibold text-[var(--text)]">{totals.count} de {PROCESSES.length}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-[var(--text-secondary)]">Horas ahorradas / mes</dt>
                <dd class="font-semibold text-[var(--text)]">{totals.hoursPerMonth}h</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-[var(--text-secondary)]">Ahorro anual (COP)</dt>
                <dd class="font-semibold text-[var(--brand-dark)]">${cop(totals.savingsPerYear)}</dd>
              </div>
              <div class="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <dt class="text-[var(--text-secondary)]">Inversión estimada</dt>
                <dd class="font-semibold text-[var(--text)]">${cop(totals.investment)}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-[var(--text-secondary)]">Punto de equilibrio</dt>
                <dd class="font-semibold text-[var(--text)]">{totals.paybackMonths} meses</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-[var(--text-secondary)]">ROI primer año</dt>
                <dd class={`font-semibold flex items-center gap-1 ${totals.roi >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  <TrendingUp class="w-4 h-4" /> {totals.roi}%
                </dd>
              </div>
            </dl>

            {totals.count === 0 && (
              <p class="text-xs text-[var(--text-muted)] mt-4 p-3 bg-[var(--bg-muted)] rounded-lg">
                Selecciona al menos un proceso para ver tu estimación.
              </p>
            )}
          </div>

          <a href="#contacto" class="btn btn-primary btn-full btn-lg">
            Recibir cotización formal gratis
          </a>
          <p class="caption text-center text-[var(--text-muted)]">Respuesta en menos de 24h · Sin compromiso</p>
        </div>
      </aside>
    </div>
  );
}
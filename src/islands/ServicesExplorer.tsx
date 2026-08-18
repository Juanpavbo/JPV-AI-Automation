import { useState } from 'preact/hooks';
import { Zap, Smartphone, Bot, BarChart2, Check, X, ArrowRight } from 'lucide-preact';
import { services, type Service } from '../data/services';

const iconMap = {
  zap: Zap,
  smartphone: Smartphone,
  bot: Bot,
  chart: BarChart2
} as const;

const tabs = [
  { id: 'que-es', label: '¿Qué es?' },
  { id: 'para-quien', label: '¿Para quién?' },
  { id: 'incluye', label: '✅ Lo que SÍ incluye' },
  { id: 'casos', label: 'Casos reales' },
  { id: 'herramientas', label: '¿Con qué herramientas lo hacemos?' }
] as const;

type TabId = typeof tabs[number]['id'];

function ServiceIcon({ icon, className }: { icon: Service['icon']; className?: string }) {
  const Icon = iconMap[icon];
  return <Icon className={className} aria-hidden="true" />;
}

export default function ServicesExplorer() {
  const [selectedId, setSelectedId] = useState(services[0].id);
  const [tab, setTab] = useState<TabId>('que-es');

  const service = services.find((s) => s.id === selectedId) ?? services[0];

  return (
    <div class="reveal slide-up">
      {/* Service selector */}
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10" role="tablist" aria-label="Servicios">
        {services.map((s) => {
          const active = s.id === service.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setSelectedId(s.id);
                setTab('que-es');
              }}
              class={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                active
                  ? 'border-transparent shadow-lg -translate-y-1 ring-2 ring-[var(--brand)]'
                  : 'border-[var(--border)] hover:border-[var(--brand-border)] hover:shadow-md'
              } bg-[var(--bg-elevated)]`}
            >
              <span class={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3`}>
                <ServiceIcon icon={s.icon} className="w-5 h-5 text-white" />
              </span>
              <span class={`block font-bold ${active ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}>{s.shortName}</span>
              <span class="block text-sm text-[var(--text-muted)] mt-1 leading-snug">{s.tagline}</span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <article class="card card-elevated p-6 md:p-8">
        <header class="mb-6">
          <div class="flex items-center gap-3 mb-2">
            <span class={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center`}>
              <ServiceIcon icon={service.icon} className="w-5 h-5 text-white" />
            </span>
            <h3 class="heading-md text-[var(--text)]">{service.name}</h3>
          </div>
          <p class="text-[var(--brand-dark)] font-medium">{service.tagline}</p>

          {/* Benefits */}
          <dl class="grid grid-cols-3 gap-3 mt-5">
            {service.benefits.map((b) => (
              <div key={b.label} class="p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] text-center">
                <dt class="text-xs text-[var(--text-muted)] leading-tight">{b.label}</dt>
                <dd class="text-lg font-bold text-[var(--text)] mt-1">{b.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* Inner tabs */}
        <nav class="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Detalle del servicio">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              class={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                tab === t.id
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div class="min-h-[280px]">
          {tab === 'que-es' && (
            <div class="space-y-4">
              <p class="body text-[var(--text-secondary)] leading-relaxed">{service.plainExplanation}</p>
              <div class="p-5 rounded-xl bg-[var(--brand-bg)] border border-[var(--brand-border)]">
                <p class="font-semibold text-[var(--brand-dark)] mb-1">En palabras simples:</p>
                <p class="text-[var(--text)]">{service.analogy}</p>
              </div>
            </div>
          )}

          {tab === 'para-quien' && (
            <ul class="space-y-3">
              {service.forWhom.map((item) => (
                <li key={item} class="flex items-start gap-3">
                  <Check class="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span class="text-[var(--text-secondary)]">{item}</span>
                </li>
              ))}
            </ul>
          )}

          {tab === 'incluye' && (
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h4 class="heading-sm text-[var(--text)] mb-3 flex items-center gap-2">
                  <Check class="w-5 h-5 text-[#10b981]" aria-hidden="true" /> Lo que SÍ incluye
                </h4>
                <ul class="space-y-3">
                  {service.includes.map((item) => (
                    <li key={item} class="flex items-start gap-3">
                      <Check class="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span class="text-sm text-[var(--text-secondary)]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 class="heading-sm text-[var(--text)] mb-3 flex items-center gap-2">
                  <X class="w-5 h-5 text-[var(--accent)]" aria-hidden="true" /> Lo que NO incluye
                </h4>
                <ul class="space-y-3">
                  {service.notIncludes.map((item) => (
                    <li key={item} class="flex items-start gap-3">
                      <X class="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span class="text-sm text-[var(--text-secondary)]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'casos' && (
            <div class="grid md:grid-cols-2 gap-6">
              {service.cases.map((c) => (
                <div key={c.title} class="p-5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
                  <h4 class="font-semibold text-[var(--text)] mb-1">{c.title}</h4>
                  <p class="text-xs text-[var(--text-muted)] mb-4">{c.business}</p>
                  <div class="space-y-3 text-sm">
                    <div>
                      <p class="font-medium text-[var(--text-muted)] mb-1">ANTES</p>
                      <p class="text-[var(--text-secondary)]">{c.before}</p>
                    </div>
                    <div>
                      <p class="font-medium text-[var(--text-muted)] mb-1">DESPUÉS</p>
                      <p class="text-[var(--text-secondary)]">{c.after}</p>
                    </div>
                    <div class="p-3 rounded-lg bg-[var(--success-bg)] border border-[#a7f3d0]">
                      <p class="text-sm font-medium text-[var(--success)]">{c.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'herramientas' && (
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                {service.tools.map((tool) => (
                  <span key={tool} class="px-4 py-2 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] text-sm font-medium text-[var(--text)]">
                    {tool}
                  </span>
                ))}
              </div>
              <p class="body text-[var(--text-secondary)]">{service.toolsNote}</p>
            </div>
          )}
        </div>

        <div class="mt-8 pt-6 border-t border-[var(--border)] flex justify-center">
          <a href="#contacto" class="btn btn-primary">
            Quiero esto en mi negocio
            <ArrowRight class="w-5 h-5" aria-hidden="true" />
          </a>
        </div>
      </article>
    </div>
  );
}
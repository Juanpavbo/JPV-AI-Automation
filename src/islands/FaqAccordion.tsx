import { useState } from 'preact/hooks';
import { ChevronDown } from 'lucide-preact';

const faqs = [
  {
    q: 'Mi empresa es muy pequeña, ¿esto es para mí?',
    a: 'Precisamente para ti. Los negocios como el tuyo son los que más ganan con estas soluciones, porque cada hora ahorrada y cada venta recuperada se siente en el bolsillo. Empezamos pequeño (un solo proceso) y crecemos a tu ritmo y presupuesto.'
  },
  {
    q: '¿Necesito saber de tecnología o contratar un experto?',
    a: 'No. Nosotros nos encargamos de toda la parte técnica: configuración, conexión y puesta en marcha. Te entregamos todo funcionando y capacitamos a tu equipo en sesiones cortas y en lenguaje sencillo. Si sabes usar WhatsApp y Excel, puedes usar nuestras soluciones.'
  },
  {
    q: '¿Tengo que cambiar los programas que ya uso?',
    a: 'En la mayoría de los casos, no. Nuestras soluciones se conectan con lo que ya tienes: tu correo, tus archivos de Excel, tu software de facturación, tu WhatsApp Business. La idea es potenciar lo que ya funciona, no empezar de cero.'
  },
  {
    q: '¿Cuánto tarda un proyecto?',
    a: 'Depende del alcance, pero una automatización o un tablero de reportes suele estar funcionando en 2 a 4 semanas. Una app a la medida toma entre 2 y 6 semanas. Siempre empezamos con un diagnóstico gratuito para darte tiempos concretos.'
  },
  {
    q: '¿Qué pasa si mi proceso cambia después?',
    a: 'Las soluciones se pueden ajustar. Además te dejamos documentación sencilla y acompañamiento para que nunca quedes "botado". Muchos clientes nos llaman solo cuando quieren agregar algo nuevo.'
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Trabajamos sobre plataformas empresariales de Microsoft y otras herramientas líderes, con los mismos estándares de seguridad que usan los bancos. Tus datos son tuyos: tú controlas quién los ve.'
  }
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div class="max-w-3xl mx-auto space-y-4">
      {faqs.map((item, i) => {
        const open = openIndex === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        return (
          <div class={`rounded-2xl border transition-all duration-200 ${open ? 'border-[var(--brand-border)] bg-[var(--brand-bg)]' : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--brand-border)]'}`}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                class="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left"
              >
                <span class="font-semibold text-[var(--text)]">{item.q}</span>
                <ChevronDown
                  class={`w-5 h-5 text-[var(--brand)] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} class={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div class="overflow-hidden">
                <p class="px-5 md:px-6 pb-5 md:pb-6 text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
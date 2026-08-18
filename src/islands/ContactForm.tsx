import { useState } from 'preact/hooks';
import { Send, CheckCircle2, Loader2 } from 'lucide-preact';

const interestOptions = [
  { value: 'automatizacion', label: 'Dejar de hacer tareas repetitivas a mano' },
  { value: 'apps', label: 'Organizar el control del negocio (papel / Excel)' },
  { value: 'agentes', label: 'Responder a mis clientes más rápido' },
  { value: 'analitica', label: 'Saber cómo va mi negocio con datos claros' },
  { value: 'nose', label: 'Aún no lo tengo claro' }
];

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const botField = fd.get('bot-field')?.toString() || '';
    if (botField) {
      setStatus('success');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: fd
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
        setError(json?.error || 'No pudimos enviar tu mensaje. Intenta de nuevo.');
      }
    } catch {
      setStatus('error');
      setError('No pudimos enviar tu mensaje. Intenta de nuevo.');
    }
  }

  if (status === 'success') {
    return (
      <div class="h-full flex flex-col items-center justify-center text-center p-6">
        <CheckCircle2 class="w-16 h-16 text-[var(--success)] mb-4" aria-hidden="true" />
        <h3 class="heading-md text-[var(--text)] mb-2">¡Recibimos tu mensaje!</h3>
        <p class="text-[var(--text-secondary)]">Te contactaremos muy pronto para agendar tu diagnóstico gratuito.</p>
      </div>
    );
  }

  return (
    <form class="space-y-6" onSubmit={onSubmit} novalidate>
      <input type="hidden" name="form-name" value="contacto" />
      <input type="hidden" name="bot-field" value="" style="display:none;" />

      <div class="form-group">
        <label for="nombre" class="form-label">Nombre de tu empresa *</label>
        <input type="text" id="nombre" name="nombre" required minLength={2} placeholder="Ej: Ferretería El Tornillo" class="form-input" autocomplete="organization" />
      </div>

      <div class="form-group">
        <label for="email" class="form-label">¿Dónde te contactamos? *</label>
        <input type="text" id="email" name="email" required minLength={3} placeholder="WhatsApp o correo" class="form-input" autocomplete="off" />
      </div>

      <div class="form-group">
        <label for="interes" class="form-label">¿Qué te gustaría mejorar? *</label>
        <select id="interes" name="interes" class="form-select" required>
          <option value="">Selecciona una opción</option>
          {interestOptions.map((opt) => <option value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div class="form-group">
        <label for="mensaje" class="form-label">Cuéntanos un poco más <span class="text-sm text-[var(--text-muted)] font-normal">(opcional)</span></label>
        <textarea id="mensaje" name="mensaje" rows={4} placeholder="Ej: Pasamos muchas horas registrando pedidos a mano…" class="form-textarea"></textarea>
      </div>

      {status === 'error' && (
        <p class="text-sm text-[var(--accent-dark)] bg-[var(--accent-bg)] border border-[#fecdd3] rounded-lg px-4 py-3" role="alert">{error}</p>
      )}

      <button type="submit" class="btn btn-primary btn-full btn-lg" disabled={status === 'loading'}>
        {status === 'loading' ? <Loader2 class="w-5 h-5 animate-spin" aria-hidden="true" /> : <Send class="w-5 h-5" aria-hidden="true" />}
        {status === 'loading' ? 'Enviando…' : 'Solicitar mi diagnóstico gratuito'}
      </button>

      <p class="form-hint text-center">Tus datos solo se usan para contactarte. Nada de spam.</p>
    </form>
  );
}
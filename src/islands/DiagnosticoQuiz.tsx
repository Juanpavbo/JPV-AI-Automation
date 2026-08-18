import { useState } from 'preact/hooks';
import { Sparkles, RotateCcw, ArrowRight } from 'lucide-preact';
import { quizQuestions, services } from '../data/services';

export default function DiagnosticoQuiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const question = quizQuestions[current];

  function select(serviceId: string) {
    const next = [...answers, serviceId];
    if (current + 1 < quizQuestions.length) {
      setAnswers(next);
      setCurrent(current + 1);
    } else {
      setAnswers(next);
      setFinished(true);
    }
  }

  function restart() {
    setCurrent(0);
    setAnswers([]);
    setFinished(false);
  }

  const result = (() => {
    if (!finished) return null;
    const counts = new Map<string, number>();
    for (const id of answers) counts.set(id, (counts.get(id) ?? 0) + 1);
    let best = answers[0];
    for (const [id, c] of counts) {
      if (c > (counts.get(best) ?? 0)) best = id;
    }
    return services.find((s) => s.id === best) ?? services[0];
  })();

  return (
    <div class="max-w-3xl mx-auto mt-10">
      <div class="rounded-2xl bg-[var(--bg-elevated)] shadow-2xl overflow-hidden">
        <div class="p-6 md:p-8">
          {finished && result ? (
            <div class="text-center">
              <p class="text-sm font-semibold text-[#059669] uppercase tracking-wide">Tu mejor punto de partida</p>
              <h3 class="mt-2 text-2xl md:text-3xl font-bold text-[var(--text)]">{result.name}</h3>
              <p class="mt-2 text-[var(--brand-dark)] font-medium">{result.tagline}</p>
              <p class="mt-4 text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
                {result.plainExplanation.slice(0, 220)}…
              </p>
              <div class="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <a href="#servicios" class="btn btn-primary">Ver la explicación completa</a>
                <a href="#contacto" class="btn btn-secondary">Hablar con un asesor</a>
                <button type="button" onClick={restart} class="btn btn-ghost">
                  <RotateCcw class="w-5 h-5" aria-hidden="true" /> Volver a intentarlo
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div class="flex items-center justify-between mb-6">
                <p class="text-sm font-medium text-[var(--text-muted)]">Pregunta {current + 1} de {quizQuestions.length}</p>
                <div class="flex gap-2">
                  {quizQuestions.map((_, i) => (
                    <span
                      key={i}
                      class={`h-2 rounded-full transition-all duration-300 ${
                        i <= current ? 'w-8 bg-[var(--brand)]' : 'w-2 bg-[var(--border-strong)]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h3 class="text-xl md:text-2xl font-bold text-[var(--text)] mb-6">{question.question}</h3>

              <div class="grid gap-3">
                {question.options.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => select(opt.serviceId)}
                    class="w-full text-left p-4 rounded-xl border border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand-bg)] transition-all duration-200 flex items-center justify-between group"
                  >
                    <span class="text-[var(--text)] font-medium">{opt.label}</span>
                    <ArrowRight class="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-colors flex-shrink-0" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p class="mt-6 text-center text-sm text-cyan-200/70 flex items-center justify-center gap-2">
        <Sparkles class="w-4 h-4" aria-hidden="true" />
        Es orientativo y sin compromiso. El diagnóstico real lo hacemos conversando contigo, gratis.
      </p>
    </div>
  );
}
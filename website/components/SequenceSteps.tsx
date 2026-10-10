interface Step {
  from: string;
  to: string;
  message: string;
  note?: string;
  highlight?: "start" | "loop" | "end";
}

interface Props {
  actors: { id: string; label: string; tone?: "ink" | "indigo" | "emerald" | "amber" }[];
  steps: Step[];
}

const toneDot: Record<string, string> = {
  ink: "bg-ink-800",
  indigo: "bg-indigo-600",
  emerald: "bg-emerald-600",
  amber: "bg-amber-500",
};

const highlightBg: Record<string, string> = {
  start: "bg-indigo-50 border-indigo-200",
  loop: "bg-white border-ink-200",
  end: "bg-emerald-50 border-emerald-200",
};

export function SequenceSteps({ actors, steps }: Props) {
  const actorById = Object.fromEntries(actors.map((a) => [a.id, a]));
  return (
    <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
      <div className="flex items-center gap-4 border-b border-ink-200 bg-ink-50 px-4 py-2 text-xs">
        {actors.map((a) => (
          <span key={a.id} className="inline-flex items-center gap-1.5 text-ink-600">
            <span className={`h-2 w-2 rounded-full ${toneDot[a.tone ?? "ink"]}`} aria-hidden />
            <span className="font-medium">{a.label}</span>
          </span>
        ))}
      </div>
      <ol className="divide-y divide-ink-100">
        {steps.map((s, i) => {
          const from = actorById[s.from];
          const to = actorById[s.to];
          const bg = highlightBg[s.highlight ?? "loop"];
          return (
            <li key={i} className={`flex gap-3 border-l-4 px-4 py-3 text-sm ${bg}`}>
              <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-ink-800 font-mono text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-600">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${toneDot[from?.tone ?? "ink"]}`}
                      aria-hidden
                    />
                    {from?.label ?? s.from}
                  </span>
                  <span className="text-ink-400">→</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-600">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${toneDot[to?.tone ?? "ink"]}`}
                      aria-hidden
                    />
                    {to?.label ?? s.to}
                  </span>
                </div>
                <div className="mt-1 text-ink-900">{s.message}</div>
                {s.note && (
                  <div className="mt-1 text-xs text-ink-500 italic">{s.note}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

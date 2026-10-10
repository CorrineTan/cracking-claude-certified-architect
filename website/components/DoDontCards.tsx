interface Props {
  items: { good: string; bad: string; note?: string }[];
}

export function DoDontCards({ items }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <span aria-hidden>✓</span>
              <span>Do</span>
            </div>
            <div className="text-sm text-ink-800 leading-relaxed">{item.good}</div>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
              <span aria-hidden>✗</span>
              <span>Don&apos;t</span>
            </div>
            <div className="text-sm text-ink-800 leading-relaxed">{item.bad}</div>
          </div>
          {item.note && (
            <div className="md:col-span-2 rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-xs text-ink-600">
              <span className="font-semibold text-ink-700">Why: </span>
              {item.note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

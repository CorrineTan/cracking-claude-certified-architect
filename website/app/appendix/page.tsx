import { TopBar } from "@/components/TopBar";
import { TECHNOLOGIES, IN_SCOPE, OUT_OF_SCOPE, EXAM_META } from "@/lib/appendix";

export default function AppendixPage() {
  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "Appendix" }]}
        title="Appendix"
        description="Technologies and concepts covered by the exam, plus in-scope and out-of-scope topic lists from the official guide."
      />
      <div className="space-y-10 px-6 py-8 lg:px-10">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-ink-900">Exam metadata</h2>
          <div className="grid gap-3 rounded-xl border border-ink-200 bg-white p-6 sm:grid-cols-2">
            <Meta label="Format" value={EXAM_META.format} />
            <Meta label="Scenarios presented" value={EXAM_META.scenariosPresented} />
            <Meta label="Scoring range" value={EXAM_META.scoringRange} />
            <Meta label="Passing score" value={`${EXAM_META.passingScore} / 1,000`} />
            <Meta
              label="Penalty for guessing"
              value={EXAM_META.noPenaltyForGuessing ? "None" : "Yes"}
            />
            <Meta label="Typical experience" value={EXAM_META.typicalExperience} />
            <Meta label="Version" value={EXAM_META.version} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-ink-900">Technologies & concepts</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {TECHNOLOGIES.map((t) => (
              <div key={t.name} className="rounded-xl border border-ink-200 bg-white p-4">
                <div className="mb-1 font-mono text-sm font-semibold text-ink-900">
                  {t.name}
                </div>
                <p className="text-sm leading-relaxed text-ink-600">{t.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-ink-900">In scope</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {IN_SCOPE.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
              >
                <div className="mb-1 text-sm font-semibold text-emerald-800">{t.name}</div>
                <p className="text-sm leading-relaxed text-ink-700">{t.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-ink-900">Out of scope</h2>
          <ul className="space-y-2 rounded-xl border border-rose-200 bg-rose-50/40 p-6">
            {OUT_OF_SCOPE.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-ink-700">
                <span className="text-rose-500">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div className="text-sm font-medium text-ink-900">{value}</div>
    </div>
  );
}

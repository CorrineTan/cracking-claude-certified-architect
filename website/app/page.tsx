import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { ScenarioCard } from "@/components/ScenarioCard";
import { WeightBar } from "@/components/WeightBar";
import { DOMAINS } from "@/lib/domains";
import { SCENARIOS } from "@/lib/scenarios";
import { EXERCISES } from "@/lib/exercises";
import { EXAM_META } from "@/lib/appendix";

export default function HomePage() {
  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home" }]}
        title="Claude Certified Architect – Foundations"
        description="A personal study workspace covering every domain, scenario, sample question, and preparation exercise from the exam guide. Use the sidebar to jump between sections."
      />
      <div className="space-y-10 px-6 py-8 lg:px-10">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Passing score" value={`${EXAM_META.passingScore} / 1,000`} />
          <Stat label="Format" value="Multiple choice" sub="1 correct of 4" />
          <Stat
            label="Scenarios on exam"
            value="4 of 6"
            sub="picked at random"
          />
          <Stat label="No penalty" value="for guessing" sub="answer every question" />
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">Domain weighting</h2>
            <Link href="/domains" className="text-sm text-indigo-700 hover:underline">
              All domains →
            </Link>
          </div>
          <div className="space-y-3 rounded-xl border border-ink-200 bg-white p-6">
            {DOMAINS.map((d) => (
              <Link
                key={d.id}
                href={`/domains/${d.slug}`}
                className="block rounded-md p-2 hover:bg-ink-50"
              >
                <WeightBar
                  weight={d.weight}
                  accent={d.accent}
                  label={`${d.number}. ${d.title}`}
                />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">Exam scenarios</h2>
            <Link href="/scenarios" className="text-sm text-indigo-700 hover:underline">
              All scenarios →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SCENARIOS.map((s) => (
              <ScenarioCard key={s.slug} scenario={s} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">Preparation exercises</h2>
            <Link href="/exercises" className="text-sm text-indigo-700 hover:underline">
              All exercises →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EXERCISES.map((e) => (
              <Link
                key={e.slug}
                href={`/exercises/${e.slug}`}
                className="block rounded-xl border border-ink-200 bg-white p-4 hover:border-ink-300 hover:shadow-sm"
              >
                <div className="mb-1 font-mono text-xs text-ink-500">
                  Exercise {e.number}
                </div>
                <div className="mb-2 text-sm font-semibold text-ink-900">{e.title}</div>
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                    e.status === "complete"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-ink-200 bg-ink-100 text-ink-600"
                  }`}
                >
                  {e.status === "complete" ? "In repo" : "Not yet built"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-ink-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-500">{sub}</div>}
    </div>
  );
}

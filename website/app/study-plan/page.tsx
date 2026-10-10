import { TopBar } from "@/components/TopBar";
import { NotesPanel } from "@/components/NotesPanel";
import {
  StudyPlanChecklist,
  PlanProgressBanner,
} from "@/components/StudyPlanChecklist";
import { STUDY_PLAN } from "@/lib/studyPlan";

export default function StudyPlanPage() {
  const week1 = STUDY_PLAN.filter((d) => d.phase === "week1");
  const week2 = STUDY_PLAN.filter((d) => d.phase === "week2");
  const week1Hours = week1.reduce((s, d) => s + d.totalHours, 0);
  const week2Hours = week2.reduce((s, d) => s + d.totalHours, 0);

  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "Study plan" }]}
        title="14-day study plan"
        description="A day-by-day path from first read-through to exam-ready. Check items as you finish them — progress stays on this device."
      />
      <div className="space-y-10 px-6 py-8 lg:px-10">
        <PlanProgressBanner />

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">
              Week 1 · Framework + hands-on
            </h2>
            <span className="font-mono text-xs text-ink-500">
              {week1Hours.toFixed(1)}h across {week1.length} days
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {week1.map((day) => (
              <DayCard key={day.day} day={day} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">
              Week 2 · Test-taking practice
            </h2>
            <span className="font-mono text-xs text-ink-500">
              {week2Hours.toFixed(1)}h across {week2.length} days
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {week2.map((day) => (
              <DayCard key={day.day} day={day} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6">
          <h2 className="mb-3 text-lg font-semibold text-ink-900">
            Ready-to-sit gates
          </h2>
          <p className="mb-3 text-sm text-ink-700">
            Only book the exam once both of these are true. They protect you from
            the common &ldquo;I read everything but still missed the pattern&rdquo; failure
            mode.
          </p>
          <ul className="space-y-2 text-sm text-ink-800">
            <li className="flex gap-2">
              <span className="font-mono text-emerald-700">✓</span>
              <span>
                30-question aggregate accuracy{" "}
                <span className="font-semibold">≥ 85%</span> (cold answers — no peeking)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-emerald-700">✓</span>
              <span>
                Can verbally explain, without notes, all 5 concepts:{" "}
                <span className="font-mono text-xs">stop_reason</span> loop · subagent
                context inheritance · <span className="font-mono text-xs">context: fork</span>{" "}
                · <span className="font-mono text-xs">tool_choice=&quot;any&quot;</span> ·
                validation-retry follow-up structure
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function DayCard({ day }: { day: (typeof STUDY_PLAN)[number] }) {
  return (
    <article className="rounded-xl border border-ink-200 bg-white p-5">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Day {day.day}
          </div>
          <h3 className="text-base font-semibold text-ink-900">{day.title}</h3>
        </div>
      </header>
      <StudyPlanChecklist day={day} />
      <div className="mt-4">
        <NotesPanel
          storageKey={`plan-day-${day.day}`}
          label={`Day ${day.day} journal`}
          placeholder="What clicked today? What do I want to revisit tomorrow?"
          compact
        />
      </div>
    </article>
  );
}

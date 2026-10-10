import { notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { DomainBadge } from "@/components/DomainBadge";
import { QuestionDeck } from "@/components/QuestionDeck";
import { PrevNext } from "@/components/PrevNext";
import { ScenarioDeepDiveBlock } from "@/components/DeepDiveBlock";
import { NotesPanel } from "@/components/NotesPanel";
import { ExerciseCode } from "@/components/ExerciseCode";
import { SCENARIOS, getScenario } from "@/lib/scenarios";
import { getQuestionsForScenario } from "@/lib/questions";
import { getDomainById } from "@/lib/domains";
import { EXERCISES } from "@/lib/exercises";
import { EXERCISE_CODE } from "@/lib/exercise-code";
import type { ScenarioSlug } from "@/lib/types";

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ slug: s.slug }));
}

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scenario = getScenario(slug as ScenarioSlug);
  if (!scenario) notFound();

  const questions = getQuestionsForScenario(scenario.slug);

  const idx = SCENARIOS.findIndex((s) => s.slug === scenario.slug);
  const prev = idx > 0 ? SCENARIOS[idx - 1] : undefined;
  const next = idx < SCENARIOS.length - 1 ? SCENARIOS[idx + 1] : undefined;

  // Pick the runnable exercise that best overlaps this scenario's primary
  // domains. We prefer ones with code snapshots so we can render real source.
  const relatedExercise = (() => {
    const candidates = EXERCISES.filter(
      (e) => e.status === "complete" && EXERCISE_CODE[e.slug],
    );
    let best = null as null | (typeof candidates)[number];
    let bestOverlap = 0;
    for (const e of candidates) {
      const overlap = e.domains.filter((d) =>
        scenario.primaryDomains.includes(d),
      ).length;
      if (overlap > bestOverlap) {
        best = e;
        bestOverlap = overlap;
      }
    }
    return best;
  })();

  return (
    <div>
      <TopBar
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Scenarios", href: "/scenarios" },
          { label: scenario.title },
        ]}
        title={`Scenario ${scenario.number}: ${scenario.title}`}
      />
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <section className="rounded-xl border border-ink-200 bg-white p-6">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-700">
            {scenario.narrative}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Primary domains
            </span>
            {scenario.primaryDomains.map((d) => (
              <DomainBadge key={d} domainId={d} showWeight />
            ))}
          </div>
          {scenario.targetMetric && (
            <div className="mt-3 text-xs text-ink-500">
              Target metric:{" "}
              <span className="font-mono text-ink-800">{scenario.targetMetric}</span>
            </div>
          )}
        </section>

        {scenario.deepDive && (
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ink-900">Deep dive</h2>
            <ScenarioDeepDiveBlock deepDive={scenario.deepDive} />
          </section>
        )}

        <section>
          <h2 className="mb-3 text-xl font-semibold text-ink-900">Related task statements</h2>
          <div className="flex flex-wrap gap-2">
            {scenario.primaryDomains.map((id) => {
              const d = getDomainById(id);
              if (!d) return null;
              return (
                <Link
                  key={id}
                  href={`/domains/${d.slug}`}
                  className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                >
                  <span className="font-mono text-xs text-ink-500">{d.id}</span>{" "}
                  <span className="font-medium">{d.title}</span>
                  <span className="ml-1 text-xs text-ink-500">· {d.tasks.length} tasks</span>
                </Link>
              );
            })}
          </div>
        </section>

        {relatedExercise && (
          <section>
            <h2 className="mb-1 text-xl font-semibold text-clay-900">
              Related exercise — with source code
            </h2>
            <p className="mb-4 text-sm text-clay-600">
              The runnable reference project for this scenario.{" "}
              <Link
                href={`/exercises/${relatedExercise.slug}`}
                className="prose-link"
              >
                Open the full exercise →
              </Link>
            </p>
            <div className="rounded-2xl border border-ember-200 bg-ember-50/40 p-1.5">
              <div className="rounded-xl bg-white p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-ember-700">
                    Exercise {relatedExercise.number}
                  </span>
                  <span className="font-semibold text-clay-900">
                    {relatedExercise.title}
                  </span>
                </div>
                <ExerciseCode
                  exerciseSlug={relatedExercise.slug}
                  steps={relatedExercise.steps}
                />
              </div>
            </div>
          </section>
        )}

        {questions.length > 0 && (
          <section>
            <h2 className="mb-2 text-xl font-semibold text-clay-900">
              Practice · {questions.length} questions
            </h2>
            <p className="mb-4 text-sm text-clay-600">
              One at a time. Use ← → keys to navigate.
            </p>
            <QuestionDeck
              questions={questions}
              storageKey={`scenario-page:${scenario.slug}`}
            />
          </section>
        )}

        <section>
          <h2 className="mb-3 text-xl font-semibold text-ink-900">Notes for this scenario</h2>
          <NotesPanel
            storageKey={`scenario-${scenario.slug}`}
            placeholder="How does this scenario map to tasks I already know? What would trip me up on test day?"
          />
        </section>

        <PrevNext
          prev={
            prev
              ? {
                  href: `/scenarios/${prev.slug}`,
                  sublabel: `Scenario ${prev.number}`,
                  label: prev.title,
                }
              : undefined
          }
          next={
            next
              ? {
                  href: `/scenarios/${next.slug}`,
                  sublabel: `Scenario ${next.number}`,
                  label: next.title,
                }
              : { href: "/exercises", label: "Exercises" }
          }
        />
      </div>
    </div>
  );
}

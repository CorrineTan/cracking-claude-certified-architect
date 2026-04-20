import { notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { DomainBadge } from "@/components/DomainBadge";
import { QuestionCard } from "@/components/QuestionCard";
import { PrevNext } from "@/components/PrevNext";
import { SCENARIOS, getScenario } from "@/lib/scenarios";
import { getQuestionsForScenario } from "@/lib/questions";
import { getDomainById } from "@/lib/domains";
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
  const pdfQs = questions.filter((q) => q.source === "pdf");
  const genQs = questions.filter((q) => q.source === "generated");

  const idx = SCENARIOS.findIndex((s) => s.slug === scenario.slug);
  const prev = idx > 0 ? SCENARIOS[idx - 1] : undefined;
  const next = idx < SCENARIOS.length - 1 ? SCENARIOS[idx + 1] : undefined;

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

        {pdfQs.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-ink-900">
              Sample questions from exam guide · {pdfQs.length}
            </h2>
            <div className="space-y-4">
              {pdfQs.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </div>
          </section>
        )}

        {genQs.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-ink-900">
              Additional practice · {genQs.length}
            </h2>
            <div className="space-y-4">
              {genQs.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </div>
          </section>
        )}

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

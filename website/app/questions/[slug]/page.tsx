import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { QuestionCard } from "@/components/QuestionCard";
import { PrevNext } from "@/components/PrevNext";
import { SCENARIOS, getScenario } from "@/lib/scenarios";
import { getQuestionsForScenario } from "@/lib/questions";
import type { ScenarioSlug } from "@/lib/types";

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ slug: s.slug }));
}

export default async function ScenarioQuestionsPage({
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
          { label: "Questions", href: "/questions" },
          { label: scenario.title },
        ]}
        title={`Questions · ${scenario.title}`}
        description={`${questions.length} questions for this scenario.`}
      />
      <div className="space-y-8 px-6 py-8 lg:px-10">
        {pdfQs.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-ink-900">From exam guide</h2>
            <div className="space-y-4">
              {pdfQs.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </div>
          </section>
        )}
        {genQs.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-ink-900">Additional practice</h2>
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
                  href: `/questions/${prev.slug}`,
                  sublabel: "Previous scenario",
                  label: prev.title,
                }
              : undefined
          }
          next={
            next
              ? {
                  href: `/questions/${next.slug}`,
                  sublabel: "Next scenario",
                  label: next.title,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}

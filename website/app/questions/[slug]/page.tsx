import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { ScenarioBoard } from "./ScenarioBoard";
import { JungleSidebar } from "@/components/JungleSidebar";
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
        description={`${questions.length} ${questions.length === 1 ? "question" : "questions"} for this scenario. Use ← → to navigate.`}
      />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 lg:px-6">
        <div className="min-w-0 flex-1 space-y-6">
        <ScenarioBoard
          questions={questions}
          storageKey={`scenario:${scenario.slug}`}
        />

        {/* Scenario nav */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-clay-200 bg-white p-3 text-sm">
          {prev ? (
            <Link
              href={`/questions/${prev.slug}`}
              className="flex flex-col rounded-xl px-3 py-2 hover:bg-clay-50"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-clay-500">
                ← Previous scenario
              </span>
              <span className="text-clay-900">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/questions/${next.slug}`}
              className="flex flex-col rounded-xl px-3 py-2 text-right hover:bg-clay-50"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-clay-500">
                Next scenario →
              </span>
              <span className="text-clay-900">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
        </div>
        <JungleSidebar />
      </div>
    </div>
  );
}

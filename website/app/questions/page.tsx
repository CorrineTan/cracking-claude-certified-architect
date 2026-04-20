import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { QuestionCard } from "@/components/QuestionCard";
import { QUESTIONS } from "@/lib/questions";
import { SCENARIOS } from "@/lib/scenarios";

export default function QuestionsIndexPage() {
  const pdfCount = QUESTIONS.filter((q) => q.source === "pdf").length;
  const genCount = QUESTIONS.filter((q) => q.source === "generated").length;

  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "Questions" }]}
        title="Practice questions"
        description={`${QUESTIONS.length} questions total — ${pdfCount} verbatim from the exam guide and ${genCount} written to reinforce specific task statements. Click a scenario below to focus, or scroll for the full set.`}
      />
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
            Filter by scenario
          </h2>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <Link
                key={s.slug}
                href={`/questions/${s.slug}`}
                className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
              >
                <span className="font-mono text-xs text-ink-500">{s.number}.</span>{" "}
                <span className="font-medium">{s.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-ink-900">All questions</h2>
          <div className="space-y-4">
            {QUESTIONS.map((q) => (
              <QuestionCard key={q.id} question={q} showScenarioLink />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

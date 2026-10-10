import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { ScenarioCard } from "@/components/ScenarioCard";
import { WeightBar } from "@/components/WeightBar";
import { UserMenu } from "@/components/UserMenu";
import { AnimatedHeroDiagram } from "@/components/AnimatedHeroDiagram";
import { LearnHomeCard } from "@/components/LearnHomeCard";
import { DOMAINS } from "@/lib/domains";
import { SCENARIOS } from "@/lib/scenarios";
import { EXERCISES } from "@/lib/exercises";
import { QUESTIONS } from "@/lib/questions";
import { LESSONS, LESSON_COUNT } from "@/lib/lessons";
import { EXAM_META } from "@/lib/appendix";

const QUESTIONS_BY_SCENARIO = SCENARIOS.map((s) => ({
  scenario: s,
  count: QUESTIONS.filter((q) => q.scenario === s.slug).length,
}));

const COUNT_PDF = QUESTIONS.filter(
  (q) => q.source === "pdf" || q.source === "generated",
).length;
const COUNT_CCA = QUESTIONS.filter((q) => q.source === "cca-series").length;
const COUNT_VIDEO = QUESTIONS.filter((q) => q.source === "video-practice").length;

export default function HomePage() {
  const totalQuestions = QUESTIONS.length;
  const completeExercises = EXERCISES.filter((e) => e.status === "complete").length;

  return (
    <div className="bg-clay-50">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container relative">
          {/* top auth chip */}
          <div className="mb-10 flex items-center justify-between">
            <Link
              href="https://github.com/corrtan/cracking-claude-certified-architect"
              className="group flex w-fit items-center gap-3 rounded-full border border-clay-200 bg-white p-1 pl-4 text-sm shadow-sm transition hover:border-ember-300"
            >
              <span className="text-clay-700">Open source · 200+ questions</span>
              <span className="block h-4 w-px bg-clay-200" />
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clay-50 transition group-hover:bg-ember-100">
                <ArrowRight className="h-3 w-3 text-clay-700" />
              </span>
            </Link>
            <UserMenu />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <h1
              className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl fade-up"
            >
              <span className="hero-grad-wrap inline-block">
                <span className="hero-grad-text">Pass the Foundations exam</span>
              </span>
              <br />
              <span className="text-clay-700">with </span>
              <span className="hero-grad-sub">running code</span>
              <span className="text-clay-700">, not slides.</span>
            </h1>

            <p
              className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-clay-600 md:text-lg fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              An open notebook for the Claude Certified Architect — Foundations
              exam. {totalQuestions} annotated questions, six scenarios, two
              reference projects you can clone in five minutes.
            </p>

            <div
              className="mt-8 flex flex-wrap items-center justify-center gap-3 fade-up"
              style={{ animationDelay: "0.25s" }}
            >
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 rounded-full bg-clay-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ember-600"
              >
                Start learning
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/questions"
                className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white px-5 py-2.5 text-sm font-semibold text-clay-800 transition hover:border-ember-300 hover:text-ember-700"
              >
                Practice questions
              </Link>
            </div>

            <p
              className="mt-5 text-xs text-clay-500 fade-up"
              style={{ animationDelay: "0.35s" }}
            >
              Free forever · no sign-up to browse · Google sign-in unlocks
              comments
            </p>
          </div>

          {/* Animated diagram — visual demo of agent loop */}
          <div
            className="fade-up mx-auto mt-14 max-w-4xl"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="relative rounded-2xl border border-clay-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-10">
              <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-clay-500">
                The agentic loop · what every domain orbits
              </p>
              <AnimatedHeroDiagram />
            </div>
          </div>

          {/* Stat band */}
          <div
            className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-10 gap-y-6 rounded-2xl border border-clay-200 bg-white px-8 py-6 shadow-sm sm:grid-cols-4 fade-up"
            style={{ animationDelay: "0.6s" }}
          >
            <Stat label="Questions" value={String(totalQuestions)} />
            <Stat label="Scenarios" value="6" sub="4 hit on exam" />
            <Stat
              label="Exercises"
              value={`${completeExercises}/${EXERCISES.length}`}
              sub="runnable"
            />
            <Stat
              label="Pass mark"
              value={`${EXAM_META.passingScore}/1k`}
            />
          </div>
        </div>
      </section>

      {/* ── Learn — the daily lesson track ─────────────────────── */}
      <section className="relative border-t border-clay-200 bg-gradient-to-br from-ember-50 via-clay-50 to-white">
        <div className="container py-20 md:py-24">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ember-700">
              <Sparkles className="h-3.5 w-3.5" /> New · daily lessons
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-clay-900 md:text-4xl">
              <span className="font-mono text-ember-600">{LESSON_COUNT}</span>{" "}
              bite-size lessons.{" "}
              <span className="text-clay-700">
                Tick what you know. No quotas, no order.
              </span>
            </h2>
            <p className="mt-3 text-sm text-clay-600 md:text-base">
              2-5 minutes each. Pick any tile, learn the idea, mark it done.
              Your ticks sync across devices when you sign in.
            </p>
          </div>

          <LearnHomeCard
            totalLessons={LESSON_COUNT}
            firstLessonId={LESSONS[0]?.id ?? "1.1"}
            domains={DOMAINS.map((d) => ({
              id: d.id,
              number: d.number,
              title: d.title,
              accent: d.accent,
              count: LESSONS.filter((l) => l.domainId === d.id).length,
              firstLessonId:
                LESSONS.find((l) => l.domainId === d.id)?.id ?? "",
            }))}
          />
        </div>
      </section>

      {/* ── Why this guide ─────────────────────────────────────── */}
      <section className="border-t border-clay-200 bg-white">
        <div className="container py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember-700">
              Why this guide
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-clay-900 md:text-4xl">
              Theory you can read everywhere.{" "}
              <span className="text-ember-600">
                Code you can actually run is rare.
              </span>
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            <Pillar
              kicker="01"
              title="Sourced from the exam guide"
              body="Domain weights, task statements and sample questions all map back to the official Anthropic spec. No paraphrasing."
            />
            <Pillar
              kicker="02"
              title="Two reference projects"
              body="A multi-tool MCP support agent with hook-enforced gates, and a Claude Code team workflow with rules, skills, and a slash command."
            />
            <Pillar
              kicker="03"
              title="Open by default"
              body="Every question, explanation and exercise lives on GitHub. Fork it, file an issue, send a PR."
            />
          </div>
        </div>
      </section>

      {/* ── Question bank ──────────────────────────────────────── */}
      <section className="border-t border-clay-200 bg-clay-50">
        <div className="container py-20 md:py-24">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember-700">
              Practice — questions
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-clay-900 md:text-4xl">
              <span className="font-mono text-ember-600">{totalQuestions}</span>{" "}
              questions, every one with an annotated answer.
            </h2>
            <p className="mt-3 text-sm text-clay-600 md:text-base">
              Three sourced banks. Click any question to reveal the correct
              option, why each distractor is wrong, and the exam tip behind it.
            </p>
          </div>

          <div className="mx-auto mb-8 grid max-w-5xl gap-4 md:grid-cols-3">
            <SourceCard kicker="Official sample" count={COUNT_PDF} note="Verbatim from the exam guide" />
            <SourceCard kicker="CCA Series" count={COUNT_CCA} note="With per-distractor + exam tip" highlight />
            <SourceCard kicker="Video Practice" count={COUNT_VIDEO} note="From CCFA video walkthroughs" />
          </div>

          <div className="mx-auto max-w-5xl">
            <Link
              href="/questions"
              className="group flex flex-col items-start justify-between gap-4 rounded-2xl border border-ember-200 bg-gradient-to-br from-ember-50 to-white p-6 transition hover:border-ember-400 sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ember-700">
                  Open the full bank
                </p>
                <p className="mt-1 text-xl font-semibold text-clay-900">
                  Practice all <span className="font-mono text-ember-700">{totalQuestions}</span> questions
                </p>
                <p className="mt-1 text-sm text-clay-600">
                  Reveal-on-click answers · keyed to domains and scenarios
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-clay-900 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-ember-600">
                Start <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {QUESTIONS_BY_SCENARIO.map(({ scenario, count }) => (
                <Link
                  key={scenario.slug}
                  href={`/questions/${scenario.slug}`}
                  className="lift-card group flex items-center justify-between gap-3 rounded-xl border border-clay-200 bg-white p-4"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-clay-500">
                      Scenario {scenario.number}
                    </p>
                    <p className="truncate text-sm font-medium text-clay-900 group-hover:text-ember-700">
                      {scenario.title}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-clay-200 bg-clay-50 px-2.5 py-1 text-xs font-mono text-clay-700">
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Domain weighting ──────────────────────────────────── */}
      <section className="border-t border-clay-200 bg-white">
        <div className="container py-20 md:py-24">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember-700">
              Curriculum
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-clay-900 md:text-4xl">
              Five domains. Weighted as the exam weights them.
            </h2>
          </div>

          <div className="mx-auto max-w-4xl space-y-1 rounded-2xl border border-clay-200 bg-clay-50 p-3 sm:p-4">
            {DOMAINS.map((d) => (
              <Link
                key={d.id}
                href={`/domains/${d.slug}`}
                className="lift-card block rounded-xl border border-transparent bg-white p-4"
              >
                <WeightBar
                  weight={d.weight}
                  accent={d.accent}
                  label={`${d.number}. ${d.title}`}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scenarios ─────────────────────────────────────────── */}
      <section className="border-t border-clay-200 bg-clay-50">
        <div className="container py-20 md:py-24">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember-700">
              Scenarios
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-clay-900 md:text-4xl">
              Six scenarios. Four show up on exam day.
            </h2>
          </div>

          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SCENARIOS.map((s) => (
              <ScenarioCard key={s.slug} scenario={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Exercises ─────────────────────────────────────────── */}
      <section className="border-t border-clay-200 bg-white">
        <div className="container py-20 md:py-24">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember-700">
              Practice — runnable
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-clay-900 md:text-4xl">
              Exercises that compile.
            </h2>
          </div>

          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXERCISES.map((e) => (
              <Link
                key={e.slug}
                href={`/exercises/${e.slug}`}
                className="lift-card group block rounded-2xl border border-clay-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-clay-500">
                    Exercise {e.number}
                  </p>
                  <span
                    className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium ${
                      e.status === "complete"
                        ? "bg-ember-100 text-ember-700"
                        : "bg-clay-100 text-clay-600"
                    }`}
                  >
                    {e.status === "complete" ? "● live" : "○ planned"}
                  </span>
                </div>
                <p className="text-base font-semibold leading-snug text-clay-900 group-hover:text-ember-700">
                  {e.title}
                </p>
                {e.summary && (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-clay-600">
                    {e.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-clay-200 bg-clay-50">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-base font-semibold text-clay-900">
                claude architect
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-clay-600">
                An independent community resource. Not affiliated with or
                endorsed by Anthropic.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm md:justify-end">
              <a href="/questions" className="text-clay-700 hover:text-ember-600">Practice</a>
              <a href="/domains" className="text-clay-700 hover:text-ember-600">Domains</a>
              <a href="/scenarios" className="text-clay-700 hover:text-ember-600">Scenarios</a>
              <a href="/exercises" className="text-clay-700 hover:text-ember-600">Exercises</a>
              <a
                href="https://github.com/corrtan/cracking-claude-certified-architect"
                className="text-clay-700 hover:text-ember-600"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="text-center">
      <p className="font-mono text-[10px] uppercase tracking-wider text-clay-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-clay-900">
        {value}
      </p>
      {sub && <p className="text-[11px] text-clay-500">{sub}</p>}
    </div>
  );
}

function Pillar({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="lift-card rounded-2xl border border-clay-200 bg-white p-6">
      <p className="font-mono text-xs text-ember-600">— {kicker}</p>
      <h3 className="mt-4 text-lg font-semibold text-clay-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-clay-600">{body}</p>
    </div>
  );
}

function SourceCard({
  kicker,
  count,
  note,
  highlight = false,
}: {
  kicker: string;
  count: number;
  note: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href="/questions"
      className={`lift-card group rounded-2xl border p-6 transition ${
        highlight
          ? "border-ember-300 bg-gradient-to-br from-ember-50 to-white"
          : "border-clay-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider text-clay-600">
          {kicker}
        </p>
        <ArrowRight className="h-4 w-4 text-clay-400 transition group-hover:translate-x-1 group-hover:text-ember-600" />
      </div>
      <p className="text-4xl font-semibold tabular-nums text-clay-900">
        {count}
      </p>
      <p className="mt-2 text-xs text-clay-600">{note}</p>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useProgress } from "@/lib/progress-store";
import { LESSONS } from "@/lib/lessons";
import { ProgressTree } from "./ProgressTree";

const ACCENT_BG: Record<string, string> = {
  indigo:  "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber:   "bg-amber-500",
  rose:    "bg-rose-500",
  sky:     "bg-sky-500",
};

const ACCENT_BG_SOFT: Record<string, string> = {
  indigo:  "bg-indigo-100 text-indigo-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber:   "bg-amber-100 text-amber-700",
  rose:    "bg-rose-100 text-rose-700",
  sky:     "bg-sky-100 text-sky-700",
};

interface DomainEntry {
  id: string;
  number: number;
  title: string;
  accent: string;
  count: number;
  firstLessonId: string;
}

interface Props {
  totalLessons: number;
  firstLessonId: string;
  domains: DomainEntry[];
}

export function LearnHomeCard({ totalLessons, firstLessonId, domains }: Props) {
  const { completed, isCompleted, loaded } = useProgress();
  const done = completed.size;
  const pct = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;

  // First non-completed lesson — "Resume" target
  const next = LESSONS.find((l) => !completed.has(l.id));
  const resumeId = next?.id ?? firstLessonId;
  const resumeLesson = next ?? LESSONS[0];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Garden — flowers bloom as you tick lessons */}
      <div className="mb-6 overflow-hidden rounded-3xl border-2 border-clay-900/10 bg-white shadow-md">
        <div
          className="relative w-full overflow-hidden"
          style={{ minHeight: "380px", aspectRatio: "5 / 3" }}
        >
          <ProgressTree />
        </div>
      </div>

      {/* Big CTA card */}
      <Link
        href={`/learn/${resumeId}`}
        className="group relative block overflow-hidden rounded-3xl border border-ember-300 bg-gradient-to-br from-clay-900 via-ember-700 to-ember-500 p-1 shadow-lg"
      >
        <div className="relative rounded-[calc(1.5rem-3px)] bg-clay-900 p-8 sm:p-10">
          {/* Decorative aurora */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-ember-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-ember-400/20 blur-3xl" />

          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember-300">
                {done === 0
                  ? "Start the daily lesson track"
                  : done === totalLessons
                    ? "All lessons complete"
                    : "Pick up where you left off"}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-clay-50 sm:text-4xl">
                {!loaded ? (
                  <>Start learning <span className="text-ember-300">→</span></>
                ) : done === 0 ? (
                  <>Start with <span className="text-ember-300">{resumeLesson?.id}</span> · {resumeLesson?.title.split(" ").slice(0, 6).join(" ")}…</>
                ) : done === totalLessons ? (
                  <>You've ticked all {totalLessons} <span className="text-ember-300">→ drill</span></>
                ) : (
                  <>Resume <span className="text-ember-300">{resumeLesson?.id}</span> · {resumeLesson?.title.split(" ").slice(0, 6).join(" ")}…</>
                )}
              </p>
              <p className="mt-2 text-sm text-clay-300">
                {loaded ? `${done} / ${totalLessons} lessons completed · ${pct}%` : "Loading progress…"}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-clay-50 px-6 py-3 text-sm font-semibold text-clay-900 shadow-sm transition group-hover:bg-ember-200">
              {done === 0 ? "Start" : done === totalLessons ? "Drill questions" : "Resume"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-ember-300 to-ember-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </Link>

      {/* Domain mini-grid — clickable per-domain entry points */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {domains.map((d) => {
          const dDone = LESSONS.filter(
            (l) => l.domainId === d.id && isCompleted(l.id),
          ).length;
          const dPct = d.count > 0 ? Math.round((dDone / d.count) * 100) : 0;
          const accent = ACCENT_BG[d.accent] ?? ACCENT_BG.indigo;
          const accentSoft = ACCENT_BG_SOFT[d.accent] ?? ACCENT_BG_SOFT.indigo;
          return (
            <Link
              key={d.id}
              href={`/learn/${d.firstLessonId}`}
              className="group relative overflow-hidden rounded-2xl border border-clay-200 bg-white p-4 transition hover:border-ember-300 hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold text-white ${accent}`}
                >
                  {d.number}
                </span>
                {dDone === d.count && d.count > 0 ? (
                  <Check className="h-4 w-4 text-ember-500" strokeWidth={3} />
                ) : (
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${accentSoft}`}
                  >
                    {loaded ? `${dDone}/${d.count}` : `${d.count}`}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold leading-snug text-clay-900 group-hover:text-ember-700">
                {d.title}
              </p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-clay-100">
                <div
                  className={`h-full ${accent} transition-all`}
                  style={{ width: `${loaded ? dPct : 0}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Secondary "browse all" link */}
      <div className="mt-6 text-center">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-ember-700 hover:text-ember-800"
        >
          Browse all {totalLessons} lessons →
        </Link>
      </div>
    </div>
  );
}

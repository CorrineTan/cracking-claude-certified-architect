"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock, Lightbulb, AlertTriangle, Target } from "lucide-react";
import type { Lesson } from "@/lib/lessons";
import type { Question } from "@/lib/types";
import { useProgress } from "@/lib/progress-store";
import { QuestionCard } from "@/components/QuestionCard";
import { VisualsStrip } from "@/components/VisualsStrip";
import { playBloom, playChime, unlock } from "@/lib/sound-fx";

interface Props {
  lesson: Lesson;
  prev?: { id: string; title: string };
  next?: { id: string; title: string };
  checkQuestion?: Question;
}

export function LessonView({ lesson, prev, next, checkQuestion }: Props) {
  const { isCompleted, tick, untick } = useProgress();
  const done = isCompleted(lesson.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/learn"
            className="font-mono uppercase tracking-wider text-clay-500 hover:text-ember-700"
          >
            ← all lessons
          </Link>
          <span className="text-clay-300">/</span>
          <span className="rounded-full border border-ember-200 bg-ember-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ember-700">
            Domain {lesson.domainNumber} · {lesson.id}
          </span>
          <span className="font-mono text-[10px] text-clay-500">
            <Clock className="mr-1 inline h-3 w-3" />
            {lesson.minutes} min read
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-clay-900 sm:text-4xl">
          {lesson.title}
        </h1>
      </header>

      {/* Why it matters */}
      <section className="rounded-2xl border border-ember-200 bg-gradient-to-br from-ember-50 to-white p-5 sm:p-6">
        <p className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ember-700">
          <Lightbulb className="h-3.5 w-3.5" /> Why this matters
        </p>
        <p className="text-base leading-relaxed text-clay-800">
          {lesson.whyItMatters}
        </p>
      </section>

      {/* Visuals — diagrams + do/don't cards */}
      {lesson.visuals.length > 0 && (
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-clay-600">
            Visual aids
          </h2>
          <VisualsStrip visuals={lesson.visuals} cacheKey={lesson.id} />
        </section>
      )}

      {/* Key ideas */}
      {lesson.keyIdeas.length > 0 && (
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-clay-600">
            Key ideas
          </h2>
          <ol className="space-y-3">
            {lesson.keyIdeas.map((idea, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-2xl border border-clay-200 bg-white p-4 shadow-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay-900 font-mono text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <p className="text-[15px] leading-relaxed text-clay-800">
                  {idea}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Worked example */}
      {lesson.example && (
        <section className="rounded-2xl border border-clay-200 bg-clay-50 p-5 sm:p-6">
          <p className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-clay-600">
            <Target className="h-3.5 w-3.5" /> Worked example
          </p>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-clay-800">
            {lesson.example}
          </p>
        </section>
      )}

      {/* Pitfalls */}
      {lesson.pitfalls.length > 0 && (
        <section>
          <h2 className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-rose-700">
            <AlertTriangle className="h-3.5 w-3.5" /> Pitfalls — exam traps
          </h2>
          <ul className="space-y-2">
            {lesson.pitfalls.map((p, i) => (
              <li
                key={i}
                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-clay-800"
              >
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Skills you'll have */}
      {lesson.skills.length > 0 && (
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-700">
            After this lesson you can
          </h2>
          <ul className="space-y-2">
            {lesson.skills.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-clay-200 bg-white p-4 text-sm leading-relaxed text-clay-800"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Quick check */}
      {checkQuestion && (
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-clay-600">
            Quick check
          </h2>
          <QuestionCard question={checkQuestion} />
        </section>
      )}

      {/* Tick + next */}
      <section className="rounded-2xl border border-clay-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-clay-900">
              {done ? "✓ Got it. Move on?" : "Got it?"}
            </p>
            <p className="text-sm text-clay-600">
              {done
                ? "You've ticked this lesson. Untick if you want to revisit later."
                : "Tick when you can explain this without checking. No quotas, no deadlines."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {done ? (
              <button
                type="button"
                onClick={() => {
                  unlock();
                  untick(lesson.id);
                  playChime();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white px-4 py-2 text-sm font-medium text-clay-700 hover:border-rose-300 hover:text-rose-700"
              >
                Un-tick
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  unlock();
                  tick(lesson.id);
                  playBloom();
                }}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              >
                <Check className="h-4 w-4" />
                Mark as learned
              </button>
            )}
            {next && (
              <Link
                href={`/learn/${next.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-clay-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ember-600"
              >
                Next lesson
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Prev/next nav */}
      <nav className="flex items-stretch justify-between gap-3">
        {prev ? (
          <Link
            href={`/learn/${prev.id}`}
            className="flex flex-1 flex-col rounded-xl border border-clay-200 bg-white p-3 text-sm hover:border-ember-300 hover:bg-clay-50"
          >
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-clay-500">
              <ArrowLeft className="h-3 w-3" /> Previous
            </span>
            <span className="mt-1 truncate text-clay-900">{prev.id} · {prev.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/learn/${next.id}`}
            className="flex flex-1 flex-col rounded-xl border border-clay-200 bg-white p-3 text-right text-sm hover:border-ember-300 hover:bg-clay-50"
          >
            <span className="flex items-center justify-end gap-1 font-mono text-[10px] uppercase tracking-wider text-clay-500">
              Next <ArrowRight className="h-3 w-3" />
            </span>
            <span className="mt-1 truncate text-clay-900">{next.id} · {next.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </div>
  );
}

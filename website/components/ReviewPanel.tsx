"use client";

import { useMemo } from "react";
import type { Question } from "@/lib/types";
import { useAnswerStore, clearAllAnswers } from "@/lib/answer-store";

interface Props {
  questions: Question[];
  /** Called when a chip is clicked — the deck listens and jumps to that question. */
  onJump?: (questionId: string) => void;
}

export function ReviewPanel({ questions, onJump }: Props) {
  const { answers, confidence } = useAnswerStore();

  const stats = useMemo(() => {
    const wrong: Question[] = [];
    const review: Question[] = [];
    let answered = 0;
    for (const q of questions) {
      const a = answers[q.id];
      const c = confidence[q.id];
      if (a) {
        answered += 1;
        if (a !== q.correctAnswer) wrong.push(q);
      }
      if (c === "review") review.push(q);
    }
    const solid = Object.values(confidence).filter((v) => v === "solid").length;
    const shaky = Object.values(confidence).filter((v) => v === "shaky").length;
    return {
      answered,
      total: questions.length,
      wrong,
      review,
      solid,
      shaky,
    };
  }, [answers, confidence, questions]);

  if (stats.total === 0) return null;

  return (
    <section className="rounded-2xl border border-clay-200 bg-white px-5 py-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-clay-500">
          Review
        </h2>
        <span className="text-sm text-clay-700">
          <span className="font-semibold tabular-nums text-clay-900">
            {stats.wrong.length}
          </span>{" "}
          wrong ·{" "}
          <span className="font-semibold tabular-nums text-clay-900">
            {stats.answered}
          </span>
          /{stats.total} answered
        </span>
        {(stats.solid > 0 || stats.shaky > 0 || stats.review.length > 0) && (
          <span className="text-xs text-clay-500">
            ·{" "}
            {stats.solid > 0 && (
              <>
                <span className="text-emerald-700">●</span> {stats.solid} solid
              </>
            )}
            {stats.shaky > 0 && (
              <>
                {stats.solid > 0 && " · "}
                <span className="text-amber-700">●</span> {stats.shaky} shaky
              </>
            )}
            {stats.review.length > 0 && (
              <>
                {(stats.solid > 0 || stats.shaky > 0) && " · "}
                <span className="text-rose-700">●</span> {stats.review.length} review
              </>
            )}
          </span>
        )}
      </div>

      {stats.wrong.length === 0 && stats.review.length === 0 ? (
        <p className="text-xs text-clay-500">
          {stats.answered === 0
            ? "Answer some questions and your wrong-answer chips will appear here."
            : "No wrong answers and nothing flagged for review. 🎯"}
        </p>
      ) : (
        <div className="space-y-2">
          {stats.wrong.length > 0 && (
            <ChipRow
              label="Wrong"
              tone="rose"
              items={stats.wrong}
              onJump={onJump}
            />
          )}
          {stats.review.length > 0 && (
            <ChipRow
              label="Marked review"
              tone="amber"
              items={stats.review.filter((q) => !stats.wrong.some((w) => w.id === q.id))}
              onJump={onJump}
            />
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Clear every recorded answer? Confidence and notes are kept.",
              )
            ) {
              clearAllAnswers();
            }
          }}
          className="text-[11px] text-clay-500 hover:text-rose-600"
        >
          reset answers
        </button>
      </div>
    </section>
  );
}

function ChipRow({
  label,
  tone,
  items,
  onJump,
}: {
  label: string;
  tone: "rose" | "amber";
  items: Question[];
  onJump?: (questionId: string) => void;
}) {
  if (items.length === 0) return null;
  const styles =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300 hover:bg-rose-100"
      : "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100";
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-clay-500">
        {label}
      </span>
      {items.map((q) => (
        <button
          key={q.id}
          type="button"
          onClick={() => onJump?.(q.id)}
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition ${styles}`}
          title={q.prompt.slice(0, 80)}
        >
          {shortLabel(q)}
        </button>
      ))}
    </div>
  );
}

function shortLabel(q: Question): string {
  if (q.number !== undefined) {
    return q.source === "pdf"
      ? `PDF Q${q.number}`
      : q.source === "cca-series"
        ? `CCA Q${q.number}`
        : `V Q${q.number}`;
  }
  return q.id;
}

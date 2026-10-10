"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { QuestionDeck } from "@/components/QuestionDeck";
import { ReviewPanel } from "@/components/ReviewPanel";
import { QUESTIONS } from "@/lib/questions";
import { SCENARIOS } from "@/lib/scenarios";

/**
 * Client wrapper that owns the "jump-to-question" handshake between the
 * review panel (which emits a question id when a chip is clicked) and the
 * deck (which navigates to that id).
 */
export function QuestionsBoard() {
  const [jumpId, setJumpId] = useState<string | null>(null);
  const handled = useCallback(() => setJumpId(null), []);

  return (
    <div className="space-y-6">
      <ReviewPanel questions={QUESTIONS} onJump={(id) => setJumpId(id)} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-clay-500">
          Filter by scenario
        </span>
        {SCENARIOS.map((s) => {
          const c = QUESTIONS.filter((q) => q.scenario === s.slug).length;
          return (
            <Link
              key={s.slug}
              href={`/questions/${s.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white px-3 py-1.5 text-xs text-clay-700 transition hover:border-ember-300 hover:text-ember-700"
            >
              <span className="font-mono text-[10px] text-clay-400">{s.number}.</span>
              <span className="font-medium">{s.title}</span>
              <span className="rounded-full bg-clay-50 px-1.5 py-0.5 font-mono text-[10px] text-clay-700">
                {c}
              </span>
            </Link>
          );
        })}
      </div>

      <QuestionDeck
        questions={QUESTIONS}
        storageKey="all"
        jumpToId={jumpId}
        onJumpHandled={handled}
      />
    </div>
  );
}

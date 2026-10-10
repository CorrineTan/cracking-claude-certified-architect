"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Shuffle } from "lucide-react";
import type { Question } from "@/lib/types";
import { QuestionCard } from "./QuestionCard";

interface Props {
  questions: Question[];
  /** Used as a stable key to remember the index across mounts */
  storageKey?: string;
  /** Optional title above the deck */
  emptyHint?: string;
  /**
   * Imperative jump signal. When this changes to a non-null value matching a
   * question id in the deck, the deck moves to that question. Useful for the
   * review panel chips that want to focus a wrong answer.
   */
  jumpToId?: string | null;
  /** Notified after a jump completes — caller resets its signal. */
  onJumpHandled?: () => void;
}

export function QuestionDeck({
  questions,
  storageKey,
  emptyHint,
  jumpToId,
  onJumpHandled,
}: Props) {
  const [order, setOrder] = useState<Question[]>(questions);
  const [idx, setIdx] = useState(0);

  // External jump — find the question in the current order and move there.
  useEffect(() => {
    if (!jumpToId) return;
    const target = order.findIndex((q) => q.id === jumpToId);
    if (target >= 0) {
      setIdx(target);
      // give the card a moment to mount, then scroll into view
      requestAnimationFrame(() => {
        document
          .querySelector(`[data-question-id="${jumpToId}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    onJumpHandled?.();
  }, [jumpToId, order, onJumpHandled]);

  // restore last index from localStorage (per deck)
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(`deck:${storageKey}`);
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed < questions.length) {
          setIdx(parsed);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, questions.length]);

  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(`deck:${storageKey}`, String(idx));
      } catch {}
    }
  }, [idx, storageKey]);

  // reset deck when input list changes (e.g. filter by scenario)
  useEffect(() => {
    setOrder(questions);
    setIdx(0);
  }, [questions]);

  const total = order.length;
  const current = order[idx];

  const goPrev = useCallback(() => {
    setIdx((i) => (i - 1 + total) % total);
  }, [total]);
  const goNext = useCallback(() => {
    setIdx((i) => (i + 1) % total);
  }, [total]);
  const goRandom = useCallback(() => {
    if (total < 2) return;
    let next = idx;
    while (next === idx) next = Math.floor(Math.random() * total);
    setIdx(next);
  }, [idx, total]);

  // keyboard navigation — arrow keys
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ignore typing inside textarea / input
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if (t && t.isContentEditable) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "r" || e.key === "R") {
        goRandom();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, goRandom]);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-clay-300 bg-white p-12 text-center text-sm text-clay-600">
        {emptyHint ?? "No questions in this view yet."}
      </div>
    );
  }

  // Tracks displayed under the card
  const dotsToShow = useMemo(() => {
    if (total <= 24) return Array.from({ length: total }, (_, i) => i);
    // show 12 around current with ellipsis ends
    const start = Math.max(0, Math.min(total - 12, idx - 6));
    return Array.from({ length: 12 }, (_, i) => start + i);
  }, [idx, total]);

  return (
    <div className="space-y-5">
      {/* Top bar — counter + nav + random */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-clay-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-wider text-clay-500">
            Question
          </span>
          <span className="text-base font-semibold tabular-nums text-clay-900">
            {idx + 1}
            <span className="mx-1 text-clay-400">/</span>
            <span className="text-clay-500">{total}</span>
          </span>
          <Link
            href={`/scenarios/${current.scenario}`}
            className="hidden truncate rounded-full border border-clay-200 bg-clay-50 px-2.5 py-1 text-xs text-clay-700 hover:border-ember-300 hover:text-ember-700 sm:inline"
          >
            {current.scenario}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goRandom}
            className="hidden items-center gap-1.5 rounded-full border border-clay-200 bg-white px-3 py-1.5 text-xs font-medium text-clay-700 transition hover:border-ember-300 hover:text-ember-700 sm:inline-flex"
            aria-label="Random question (R)"
            title="Random question (R)"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Random
          </button>
          <button
            type="button"
            onClick={goPrev}
            disabled={total < 2}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-clay-200 bg-white text-clay-700 transition hover:border-ember-400 hover:bg-ember-50 hover:text-ember-700 disabled:opacity-40"
            aria-label="Previous question (←)"
            title="Previous question (←)"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={total < 2}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-clay-900 text-white transition hover:bg-ember-600 disabled:opacity-40"
            aria-label="Next question (→)"
            title="Next question (→)"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Card */}
      <div key={current.id} className="fade-up">
        <QuestionCard question={current} showScenarioLink />
      </div>

      {/* Dot tracks — clickable jump */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {dotsToShow[0] > 0 && (
          <button
            type="button"
            onClick={() => setIdx(0)}
            className="font-mono text-[10px] text-clay-400 hover:text-ember-600"
          >
            1
          </button>
        )}
        {dotsToShow[0] > 0 && (
          <span className="text-clay-300">…</span>
        )}
        {dotsToShow.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === idx
                ? "h-2 w-6 bg-ember-500"
                : "bg-clay-300 hover:bg-clay-500"
            }`}
            aria-label={`Go to question ${i + 1}`}
            title={`Q ${i + 1}`}
          />
        ))}
        {dotsToShow[dotsToShow.length - 1] < total - 1 && (
          <span className="text-clay-300">…</span>
        )}
        {dotsToShow[dotsToShow.length - 1] < total - 1 && (
          <button
            type="button"
            onClick={() => setIdx(total - 1)}
            className="font-mono text-[10px] text-clay-400 hover:text-ember-600"
          >
            {total}
          </button>
        )}
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-clay-400">
        Use ← → keys to navigate · R for random
      </p>
    </div>
  );
}

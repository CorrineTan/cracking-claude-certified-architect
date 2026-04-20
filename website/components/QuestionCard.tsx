"use client";

import { useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { DomainBadge } from "./DomainBadge";

interface Props {
  question: Question;
  showScenarioLink?: boolean;
}

export function QuestionCard({ question, showScenarioLink = false }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);

  return (
    <article className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold text-ink-500">#{question.id}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            question.source === "pdf"
              ? "bg-ink-100 text-ink-700"
              : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {question.source === "pdf" ? `Sample Q${question.number}` : "Practice"}
        </span>
        <DomainBadge domainId={question.domain} />
        <span className="font-mono text-[11px] text-ink-500">Task {question.taskId}</span>
        {showScenarioLink && (
          <Link
            href={`/scenarios/${question.scenario}`}
            className="ml-auto text-xs text-ink-500 hover:text-ink-800"
          >
            {question.scenario} →
          </Link>
        )}
      </header>

      <p className="mb-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-800">
        {question.prompt}
      </p>

      <ol className="mb-4 space-y-2">
        {question.options.map((opt) => {
          const isCorrect = revealed && opt.label === question.correctAnswer;
          const isSelectedWrong =
            revealed && selected === opt.label && opt.label !== question.correctAnswer;
          const base =
            "flex gap-3 rounded-lg border p-3 text-sm text-left w-full transition-colors";
          let state = "border-ink-200 bg-white hover:bg-ink-50";
          if (isCorrect) state = "border-emerald-300 bg-emerald-50";
          else if (isSelectedWrong) state = "border-rose-300 bg-rose-50";
          else if (!revealed && selected === opt.label)
            state = "border-indigo-300 bg-indigo-50";

          return (
            <li key={opt.label}>
              <button
                type="button"
                onClick={() => !revealed && setSelected(opt.label)}
                disabled={revealed}
                className={`${base} ${state}`}
              >
                <span className="font-mono font-semibold text-ink-500">{opt.label}.</span>
                <span className="flex-1 text-ink-800">{opt.text}</span>
                {isCorrect && (
                  <span className="text-xs font-semibold text-emerald-700">correct</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700"
        >
          Show answer
        </button>
      ) : (
        <div className="rounded-lg border border-ink-200 bg-ink-50 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
            Explanation · Correct answer: {question.correctAnswer}
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-800">
            {question.explanation}
          </p>
          <button
            type="button"
            onClick={() => {
              setRevealed(false);
              setSelected(null);
            }}
            className="mt-3 text-xs font-medium text-ink-600 hover:text-ink-900"
          >
            Reset
          </button>
        </div>
      )}
    </article>
  );
}

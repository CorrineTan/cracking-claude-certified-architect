"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { DomainBadge } from "./DomainBadge";
import { NotesPanel } from "./NotesPanel";
import { Discussion } from "./Discussion";
import { useAuthEnabled } from "./SessionProvider";
import { ConfidencePicker } from "./ConfidencePicker";
import { useQuestionState } from "@/lib/answer-store";
import { playBloom, playWilt, unlock } from "@/lib/sound-fx";
import { emitAnswerEvent } from "@/lib/answer-events";

interface Props {
  question: Question;
  showScenarioLink?: boolean;
}

type Tab = "question" | "discuss";

export function QuestionCard({ question, showScenarioLink = false }: Props) {
  const authEnabled = useAuthEnabled();
  const { answer: persistedAnswer, setAnswer } = useQuestionState(question.id);
  const [tab, setTab] = useState<Tab>("question");
  // Auto-reveal when there's a persisted answer (deck nav restores prior state)
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [commentCount, setCommentCount] = useState<number | null>(null);

  // When the persisted answer changes (deck nav, jumping to a question, store
  // resets) sync the local UI to match.
  useEffect(() => {
    if (persistedAnswer) {
      setSelected(persistedAnswer);
      setRevealed(true);
    } else {
      setSelected(null);
      setRevealed(false);
    }
  }, [persistedAnswer]);

  // Skip the count fetch entirely when auth is disabled — keeps the request
  // log clean and avoids the 401 path.
  useEffect(() => {
    if (!authEnabled) return;
    let cancelled = false;
    fetch(`/api/comments/${encodeURIComponent(question.id)}`, {
      credentials: "include",
    })
      .then(async (r) => {
        if (!r.ok) return;
        const data = (await r.json()) as { comments?: { id: string }[] };
        if (!cancelled && Array.isArray(data.comments)) {
          setCommentCount(data.comments.length);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [question.id, authEnabled]);

  return (
    <article
      data-question-id={question.id}
      className="overflow-hidden rounded-2xl border border-clay-200 bg-white shadow-sm"
    >
      {/* ─── Tabs ─────────────────────────────────────────────── */}
      <div className="flex items-stretch border-b border-clay-200 bg-clay-50/60">
        <TabButton active={tab === "question"} onClick={() => setTab("question")}>
          <span aria-hidden>📝</span>
          <span>Question</span>
        </TabButton>
        <TabButton active={tab === "discuss"} onClick={() => setTab("discuss")}>
          <span aria-hidden>💬</span>
          <span>Discussion</span>
          {commentCount !== null && commentCount > 0 && (
            <span className="rounded-full bg-ember-100 px-2 py-0.5 text-[11px] font-mono text-ember-700">
              {commentCount}
            </span>
          )}
        </TabButton>
        <div className="ml-auto flex items-center gap-2 px-4 text-xs">
          <span className="font-mono text-clay-500">#{question.id}</span>
          <DomainBadge domainId={question.domain} />
        </div>
      </div>

      {/* ─── Body ─────────────────────────────────────────────── */}
      {tab === "question" ? (
        <div className="p-5 sm:p-6">
          <header className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                question.source === "pdf"
                  ? "border border-clay-200 bg-white text-clay-700"
                  : question.source === "cca-series"
                    ? "border border-ember-200 bg-ember-50 text-ember-700"
                    : "border border-clay-200 bg-clay-100 text-clay-700"
              }`}
            >
              {question.source === "pdf"
                ? `Sample Q${question.number}`
                : question.source === "cca-series"
                  ? "CCA Series"
                  : question.source === "video-practice"
                    ? "Video Practice"
                    : "Practice"}
            </span>
            <span className="font-mono text-[11px] text-clay-500">
              Task {question.taskId}
            </span>
            {showScenarioLink && (
              <Link
                href={`/scenarios/${question.scenario}`}
                className="ml-auto text-xs text-clay-500 hover:text-ember-700"
              >
                {question.scenario} →
              </Link>
            )}
          </header>

          {question.title && (
            <h3 className="mb-2 text-base font-semibold leading-snug text-clay-900">
              {question.title}
            </h3>
          )}

          <p className="mb-4 whitespace-pre-line text-[15px] leading-relaxed text-clay-800">
            {question.prompt}
          </p>

          <ol className="mb-4 space-y-2">
            {question.options.map((opt) => {
              const isCorrect = revealed && opt.label === question.correctAnswer;
              const isSelectedWrong =
                revealed && selected === opt.label && opt.label !== question.correctAnswer;
              const base =
                "flex gap-3 rounded-lg border p-3 text-sm text-left w-full transition-colors";
              let state = "border-clay-200 bg-white hover:bg-clay-50";
              if (isCorrect) state = "border-emerald-300 bg-emerald-50";
              else if (isSelectedWrong) state = "border-rose-300 bg-rose-50";
              else if (!revealed && selected === opt.label)
                state = "border-ember-300 bg-ember-50";

              return (
                <li key={opt.label}>
                  <button
                    type="button"
                    onClick={() => {
                      if (revealed) return;
                      unlock();
                      const isCorrectPick = opt.label === question.correctAnswer;
                      setSelected(opt.label);
                      setAnswer(opt.label);
                      setRevealed(true);
                      // Notify the sidebar to animate its current-question
                      // flower, and fire the audio cue with a tiny delay so
                      // it lines up with the visual.
                      emitAnswerEvent({
                        questionId: question.id,
                        correct: isCorrectPick,
                        at: performance.now(),
                      });
                      setTimeout(() => {
                        if (isCorrectPick) playBloom();
                        else playWilt();
                      }, 60);
                    }}
                    disabled={revealed}
                    className={`${base} ${state}`}
                  >
                    <span className="font-mono font-semibold text-clay-500">
                      {opt.label}.
                    </span>
                    <span className="flex-1 text-clay-800">{opt.text}</span>
                    {isCorrect && (
                      <span className="text-xs font-semibold text-emerald-700">
                        correct
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          {!revealed ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="rounded-full bg-clay-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ember-600"
              >
                Show answer (no pick)
              </button>
              <span className="font-mono text-[10px] uppercase tracking-wider text-clay-500">
                Pick an option to record your answer
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-clay-200 bg-clay-50 p-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-clay-600">
                  Explanation · Correct answer: {question.correctAnswer}
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-clay-800">
                  {question.explanation}
                </p>
              </div>

              {question.whyOthersWrong && question.whyOthersWrong.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                    Why the other answers are wrong
                  </p>
                  <ul className="space-y-1.5 text-sm leading-relaxed text-clay-800">
                    {question.whyOthersWrong.map((w) => (
                      <li key={w.label} className="flex gap-2">
                        <span className="font-mono font-semibold text-rose-700">
                          {w.label}.
                        </span>
                        <span>{w.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {question.examTip && (
                <div className="rounded-lg border border-ember-200 bg-ember-50 p-4">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ember-700">
                    Exam tip
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-clay-800">
                    {question.examTip}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <ConfidencePicker questionId={question.id} />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRevealed(false);
                      setSelected(null);
                      // Don't clear the persisted answer — Reset is just for
                      // re-attempting the visual UI. Use the review-panel
                      // "reset answers" button to wipe persistence.
                    }}
                    className="text-xs font-medium text-clay-600 hover:text-clay-900"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("discuss")}
                    className="rounded-full border border-clay-200 bg-white px-4 py-1.5 text-xs font-semibold text-clay-800 transition hover:border-ember-300 hover:text-ember-700"
                  >
                    💬 Discuss this question →
                  </button>
                </div>
              </div>
            </div>
          )}

          {!revealed && (
            <div className="mt-4">
              <ConfidencePicker questionId={question.id} />
            </div>
          )}

          <NotesPanel
            storageKey={`question-${question.id}`}
            label="My notes on this question"
            placeholder="Why did I pick that option? Which task does this remind me of?"
            compact
          />
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <Discussion
            questionId={question.id}
            onCountChange={setCommentCount}
          />
        </div>
      )}
    </article>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition ${
        active
          ? "tab-active text-ember-700"
          : "text-clay-600 hover:text-clay-900"
      }`}
    >
      {children}
    </button>
  );
}

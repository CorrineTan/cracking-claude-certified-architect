"use client";

import type { Confidence } from "@/lib/answer-store";
import { useQuestionState } from "@/lib/answer-store";

interface Props {
  questionId: string;
}

const OPTIONS: { value: Confidence; label: string; tone: string }[] = [
  { value: "solid", label: "Solid", tone: "data-[active=true]:bg-emerald-100 data-[active=true]:text-emerald-800 data-[active=true]:border-emerald-300" },
  { value: "shaky", label: "Shaky", tone: "data-[active=true]:bg-amber-100 data-[active=true]:text-amber-800 data-[active=true]:border-amber-300" },
  { value: "review", label: "Needs review", tone: "data-[active=true]:bg-rose-100 data-[active=true]:text-rose-800 data-[active=true]:border-rose-300" },
];

export function ConfidencePicker({ questionId }: Props) {
  const { confidence, setConfidence, hydrated } = useQuestionState(questionId);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-clay-500">
        Confidence
      </span>
      <div className="inline-flex overflow-hidden rounded-full border border-clay-200 bg-white text-xs">
        {OPTIONS.map((opt, i) => {
          const active = hydrated && confidence === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              data-active={active}
              onClick={() => setConfidence(active ? undefined : opt.value)}
              className={`px-3 py-1.5 text-clay-600 transition hover:bg-clay-50 ${
                i > 0 ? "border-l border-clay-200" : ""
              } ${opt.tone}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

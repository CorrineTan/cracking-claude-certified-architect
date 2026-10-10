"use client";

import { useState, useCallback } from "react";
import { QuestionDeck } from "@/components/QuestionDeck";
import { ReviewPanel } from "@/components/ReviewPanel";
import type { Question } from "@/lib/types";

interface Props {
  questions: Question[];
  storageKey: string;
}

export function ScenarioBoard({ questions, storageKey }: Props) {
  const [jumpId, setJumpId] = useState<string | null>(null);
  const handled = useCallback(() => setJumpId(null), []);

  return (
    <div className="space-y-6">
      <ReviewPanel questions={questions} onJump={(id) => setJumpId(id)} />
      <QuestionDeck
        questions={questions}
        storageKey={storageKey}
        jumpToId={jumpId}
        onJumpHandled={handled}
        emptyHint="No questions in this scenario yet."
      />
    </div>
  );
}

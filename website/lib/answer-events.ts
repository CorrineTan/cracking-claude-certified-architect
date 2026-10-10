/**
 * Lightweight pub-sub for "answer happened" events. The sidebar listens
 * and animates the current-question flower when a question is answered.
 *
 * Decoupled from the answer store so existing localStorage listeners
 * keep working, and the sidebar only learns about *fresh* answers
 * (not the bulk hydration on mount).
 */

export type AnswerEvent = {
  questionId: string;
  correct: boolean;
  /** ms — performance.now() */
  at: number;
};

type Listener = (e: AnswerEvent) => void;
const listeners = new Set<Listener>();

export function emitAnswerEvent(e: AnswerEvent) {
  listeners.forEach((l) => {
    try {
      l(e);
    } catch {
      // ignore
    }
  });
}

export function subscribeAnswerEvents(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

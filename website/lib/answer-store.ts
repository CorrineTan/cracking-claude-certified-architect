/**
 * Tiny localStorage helper for answers + confidence. Mirrors the storage
 * shape used by the legacy static site so notes/answers can be exported
 * between the two during the transition.
 *
 * Keys (matching the static site):
 *   ccaf_answers_v1     { [questionId]: "A" | "B" | "C" | "D" }
 *   ccaf_confidence_v1  { [questionId]: "solid" | "shaky" | "review" }
 *
 * Storage events are emitted via a tiny pub-sub so multiple components
 * (the question card, the review panel, the deck counter) update in lock-
 * step without prop drilling.
 */

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

const ANSWERS_KEY = "ccaf_answers_v1";
const CONFIDENCE_KEY = "ccaf_confidence_v1";

export type Letter = "A" | "B" | "C" | "D";
export type Confidence = "solid" | "shaky" | "review";

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function readMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(key) || "{}") as Record<string, T>;
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, value: Record<string, T>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota or denied — silently drop
  }
}

/* ─── answers ───────────────────────────────────────────── */

export function getAnswer(id: string): Letter | undefined {
  return readMap<Letter>(ANSWERS_KEY)[id];
}

export function setAnswer(id: string, letter: Letter) {
  const m = readMap<Letter>(ANSWERS_KEY);
  m[id] = letter;
  writeMap(ANSWERS_KEY, m);
  emit();
}

export function clearAnswer(id: string) {
  const m = readMap<Letter>(ANSWERS_KEY);
  delete m[id];
  writeMap(ANSWERS_KEY, m);
  emit();
}

export function clearAllAnswers() {
  writeMap<Letter>(ANSWERS_KEY, {});
  emit();
}

/* ─── confidence ────────────────────────────────────────── */

export function getConfidence(id: string): Confidence | undefined {
  return readMap<Confidence>(CONFIDENCE_KEY)[id];
}

export function setConfidence(id: string, value: Confidence | undefined) {
  const m = readMap<Confidence>(CONFIDENCE_KEY);
  if (value) m[id] = value;
  else delete m[id];
  writeMap(CONFIDENCE_KEY, m);
  emit();
}

/* ─── React hook ────────────────────────────────────────── */

interface AllStores {
  answers: Record<string, Letter>;
  confidence: Record<string, Confidence>;
}

function getSnapshot(): AllStores {
  return {
    answers: readMap<Letter>(ANSWERS_KEY),
    confidence: readMap<Confidence>(CONFIDENCE_KEY),
  };
}

// Avoid useSyncExternalStore "snapshot must be cached" warning by only
// returning a new object when something has actually changed.
let cachedSnap: AllStores | null = null;
let cachedJson = "";

function getStableSnapshot(): AllStores {
  const snap = getSnapshot();
  const json = JSON.stringify(snap);
  if (cachedSnap === null || json !== cachedJson) {
    cachedSnap = snap;
    cachedJson = json;
  }
  return cachedSnap;
}

// Stable SSR snapshot — must be the same reference every call to avoid
// React's "snapshot must be cached" warning + infinite re-render loop.
const SERVER_SNAPSHOT: AllStores = { answers: {}, confidence: {} };
function getServerSnapshot(): AllStores {
  return SERVER_SNAPSHOT;
}

export function useAnswerStore() {
  const snap = useSyncExternalStore(
    subscribe,
    getStableSnapshot,
    getServerSnapshot,
  );
  return snap;
}

/** Single-question convenience hook — the question card is the main caller. */
export function useQuestionState(id: string) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const { answers, confidence } = useAnswerStore();
  const answer = hydrated ? answers[id] : undefined;
  const conf = hydrated ? confidence[id] : undefined;
  const setA = useCallback((l: Letter) => setAnswer(id, l), [id]);
  const clearA = useCallback(() => clearAnswer(id), [id]);
  const setC = useCallback(
    (v: Confidence | undefined) => setConfidence(id, v),
    [id],
  );
  return { answer, confidence: conf, setAnswer: setA, clearAnswer: clearA, setConfidence: setC, hydrated };
}

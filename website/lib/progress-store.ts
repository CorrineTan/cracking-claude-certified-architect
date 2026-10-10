/**
 * Lesson progress store — Supabase-backed when configured, localStorage
 * fallback otherwise (so the UX still works in dev without setup).
 *
 *   - On mount, GET /api/progress and merge with localStorage
 *   - On tick, write both: optimistic localStorage + POST to server
 *   - On un-tick, same in reverse
 */

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

const LS_KEY = "lesson_progress_v1";

interface State {
  completed: Set<string>;
  loaded: boolean;
  /** True iff at least one server sync round-tripped successfully. */
  serverSynced: boolean;
}

let state: State = {
  completed: new Set(),
  loaded: false,
  serverSynced: false,
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(LS_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}
function writeLocal(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify([...set]));
  } catch {
    // ignore quota
  }
}

let bootstrapping: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  if (state.loaded) return;
  if (bootstrapping) return bootstrapping;
  bootstrapping = (async () => {
    const localList = readLocal();
    const merged = new Set<string>(localList);
    try {
      const res = await fetch("/api/progress", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { completed?: string[] };
        for (const id of data.completed ?? []) merged.add(id);
        state = { completed: merged, loaded: true, serverSynced: true };
      } else {
        // 401 (signed out) or 503 (no Supabase) — keep local only
        state = { completed: merged, loaded: true, serverSynced: false };
      }
    } catch {
      state = { completed: merged, loaded: true, serverSynced: false };
    }
    writeLocal(state.completed);
    emit();
  })();
  return bootstrapping;
}

async function syncServerTick(lessonId: string, completed: boolean) {
  try {
    await fetch("/api/progress", {
      method: completed ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lessonId }),
    });
  } catch {
    // network failure — local state already updated, will retry next bootstrap
  }
}

function tick(lessonId: string) {
  if (state.completed.has(lessonId)) return;
  state = { ...state, completed: new Set([...state.completed, lessonId]) };
  writeLocal(state.completed);
  emit();
  void syncServerTick(lessonId, true);
}

function untick(lessonId: string) {
  if (!state.completed.has(lessonId)) return;
  const next = new Set(state.completed);
  next.delete(lessonId);
  state = { ...state, completed: next };
  writeLocal(state.completed);
  emit();
  void syncServerTick(lessonId, false);
}

function getSnapshot(): State {
  return state;
}
// Stable empty snapshot for SSR — must be the *same* reference every call,
// otherwise React detects a "changing snapshot" and bails out.
const SERVER_SNAPSHOT: State = {
  completed: new Set(),
  loaded: false,
  serverSynced: false,
};
function getServerSnapshot(): State {
  return SERVER_SNAPSHOT;
}

export function useProgress() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    void bootstrap();
  }, []);
  const isCompleted = useCallback(
    (id: string) => snap.completed.has(id),
    [snap.completed],
  );
  return {
    completed: snap.completed,
    isCompleted,
    tick,
    untick,
    loaded: snap.loaded,
    serverSynced: snap.serverSynced,
  };
}

/** A tiny hook for the home/learn pages that just want the count. */
export function useProgressCount(): { count: number; loaded: boolean } {
  const [, setRev] = useState(0);
  useEffect(() => {
    void bootstrap();
    return subscribe(() => setRev((r) => r + 1));
  }, []);
  return { count: state.completed.size, loaded: state.loaded };
}

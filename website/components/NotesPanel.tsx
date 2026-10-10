"use client";

/**
 * NotesPanel — localStorage-backed textarea.
 * Key convention: all keys are prefixed `notes:` in storage.
 * The `storageKey` prop is the suffix, e.g.:
 *   task-1.1, scenario-customer-support, exercise-multi-tool-escalation,
 *   question-pdf-1, question-gen-cs-1, plan-day-1
 */

import { useEffect, useRef, useState } from "react";

interface Props {
  storageKey: string;
  label?: string;
  placeholder?: string;
  compact?: boolean;
}

export function NotesPanel({
  storageKey,
  label = "My notes",
  placeholder = "Write anything — concepts to revisit, pitfalls you hit, your own rephrasings…",
  compact = false,
}: Props) {
  const fullKey = `notes:${storageKey}`;
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(fullKey);
      if (existing !== null) setValue(existing);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [fullKey]);

  useEffect(() => {
    if (!loaded) return;
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        if (value) {
          window.localStorage.setItem(fullKey, value);
          window.localStorage.setItem(`notes-meta:${storageKey}`, String(Date.now()));
        } else {
          window.localStorage.removeItem(fullKey);
          window.localStorage.removeItem(`notes-meta:${storageKey}`);
        }
        setStatus("saved");
      } catch {
        // ignore
      }
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, fullKey, storageKey, loaded]);

  const charCount = value.length;

  return (
    <div className={`rounded-lg border border-ink-200 bg-ink-50/60 p-3 ${compact ? "" : "mt-4"}`}>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          {label}
        </label>
        <div className="flex items-center gap-2 text-[11px] text-ink-500">
          <span>{charCount} chars</span>
          {status === "saving" && <span>· saving…</span>}
          {status === "saved" && <span>· saved</span>}
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="text-ink-500 hover:text-rose-600"
            >
              clear
            </button>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        className="w-full resize-y rounded-md border border-ink-200 bg-white px-3 py-2 font-sans text-sm leading-relaxed text-ink-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}

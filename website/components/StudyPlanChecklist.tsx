"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PlanDay } from "@/lib/types";

const KEY_PREFIX = "plan:";

function storageKey(itemId: string) {
  return `${KEY_PREFIX}${itemId}`;
}

export function StudyPlanChecklist({ day }: { day: PlanDay }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const item of day.items) {
      try {
        initial[item.id] = window.localStorage.getItem(storageKey(item.id)) === "1";
      } catch {
        initial[item.id] = false;
      }
    }
    setChecked(initial);
    setLoaded(true);
  }, [day]);

  const toggle = (id: string) => {
    const next = !checked[id];
    setChecked((s) => ({ ...s, [id]: next }));
    try {
      if (next) window.localStorage.setItem(storageKey(id), "1");
      else window.localStorage.removeItem(storageKey(id));
    } catch {
      // ignore
    }
  };

  const doneCount = loaded ? Object.values(checked).filter(Boolean).length : 0;
  const total = day.items.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-ink-600">
          {loaded ? `${doneCount} / ${total} done` : `${total} items`}
        </span>
        <span className="font-mono text-ink-500">{day.totalHours}h</span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-2">
        {day.items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <li
              key={item.id}
              className={`flex gap-3 rounded-lg border p-3 transition-colors ${
                isChecked
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-ink-200 bg-white hover:bg-ink-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(item.id)}
                className="mt-1 size-4 shrink-0 cursor-pointer accent-emerald-600"
                aria-label={item.label}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm leading-relaxed ${
                    isChecked ? "text-ink-500 line-through" : "text-ink-800"
                  }`}
                >
                  {item.label}
                </div>
                {item.hint && (
                  <div className="mt-0.5 text-xs text-ink-500">{item.hint}</div>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-500">
                  {item.hours != null && (
                    <span className="font-mono">~{item.hours}h</span>
                  )}
                  {item.href && (
                    <Link
                      href={item.href}
                      className="font-medium text-indigo-700 hover:underline"
                    >
                      Go →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PlanProgressBanner() {
  const [stats, setStats] = useState<{
    total: number;
    done: number;
    hoursDone: number;
    hoursTotal: number;
  } | null>(null);

  useEffect(() => {
    // Dynamically import to avoid bundling on server.
    import("@/lib/studyPlan").then(({ STUDY_PLAN }) => {
      let total = 0;
      let done = 0;
      let hoursTotal = 0;
      let hoursDone = 0;
      for (const d of STUDY_PLAN) {
        hoursTotal += d.totalHours;
        for (const item of d.items) {
          total++;
          const isDone = (() => {
            try {
              return window.localStorage.getItem(storageKey(item.id)) === "1";
            } catch {
              return false;
            }
          })();
          if (isDone) {
            done++;
            hoursDone += item.hours ?? 0;
          }
        }
      }
      setStats({ total, done, hoursDone, hoursTotal });
    });
  }, []);

  if (!stats) return null;
  const pct = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="mb-2 flex items-baseline justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Overall progress
          </div>
          <div className="text-lg font-semibold text-ink-900">
            {stats.done} / {stats.total} items · {pct}%
          </div>
        </div>
        <div className="text-right text-xs text-ink-500">
          ~{stats.hoursDone.toFixed(1)}h done ·{" "}
          {(stats.hoursTotal - stats.hoursDone).toFixed(1)}h to go
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

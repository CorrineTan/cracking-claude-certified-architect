"use client";

/**
 * GitHub-style heatmap. 5 rows (one per domain) × max-tasks-per-domain
 * columns. Color depth = ticked status + confidence:
 *   - untouched           → faint clay
 *   - ticked, no conf     → ember-200
 *   - ticked + shaky      → ember-400
 *   - ticked + solid      → ember-700
 *   - solid no tick       → clay border, ember dot
 */

import Link from "next/link";
import { LESSONS } from "@/lib/lessons";
import { DOMAINS } from "@/lib/domains";
import { useProgress } from "@/lib/progress-store";
import { useAnswerStore } from "@/lib/answer-store";

export function ProgressHeatmap() {
  const { isCompleted } = useProgress();
  const { confidence } = useAnswerStore();

  const maxLessonsInDomain = Math.max(
    ...DOMAINS.map((d) => LESSONS.filter((l) => l.domainId === d.id).length),
  );

  return (
    <div className="rounded-2xl border border-clay-200 bg-white p-5 sm:p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-clay-500">
            Heatmap
          </p>
          <p className="mt-1 text-sm font-semibold text-clay-900">
            All {LESSONS.length} lessons at a glance
          </p>
        </div>
        <Legend />
      </header>

      <div className="space-y-2">
        {DOMAINS.map((d) => {
          const lessons = LESSONS.filter((l) => l.domainId === d.id);
          return (
            <div key={d.id} className="flex items-center gap-3">
              <span className="w-7 shrink-0 font-mono text-[10px] tabular-nums text-clay-500">
                D{d.number}
              </span>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {lessons.map((l) => {
                  const ticked = isCompleted(l.id);
                  const conf = confidence[l.id];
                  let cls =
                    "border-clay-200 bg-clay-50 text-clay-400 hover:border-ember-300";
                  if (ticked && conf === "solid")
                    cls = "border-ember-700 bg-ember-700 text-white";
                  else if (ticked && conf === "shaky")
                    cls = "border-amber-400 bg-amber-200 text-amber-900";
                  else if (ticked)
                    cls = "border-ember-300 bg-ember-200 text-ember-800";
                  else if (conf === "solid")
                    cls =
                      "border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
                  else if (conf === "review")
                    cls =
                      "border-rose-300 bg-rose-50 text-rose-700";

                  return (
                    <Link
                      key={l.id}
                      href={`/learn/${l.id}`}
                      className={`relative flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 font-mono text-[10px] transition ${cls}`}
                      title={`${l.id} · ${l.title}${ticked ? " · ✓ done" : ""}${conf ? ` · ${conf}` : ""}`}
                    >
                      {l.id}
                    </Link>
                  );
                })}
                {/* Pad to align rows */}
                {Array.from({ length: maxLessonsInDomain - lessons.length }).map(
                  (_, i) => (
                    <span
                      key={`pad-${d.id}-${i}`}
                      className="h-7 min-w-7"
                      aria-hidden
                    />
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="hidden items-center gap-3 text-[10px] font-mono text-clay-500 sm:flex">
      <div className="flex items-center gap-1">
        <span className="h-3 w-3 rounded-sm bg-clay-50 ring-1 ring-clay-200" />
        none
      </div>
      <div className="flex items-center gap-1">
        <span className="h-3 w-3 rounded-sm bg-ember-200" />
        done
      </div>
      <div className="flex items-center gap-1">
        <span className="h-3 w-3 rounded-sm bg-amber-200" />
        shaky
      </div>
      <div className="flex items-center gap-1">
        <span className="h-3 w-3 rounded-sm bg-ember-700" />
        solid
      </div>
    </div>
  );
}

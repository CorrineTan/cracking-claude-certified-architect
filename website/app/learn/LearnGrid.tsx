"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Check, Clock, Sparkles } from "lucide-react";
import { LESSONS } from "@/lib/lessons";
import { DOMAINS } from "@/lib/domains";
import { useProgress } from "@/lib/progress-store";
import { useAuthEnabled } from "@/components/SessionProvider";
import { ProgressHeatmap } from "@/components/ProgressHeatmap";

const ACCENTS: Record<string, { ring: string; bg: string; text: string }> = {
  indigo:  { ring: "ring-indigo-300",  bg: "bg-indigo-50",  text: "text-indigo-700" },
  emerald: { ring: "ring-emerald-300", bg: "bg-emerald-50", text: "text-emerald-700" },
  amber:   { ring: "ring-amber-300",   bg: "bg-amber-50",   text: "text-amber-700" },
  rose:    { ring: "ring-rose-300",    bg: "bg-rose-50",    text: "text-rose-700" },
  sky:     { ring: "ring-sky-300",     bg: "bg-sky-50",     text: "text-sky-700" },
};

export function LearnGrid() {
  const authEnabled = useAuthEnabled();
  const { isCompleted, completed, loaded, serverSynced } = useProgress();

  const next = useMemo(() => {
    return LESSONS.find((l) => !completed.has(l.id));
  }, [completed]);

  const total = LESSONS.length;
  const done = completed.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Resume + progress card */}
      <section className="rounded-2xl border border-clay-200 bg-gradient-to-br from-ember-50 via-clay-50 to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember-700">
              Your progress
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-clay-900">
              <span className="tabular-nums">{loaded ? done : "—"}</span>
              <span className="text-clay-400"> / {total}</span>{" "}
              <span className="text-base font-normal text-clay-500">
                lessons completed
              </span>
            </h2>
            <p className="mt-1 text-sm text-clay-600">
              {done === 0
                ? "Pick any tile below to start. Tick it when you've got it."
                : done === total
                  ? "You've ticked everything. Drill the practice deck or revisit your shaky topics."
                  : `${pct}% there. Keep stacking small wins — no daily quota, no deadlines.`}
            </p>
          </div>
          {next ? (
            <Link
              href={`/learn/${next.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-clay-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ember-600"
            >
              <Sparkles className="h-4 w-4" />
              {done === 0 ? "Start" : "Resume"} → {next.id} {next.title.split(" ").slice(0, 4).join(" ")}…
            </Link>
          ) : (
            <Link
              href="/questions"
              className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white px-5 py-2.5 text-sm font-semibold text-clay-800 transition hover:border-ember-300 hover:text-ember-700"
            >
              All done · drill questions →
            </Link>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-clay-200">
          <div
            className="h-full bg-gradient-to-r from-ember-400 to-ember-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Sync hint */}
        <p className="mt-3 text-xs text-clay-500">
          {!authEnabled
            ? "Sign-in disabled — progress lives in this browser only."
            : !loaded
              ? "Loading progress…"
              : serverSynced
                ? "✓ Synced across devices"
                : "Local only — sign in & set up Supabase to sync. See SUPABASE_SETUP.md"}
        </p>
      </section>

      {/* Heatmap — all 30 lessons at a glance, color-coded by tick + confidence */}
      <ProgressHeatmap />

      {/* Domain grids */}
      {DOMAINS.map((d) => {
        const domainLessons = LESSONS.filter((l) => l.domainId === d.id);
        const domainDone = domainLessons.filter((l) => isCompleted(l.id)).length;
        const tone = ACCENTS[d.accent] ?? ACCENTS.indigo;
        return (
          <section key={d.id}>
            <header className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <p className={`font-mono text-[10px] uppercase tracking-[0.2em] ${tone.text}`}>
                  Domain {d.number} · {d.weight}% of exam
                </p>
                <h3 className="mt-1 text-lg font-semibold text-clay-900">
                  {d.title}
                </h3>
              </div>
              <span className="font-mono text-xs text-clay-500 tabular-nums">
                {domainDone} / {domainLessons.length}
              </span>
            </header>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {domainLessons.map((l) => {
                const done = isCompleted(l.id);
                return (
                  <Link
                    key={l.id}
                    href={`/learn/${l.id}`}
                    className={`group relative rounded-xl border bg-white p-4 transition hover:shadow-sm ${
                      done
                        ? `border-ember-300 ring-1 ${tone.ring}/40 ${tone.bg}`
                        : "border-clay-200 hover:border-ember-300"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[10px] tabular-nums text-clay-500">
                        {l.id}
                      </span>
                      {done ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ember-500 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-mono text-[10px] text-clay-500">
                          <Clock className="h-3 w-3" />
                          {l.minutes}m
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium leading-snug ${done ? "text-clay-700" : "text-clay-900"}`}>
                      {l.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { DOMAINS } from "@/lib/domains";
import { SCENARIOS } from "@/lib/scenarios";
import { EXERCISES } from "@/lib/exercises";
import { QUESTIONS } from "@/lib/questions";
import { STUDY_PLAN } from "@/lib/studyPlan";

type Group = "Task" | "Scenario" | "Exercise" | "Question" | "Study plan" | "Other";

interface NoteEntry {
  key: string;       // suffix after "notes:"
  fullKey: string;   // "notes:<suffix>"
  value: string;
  updatedAt: number | null;
  group: Group;
  title: string;
  href?: string;
}

function resolveEntry(key: string): Pick<NoteEntry, "group" | "title" | "href"> {
  if (key.startsWith("task-")) {
    const id = key.slice("task-".length);
    const domain = DOMAINS.find((d) => d.tasks.some((t) => t.id === id));
    const task = domain?.tasks.find((t) => t.id === id);
    return {
      group: "Task",
      title: task ? `Task ${id} — ${task.title}` : `Task ${id}`,
      href: domain ? `/domains/${domain.slug}#task-${id}` : undefined,
    };
  }
  if (key.startsWith("scenario-")) {
    const slug = key.slice("scenario-".length);
    const s = SCENARIOS.find((x) => x.slug === slug);
    return {
      group: "Scenario",
      title: s ? `Scenario ${s.number} — ${s.title}` : `Scenario ${slug}`,
      href: `/scenarios/${slug}`,
    };
  }
  if (key.startsWith("exercise-")) {
    const slug = key.slice("exercise-".length);
    const e = EXERCISES.find((x) => x.slug === slug);
    return {
      group: "Exercise",
      title: e ? `Exercise ${e.number} — ${e.title}` : `Exercise ${slug}`,
      href: `/exercises/${slug}`,
    };
  }
  if (key.startsWith("question-")) {
    const id = key.slice("question-".length);
    const q = QUESTIONS.find((x) => x.id === id);
    if (q) {
      return {
        group: "Question",
        title: `Question ${id} — ${q.prompt.slice(0, 80)}${q.prompt.length > 80 ? "…" : ""}`,
        href: `/questions/${q.scenario}`,
      };
    }
    return { group: "Question", title: `Question ${id}` };
  }
  if (key.startsWith("plan-day-")) {
    const n = Number(key.slice("plan-day-".length));
    const day = STUDY_PLAN.find((d) => d.day === n);
    return {
      group: "Study plan",
      title: day ? `Day ${n} — ${day.title}` : `Day ${n}`,
      href: "/study-plan",
    };
  }
  return { group: "Other", title: key };
}

function collectNotes(): NoteEntry[] {
  const out: NoteEntry[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k || !k.startsWith("notes:")) continue;
      const suffix = k.slice("notes:".length);
      const value = window.localStorage.getItem(k) ?? "";
      if (!value) continue;
      const metaRaw = window.localStorage.getItem(`notes-meta:${suffix}`);
      const updatedAt = metaRaw ? Number(metaRaw) : null;
      const meta = resolveEntry(suffix);
      out.push({ key: suffix, fullKey: k, value, updatedAt, ...meta });
    }
  } catch {
    // ignore
  }
  out.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return out;
}

function collectPlanChecks(): Record<string, boolean> {
  const checks: Record<string, boolean> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k || !k.startsWith("plan:")) continue;
      checks[k.slice("plan:".length)] = window.localStorage.getItem(k) === "1";
    }
  } catch {
    // ignore
  }
  return checks;
}

const GROUP_ORDER: Group[] = ["Task", "Scenario", "Exercise", "Question", "Study plan", "Other"];

export default function NotesPage() {
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    setEntries(collectNotes());
    setChecks(collectPlanChecks());
  };

  useEffect(() => {
    refresh();
    setLoaded(true);
  }, []);

  const grouped: Record<Group, NoteEntry[]> = {
    Task: [],
    Scenario: [],
    Exercise: [],
    Question: [],
    "Study plan": [],
    Other: [],
  };
  for (const e of entries) grouped[e.group].push(e);

  const totalNotes = entries.length;
  const totalChars = entries.reduce((s, e) => s + e.value.length, 0);
  const totalChecked = Object.values(checks).filter(Boolean).length;

  const handleExport = () => {
    const notes: Record<string, string> = {};
    const meta: Record<string, number> = {};
    for (const e of entries) {
      notes[e.key] = e.value;
      if (e.updatedAt) meta[e.key] = e.updatedAt;
    }
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            notes,
            meta,
            plan: checks,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claude-architect-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.notes && typeof parsed.notes === "object") {
        for (const [k, v] of Object.entries(parsed.notes)) {
          if (typeof v === "string" && v.length > 0) {
            window.localStorage.setItem(`notes:${k}`, v);
          }
        }
      }
      if (parsed.meta && typeof parsed.meta === "object") {
        for (const [k, v] of Object.entries(parsed.meta)) {
          if (typeof v === "number") {
            window.localStorage.setItem(`notes-meta:${k}`, String(v));
          }
        }
      }
      if (parsed.plan && typeof parsed.plan === "object") {
        for (const [k, v] of Object.entries(parsed.plan)) {
          if (v === true) window.localStorage.setItem(`plan:${k}`, "1");
        }
      }
      setImportMsg("Imported successfully.");
      refresh();
    } catch (err) {
      setImportMsg(`Import failed: ${err instanceof Error ? err.message : "invalid file"}`);
    }
  };

  const handleClearAll = () => {
    if (
      !window.confirm(
        "Delete every note and every checklist tick on this device? This cannot be undone (export first if unsure).",
      )
    )
      return;
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (!k) continue;
        if (
          k.startsWith("notes:") ||
          k.startsWith("notes-meta:") ||
          k.startsWith("plan:")
        ) {
          toRemove.push(k);
        }
      }
      for (const k of toRemove) window.localStorage.removeItem(k);
    } catch {
      // ignore
    }
    refresh();
  };

  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "My notes" }]}
        title="My notes"
        description="Every textarea you've filled in, aggregated here. Notes live only in this browser — export them if you want a backup or want to move devices."
      />
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-5">
          <div className="flex flex-wrap items-baseline gap-4">
            <Stat label="Notes written" value={loaded ? String(totalNotes) : "…"} />
            <Stat label="Characters" value={loaded ? totalChars.toLocaleString() : "…"} />
            <Stat
              label="Plan items checked"
              value={loaded ? String(totalChecked) : "…"}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={!loaded}
              className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-50"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-ink-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-800 hover:bg-ink-50"
            >
              Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImport(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Clear all
            </button>
          </div>
        </section>

        {importMsg && (
          <div className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-800">
            {importMsg}
          </div>
        )}

        {loaded && totalNotes === 0 && (
          <section className="rounded-xl border border-dashed border-ink-300 bg-white p-10 text-center">
            <div className="text-sm font-semibold text-ink-800">No notes yet</div>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-600">
              As you work through domain task statements, scenarios, exercises, and
              practice questions, you&apos;ll find a &ldquo;My notes&rdquo; textarea
              on each. Anything you type there shows up here automatically.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                href="/study-plan"
                className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700"
              >
                Open study plan →
              </Link>
              <Link
                href="/domains/agentic-architecture"
                className="rounded-md border border-ink-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-800 hover:bg-ink-50"
              >
                Start Domain 1
              </Link>
            </div>
          </section>
        )}

        {GROUP_ORDER.map((g) =>
          grouped[g].length === 0 ? null : (
            <section key={g}>
              <h2 className="mb-3 text-lg font-semibold text-ink-900">
                {g} <span className="text-sm font-normal text-ink-500">· {grouped[g].length}</span>
              </h2>
              <ul className="space-y-3">
                {grouped[g].map((e) => (
                  <li
                    key={e.fullKey}
                    className="rounded-xl border border-ink-200 bg-white p-4"
                  >
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
                      {e.href ? (
                        <Link
                          href={e.href}
                          className="text-sm font-semibold text-indigo-700 hover:underline"
                        >
                          {e.title}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-ink-800">
                          {e.title}
                        </span>
                      )}
                      {e.updatedAt && (
                        <span className="ml-auto font-mono text-[11px] text-ink-500">
                          {new Date(e.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-700">
                      {e.value}
                    </pre>
                  </li>
                ))}
              </ul>
            </section>
          ),
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold text-ink-900">{value}</div>
    </div>
  );
}

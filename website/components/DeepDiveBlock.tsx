import Link from "next/link";
import type { TaskDeepDive, ScenarioDeepDive, DomainAccent } from "@/lib/types";

const accentDot: Record<DomainAccent, string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
};

export function TaskDeepDiveBlock({
  deepDive,
  accent,
  collapsible = true,
}: {
  deepDive: TaskDeepDive;
  accent: DomainAccent;
  collapsible?: boolean;
}) {
  const inner = (
    <div className="space-y-4 rounded-lg border border-ink-200 bg-white p-5">
      <Section title="Why it matters" accent={accent}>
        <p className="leading-relaxed text-ink-700">{deepDive.whyItMatters}</p>
      </Section>
      <Section title="Pitfalls to avoid" accent={accent}>
        <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-ink-700">
          {deepDive.pitfalls.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </Section>
      <Section title="Concrete example" accent={accent}>
        <p className="leading-relaxed text-ink-700">{deepDive.example}</p>
      </Section>
    </div>
  );

  if (!collapsible) return inner;

  return (
    <details className="group rounded-lg border border-ink-200 bg-ink-50/50 open:bg-white">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-ink-800 hover:text-ink-900">
        <span className={`size-2 rounded-full ${accentDot[accent]}`} />
        <span>Deep dive — why it matters, pitfalls, example</span>
        <span className="ml-auto text-xs text-ink-500 group-open:hidden">Expand ↓</span>
        <span className="ml-auto hidden text-xs text-ink-500 group-open:inline">Collapse ↑</span>
      </summary>
      <div className="px-4 pb-4">{inner}</div>
    </details>
  );
}

export function ScenarioDeepDiveBlock({
  deepDive,
  accent = "indigo",
}: {
  deepDive: ScenarioDeepDive;
  accent?: DomainAccent;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-ink-200 bg-white p-6">
      <Section title="How this scenario is tested" accent={accent}>
        <p className="leading-relaxed text-ink-700">{deepDive.howItsTested}</p>
      </Section>
      <Section title="Key tasks" accent={accent}>
        <ul className="space-y-2 text-sm leading-relaxed text-ink-700">
          {deepDive.keyTasks.map((kt) => {
            const domainNum = kt.taskId.split(".")[0];
            const domainSlug =
              domainNum === "1"
                ? "agentic-architecture"
                : domainNum === "2"
                  ? "tool-design-mcp"
                  : domainNum === "3"
                    ? "claude-code-workflows"
                    : domainNum === "4"
                      ? "prompt-engineering"
                      : "context-reliability";
            return (
              <li key={kt.taskId} className="flex gap-3">
                <Link
                  href={`/domains/${domainSlug}#task-${kt.taskId}`}
                  className="shrink-0 font-mono text-xs font-semibold text-indigo-700 hover:underline"
                >
                  Task {kt.taskId}
                </Link>
                <span className="text-ink-700">{kt.why}</span>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: DomainAccent;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${accentDot[accent]}`} />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-600">
          {title}
        </h4>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

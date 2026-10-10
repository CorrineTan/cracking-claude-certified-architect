import type { TaskStatement as TaskStatementType, DomainAccent } from "@/lib/types";
import { CalloutBox } from "./CalloutBox";
import { TaskDeepDiveBlock } from "./DeepDiveBlock";
import { NotesPanel } from "./NotesPanel";
import { VisualsStrip } from "./VisualsStrip";

interface Props {
  task: TaskStatementType;
  accent: DomainAccent;
}

export function TaskStatement({ task, accent }: Props) {
  const visuals = task.deepDive?.visuals;
  return (
    <section id={`task-${task.id}`} className="rounded-xl border border-ink-200 bg-white p-5">
      <header className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-sm font-semibold text-ink-500">Task {task.id}</span>
        <h3 className="text-lg font-semibold text-ink-900">{task.title}</h3>
      </header>

      {visuals && visuals.length > 0 ? (
        <>
          <div className="mb-5">
            <VisualsStrip visuals={visuals} cacheKey={task.id} />
          </div>
          <details className="mb-4 rounded-lg border border-ink-200 bg-ink-50/40 px-4 py-2 text-sm">
            <summary className="cursor-pointer select-none py-1 text-xs font-semibold uppercase tracking-wide text-ink-600">
              Official exam-guide wording
            </summary>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <CalloutBox title="Knowledge of" tone={accent}>
                <ul className="list-disc space-y-2 pl-4">
                  {task.knowledge.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </CalloutBox>
              <CalloutBox title="Skills in" tone={accent}>
                <ul className="list-disc space-y-2 pl-4">
                  {task.skills.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </CalloutBox>
            </div>
          </details>
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <CalloutBox title="Knowledge of" tone={accent}>
            <ul className="list-disc space-y-2 pl-4">
              {task.knowledge.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </CalloutBox>
          <CalloutBox title="Skills in" tone={accent}>
            <ul className="list-disc space-y-2 pl-4">
              {task.skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </CalloutBox>
        </div>
      )}

      {task.deepDive && (
        <div className="mt-4">
          <TaskDeepDiveBlock deepDive={task.deepDive} accent={accent} />
        </div>
      )}
      <NotesPanel
        storageKey={`task-${task.id}`}
        label={`Notes for Task ${task.id}`}
        placeholder="Your own summary, links to the Exercise code, questions to revisit…"
      />
    </section>
  );
}

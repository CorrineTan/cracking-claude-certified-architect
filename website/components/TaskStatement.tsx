import type { TaskStatement as TaskStatementType, DomainAccent } from "@/lib/types";
import { CalloutBox } from "./CalloutBox";

interface Props {
  task: TaskStatementType;
  accent: DomainAccent;
}

export function TaskStatement({ task, accent }: Props) {
  return (
    <section id={`task-${task.id}`} className="rounded-xl border border-ink-200 bg-white p-5">
      <header className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-sm font-semibold text-ink-500">Task {task.id}</span>
        <h3 className="text-lg font-semibold text-ink-900">{task.title}</h3>
      </header>
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
    </section>
  );
}

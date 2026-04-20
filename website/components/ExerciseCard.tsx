import Link from "next/link";
import type { Exercise } from "@/lib/types";
import { DomainBadge } from "./DomainBadge";

interface Props {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: Props) {
  const statusLabel = exercise.status === "complete" ? "In repo" : "Not yet built";
  const statusClasses =
    exercise.status === "complete"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-ink-100 text-ink-600 border-ink-200";

  return (
    <Link
      href={`/exercises/${exercise.slug}`}
      className="group block rounded-xl border border-ink-200 bg-white p-5 transition-all hover:border-ink-300 hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-ink-500">
          Exercise {exercise.number}
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClasses}`}>
          {statusLabel}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-ink-900 group-hover:text-indigo-700">
        {exercise.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-ink-600">
        {exercise.objective}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {exercise.domains.map((d) => (
          <DomainBadge key={d} domainId={d} asLink={false} />
        ))}
      </div>
    </Link>
  );
}

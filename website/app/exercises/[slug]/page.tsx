import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { DomainBadge } from "@/components/DomainBadge";
import { PrevNext } from "@/components/PrevNext";
import { EXERCISES } from "@/lib/exercises";
import type { ExerciseSlug } from "@/lib/types";

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: e.slug }));
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exercise = EXERCISES.find((e) => e.slug === slug as ExerciseSlug);
  if (!exercise) notFound();

  const idx = EXERCISES.findIndex((e) => e.slug === exercise.slug);
  const prev = idx > 0 ? EXERCISES[idx - 1] : undefined;
  const next = idx < EXERCISES.length - 1 ? EXERCISES[idx + 1] : undefined;

  const statusBadge =
    exercise.status === "complete" ? (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        Code in repo
      </span>
    ) : (
      <span className="rounded-full border border-ink-200 bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600">
        Not yet built
      </span>
    );

  return (
    <div>
      <TopBar
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Exercises", href: "/exercises" },
          { label: exercise.title },
        ]}
        title={`Exercise ${exercise.number}: ${exercise.title}`}
        description={exercise.objective}
        right={statusBadge}
      />
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <section className="rounded-xl border border-ink-200 bg-white p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Primary domains
            </span>
            {exercise.domains.map((d) => (
              <DomainBadge key={d} domainId={d} showWeight />
            ))}
          </div>
          {exercise.localPath && (
            <div className="text-sm">
              <span className="text-ink-500">Local path: </span>
              <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[13px] text-ink-800">
                {exercise.localPath}
              </code>
            </div>
          )}
          {exercise.summary && (
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{exercise.summary}</p>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-ink-900">Steps</h2>
          <ol className="space-y-3">
            {exercise.steps.map((step, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-xl border border-ink-200 bg-white p-5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-mono text-sm font-semibold text-indigo-700">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-ink-700">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <PrevNext
          prev={
            prev
              ? {
                  href: `/exercises/${prev.slug}`,
                  sublabel: `Exercise ${prev.number}`,
                  label: prev.title,
                }
              : undefined
          }
          next={
            next
              ? {
                  href: `/exercises/${next.slug}`,
                  sublabel: `Exercise ${next.number}`,
                  label: next.title,
                }
              : { href: "/recommendations", label: "Exam preparation recommendations" }
          }
        />
      </div>
    </div>
  );
}

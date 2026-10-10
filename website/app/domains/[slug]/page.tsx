import { notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { TaskStatement } from "@/components/TaskStatement";
import { WeightBar } from "@/components/WeightBar";
import { QuestionCard } from "@/components/QuestionCard";
import { PrevNext } from "@/components/PrevNext";
import { DomainSkillTree } from "@/components/DomainSkillTree";
import { DOMAINS, getDomain } from "@/lib/domains";
import { getQuestionsForDomain } from "@/lib/questions";
import type { DomainSlug } from "@/lib/types";

export function generateStaticParams() {
  return DOMAINS.map((d) => ({ slug: d.slug }));
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const domain = getDomain(slug as DomainSlug);
  if (!domain) notFound();

  const questions = getQuestionsForDomain(domain.id);
  const idx = DOMAINS.findIndex((d) => d.slug === domain.slug);
  const prev = idx > 0 ? DOMAINS[idx - 1] : undefined;
  const next = idx < DOMAINS.length - 1 ? DOMAINS[idx + 1] : undefined;

  return (
    <div>
      <TopBar
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Domains", href: "/domains" },
          { label: `${domain.number}. ${domain.title}` },
        ]}
        title={`Domain ${domain.number}: ${domain.title}`}
        description={domain.summary}
        right={
          <div className="min-w-[160px]">
            <WeightBar weight={domain.weight} accent={domain.accent} label="Weight" />
          </div>
        }
      />
      <div className="space-y-10 px-6 py-8 lg:px-10">
        {/* Skill tree — hex layout with progress */}
        <DomainSkillTree domain={domain} />

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">Task statements</h2>
            <span className="text-xs text-ink-500">
              Jump:{" "}
              {domain.tasks.map((t, i) => (
                <span key={t.id}>
                  <a
                    href={`#task-${t.id}`}
                    className="font-mono text-indigo-700 hover:underline"
                  >
                    {t.id}
                  </a>
                  {i < domain.tasks.length - 1 && <span className="text-ink-300"> · </span>}
                </span>
              ))}
            </span>
          </div>
          <div className="space-y-4">
            {domain.tasks.map((t) => (
              <TaskStatement key={t.id} task={t} accent={domain.accent} />
            ))}
          </div>
        </section>

        {questions.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-ink-900">
              Practice questions · {questions.length}
            </h2>
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionCard key={q.id} question={q} showScenarioLink />
              ))}
            </div>
          </section>
        )}

        <PrevNext
          prev={
            prev
              ? {
                  href: `/domains/${prev.slug}`,
                  sublabel: `Domain ${prev.number}`,
                  label: prev.title,
                }
              : undefined
          }
          next={
            next
              ? {
                  href: `/domains/${next.slug}`,
                  sublabel: `Domain ${next.number}`,
                  label: next.title,
                }
              : { href: "/scenarios", label: "Scenarios" }
          }
        />
      </div>
    </div>
  );
}

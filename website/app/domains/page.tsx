import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { WeightBar } from "@/components/WeightBar";
import { DOMAINS } from "@/lib/domains";

export default function DomainsIndexPage() {
  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "Domains" }]}
        title="Exam domains"
        description="Five knowledge domains evaluated by the exam. Weights reflect the approximate share of questions drawn from each domain."
      />
      <div className="space-y-4 px-6 py-8 lg:px-10">
        {DOMAINS.map((d) => (
          <Link
            key={d.id}
            href={`/domains/${d.slug}`}
            className="block rounded-xl border border-ink-200 bg-white p-6 transition-all hover:border-ink-300 hover:shadow-md"
          >
            <div className="mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm font-semibold text-ink-500">
                Domain {d.number}
              </span>
              <h2 className="text-lg font-semibold text-ink-900">{d.title}</h2>
              <span className="ml-auto font-mono text-sm font-semibold text-ink-700">
                {d.weight}%
              </span>
            </div>
            <WeightBar weight={d.weight} accent={d.accent} />
            <p className="mt-3 text-sm leading-relaxed text-ink-600">{d.summary}</p>
            <div className="mt-3 text-xs text-ink-500">
              {d.tasks.length} task statements
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

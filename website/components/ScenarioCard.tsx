import Link from "next/link";
import type { Scenario } from "@/lib/types";
import { DomainBadge } from "./DomainBadge";

interface Props {
  scenario: Scenario;
}

export function ScenarioCard({ scenario }: Props) {
  return (
    <Link
      href={`/scenarios/${scenario.slug}`}
      className="group block rounded-xl border border-ink-200 bg-white p-5 transition-all hover:border-ink-300 hover:shadow-md"
    >
      <div className="mb-2 flex items-baseline gap-2 text-xs text-ink-500">
        <span className="font-mono font-semibold">Scenario {scenario.number}</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-ink-900 group-hover:text-indigo-700">
        {scenario.title}
      </h3>
      <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-ink-600">
        {scenario.narrative}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {scenario.primaryDomains.map((d) => (
          <DomainBadge key={d} domainId={d} asLink={false} />
        ))}
      </div>
    </Link>
  );
}

import Link from "next/link";
import type { DomainId } from "@/lib/types";
import { getDomainById } from "@/lib/domains";

const accentClasses: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200 ring-sky-200",
};

interface Props {
  domainId: DomainId;
  size?: "sm" | "md";
  asLink?: boolean;
  showWeight?: boolean;
}

export function DomainBadge({ domainId, size = "sm", asLink = true, showWeight = false }: Props) {
  const domain = getDomainById(domainId);
  if (!domain) return null;

  const classes = accentClasses[domain.accent] ?? "";
  const sizeClasses =
    size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${classes} ${sizeClasses} font-medium`}
    >
      <span className="font-mono">{domain.id}</span>
      <span className="truncate">{domain.title}</span>
      {showWeight && <span className="opacity-70">· {domain.weight}%</span>}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link href={`/domains/${domain.slug}`} className="hover:opacity-80">
      {content}
    </Link>
  );
}

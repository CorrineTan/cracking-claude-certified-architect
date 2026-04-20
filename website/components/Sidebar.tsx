import Link from "next/link";
import { DOMAINS } from "@/lib/domains";
import { SCENARIOS } from "@/lib/scenarios";
import { EXERCISES } from "@/lib/exercises";

interface NavSection {
  title: string;
  items: { label: string; href: string; meta?: string }[];
}

function buildSections(): NavSection[] {
  return [
    {
      title: "Overview",
      items: [
        { label: "Home", href: "/" },
        { label: "Exam recommendations", href: "/recommendations" },
        { label: "Appendix", href: "/appendix" },
      ],
    },
    {
      title: "Domains",
      items: [
        { label: "All domains", href: "/domains" },
        ...DOMAINS.map((d) => ({
          label: `${d.number}. ${d.title}`,
          href: `/domains/${d.slug}`,
          meta: `${d.weight}%`,
        })),
      ],
    },
    {
      title: "Scenarios",
      items: [
        { label: "All scenarios", href: "/scenarios" },
        ...SCENARIOS.map((s) => ({
          label: `${s.number}. ${s.title}`,
          href: `/scenarios/${s.slug}`,
        })),
      ],
    },
    {
      title: "Practice Questions",
      items: [
        { label: "All questions", href: "/questions" },
        ...SCENARIOS.map((s) => ({
          label: s.title,
          href: `/questions/${s.slug}`,
        })),
      ],
    },
    {
      title: "Exercises",
      items: [
        { label: "All exercises", href: "/exercises" },
        ...EXERCISES.map((e) => ({
          label: `${e.number}. ${e.title}`,
          href: `/exercises/${e.slug}`,
          meta: e.status === "complete" ? "✓" : undefined,
        })),
      ],
    },
  ];
}

export function Sidebar() {
  const sections = buildSections();
  return (
    <aside className="hidden w-72 shrink-0 border-r border-ink-200 bg-white lg:block">
      <div className="sticky top-0 max-h-screen overflow-y-auto px-5 py-6">
        <Link href="/" className="mb-6 block">
          <div className="text-sm font-semibold text-ink-900">
            Claude Certified Architect
          </div>
          <div className="text-xs text-ink-500">Foundations · Study Guide</div>
        </Link>
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-100 hover:text-ink-900"
                    >
                      <span className="truncate">{item.label}</span>
                      {item.meta && (
                        <span className="font-mono text-[11px] text-ink-500">
                          {item.meta}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

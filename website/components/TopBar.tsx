import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
  title: string;
  description?: string;
  right?: React.ReactNode;
}

export function TopBar({ crumbs, title, description, right }: Props) {
  return (
    <header className="border-b border-ink-200 bg-white px-6 py-5 lg:px-10 lg:py-8">
      <nav className="mb-2 flex items-center gap-1.5 text-xs text-ink-500">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {c.href ? (
              <Link href={c.href} className="hover:text-ink-800">
                {c.label}
              </Link>
            ) : (
              <span className="text-ink-700">{c.label}</span>
            )}
            {i < crumbs.length - 1 && <span className="text-ink-300">/</span>}
          </span>
        ))}
      </nav>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 lg:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600 lg:text-base">
              {description}
            </p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}

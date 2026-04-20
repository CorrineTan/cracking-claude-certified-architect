import Link from "next/link";

interface Target {
  href: string;
  label: string;
  sublabel?: string;
}

interface Props {
  prev?: Target;
  next?: Target;
}

export function PrevNext({ prev, next }: Props) {
  return (
    <nav className="mt-10 grid gap-3 border-t border-ink-200 pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-lg border border-ink-200 p-4 hover:border-ink-300 hover:bg-ink-50"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            ← Previous
          </div>
          {prev.sublabel && (
            <div className="mt-1 text-xs text-ink-500">{prev.sublabel}</div>
          )}
          <div className="mt-0.5 font-medium text-ink-900 group-hover:text-indigo-700">
            {prev.label}
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group rounded-lg border border-ink-200 p-4 text-right hover:border-ink-300 hover:bg-ink-50"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Next →
          </div>
          {next.sublabel && (
            <div className="mt-1 text-xs text-ink-500">{next.sublabel}</div>
          )}
          <div className="mt-0.5 font-medium text-ink-900 group-hover:text-indigo-700">
            {next.label}
          </div>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

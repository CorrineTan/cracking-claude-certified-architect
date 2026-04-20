import type { ReactNode } from "react";

interface Props {
  title: string;
  tone?: "neutral" | "indigo" | "emerald" | "amber" | "rose" | "sky";
  children: ReactNode;
}

const toneClasses: Record<string, string> = {
  neutral: "border-ink-200 bg-ink-50",
  indigo: "border-indigo-200 bg-indigo-50",
  emerald: "border-emerald-200 bg-emerald-50",
  amber: "border-amber-200 bg-amber-50",
  rose: "border-rose-200 bg-rose-50",
  sky: "border-sky-200 bg-sky-50",
};

const titleClasses: Record<string, string> = {
  neutral: "text-ink-700",
  indigo: "text-indigo-700",
  emerald: "text-emerald-700",
  amber: "text-amber-700",
  rose: "text-rose-700",
  sky: "text-sky-700",
};

export function CalloutBox({ title, tone = "neutral", children }: Props) {
  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <div className={`mb-2 text-xs font-semibold uppercase tracking-wide ${titleClasses[tone]}`}>
        {title}
      </div>
      <div className="text-sm text-ink-700 leading-relaxed">{children}</div>
    </div>
  );
}

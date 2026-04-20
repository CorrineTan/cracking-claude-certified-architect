import type { DomainAccent } from "@/lib/types";

const fillClasses: Record<DomainAccent, string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
};

interface Props {
  weight: number;
  accent: DomainAccent;
  label?: string;
}

export function WeightBar({ weight, accent, label }: Props) {
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-ink-600">
          <span>{label}</span>
          <span className="font-mono font-medium">{weight}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className={`h-full rounded-full ${fillClasses[accent]}`}
          style={{ width: `${weight}%` }}
        />
      </div>
    </div>
  );
}

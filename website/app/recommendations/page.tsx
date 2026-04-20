import { TopBar } from "@/components/TopBar";
import { RECOMMENDATIONS } from "@/lib/appendix";

export default function RecommendationsPage() {
  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "Recommendations" }]}
        title="Exam preparation recommendations"
        description="Eight preparation activities from the official exam guide. Use them as a study plan alongside the domain pages and practice exercises."
      />
      <div className="space-y-3 px-6 py-8 lg:px-10">
        {RECOMMENDATIONS.map((rec, i) => (
          <div
            key={rec.title}
            className="flex gap-4 rounded-xl border border-ink-200 bg-white p-5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-mono text-sm font-semibold text-indigo-700">
              {i + 1}
            </span>
            <div>
              <h3 className="mb-1 text-base font-semibold text-ink-900">{rec.title}</h3>
              <p className="text-sm leading-relaxed text-ink-600">{rec.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

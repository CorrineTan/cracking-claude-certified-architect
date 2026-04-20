import { TopBar } from "@/components/TopBar";
import { ScenarioCard } from "@/components/ScenarioCard";
import { SCENARIOS } from "@/lib/scenarios";

export default function ScenariosIndexPage() {
  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "Scenarios" }]}
        title="Exam scenarios"
        description="Six product contexts the exam uses to frame questions. Each real exam presents 4 of these, selected at random."
      />
      <div className="grid gap-4 px-6 py-8 md:grid-cols-2 lg:px-10 xl:grid-cols-3">
        {SCENARIOS.map((s) => (
          <ScenarioCard key={s.slug} scenario={s} />
        ))}
      </div>
    </div>
  );
}

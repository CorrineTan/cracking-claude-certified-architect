import { TopBar } from "@/components/TopBar";
import { LearnGrid } from "./LearnGrid";
import { LESSON_COUNT } from "@/lib/lessons";

export const metadata = {
  title: "Learn — Claude Architect",
  description:
    "Bite-size lessons covering every Foundations exam task statement. Tick what you know, no daily quota, sync across devices.",
};

export default function LearnIndexPage() {
  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "Learn" }]}
        title="Learn"
        description={`${LESSON_COUNT} micro-lessons — 2 to 5 minutes each. Pick anything, in any order. Tick the ones you've got.`}
      />
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <LearnGrid />
      </div>
    </div>
  );
}

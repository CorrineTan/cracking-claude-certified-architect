import { TopBar } from "@/components/TopBar";
import { ExerciseCard } from "@/components/ExerciseCard";
import { EXERCISES } from "@/lib/exercises";

export default function ExercisesIndexPage() {
  const complete = EXERCISES.filter((e) => e.status === "complete").length;

  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "Exercises" }]}
        title="Preparation exercises"
        description={`Four hands-on exercises from the exam guide. ${complete} of ${EXERCISES.length} have working code in this repository.`}
      />
      <div className="grid gap-4 px-6 py-8 md:grid-cols-2 lg:px-10">
        {EXERCISES.map((e) => (
          <ExerciseCard key={e.slug} exercise={e} />
        ))}
      </div>
    </div>
  );
}

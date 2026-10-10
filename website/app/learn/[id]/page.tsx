import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { LessonView } from "./LessonView";
import { JungleSidebar } from "@/components/JungleSidebar";
import {
  LESSONS,
  getLesson,
  getNextLesson,
  getPreviousLesson,
} from "@/lib/lessons";
import { QUESTIONS } from "@/lib/questions";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  const prev = getPreviousLesson(id);
  const next = getNextLesson(id);
  const checkQ = lesson.checkQuestionId
    ? QUESTIONS.find((q) => q.id === lesson.checkQuestionId)
    : undefined;

  return (
    <div>
      <TopBar
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Learn", href: "/learn" },
          { label: `Lesson ${lesson.id}` },
        ]}
        title={`Lesson ${lesson.id}`}
      />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 lg:px-6">
        <div className="min-w-0 flex-1 max-w-3xl">
          <LessonView
            lesson={lesson}
            prev={prev ? { id: prev.id, title: prev.title } : undefined}
            next={next ? { id: next.id, title: next.title } : undefined}
            checkQuestion={checkQ}
          />
        </div>
        <JungleSidebar />
      </div>
    </div>
  );
}

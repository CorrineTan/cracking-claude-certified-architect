import { TopBar } from "@/components/TopBar";
import { QuestionsBoard } from "./QuestionsBoard";
import { JungleSidebar } from "@/components/JungleSidebar";
import { QUESTIONS } from "@/lib/questions";

export default function QuestionsIndexPage() {
  const total = QUESTIONS.length;
  const pdfCount = QUESTIONS.filter(
    (q) => q.source === "pdf" || q.source === "generated",
  ).length;
  const ccaCount = QUESTIONS.filter((q) => q.source === "cca-series").length;
  const videoCount = QUESTIONS.filter(
    (q) => q.source === "video-practice",
  ).length;

  return (
    <div>
      <TopBar
        crumbs={[{ label: "Home", href: "/" }, { label: "Questions" }]}
        title="Practice questions"
        description={`${total} questions in three banks: ${pdfCount} verbatim from the exam guide, ${ccaCount} from the CCA article series with exam tips, and ${videoCount} from the CCFA video walkthroughs.`}
      />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 lg:px-6">
        <div className="min-w-0 flex-1">
          <QuestionsBoard />
        </div>
        <JungleSidebar />
      </div>
    </div>
  );
}

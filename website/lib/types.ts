export type DomainId = "D1" | "D2" | "D3" | "D4" | "D5";

export type DomainSlug =
  | "agentic-architecture"
  | "tool-design-mcp"
  | "claude-code-workflows"
  | "prompt-engineering"
  | "context-reliability";

export type DomainAccent = "indigo" | "emerald" | "amber" | "rose" | "sky";

export type SequenceActorTone = "ink" | "indigo" | "emerald" | "amber";

export type VisualBlock =
  | {
      kind: "graphviz";
      title: string;
      caption?: string;
      dot: string;
    }
  | {
      kind: "do-dont";
      title: string;
      caption?: string;
      items: { good: string; bad: string; note?: string }[];
    }
  | {
      kind: "sequence";
      title: string;
      caption?: string;
      actors: { id: string; label: string; tone?: SequenceActorTone }[];
      steps: {
        from: string;
        to: string;
        message: string;
        note?: string;
        highlight?: "start" | "loop" | "end";
      }[];
    };

export interface TaskDeepDive {
  whyItMatters: string;
  pitfalls: string[];
  example: string;
  visuals?: VisualBlock[];
}

export interface TaskStatement {
  id: string; // e.g. "1.1"
  title: string;
  knowledge: string[];
  skills: string[];
  deepDive?: TaskDeepDive;
}

export interface Domain {
  id: DomainId;
  number: 1 | 2 | 3 | 4 | 5;
  slug: DomainSlug;
  title: string;
  weight: number; // percentage
  accent: DomainAccent;
  summary: string;
  tasks: TaskStatement[];
}

export type ScenarioSlug =
  | "customer-support"
  | "code-generation"
  | "multi-agent-research"
  | "developer-productivity"
  | "ci-cd"
  | "structured-extraction";

export interface ScenarioDeepDive {
  howItsTested: string;
  keyTasks: { taskId: string; why: string }[];
}

export interface Scenario {
  slug: ScenarioSlug;
  number: number;
  title: string;
  product: string; // e.g. "customer support resolution agent"
  narrative: string;
  primaryDomains: DomainId[];
  targetMetric?: string;
  deepDive?: ScenarioDeepDive;
}

export interface Question {
  id: string; // e.g. "pdf-1", "gen-cs-1", "cca-q1", "video-1"
  scenario: ScenarioSlug;
  domain: DomainId;
  taskId: string; // e.g. "1.4"
  number?: number; // original PDF question number
  prompt: string;
  options: { label: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  source: "pdf" | "generated" | "cca-series" | "video-practice";
  // Optional richer fields available on imported question banks
  whyOthersWrong?: { label: "A" | "B" | "C" | "D"; reason: string }[];
  examTip?: string;
  title?: string;
}

export type ExerciseSlug =
  | "multi-tool-escalation"
  | "team-workflow"
  | "structured-extraction"
  | "multi-agent-research";

export interface Exercise {
  slug: ExerciseSlug;
  number: 1 | 2 | 3 | 4;
  title: string;
  objective: string;
  domains: DomainId[];
  steps: string[];
  localPath?: string; // relative to repo root
  status: "complete" | "todo";
  summary?: string;
}

export interface PlanItem {
  id: string;
  label: string;
  hint?: string;
  href?: string;
  hours?: number;
}

export interface PlanDay {
  day: number;
  phase: "week1" | "week2";
  title: string;
  totalHours: number;
  items: PlanItem[];
}

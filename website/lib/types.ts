export type DomainId = "D1" | "D2" | "D3" | "D4" | "D5";

export type DomainSlug =
  | "agentic-architecture"
  | "tool-design-mcp"
  | "claude-code-workflows"
  | "prompt-engineering"
  | "context-reliability";

export type DomainAccent = "indigo" | "emerald" | "amber" | "rose" | "sky";

export interface TaskStatement {
  id: string; // e.g. "1.1"
  title: string;
  knowledge: string[];
  skills: string[];
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

export interface Scenario {
  slug: ScenarioSlug;
  number: number;
  title: string;
  product: string; // e.g. "customer support resolution agent"
  narrative: string;
  primaryDomains: DomainId[];
  targetMetric?: string;
}

export interface Question {
  id: string; // e.g. "pdf-1", "gen-cs-1"
  scenario: ScenarioSlug;
  domain: DomainId;
  taskId: string; // e.g. "1.4"
  number?: number; // original PDF question number
  prompt: string;
  options: { label: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  source: "pdf" | "generated";
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

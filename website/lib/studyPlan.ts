import type { PlanDay } from "./types";

export const STUDY_PLAN: PlanDay[] = [
  {
    day: 1,
    phase: "week1",
    title: "Framework: overview + Domain 1",
    totalHours: 2.5,
    items: [
      {
        id: "d1-home",
        label: "Read Home page — exam weights, passing score, 6 scenarios at a glance",
        href: "/",
        hours: 0.25,
      },
      {
        id: "d1-appendix",
        label: "Read Appendix — in-scope vs out-of-scope topics",
        href: "/appendix",
        hours: 0.25,
      },
      {
        id: "d1-recommendations",
        label: "Read the 8 exam preparation recommendations",
        href: "/recommendations",
        hours: 0.25,
      },
      {
        id: "d1-domain1",
        label: "Deep-read Domain 1 — all 7 task statements with deep dives",
        hint: "27% of the exam — biggest domain",
        href: "/domains/agentic-architecture",
        hours: 1.25,
      },
      {
        id: "d1-ex1-agent",
        label: "Walk through Exercise 1's src/agent.py — see the stop_reason loop in real code",
        hint: "Exercise/Exercise1_Multi_Tool_Escalaction_Logic/src/agent.py",
        href: "/exercises/multi-tool-escalation",
        hours: 0.5,
      },
    ],
  },
  {
    day: 2,
    phase: "week1",
    title: "Hands-on: run Exercise 1",
    totalHours: 3,
    items: [
      {
        id: "d2-setup",
        label: "Set up Exercise 1 venv + deps; add ANTHROPIC_API_KEY to .env",
        hours: 0.25,
      },
      {
        id: "d2-run-all",
        label: "python main.py all — observe all scenarios end-to-end",
        hours: 0.75,
      },
      {
        id: "d2-hooks",
        label: "Read src/hooks.py — prerequisite gate + $500 threshold rule",
        hint: "This is Task 1.5 in code form",
        hours: 0.5,
      },
      {
        id: "d2-mcp-server",
        label: "Read src/mcp_server.py — isError + errorCategory + isRetryable in action",
        hint: "Task 2.2",
        hours: 0.5,
      },
      {
        id: "d2-transient",
        label: "SIMULATE_TRANSIENT_ERRORS=1 python main.py 1_simple_order_inquiry — watch retry behavior",
        hours: 0.5,
      },
      {
        id: "d2-context",
        label: "Read src/context.py — CaseFacts injection at top of system prompt",
        hint: "Task 5.1",
        hours: 0.5,
      },
    ],
  },
  {
    day: 3,
    phase: "week1",
    title: "Domain 2 + Customer Support questions",
    totalHours: 2,
    items: [
      {
        id: "d3-domain2",
        label: "Deep-read Domain 2 — tool descriptions, structured errors, tool_choice, MCP, built-in tools",
        href: "/domains/tool-design-mcp",
        hours: 1.25,
      },
      {
        id: "d3-cs-questions",
        label: "Do all 6 Customer Support practice questions (3 PDF + 3 generated)",
        href: "/questions/customer-support",
        hours: 0.75,
      },
    ],
  },
  {
    day: 4,
    phase: "week1",
    title: "Domain 3 + Exercise 2 configuration walkthrough",
    totalHours: 3,
    items: [
      {
        id: "d4-domain3",
        label: "Deep-read Domain 3 — CLAUDE.md hierarchy, rules, skills, plan mode, CI/CD",
        href: "/domains/claude-code-workflows",
        hours: 1.25,
      },
      {
        id: "d4-ex2-rules",
        label: "Read .claude/rules/ in Exercise 2 — YAML frontmatter glob patterns",
        hint: "Task 3.3 — path-specific rules",
        hours: 0.5,
      },
      {
        id: "d4-ex2-skill",
        label: "Read .claude/skills/analyze-module/SKILL.md — context: fork + allowed-tools",
        hint: "Task 3.2",
        hours: 0.5,
      },
      {
        id: "d4-ex2-mcp",
        label: "Read .mcp.json — env var expansion for credentials",
        hint: "Task 2.4",
        hours: 0.25,
      },
      {
        id: "d4-cg-questions",
        label: "Do all 6 Code Generation practice questions",
        href: "/questions/code-generation",
        hours: 0.5,
      },
    ],
  },
  {
    day: 5,
    phase: "week1",
    title: "Domain 4 + Structured Extraction questions",
    totalHours: 2.5,
    items: [
      {
        id: "d5-domain4",
        label: "Deep-read Domain 4 — explicit criteria, few-shot, tool_use schemas, validation-retry, batch, multi-pass",
        href: "/domains/prompt-engineering",
        hours: 1.5,
      },
      {
        id: "d5-se-questions",
        label: "Do all 6 Structured Extraction practice questions",
        href: "/questions/structured-extraction",
        hours: 1,
      },
    ],
  },
  {
    day: 6,
    phase: "week1",
    title: "Domain 5 + Multi-Agent Research questions",
    totalHours: 2,
    items: [
      {
        id: "d6-domain5",
        label: "Deep-read Domain 5 — context management, escalation, error propagation, provenance",
        href: "/domains/context-reliability",
        hours: 1.25,
      },
      {
        id: "d6-mar-questions",
        label: "Do all 6 Multi-Agent Research practice questions",
        href: "/questions/multi-agent-research",
        hours: 0.75,
      },
    ],
  },
  {
    day: 7,
    phase: "week1",
    title: "Error review + weak-domain reread",
    totalHours: 3,
    items: [
      {
        id: "d7-review-errors",
        label: "Revisit every question you got wrong this week; read the explanation + task deep-dive again",
        hours: 1.5,
      },
      {
        id: "d7-weak-domain",
        label: "For any domain with >30% miss rate, reread the full domain page",
        hours: 1,
      },
      {
        id: "d7-dev-productivity",
        label: "Do all 6 Developer Productivity practice questions (not in PDF — all fresh)",
        href: "/questions/developer-productivity",
        hours: 0.5,
      },
    ],
  },
  {
    day: 8,
    phase: "week2",
    title: "Scenarios: narratives + cross-links",
    totalHours: 2,
    items: [
      {
        id: "d8-scenarios-index",
        label: "Read scenarios index; notice primaryDomains on each card",
        href: "/scenarios",
        hours: 0.25,
      },
      {
        id: "d8-cs-scenario",
        label: "Read Customer Support scenario deep dive + 5 key task jump-links",
        href: "/scenarios/customer-support",
        hours: 0.3,
      },
      {
        id: "d8-cg-scenario",
        label: "Read Code Generation scenario deep dive",
        href: "/scenarios/code-generation",
        hours: 0.25,
      },
      {
        id: "d8-mar-scenario",
        label: "Read Multi-Agent Research scenario deep dive",
        href: "/scenarios/multi-agent-research",
        hours: 0.3,
      },
      {
        id: "d8-dp-scenario",
        label: "Read Developer Productivity scenario deep dive",
        href: "/scenarios/developer-productivity",
        hours: 0.25,
      },
      {
        id: "d8-cicd-scenario",
        label: "Read CI/CD scenario deep dive",
        href: "/scenarios/ci-cd",
        hours: 0.3,
      },
      {
        id: "d8-se-scenario",
        label: "Read Structured Extraction scenario deep dive",
        href: "/scenarios/structured-extraction",
        hours: 0.35,
      },
    ],
  },
  {
    day: 9,
    phase: "week2",
    title: "12 PDF sample questions — cold",
    totalHours: 2.5,
    items: [
      {
        id: "d9-cold-cs",
        label: "Answer the 3 PDF Customer Support questions WITHOUT looking at the answer first",
        href: "/questions/customer-support",
        hours: 0.5,
      },
      {
        id: "d9-cold-cg",
        label: "Answer the 3 PDF Code Generation questions cold",
        href: "/questions/code-generation",
        hours: 0.5,
      },
      {
        id: "d9-cold-mar",
        label: "Answer the 3 PDF Multi-Agent Research questions cold",
        href: "/questions/multi-agent-research",
        hours: 0.5,
      },
      {
        id: "d9-cold-cicd",
        label: "Answer the 3 PDF CI/CD questions cold",
        href: "/questions/ci-cd",
        hours: 0.5,
      },
      {
        id: "d9-track",
        label: "Record your cold accuracy; note which domains / task IDs you missed",
        hours: 0.5,
      },
    ],
  },
  {
    day: 10,
    phase: "week2",
    title: "18 generated questions — cold",
    totalHours: 2,
    items: [
      {
        id: "d10-cold-generated",
        label: "Answer all 18 generated questions across all 6 scenarios, cold",
        href: "/questions",
        hours: 1.5,
      },
      {
        id: "d10-track",
        label: "Record accuracy by scenario + task ID",
        hours: 0.5,
      },
    ],
  },
  {
    day: 11,
    phase: "week2",
    title: "Error review",
    totalHours: 2,
    items: [
      {
        id: "d11-revisit-errors",
        label: "For each error, jump back to Task X.Y → read deep dive → write one sentence: \"I chose wrong because ___\"",
        hours: 1.25,
      },
      {
        id: "d11-reread-weak",
        label: "Reread any domain where error rate is still >20%",
        hours: 0.75,
      },
    ],
  },
  {
    day: 12,
    phase: "week2",
    title: "Exercises 3 + 4 — paper walkthrough",
    totalHours: 2,
    items: [
      {
        id: "d12-ex3",
        label: "Exercise 3 — walk the 5 steps mentally: schema with nullable fields, validation-retry loop, few-shot, batch with custom_id, confidence-based review routing",
        href: "/exercises/structured-extraction",
        hours: 1,
      },
      {
        id: "d12-ex4",
        label: "Exercise 4 — walk the 5 steps mentally: coordinator-subagent, parallel Task calls, structured output with provenance, error propagation, conflicting sources",
        href: "/exercises/multi-agent-research",
        hours: 1,
      },
    ],
  },
  {
    day: 13,
    phase: "week2",
    title: "Final error pass + readiness check",
    totalHours: 1,
    items: [
      {
        id: "d13-final-errors",
        label: "Final pass on your error log — only the questions you got wrong",
        hours: 0.5,
      },
      {
        id: "d13-verbal",
        label: "Verbal recall test — can you explain 5 concepts without notes? stop_reason loop, subagent context inheritance, context: fork, tool_choice=\"any\", validation-retry follow-up structure",
        hours: 0.5,
      },
    ],
  },
  {
    day: 14,
    phase: "week2",
    title: "Exam day",
    totalHours: 0,
    items: [
      {
        id: "d14-ready-accuracy",
        label: "READINESS GATE: 30-question aggregate accuracy ≥ 85%",
      },
      {
        id: "d14-ready-verbal",
        label: "READINESS GATE: Can verbally explain all 5 key concepts without notes",
      },
      {
        id: "d14-exam",
        label: "Sit for the exam",
      },
    ],
  },
];

export function getPlanDay(day: number) {
  return STUDY_PLAN.find((d) => d.day === day);
}

export function planItemCount() {
  return STUDY_PLAN.reduce((sum, d) => sum + d.items.length, 0);
}

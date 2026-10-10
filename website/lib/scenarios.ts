import type { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
  {
    slug: "customer-support",
    number: 1,
    title: "Customer Support Resolution Agent",
    product: "customer support resolution agent",
    narrative:
      "You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.",
    primaryDomains: ["D1", "D2", "D5"],
    targetMetric: "80%+ first-contact resolution",
    deepDive: {
      howItsTested:
        "Three recurring question shapes: (1) enforcing a prerequisite or threshold (always hooks, never prompts), (2) fixing a generic error response to let the agent recover correctly (structured isError + errorCategory), (3) placing critical facts so they survive long conversations (CaseFacts at top of system prompt). Escalation triggers are also a frequent distractor — remember: customer request, policy gap, inability to progress.",
      keyTasks: [
        { taskId: "1.4", why: "Prerequisite gates — verified customer ID must exist before refund." },
        { taskId: "1.5", why: "Tool-call interception hooks for threshold-based escalation ($500 rule)." },
        { taskId: "2.2", why: "Structured error responses with errorCategory + isRetryable." },
        { taskId: "5.1", why: "CaseFacts block keeps amounts/order IDs from getting summarized away." },
        { taskId: "5.2", why: "Escalation criteria — explicit request, policy silence, multiple matches." },
      ],
    },
  },
  {
    slug: "code-generation",
    number: 2,
    title: "Code Generation with Claude Code",
    product: "Claude Code",
    narrative:
      "You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.",
    primaryDomains: ["D3", "D5"],
    deepDive: {
      howItsTested:
        "CLAUDE.md hierarchy questions (user vs project, @import patterns) and plan-mode-vs-direct questions dominate. A recurring trap: \"new teammate missing instructions\" → the answer is always \"move to project-level\". Iterative refinement questions ask you to pick examples vs prompts vs tests.",
      keyTasks: [
        { taskId: "3.1", why: "Hierarchy: user vs project vs directory scope; @import; /memory." },
        { taskId: "3.2", why: "Project-scoped slash commands + skills with context: fork." },
        { taskId: "3.4", why: "Plan mode for ambiguity/multi-approach, direct execution for scoped changes." },
        { taskId: "3.5", why: "Examples > prose; interview pattern for unfamiliar domains." },
      ],
    },
  },
  {
    slug: "multi-agent-research",
    number: 3,
    title: "Multi-Agent Research System",
    product: "multi-agent research system",
    narrative:
      "You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.",
    primaryDomains: ["D1", "D2", "D5"],
    deepDive: {
      howItsTested:
        "The two defining questions for this scenario: (1) subagents don't inherit context → pass findings explicitly in prompts, (2) too many tools degrades selection → scope tools per subagent. Provenance (conflicting sources, date-attributed findings) is the Domain 5 companion question. Expect distractors that suggest \"larger context window\" or \"shared memory\".",
      keyTasks: [
        { taskId: "1.2", why: "Hub-and-spoke coordinator, dynamic subagent selection, iterative refinement." },
        { taskId: "1.3", why: "Explicit context passing; allowedTools must include \"Task\"; parallel Task calls." },
        { taskId: "2.3", why: "Scoped tools per subagent (e.g., verify_fact, not full web search)." },
        { taskId: "5.3", why: "Structured error context so coordinator can proceed with partial results." },
        { taskId: "5.6", why: "Preserve claim-source mappings; annotate conflicts; include dates." },
      ],
    },
  },
  {
    slug: "developer-productivity",
    number: 4,
    title: "Developer Productivity with Claude",
    product: "developer productivity tools",
    narrative:
      "You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.",
    primaryDomains: ["D2", "D3", "D1"],
    deepDive: {
      howItsTested:
        "This scenario is not in the PDF sample questions — expect fresh ones. Likely angles: incremental exploration (Grep→Read) vs reading everything upfront, Edit fallback to Read+Write, fork_session for parallel refactor approaches, and MCP Resources for exposing codebase catalogs without exploratory tool calls.",
      keyTasks: [
        { taskId: "1.7", why: "fork_session for divergent refactoring approaches from shared analysis." },
        { taskId: "2.4", why: "MCP Resources for content catalogs (issue summaries, schemas)." },
        { taskId: "2.5", why: "Grep→Read exploration, Edit fallback to Read+Write on non-unique anchors." },
        { taskId: "5.4", why: "Scratchpad files + subagent delegation for large-codebase exploration." },
      ],
    },
  },
  {
    slug: "ci-cd",
    number: 5,
    title: "Claude Code for Continuous Integration",
    product: "Claude Code in CI/CD",
    narrative:
      "You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.",
    primaryDomains: ["D3", "D4"],
    deepDive: {
      howItsTested:
        "False positives are the dominant theme: asking the model to \"be more conservative\" is ALWAYS wrong; explicit categorical criteria is ALWAYS right. The CLI flags (`-p`, `--output-format json`, `--json-schema`) are tested directly. Multi-pass architectures (per-file + integration) come up when the PR is large.",
      keyTasks: [
        { taskId: "3.6", why: "-p flag, JSON output, session isolation for review instances." },
        { taskId: "4.1", why: "Explicit categorical criteria beat vague confidence tuning." },
        { taskId: "4.2", why: "Few-shot examples to disambiguate bug vs style." },
        { taskId: "4.6", why: "Independent review instance; per-file + integration passes." },
      ],
    },
  },
  {
    slug: "structured-extraction",
    number: 6,
    title: "Structured Data Extraction",
    product: "structured data extraction system",
    narrative:
      "You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.",
    primaryDomains: ["D4", "D5"],
    deepDive: {
      howItsTested:
        "Not in the PDF samples — expect fresh questions hitting: nullable/optional fields to prevent hallucination, validation-retry with 3-piece follow-ups (doc + failed extraction + error), Message Batches API fit (latency tolerance + custom_id), and stratified accuracy measurement (aggregate metrics hide per-type failures).",
      keyTasks: [
        { taskId: "4.3", why: "Tool use + JSON schema; nullable fields prevent hallucinated values." },
        { taskId: "4.4", why: "Validation-retry: original doc + failed extraction + specific error." },
        { taskId: "4.5", why: "Batch API for latency-tolerant workloads; custom_id for failure correlation." },
        { taskId: "5.5", why: "Stratified sampling; accuracy by document type and field." },
      ],
    },
  },
];

export function getScenario(slug: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.slug === slug);
}

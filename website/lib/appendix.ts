export const TECHNOLOGIES: { name: string; description: string }[] = [
  {
    name: "Claude Agent SDK",
    description:
      "Agent definitions, agentic loops, stop_reason handling, hooks (PostToolUse, tool call interception), subagent spawning via Task tool, allowedTools configuration.",
  },
  {
    name: "Model Context Protocol (MCP)",
    description:
      "MCP servers, MCP tools, MCP resources, isError flag, tool descriptions, tool distribution, .mcp.json configuration, environment variable expansion.",
  },
  {
    name: "Claude Code",
    description:
      "CLAUDE.md configuration hierarchy (user/project/directory), .claude/rules/ with YAML frontmatter path-scoping, .claude/commands/ for slash commands, .claude/skills/ with SKILL.md frontmatter (context: fork, allowed-tools, argument-hint), plan mode, direct execution, /memory command, /compact, --resume, fork_session, Explore subagent.",
  },
  {
    name: "Claude Code CLI",
    description:
      "-p / --print flag for non-interactive mode, --output-format json, --json-schema for structured CI output.",
  },
  {
    name: "Claude API",
    description:
      'tool_use with JSON schemas, tool_choice options ("auto", "any", forced tool selection), stop_reason values ("tool_use", "end_turn"), max_tokens, system prompts.',
  },
  {
    name: "Message Batches API",
    description:
      "50% cost savings, up to 24-hour processing window, custom_id for request/response correlation, polling for completion, no multi-turn tool calling support.",
  },
  {
    name: "JSON Schema",
    description:
      'Required vs optional fields, enum types, nullable fields, "other" + detail string patterns, strict mode for syntax error elimination.',
  },
  {
    name: "Pydantic",
    description: "Schema validation, semantic validation errors, validation-retry loops.",
  },
  {
    name: "Built-in tools",
    description: "Read, Write, Edit, Bash, Grep, Glob — their purposes and selection criteria.",
  },
  {
    name: "Few-shot prompting",
    description:
      "Targeted examples for ambiguous scenarios, format demonstration, generalization to novel patterns.",
  },
  {
    name: "Prompt chaining",
    description: "Sequential task decomposition into focused passes.",
  },
  {
    name: "Context window management",
    description:
      "Token budgets, progressive summarization, lost-in-the-middle effects, context extraction, scratchpad files.",
  },
  {
    name: "Session management",
    description:
      "Session resumption, fork_session, named sessions, session context isolation.",
  },
  {
    name: "Confidence scoring",
    description:
      "Field-level confidence, calibration with labeled validation sets, stratified sampling for error rate measurement.",
  },
];

export const IN_SCOPE: { name: string; description: string }[] = [
  {
    name: "Agentic loop implementation",
    description: "Control flow based on stop_reason, tool result handling, loop termination conditions.",
  },
  {
    name: "Multi-agent orchestration",
    description:
      "Coordinator-subagent patterns, task decomposition, parallel subagent execution, iterative refinement loops.",
  },
  {
    name: "Subagent context management",
    description: "Explicit context passing, structured state persistence, crash recovery using manifests.",
  },
  {
    name: "Tool interface design",
    description:
      "Writing effective tool descriptions, splitting vs consolidating tools, tool naming to reduce ambiguity.",
  },
  {
    name: "MCP tool and resource design",
    description: "Resources for content catalogs, tools for actions, description quality for adoption.",
  },
  {
    name: "MCP server configuration",
    description: "Project vs user scope, environment variable expansion, multi-server simultaneous access.",
  },
  {
    name: "Error handling and propagation",
    description:
      "Structured error responses, transient vs business vs permission errors, local recovery before escalation.",
  },
  {
    name: "Escalation decision-making",
    description: "Explicit criteria, honoring customer preferences, policy gap identification.",
  },
  {
    name: "CLAUDE.md configuration",
    description: "Hierarchy (user/project/directory), @import patterns, .claude/rules/ with glob patterns.",
  },
  {
    name: "Custom commands and skills",
    description: "Project vs user scope, context: fork, allowed-tools, argument-hint frontmatter.",
  },
  {
    name: "Plan mode vs direct execution",
    description: "Complexity assessment, architectural decisions, single-file changes.",
  },
  {
    name: "Iterative refinement",
    description:
      "Input/output examples, test-driven iteration, interview pattern, sequential vs parallel issue resolution.",
  },
  {
    name: "Structured output via tool_use",
    description: "Schema design, tool_choice configuration, nullable fields to prevent hallucination.",
  },
  {
    name: "Few-shot prompting",
    description: "Ambiguous scenario targeting, format consistency, false positive reduction.",
  },
  {
    name: "Batch processing",
    description: "Message Batches API appropriateness, latency tolerance assessment, failure handling by custom_id.",
  },
  {
    name: "Context window optimization",
    description: "Trimming verbose tool outputs, structured fact extraction, position-aware input ordering.",
  },
  {
    name: "Human review workflows",
    description: "Confidence calibration, stratified sampling, accuracy segmentation by document type and field.",
  },
  {
    name: "Information provenance",
    description: "Claim-source mappings, temporal data handling, conflict annotation, coverage gap reporting.",
  },
];

export const OUT_OF_SCOPE: string[] = [
  "Fine-tuning Claude models or training custom models",
  "Claude API authentication, billing, or account management",
  "Detailed implementation of specific programming languages or frameworks (beyond what's needed for tool and schema configuration)",
  "Deploying or hosting MCP servers (infrastructure, networking, container orchestration)",
  "Claude's internal architecture, training process, or model weights",
  "Constitutional AI, RLHF, or safety training methodologies",
  "Embedding models or vector database implementation details",
  "Computer use (browser automation, desktop interaction)",
  "Vision/image analysis capabilities",
  "Streaming API implementation or server-sent events",
  "Rate limiting, quotas, or API pricing calculations",
  "OAuth, API key rotation, or authentication protocol details",
  "Specific cloud provider configurations (AWS, GCP, Azure)",
  "Performance benchmarking or model comparison metrics",
  "Prompt caching implementation details (beyond knowing it exists)",
  "Token counting algorithms or tokenization specifics",
];

export const RECOMMENDATIONS: { title: string; body: string }[] = [
  {
    title: "Build an agent with the Claude Agent SDK",
    body: "Implement a complete agentic loop with tool calling, error handling, and session management. Practice spawning subagents and passing context between them.",
  },
  {
    title: "Configure Claude Code for a real project",
    body: "Set up CLAUDE.md with a configuration hierarchy, create path-specific rules in .claude/rules/, build custom skills with frontmatter options (context: fork, allowed-tools), and integrate at least one MCP server.",
  },
  {
    title: "Design and test MCP tools",
    body: "Write tool descriptions that clearly differentiate similar tools. Implement structured error responses with error categories and retryable flags. Test tool selection reliability with ambiguous requests.",
  },
  {
    title: "Build a structured data extraction pipeline",
    body: "Use tool_use with JSON schemas, implement validation-retry loops, design schemas with optional/nullable fields, and practice batch processing with the Message Batches API.",
  },
  {
    title: "Practice prompt engineering techniques",
    body: "Write few-shot examples for ambiguous scenarios. Define explicit review criteria to reduce false positives. Design multi-pass review architectures for large code reviews.",
  },
  {
    title: "Study context management patterns",
    body: "Practice extracting structured facts from verbose tool outputs, implementing scratchpad files for long sessions, and designing subagent delegation to manage context limits.",
  },
  {
    title: "Review escalation and human-in-the-loop patterns",
    body: "Understand when to escalate (policy gaps, customer requests, inability to progress) versus resolve autonomously. Practice designing human review workflows with confidence-based routing.",
  },
  {
    title: "Complete the Practice Exam",
    body: "Before sitting for the real exam, complete the practice exam (the link will be provided separately). The practice exam covers the same scenarios and question format as the real exam and shows explanations after each answer to help reinforce your understanding.",
  },
];

export const EXAM_META = {
  format: "Multiple choice (one correct response, three distractors)",
  scenariosPresented: "4 scenarios picked at random from 6 total",
  scoringRange: "Scaled score 100–1,000",
  passingScore: 720,
  noPenaltyForGuessing: true,
  typicalExperience: "6+ months building with Claude APIs, Agent SDK, Claude Code, and MCP",
  version: "Version 0.1 — Last Updated: Feb 10 2025",
};

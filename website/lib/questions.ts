import type { Question, ScenarioSlug } from "./types";

export const QUESTIONS: Question[] = [
  // ─────────────────────────────────────────────────────────────
  // Customer Support — PDF Q1-3
  // ─────────────────────────────────────────────────────────────
  {
    id: "pdf-1",
    scenario: "customer-support",
    domain: "D1",
    taskId: "1.4",
    number: 1,
    source: "pdf",
    prompt:
      "Production data shows that in 12% of cases, your agent skips get_customer entirely and calls lookup_order using only the customer's stated name, occasionally leading to misidentified accounts and incorrect refunds. What change would most effectively address this reliability issue?",
    options: [
      {
        label: "A",
        text: "Add a programmatic prerequisite that blocks lookup_order and process_refund calls until get_customer has returned a verified customer ID.",
      },
      {
        label: "B",
        text: "Enhance the system prompt to state that customer verification via get_customer is mandatory before any order operations.",
      },
      {
        label: "C",
        text: "Add few-shot examples showing the agent always calling get_customer first, even when customers volunteer order details.",
      },
      {
        label: "D",
        text: "Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "When a specific tool sequence is required for critical business logic (like verifying customer identity before processing refunds), programmatic enforcement provides deterministic guarantees that prompt-based approaches cannot. Options B and C rely on probabilistic LLM compliance, which is insufficient when errors have financial consequences. Option D addresses tool availability rather than tool ordering, which is not the actual problem.",
  },
  {
    id: "pdf-2",
    scenario: "customer-support",
    domain: "D2",
    taskId: "2.1",
    number: 2,
    source: "pdf",
    prompt:
      'Production logs show the agent frequently calls get_customer when users ask about orders (e.g., "check my order #12345"), instead of calling lookup_order. Both tools have minimal descriptions ("Retrieves customer information" / "Retrieves order details") and accept similar identifier formats. What\'s the most effective first step to improve tool selection reliability?',
    options: [
      {
        label: "A",
        text: "Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5-8 examples showing order-related queries routing to lookup_order.",
      },
      {
        label: "B",
        text: "Expand each tool's description to include input formats it handles, example queries, edge cases, and boundaries explaining when to use it versus similar tools.",
      },
      {
        label: "C",
        text: "Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords and identifier patterns.",
      },
      {
        label: "D",
        text: "Consolidate both tools into a single lookup_entity tool that accepts any identifier and internally determines which backend to query.",
      },
    ],
    correctAnswer: "B",
    explanation:
      'Tool descriptions are the primary mechanism LLMs use for tool selection. When descriptions are minimal, models lack the context to differentiate between similar tools. Option B directly addresses this root cause with a low-effort, high-leverage fix. Few-shot examples (A) add token overhead without fixing the underlying issue. A routing layer (C) is over-engineered and bypasses the LLM\'s natural language understanding. Consolidating tools (D) is a valid architectural choice but requires more effort than a "first step" warrants when the immediate problem is inadequate descriptions.',
  },
  {
    id: "pdf-3",
    scenario: "customer-support",
    domain: "D5",
    taskId: "5.2",
    number: 3,
    source: "pdf",
    prompt:
      "Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show it escalates straightforward cases (standard damage replacements with photo evidence) while attempting to autonomously handle complex situations requiring policy exceptions. What's the most effective way to improve escalation calibration?",
    options: [
      {
        label: "A",
        text: "Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously.",
      },
      {
        label: "B",
        text: "Have the agent self-report a confidence score (1-10) before each response and automatically route requests to humans when confidence falls below a threshold.",
      },
      {
        label: "C",
        text: "Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent begins processing.",
      },
      {
        label: "D",
        text: "Implement sentiment analysis to detect customer frustration levels and automatically escalate when negative sentiment exceeds a threshold.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Adding explicit escalation criteria with few-shot examples directly addresses the root cause: unclear decision boundaries. This is the proportionate first response before adding infrastructure. Option B fails because LLM self-reported confidence is poorly calibrated — the agent is already incorrectly confident on hard cases. Option C is over-engineered, requiring labeled data and ML infrastructure when prompt optimization hasn't been tried. Option D solves a different problem entirely; sentiment doesn't correlate with case complexity, which is the actual issue.",
  },

  // ─────────────────────────────────────────────────────────────
  // Customer Support — Generated
  // ─────────────────────────────────────────────────────────────
  {
    id: "gen-cs-1",
    scenario: "customer-support",
    domain: "D1",
    taskId: "1.5",
    source: "generated",
    prompt:
      "Three of your MCP tools return dates in inconsistent formats: lookup_order returns a Unix timestamp, get_customer returns ISO 8601, and legacy_ticket_system returns a numeric status code mapped to a date. You find the agent occasionally misinterprets these when reasoning about order timelines. What's the most reliable fix?",
    options: [
      {
        label: "A",
        text: "Implement a PostToolUse hook that normalizes all date/time values to a single ISO 8601 format before the agent processes the tool result.",
      },
      {
        label: "B",
        text: "Add a system prompt section listing each tool and the date format it returns, instructing the agent to convert mentally.",
      },
      {
        label: "C",
        text: "Add few-shot examples showing the agent converting each format correctly.",
      },
      {
        label: "D",
        text: "Modify each MCP tool's source to return ISO 8601; the hook layer is unnecessary.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "PostToolUse hooks exist precisely for this data-normalization case: transforming heterogeneous tool outputs to a uniform format before the model sees them, giving you deterministic guarantees. Option B relies on probabilistic model compliance for mechanical transformations. Option C has the same problem. Option D is technically valid but often infeasible (legacy/third-party tools, shared tools across teams); hooks let you normalize without owning every tool's source.",
  },
  {
    id: "gen-cs-2",
    scenario: "customer-support",
    domain: "D2",
    taskId: "2.2",
    source: "generated",
    prompt:
      'Your process_refund MCP tool currently returns {"success": false, "message": "Operation failed"} for every failure — whether the refund exceeded the merchant limit, the payment provider timed out, or the order ID was invalid. The agent retries all three cases identically. What\'s the best fix?',
    options: [
      {
        label: "A",
        text: "Return CallToolResult with isError=true and a structured payload containing errorCategory (transient/validation/permission), isRetryable, and a human-readable message.",
      },
      {
        label: "B",
        text: "Add a prompt instruction telling the agent not to retry refund errors more than twice.",
      },
      {
        label: "C",
        text: "Return plain text error messages that the agent can parse with regex to determine the category.",
      },
      {
        label: "D",
        text: "Remove the refund tool from the agent's toolset so only humans process refunds.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Structured error metadata lets the agent make appropriate recovery decisions — retry on transient, explain validation errors to the user, escalate permission errors. Option B addresses symptoms, not the root cause (the agent lacks enough info to decide). Option C is brittle; regex parsing of natural language is an anti-pattern compared to structured fields. Option D throws out the baby with the bathwater and contradicts the 80% FCR goal.",
  },
  {
    id: "gen-cs-3",
    scenario: "customer-support",
    domain: "D5",
    taskId: "5.1",
    source: "generated",
    prompt:
      'In long conversations where the agent has made 6-8 tool calls, you observe it "forgets" the verified customer\'s tier or starts asking for order numbers it already has. Tool results are all present in message history. What change most reliably fixes this?',
    options: [
      {
        label: "A",
        text: "Extract key facts (customer ID, tier, order totals, refund amounts) into a CaseFacts block and inject it at the top of the system prompt on every iteration.",
      },
      {
        label: "B",
        text: "Increase max_tokens so Claude has more space to reason.",
      },
      {
        label: "C",
        text: "Summarize the full conversation and replace the history with the summary every few turns.",
      },
      {
        label: "D",
        text: "Switch to a larger Claude model with a bigger context window.",
      },
    ],
    correctAnswer: "A",
    explanation:
      'This is the "lost in the middle" effect: models reliably process context at the beginning and end of long inputs but may miss middle content. Placing authoritative case facts at the top of the system prompt mitigates position effects. Option B does not address recall at all. Option C risks progressive summarization losing exact values (amounts, dates, tiers). Option D throws hardware at a prompt-design problem that a larger window alone will not solve.',
  },

  // ─────────────────────────────────────────────────────────────
  // Code Generation — PDF Q4-6
  // ─────────────────────────────────────────────────────────────
  {
    id: "pdf-4",
    scenario: "code-generation",
    domain: "D3",
    taskId: "3.2",
    number: 4,
    source: "pdf",
    prompt:
      "You want to create a custom /review slash command that runs your team's standard code review checklist. This command should be available to every developer when they clone or pull the repository. Where should you create this command file?",
    options: [
      { label: "A", text: "In the .claude/commands/ directory in the project repository." },
      { label: "B", text: "In ~/.claude/commands/ in each developer's home directory." },
      { label: "C", text: "In the CLAUDE.md file at the project root." },
      { label: "D", text: "In a .claude/config.json file with a commands array." },
    ],
    correctAnswer: "A",
    explanation:
      "Project-scoped custom slash commands should be stored in the .claude/commands/ directory within the repository. These commands are version-controlled and automatically available to all developers when they clone or pull the repo. Option B (~/.claude/commands/) is for personal commands that aren't shared via version control. Option C (CLAUDE.md) is for project instructions and context, not command definitions. Option D describes a configuration mechanism that doesn't exist in Claude Code.",
  },
  {
    id: "pdf-5",
    scenario: "code-generation",
    domain: "D3",
    taskId: "3.4",
    number: 5,
    source: "pdf",
    prompt:
      "You've been assigned to restructure the team's monolithic application into microservices. This will involve changes across dozens of files and requires decisions about service boundaries and module dependencies. Which approach should you take?",
    options: [
      {
        label: "A",
        text: "Enter plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes.",
      },
      {
        label: "B",
        text: "Start with direct execution and make changes incrementally, letting the implementation reveal the natural service boundaries.",
      },
      {
        label: "C",
        text: "Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured.",
      },
      {
        label: "D",
        text: "Begin in direct execution mode and only switch to plan mode if you encounter unexpected complexity during implementation.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Plan mode is designed for complex tasks involving large-scale changes, multiple valid approaches, and architectural decisions — exactly what monolith-to-microservices restructuring requires. It enables safe codebase exploration and design before committing to changes. Option B risks costly rework when dependencies are discovered late. Option C assumes you already know the right structure without exploring the code. Option D ignores that the complexity is already stated in the requirements, not something that might emerge later.",
  },
  {
    id: "pdf-6",
    scenario: "code-generation",
    domain: "D3",
    taskId: "3.3",
    number: 6,
    source: "pdf",
    prompt:
      "Your codebase has distinct areas with different coding conventions: React components use functional style with hooks, API handlers use async/await with specific error handling, and database models follow a repository pattern. Test files are spread throughout the codebase alongside the code they test (e.g., Button.test.tsx next to Button.tsx), and you want all tests to follow the same conventions regardless of location. What's the most maintainable way to ensure Claude automatically applies the correct conventions when generating code?",
    options: [
      {
        label: "A",
        text: "Create rule files in .claude/rules/ with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths.",
      },
      {
        label: "B",
        text: "Consolidate all conventions in the root CLAUDE.md file under headers for each area, relying on Claude to infer which section applies.",
      },
      {
        label: "C",
        text: "Create skills in .claude/skills/ for each code type that include the relevant conventions in their SKILL.md files.",
      },
      {
        label: "D",
        text: "Place a separate CLAUDE.md file in each subdirectory containing that area's specific conventions.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Option A is correct because .claude/rules/ with glob patterns (e.g., **/*.test.tsx) allows conventions to be automatically applied based on file paths regardless of directory location — essential for test files spread throughout the codebase. Option B relies on inference rather than explicit matching, making it unreliable. Option C requires manual skill invocation or relies on Claude choosing to load them, contradicting the need for deterministic \"automatic\" application based on file paths. Option D can't easily handle files spread across many directories since CLAUDE.md files are directory-bound.",
  },

  // ─────────────────────────────────────────────────────────────
  // Code Generation — Generated
  // ─────────────────────────────────────────────────────────────
  {
    id: "gen-cg-1",
    scenario: "code-generation",
    domain: "D3",
    taskId: "3.1",
    source: "generated",
    prompt:
      "A new team member reports that Claude Code isn't applying your team's Python style rules when they edit files, even though their colleague in the same repo sees the rules applied correctly. You suspect a configuration hierarchy issue. Which first step best helps you diagnose the problem?",
    options: [
      {
        label: "A",
        text: "Ask the new member to run /memory to see which memory files are loaded, and compare against a colleague's /memory output.",
      },
      {
        label: "B",
        text: "Tell the member to restart Claude Code; it sometimes caches stale config.",
      },
      {
        label: "C",
        text: "Have them copy all the rules into ~/.claude/CLAUDE.md so they're always loaded.",
      },
      {
        label: "D",
        text: "Update the project's CLAUDE.md to explicitly list the rules again in case they were missed.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "The /memory command reveals exactly which memory files are loaded for a given session — the right diagnostic tool when hierarchy behavior differs between users. Option C makes rules user-scoped, which defeats version control and doesn't fix the root cause. Option D assumes content is missing without diagnosing the issue. Option B is a guess with no evidence.",
  },
  {
    id: "gen-cg-2",
    scenario: "code-generation",
    domain: "D3",
    taskId: "3.1",
    source: "generated",
    prompt:
      "Your monorepo has a shared CLAUDE.md at the root, but each package (auth-service, billing-service, web-app) has standards specific to that package that don't apply elsewhere. How should you organize this cleanly?",
    options: [
      {
        label: "A",
        text: "Use @import syntax in each package's CLAUDE.md to selectively include relevant standards files based on what that package needs.",
      },
      {
        label: "B",
        text: "Combine all package standards into the root CLAUDE.md under per-package headers.",
      },
      {
        label: "C",
        text: "Put everything in ~/.claude/CLAUDE.md so it's loaded regardless of which package is open.",
      },
      {
        label: "D",
        text: "Duplicate the shared standards into each package's CLAUDE.md so they're always visible.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "@import keeps CLAUDE.md modular and lets each package's maintainer pull in only the shared standards files they need, avoiding duplication and bloat. Option B bloats the root CLAUDE.md with irrelevant context when editing any single package. Option C moves project standards to user-scoped config, which teammates don't share. Option D creates drift (copies go stale).",
  },
  {
    id: "gen-cg-3",
    scenario: "code-generation",
    domain: "D3",
    taskId: "3.5",
    source: "generated",
    prompt:
      "You're asking Claude Code to implement a cache invalidation strategy in an unfamiliar codebase. You have a rough idea but aren't sure about failure modes, eviction policies, or interaction with the existing queue. What's the most effective first move?",
    options: [
      {
        label: "A",
        text: "Use the interview pattern — ask Claude to raise design questions (cache invalidation strategy, failure modes, interactions) before implementing anything.",
      },
      {
        label: "B",
        text: "Describe your rough idea and tell Claude to implement it; iterate on whatever it produces.",
      },
      {
        label: "C",
        text: "Ask Claude to implement three different approaches and pick the best one.",
      },
      {
        label: "D",
        text: "Write the implementation yourself first, then have Claude review it.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "The interview pattern surfaces considerations you may not have anticipated before implementation commits you to an approach. Option B risks building the wrong thing and iterating on a flawed foundation. Option C wastes effort on parallel implementations when the requirements aren't yet clear. Option D is valid but slower when Claude's questions can surface issues upfront.",
  },

  // ─────────────────────────────────────────────────────────────
  // Multi-Agent Research — PDF Q7-9
  // ─────────────────────────────────────────────────────────────
  {
    id: "pdf-7",
    scenario: "multi-agent-research",
    domain: "D1",
    taskId: "1.2",
    number: 7,
    source: "pdf",
    prompt:
      'After running the system on the topic "impact of AI on creative industries," you observe that each subagent completes successfully: the web search agent finds relevant articles, the document analysis agent summarizes papers correctly, and the synthesis agent produces coherent output. However, the final reports cover only visual arts, completely missing music, writing, and film production. When you examine the coordinator\'s logs, you see it decomposed the topic into three subtasks: "AI in digital art creation," "AI in graphic design," and "AI in photography." What is the most likely root cause?',
    options: [
      {
        label: "A",
        text: "The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents.",
      },
      {
        label: "B",
        text: "The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains of the topic.",
      },
      {
        label: "C",
        text: "The web search agent's queries are not comprehensive enough and need to be expanded to cover more creative industry sectors.",
      },
      {
        label: "D",
        text: "The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria.",
      },
    ],
    correctAnswer: "B",
    explanation:
      'The coordinator\'s logs reveal the root cause directly: it decomposed "creative industries" into only visual arts subtasks (digital art, graphic design, photography), completely omitting music, writing, and film. The subagents executed their assigned tasks correctly — the problem is what they were assigned. Options A, C, and D incorrectly blame downstream agents that are working correctly within their assigned scope.',
  },
  {
    id: "pdf-8",
    scenario: "multi-agent-research",
    domain: "D5",
    taskId: "5.3",
    number: 8,
    source: "pdf",
    prompt:
      "The web search subagent times out while researching a complex topic. You need to design how this failure information flows back to the coordinator agent. Which error propagation approach best enables intelligent recovery?",
    options: [
      {
        label: "A",
        text: "Return structured error context to the coordinator including the failure type, the attempted query, any partial results, and potential alternative approaches.",
      },
      {
        label: "B",
        text: 'Implement automatic retry logic with exponential backoff within the subagent, returning a generic "search unavailable" status only after all retries are exhausted.',
      },
      {
        label: "C",
        text: "Catch the timeout within the subagent and return an empty result set marked as successful.",
      },
      {
        label: "D",
        text: "Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Structured error context gives the coordinator the information it needs to make intelligent recovery decisions — whether to retry with a modified query, try an alternative approach, or proceed with partial results. Option B's generic status hides valuable context from the coordinator, preventing informed decisions. Option C suppresses the error by marking failure as success, which prevents any recovery and risks incomplete research outputs. Option D terminates the entire workflow unnecessarily when recovery strategies could succeed.",
  },
  {
    id: "pdf-9",
    scenario: "multi-agent-research",
    domain: "D2",
    taskId: "2.3",
    number: 9,
    source: "pdf",
    prompt:
      "During testing, you observe that the synthesis agent frequently needs to verify specific claims while combining findings. Currently, when verification is needed, the synthesis agent returns control to the coordinator, which invokes the web search agent, then re-invokes synthesis with results. This adds 2-3 round trips per task and increases latency by 40%. Your evaluation shows that 85% of these verifications are simple fact-checks (dates, names, statistics) while 15% require deeper investigation. What's the most effective approach to reduce overhead while maintaining system reliability?",
    options: [
      {
        label: "A",
        text: "Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator.",
      },
      {
        label: "B",
        text: "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass, which then sends them all to the web search agent at once.",
      },
      {
        label: "C",
        text: "Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips through the coordinator.",
      },
      {
        label: "D",
        text: "Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Option A applies the principle of least privilege by giving the synthesis agent only what it needs for the 85% common case (simple fact verification) while preserving the existing coordination pattern for complex cases. Option B's batching approach creates blocking dependencies since synthesis steps may depend on earlier verified facts. Option C over-provisions the synthesis agent, violating separation of concerns. Option D relies on speculative caching that cannot reliably predict what the synthesis agent will need to verify.",
  },

  // ─────────────────────────────────────────────────────────────
  // Multi-Agent Research — Generated
  // ─────────────────────────────────────────────────────────────
  {
    id: "gen-mar-1",
    scenario: "multi-agent-research",
    domain: "D1",
    taskId: "1.3",
    source: "generated",
    prompt:
      "Your coordinator hands off to a synthesis subagent after web search and document analysis complete. You notice the synthesis subagent makes up paraphrased claims and doesn't cite any specific source. What's the most direct fix?",
    options: [
      {
        label: "A",
        text: "Include the complete search results and analysis outputs (with source URLs and excerpts) directly in the synthesis subagent's prompt — subagents do not inherit parent context automatically.",
      },
      {
        label: "B",
        text: "Tell the synthesis subagent in its system prompt that it must cite sources.",
      },
      {
        label: "C",
        text: "Run the synthesis subagent with web search tools so it can re-verify claims.",
      },
      {
        label: "D",
        text: "Increase the synthesis subagent's max_tokens so it has room to include citations.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Subagents operate with isolated context and do not inherit the coordinator's conversation history. If the synthesis agent cannot see the search results and excerpts, it has nothing to cite — it will paraphrase from training data instead. Option B can't work when the data isn't there. Option C re-does work the other agents already completed and fragments provenance. Option D doesn't solve the missing-input problem.",
  },
  {
    id: "gen-mar-2",
    scenario: "multi-agent-research",
    domain: "D5",
    taskId: "5.6",
    source: "generated",
    prompt:
      "Two credible sources report different statistics on the same metric (one says 23%, the other 41%). Each is from a different methodology and year. How should the synthesis agent handle this?",
    options: [
      {
        label: "A",
        text: "Preserve both values with source attribution, dates, and methodological context, and structure the report section to distinguish well-established findings from contested ones.",
      },
      {
        label: "B",
        text: "Average the two values to produce a single reconciled number.",
      },
      {
        label: "C",
        text: "Pick the more recent figure and discard the other for simplicity.",
      },
      {
        label: "D",
        text: "Omit the metric entirely since the sources disagree.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Annotating conflicts with source attribution (and temporal/methodological context) lets readers judge — and prevents treating temporal or methodological differences as contradictions. Option B fabricates a value with no source and hides real disagreement. Option C discards signal without evidence the newer value is better. Option D loses useful information.",
  },
  {
    id: "gen-mar-3",
    scenario: "multi-agent-research",
    domain: "D1",
    taskId: "1.2",
    source: "generated",
    prompt:
      "You want the coordinator to run web search and document analysis subagents in parallel rather than sequentially to reduce latency. How should you implement this in the Agent SDK?",
    options: [
      {
        label: "A",
        text: "Emit multiple Task tool calls in a single coordinator response so both subagents spawn simultaneously.",
      },
      {
        label: "B",
        text: "Spawn the web search Task first, wait for completion, then spawn document analysis in a second turn.",
      },
      {
        label: "C",
        text: "Combine both agents' instructions into one Task call and let the subagent handle both.",
      },
      {
        label: "D",
        text: "Have the synthesis subagent call the two agents internally.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Emitting multiple Task tool calls in one coordinator response spawns the subagents in parallel — the documented pattern for concurrent subagent execution. Option B is sequential by construction. Option C loses specialization and mixes concerns. Option D shifts orchestration to the wrong agent and breaks the coordinator pattern.",
  },

  // ─────────────────────────────────────────────────────────────
  // Developer Productivity — Generated (no PDF questions for this scenario)
  // ─────────────────────────────────────────────────────────────
  {
    id: "gen-dp-1",
    scenario: "developer-productivity",
    domain: "D1",
    taskId: "1.7",
    source: "generated",
    prompt:
      "You've spent an hour with Claude Code exploring and analyzing a payments module. Now you want to try two different refactoring approaches (introduce a service layer vs. extract domain events) from that same analysis baseline, without re-doing the exploration. What's the right tool?",
    options: [
      {
        label: "A",
        text: "Use fork_session to create two parallel branches from the shared analysis baseline, explore each approach independently, and compare outcomes.",
      },
      {
        label: "B",
        text: "Start a new session and paste your prior analysis into the system prompt.",
      },
      {
        label: "C",
        text: "Continue in the same session, try one approach, undo the changes, and try the other.",
      },
      {
        label: "D",
        text: "Run two Claude Code instances from scratch, one per approach.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "fork_session is purpose-built for exactly this: independent branches from a shared analysis baseline to explore divergent approaches. Option B loses fidelity (pasted summaries drop nuance) and duplicates work. Option C entangles the two explorations in one history, making comparison hard. Option D discards the analysis baseline entirely.",
  },
  {
    id: "gen-dp-2",
    scenario: "developer-productivity",
    domain: "D2",
    taskId: "2.5",
    source: "generated",
    prompt:
      "You want Claude Code to rename a helper function that appears identically in 14 call sites across the codebase. The Edit tool errors because the match isn't unique. What's the most reliable approach?",
    options: [
      {
        label: "A",
        text: "Use Read to load each file, then Write the modified content when Edit cannot find a unique anchor.",
      },
      {
        label: "B",
        text: "Retry Edit with a larger surrounding snippet to make the match unique for each call site.",
      },
      {
        label: "C",
        text: "Ask the user to change one call site manually first to break the symmetry.",
      },
      {
        label: "D",
        text: "Skip Edit entirely and use Bash sed to do the rename.",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Edit supports disambiguation by providing more surrounding context per match — this is the first-line fix when non-unique matches cause errors. Option A (Read + Write) is the documented fallback when no unique anchor is possible. Option C shifts work to the user unnecessarily. Option D bypasses safety (sed can introduce errors in files with special characters and doesn't give you reviewable diffs).",
  },
  {
    id: "gen-dp-3",
    scenario: "developer-productivity",
    domain: "D2",
    taskId: "2.5",
    source: "generated",
    prompt:
      'A developer asks Claude Code "why is the checkout failing on step 3?" in a 200-file codebase. What\'s the most efficient initial strategy?',
    options: [
      {
        label: "A",
        text: "Grep for relevant entry points (error strings, step-3 identifiers, checkout handlers), then Read the specific files those results point to, following imports as needed.",
      },
      {
        label: "B",
        text: "Read every file under src/checkout/ upfront so Claude has full context.",
      },
      {
        label: "C",
        text: "Use Glob to list every .ts file, then Read them in batches.",
      },
      {
        label: "D",
        text: "Ask the developer to paste the relevant code manually.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Building codebase understanding incrementally (Grep for entry points → Read to follow imports and trace flow) is the recommended pattern and avoids filling context with irrelevant files. Option B wastes context on files that may not matter. Option C is essentially the same anti-pattern, just with more files. Option D shifts work to the user unnecessarily.",
  },

  // ─────────────────────────────────────────────────────────────
  // CI/CD — PDF Q10-12
  // ─────────────────────────────────────────────────────────────
  {
    id: "pdf-10",
    scenario: "ci-cd",
    domain: "D3",
    taskId: "3.6",
    number: 10,
    source: "pdf",
    prompt:
      'Your pipeline script runs claude "Analyze this pull request for security issues" but the job hangs indefinitely. Logs indicate Claude Code is waiting for interactive input. What\'s the correct approach to run Claude Code in an automated pipeline?',
    options: [
      { label: "A", text: 'Add the -p flag: claude -p "Analyze this pull request for security issues"' },
      { label: "B", text: "Set the environment variable CLAUDE_HEADLESS=true before running the command." },
      {
        label: "C",
        text: 'Redirect stdin from /dev/null: claude "Analyze this pull request for security issues" < /dev/null',
      },
      { label: "D", text: 'Add the --batch flag: claude --batch "Analyze this pull request for security issues"' },
    ],
    correctAnswer: "A",
    explanation:
      "The -p (or --print) flag is the documented way to run Claude Code in non-interactive mode. It processes the prompt, outputs the result to stdout, and exits without waiting for user input — exactly what CI/CD pipelines require. The other options reference non-existent features (CLAUDE_HEADLESS environment variable, --batch flag) or use Unix workarounds that don't properly address Claude Code's command syntax.",
  },
  {
    id: "pdf-11",
    scenario: "ci-cd",
    domain: "D4",
    taskId: "4.5",
    number: 11,
    source: "pdf",
    prompt:
      "Your team wants to reduce API costs for automated analysis. Currently, real-time Claude calls power two workflows: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes switching both to the Message Batches API for its 50% cost savings. How should you evaluate this proposal?",
    options: [
      {
        label: "A",
        text: "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks.",
      },
      {
        label: "B",
        text: "Switch both workflows to batch processing with status polling to check for completion.",
      },
      {
        label: "C",
        text: "Keep real-time calls for both workflows to avoid batch result ordering issues.",
      },
      {
        label: "D",
        text: "Switch both to batch processing with a timeout fallback to real-time if batches take too long.",
      },
    ],
    correctAnswer: "A",
    explanation:
      'The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA. This makes it unsuitable for blocking pre-merge checks where developers wait for results, but ideal for overnight batch jobs like technical debt reports. Option B is wrong because relying on "often faster" completion isn\'t acceptable for blocking workflows. Option C reflects a misconception — batch results can be correlated using custom_id fields. Option D adds unnecessary complexity when the simpler solution is matching each API to its appropriate use case.',
  },
  {
    id: "pdf-12",
    scenario: "ci-cd",
    domain: "D4",
    taskId: "4.6",
    number: 12,
    source: "pdf",
    prompt:
      "A pull request modifies 14 files across the stock tracking module. Your single-pass review analyzing all files together produces inconsistent results: detailed feedback for some files but superficial comments for others, obvious bugs missed, and contradictory feedback — flagging a pattern as problematic in one file while approving identical code elsewhere in the same PR. How should you restructure the review?",
    options: [
      {
        label: "A",
        text: "Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow.",
      },
      {
        label: "B",
        text: "Require developers to split large PRs into smaller submissions of 3-4 files before the automated review runs.",
      },
      {
        label: "C",
        text: "Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass.",
      },
      {
        label: "D",
        text: "Run three independent review passes on the full PR and only flag issues that appear in at least two of the three runs.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Splitting reviews into focused passes directly addresses the root cause: attention dilution when processing many files at once. File-by-file analysis ensures consistent depth, while a separate integration pass catches cross-file issues. Option B shifts burden to developers without improving the system. Option C misunderstands that larger context windows don't solve attention quality issues. Option D would actually suppress detection of real bugs by requiring consensus on issues that may only be caught intermittently.",
  },

  // ─────────────────────────────────────────────────────────────
  // CI/CD — Generated
  // ─────────────────────────────────────────────────────────────
  {
    id: "gen-ci-1",
    scenario: "ci-cd",
    domain: "D3",
    taskId: "3.6",
    source: "generated",
    prompt:
      "Your CI job pipes Claude Code output into a script that posts inline PR comments. The script keeps breaking because Claude's natural-language output varies between runs (different phrasing, extra commentary, missing fields). What's the most reliable fix?",
    options: [
      {
        label: "A",
        text: "Invoke Claude Code with --output-format json and --json-schema so the output conforms to a known structure the script can parse.",
      },
      {
        label: "B",
        text: "Add prompt instructions asking Claude to be consistent and always include the same fields.",
      },
      {
        label: "C",
        text: "Run Claude twice and diff the outputs to pick the common fields.",
      },
      {
        label: "D",
        text: "Have the script use regex fallbacks to tolerate any format.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "--output-format json with --json-schema produces machine-parseable, schema-conformant output — the documented mechanism for structured CI output. Option B relies on probabilistic compliance from a model whose natural tendency is varied language. Option C doubles cost and still doesn't guarantee structure. Option D is a brittle workaround compared to actual schema enforcement.",
  },
  {
    id: "gen-ci-2",
    scenario: "ci-cd",
    domain: "D3",
    taskId: "3.6",
    source: "generated",
    prompt:
      "Developers complain that your CI Claude Code review repeats the same comments on every push after they've been acknowledged. What's the most effective fix?",
    options: [
      {
        label: "A",
        text: "Include prior review findings in the context on re-runs and instruct Claude to report only new or still-unaddressed issues.",
      },
      {
        label: "B",
        text: "Reduce the review's sensitivity so it flags fewer things.",
      },
      {
        label: "C",
        text: "Only run the review on the very first commit of the PR.",
      },
      {
        label: "D",
        text: "Delete all prior review comments before each run so the slate is clean.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Passing prior findings in context and instructing Claude to report only new/unaddressed issues is the documented way to avoid duplicate comments. Option B hides real problems. Option C misses regressions introduced in later commits. Option D destroys useful history and still doesn't prevent duplicate re-flagging.",
  },
  {
    id: "gen-ci-3",
    scenario: "ci-cd",
    domain: "D4",
    taskId: "4.1",
    source: "generated",
    prompt:
      'Your Claude-powered review system has high precision overall but flags "inconsistent naming" at a 40% false-positive rate. Developers are starting to ignore the entire review because of this one noisy category. What\'s the best short-term action?',
    options: [
      {
        label: "A",
        text: "Temporarily disable the inconsistent-naming category to restore developer trust while you improve the prompt for it.",
      },
      {
        label: "B",
        text: 'Add "be conservative" to the prompt to reduce false positives across all categories.',
      },
      {
        label: "C",
        text: "Lower the confidence threshold for all findings to 90% so noisy ones are suppressed.",
      },
      {
        label: "D",
        text: "Add more categories so naming findings make up a smaller share of total output.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "High false-positive categories undermine trust in the entire system. Temporarily disabling them while improving the prompt for that category is the documented mitigation. Option B is a vague instruction that reliably fails to improve precision. Option C hides all findings indiscriminately, including accurate ones. Option D dilutes output without addressing the trust problem.",
  },

  // ─────────────────────────────────────────────────────────────
  // Structured Extraction — Generated (no PDF questions for this scenario)
  // ─────────────────────────────────────────────────────────────
  {
    id: "gen-se-1",
    scenario: "structured-extraction",
    domain: "D4",
    taskId: "4.3",
    source: "generated",
    prompt:
      "Your invoice extraction schema requires a purchase_order_number field, but many invoices don't have one. You notice the model fabricates plausible-looking PO numbers to satisfy the schema. What's the correct schema change?",
    options: [
      {
        label: "A",
        text: "Make purchase_order_number optional and nullable so the model can return null when the field isn't present in the source document.",
      },
      {
        label: "B",
        text: 'Keep it required and add a prompt instruction "do not fabricate PO numbers."',
      },
      {
        label: "C",
        text: 'Default purchase_order_number to the string "UNKNOWN" when absent.',
      },
      {
        label: "D",
        text: "Add a post-processing step that regex-validates PO numbers and blanks out invalid ones.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Required schemas pressure the model to satisfy the field at any cost, causing hallucination. Designing fields as optional (nullable) when source documents may not contain them is the documented fix. Option B relies on probabilistic compliance against a structural pressure. Option C conflates 'unknown' with a literal string value and still hallucinates structure. Option D catches some cases but doesn't prevent the hallucination from happening in the first place.",
  },
  {
    id: "gen-se-2",
    scenario: "structured-extraction",
    domain: "D4",
    taskId: "4.4",
    source: "generated",
    prompt:
      "Your Pydantic validator rejects 12% of extractions because the model places the tax_amount in the total_amount field. What's the most effective iteration strategy?",
    options: [
      {
        label: "A",
        text: "On validation failure, send a follow-up request including the original document, the failed extraction, and the specific validation error (e.g., 'tax_amount placed in total_amount field') so the model can self-correct.",
      },
      {
        label: "B",
        text: "Escalate all failed extractions to human review without retrying.",
      },
      {
        label: "C",
        text: "Retry with the same prompt — most transient errors resolve on retry.",
      },
      {
        label: "D",
        text: "Rewrite the Pydantic model to accept any field placement and normalize it later.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Retry-with-error-feedback — appending the specific validation error to guide self-correction — is the documented approach for semantic validation failures. Option B skips a low-cost recovery step. Option C is ineffective: this isn't a transient error, it's a misplacement the model will repeat without feedback. Option D throws out the schema's semantic guarantees (and downstream systems).",
  },
  {
    id: "gen-se-3",
    scenario: "structured-extraction",
    domain: "D4",
    taskId: "4.5",
    source: "generated",
    prompt:
      "You submit 500 documents to the Message Batches API overnight. 23 fail due to exceeding the context window. What's the right resubmission strategy?",
    options: [
      {
        label: "A",
        text: "Identify the 23 failures via their custom_id values, chunk each oversized document, and resubmit only those 23 in a new batch.",
      },
      {
        label: "B",
        text: "Resubmit the entire batch of 500 to make sure nothing is missed.",
      },
      {
        label: "C",
        text: "Switch to the synchronous API for the 23 failures since batch failed for them.",
      },
      {
        label: "D",
        text: "Accept the 23 losses and proceed with the 477 successful extractions.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "custom_id fields exist precisely to correlate batch responses with requests. Resubmitting only the failed 23 — with the underlying issue fixed (chunking oversized docs) — is the documented pattern. Option B doubles the cost on 477 already-successful documents. Option C works but gives up the 50% cost savings unnecessarily for a solvable problem. Option D loses data for no good reason.",
  },
];

export function getQuestionsForScenario(slug: ScenarioSlug): Question[] {
  return QUESTIONS.filter((q) => q.scenario === slug);
}

export function getQuestionsForDomain(domainId: string): Question[] {
  return QUESTIONS.filter((q) => q.domain === domainId);
}

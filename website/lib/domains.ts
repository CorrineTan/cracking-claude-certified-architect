import type { Domain } from "./types";

export const DOMAINS: Domain[] = [
  {
    id: "D1",
    number: 1,
    slug: "agentic-architecture",
    title: "Agentic Architecture & Orchestration",
    weight: 27,
    accent: "indigo",
    summary:
      "Designing agentic loops, multi-agent coordinator/subagent systems, task decomposition, session management, and hook-based enforcement with the Claude Agent SDK.",
    tasks: [
      {
        id: "1.1",
        title: "Design and implement agentic loops for autonomous task execution",
        knowledge: [
          'The agentic loop lifecycle: sending requests to Claude, inspecting stop_reason ("tool_use" vs "end_turn"), executing requested tools, and returning results for the next iteration',
          "How tool results are appended to conversation history so the model can reason about the next action",
          "The distinction between model-driven decision-making (Claude reasons about which tool to call next based on context) and pre-configured decision trees or tool sequences",
        ],
        skills: [
          'Implementing agentic loop control flow that continues when stop_reason is "tool_use" and terminates when stop_reason is "end_turn"',
          "Adding tool results to conversation context between iterations so the model can incorporate new information into its reasoning",
          "Avoiding anti-patterns such as parsing natural language signals to determine loop termination, setting arbitrary iteration caps as the primary stopping mechanism, or checking for assistant text content as a completion indicator",
        ],
        deepDive: {
          whyItMatters:
            "The loop is the core abstraction of every Agent SDK system. The exam repeatedly tests whether you know the termination signal comes from the API (`stop_reason`), not from heuristics you invent on top of it. Get this wrong and the rest of Domain 1 falls apart.",
          pitfalls: [
            '"Terminate when the assistant writes a final answer in text" — wrong. The model can produce text and still request tools afterward.',
            '"Cap iterations at 10 as the stopping condition" — iteration caps are a safety net for runaway loops, not the termination mechanism.',
            '"Parse the response for keywords like \'done\' or \'final\'" — natural-language parsing is brittle; `stop_reason` is deterministic.',
            "Forgetting to append tool_result blocks back into conversation history before the next request — the model then has no idea what happened.",
          ],
          example:
            'A support agent calls `get_customer` (`stop_reason: "tool_use"`) → you run the tool, append the result, send again → Claude now calls `lookup_order` (still `"tool_use"`) → again → Claude writes the answer (`stop_reason: "end_turn"`) → you stop. Loop ends because the API said so, not because you counted turns.',
          visuals: [
            {
              kind: "graphviz",
              title: "The agentic loop, at a glance",
              caption:
                "The loop's only real branch is the stop_reason check. Everything else is plumbing.",
              dot: `digraph AgenticLoop {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.55;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";

  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontname="Helvetica, Arial, sans-serif", fontsize=12,
        margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontname="Helvetica, Arial, sans-serif",
        fontsize=10, penwidth=1.2, arrowsize=0.8];

  user     [label="User\\nrequest", fillcolor="#f59e0b", color="#d97706"];
  send     [label="Send messages\\n+ tools"];
  claude   [label="Claude\\nresponds"];
  check    [label="stop_reason?", shape=diamond, fillcolor="#eef2ff",
            color="#6366f1", fontcolor="#1e1b4b"];
  tool     [label="Execute\\nrequested tool"];
  append   [label="Append tool_result\\nto conversation"];
  done     [label="Return final\\nanswer", fillcolor="#10b981", color="#059669"];
  error    [label="Handle /\\nsurface", fillcolor="#f43f5e", color="#e11d48"];

  subgraph cluster_loop {
    label="Agentic loop";
    labelloc="t";
    labeljust="l";
    fontcolor="#6366f1";
    fontname="Helvetica, Arial, sans-serif";
    fontsize=11;
    style="dashed,rounded";
    color="#6366f1";
    bgcolor="transparent";
    send; claude; check; tool; append;
  }

  user   -> send   [label="1"];
  send   -> claude;
  claude -> check;
  check  -> tool   [label="tool_use", color="#6366f1", fontcolor="#4f46e5", penwidth=1.6];
  tool   -> append;
  append -> send   [label="next turn", color="#6366f1", fontcolor="#4f46e5", style=dashed];
  check  -> done   [label="end_turn", color="#10b981", fontcolor="#047857", penwidth=1.6];
  check  -> error  [label="max_tokens / error", color="#f43f5e", fontcolor="#be123c", style=dashed];
}`,
            },
            {
              kind: "do-dont",
              title: "Termination signal: do vs. don't",
              caption:
                "The exam almost always offers a tempting heuristic-based option. It is always wrong.",
              items: [
                {
                  good: 'Loop while `stop_reason === "tool_use"`; exit on `"end_turn"`.',
                  bad: 'Parse the assistant\'s text for words like "done", "final", or "thanks".',
                  note: "Claude can produce text and still request tools afterward. Only the API field is deterministic.",
                },
                {
                  good: "Use iteration caps only as a safety net for runaway loops (e.g. 25+).",
                  bad: "Use a hard cap like `max_turns = 10` as the primary stopping condition.",
                  note: "Caps exist to bound cost when something goes wrong — not to decide when the task is complete.",
                },
                {
                  good: "Append every `tool_result` block to the conversation before the next request.",
                  bad: "Drop tool outputs, or summarise them out-of-band and hope the model remembers.",
                  note: "The model has no state between calls. If you don't send the result back, it never happened.",
                },
              ],
            },
            {
              kind: "sequence",
              title: "Concrete example: support agent, two tools",
              caption:
                "Same flow as the walkthrough below, step by step. Notice where the loop starts and where it ends.",
              actors: [
                { id: "user", label: "User", tone: "amber" },
                { id: "agent", label: "Your agent loop", tone: "indigo" },
                { id: "claude", label: "Claude API", tone: "ink" },
                { id: "tools", label: "Tools", tone: "emerald" },
              ],
              steps: [
                {
                  from: "user",
                  to: "agent",
                  message: '"Where is order 1234?"',
                  highlight: "start",
                },
                {
                  from: "agent",
                  to: "claude",
                  message: "Send messages + tool definitions",
                },
                {
                  from: "claude",
                  to: "agent",
                  message: "stop_reason = tool_use · get_customer(email)",
                  note: "Loop continues — tool_use means more work to do.",
                  highlight: "loop",
                },
                { from: "agent", to: "tools", message: "Run get_customer" },
                { from: "tools", to: "agent", message: "Customer record" },
                {
                  from: "agent",
                  to: "claude",
                  message: "Append tool_result, send again",
                  highlight: "loop",
                },
                {
                  from: "claude",
                  to: "agent",
                  message: "stop_reason = tool_use · lookup_order(1234)",
                  highlight: "loop",
                },
                { from: "agent", to: "tools", message: "Run lookup_order" },
                { from: "tools", to: "agent", message: "Order + tracking" },
                {
                  from: "agent",
                  to: "claude",
                  message: "Append tool_result, send again",
                  highlight: "loop",
                },
                {
                  from: "claude",
                  to: "agent",
                  message: 'stop_reason = end_turn · "Shipped Tue, arrives Fri"',
                  note: "end_turn: loop exits. The API made the call, not us.",
                  highlight: "end",
                },
                {
                  from: "agent",
                  to: "user",
                  message: "Final answer",
                  highlight: "end",
                },
              ],
            },
          ],
        },
      },
      {
        id: "1.2",
        title: "Orchestrate multi-agent systems with coordinator-subagent patterns",
        knowledge: [
          "Hub-and-spoke architecture where a coordinator agent manages all inter-subagent communication, error handling, and information routing",
          "How subagents operate with isolated context — they do not inherit the coordinator's conversation history automatically",
          "The role of the coordinator in task decomposition, delegation, result aggregation, and deciding which subagents to invoke based on query complexity",
          "Risks of overly narrow task decomposition by the coordinator, leading to incomplete coverage of broad research topics",
        ],
        skills: [
          "Designing coordinator agents that analyze query requirements and dynamically select which subagents to invoke rather than always routing through the full pipeline",
          "Partitioning research scope across subagents to minimize duplication (e.g., assigning distinct subtopics or source types to each agent)",
          "Implementing iterative refinement loops where the coordinator evaluates synthesis output for gaps, re-delegates to search and analysis subagents with targeted queries, and re-invokes synthesis until coverage is sufficient",
          "Routing all subagent communication through the coordinator for observability, consistent error handling, and controlled information flow",
        ],
        deepDive: {
          whyItMatters:
            "The exam's distractors for multi-agent questions are almost always \"let subagents talk to each other\" or \"fixed pipeline that always runs every step\". Hub-and-spoke with dynamic selection is the right answer — it shows up in Multi-Agent Research and Developer Productivity scenarios repeatedly.",
          pitfalls: [
            "Peer-to-peer subagent calls — looks elegant but kills observability and makes error handling impossible.",
            "Always running the full pipeline (search → analyze → synthesize) regardless of query complexity — wastes tokens on simple lookups.",
            "Over-decomposing: splitting a research topic into 12 narrow subtasks leaves coverage gaps between them.",
            "Coordinator writes procedural instructions like \"search these 4 sources\" instead of goal-level prompts — subagents can't adapt.",
          ],
          example:
            'For "What\'s the Q3 revenue of Acme Corp?", the coordinator should invoke only the web-search subagent, not the full research pipeline. For "Compare 2024 climate policy in Germany vs Japan", it fans out: one subagent per country, both return structured findings, a synthesis subagent merges them, coordinator re-delegates if gaps remain.',
          visuals: [
            {
              kind: "graphviz",
              title: "Hub-and-spoke vs peer-to-peer",
              caption:
                "Left is the right answer. Right is the tempting distractor the exam keeps using.",
              dot: `digraph MultiAgent {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.6;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontname="Helvetica, Arial, sans-serif", fontsize=12,
        margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontname="Helvetica, Arial, sans-serif",
        fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_good {
    label="✓  Hub-and-spoke (use this)";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    coord1 [label="Coordinator", fillcolor="#6366f1", color="#4f46e5"];
    s1a    [label="Search\\nsubagent"];
    s1b    [label="Analysis\\nsubagent"];
    s1c    [label="Synthesis\\nsubagent"];
    coord1 -> s1a;
    coord1 -> s1b;
    coord1 -> s1c;
    s1a -> coord1 [style=dashed, color="#94a3b8"];
    s1b -> coord1 [style=dashed, color="#94a3b8"];
    s1c -> coord1 [style=dashed, color="#94a3b8"];
  }

  subgraph cluster_bad {
    label="✗  Peer-to-peer (observability dies)";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    coord2 [label="Coordinator", fillcolor="#6366f1", color="#4f46e5"];
    s2a    [label="Search\\nsubagent"];
    s2b    [label="Analysis\\nsubagent"];
    s2c    [label="Synthesis\\nsubagent"];
    coord2 -> s2a;
    s2a -> s2b [color="#f43f5e"];
    s2b -> s2c [color="#f43f5e"];
    s2c -> coord2 [style=dashed, color="#94a3b8"];
  }
}`,
            },
            {
              kind: "graphviz",
              title: "Dynamic selection, not fixed pipeline",
              caption:
                "A simple lookup shouldn't pay the cost of a full research fan-out.",
              dot: `digraph DynamicSelect {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  q        [label="Incoming\\nquery", fillcolor="#f59e0b", color="#d97706"];
  coord    [label="Coordinator", fillcolor="#6366f1", color="#4f46e5"];
  decide   [label="Complexity?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  search   [label="Search\\nonly"];
  fanout   [label="Search +\\nAnalysis +\\nSynthesis"];
  ans      [label="Answer", fillcolor="#10b981", color="#059669"];

  q -> coord;
  coord -> decide;
  decide -> search [label="simple lookup", color="#10b981", fontcolor="#047857"];
  decide -> fanout [label="multi-faceted", color="#6366f1", fontcolor="#4f46e5"];
  search -> ans;
  fanout -> ans;
}`,
            },
            {
              kind: "do-dont",
              title: "Multi-agent design: do vs. don't",
              items: [
                {
                  good: "Route every subagent reply back through the coordinator for logging and error handling.",
                  bad: "Let subagents call each other directly to save a hop.",
                  note: "Peer-to-peer looks elegant in a whiteboard but makes observability and error recovery impossible.",
                },
                {
                  good: "Coordinator decides which subagents to call based on the query.",
                  bad: "Always run the fixed pipeline (search → analyze → synthesize) regardless of complexity.",
                  note: "Simple questions burn tokens for no gain when you force the full fan-out.",
                },
                {
                  good: "Prompt subagents with goals and quality criteria.",
                  bad: 'Prompt subagents with step-by-step procedures ("search these 4 sources, in this order").',
                  note: "Procedural prompts kill the subagent's ability to adapt when one source is unhelpful.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "1.3",
        title: "Configure subagent invocation, context passing, and spawning",
        knowledge: [
          'The Task tool as the mechanism for spawning subagents, and the requirement that allowedTools must include "Task" for a coordinator to invoke subagents',
          "That subagent context must be explicitly provided in the prompt — subagents do not automatically inherit parent context or share memory between invocations",
          "The AgentDefinition configuration including descriptions, system prompts, and tool restrictions for each subagent type",
          "Fork-based session management for exploring divergent approaches from a shared analysis baseline",
        ],
        skills: [
          "Including complete findings from prior agents directly in the subagent's prompt (e.g., passing web search results and document analysis outputs to the synthesis subagent)",
          "Using structured data formats to separate content from metadata (source URLs, document names, page numbers) when passing context between agents to preserve attribution",
          "Spawning parallel subagents by emitting multiple Task tool calls in a single coordinator response rather than across separate turns",
          "Designing coordinator prompts that specify research goals and quality criteria rather than step-by-step procedural instructions, to enable subagent adaptability",
        ],
        deepDive: {
          whyItMatters:
            "The single biggest gotcha in multi-agent design: subagents do NOT inherit parent context. If the PDF question shows a subagent that \"can't see prior findings\", the answer is always to pass context in the prompt — not increase context window, not enable shared memory, not any other shiny option.",
          pitfalls: [
            "Assuming subagents see the coordinator's conversation history — they don't. Each Task call is a fresh context.",
            'Forgetting `allowedTools` must include `"Task"` for a coordinator to spawn subagents at all.',
            "Spawning subagents sequentially (one Task call per turn) when they could run in parallel — wastes wall-clock time.",
            "Passing raw context blobs without structure — subagents lose attribution (source URLs, document names, dates).",
          ],
          example:
            'Coordinator emits 3 Task tool calls in one response: `Task(subagent="web_search", prompt="...")`, `Task(subagent="doc_analysis", prompt="...with prior findings embedded verbatim...")`, `Task(subagent="synthesis", prompt="...")`. Each prompt explicitly includes prior structured findings. All three run in parallel.',
          visuals: [
            {
              kind: "graphviz",
              title: "Subagent context is NOT inherited",
              caption:
                "Each Task call starts a fresh context. Anything you don't put in the prompt is gone.",
              dot: `digraph ContextIsolation {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_coord {
    label="Coordinator context";
    labelloc="t"; labeljust="l";
    fontcolor="#4f46e5"; fontsize=11;
    style="dashed,rounded"; color="#6366f1"; bgcolor="transparent";
    coord [label="Coordinator", fillcolor="#6366f1", color="#4f46e5"];
    history [label="Conversation\\nhistory + prior\\nfindings"];
    coord -> history [style=dotted, color="#94a3b8", arrowhead=none];
  }

  subgraph cluster_sub {
    label="Subagent (fresh context)";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    sub [label="Subagent"];
    blank [label="(nothing\\ninherited)", fillcolor="#fef2f2", color="#f43f5e", fontcolor="#881337"];
    sub -> blank [style=dotted, color="#f43f5e", arrowhead=none];
  }

  coord -> sub [label="Task(prompt=...)\\nembed context here", color="#6366f1", fontcolor="#4f46e5", penwidth=1.6];
}`,
            },
            {
              kind: "graphviz",
              title: "Parallel Task calls in one turn",
              caption:
                "Emit multiple Task tool calls in a single coordinator response. They run in parallel.",
              dot: `digraph ParallelTask {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.6;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  coord  [label="Coordinator turn", fillcolor="#6366f1", color="#4f46e5"];
  t1     [label="Task(web_search)"];
  t2     [label="Task(doc_analysis)\\nembeds prior findings"];
  t3     [label="Task(synthesis)\\nembeds both above"];
  merge  [label="Results merge\\nback to coordinator", fillcolor="#10b981", color="#059669"];

  coord -> t1 [label="parallel", color="#6366f1", fontcolor="#4f46e5"];
  coord -> t2 [label="parallel", color="#6366f1", fontcolor="#4f46e5"];
  coord -> t3 [label="parallel", color="#6366f1", fontcolor="#4f46e5"];
  t1 -> merge [style=dashed];
  t2 -> merge [style=dashed];
  t3 -> merge [style=dashed];
}`,
            },
            {
              kind: "do-dont",
              title: "Subagent context: do vs. don't",
              items: [
                {
                  good: "Embed prior structured findings verbatim in the subagent's prompt.",
                  bad: 'Assume subagents can "see" the coordinator\'s conversation history.',
                  note: "Subagents have zero access to anything outside what you put in their prompt. This is the #1 gotcha.",
                },
                {
                  good: 'Include `"Task"` in the coordinator\'s `allowedTools` list.',
                  bad: "Forget to grant Task tool access — the coordinator silently can't spawn anyone.",
                  note: "Without the Task tool, the coordinator has no mechanism to invoke subagents at all.",
                },
                {
                  good: "Emit multiple Task calls in a single coordinator response to parallelize.",
                  bad: "Spawn subagents one per turn in a serial chain.",
                  note: "Serial spawning wastes wall-clock time when the subagents don't depend on each other.",
                },
                {
                  good: "Pass structured context (source URLs, doc IDs, dates) separate from content.",
                  bad: "Dump raw text blobs and hope attribution survives.",
                  note: "Without structure, citations and source tracing disappear as the graph deepens.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "1.4",
        title: "Implement multi-step workflows with enforcement and handoff patterns",
        knowledge: [
          "The difference between programmatic enforcement (hooks, prerequisite gates) and prompt-based guidance for workflow ordering",
          "When deterministic compliance is required (e.g., identity verification before financial operations), prompt instructions alone have a non-zero failure rate",
          "Structured handoff protocols for mid-process escalation that include customer details, root cause analysis, and recommended actions",
        ],
        skills: [
          "Implementing programmatic prerequisites that block downstream tool calls until prerequisite steps have completed (e.g., blocking process_refund until get_customer has returned a verified customer ID)",
          "Decomposing multi-concern customer requests into distinct items, then investigating each in parallel using shared context before synthesizing a unified resolution",
          "Compiling structured handoff summaries (customer ID, root cause, refund amount, recommended action) when escalating to human agents who lack access to the conversation transcript",
        ],
        deepDive: {
          whyItMatters:
            "This is the \"prompt vs. code\" question. Any time the business says \"must always\" — identity verification, threshold checks, compliance — the correct answer is programmatic (hook or prerequisite gate), not a sterner system prompt. The distractor will always be \"strengthen the prompt\".",
          pitfalls: [
            "\"Add a stronger instruction to the system prompt\" — prompt-based compliance has a non-zero failure rate. Unacceptable for financial operations.",
            "Putting the gate inside the tool itself rather than in a hook — harder to audit and reuse across tools.",
            "Human handoff summaries that just link the conversation transcript — the human agent doesn't have access to it.",
            "Decomposing a multi-concern request (\"I was overcharged AND want to cancel\") into a single tool call instead of separate investigation paths.",
          ],
          example:
            "Before `process_refund` runs, a pre-tool hook inspects `ConversationState`. If `verified_customer_id` is unset, the hook blocks the call and redirects the model to call `get_customer` first. The system prompt says nothing about this — the gate is deterministic code.",
          visuals: [
            {
              kind: "graphviz",
              title: "Pre-tool hook enforces the prerequisite",
              caption:
                "The gate lives in code, not in a prompt. Business-critical rules must be deterministic.",
              dot: `digraph PreToolHook {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  claude  [label="Claude\\nresponds", fillcolor="#6366f1", color="#4f46e5"];
  call    [label="tool_use:\\nprocess_refund"];
  hook    [label="Pre-tool hook", fillcolor="#f59e0b", color="#d97706"];
  check   [label="verified\\ncustomer?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  run     [label="Execute\\nprocess_refund", fillcolor="#10b981", color="#059669"];
  block   [label="Block + redirect\\n→ get_customer first", fillcolor="#f43f5e", color="#e11d48"];

  claude -> call;
  call -> hook;
  hook -> check;
  check -> run   [label="yes", color="#10b981", fontcolor="#047857", penwidth=1.6];
  check -> block [label="no", color="#f43f5e", fontcolor="#be123c", penwidth=1.6];
  block -> claude [style=dashed, label="reasks model", color="#94a3b8"];
}`,
            },
            {
              kind: "graphviz",
              title: "Prompt rule vs. code rule",
              caption:
                "\"Must always\" = code. If the answer choice is \"strengthen the system prompt\", it's wrong.",
              dot: `digraph PromptVsCode {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.6;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_prompt {
    label="Prompt-based (probabilistic)";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    p_sys [label="System prompt:\\n\\"always verify\\nfirst\\""];
    p_out [label="Most of the time", fillcolor="#f59e0b", color="#d97706"];
    p_sys -> p_out [label="~99%", color="#f43f5e", fontcolor="#be123c"];
  }

  subgraph cluster_code {
    label="Code-based (deterministic)";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    c_hook [label="Pre-tool hook\\nchecks state"];
    c_out  [label="Always", fillcolor="#10b981", color="#059669"];
    c_hook -> c_out [label="100%", color="#10b981", fontcolor="#047857", penwidth=1.6];
  }
}`,
            },
            {
              kind: "do-dont",
              title: "Enforcement: do vs. don't",
              items: [
                {
                  good: "Use a pre-tool hook (or prerequisite gate) to block downstream tools until prerequisites complete.",
                  bad: 'Add "you must always verify the customer first" to the system prompt.',
                  note: "Prompt compliance is probabilistic. Financial ops need 100%, and only code guarantees that.",
                },
                {
                  good: "Put the gate in a hook so it's reusable across tools and auditable.",
                  bad: "Put the check inside each tool's implementation.",
                  note: "Per-tool checks scatter policy across the codebase; hooks keep it centralized.",
                },
                {
                  good: "Build structured handoff summaries (customer ID, root cause, action) for human escalation.",
                  bad: "Link the conversation transcript and call it a handoff.",
                  note: "Humans receiving an escalation usually can't see the transcript — they need the facts directly.",
                },
                {
                  good: "Decompose multi-concern requests into parallel investigation paths with shared context.",
                  bad: 'Collapse "I was overcharged AND want to cancel" into a single tool call.',
                  note: "Two concerns = two investigations. One tool call will resolve neither cleanly.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "1.5",
        title: "Apply Agent SDK hooks for tool call interception and data normalization",
        knowledge: [
          "Hook patterns (e.g., PostToolUse) that intercept tool results for transformation before the model processes them",
          "Hook patterns that intercept outgoing tool calls to enforce compliance rules (e.g., blocking refunds above a threshold)",
          "The distinction between using hooks for deterministic guarantees versus relying on prompt instructions for probabilistic compliance",
        ],
        skills: [
          "Implementing PostToolUse hooks to normalize heterogeneous data formats (Unix timestamps, ISO 8601, numeric status codes) from different MCP tools before the agent processes them",
          "Implementing tool call interception hooks that block policy-violating actions (e.g., refunds exceeding $500) and redirect to alternative workflows (e.g., human escalation)",
          "Choosing hooks over prompt-based enforcement when business rules require guaranteed compliance",
        ],
        deepDive: {
          whyItMatters:
            "Hooks have two flavors and the exam tests both: PostToolUse (normalize/transform tool results before the model sees them) and pre-tool-call interception (block or redirect actions). Recognizing which flavor solves a given problem is the whole question.",
          pitfalls: [
            "Confusing PostToolUse (transforms outputs) with pre-call hooks (blocks inputs) — different lifecycles.",
            "Using prompts to ask the model to normalize heterogeneous date formats across 5 MCP tools — you'll never get 100% consistency.",
            "Hooks that mutate tool results silently without leaving an audit trail.",
            "Thinking hooks replace MCP-side validation — they supplement it client-side but don't eliminate server-side checks.",
          ],
          example:
            "Three MCP tools return timestamps as Unix seconds, ISO 8601, and \"Mar 3 2024\". A PostToolUse hook intercepts each result and rewrites the timestamp field to ISO 8601 before it lands in conversation history. The model always sees one format.",
          visuals: [
            {
              kind: "graphviz",
              title: "Pre-tool vs. PostToolUse hook lifecycle",
              caption:
                "Same request, two hook points. Pre intercepts the call; Post intercepts the result.",
              dot: `digraph HookLifecycle {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.65;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  model  [label="Claude", fillcolor="#6366f1", color="#4f46e5"];
  pre    [label="Pre-tool\\nhook\\n(block / redirect)", fillcolor="#f59e0b", color="#d97706"];
  tool   [label="Tool executes"];
  post   [label="PostToolUse\\nhook\\n(transform result)", fillcolor="#f59e0b", color="#d97706"];
  back   [label="Result in\\nconversation", fillcolor="#10b981", color="#059669"];

  model -> pre  [label="tool_use"];
  pre   -> tool [label="allowed", color="#10b981", fontcolor="#047857"];
  pre   -> model [label="blocked → reroute", color="#f43f5e", fontcolor="#be123c", style=dashed];
  tool  -> post;
  post  -> back;
  back  -> model [style=dashed, label="next turn", color="#94a3b8"];
}`,
            },
            {
              kind: "graphviz",
              title: "Which hook solves which problem?",
              caption: "Recognize the problem shape — the hook flavor follows from it.",
              dot: `digraph HookDecision {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  prob [label="What's the\\nproblem?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  inShape  [label="\\"Model tries to\\ndo something\\ndisallowed\\""];
  outShape [label="\\"Tool results\\nare inconsistent\\nor too large\\""];
  pre  [label="Pre-tool hook", fillcolor="#f59e0b", color="#d97706"];
  post [label="PostToolUse hook", fillcolor="#f59e0b", color="#d97706"];

  prob -> inShape;
  prob -> outShape;
  inShape  -> pre  [label="block / redirect", color="#6366f1", fontcolor="#4f46e5", penwidth=1.6];
  outShape -> post [label="normalize / trim", color="#6366f1", fontcolor="#4f46e5", penwidth=1.6];
}`,
            },
            {
              kind: "do-dont",
              title: "Hook choices: do vs. don't",
              items: [
                {
                  good: "Use PostToolUse to normalize heterogeneous tool outputs into one format.",
                  bad: "Ask the model in a prompt to reconcile 5 different timestamp formats.",
                  note: "Heterogeneous data is a code problem. Prompts will get it mostly right, not 100%.",
                },
                {
                  good: "Use pre-tool hooks to block policy violations (e.g., refund > $500 → escalate).",
                  bad: "Rely on the model reading a policy paragraph and self-enforcing.",
                  note: "Deterministic rules (thresholds, permissions) belong in hooks, not prompts.",
                },
                {
                  good: "Treat client-side hooks as complementary to server-side (MCP) validation.",
                  bad: "Drop MCP-side checks because the hook already enforces the rule.",
                  note: "Defense-in-depth: server-side validation is still the source of truth for the tool.",
                },
                {
                  good: "Log every hook mutation for audit.",
                  bad: "Silently rewrite tool results in a hook with no trail.",
                  note: "Silent transformation makes debugging and compliance review very hard.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "1.6",
        title: "Design task decomposition strategies for complex workflows",
        knowledge: [
          "When to use fixed sequential pipelines (prompt chaining) versus dynamic adaptive decomposition based on intermediate findings",
          "Prompt chaining patterns that break reviews into sequential steps (e.g., analyze each file individually, then run a cross-file integration pass)",
          "The value of adaptive investigation plans that generate subtasks based on what is discovered at each step",
        ],
        skills: [
          "Selecting task decomposition patterns appropriate to the workflow: prompt chaining for predictable multi-aspect reviews, dynamic decomposition for open-ended investigation tasks",
          "Splitting large code reviews into per-file local analysis passes plus a separate cross-file integration pass to avoid attention dilution",
          'Decomposing open-ended tasks (e.g., "add comprehensive tests to a legacy codebase") by first mapping structure, identifying high-impact areas, then creating a prioritized plan that adapts as dependencies are discovered',
        ],
        deepDive: {
          whyItMatters:
            "Two decomposition modes: fixed sequential pipelines (prompt chaining) for predictable multi-aspect work, and dynamic/adaptive decomposition for open-ended investigation. The trick is recognizing which mode the question describes.",
          pitfalls: [
            "Using a fixed pipeline for an open-ended task (\"find security issues\") — misses issues that only appear when you follow emerging leads.",
            "Using dynamic decomposition for a simple multi-aspect review (\"check style, security, performance\") — unnecessary overhead.",
            "Cross-file integration in the same pass as per-file analysis — attention dilution; the model misses things in both.",
            "Decomposing open-ended work without first mapping structure, so priorities are guessed instead of data-driven.",
          ],
          example:
            "Reviewing a 40-file PR: prompt-chain per-file local analysis (bugs, style, security in each file) → separate cross-file pass for integration issues (API contract mismatches, circular imports). Two focused passes beat one diluted pass.",
          visuals: [
            {
              kind: "graphviz",
              title: "Prompt chaining vs. dynamic decomposition",
              caption:
                "Fixed scope, multiple aspects → chain. Open-ended, emergent → dynamic.",
              dot: `digraph Decomp {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  q [label="Task shape?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];

  subgraph cluster_chain {
    label="Prompt chaining";
    labelloc="t"; labeljust="l";
    fontcolor="#4f46e5"; fontsize=11;
    style="dashed,rounded"; color="#6366f1"; bgcolor="transparent";
    c1 [label="Step 1:\\nper-file local"];
    c2 [label="Step 2:\\ncross-file integration"];
    c1 -> c2;
  }

  subgraph cluster_dyn {
    label="Dynamic decomposition";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    d1 [label="Map structure"];
    d2 [label="Prioritize\\nhigh-impact areas"];
    d3 [label="Plan adapts\\nas leads emerge", fillcolor="#10b981", color="#059669"];
    d1 -> d2 -> d3;
  }

  q -> c1 [label="predictable\\nmulti-aspect", color="#6366f1", fontcolor="#4f46e5"];
  q -> d1 [label="open-ended\\ninvestigation", color="#10b981", fontcolor="#047857"];
}`,
            },
            {
              kind: "graphviz",
              title: "Why two passes beat one (PR review)",
              caption:
                "Local analysis and cross-file integration are different attention problems.",
              dot: `digraph TwoPass {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.35;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  pr [label="40-file PR", fillcolor="#f59e0b", color="#d97706"];

  subgraph cluster_p1 {
    label="Pass 1: per-file local";
    labelloc="t"; labeljust="l";
    fontcolor="#4f46e5"; fontsize=11;
    style="dashed,rounded"; color="#6366f1"; bgcolor="transparent";
    f1 [label="file_1.ts"];
    f2 [label="file_2.ts"];
    fN [label="... file_40.ts"];
  }
  p2 [label="Pass 2: cross-file\\nintegration", fillcolor="#10b981", color="#059669"];
  out [label="Review report"];

  pr -> f1;
  pr -> f2;
  pr -> fN;
  f1 -> p2 [style=dashed];
  f2 -> p2 [style=dashed];
  fN -> p2 [style=dashed];
  p2 -> out;
}`,
            },
            {
              kind: "do-dont",
              title: "Decomposition: do vs. don't",
              items: [
                {
                  good: "Use prompt chaining for predictable multi-aspect reviews (style, security, perf).",
                  bad: "Use dynamic decomposition for a checklist task.",
                  note: "Dynamic has overhead; fixed pipelines are fine when scope is known.",
                },
                {
                  good: 'Use dynamic decomposition for open-ended tasks ("find security issues").',
                  bad: "Use a fixed pipeline that never adapts to emerging leads.",
                  note: "Open-ended work needs the agent to follow new threads as it discovers them.",
                },
                {
                  good: "Separate per-file local analysis from cross-file integration passes.",
                  bad: "Ask the model to do both in one pass.",
                  note: "Attention dilutes — the model misses things in both the local and integration axes.",
                },
                {
                  good: "Map structure first, then prioritize, then plan.",
                  bad: "Start generating tasks before understanding the code's shape.",
                  note: "Priorities guessed before structure is mapped are nearly always wrong.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "1.7",
        title: "Manage session state, resumption, and forking",
        knowledge: [
          "Named session resumption using --resume <session-name> to continue a specific prior conversation",
          "fork_session for creating independent branches from a shared analysis baseline to explore divergent approaches",
          "The importance of informing the agent about changes to previously analyzed files when resuming sessions after code modifications",
          "Why starting a new session with a structured summary is more reliable than resuming with stale tool results",
        ],
        skills: [
          "Using --resume with session names to continue named investigation sessions across work sessions",
          "Using fork_session to create parallel exploration branches (e.g., comparing two testing strategies or refactoring approaches from a shared codebase analysis)",
          "Choosing between session resumption (when prior context is mostly valid) and starting fresh with injected summaries (when prior tool results are stale)",
          "Informing a resumed session about specific file changes for targeted re-analysis rather than requiring full re-exploration",
        ],
        deepDive: {
          whyItMatters:
            "`--resume <name>` vs `fork_session` vs \"start fresh with a summary\" is a classic three-way distractor question. Each one has a right context: resume for continuing, fork for parallel exploration, fresh+summary for when prior tool results are stale.",
          pitfalls: [
            "Resuming a session when the underlying files have changed significantly — stale tool results corrupt reasoning.",
            "Using `fork_session` when you actually want parallel exploration of the same baseline but don't share the baseline correctly.",
            "Not naming sessions, then being unable to find the right one to resume later.",
            "Restarting fresh and losing all the context exploration work from yesterday when resuming with a summary would have sufficed.",
          ],
          example:
            "You spent 3 hours mapping a codebase yesterday. Today you want to try two refactor strategies: use `fork_session` twice from the analysis checkpoint → Strategy A in one branch, Strategy B in another. Compare outcomes without redoing exploration.",
          visuals: [
            {
              kind: "graphviz",
              title: "Resume vs. fork vs. fresh+summary",
              caption:
                "Classic three-way distractor. Each has exactly one right context.",
              dot: `digraph SessionChoice {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  q1 [label="Are prior tool\\nresults still valid?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  q2 [label="Want to explore\\ndivergent approaches\\nfrom same baseline?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];

  resume [label="--resume\\n<session-name>", fillcolor="#10b981", color="#059669"];
  fork   [label="fork_session\\nfrom checkpoint", fillcolor="#6366f1", color="#4f46e5"];
  fresh  [label="Start fresh\\n+ inject summary", fillcolor="#f59e0b", color="#d97706"];

  q1 -> q2    [label="yes", color="#10b981", fontcolor="#047857"];
  q1 -> fresh [label="no (stale)", color="#f43f5e", fontcolor="#be123c"];
  q2 -> fork  [label="yes", color="#6366f1", fontcolor="#4f46e5", penwidth=1.6];
  q2 -> resume [label="no, just continue", color="#10b981", fontcolor="#047857", penwidth=1.6];
}`,
            },
            {
              kind: "graphviz",
              title: "Fork_session, visualized",
              caption:
                "One analysis baseline, two strategies. No re-exploration.",
              dot: `digraph Fork {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.5;
  ranksep=0.75;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  base [label="Analysis baseline\\n(3 hours of mapping)", fillcolor="#6366f1", color="#4f46e5"];

  a [label="Strategy A branch", fillcolor="#10b981", color="#059669"];
  b [label="Strategy B branch", fillcolor="#f59e0b", color="#d97706"];
  cmp [label="Compare\\noutcomes"];

  base -> a [label="fork_session", color="#6366f1", fontcolor="#4f46e5", penwidth=1.6];
  base -> b [label="fork_session", color="#6366f1", fontcolor="#4f46e5", penwidth=1.6];
  a -> cmp [style=dashed];
  b -> cmp [style=dashed];
}`,
            },
            {
              kind: "do-dont",
              title: "Session state: do vs. don't",
              items: [
                {
                  good: "Name every session (`--resume <name>`) so you can find it later.",
                  bad: "Rely on anonymous sessions and lose the one you need.",
                  note: "Unnamed sessions evaporate into history. Nothing to resume.",
                },
                {
                  good: "Use `fork_session` when you want two branches from the same baseline.",
                  bad: "Open two fresh sessions and re-explore the codebase twice.",
                  note: "Forking preserves analysis work; fresh sessions throw it away.",
                },
                {
                  good: "Start fresh with a structured summary when prior tool results are stale.",
                  bad: "Resume a session after files changed significantly.",
                  note: "Stale tool results poison reasoning — the model won't know what it remembers is wrong.",
                },
                {
                  good: "When resuming, tell the agent which files changed so it re-analyzes just those.",
                  bad: "Resume silently and expect the agent to re-check every file.",
                  note: "Targeted re-analysis beats either full re-exploration or silently stale state.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "D2",
    number: 2,
    slug: "tool-design-mcp",
    title: "Tool Design & MCP Integration",
    weight: 18,
    accent: "emerald",
    summary:
      "Writing effective tool descriptions, structuring error responses, distributing tools across agents, configuring MCP servers, and using built-in tools (Read/Write/Edit/Bash/Grep/Glob) effectively.",
    tasks: [
      {
        id: "2.1",
        title: "Design effective tool interfaces with clear descriptions and boundaries",
        knowledge: [
          "Tool descriptions as the primary mechanism LLMs use for tool selection; minimal descriptions lead to unreliable selection among similar tools",
          "The importance of including input formats, example queries, edge cases, and boundary explanations in tool descriptions",
          "How ambiguous or overlapping tool descriptions cause misrouting (e.g., analyze_content vs analyze_document with near-identical descriptions)",
          "The impact of system prompt wording on tool selection: keyword-sensitive instructions can create unintended tool associations",
        ],
        skills: [
          "Writing tool descriptions that clearly differentiate each tool's purpose, expected inputs, outputs, and when to use it versus similar alternatives",
          "Renaming tools and updating descriptions to eliminate functional overlap (e.g., renaming analyze_content to extract_web_results with a web-specific description)",
          "Splitting generic tools into purpose-specific tools with defined input/output contracts (e.g., splitting a generic analyze_document into extract_data_points, summarize_content, and verify_claim_against_source)",
          "Reviewing system prompts for keyword-sensitive instructions that might override well-written tool descriptions",
        ],
        deepDive: {
          whyItMatters:
            "When two tools have near-identical names/descriptions, the model guesses — often wrong. The exam tests this with pairs like `analyze_content` vs `analyze_document`. The fix is almost always to rename + rewrite descriptions, not to add prompt-level hints.",
          pitfalls: [
            "One-line tool descriptions (\"Analyzes the document\") — gives the model nothing to discriminate on.",
            "Relying on the system prompt to say \"use tool X for web results\" instead of fixing the tool name/description itself.",
            "Splitting tools purely by caller convenience rather than by purpose — the model still can't tell them apart.",
            "Not documenting boundary conditions (\"what happens if the URL is not a document?\") — model picks wrong tool in edge cases.",
          ],
          example:
            "`analyze_content` (used for both web and document analysis) gets renamed to `extract_web_results` with a description starting \"Call this ONLY for search-engine-style web snippets, not full documents. Input: list of URL+snippet objects.\" Selection reliability jumps.",
          visuals: [
            {
              kind: "graphviz",
              title: "Ambiguous names → misrouting",
              caption:
                "When two tools sit next to each other with overlapping descriptions, the model guesses.",
              dot: `digraph ToolOverlap {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_bad {
    label="✗  Ambiguous pair";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    q1  [label="Web snippet\\nto process", fillcolor="#f59e0b", color="#d97706"];
    a1  [label="analyze_content\\n\\"analyzes content\\""];
    a2  [label="analyze_document\\n\\"analyzes a document\\""];
    pick [label="Model picks one\\n≈ coin flip", fillcolor="#f43f5e", color="#e11d48"];
    q1 -> a1 [color="#f43f5e"];
    q1 -> a2 [color="#f43f5e"];
    a1 -> pick [style=dashed];
    a2 -> pick [style=dashed];
  }

  subgraph cluster_good {
    label="✓  Differentiated tools";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    q2 [label="Web snippet\\nto process", fillcolor="#f59e0b", color="#d97706"];
    b1 [label="extract_web_results\\n\\"ONLY search snippets\\""];
    b2 [label="analyze_document\\n\\"full PDFs / docs\\""];
    right [label="Correct tool\\neach time", fillcolor="#10b981", color="#059669"];
    q2 -> b1 [label="match", color="#10b981", fontcolor="#047857", penwidth=1.6];
    q2 -> b2 [style=dotted, label="not-this", color="#94a3b8"];
    b1 -> right;
  }
}`,
            },
            {
              kind: "do-dont",
              title: "Tool interfaces: do vs. don't",
              items: [
                {
                  good: "Write descriptions with input format, example queries, and boundary conditions.",
                  bad: 'One-liners like "Analyzes the document."',
                  note: "The description is the only signal the model has for tool selection — treat it as a spec.",
                },
                {
                  good: "Rename + rewrite when two tools overlap (e.g. analyze_content → extract_web_results).",
                  bad: "Add a line to the system prompt telling the model which tool to prefer.",
                  note: "Prompt-level hints get overridden; a well-named tool with a sharp description wins every time.",
                },
                {
                  good: "Split generic tools into purpose-specific ones (extract_data_points, summarize_content, verify_claim).",
                  bad: "Keep a catch-all analyze_document and hope the model infers which mode to use.",
                  note: "Purpose-specific tools give the model a cleaner decision surface.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "2.2",
        title: "Implement structured error responses for MCP tools",
        knowledge: [
          "The MCP isError flag pattern for communicating tool failures back to the agent",
          "The distinction between transient errors (timeouts, service unavailability), validation errors (invalid input), business errors (policy violations), and permission errors",
          'Why uniform error responses (generic "Operation failed") prevent the agent from making appropriate recovery decisions',
          "The difference between retryable and non-retryable errors, and how returning structured metadata prevents wasted retry attempts",
        ],
        skills: [
          "Returning structured error metadata including errorCategory (transient/validation/permission), isRetryable boolean, and human-readable descriptions",
          "Including retriable: false flags and customer-friendly explanations for business rule violations so the agent can communicate appropriately",
          "Implementing local error recovery within subagents for transient failures, propagating to the coordinator only errors that cannot be resolved locally along with partial results and what was attempted",
          "Distinguishing between access failures (needing retry decisions) and valid empty results (representing successful queries with no matches)",
        ],
        deepDive: {
          whyItMatters:
            "Generic error responses (`{\"success\": false, \"message\": \"Operation failed\"}`) force the agent to guess what to do. Structured errors with `errorCategory` + `isRetryable` let the agent make deterministic recovery choices. This is one of the most reliably correct answers across Customer Support questions.",
          pitfalls: [
            "Returning HTTP 500s for business errors (refund exceeds policy) — the model thinks it should retry.",
            "Uniform error payloads across transient, validation, and permission errors — all three need different handling.",
            "Empty result arrays for \"no matches\" being treated as errors — they're successful queries.",
            "Business errors without a customer-friendly description — the model can't explain the issue to the user.",
          ],
          example:
            "Refund above $500 returns `isError: true, errorCategory: \"permission\", isRetryable: false, message: \"Refund of $750 exceeds the $500 auto-approval limit. Escalation required.\"`. The agent stops retrying, reads the message, and invokes `escalate_to_human`.",
          visuals: [
            {
              kind: "graphviz",
              title: "Error category drives the recovery path",
              caption:
                "Structured errors give the agent a deterministic branch; generic errors force a guess.",
              dot: `digraph ErrorCategory {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  tool   [label="Tool call", fillcolor="#6366f1", color="#4f46e5"];
  cat    [label="errorCategory?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  retry  [label="Retry\\n(up to N)", fillcolor="#10b981", color="#059669"];
  fix    [label="Fix inputs\\n+ retry", fillcolor="#f59e0b", color="#d97706"];
  esc    [label="Escalate /\\ninform user", fillcolor="#f43f5e", color="#e11d48"];
  stop   [label="Stop + explain", fillcolor="#f43f5e", color="#e11d48"];

  tool -> cat;
  cat -> retry [label="transient\\n(isRetryable: true)", color="#10b981", fontcolor="#047857"];
  cat -> fix   [label="validation", color="#f59e0b", fontcolor="#b45309"];
  cat -> esc   [label="permission\\n(threshold)", color="#f43f5e", fontcolor="#be123c", penwidth=1.6];
  cat -> stop  [label="business\\n(retriable:false)", color="#f43f5e", fontcolor="#be123c"];
}`,
            },
            {
              kind: "do-dont",
              title: "Structured errors: do vs. don't",
              items: [
                {
                  good: "Return errorCategory + isRetryable + customer-friendly message.",
                  bad: 'Return { success: false, message: "Operation failed" }.',
                  note: "Without a category, every failure looks the same — the model guesses whether to retry.",
                },
                {
                  good: "Return HTTP 200 with isError:true for business rule violations.",
                  bad: "Return HTTP 500 for a refund-too-large policy violation.",
                  note: "5xx tells the model to retry. Business errors must be retriable:false with a clear reason.",
                },
                {
                  good: "Treat empty arrays as valid results, not errors.",
                  bad: 'Return isError:true when a lookup legitimately returned no matches.',
                  note: "\"No orders found\" is a fact, not a failure — the agent should communicate it, not retry it.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "2.3",
        title: "Distribute tools appropriately across agents and configure tool choice",
        knowledge: [
          "The principle that giving an agent access to too many tools (e.g., 18 instead of 4-5) degrades tool selection reliability by increasing decision complexity",
          "Why agents with tools outside their specialization tend to misuse them (e.g., a synthesis agent attempting web searches)",
          "Scoped tool access: giving agents only the tools needed for their role, with limited cross-role tools for specific high-frequency needs",
          'tool_choice configuration options: "auto", "any", and forced tool selection ({"type": "tool", "name": "..."})',
        ],
        skills: [
          "Restricting each subagent's tool set to those relevant to its role, preventing cross-specialization misuse",
          "Replacing generic tools with constrained alternatives (e.g., replacing fetch_url with load_document that validates document URLs)",
          "Providing scoped cross-role tools for high-frequency needs (e.g., a verify_fact tool for the synthesis agent) while routing complex cases through the coordinator",
          "Using tool_choice forced selection to ensure a specific tool is called first (e.g., forcing extract_metadata before enrichment tools), then processing subsequent steps in follow-up turns",
          'Setting tool_choice: "any" to guarantee the model calls a tool rather than returning conversational text',
        ],
        deepDive: {
          whyItMatters:
            "More tools ≠ more capability. The exam's Multi-Agent Research scenario (PDF Q9) tests exactly this: a synthesis agent with 18 tools selects poorly, drop to 4 scoped tools and reliability recovers. `tool_choice` modes (`auto` / `any` / forced) show up in extraction questions.",
          pitfalls: [
            'Giving every subagent every tool "just in case" — degrades selection reliability.',
            '`tool_choice: "auto"` when you\'re building a structured extraction pipeline — model may return prose instead.',
            "Forcing a specific tool every turn when the model should be deciding — kills adaptability.",
            "Cross-role tools (synthesis agent doing web search) without scoping — leads to misuse and duplication.",
          ],
          example:
            "Synthesis subagent doesn't need full web search — give it a scoped `verify_fact(claim, expected_type)` tool for the 85% case of simple fact lookups. Complex cases route back through the coordinator to the web-search subagent.",
          visuals: [
            {
              kind: "graphviz",
              title: "Scoped tools beat the kitchen sink",
              caption:
                "Each subagent gets exactly what its role needs. Cross-role access stays narrow.",
              dot: `digraph ScopedTools {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_bad {
    label="✗  18 tools everywhere";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    s_bad [label="Synthesis\\n(18 tools)", fillcolor="#f43f5e", color="#e11d48"];
    all [label="web_search, fetch_url,\\nextract_tables, verify_fact,\\n... 14 more"];
    s_bad -> all [style=dashed, color="#f43f5e"];
  }

  subgraph cluster_good {
    label="✓  Role-scoped tools";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    s_good [label="Synthesis\\n(4 tools)", fillcolor="#10b981", color="#059669"];
    verify [label="verify_fact\\n(scoped)"];
    cite   [label="cite_source"];
    merge  [label="merge_findings"];
    gap    [label="flag_gap"];
    s_good -> verify;
    s_good -> cite;
    s_good -> merge;
    s_good -> gap;
  }
}`,
            },
            {
              kind: "do-dont",
              title: "Tool distribution + tool_choice: do vs. don't",
              items: [
                {
                  good: "Keep each subagent at ~4–6 tools matched to its role.",
                  bad: "Hand every subagent all 18 tools \"just in case\".",
                  note: "More tools degrade selection reliability — decision complexity grows faster than coverage.",
                },
                {
                  good: 'Use tool_choice: "any" for pure extraction pipelines.',
                  bad: 'Use tool_choice: "auto" and accept prose when you need structured output.',
                  note: "`any` forces a tool call without forcing which one; `auto` lets the model return text.",
                },
                {
                  good: 'Force a tool (tool_choice: {type:"tool", name:"extract_metadata"}) when sequence matters.',
                  bad: "Force a tool every turn — the model can never adapt.",
                  note: "Forced selection is a scalpel, not a default; use it at the specific step that must run first.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "2.4",
        title: "Integrate MCP servers into Claude Code and agent workflows",
        knowledge: [
          "MCP server scoping: project-level (.mcp.json) for shared team tooling vs user-level (~/.claude.json) for personal/experimental servers",
          "Environment variable expansion in .mcp.json (e.g., ${GITHUB_TOKEN}) for credential management without committing secrets",
          "That tools from all configured MCP servers are discovered at connection time and available simultaneously to the agent",
          "MCP resources as a mechanism for exposing content catalogs (e.g., issue summaries, documentation hierarchies, database schemas) to reduce exploratory tool calls",
        ],
        skills: [
          "Configuring shared MCP servers in project-scoped .mcp.json with environment variable expansion for authentication tokens",
          "Configuring personal/experimental MCP servers in user-scoped ~/.claude.json",
          "Enhancing MCP tool descriptions to explain capabilities and outputs in detail, preventing the agent from preferring built-in tools (like Grep) over more capable MCP tools",
          "Choosing existing community MCP servers over custom implementations for standard integrations (e.g., Jira), reserving custom servers for team-specific workflows",
          "Exposing content catalogs as MCP resources to give agents visibility into available data without requiring exploratory tool calls",
        ],
        deepDive: {
          whyItMatters:
            "Three concrete answers the exam likes: project-scoped `.mcp.json` for shared tooling, `${ENV_VAR}` expansion for secrets, and MCP Resources for content catalogs. Resources vs Tools is a subtle distractor — resources expose data, tools perform actions.",
          pitfalls: [
            "Hard-coding API tokens in `.mcp.json` instead of `${GITHUB_TOKEN}` — gets committed to version control.",
            "Using user-scope (`~/.claude.json`) for shared team servers — teammates don't get them.",
            "Writing a custom MCP server for Jira when a maintained community one exists.",
            "Exposing a content catalog as 50 individual tools when a single Resource would make it browsable.",
          ],
          example:
            "`.mcp.json` has `{ \"github\": { \"command\": \"...\", \"env\": { \"GITHUB_TOKEN\": \"${GITHUB_TOKEN}\" } } }` → teammate clones the repo, sets their own env var, the server just works. Experimental server goes in `~/.claude.json` instead, doesn't affect the team.",
          visuals: [
            {
              kind: "graphviz",
              title: "Project scope vs. user scope",
              caption:
                "Shared team tools = .mcp.json (committed). Personal = ~/.claude.json.",
              dot: `digraph MCPScope {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.6;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_proj {
    label="Project scope — .mcp.json (committed)";
    labelloc="t"; labeljust="l";
    fontcolor="#4f46e5"; fontsize=11;
    style="dashed,rounded"; color="#6366f1"; bgcolor="transparent";
    jira  [label="jira\\n(\${JIRA_TOKEN})"];
    gh    [label="github\\n(\${GITHUB_TOKEN})"];
    team  [label="Teammate clones →\\nset env vars → works", fillcolor="#10b981", color="#059669"];
    jira -> team [style=dashed];
    gh -> team [style=dashed];
  }

  subgraph cluster_user {
    label="User scope — ~/.claude.json (not shared)";
    labelloc="t"; labeljust="l";
    fontcolor="#b45309"; fontsize=11;
    style="dashed,rounded"; color="#f59e0b"; bgcolor="transparent";
    exp  [label="experimental\\n-local-server"];
    me   [label="Only my machine", fillcolor="#f59e0b", color="#d97706"];
    exp -> me [style=dashed];
  }
}`,
            },
            {
              kind: "do-dont",
              title: "MCP integration: do vs. don't",
              items: [
                {
                  good: 'Use ${ENV_VAR} expansion for tokens in .mcp.json.',
                  bad: "Hard-code API tokens in .mcp.json.",
                  note: "Hard-coded secrets end up in git history. Env expansion keeps the config shareable.",
                },
                {
                  good: "Expose content catalogs as MCP resources (browsable).",
                  bad: "Expose the same catalog as 50 individual tools.",
                  note: "Resources reduce exploratory tool calls; 50 tools blow up the selection surface.",
                },
                {
                  good: "Prefer existing community MCP servers (Jira, GitHub, Slack) over writing your own.",
                  bad: "Build a custom MCP server for a standard integration.",
                  note: "Community servers handle auth edge cases and get maintained — custom ones rot.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "2.5",
        title: "Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively",
        knowledge: [
          "Grep for content search (searching file contents for patterns like function names, error messages, or import statements)",
          "Glob for file path pattern matching (finding files by name or extension patterns)",
          "Read/Write for full file operations; Edit for targeted modifications using unique text matching",
          "When Edit fails due to non-unique text matches, using Read + Write as a fallback for reliable file modifications",
        ],
        skills: [
          "Selecting Grep for searching code content across a codebase (e.g., finding all callers of a function, locating error messages)",
          "Selecting Glob for finding files matching naming patterns (e.g., **/*.test.tsx)",
          "Using Read to load full file contents followed by Write when Edit cannot find unique anchor text",
          "Building codebase understanding incrementally: starting with Grep to find entry points, then using Read to follow imports and trace flows, rather than reading all files upfront",
          "Tracing function usage across wrapper modules by first identifying all exported names, then searching for each name across the codebase",
        ],
        deepDive: {
          whyItMatters:
            "Built-in tools questions are about efficient exploration — Grep before Read, incremental vs upfront, Edit vs Read+Write fallback. Developer Productivity scenario leans on this heavily.",
          pitfalls: [
            "Reading 30 files upfront to \"understand the codebase\" — fills context, most reads are wasted.",
            "Using Edit on non-unique anchor text and getting errors repeatedly instead of falling back to Read → Write.",
            "Using Glob to search file *contents* — Glob is for file paths; use Grep for content.",
            "Treating Bash as a Grep/Glob replacement — built-in tools are more efficient and permission-auditable.",
          ],
          example:
            "Tracing a refund bug: `Grep \"process_refund(\"` finds the caller → `Read src/refund.py:120-180` → `Grep \"RefundError\"` finds the exception handlers. Three targeted operations, not a full codebase dump.",
          visuals: [
            {
              kind: "graphviz",
              title: "Which built-in tool for which job?",
              caption:
                "The trap is Glob-for-content and Bash-for-everything. Each tool has a lane.",
              dot: `digraph BuiltinTools {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.65;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  q [label="What are\\nyou looking for?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];

  grep  [label="Grep\\ncontent search", fillcolor="#10b981", color="#059669"];
  glob  [label="Glob\\nfile-path pattern", fillcolor="#10b981", color="#059669"];
  read  [label="Read\\nknown file", fillcolor="#10b981", color="#059669"];
  edit  [label="Edit\\n(unique anchor)", fillcolor="#6366f1", color="#4f46e5"];
  rw    [label="Read + Write\\n(fallback)", fillcolor="#f59e0b", color="#d97706"];

  q -> grep [label="function name,\\nerror message,\\nimport"];
  q -> glob [label="**/*.test.tsx"];
  q -> read [label="specific file"];
  edit -> rw [label="anchor not unique", style=dashed, color="#f59e0b", fontcolor="#b45309"];
}`,
            },
            {
              kind: "do-dont",
              title: "Built-in tools: do vs. don't",
              items: [
                {
                  good: "Grep for entry points, Read only the hits, follow imports incrementally.",
                  bad: 'Read 30 files upfront to "understand the codebase".',
                  note: "Upfront reads waste context on files you'll never touch.",
                },
                {
                  good: "Fall back to Read + Write when Edit fails on non-unique anchor text.",
                  bad: "Retry Edit 5 times with slightly different snippets.",
                  note: "Edit needs a unique match. When it can't find one, stop fighting and rewrite the file.",
                },
                {
                  good: "Use Glob for filename patterns, Grep for content.",
                  bad: "Use Glob to search file contents.",
                  note: "Glob matches paths, not contents. This mix-up shows up in PDF distractors.",
                },
                {
                  good: "Prefer built-in tools over Bash for file ops.",
                  bad: "Shell out to grep/find/sed when a built-in tool exists.",
                  note: "Built-ins are permission-auditable and integrate with Claude Code's guardrails.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "D3",
    number: 3,
    slug: "claude-code-workflows",
    title: "Claude Code Configuration & Workflows",
    weight: 20,
    accent: "amber",
    summary:
      "Configuring CLAUDE.md hierarchies, path-specific rules, project-scoped commands and skills, plan mode vs direct execution, iterative refinement, and CI/CD integration.",
    tasks: [
      {
        id: "3.1",
        title: "Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization",
        knowledge: [
          "The CLAUDE.md configuration hierarchy: user-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md or root CLAUDE.md), and directory-level (subdirectory CLAUDE.md files)",
          "That user-level settings apply only to that user — instructions in ~/.claude/CLAUDE.md are not shared with teammates via version control",
          "The @import syntax for referencing external files to keep CLAUDE.md modular (e.g., importing specific standards files relevant to each package)",
          ".claude/rules/ directory for organizing topic-specific rule files as an alternative to a monolithic CLAUDE.md",
        ],
        skills: [
          "Diagnosing configuration hierarchy issues (e.g., a new team member not receiving instructions because they're in user-level rather than project-level configuration)",
          "Using @import to selectively include relevant standards files in each package's CLAUDE.md based on maintainer domain knowledge",
          "Splitting large CLAUDE.md files into focused topic-specific files in .claude/rules/ (e.g., testing.md, api-conventions.md, deployment.md)",
          "Using the /memory command to verify which memory files are loaded and diagnose inconsistent behavior across sessions",
        ],
        deepDive: {
          whyItMatters:
            "Hierarchy questions hinge on one rule: user-level config (`~/.claude/CLAUDE.md`) is NOT shared with teammates. If the scenario says \"new hire isn't getting instructions\", the answer is always \"move it from user-level to project-level\".",
          pitfalls: [
            "Putting team standards in `~/.claude/CLAUDE.md` and wondering why a new teammate doesn't have them.",
            "Monolithic CLAUDE.md files that bury context — splitting into `.claude/rules/` with `@import` is almost always the right answer.",
            "Inconsistent Claude behavior across sessions and not using `/memory` to diagnose which files are actually loaded.",
            "@import paths that are relative-to-file in unexpected ways — test the hierarchy after any restructure.",
          ],
          example:
            "Monorepo has a top-level `CLAUDE.md` with universal standards. Each package has its own `packages/auth/CLAUDE.md` that `@import`s only the relevant rule files (`@import ../../rules/security.md`, `@import ../../rules/testing.md`). Package-local instructions live in the package's CLAUDE.md.",
          visuals: [
            {
              kind: "graphviz",
              title: "CLAUDE.md hierarchy",
              caption:
                "User config is yours alone. Only project + directory configs are shared with teammates.",
              dot: `digraph ClaudeMdHierarchy {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  user  [label="~/.claude/CLAUDE.md\\n(user · NOT shared)", fillcolor="#f59e0b", color="#d97706"];
  proj  [label="CLAUDE.md\\n(project root · shared)", fillcolor="#10b981", color="#059669"];
  rules [label=".claude/rules/*.md\\n(topic-specific · shared)", fillcolor="#10b981", color="#059669"];
  sub   [label="packages/auth/CLAUDE.md\\n(directory · shared)", fillcolor="#10b981", color="#059669"];
  import [label="@import ../../rules/security.md", fillcolor="#6366f1", color="#4f46e5"];

  user -> proj [label="merged into session", style=dashed];
  proj -> rules [label="@import", style=dashed];
  proj -> sub   [label="inherits", style=dashed];
  sub -> import [style=dashed];
}`,
            },
            {
              kind: "do-dont",
              title: "CLAUDE.md organization: do vs. don't",
              items: [
                {
                  good: "Put team standards in the project-root CLAUDE.md or .claude/rules/.",
                  bad: "Put team standards in ~/.claude/CLAUDE.md.",
                  note: "User-level config isn't shared. New hires won't see it. This is the most-tested scenario.",
                },
                {
                  good: "Split large instructions into .claude/rules/*.md and @import what's relevant.",
                  bad: "Let a 1500-line CLAUDE.md accumulate everything forever.",
                  note: "Monolithic files bury context. Topic-specific files with @import stay scannable.",
                },
                {
                  good: "Use /memory to see which files actually loaded.",
                  bad: "Guess why Claude's behavior changed across sessions.",
                  note: "/memory is the diagnostic for hierarchy bugs — use it before restructuring.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "3.2",
        title: "Create and configure custom slash commands and skills",
        knowledge: [
          "Project-scoped commands in .claude/commands/ (shared via version control) vs user-scoped commands in ~/.claude/commands/ (personal)",
          "Skills in .claude/skills/ with SKILL.md files that support frontmatter configuration including context: fork, allowed-tools, and argument-hint",
          "The context: fork frontmatter option for running skills in an isolated sub-agent context, preventing skill outputs from polluting the main conversation",
          "Personal skill customization: creating personal variants in ~/.claude/skills/ with different names to avoid affecting teammates",
        ],
        skills: [
          "Creating project-scoped slash commands in .claude/commands/ for team-wide availability via version control",
          "Using context: fork to isolate skills that produce verbose output (e.g., codebase analysis) or exploratory context (e.g., brainstorming alternatives) from the main session",
          "Configuring allowed-tools in skill frontmatter to restrict tool access during skill execution (e.g., limiting to file write operations to prevent destructive actions)",
          "Using argument-hint frontmatter to prompt developers for required parameters when they invoke the skill without arguments",
          "Choosing between skills (on-demand invocation for task-specific workflows) and CLAUDE.md (always-loaded universal standards)",
        ],
        deepDive: {
          whyItMatters:
            "`context: fork` is the star of this task. Whenever a skill produces verbose discovery output (codebase analysis, brainstorming) the right answer is to fork — keeps the main conversation clean. `allowed-tools` and `argument-hint` round out the frontmatter options you'll see in questions.",
          pitfalls: [
            "Running a verbose analysis skill in the main context — explodes token usage for the rest of the session.",
            "Omitting `allowed-tools` on a read-only analysis skill, letting it accidentally edit files.",
            "Putting personal skills in `.claude/skills/` instead of `~/.claude/skills/` — pushes them into team version control.",
            "Forgetting `argument-hint` and having developers invoke the skill without required parameters.",
          ],
          example:
            "`analyze-module/SKILL.md` frontmatter: `context: fork`, `allowed-tools: [Read, Glob, Grep, Bash]`, `argument-hint: <module-path>`. Invoking `/analyze-module src/api/` spawns an isolated subagent that greps, reads, and returns a summary — main conversation stays clean.",
          visuals: [
            {
              kind: "graphviz",
              title: "context: fork keeps the main session clean",
              caption:
                "Verbose discovery output lives in the forked subagent. Only the summary comes back.",
              dot: `digraph SkillFork {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  main [label="Main session", fillcolor="#6366f1", color="#4f46e5"];
  call [label="/analyze-module\\nsrc/api/"];

  subgraph cluster_fork {
    label="Forked subagent (allowed-tools: Read, Glob, Grep, Bash)";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    work [label="Grep / Read / Glob\\n(verbose output\\nstays here)"];
    sum  [label="Summary", fillcolor="#10b981", color="#059669"];
    work -> sum;
  }

  ret [label="Summary only →\\nmain context clean", fillcolor="#10b981", color="#059669"];

  main -> call;
  call -> work;
  sum  -> ret;
  ret  -> main [style=dashed];
}`,
            },
            {
              kind: "do-dont",
              title: "Slash commands and skills: do vs. don't",
              items: [
                {
                  good: "Use context: fork for any skill that produces verbose output.",
                  bad: "Run a codebase-analysis skill in the main context.",
                  note: "Fork isolates discovery noise so the main conversation stays usable.",
                },
                {
                  good: "Declare allowed-tools to lock down read-only skills (Read, Glob, Grep, Bash).",
                  bad: "Leave allowed-tools blank on an analysis skill.",
                  note: "Without scoping, an analysis skill can accidentally edit files.",
                },
                {
                  good: "Put personal variants in ~/.claude/skills/ under a different name.",
                  bad: "Override a team skill's SKILL.md in .claude/skills/ for personal preferences.",
                  note: "Edits in .claude/skills/ affect every teammate who pulls.",
                },
                {
                  good: "Add argument-hint so developers know what to pass.",
                  bad: "Accept invocations without args and fail cryptically.",
                  note: "argument-hint surfaces the expected parameters at invocation time.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "3.3",
        title: "Apply path-specific rules for conditional convention loading",
        knowledge: [
          ".claude/rules/ files with YAML frontmatter paths fields containing glob patterns for conditional rule activation",
          "How path-scoped rules load only when editing matching files, reducing irrelevant context and token usage",
          "The advantage of glob-pattern rules over directory-level CLAUDE.md files for conventions that span multiple directories (e.g., test files spread throughout a codebase)",
        ],
        skills: [
          'Creating .claude/rules/ files with YAML frontmatter path scoping (e.g., paths: ["terraform/**/*"]) so rules load only when editing matching files',
          "Using glob patterns in path-specific rules to apply conventions to files by type regardless of directory location (e.g., **/*.test.tsx for all test files)",
          "Choosing path-specific rules over subdirectory CLAUDE.md files when conventions must apply to files spread across the codebase",
        ],
        deepDive: {
          whyItMatters:
            "The classic question: \"test files are spread across 12 directories, how do I apply test conventions?\" — the answer is a `.claude/rules/` file with `paths: [\"**/*.test.*\", \"**/test_*.py\"]`, not 12 copies of a subdirectory CLAUDE.md. Glob rules beat directory-bound rules when the pattern is file-type, not location.",
          pitfalls: [
            "Dropping a `CLAUDE.md` into each test directory — duplicative, drifts over time, misses new locations.",
            "Using overly broad glob patterns (`**/*`) that load rules when irrelevant.",
            "Forgetting the YAML frontmatter entirely — rule file then loads globally, wasting context.",
            "Patterns that don't match the actual file layout (e.g., `tests/**` when tests live alongside source as `*.test.ts`).",
          ],
          example:
            "`.claude/rules/testing.md` starts with `---\\npaths: [\"**/*.test.*\", \"**/test_*.py\", \"tests/**/*\"]\\n---`. The rule loads only when Claude is editing a test file, regardless of directory. API conventions file uses `paths: [\"src/api/**/*\"]`. Two rule files, no duplication.",
          visuals: [
            {
              kind: "graphviz",
              title: "Path-scoped rules vs. directory-bound CLAUDE.md",
              caption:
                "Glob-scoped rules span the whole codebase without duplication.",
              dot: `digraph PathRules {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_bad {
    label="✗  12 duplicated CLAUDE.md files";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    d1 [label="packages/auth/tests/CLAUDE.md"];
    d2 [label="packages/api/tests/CLAUDE.md"];
    d3 [label="... × 10 more", fillcolor="#f43f5e", color="#e11d48"];
  }

  subgraph cluster_good {
    label="✓  One rule, glob-scoped";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    rule [label=".claude/rules/testing.md\\npaths: [\\"**/*.test.*\\",\\n  \\"**/test_*.py\\"]", fillcolor="#10b981", color="#059669"];
    covers [label="Covers every test file,\\nwhere-ever it lives"];
    rule -> covers [style=dashed];
  }
}`,
            },
            {
              kind: "do-dont",
              title: "Path-specific rules: do vs. don't",
              items: [
                {
                  good: 'Use YAML frontmatter paths: [\"**/*.test.*\"] for file-type conventions.',
                  bad: "Drop a CLAUDE.md into each test directory.",
                  note: "Glob-scoped rules don't drift, miss new directories, or duplicate.",
                },
                {
                  good: "Scope tight: paths: [\"src/api/**/*\"] for API conventions.",
                  bad: "paths: [\"**/*\"] (loads everywhere, wastes context).",
                  note: "Overly broad globs are the same as no scoping at all.",
                },
                {
                  good: "Always include YAML frontmatter on rule files.",
                  bad: "Omit frontmatter — rule loads globally.",
                  note: "Without frontmatter, .claude/rules/*.md becomes always-on.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "3.4",
        title: "Determine when to use plan mode vs direct execution",
        knowledge: [
          "Plan mode is designed for complex tasks involving large-scale changes, multiple valid approaches, architectural decisions, and multi-file modifications",
          "Direct execution is appropriate for simple, well-scoped changes (e.g., adding a single validation check to one function)",
          "Plan mode enables safe codebase exploration and design before committing to changes, preventing costly rework",
          "The Explore subagent for isolating verbose discovery output and returning summaries to preserve main conversation context",
        ],
        skills: [
          "Selecting plan mode for tasks with architectural implications (e.g., microservice restructuring, library migrations affecting 45+ files, choosing between integration approaches with different infrastructure requirements)",
          "Selecting direct execution for well-understood changes with clear scope (e.g., a single-file bug fix with a clear stack trace, adding a date validation conditional)",
          "Using the Explore subagent for verbose discovery phases to prevent context window exhaustion during multi-phase tasks",
          "Combining plan mode for investigation with direct execution for implementation (e.g., planning a library migration, then executing the planned approach)",
        ],
        deepDive: {
          whyItMatters:
            "Plan mode is for architectural ambiguity — multiple valid approaches, multi-file impact, irreversible decisions. Direct execution is for scoped changes where the plan would be busywork. Questions test your ability to categorize tasks correctly.",
          pitfalls: [
            "Using plan mode for a one-line bug fix — wastes time, adds ceremony.",
            "Using direct execution for \"migrate our 45-file codebase from library A to library B\" — no reversibility.",
            "Treating plan mode as review mode — it's for *design*, not for checking already-written code.",
            "Not using the Explore subagent when plan-mode discovery is filling the main context.",
          ],
          example:
            "\"Adding date-format validation to `parse_invoice`\" → direct execution, clear scope. \"Migrating from SQLAlchemy 1.x to 2.x across 45 files with 3 valid upgrade strategies\" → plan mode first (explore, propose strategies, approve), then direct execute.",
          visuals: [
            {
              kind: "graphviz",
              title: "Plan mode vs. direct execution decision",
              caption:
                "Three factors: scope, reversibility, and number of valid approaches.",
              dot: `digraph PlanMode {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  task [label="Incoming task", fillcolor="#f59e0b", color="#d97706"];
  q1 [label="Multiple valid\\napproaches?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  q2 [label="Many files\\nor irreversible?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  plan [label="Plan mode\\n(explore → approve → execute)", fillcolor="#6366f1", color="#4f46e5"];
  direct [label="Direct execution", fillcolor="#10b981", color="#059669"];
  explore [label="+ Explore subagent\\nfor verbose discovery", fillcolor="#f59e0b", color="#d97706"];

  task -> q1;
  q1 -> plan [label="yes"];
  q1 -> q2 [label="no"];
  q2 -> plan [label="yes"];
  q2 -> direct [label="no (scoped)"];
  plan -> explore [style=dashed, label="if context filling"];
}`,
            },
            {
              kind: "do-dont",
              title: "Plan mode: do vs. don't",
              items: [
                {
                  good: "Plan mode for library migrations across many files with multiple upgrade paths.",
                  bad: "Plan mode for a one-line validation tweak.",
                  note: "Plan mode is for design decisions, not ceremony around small edits.",
                },
                {
                  good: "Direct execution for a single-file fix with a clear stack trace.",
                  bad: "Direct execution for \"restructure these 45 files\".",
                  note: "Unbounded, irreversible changes need a plan first.",
                },
                {
                  good: "Spawn Explore subagent when discovery is filling main context.",
                  bad: "Let verbose exploration eat the main conversation's budget.",
                  note: "Explore returns a summary; the main agent stays focused on design.",
                },
                {
                  good: "Treat plan mode as design, then switch to direct for execution.",
                  bad: "Use plan mode to review code that's already written.",
                  note: "Plan mode plans; it doesn't review. For review, use a fresh session or subagent.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "3.5",
        title: "Apply iterative refinement techniques for progressive improvement",
        knowledge: [
          "Concrete input/output examples as the most effective way to communicate expected transformations when prose descriptions are interpreted inconsistently",
          "Test-driven iteration: writing test suites first, then iterating by sharing test failures to guide progressive improvement",
          "The interview pattern: having Claude ask questions to surface considerations the developer may not have anticipated before implementing",
          "When to provide all issues in a single message (interacting problems) versus fixing them sequentially (independent problems)",
        ],
        skills: [
          "Providing 2-3 concrete input/output examples to clarify transformation requirements when natural language descriptions produce inconsistent results",
          "Writing test suites covering expected behavior, edge cases, and performance requirements before implementation, then iterating by sharing test failures",
          "Using the interview pattern to surface design considerations (e.g., cache invalidation strategies, failure modes) before implementing solutions in unfamiliar domains",
          "Providing specific test cases with example input and expected output to fix edge case handling (e.g., null values in migration scripts)",
          "Addressing multiple interacting issues in a single detailed message when fixes interact, versus sequential iteration for independent issues",
        ],
        deepDive: {
          whyItMatters:
            "\"Provide examples\" is almost always the right answer for inconsistent output. \"Write tests first\" is the right answer for behavioral specs. \"Interview pattern\" is for unfamiliar domains. These three techniques cover the bulk of iterative-refinement questions.",
          pitfalls: [
            "Rewriting prose instructions when examples would communicate 10× more clearly.",
            "Jumping into implementation for an unfamiliar domain — interview pattern surfaces considerations (cache invalidation, failure modes) you didn't know to ask about.",
            "Bundling independent issues into one prompt so fixes overwrite each other — iterate sequentially when issues are independent.",
            "Giving \"be more careful\" feedback instead of a failing test case the model can reproduce.",
          ],
          example:
            "Date normalization is inconsistent. Instead of adding prose (\"handle all common formats\"), provide 3 input/output pairs: `\"Mar 3 2024\" → \"2024-03-03\"`, `\"03/03/2024\" → \"2024-03-03\"`, `\"2024-03-03T00:00:00Z\" → \"2024-03-03\"`. The model generalizes reliably.",
          visuals: [
            {
              kind: "graphviz",
              title: "Three refinement patterns, three problems",
              caption:
                "Match the technique to the failure shape.",
              dot: `digraph Refinement {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  p1 [label="Inconsistent\\noutput format", fillcolor="#f59e0b", color="#d97706"];
  p2 [label="Behavioral spec\\nwith edge cases", fillcolor="#f59e0b", color="#d97706"];
  p3 [label="Unfamiliar\\ndomain", fillcolor="#f59e0b", color="#d97706"];

  s1 [label="2–3 input/output\\nexamples", fillcolor="#10b981", color="#059669"];
  s2 [label="Write tests first,\\niterate on failures", fillcolor="#10b981", color="#059669"];
  s3 [label="Interview pattern:\\nClaude asks you\\nquestions first", fillcolor="#10b981", color="#059669"];

  p1 -> s1 [color="#10b981", fontcolor="#047857"];
  p2 -> s2 [color="#10b981", fontcolor="#047857"];
  p3 -> s3 [color="#10b981", fontcolor="#047857"];
}`,
            },
            {
              kind: "do-dont",
              title: "Iterative refinement: do vs. don't",
              items: [
                {
                  good: "Provide 2–3 concrete input/output examples for inconsistent output.",
                  bad: 'Rewrite prose instructions with "handle all common formats".',
                  note: "Examples teach the transformation; prose rarely does.",
                },
                {
                  good: "Share a failing test case the model can reproduce.",
                  bad: 'Say "be more careful".',
                  note: "Vague feedback can't be acted on. Failing tests can.",
                },
                {
                  good: "Bundle interacting issues into one message.",
                  bad: "Bundle independent issues together (fixes overwrite each other).",
                  note: "Interacting = one message. Independent = iterate sequentially.",
                },
                {
                  good: "Use the interview pattern for unfamiliar domains.",
                  bad: "Jump to implementation when you don't know the design questions yet.",
                  note: "Letting Claude ask first surfaces cache invalidation, failure modes, and other hidden considerations.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "3.6",
        title: "Integrate Claude Code into CI/CD pipelines",
        knowledge: [
          "The -p (or --print) flag for running Claude Code in non-interactive mode in automated pipelines",
          "--output-format json and --json-schema CLI flags for enforcing structured output in CI contexts",
          "CLAUDE.md as the mechanism for providing project context (testing standards, fixture conventions, review criteria) to CI-invoked Claude Code",
          "Session context isolation: why the same Claude session that generated code is less effective at reviewing its own changes compared to an independent review instance",
        ],
        skills: [
          "Running Claude Code in CI with the -p flag to prevent interactive input hangs",
          "Using --output-format json with --json-schema to produce machine-parseable structured findings for automated posting as inline PR comments",
          "Including prior review findings in context when re-running reviews after new commits, instructing Claude to report only new or still-unaddressed issues to avoid duplicate comments",
          "Providing existing test files in context so test generation avoids suggesting duplicate scenarios already covered by the test suite",
          "Documenting testing standards, valuable test criteria, and available fixtures in CLAUDE.md to improve test generation quality and reduce low-value test output",
        ],
        deepDive: {
          whyItMatters:
            "CI/CD questions hinge on three flags: `-p` (non-interactive), `--output-format json`, `--json-schema`. The other recurring theme is session isolation — a new Claude instance reviews better than the one that generated the code.",
          pitfalls: [
            "Running `claude` in CI without `-p` and having the process hang waiting for interactive input.",
            "Letting the same session that wrote the code review it — it retains reasoning context and won't question itself.",
            "Re-running reviews on updated PRs without passing prior findings as context — duplicate comments everywhere.",
            "Generating tests without passing existing test files as context — duplicate coverage.",
          ],
          example:
            "`claude -p --output-format json --json-schema ./review-schema.json \"Review this PR diff\" < diff.patch` → parseable JSON findings → CI posts them as inline comments. Next run gets prior findings in context, reports only new/unaddressed issues.",
          visuals: [
            {
              kind: "graphviz",
              title: "Claude Code in CI — three flags",
              caption:
                "-p, --output-format json, --json-schema. Everything else is plumbing.",
              dot: `digraph CIFlags {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.65;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  pr    [label="PR diff", fillcolor="#f59e0b", color="#d97706"];
  cli   [label="claude -p\\n--output-format json\\n--json-schema review.json", fillcolor="#6366f1", color="#4f46e5"];
  ctx   [label="+ CLAUDE.md\\n(standards)\\n+ prior findings\\n(dedup)"];
  out   [label="Structured\\nfindings JSON", fillcolor="#10b981", color="#059669"];
  post  [label="CI posts as\\ninline PR comments"];

  pr -> cli;
  ctx -> cli [style=dashed];
  cli -> out;
  out -> post;
}`,
            },
            {
              kind: "do-dont",
              title: "CI/CD integration: do vs. don't",
              items: [
                {
                  good: "Always pass -p (non-interactive) in CI invocations.",
                  bad: "Run `claude` without -p and have the job hang on stdin.",
                  note: "Interactive mode blocks waiting for input; CI never provides it.",
                },
                {
                  good: "Use --output-format json + --json-schema for machine-parseable findings.",
                  bad: "Parse free-form text output with regex.",
                  note: "Schemas eliminate parsing brittleness and malformed JSON.",
                },
                {
                  good: "Use a fresh Claude instance to review code a different instance generated.",
                  bad: "Have the same session review its own output.",
                  note: "Generator retains reasoning bias; fresh reviewer catches more.",
                },
                {
                  good: "Pass prior findings on re-runs so Claude only reports new/unaddressed issues.",
                  bad: "Re-run clean every time and post duplicate comments.",
                  note: "Developers stop reading review bots that repeat themselves.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "D4",
    number: 4,
    slug: "prompt-engineering",
    title: "Prompt Engineering & Structured Output",
    weight: 20,
    accent: "rose",
    summary:
      "Designing precise review criteria, few-shot prompting, JSON-schema-enforced tool use, validation-retry loops, Message Batches API, and multi-pass review architectures.",
    tasks: [
      {
        id: "4.1",
        title: "Design prompts with explicit criteria to improve precision and reduce false positives",
        knowledge: [
          'The importance of explicit criteria over vague instructions (e.g., "flag comments only when claimed behavior contradicts actual code behavior" vs "check that comments are accurate")',
          'How general instructions like "be conservative" or "only report high-confidence findings" fail to improve precision compared to specific categorical criteria',
          "The impact of false positive rates on developer trust: high false positive categories undermine confidence in accurate categories",
        ],
        skills: [
          "Writing specific review criteria that define which issues to report (bugs, security) versus skip (minor style, local patterns) rather than relying on confidence-based filtering",
          "Temporarily disabling high false-positive categories to restore developer trust while improving prompts for those categories",
          "Defining explicit severity criteria with concrete code examples for each severity level to achieve consistent classification",
        ],
        deepDive: {
          whyItMatters:
            "\"Be more conservative\" and \"only report high-confidence findings\" are the seductive wrong answers on CI/CD false-positive questions. Explicit categorical criteria (what to flag, what to skip) beats vague confidence tuning every time.",
          pitfalls: [
            "Asking the model to \"be more careful\" — has no effect on precision.",
            "Confidence thresholds without calibration — the model's self-reported confidence isn't reliable.",
            "Leaving a high-false-positive category enabled while you \"fix the prompt\" — erodes developer trust permanently.",
            "Severity definitions without concrete examples — the model classifies inconsistently.",
          ],
          example:
            '"Flag a comment only when the claimed behavior contradicts actual code behavior. Do NOT flag: outdated TODOs, historical notes, or comments that are merely verbose." — replaces "check that comments are accurate". Precision jumps because the boundary is now explicit.',
          visuals: [
            {
              kind: "graphviz",
              title: "Explicit criteria vs. vague confidence tuning",
              caption:
                "\"Be conservative\" is the seductive wrong answer. Categorical rules win.",
              dot: `digraph PrecisionCriteria {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_bad {
    label="✗  Vague tuning";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    p1 [label="\\"be more\\nconservative\\""];
    p2 [label="\\"only report\\nhigh confidence\\""];
    n1 [label="Same false-positive rate\\n+ missed true positives", fillcolor="#f43f5e", color="#e11d48"];
    p1 -> n1;
    p2 -> n1;
  }

  subgraph cluster_good {
    label="✓  Categorical criteria";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    g [label="Flag: bugs, security\\nSkip: style, local patterns,\\nverbose comments"];
    y [label="Precision ↑\\nTrust ↑", fillcolor="#10b981", color="#059669"];
    g -> y;
  }
}`,
            },
            {
              kind: "do-dont",
              title: "Precision prompts: do vs. don't",
              items: [
                {
                  good: "Define what to flag AND what to skip, with code examples.",
                  bad: 'Say "be more careful" or "only report high-confidence findings".',
                  note: "Model confidence isn't reliably self-reported. Explicit skip lists are.",
                },
                {
                  good: "Disable a high-false-positive category while you fix the prompt.",
                  bad: "Leave it on and hope developers ignore it.",
                  note: "Trust, once eroded, takes a long time to recover. Disable fast.",
                },
                {
                  good: "Give concrete code examples for each severity level.",
                  bad: "Define severity by adjective only (\"serious\", \"critical\").",
                  note: "Adjectives get interpreted inconsistently; examples anchor classification.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.2",
        title: "Apply few-shot prompting to improve output consistency and quality",
        knowledge: [
          "Few-shot examples as the most effective technique for achieving consistently formatted, actionable output when detailed instructions alone produce inconsistent results",
          "The role of few-shot examples in demonstrating ambiguous-case handling (e.g., tool selection for ambiguous requests, branch-level test coverage gaps)",
          "How few-shot examples enable the model to generalize judgment to novel patterns rather than matching only pre-specified cases",
          "The effectiveness of few-shot examples for reducing hallucination in extraction tasks (e.g., handling informal measurements, varied document structures)",
        ],
        skills: [
          "Creating 2-4 targeted few-shot examples for ambiguous scenarios that show reasoning for why one action was chosen over plausible alternatives",
          "Including few-shot examples that demonstrate specific desired output format (location, issue, severity, suggested fix) to achieve consistency",
          "Providing few-shot examples distinguishing acceptable code patterns from genuine issues to reduce false positives while enabling generalization",
          "Using few-shot examples to demonstrate correct handling of varied document structures (inline citations vs bibliographies, methodology sections vs embedded details)",
          "Adding few-shot examples showing correct extraction from documents with varied formats to address empty/null extraction of required fields",
        ],
        deepDive: {
          whyItMatters:
            "Few-shot is the single most effective technique for consistency. The exam tests this in extraction (varied document structures), CI review (ambiguous bug-vs-style cases), and agent behavior (when to call which tool). 2–4 examples is the sweet spot.",
          pitfalls: [
            'Providing one example — the model pattern-matches too narrowly.',
            "Examples that only show \"good\" cases — include ambiguous ones so the model learns the boundary.",
            "Inconsistent output format across examples — model infers the inconsistency is allowed.",
            "Examples without reasoning — model memorizes the shape but not the decision logic.",
          ],
          example:
            "Inline citation vs bibliography-style document extraction: 2 examples with inline (`\"... [Smith 2019] ...\"` → `author: \"Smith\", year: 2019`), 2 examples with bibliography (separate references section). Each example shows the extraction + a one-line reason. Model handles novel variants correctly.",
          visuals: [
            {
              kind: "graphviz",
              title: "Few-shot counts: one isn't enough",
              caption:
                "Two to four targeted examples hits the sweet spot; one over-fits; zero is prose.",
              dot: `digraph FewShotCount {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.6;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  zero [label="0 examples\\n(prose only)", fillcolor="#f43f5e", color="#e11d48"];
  one  [label="1 example\\n(over-fits)", fillcolor="#f59e0b", color="#d97706"];
  few  [label="2–4 examples\\n(sweet spot)", fillcolor="#10b981", color="#059669"];
  many [label=">6 examples\\n(diminishing)", fillcolor="#f59e0b", color="#d97706"];

  out1 [label="Inconsistent\\noutputs"];
  out2 [label="Model pattern-matches\\nonly the one shape"];
  out3 [label="Generalizes to\\nnovel variants", fillcolor="#10b981", color="#059669"];
  out4 [label="Diminishing return\\n+ token cost"];

  zero -> out1;
  one  -> out2;
  few  -> out3 [penwidth=1.6, color="#10b981", fontcolor="#047857"];
  many -> out4;
}`,
            },
            {
              kind: "do-dont",
              title: "Few-shot examples: do vs. don't",
              items: [
                {
                  good: "Include 2–4 examples covering the boundary cases, not just the easy ones.",
                  bad: "Include only \"good\" examples.",
                  note: "Boundary examples teach what NOT to do; easy examples teach nothing new.",
                },
                {
                  good: "Show one-line reasoning with each example.",
                  bad: "Show input/output only.",
                  note: "Reasoning forces the model to learn the decision logic, not just the shape.",
                },
                {
                  good: "Keep output format identical across every example.",
                  bad: "Let format drift across examples.",
                  note: "Inconsistency in the examples teaches the model inconsistency is acceptable.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.3",
        title: "Enforce structured output using tool use and JSON schemas",
        knowledge: [
          "Tool use (tool_use) with JSON schemas as the most reliable approach for guaranteed schema-compliant structured output, eliminating JSON syntax errors",
          'The distinction between tool_choice: "auto" (model may return text instead of calling a tool), "any" (model must call a tool but can choose which), and forced tool selection (model must call a specific named tool)',
          "That strict JSON schemas via tool use eliminate syntax errors but do not prevent semantic errors (e.g., line items that don't sum to total, values in wrong fields)",
          'Schema design considerations: required vs optional fields, enum fields with "other" + detail string patterns for extensible categories',
        ],
        skills: [
          "Defining extraction tools with JSON schemas as input parameters and extracting structured data from the tool_use response",
          'Setting tool_choice: "any" to guarantee structured output when multiple extraction schemas exist and the document type is unknown',
          'Forcing a specific tool with tool_choice: {"type": "tool", "name": "extract_metadata"} to ensure a particular extraction runs before enrichment steps',
          "Designing schema fields as optional (nullable) when source documents may not contain the information, preventing the model from fabricating values to satisfy required fields",
          'Adding enum values like "unclear" for ambiguous cases and "other" + detail fields for extensible categorization',
          "Including format normalization rules in prompts alongside strict output schemas to handle inconsistent source formatting",
        ],
        deepDive: {
          whyItMatters:
            "`tool_use` with a JSON schema is the right structured-output pattern — eliminates syntax errors (but NOT semantic errors like wrong field values). Nullable/optional fields prevent hallucination when the source doesn't contain the info. `tool_choice` options are a recurring distractor question.",
          pitfalls: [
            "Marking every field as required, then the model fabricates values when the source doesn't have them.",
            'Using `tool_choice: "auto"` when you need structured output — model may return prose.',
            "Assuming schema compliance means semantic correctness — line items can still not sum to total.",
            "Forgetting enum \"other\" + detail fields for extensible categories — rigid schemas miss novel cases.",
          ],
          example:
            "Invoice schema has `vendor: string`, `total: number`, `po_number: string | null`. Model extracts from a doc without a PO → returns `po_number: null` instead of hallucinating. Enum `payment_method` has `\"other\"` + `payment_method_detail: string | null` for cases outside the main enum.",
          visuals: [
            {
              kind: "graphviz",
              title: "tool_choice modes, at a glance",
              caption:
                "auto can drift to prose; any guarantees a tool call; forced picks the one tool.",
              dot: `digraph ToolChoice {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  auto   [label="tool_choice: auto", fillcolor="#f59e0b", color="#d97706"];
  any    [label="tool_choice: any", fillcolor="#6366f1", color="#4f46e5"];
  forced [label="tool_choice: {type:tool,\\nname:\\"extract_metadata\\"}", fillcolor="#10b981", color="#059669"];

  a_out [label="May return\\nprose OR a tool call"];
  n_out [label="Must call SOME tool\\n(model picks which)"];
  f_out [label="Must call THIS tool"];

  u1 [label="Chat / assistants"];
  u2 [label="Extraction pipelines\\nwith multiple schemas"];
  u3 [label="Guaranteed first step\\n(metadata before enrichment)"];

  auto -> a_out -> u1;
  any -> n_out -> u2;
  forced -> f_out -> u3;
}`,
            },
            {
              kind: "do-dont",
              title: "Schema design: do vs. don't",
              items: [
                {
                  good: "Mark fields nullable/optional when the source may not contain them.",
                  bad: "Require every field, then watch the model hallucinate.",
                  note: "Required + missing source = fabrication. Nullable = honest extraction.",
                },
                {
                  good: "Use enums with an \"other\" + detail-string fallback for extensible categories.",
                  bad: "Use a rigid enum that breaks when the doc has something new.",
                  note: "Closed enums hit novel cases and silently lose data.",
                },
                {
                  good: "Remember that schemas prevent JSON errors, not semantic errors.",
                  bad: "Assume schema compliance means the numbers actually sum.",
                  note: "Semantic validation (totals, cross-field consistency) still needs a retry loop.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.4",
        title: "Implement validation, retry, and feedback loops for extraction quality",
        knowledge: [
          "Retry-with-error-feedback: appending specific validation errors to the prompt on retry to guide the model toward correction",
          "The limits of retry: retries are ineffective when the required information is simply absent from the source document (vs format or structural errors)",
          "Feedback loop design: tracking which code constructs trigger findings (detected_pattern field) to enable systematic analysis of dismissal patterns",
          "The difference between semantic validation errors (values don't sum, wrong field placement) and schema syntax errors (eliminated by tool use)",
        ],
        skills: [
          "Implementing follow-up requests that include the original document, the failed extraction, and specific validation errors for model self-correction",
          "Identifying when retries will be ineffective (e.g., information exists only in an external document not provided) versus when they will succeed (format mismatches, structural output errors)",
          "Adding detected_pattern fields to structured findings to enable analysis of false positive patterns when developers dismiss findings",
          'Designing self-correction validation flows: extracting "calculated_total" alongside "stated_total" to flag discrepancies, adding "conflict_detected" booleans for inconsistent source data',
        ],
        deepDive: {
          whyItMatters:
            "Validation-retry is a 3-piece answer: original document + failed extraction + specific error message, all in the follow-up. Miss any piece and the retry is wasted. The other crucial distinction: retry works for format/structure errors, NOT for missing information.",
          pitfalls: [
            "Retrying with only the error message and not the original document — model has no reference.",
            "Retrying indefinitely when the info is simply absent — the model will keep hallucinating.",
            "Generic \"please fix\" follow-ups without the specific validation error — model doesn't know what went wrong.",
            "Not tracking which source patterns trigger failures — can't analyze false-positive trends.",
          ],
          example:
            "Extraction fails because `line_items_total != stated_total`. Follow-up: `\"Your previous extraction was: {failed_extraction}. Validation error: line_items sum to $147.50 but stated_total is $145.00. Re-extract {original_document}, paying close attention to item quantities.\"` Model corrects the off-by-one.",
          visuals: [
            {
              kind: "graphviz",
              title: "Validation-retry loop (3 pieces)",
              caption:
                "Original document + failed extraction + specific error. Miss any piece and the retry is wasted.",
              dot: `digraph RetryLoop {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  extract [label="Extraction", fillcolor="#6366f1", color="#4f46e5"];
  valid   [label="Validate", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  pass    [label="Accept", fillcolor="#10b981", color="#059669"];
  kind    [label="Error kind?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  retry   [label="Retry with:\\n• original document\\n• failed extraction\\n• specific error", fillcolor="#f59e0b", color="#d97706"];
  stop    [label="Info absent —\\nstop, flag for\\nhuman", fillcolor="#f43f5e", color="#e11d48"];

  extract -> valid;
  valid -> pass [label="ok", color="#10b981", fontcolor="#047857"];
  valid -> kind [label="fail"];
  kind -> retry [label="format / structure", color="#f59e0b", fontcolor="#b45309"];
  kind -> stop  [label="missing info", color="#f43f5e", fontcolor="#be123c"];
  retry -> extract [style=dashed, label="next attempt"];
}`,
            },
            {
              kind: "do-dont",
              title: "Validation & retry: do vs. don't",
              items: [
                {
                  good: "Send document + failed extraction + specific error in the retry prompt.",
                  bad: "Retry with just \"please fix this\".",
                  note: "Without the specific error and the original document, the retry is guessing.",
                },
                {
                  good: "Stop retrying when the info is absent from the source.",
                  bad: "Retry 5 times on a field the document doesn't contain.",
                  note: "Retries only help format/structure issues. They make hallucination worse.",
                },
                {
                  good: "Extract calculated_total alongside stated_total to detect semantic conflicts.",
                  bad: "Trust schema-compliant output to be semantically correct.",
                  note: "Cross-field validation catches errors that schemas miss.",
                },
                {
                  good: "Track detected_pattern for every finding to analyze dismissal trends.",
                  bad: "Return findings without pattern metadata.",
                  note: "Without detected_pattern you can't tell which input shapes cause false positives.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.5",
        title: "Design efficient batch processing strategies",
        knowledge: [
          "The Message Batches API: 50% cost savings, up to 24-hour processing window, no guaranteed latency SLA",
          "Batch processing is appropriate for non-blocking, latency-tolerant workloads (overnight reports, weekly audits, nightly test generation) and inappropriate for blocking workflows (pre-merge checks)",
          "The batch API does not support multi-turn tool calling within a single request (cannot execute tools mid-request and return results)",
          "custom_id fields for correlating batch request/response pairs",
        ],
        skills: [
          "Matching API approach to workflow latency requirements: synchronous API for blocking pre-merge checks, batch API for overnight/weekly analysis",
          "Calculating batch submission frequency based on SLA constraints (e.g., 4-hour windows to guarantee 30-hour SLA with 24-hour batch processing)",
          "Handling batch failures: resubmitting only failed documents (identified by custom_id) with appropriate modifications (e.g., chunking documents that exceeded context limits)",
          "Using prompt refinement on a sample set before batch-processing large volumes to maximize first-pass success rates and reduce iterative resubmission costs",
        ],
        deepDive: {
          whyItMatters:
            "Message Batches API = 50% cost savings + up to 24-hour latency + no multi-turn tool calling. The exam tests whether you can match workload to API: overnight reports and weekly audits → batch, pre-merge CI checks → sync API. `custom_id` correlation is the way failures are handled.",
          pitfalls: [
            "Using batch API for blocking workflows (pre-merge checks) — 24h window kills developer feedback.",
            "Submitting a batch expecting multi-turn tool execution — not supported.",
            "Handling batch failures by resubmitting the entire batch — use `custom_id` to resubmit only what failed.",
            "Not testing prompt quality on a sample first — a bad prompt across 10K documents wastes 50%-savings three times over.",
          ],
          example:
            "10K contracts need nightly extraction, SLA is next-day. Submit as batch at 6 PM with `custom_id: contract_<id>` on each request. Next morning: poll for completion, identify failed IDs, chunk the oversized ones, resubmit only those. Total cost ≈ half the sync API equivalent.",
          visuals: [
            {
              kind: "graphviz",
              title: "Sync vs. Batch — match the workflow",
              caption:
                "Blocking/interactive → sync. Overnight/weekly → batch.",
              dot: `digraph BatchDecision {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.65;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  q [label="Latency\\ntolerant?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];
  q2 [label="Needs multi-turn\\ntool calls?", shape=diamond, fillcolor="#eef2ff", color="#6366f1", fontcolor="#1e1b4b"];

  sync  [label="Sync API\\n(pre-merge checks,\\ninteractive agents)", fillcolor="#6366f1", color="#4f46e5"];
  batch [label="Message Batches API\\n50% cheaper, ≤24h\\ncustom_id per item", fillcolor="#10b981", color="#059669"];

  q -> sync [label="no (blocking)", color="#f43f5e", fontcolor="#be123c"];
  q -> q2   [label="yes"];
  q2 -> sync  [label="yes (batch doesn't\\nsupport it)", color="#f59e0b", fontcolor="#b45309"];
  q2 -> batch [label="no (one-shot)", color="#10b981", fontcolor="#047857", penwidth=1.6];
}`,
            },
            {
              kind: "do-dont",
              title: "Batch processing: do vs. don't",
              items: [
                {
                  good: "Use batch for nightly reports, weekly audits, bulk extraction at rest.",
                  bad: "Use batch for pre-merge CI checks.",
                  note: "24h window is not compatible with interactive feedback loops.",
                },
                {
                  good: "Assign a unique custom_id per request so failures can be resubmitted selectively.",
                  bad: "Resubmit the entire batch when one request fails.",
                  note: "custom_id-based resubmission is the entire point of the failure story.",
                },
                {
                  good: "Validate prompts on a small sample before submitting 10K.",
                  bad: "Submit 10K and discover the prompt was wrong in the morning.",
                  note: "50% discount × bad prompt × three attempts still loses to a 100-sample pilot.",
                },
                {
                  good: "Use sync API when the workflow involves multi-turn tool use.",
                  bad: "Try to run agentic loops through the batch API.",
                  note: "Batch is one-shot. It doesn't execute tools mid-request.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.6",
        title: "Design multi-instance and multi-pass review architectures",
        knowledge: [
          "Self-review limitations: a model retains reasoning context from generation, making it less likely to question its own decisions in the same session",
          "Independent review instances (without prior reasoning context) are more effective at catching subtle issues than self-review instructions or extended thinking",
          "Multi-pass review: splitting large reviews into per-file local analysis passes plus cross-file integration passes to avoid attention dilution and contradictory findings",
        ],
        skills: [
          "Using a second independent Claude instance to review generated code without the generator's reasoning context",
          "Splitting large multi-file reviews into focused per-file passes for local issues plus separate integration passes for cross-file data flow analysis",
          "Running verification passes where the model self-reports confidence alongside each finding to enable calibrated review routing",
        ],
        deepDive: {
          whyItMatters:
            "Self-review is unreliable — the same session retains reasoning bias. The exam's answer is always \"a fresh independent instance\" or \"split into per-file + cross-file passes\". Extended thinking and \"review your work\" instructions are the wrong answers.",
          pitfalls: [
            "Asking the same session that wrote the code to review it — it defends its own reasoning.",
            "One-shot review of a 40-file PR — attention dilutes, contradictory findings appear.",
            "Relying on `thinking` blocks to catch issues the generation session missed.",
            "Running only an integration pass and skipping per-file — misses local bugs.",
          ],
          example:
            "Per-file pass: spawn one subagent per changed file, each surfaces local issues (unused imports, bad error handling). Integration pass: separate subagent with all diffs + call graph, looks for API contract breaks, circular imports. Two focused passes, clean findings.",
          visuals: [
            {
              kind: "graphviz",
              title: "Generator ≠ reviewer",
              caption:
                "The generator session retains reasoning bias. A fresh instance questions what the generator defends.",
              dot: `digraph IndependentReview {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_bad {
    label="✗  Self-review";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    s1 [label="Session A\\n(generates code)"];
    s1r [label="Session A\\n(reviews own code)", fillcolor="#f43f5e", color="#e11d48"];
    s1 -> s1r [label="same reasoning\\ncontext", color="#f43f5e"];
  }

  subgraph cluster_good {
    label="✓  Independent instance";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    g1 [label="Session A\\n(generator)"];
    g2 [label="Session B\\n(fresh reviewer)", fillcolor="#10b981", color="#059669"];
    diff [label="Code diff only"];
    g1 -> diff;
    diff -> g2 [label="no reasoning baggage", color="#10b981", fontcolor="#047857"];
  }
}`,
            },
            {
              kind: "graphviz",
              title: "Per-file + cross-file passes",
              caption:
                "Two focused passes beat one diluted pass on large reviews.",
              dot: `digraph TwoPassReview {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.35;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  pr  [label="40-file PR", fillcolor="#f59e0b", color="#d97706"];
  s1  [label="Subagent per file\\n(local issues)"];
  s2  [label="Subagent per file"];
  sN  [label="... ×40"];
  p2  [label="Integration pass\\n(API contracts,\\ncircular imports)", fillcolor="#6366f1", color="#4f46e5"];
  out [label="Review report", fillcolor="#10b981", color="#059669"];

  pr -> s1;
  pr -> s2;
  pr -> sN;
  s1 -> p2 [style=dashed];
  s2 -> p2 [style=dashed];
  sN -> p2 [style=dashed];
  p2 -> out;
}`,
            },
            {
              kind: "do-dont",
              title: "Multi-pass review: do vs. don't",
              items: [
                {
                  good: "Use a second, fresh instance to review what another instance generated.",
                  bad: "Ask the same session to review its own output.",
                  note: "Same session defends same reasoning. Different instance questions it.",
                },
                {
                  good: "Split per-file local passes from a cross-file integration pass.",
                  bad: "Review 40 files in a single prompt.",
                  note: "Attention dilutes — the model misses both local and cross-file issues.",
                },
                {
                  good: "Have the model emit confidence alongside each finding.",
                  bad: "Rely on extended-thinking blocks to catch issues.",
                  note: "Confidence enables calibrated routing. Thinking doesn't fix reasoning bias.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "D5",
    number: 5,
    slug: "context-reliability",
    title: "Context Management & Reliability",
    weight: 15,
    accent: "sky",
    summary:
      "Managing long conversations, escalation and ambiguity, error propagation, large-codebase context, human-review routing with confidence calibration, and provenance across multi-source synthesis.",
    tasks: [
      {
        id: "5.1",
        title: "Manage conversation context to preserve critical information across long interactions",
        knowledge: [
          "Progressive summarization risks: condensing numerical values, percentages, dates, and customer-stated expectations into vague summaries",
          'The "lost in the middle" effect: models reliably process information at the beginning and end of long inputs but may omit findings from middle sections',
          "How tool results accumulate in context and consume tokens disproportionately to their relevance (e.g., 40+ fields per order lookup when only 5 are relevant)",
          "The importance of passing complete conversation history in subsequent API requests to maintain conversational coherence",
        ],
        skills: [
          'Extracting transactional facts (amounts, dates, order numbers, statuses) into a persistent "case facts" block included in each prompt, outside summarized history',
          "Extracting and persisting structured issue data (order IDs, amounts, statuses) into a separate context layer for multi-issue sessions",
          "Trimming verbose tool outputs to only relevant fields before they accumulate in context (e.g., keeping only return-relevant fields from order lookups)",
          "Placing key findings summaries at the beginning of aggregated inputs and organizing detailed results with explicit section headers to mitigate position effects",
          "Requiring subagents to include metadata (dates, source locations, methodological context) in structured outputs to support accurate downstream synthesis",
          "Modifying upstream agents to return structured data (key facts, citations, relevance scores) instead of verbose content and reasoning chains when downstream agents have limited context budgets",
        ],
        deepDive: {
          whyItMatters:
            "\"Lost in the middle\" is tested explicitly: put critical facts at the beginning (or end), summarize the middle. The \"CaseFacts at top of system prompt\" pattern shows up in Customer Support questions. Also: trimming verbose tool outputs matters as much as summarization.",
          pitfalls: [
            "Letting progressive summarization condense amounts, dates, and customer-stated preferences into vague prose — you lose the key facts.",
            "Keeping all 40 fields from an order lookup when only 5 matter — context inflates 8×.",
            "Burying key findings in the middle of a long prompt — they get overlooked.",
            "Not passing full conversation history in subsequent requests — breaks coherence.",
          ],
          example:
            "Every iteration, the system prompt starts with a `CaseFacts` block: `customer_id: C-12345, verified: true, pending_refund: $247 (order #O-998)`. Below it, the summarized history. Model can't \"forget\" the amount or status because they live outside the compressible region.",
          visuals: [
            {
              kind: "graphviz",
              title: "CaseFacts at the top — lost-in-the-middle fix",
              caption:
                "Hard facts pinned outside the compressible region. Summarization can't eat them.",
              dot: `digraph CaseFacts {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_prompt {
    label="System prompt (every iteration)";
    labelloc="t"; labeljust="l";
    fontcolor="#4f46e5"; fontsize=11;
    style="dashed,rounded"; color="#6366f1"; bgcolor="transparent";
    facts [label="TOP: CaseFacts\\ncustomer_id: C-12345\\nverified: true\\npending_refund: $247", fillcolor="#10b981", color="#059669"];
    mid   [label="MIDDLE: summarized\\nhistory", fillcolor="#f59e0b", color="#d97706"];
    end   [label="BOTTOM: latest\\ntool results"];
    facts -> mid [style=invis];
    mid -> end [style=invis];
  }

  degrade [label="Lost-in-middle\\nrisk zone", fillcolor="#f43f5e", color="#e11d48"];
  mid -> degrade [style=dashed, color="#f43f5e"];
}`,
            },
            {
              kind: "do-dont",
              title: "Long-context management: do vs. don't",
              items: [
                {
                  good: "Pin amounts, dates, IDs in a CaseFacts block at the top of the prompt.",
                  bad: "Let progressive summarization condense them into prose.",
                  note: "Numbers and statuses lose precision the moment they're summarized.",
                },
                {
                  good: "Trim tool outputs to the 5 relevant fields before they hit history.",
                  bad: "Append all 40 fields from every order lookup.",
                  note: "Untrimmed tool results inflate context 8× and crowd out useful information.",
                },
                {
                  good: "Place key findings at the start (or end) of long inputs.",
                  bad: "Bury critical facts in the middle of a 30K-token prompt.",
                  note: "Lost-in-the-middle is real — the model reliably attends to the edges.",
                },
                {
                  good: "Pass full conversation history on each subsequent request.",
                  bad: "Send only the latest user message.",
                  note: "Without history the model loses coherence; the API is stateless.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "5.2",
        title: "Design effective escalation and ambiguity resolution patterns",
        knowledge: [
          "Appropriate escalation triggers: customer requests for a human, policy exceptions/gaps (not just complex cases), and inability to make meaningful progress",
          "The distinction between escalating immediately when a customer explicitly demands it versus offering to resolve when the issue is straightforward",
          "Why sentiment-based escalation and self-reported confidence scores are unreliable proxies for actual case complexity",
          "How multiple customer matches require clarification (requesting additional identifiers) rather than heuristic selection",
        ],
        skills: [
          "Adding explicit escalation criteria with few-shot examples to the system prompt demonstrating when to escalate versus resolve autonomously",
          "Honoring explicit customer requests for human agents immediately without first attempting investigation",
          "Acknowledging frustration while offering resolution when the issue is within the agent's capability, escalating only if the customer reiterates their preference",
          "Escalating when policy is ambiguous or silent on the customer's specific request (e.g., competitor price matching when policy only addresses own-site adjustments)",
          "Instructing the agent to ask for additional identifiers when tool results return multiple matches, rather than selecting based on heuristics",
        ],
        deepDive: {
          whyItMatters:
            "The three valid escalation triggers: explicit customer request, policy gap/ambiguity, inability to make progress. \"Sentiment-based\" and \"model confidence\" are the wrong answers. Multiple customer matches → ask for an identifier, don't guess.",
          pitfalls: [
            "Escalating on sentiment (\"customer sounds frustrated\") — acknowledge + offer resolution; escalate only if they repeat the request.",
            "Using the agent's self-reported confidence as an escalation signal — unreliable.",
            "Selecting one match when `lookup_customer(\"John Smith\")` returns 3 — always ask for more identifiers.",
            "Not escalating when policy is silent (e.g., competitor price matching) — ambiguity is itself a reason to escalate.",
          ],
          example:
            "Customer asks for a price match against a competitor. Policy only addresses same-site adjustments. The right action: escalate, because policy is silent — not invent a rule. Few-shot the prompt with \"policy silent → escalate with full context\" cases.",
          visuals: [
            {
              kind: "graphviz",
              title: "Valid vs. invalid escalation triggers",
              caption:
                "Sentiment and self-confidence are the seductive wrong answers.",
              dot: `digraph Escalation {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  subgraph cluster_good {
    label="✓  Valid escalation triggers";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    v1 [label="Explicit customer\\nrequest", fillcolor="#10b981", color="#059669"];
    v2 [label="Policy silent\\nor ambiguous", fillcolor="#10b981", color="#059669"];
    v3 [label="Cannot make\\nprogress", fillcolor="#10b981", color="#059669"];
  }

  subgraph cluster_bad {
    label="✗  Invalid triggers";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    b1 [label="Customer\\nsounds frustrated", fillcolor="#f43f5e", color="#e11d48"];
    b2 [label="Model self-reported\\nlow confidence", fillcolor="#f43f5e", color="#e11d48"];
    b3 [label="Multiple matches\\n(ask for ID instead)", fillcolor="#f59e0b", color="#d97706"];
  }
}`,
            },
            {
              kind: "do-dont",
              title: "Escalation & ambiguity: do vs. don't",
              items: [
                {
                  good: "Escalate immediately when a customer explicitly asks for a human.",
                  bad: "Attempt investigation first over their explicit request.",
                  note: "Ignoring the request damages the interaction more than escalating early does.",
                },
                {
                  good: "Escalate when policy is silent on the customer's situation.",
                  bad: "Invent a rule to resolve it autonomously.",
                  note: "Policy gaps are themselves an escalation signal — not a problem for the model to solve.",
                },
                {
                  good: "Ask for additional identifiers when lookup returns multiple matches.",
                  bad: "Pick one heuristically (e.g., most-recent, alphabetically-first).",
                  note: "Heuristic selection causes the wrong customer to be charged or refunded.",
                },
                {
                  good: "Acknowledge frustration + offer to resolve; escalate only if the customer reiterates.",
                  bad: "Escalate on sentiment alone.",
                  note: "A frustrated customer with a simple problem still wants resolution, not a queue.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "5.3",
        title: "Implement error propagation strategies across multi-agent systems",
        knowledge: [
          "Structured error context (failure type, attempted query, partial results, alternative approaches) as enabling intelligent coordinator recovery decisions",
          "The distinction between access failures (timeouts needing retry decisions) and valid empty results (successful queries with no matches)",
          'Why generic error statuses ("search unavailable") hide valuable context from the coordinator',
          "Why silently suppressing errors (returning empty results as success) or terminating entire workflows on single failures are both anti-patterns",
        ],
        skills: [
          "Returning structured error context including failure type, what was attempted, partial results, and potential alternatives to enable coordinator recovery",
          "Distinguishing access failures from valid empty results in error reporting so the coordinator can make appropriate decisions",
          "Having subagents implement local recovery for transient failures and only propagate errors they cannot resolve, including what was attempted and partial results",
          "Structuring synthesis output with coverage annotations indicating which findings are well-supported versus which topic areas have gaps due to unavailable sources",
        ],
        deepDive: {
          whyItMatters:
            "Multi-agent errors have two wrong answers: silently suppress (return empty as success) or terminate the whole workflow. The right answer is always structured error context so the coordinator can make a decision: retry, proceed with partial, annotate gaps.",
          pitfalls: [
            "Subagent returns `{ results: [] }` on timeout — coordinator thinks the query was successful.",
            "Coordinator aborts the entire pipeline on any single subagent error — loses partial results.",
            "Undifferentiated error statuses — \"search unavailable\" hides whether it was a timeout vs rate-limit vs bad query.",
            "Not distinguishing access failures from valid empty results — coordinator can't choose between retry and accept.",
          ],
          example:
            "Web-search subagent times out on 1 of 3 queries. It returns: `{ failure_type: \"timeout\", attempted_query: \"...\", partial_results: [<2 successful>], alternatives: [\"cached search\", \"doc-analysis subagent\"] }`. Coordinator proceeds with synthesis, annotates the report: \"Coverage gap on X due to search timeout.\"",
          visuals: [
            {
              kind: "graphviz",
              title: "Structured error propagation",
              caption:
                "Partial results + what was attempted + alternatives — coordinator can decide.",
              dot: `digraph ErrorPropagation {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.7;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  sub [label="Subagent\\n(web_search)", fillcolor="#6366f1", color="#4f46e5"];
  err [label="{ failure_type: timeout\\n  attempted_query: ...\\n  partial_results: [...]\\n  alternatives: [...] }", fillcolor="#f59e0b", color="#d97706"];
  coord [label="Coordinator\\ndecides", fillcolor="#6366f1", color="#4f46e5"];

  retry [label="Retry with\\ncached search"];
  proc  [label="Proceed with\\npartial + annotate gap", fillcolor="#10b981", color="#059669"];
  abort [label="Abort\\n(only if critical)", fillcolor="#f43f5e", color="#e11d48"];

  sub -> err;
  err -> coord;
  coord -> retry [label="transient", color="#10b981", fontcolor="#047857"];
  coord -> proc  [label="partial OK", color="#10b981", fontcolor="#047857", penwidth=1.6];
  coord -> abort [label="unrecoverable", color="#f43f5e", fontcolor="#be123c"];
}`,
            },
            {
              kind: "do-dont",
              title: "Error propagation: do vs. don't",
              items: [
                {
                  good: "Return structured errors with failure_type + partial_results + alternatives.",
                  bad: 'Return { results: [] } on timeout.',
                  note: "Silent empty results look like \"nothing matched\" — coordinator can't tell the difference.",
                },
                {
                  good: "Handle transient failures inside the subagent; escalate only what you can't recover.",
                  bad: "Propagate every error up to the coordinator.",
                  note: "Local recovery is cheaper and doesn't force the coordinator to reason about every timeout.",
                },
                {
                  good: "Annotate synthesis reports with coverage gaps.",
                  bad: "Abort the whole workflow when one subagent fails.",
                  note: "Partial with gaps > nothing at all, as long as the gaps are named.",
                },
                {
                  good: "Distinguish access failures from \"valid empty result\".",
                  bad: "Treat both as the same error status.",
                  note: "\"Nothing matched\" is success; \"couldn't reach the service\" is not.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "5.4",
        title: "Manage context effectively in large codebase exploration",
        knowledge: [
          'Context degradation in extended sessions: models start giving inconsistent answers and referencing "typical patterns" rather than specific classes discovered earlier',
          "The role of scratchpad files for persisting key findings across context boundaries",
          "Subagent delegation for isolating verbose exploration output while the main agent coordinates high-level understanding",
          "Structured state persistence for crash recovery: each agent exports state to a known location, and the coordinator loads a manifest on resume",
        ],
        skills: [
          'Spawning subagents to investigate specific questions (e.g., "find all test files," "trace refund flow dependencies") while the main agent preserves high-level coordination',
          "Having agents maintain scratchpad files recording key findings, referencing them for subsequent questions to counteract context degradation",
          "Summarizing key findings from one exploration phase before spawning sub-agents for the next phase, injecting summaries into initial context",
          "Designing crash recovery using structured agent state exports (manifests) that the coordinator loads on resume and injects into agent prompts",
          "Using /compact to reduce context usage during extended exploration sessions when context fills with verbose discovery output",
        ],
        deepDive: {
          whyItMatters:
            "Extended sessions degrade. The answer patterns: (1) scratchpad files to persist findings, (2) subagent delegation for verbose exploration, (3) manifest-based state for crash recovery. `/compact` is a quick tool but not a replacement for structured persistence.",
          pitfalls: [
            "Trusting a 90-turn session to remember specific classes discovered at turn 10 — it starts giving \"typical\" answers instead.",
            "Running verbose exploration directly in the main agent — subagent delegation keeps main context clean.",
            "No crash recovery plan: a 6-hour analysis session crashes and you restart from zero.",
            "Using `/compact` as the primary strategy when scratchpads + manifests would be durable.",
          ],
          example:
            "Main agent explores a 500-file codebase. Findings go into `.claude/scratchpad/modules.md` as structured entries. Each agent writes a manifest (`{ phase: \"dep-mapping\", completed: [...], next: [...] }`). On crash, coordinator loads manifests and injects them into each agent's next prompt — work resumes from the right place.",
          visuals: [
            {
              kind: "graphviz",
              title: "Scratchpad + subagents + manifests",
              caption:
                "Main agent stays clean. Findings persist. Crashes don't cost the whole session.",
              dot: `digraph LargeCodebase {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.6;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  main [label="Main agent\\n(high-level)", fillcolor="#6366f1", color="#4f46e5"];

  subgraph cluster_subs {
    label="Subagents (verbose exploration)";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    s1 [label="find test files"];
    s2 [label="trace refund flow"];
    s3 [label="map imports"];
  }

  scratch [label=".claude/scratchpad/\\nmodules.md\\n(structured findings)", fillcolor="#10b981", color="#059669"];
  manifest [label="manifest.json\\n{ phase, completed, next }", fillcolor="#f59e0b", color="#d97706"];

  main -> s1;
  main -> s2;
  main -> s3;
  s1 -> scratch [style=dashed];
  s2 -> scratch [style=dashed];
  s3 -> scratch [style=dashed];
  s1 -> manifest [style=dashed];
  s2 -> manifest [style=dashed];
  s3 -> manifest [style=dashed];
  manifest -> main [style=dashed, label="load on crash-recover", color="#f59e0b", fontcolor="#b45309"];
}`,
            },
            {
              kind: "do-dont",
              title: "Large-codebase context: do vs. don't",
              items: [
                {
                  good: "Delegate verbose exploration to subagents; keep the main context clean.",
                  bad: "Run grep/read chains directly in the main agent for 6 hours.",
                  note: "The main context degrades; subagents give you fresh attention per investigation.",
                },
                {
                  good: "Persist key findings to a scratchpad file.",
                  bad: 'Assume the model will remember what it found at turn 10 when you reach turn 90.',
                  note: "Extended sessions drift to \"typical patterns\" answers. Scratchpads anchor facts.",
                },
                {
                  good: "Use manifest files so a crashed session resumes with state.",
                  bad: "Rely on /compact as the durability strategy.",
                  note: "/compact is a quick tool, not persistence. Manifests survive crashes.",
                },
                {
                  good: "Summarize one phase before moving to the next.",
                  bad: "Let raw discovery output pile up across phases.",
                  note: "Without phase-boundary summaries, later prompts get context bloat instead of conclusions.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "5.5",
        title: "Design human review workflows and confidence calibration",
        knowledge: [
          "The risk that aggregate accuracy metrics (e.g., 97% overall) may mask poor performance on specific document types or fields",
          "Stratified random sampling for measuring error rates in high-confidence extractions and detecting novel error patterns",
          "Field-level confidence scores calibrated using labeled validation sets for routing review attention",
          "The importance of validating accuracy by document type and field segment before automating high-confidence extractions",
        ],
        skills: [
          "Implementing stratified random sampling of high-confidence extractions for ongoing error rate measurement and novel pattern detection",
          "Analyzing accuracy by document type and field to verify consistent performance across all segments before reducing human review",
          "Having models output field-level confidence scores, then calibrating review thresholds using labeled validation sets",
          "Routing extractions with low model confidence or ambiguous/contradictory source documents to human review, prioritizing limited reviewer capacity",
        ],
        deepDive: {
          whyItMatters:
            "A 97% aggregate accuracy can hide 60% accuracy on a specific document type. The exam tests whether you know to stratify by document type AND field before automating. Stratified random sampling of high-confidence extractions is the ongoing-measurement pattern.",
          pitfalls: [
            "Trusting aggregate accuracy without slicing by document type or field.",
            "Using model self-confidence scores without calibrating against a labeled validation set.",
            "Routing all extractions to review — wastes reviewer capacity.",
            "Only sampling low-confidence outputs — miss novel failures in high-confidence ones.",
          ],
          example:
            "Extraction pipeline reports 96% overall accuracy. Segmenting by doc type reveals: invoices 99%, receipts 98%, handwritten notes 61%. Route handwritten notes to review. Additionally, stratified-sample 5% of high-confidence invoices weekly to catch novel failures.",
          visuals: [
            {
              kind: "graphviz",
              title: "Aggregate accuracy hides segment failures",
              caption:
                "96% overall can mask 61% on a specific doc type. Stratify before automating.",
              dot: `digraph StratifiedAccuracy {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  agg [label="Aggregate: 96% accuracy\\n(looks fine)", fillcolor="#f59e0b", color="#d97706"];

  subgraph cluster_split {
    label="Stratified by document type";
    labelloc="t"; labeljust="l";
    fontcolor="#4f46e5"; fontsize=11;
    style="dashed,rounded"; color="#6366f1"; bgcolor="transparent";
    inv  [label="Invoices: 99%", fillcolor="#10b981", color="#059669"];
    rec  [label="Receipts: 98%", fillcolor="#10b981", color="#059669"];
    hand [label="Handwritten: 61%", fillcolor="#f43f5e", color="#e11d48"];
  }

  action [label="Route handwritten → review\\nSample 5% of invoices weekly"];

  agg -> inv [style=dashed];
  agg -> rec [style=dashed];
  agg -> hand [style=dashed];
  hand -> action [color="#f43f5e", fontcolor="#be123c"];
}`,
            },
            {
              kind: "do-dont",
              title: "Human review & calibration: do vs. don't",
              items: [
                {
                  good: "Slice accuracy by document type AND field before automating.",
                  bad: "Trust a single aggregate accuracy number.",
                  note: "Aggregates hide tail segments where the pipeline fails badly.",
                },
                {
                  good: "Calibrate confidence thresholds against a labeled validation set.",
                  bad: "Trust the model's raw self-reported confidence.",
                  note: "Model confidence isn't inherently calibrated — you have to fit it to truth.",
                },
                {
                  good: "Stratified-sample high-confidence extractions weekly.",
                  bad: "Only sample low-confidence items.",
                  note: "Low-confidence is already going to review. Novel failures hide in \"high confidence\".",
                },
                {
                  good: "Route to review by confidence AND source ambiguity.",
                  bad: "Send everything to review regardless.",
                  note: "Review capacity is the bottleneck; prioritize the extractions that most need it.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "5.6",
        title: "Preserve information provenance and handle uncertainty in multi-source synthesis",
        knowledge: [
          "How source attribution is lost during summarization steps when findings are compressed without preserving claim-source mappings",
          "The importance of structured claim-source mappings that the synthesis agent must preserve and merge when combining findings",
          "How to handle conflicting statistics from credible sources: annotating conflicts with source attribution rather than arbitrarily selecting one value",
          "Temporal data: requiring publication/collection dates in structured outputs to prevent temporal differences from being misinterpreted as contradictions",
        ],
        skills: [
          "Requiring subagents to output structured claim-source mappings (source URLs, document names, relevant excerpts) that downstream agents preserve through synthesis",
          "Structuring reports with explicit sections distinguishing well-established findings from contested ones, preserving original source characterizations and methodological context",
          "Completing document analysis with conflicting values included and explicitly annotated, letting the coordinator decide how to reconcile before passing to synthesis",
          "Requiring subagents to include publication or data collection dates in structured outputs to enable correct temporal interpretation",
          "Rendering different content types appropriately in synthesis outputs — financial data as tables, news as prose, technical findings as structured lists — rather than converting everything to a uniform format",
        ],
        deepDive: {
          whyItMatters:
            "Synthesis without provenance is the Multi-Agent Research scenario's primary failure mode. Conflicting sources → preserve both with attribution, NEVER arbitrarily pick one. Temporal data without dates → false contradictions. Claim-source mappings have to survive every downstream transform.",
          pitfalls: [
            'Two credible sources disagree (4.2% vs 3.8% unemployment) → picking one arbitrarily. Correct: report both with attribution + dates.',
            "Summarization steps that drop source URLs — downstream can't attribute claims.",
            "Numbers from 2019 and 2024 compared directly — ignoring dates creates phantom contradictions.",
            "Converting all findings to the same format (\"everything as prose\") — financial data needs tables, news needs prose.",
          ],
          example:
            "Synthesis report splits into \"Well-established findings\" (all sources agree) and \"Contested / evolving findings\" (sources differ). Contested section: `\"Q3 unemployment: 4.2% (BLS, Oct 2024) vs 3.8% (Reuters poll, Sep 2024). Difference likely reflects methodology (household survey vs payroll).\"` Reader sees the conflict, not a fabricated consensus.",
          visuals: [
            {
              kind: "graphviz",
              title: "Claim-source mappings survive synthesis",
              caption:
                "Provenance must be preserved end-to-end. Summarization steps that drop URLs break attribution.",
              dot: `digraph Provenance {
  rankdir=LR;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.45;
  ranksep=0.65;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  src1 [label="BLS.gov\\n(Oct 2024)", fillcolor="#f59e0b", color="#d97706"];
  src2 [label="Reuters poll\\n(Sep 2024)", fillcolor="#f59e0b", color="#d97706"];

  ext1 [label="{ claim: \\"4.2%\\",\\n  source: BLS,\\n  date: 2024-10 }"];
  ext2 [label="{ claim: \\"3.8%\\",\\n  source: Reuters,\\n  date: 2024-09 }"];

  merge [label="Synthesis\\n(preserves mappings)", fillcolor="#6366f1", color="#4f46e5"];

  report [label="Contested findings section:\\n4.2% (BLS, Oct 2024)\\nvs 3.8% (Reuters, Sep 2024)", fillcolor="#10b981", color="#059669"];

  src1 -> ext1;
  src2 -> ext2;
  ext1 -> merge;
  ext2 -> merge;
  merge -> report [penwidth=1.6, color="#10b981", fontcolor="#047857"];
}`,
            },
            {
              kind: "graphviz",
              title: "Conflicting sources: preserve, don't pick",
              caption:
                "Arbitrary selection fabricates consensus. Report both.",
              dot: `digraph ConflictHandling {
  rankdir=TB;
  bgcolor="transparent";
  pad=0.3;
  nodesep=0.4;
  ranksep=0.55;
  fontname="Helvetica, Arial, sans-serif";
  node [shape=box, style="rounded,filled", fillcolor="#1e293b", color="#1e293b",
        fontcolor="white", fontsize=12, margin="0.22,0.14", penwidth=1.2];
  edge [color="#94a3b8", fontcolor="#475569", fontsize=10, penwidth=1.2, arrowsize=0.8];

  conflict [label="Two credible sources\\ndisagree", fillcolor="#f59e0b", color="#d97706"];

  subgraph cluster_bad {
    label="✗  Pick one";
    labelloc="t"; labeljust="l";
    fontcolor="#be123c"; fontsize=11;
    style="dashed,rounded"; color="#f43f5e"; bgcolor="transparent";
    bad1 [label="Output: \\"4.2%\\"\\n(fabricated consensus)", fillcolor="#f43f5e", color="#e11d48"];
  }

  subgraph cluster_good {
    label="✓  Preserve both + attribution";
    labelloc="t"; labeljust="l";
    fontcolor="#047857"; fontsize=11;
    style="dashed,rounded"; color="#10b981"; bgcolor="transparent";
    good1 [label="Output: both values,\\nboth sources,\\nboth dates,\\nmethodology note", fillcolor="#10b981", color="#059669"];
  }

  conflict -> bad1 [color="#f43f5e"];
  conflict -> good1 [color="#10b981", penwidth=1.6];
}`,
            },
            {
              kind: "do-dont",
              title: "Provenance & synthesis: do vs. don't",
              items: [
                {
                  good: "Require claim-source-date mappings at every stage.",
                  bad: "Let a summarization step drop URLs.",
                  note: "Once attribution is lost, no downstream step can recover it.",
                },
                {
                  good: "Report conflicting values from credible sources with attribution.",
                  bad: "Arbitrarily select one value and present it as fact.",
                  note: "Fabricated consensus is worse than a disclosed conflict — readers can assess the difference themselves.",
                },
                {
                  good: "Require publication/collection dates on all data.",
                  bad: "Compare a 2019 number to a 2024 number as if they're peers.",
                  note: "Temporal differences create phantom contradictions if dates aren't surfaced.",
                },
                {
                  good: "Render content by type — tables for financial, prose for narrative, lists for technical.",
                  bad: "Flatten everything to uniform prose.",
                  note: "Uniform format loses structure the reader needs to scan the report.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
];

export function getDomain(slug: string): Domain | undefined {
  return DOMAINS.find((d) => d.slug === slug);
}

export function getDomainById(id: string): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}

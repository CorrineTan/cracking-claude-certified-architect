# Cracking the Claude Certified Architect

Study workspace for the **Claude Certified Architect – Foundations** exam. Contains the authoritative exam guide (`claude_architect_exam.pdf`), hands-on practice exercises under `Exercise/`, and a Next.js study website under `website/` that renders the exam guide into browsable domains, scenarios, sample questions, and exercises.

## Repo layout

```
.
├── claude_architect_exam.pdf          # authoritative exam spec (Confidential NTK)
├── Exercise/
│   ├── Exercise1_Multi_Tool_Escalaction_Logic/   # agentic loop + MCP + hooks (complete)
│   └── Exercise2_Claude_Code_Team_Workflow/      # CLAUDE.md + .claude/ config (complete)
├── website/                            # Next.js + Tailwind study site
└── CLAUDE.md                           # project instructions for Claude Code
```

## Study website (`website/`)

A Next.js + Tailwind site that turns the exam guide into a browsable study tool with a persistent sidebar for quick jumping between domains, scenarios, questions, and exercises.

### What's inside

- **5 domains** with weights, task statements, knowledge and skill bullets:
  1. Agentic Architecture & Orchestration (27%)
  2. Tool Design & MCP Integration (18%)
  3. Claude Code Configuration & Workflows (20%)
  4. Prompt Engineering & Structured Output (20%)
  5. Context Management & Reliability (15%)
- **6 exam scenarios** — customer support, code generation, multi-agent research, developer productivity, CI/CD, structured extraction — each linked to its primary domains.
- **30 practice questions** (from the PDF plus generated) organized by scenario, with per-question explanations revealed on click.
- **4 preparation exercises** with objectives, domain mapping, step-by-step instructions, and links to the matching project under `Exercise/` when implemented.
- **Appendix** covering in-scope technologies, in-scope topics, out-of-scope topics, and exam metadata (passing score 720 / 1,000).
- **Exam recommendations** — high-level study actions pulled from the exam guide.

### Run locally

```bash
cd website
npm install
npm run dev
```

Opens at http://localhost:3000.

### Build

```bash
cd website
npm run build
npm run start
```

### Structure

```
website/
  app/
    page.tsx                 → home (stats, domain weights, scenarios, exercises)
    layout.tsx               → shared sidebar layout
    domains/                 → /domains and /domains/[slug]
    scenarios/               → /scenarios and /scenarios/[slug]
    questions/               → /questions and /questions/[slug]
    exercises/               → /exercises and /exercises/[slug]
    appendix/                → /appendix
    recommendations/         → /recommendations
    globals.css
  components/
    Sidebar.tsx              → persistent left nav with sections
    TopBar.tsx               → page title + breadcrumbs
    DomainBadge.tsx
    WeightBar.tsx            → domain weight visualization on home
    ScenarioCard.tsx
    ExerciseCard.tsx
    QuestionCard.tsx         → click-to-reveal answer + explanation
    TaskStatement.tsx        → knowledge / skills bullet list
    CalloutBox.tsx
    PrevNext.tsx
  lib/
    types.ts                 → shared TypeScript types
    domains.ts               → 5 domains × task statements
    scenarios.ts             → 6 exam scenarios
    questions.ts             → PDF + generated questions with answers
    exercises.ts             → 4 preparation exercises, linked to Exercise/
    appendix.ts              → technologies, in/out-of-scope, recommendations, EXAM_META
  next.config.mjs
  tailwind.config.ts
  tsconfig.json
  package.json
```

### Routes

| Route | Description |
|---|---|
| `/` | Home — exam stats, domain weighting, scenarios, exercises |
| `/domains` · `/domains/[slug]` | Domain list and per-domain task statements |
| `/scenarios` · `/scenarios/[slug]` | Scenario narratives and primary domain mapping |
| `/questions` · `/questions/[scenario]` | Questions grouped by scenario, with reveal-on-click answers |
| `/exercises` · `/exercises/[slug]` | Exercise objectives, steps, and links to local repo paths |
| `/appendix` | Technologies, in-scope, out-of-scope, exam metadata |
| `/recommendations` | Suggested preparation actions |

### Tech

- Next.js 15 (App Router)
- React 18
- TypeScript 5.6
- Tailwind CSS 3.4

All exam content is defined as typed TypeScript data in `lib/` — no database, no CMS. To add or edit content, update the corresponding `lib/*.ts` file and the changes surface across list and detail pages automatically.

## Exercises

The exercises surfaced under `/exercises` on the site live at the repo root. Each is a self-contained project with its own dependencies and README — always `cd` into the specific exercise directory before running commands.

### Exercise 1 — Multi-Tool Escalation Logic (complete)

Customer support agent built on the Anthropic Messages API + MCP. Demonstrates an agentic loop driven by `stop_reason`, 4 MCP tools with structured `isError` responses, client-side hooks enforcing prerequisite gates and a $500 refund threshold, and `CaseFacts` context management.

```bash
cd Exercise/Exercise1_Multi_Tool_Escalaction_Logic
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Requires .env with ANTHROPIC_API_KEY=sk-ant-...

python main.py                              # list scenarios
python main.py 1_simple_order_inquiry       # run one scenario
python main.py all                          # run all scenarios
SIMULATE_TRANSIENT_ERRORS=1 python main.py 1_simple_order_inquiry  # test retry logic
```

### Exercise 2 — Claude Code Team Workflow (complete)

Full-stack sample app (FastAPI + React) demonstrating Claude Code configuration patterns. The focus is on the config files: `.claude/rules/` with glob-scoped path rules, a project-scoped `/review` slash command, an `analyze-module` skill with `context: fork` and `allowed-tools`, and a `.mcp.json` with env var expansion.

```bash
cd Exercise/Exercise2_Claude_Code_Team_Workflow
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
npm install                                 # frontend dependencies (optional)

pytest tests/                               # run Python tests
pytest tests/api/test_orders.py             # single test file
npm test                                    # frontend tests
```

### Exercise 3 — Structured Data Extraction Pipeline (not yet built)

Planned: JSON-schema-enforced `tool_use` extraction, validation-retry loops, few-shot examples for varied document formats, Message Batches API for bulk processing, and confidence-based human-review routing.

### Exercise 4 — Multi-Agent Research Pipeline (not yet built)

Planned: coordinator agent delegating to web-search and document-analysis subagents, parallel subagent execution, structured claim-source mappings, error propagation with partial-results handling, and conflict annotation in synthesis output.

## Exam reference

`claude_architect_exam.pdf` at the repo root is the authoritative spec — exam domains, task statements, scenario narratives, and sample questions all derive from it. The PDF is marked Confidential NTK.

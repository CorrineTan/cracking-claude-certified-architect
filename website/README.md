# Claude Certified Architect – Study Website

A personal study companion for the **Claude Certified Architect – Foundations** exam, built as a Next.js + Tailwind site. It renders the exam guide (`claude_architect_exam.pdf` at the repo root) into browsable domains, scenarios, sample questions with click-to-reveal answers, and the practice exercises under `Exercise/`.

## What's inside

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

## Run locally

```bash
cd website
npm install
npm run dev
```

Opens at http://localhost:3000.

## Build

```bash
npm run build
npm run start
```

## Structure

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

## Routes

| Route | Description |
|---|---|
| `/` | Home — exam stats, domain weighting, scenarios, exercises |
| `/domains` · `/domains/[slug]` | Domain list and per-domain task statements |
| `/scenarios` · `/scenarios/[slug]` | Scenario narratives and primary domain mapping |
| `/questions` · `/questions/[scenario]` | Questions grouped by scenario, with reveal-on-click answers |
| `/exercises` · `/exercises/[slug]` | Exercise objectives, steps, and links to local repo paths |
| `/appendix` | Technologies, in-scope, out-of-scope, exam metadata |
| `/recommendations` | Suggested preparation actions |

## Tech

- Next.js 15 (App Router)
- React 18
- TypeScript 5.6
- Tailwind CSS 3.4

All exam content is defined as typed TypeScript data in `lib/` — no database, no CMS. To add or edit content, update the corresponding `lib/*.ts` file and the changes surface across list and detail pages automatically.

## Related

The exercises surfaced under `/exercises` live at the repo root:

- `Exercise/Exercise1_Multi_Tool_Escalaction_Logic/` — multi-tool agent with escalation logic (complete)
- `Exercise/Exercise2_Claude_Code_Team_Workflow/` — Claude Code team workflow configuration (complete)
- Exercises 3 and 4 — structured extraction pipeline and multi-agent research pipeline (not yet built)

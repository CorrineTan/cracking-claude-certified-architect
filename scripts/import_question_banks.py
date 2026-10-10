#!/usr/bin/env python3
"""Import the two external question banks into website/lib/questions-imported.ts.

Sources:
  - /Users/corrtan/Desktop/ccaf_pratice_exam/additional_60_q.md  (60q markdown)
  - /Users/corrtan/Desktop/ccaf_pratice_exam/questions/questions.json  (119q video practice)

Output:
  - website/lib/questions-imported.ts  (TypeScript Question[] export)

Run:  python3 scripts/import_question_banks.py
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
WEBSITE_LIB = REPO_ROOT / "website" / "lib"
OUTPUT = WEBSITE_LIB / "questions-imported.ts"

MD_SOURCE = Path("/Users/corrtan/Desktop/ccaf_pratice_exam/additional_60_q.md")
JSON_SOURCE = Path("/Users/corrtan/Desktop/ccaf_pratice_exam/questions/questions.json")

# ─── Domain inference ────────────────────────────────────────────────
# The 60q markdown has explicit "Domain X:" headers; mark each Q with the
# nearest preceding header. Mapping mirrors the website's DomainId:
DOMAIN_NUM_TO_ID = {1: "D1", 2: "D2", 3: "D3", 4: "D4", 5: "D5"}

# Fallback domain for "General" / questions.json (no domain field).
# We infer from scenario where possible.
SCENARIO_DEFAULT_DOMAIN = {
    "customer-support": "D1",
    "code-generation": "D3",
    "multi-agent-research": "D1",
    "developer-productivity": "D3",
    "ci-cd": "D3",
    "structured-extraction": "D4",
}

# External scenario names → website ScenarioSlug
SCENARIO_NAME_MAP = {
    "Customer Support Resolution Agent": "customer-support",
    "Code Generation with Claude Code": "code-generation",
    "Multi-Agent Research System": "multi-agent-research",
    "Developer Productivity with Claude": "developer-productivity",
    "Claude Code for Continuous Integration": "ci-cd",
    "Claude Code for CI/CD": "ci-cd",
    "Structured Data Extraction": "structured-extraction",
    # General → bucket into developer-productivity (closest fit; mostly Claude
    # Code / API mechanics that show up in dev workflows)
    "General": "developer-productivity",
    "": "developer-productivity",
}


@dataclass
class ImportedQuestion:
    id: str
    scenario: str
    domain: str
    taskId: str
    number: int | None
    title: str | None
    prompt: str
    options: list[dict[str, str]]
    correctAnswer: str
    explanation: str
    source: str
    whyOthersWrong: list[dict[str, str]] = field(default_factory=list)
    examTip: str | None = None


# ─── 60q markdown parser ─────────────────────────────────────────────

Q_HEADER_RE = re.compile(r"^❓ Q(\d+)\.?\s*(.*)$")
DOMAIN_HEADER_RE = re.compile(r"^Domain (\d+):", re.IGNORECASE)
SCENARIO_LINE_RE = re.compile(r"^Scenario:\s*(.+)$")
ANSWER_LINE_RE = re.compile(r"^✅\s*Answer:\s*([ABCD])")
OPTION_LINE_RE = re.compile(r"^([ABCD])\)\s*(.+)$")
WRONG_BULLET_RE = re.compile(r"^🚫\s*([ABCD]):\s*(.+)$")

SECTION_TIP = "💡 CCA Exam Tip"
SECTION_EXPLAIN = "Explanation"
SECTION_WHY_WRONG = "Why the other answers are wrong"


def parse_60q_markdown(path: Path) -> list[ImportedQuestion]:
    text = path.read_text()
    lines = text.splitlines()

    # Split into question blocks at each ❓ header
    blocks: list[tuple[int, list[str]]] = []  # (start_line_index, lines)
    cur_lines: list[str] = []
    cur_start = 0
    current_domain_num: int | None = None
    domain_for_block: list[int | None] = []
    capturing = False

    for i, line in enumerate(lines):
        m_dom = DOMAIN_HEADER_RE.match(line.strip())
        if m_dom:
            current_domain_num = int(m_dom.group(1))

        if Q_HEADER_RE.match(line):
            if capturing:
                blocks.append((cur_start, cur_lines))
                domain_for_block.append(current_domain_num)
            cur_lines = [line]
            cur_start = i
            capturing = True
        elif capturing:
            cur_lines.append(line)

    if capturing:
        blocks.append((cur_start, cur_lines))
        domain_for_block.append(current_domain_num)

    out: list[ImportedQuestion] = []
    for (_start, blines), dom_num in zip(blocks, domain_for_block):
        q = parse_md_block(blines, dom_num)
        if q is not None:
            out.append(q)
    return out


def parse_md_block(blines: list[str], dom_num: int | None) -> ImportedQuestion | None:
    if not blines:
        return None
    m = Q_HEADER_RE.match(blines[0])
    if not m:
        return None
    qnum = int(m.group(1))
    title = m.group(2).strip()

    scenario_label = ""
    options: list[dict[str, str]] = []
    correct: str | None = None
    explanation_parts: list[str] = []
    wrong_parts: list[dict[str, str]] = []
    exam_tip_parts: list[str] = []
    prompt_parts: list[str] = []

    state = "prompt"  # prompt → answer-arrows → explanation → why-wrong → exam-tip

    skip_next_until_arrows = False
    for line in blines[1:]:
        stripped = line.strip()

        # Scenario header (Scenario: X)
        sm = SCENARIO_LINE_RE.match(stripped)
        if sm:
            scenario_label = sm.group(1).strip()
            continue

        # Answer line
        am = ANSWER_LINE_RE.match(stripped)
        if am:
            correct = am.group(1)
            state = "explanation"
            continue

        # Option line (only collect during prompt state)
        if state == "prompt":
            om = OPTION_LINE_RE.match(stripped)
            if om:
                options.append({"label": om.group(1), "text": om.group(2).strip()})
                continue

        # Down-arrow separators between Q and answer
        if stripped == "⬇":
            continue

        if state == "explanation":
            if stripped.startswith(SECTION_WHY_WRONG):
                state = "why-wrong"
                continue
            if stripped.startswith(SECTION_TIP):
                state = "exam-tip"
                continue
            if stripped == "Explanation":
                continue
            if stripped:
                explanation_parts.append(stripped)
            continue

        if state == "why-wrong":
            if stripped.startswith(SECTION_TIP):
                state = "exam-tip"
                continue
            wm = WRONG_BULLET_RE.match(stripped)
            if wm:
                wrong_parts.append({"label": wm.group(1), "reason": wm.group(2).strip()})
            continue

        if state == "exam-tip":
            if stripped:
                exam_tip_parts.append(stripped)
            continue

        # Default: append to prompt body
        if stripped:
            prompt_parts.append(stripped)

    if correct is None or len(options) != 4:
        return None

    domain_id = DOMAIN_NUM_TO_ID.get(dom_num or 0, "D1")
    scenario_slug = SCENARIO_NAME_MAP.get(scenario_label, "developer-productivity")

    # Strip the scenario line out of prompt parts (Scenario was already extracted)
    return ImportedQuestion(
        id=f"cca-q{qnum:02d}",
        scenario=scenario_slug,
        domain=domain_id,
        taskId=f"{dom_num or 1}.0",
        number=qnum,
        title=title,
        prompt=" ".join(prompt_parts).strip(),
        options=options,
        correctAnswer=correct,
        explanation=" ".join(explanation_parts).strip(),
        source="cca-series",
        whyOthersWrong=wrong_parts,
        examTip=" ".join(exam_tip_parts).strip() or None,
    )


# ─── questions.json parser ───────────────────────────────────────────


def parse_questions_json(path: Path) -> list[ImportedQuestion]:
    data = json.loads(path.read_text())
    raw = data.get("questions", [])
    out: list[ImportedQuestion] = []

    for i, q in enumerate(raw):
        correct = q.get("correct_letter")
        if not correct or correct not in {"A", "B", "C", "D"}:
            # Skip questions where the correct answer wasn't determined
            continue
        opts = q.get("options") or []
        if len(opts) != 4:
            continue

        scenario_label = q.get("scenario", "")
        scenario_slug = SCENARIO_NAME_MAP.get(scenario_label, "developer-productivity")
        domain_id = SCENARIO_DEFAULT_DOMAIN.get(scenario_slug, "D1")

        prompt = (q.get("question") or "").strip()
        explanation = (q.get("explanation") or "").strip()
        # study_area sometimes contains double-pasted text — keep first line only
        study = (q.get("study_area") or "").strip()
        exam_tip = study.split("\n\n")[0].strip() if study else None

        # Map raw options list (strings) to A/B/C/D
        labeled = [
            {"label": label, "text": str(opt).strip()}
            for label, opt in zip("ABCD", opts)
        ]

        out.append(
            ImportedQuestion(
                id=f"video-{i+1:03d}",
                scenario=scenario_slug,
                domain=domain_id,
                taskId=f"{domain_id[1]}.0",
                number=q.get("question_num"),
                title=None,
                prompt=prompt,
                options=labeled,
                correctAnswer=correct,
                explanation=explanation,
                source="video-practice",
                whyOthersWrong=[],
                examTip=exam_tip,
            )
        )

    return out


# ─── TypeScript emitter ──────────────────────────────────────────────


def ts_string(s: str) -> str:
    """Emit a TypeScript double-quoted string with backslash escaping."""
    if s is None:
        return "undefined"
    s = s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")
    return f'"{s}"'


def emit_ts(qs: list[ImportedQuestion]) -> str:
    lines = [
        "// AUTO-GENERATED by scripts/import_question_banks.py — do not edit by hand.",
        "// Source banks:",
        "//   - additional_60_q.md  (cca-series, 60q with exam tips)",
        "//   - questions.json      (video-practice, 119q from CCFA video walkthroughs)",
        "import type { Question } from \"./types\";",
        "",
        "export const IMPORTED_QUESTIONS: Question[] = [",
    ]
    for q in qs:
        lines.append("  {")
        lines.append(f"    id: {ts_string(q.id)},")
        lines.append(f"    scenario: {ts_string(q.scenario)} as Question[\"scenario\"],")
        lines.append(f"    domain: {ts_string(q.domain)} as Question[\"domain\"],")
        lines.append(f"    taskId: {ts_string(q.taskId)},")
        if q.number is not None:
            lines.append(f"    number: {q.number},")
        if q.title:
            lines.append(f"    title: {ts_string(q.title)},")
        lines.append(f"    prompt: {ts_string(q.prompt)},")
        lines.append("    options: [")
        for opt in q.options:
            lines.append(
                f"      {{ label: \"{opt['label']}\", text: {ts_string(opt['text'])} }},"
            )
        lines.append("    ],")
        lines.append(f"    correctAnswer: \"{q.correctAnswer}\",")
        lines.append(f"    explanation: {ts_string(q.explanation)},")
        lines.append(f"    source: {ts_string(q.source)} as Question[\"source\"],")
        if q.whyOthersWrong:
            lines.append("    whyOthersWrong: [")
            for w in q.whyOthersWrong:
                lines.append(
                    f"      {{ label: \"{w['label']}\", reason: {ts_string(w['reason'])} }},"
                )
            lines.append("    ],")
        if q.examTip:
            lines.append(f"    examTip: {ts_string(q.examTip)},")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    return "\n".join(lines)


# ─── Main ────────────────────────────────────────────────────────────


def main() -> None:
    md_qs = parse_60q_markdown(MD_SOURCE)
    json_qs = parse_questions_json(JSON_SOURCE)
    print(f"Parsed: {len(md_qs)} from cca-series md, {len(json_qs)} from video-practice json")
    all_qs = md_qs + json_qs
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(emit_ts(all_qs))
    print(f"Wrote {OUTPUT} ({len(all_qs)} questions)")


if __name__ == "__main__":
    main()

/**
 * Micro-lessons — auto-generated from each task statement.
 *
 * Each domain task in `domains.ts` carries `knowledge[]`, `skills[]`, and an
 * optional `deepDive` block (whyItMatters / pitfalls / example / visuals).
 * That's all the raw material a 2-5 minute lesson needs:
 *
 *   - title          — task statement title
 *   - kicker         — Domain X · task id
 *   - whyItMatters   — opening hook (or first knowledge bullet as fallback)
 *   - keyIdeas[]     — knowledge bullets, displayed as bite-size cards
 *   - skills[]       — what you can do after this
 *   - pitfalls[]     — exam traps to memorize
 *   - example        — concrete worked example
 *   - check          — quick check question pulled from QUESTIONS where the
 *                      taskId matches; null if no question maps cleanly.
 *
 * No dedicated content authoring step. Edit `domains.ts` and the lesson
 * regenerates automatically.
 */

import type { TaskStatement, Domain, VisualBlock } from "./types";
import { DOMAINS } from "./domains";
import { QUESTIONS } from "./questions";

export interface Lesson {
  id: string;
  domainId: Domain["id"];
  domainNumber: Domain["number"];
  domainTitle: string;
  domainSlug: Domain["slug"];
  title: string;
  minutes: number;
  whyItMatters: string;
  keyIdeas: string[];
  skills: string[];
  pitfalls: string[];
  example?: string;
  checkQuestionId?: string;
  ordinalInDomain: number;
  visuals: VisualBlock[];
}

function estimateMinutes(t: TaskStatement): number {
  const totalChars =
    t.knowledge.join(" ").length +
    t.skills.join(" ").length +
    (t.deepDive?.whyItMatters?.length ?? 0) +
    (t.deepDive?.example?.length ?? 0) +
    (t.deepDive?.pitfalls?.join(" ").length ?? 0);
  // ~200 wpm reading, ~5 chars/word, plus 60s for the check
  const reading = Math.ceil(totalChars / (200 * 5)) + 1;
  return Math.max(2, Math.min(reading, 7));
}

function buildLesson(d: Domain, t: TaskStatement, ordinal: number): Lesson {
  const why =
    t.deepDive?.whyItMatters ??
    t.knowledge[0] ??
    `Master "${t.title}" — a ${d.weight}% slice of Domain ${d.number}.`;
  const checkQ = QUESTIONS.find((q) => q.taskId === t.id);
  return {
    id: t.id,
    domainId: d.id,
    domainNumber: d.number,
    domainTitle: d.title,
    domainSlug: d.slug,
    title: t.title,
    minutes: estimateMinutes(t),
    whyItMatters: why,
    keyIdeas: t.knowledge,
    skills: t.skills,
    pitfalls: t.deepDive?.pitfalls ?? [],
    example: t.deepDive?.example,
    checkQuestionId: checkQ?.id,
    ordinalInDomain: ordinal,
    visuals: t.deepDive?.visuals ?? [],
  };
}

export const LESSONS: Lesson[] = DOMAINS.flatMap((d) =>
  d.tasks.map((t, i) => buildLesson(d, t, i + 1)),
);

export const LESSON_COUNT = LESSONS.length;

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLessonsByDomain(domainId: Domain["id"]): Lesson[] {
  return LESSONS.filter((l) => l.domainId === domainId);
}

export function getNextLesson(id: string): Lesson | undefined {
  const idx = LESSONS.findIndex((l) => l.id === id);
  if (idx < 0 || idx >= LESSONS.length - 1) return undefined;
  return LESSONS[idx + 1];
}

export function getPreviousLesson(id: string): Lesson | undefined {
  const idx = LESSONS.findIndex((l) => l.id === id);
  if (idx <= 0) return undefined;
  return LESSONS[idx - 1];
}

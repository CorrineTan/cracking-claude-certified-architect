/**
 * Comment validation: profanity + exam-relevance.
 *
 * Used both client-side (live feedback in the form) and server-side
 * (authoritative gate before posting to GitHub Discussions). Keep all logic
 * pure and dependency-free so it runs in either environment.
 */

// ─── Profanity list ────────────────────────────────────────────────
// Conservative list. Anything matched here rejects outright. We use word
// boundaries to avoid false positives on substrings (e.g. "assess" must not
// match "ass"). The list intentionally avoids political / identity terms;
// those are handled by tone rules below if needed.
const PROFANITY = [
  // strong vulgarities
  "fuck", "fucking", "fucker", "motherfucker",
  "shit", "bullshit", "shitty",
  "bitch", "bitches",
  "asshole", "ass-hole",
  "bastard",
  "dick", "cock", "cunt", "pussy", "twat",
  "wanker",
  // slurs (left short for review; expand carefully)
  "fag", "faggot", "retard", "retarded",
  "nigger", "nigga",
  "chink", "spic", "kike",
  // sexual / hate-adjacent
  "porn", "rape", "rapist",
] as const;

// Common leetspeak substitutions for evasion detection.
const LEET_MAP: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a",
  "$": "s", "!": "i", "|": "i",
};

function normaliseForProfanity(text: string): string {
  let out = text.toLowerCase();
  // strip diacritics
  out = out.normalize("NFD").replace(/[̀-ͯ]/g, "");
  // collapse runs of the same char (fuuuuck → fuck)
  out = out.replace(/(.)\1{2,}/g, "$1$1");
  // leet substitutions
  out = out
    .split("")
    .map((c) => LEET_MAP[c] ?? c)
    .join("");
  // remove non-letter/space so spaced-out evasion ("f u c k") still hits
  return out.replace(/[^a-z\s]/g, "");
}

export function findProfanity(text: string): string[] {
  const flat = normaliseForProfanity(text);
  const flatNoSpaces = flat.replace(/\s+/g, "");
  const hits: string[] = [];
  for (const word of PROFANITY) {
    // word-boundary match against the spaced-normalised text
    const wordRe = new RegExp(`\\b${word}\\b`, "i");
    if (wordRe.test(flat) || flatNoSpaces.includes(word)) {
      hits.push(word);
    }
  }
  return [...new Set(hits)];
}

// ─── Exam relevance ────────────────────────────────────────────────
// Whitelist of terms that signal the comment is on-topic. The relevance
// check counts how many distinct terms appear; the threshold is intentionally
// LOW (1) because most legitimate comments quote one or two concepts. The
// off-topic guard mostly catches generic spam ("nice site", "click here").
const EXAM_TERMS: readonly string[] = [
  // Anthropic / Claude vocabulary
  "claude", "anthropic", "opus", "sonnet", "haiku",
  // SDK + API surface
  "agent", "agents", "sdk", "api", "tool", "tools", "tool_use", "tool_choice",
  "stop_reason", "stopreason", "subagent", "coordinator",
  "mcp", "model context protocol", "resource", "resources",
  "system prompt", "prompt", "prompts", "few-shot", "fewshot",
  "claude.md", "claudemd",
  "context", "context window", "caching", "cache", "prompt caching",
  "batch", "batch api", "batches",
  // Claude Code surface
  "claude code", "skill", "skills", "hook", "hooks", "slash command",
  "session", "fork_session", "forksession",
  "settings.json", "permissions", "rules",
  // Concepts the exam tests
  "agentic", "agentic loop", "loop", "delegation", "orchestration",
  "context isolation", "context management",
  "structured output", "json", "json schema", "schema",
  "validation", "retry", "guardrail", "guardrails",
  "escalation", "escalate", "threshold",
  "ci", "ci/cd", "cicd", "pipeline",
  "domain", "domain 1", "domain 2", "domain 3", "domain 4", "domain 5",
  "scenario", "task statement", "exam", "question", "answer", "option",
  "distractor", "explanation", "rationale",
  // Cert names
  "cca", "ccaf", "certified architect", "foundations",
  // Common patterns / vocab from the questions themselves
  "extraction", "extract", "isError", "iserror", "errorCategory",
  "casefacts", "lost in the middle", "spaced repetition",
];

const STOP_PHRASES: readonly string[] = [
  "click here", "visit my", "check out my", "buy now", "free trial",
  "discount", "promo code", "make money", "subscribe to my", "follow me on",
  "telegram", "whatsapp me", "dm me", "earn $", "casino", "viagra",
];

export interface RelevanceScore {
  termsHit: number;
  spamHit: boolean;
  matchedTerms: string[];
  matchedSpam: string[];
}

export function scoreRelevance(text: string): RelevanceScore {
  const lower = text.toLowerCase();
  const matchedTerms: string[] = [];
  for (const term of EXAM_TERMS) {
    if (lower.includes(term)) matchedTerms.push(term);
  }
  const matchedSpam: string[] = [];
  for (const phrase of STOP_PHRASES) {
    if (lower.includes(phrase)) matchedSpam.push(phrase);
  }
  return {
    termsHit: matchedTerms.length,
    spamHit: matchedSpam.length > 0,
    matchedTerms,
    matchedSpam,
  };
}

// ─── Top-level validator ───────────────────────────────────────────
export interface ValidationResult {
  ok: boolean;
  reason?: string;
  detail?: string;
}

export const COMMENT_LIMITS = {
  MIN_LEN: 12,
  MAX_LEN: 1500,
  MIN_RELEVANT_TERMS: 1, // require at least one exam-related term
} as const;

export function validateComment(text: string): ValidationResult {
  const trimmed = text.trim();

  if (trimmed.length < COMMENT_LIMITS.MIN_LEN) {
    return {
      ok: false,
      reason: "too-short",
      detail: `Comment must be at least ${COMMENT_LIMITS.MIN_LEN} characters.`,
    };
  }
  if (trimmed.length > COMMENT_LIMITS.MAX_LEN) {
    return {
      ok: false,
      reason: "too-long",
      detail: `Comment must be ${COMMENT_LIMITS.MAX_LEN} characters or fewer.`,
    };
  }

  const profanity = findProfanity(trimmed);
  if (profanity.length > 0) {
    return {
      ok: false,
      reason: "profanity",
      detail: "Please keep the discussion respectful. Profanity is not allowed.",
    };
  }

  const score = scoreRelevance(trimmed);
  if (score.spamHit) {
    return {
      ok: false,
      reason: "spam",
      detail: "Please keep comments on-topic for the exam — no promotional content.",
    };
  }
  if (score.termsHit < COMMENT_LIMITS.MIN_RELEVANT_TERMS) {
    return {
      ok: false,
      reason: "off-topic",
      detail:
        "Comments must be exam-related. Reference a concept, tool, or term from the question (e.g. tool_use, MCP, CLAUDE.md, escalation).",
    };
  }

  return { ok: true };
}

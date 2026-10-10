"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  findProfanity,
  scoreRelevance,
  COMMENT_LIMITS,
} from "@/lib/comment-filter";
import { useAuthEnabled } from "./SessionProvider";

interface Comment {
  id: string;
  body: string;
  authorLogin: string | null;
  authorAvatar: string | null;
  createdAt: string;
  url: string;
}

interface Props {
  questionId: string;
  onCountChange?: (n: number) => void;
}

export function Discussion(props: Props) {
  const authEnabled = useAuthEnabled();

  // Auth disabled at the env level → render an explanatory panel and skip
  // every API call. This is the path that prevents ClientFetchError from
  // poisoning the whole page when AUTH_SECRET / Google creds are unset.
  if (!authEnabled) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm font-semibold text-amber-900">
          Discussion disabled
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-amber-800">
          Set <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">
            AUTH_SECRET
          </code>
          ,{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">
            AUTH_GOOGLE_ID
          </code>
          ,{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">
            AUTH_GOOGLE_SECRET
          </code>{" "}
          and{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">
            NEXT_PUBLIC_AUTH_CONFIGURED=1
          </code>{" "}
          in{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">
            .env.local
          </code>{" "}
          to enable comments. See{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">
            AUTH_SETUP.md
          </code>
          .
        </p>
      </div>
    );
  }

  return <DiscussionInner {...props} />;
}

function DiscussionInner({ questionId, onCountChange }: Props) {
  const { data: session, status } = useSession();
  const isAuthed = !!session?.user;

  const [comments, setComments] = useState<Comment[]>([]);
  const [discussionUrl, setDiscussionUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [body, setBody] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  const live = (() => {
    const trimmed = body.trim();
    if (trimmed.length === 0) return null;
    const profHits = findProfanity(trimmed);
    if (profHits.length > 0)
      return { tone: "error" as const, msg: "Please rephrase — profanity detected." };
    const score = scoreRelevance(trimmed);
    if (score.spamHit)
      return { tone: "error" as const, msg: "Off-topic / promotional content not allowed." };
    if (trimmed.length < COMMENT_LIMITS.MIN_LEN)
      return {
        tone: "muted" as const,
        msg: `${COMMENT_LIMITS.MIN_LEN - trimmed.length} more characters needed.`,
      };
    if (score.termsHit < COMMENT_LIMITS.MIN_RELEVANT_TERMS)
      return {
        tone: "warn" as const,
        msg:
          "Add a concept or term from the question (tool_use, MCP, CLAUDE.md, escalation, etc.) to keep comments on-topic.",
      };
    if (trimmed.length > COMMENT_LIMITS.MAX_LEN)
      return { tone: "error" as const, msg: "Too long." };
    return { tone: "ok" as const, msg: "Looks good." };
  })();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(questionId)}`);
      if (res.status === 401) {
        setComments([]);
        setDiscussionUrl(null);
        return;
      }
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = (await res.json()) as {
        comments: Comment[];
        discussionUrl: string | null;
      };
      setComments(data.comments);
      setDiscussionUrl(data.discussionUrl);
      onCountChange?.(data.comments.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load comments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthed) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, questionId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitOk(false);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(questionId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setSubmitError(data.error ?? `Submit failed (${res.status})`);
      } else {
        setSubmitOk(true);
        setBody("");
        setTimeout(() => void load(), 1200);
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-clay-100" />
        <div className="h-20 animate-pulse rounded bg-clay-100" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="rounded-xl border border-clay-200 bg-clay-50 p-6 text-center">
        <p className="text-sm font-semibold text-clay-900">
          Sign in to view and join the discussion
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-clay-600">
          Discussions are visible to signed-in members only. We use Google
          sign-in — your name and avatar are the only things shown.
        </p>
        <button
          type="button"
          onClick={() => signIn("google")}
          className="mt-4 inline-flex items-center gap-3 rounded-full border border-clay-200 bg-white px-5 py-2.5 text-sm font-semibold text-clay-900 shadow-sm transition hover:bg-clay-100"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.61z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l2.99-2.34z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.45 1.35l2.58-2.59A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l2.99 2.34C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {loading && (
        <p className="text-sm text-clay-500">Loading comments…</p>
      )}
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {!loading && !error && comments.length === 0 && (
        <p className="text-sm italic text-clay-600">
          No comments yet. Be the first — share what tripped you up, or how
          you remembered the right answer.
        </p>
      )}
      {!loading && !error && comments.length > 0 && (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-clay-200 bg-clay-50 p-4"
            >
              <header className="mb-2 flex items-center gap-2 text-xs text-clay-600">
                {c.authorAvatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.authorAvatar}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full"
                  />
                )}
                <span className="font-mono">
                  {c.authorLogin ?? "anonymous"}
                </span>
                <span className="text-clay-400">·</span>
                <time dateTime={c.createdAt}>
                  {new Date(c.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-clay-500 hover:text-ember-700"
                >
                  GitHub →
                </a>
              </header>
              <p className="whitespace-pre-line text-sm leading-relaxed text-clay-800">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={submit}
        className="space-y-3 rounded-xl border border-clay-200 bg-white p-4"
      >
        <div className="flex items-center gap-3 border-b border-clay-100 pb-3">
          {session?.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="h-7 w-7 rounded-full"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-clay-900">
              {session?.user?.name}
            </p>
            <p className="font-mono text-[11px] text-clay-500">
              Posting as you · be respectful, stay on-topic
            </p>
          </div>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={COMMENT_LIMITS.MAX_LEN + 100}
          placeholder="Share your reasoning, or ask why this distractor is so tempting. Reference a concept (tool_use, MCP, CLAUDE.md, etc.)."
          rows={4}
          className="w-full rounded-lg border border-clay-200 bg-white px-3 py-2 text-sm leading-relaxed text-clay-900 transition focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-200"
        />

        <div className="flex items-center justify-between gap-3">
          <p
            className={`text-xs ${
              live?.tone === "ok"
                ? "text-emerald-700"
                : live?.tone === "warn"
                  ? "text-amber-700"
                  : live?.tone === "error"
                    ? "text-rose-700"
                    : "text-clay-500"
            }`}
          >
            {live?.msg ??
              `Min ${COMMENT_LIMITS.MIN_LEN} chars · keep it exam-related · no profanity.`}
          </p>
          <button
            type="submit"
            disabled={submitting || live?.tone === "error"}
            className="rounded-full bg-clay-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-ember-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </div>

        {submitError && (
          <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {submitError}
          </p>
        )}
        {submitOk && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            Posted. Refreshing…
          </p>
        )}
      </form>

      {discussionUrl && (
        <p className="text-xs text-clay-500">
          Full thread on{" "}
          <a
            href={discussionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="prose-link"
          >
            GitHub Discussions
          </a>
          .
        </p>
      )}
    </div>
  );
}

/**
 * GET  /api/comments/[questionId]  → list comments
 * POST /api/comments/[questionId]  → create comment
 *
 * Body for POST:
 *   { body: string, displayName?: string, hp_field?: "" }
 *
 * `hp_field` is a honeypot — bots fill every field; humans don't see it.
 * `displayName` is optional and woven into the comment body so non-GitHub
 * users still get attribution.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listComments, postComment } from "@/lib/github-discussions";
import { validateComment } from "@/lib/comment-filter";
import { rateLimitOk, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED_QUESTION_ID = /^[A-Za-z0-9_\-:]{1,64}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Sign in to view discussion." },
      { status: 401 },
    );
  }
  const { questionId } = await params;
  if (!ALLOWED_QUESTION_ID.test(questionId)) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }
  try {
    const thread = await listComments(questionId);
    if (!thread) {
      return NextResponse.json({ comments: [], discussionUrl: null });
    }
    return NextResponse.json({
      comments: thread.comments.map((c) => ({
        id: c.id,
        body: c.body,
        authorLogin: c.authorLogin,
        authorAvatar: c.authorAvatar,
        createdAt: c.createdAt,
        url: c.url,
      })),
      discussionUrl: thread.url,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 },
    );
  }
}

interface PostBody {
  body?: unknown;
  displayName?: unknown;
  hp_field?: unknown;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Sign in to post a comment." },
      { status: 401 },
    );
  }
  const { questionId } = await params;
  if (!ALLOWED_QUESTION_ID.test(questionId)) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }

  // Rate-limit per signed-in identity, with IP as fallback.
  const limiterKey = session.user.email ?? getClientIp(req.headers);
  const rl = rateLimitOk(limiterKey);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.reason }, { status: 429 });
  }

  let payload: PostBody;
  try {
    payload = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot — bots fill every field, humans never see it.
  if (typeof payload.hp_field === "string" && payload.hp_field.length > 0) {
    // Pretend success to keep bots from probing for the trap.
    return NextResponse.json({ ok: true, url: null });
  }

  const body = typeof payload.body === "string" ? payload.body : "";

  const valid = validateComment(body);
  if (!valid.ok) {
    return NextResponse.json(
      { error: valid.detail ?? "Invalid comment", reason: valid.reason },
      { status: 400 },
    );
  }

  const userName = session.user.name ?? session.user.email ?? "anonymous";
  const userEmail = session.user.email;
  const userImage = session.user.image ?? "";
  const safeName = userName.replace(/[\r\n`<>]/g, "").slice(0, 64);
  const composed = [
    userImage ? `<img src="${userImage}" width="20" height="20" align="absmiddle" /> ` : "",
    `**${safeName}** writes:`,
    "",
    body.trim(),
    "",
    `<sub>— ${userEmail} · via study site</sub>`,
  ].join("\n");

  try {
    const result = await postComment(questionId, composed);
    return NextResponse.json({ ok: true, url: result.url });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not post comment — try again later.",
      },
      { status: 502 },
    );
  }
}


/**
 * GET  /api/progress         → list of lesson_ids the signed-in user has ticked
 * POST /api/progress         → tick a lesson (body: { lessonId })
 * DELETE /api/progress       → un-tick a lesson (body: { lessonId })
 *
 * Auth gate: NextAuth session.user.email is the row key. Without a session
 * we return 401. Without Supabase env we return a structured 503 the client
 * uses to fall back to localStorage.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

const LESSON_ID_RE = /^[A-Za-z0-9._-]{1,32}$/;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured", localOnly: true },
      { status: 503 },
    );
  }
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from("lesson_progress")
      .select("lesson_id, completed_at")
      .eq("user_email", session.user.email)
      .order("completed_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({
      completed: (data ?? []).map((r) => r.lesson_id),
      records: data ?? [],
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 502 },
    );
  }
}

interface TickBody {
  lessonId?: unknown;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured", localOnly: true },
      { status: 503 },
    );
  }
  let body: TickBody;
  try {
    body = (await req.json()) as TickBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : "";
  if (!LESSON_ID_RE.test(lessonId)) {
    return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 });
  }
  try {
    const sb = supabaseServer();
    const { error } = await sb.from("lesson_progress").upsert(
      {
        user_email: session.user.email,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_email,lesson_id" },
    );
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not save" },
      { status: 502 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured", localOnly: true },
      { status: 503 },
    );
  }
  let body: TickBody;
  try {
    body = (await req.json()) as TickBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : "";
  if (!LESSON_ID_RE.test(lessonId)) {
    return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 });
  }
  try {
    const sb = supabaseServer();
    const { error } = await sb
      .from("lesson_progress")
      .delete()
      .eq("user_email", session.user.email)
      .eq("lesson_id", lessonId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not delete" },
      { status: 502 },
    );
  }
}

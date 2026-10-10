"use client";

/**
 * Per-domain skill tree — hex tiles connected by paths. Sits on each
 * /domains/[slug] page. Lessons are nodes; ticked ones light up; the
 * connecting paths fill in as you progress.
 */

import Link from "next/link";
import { useMemo } from "react";
import { Lock, Check } from "lucide-react";
import { LESSONS, type Lesson } from "@/lib/lessons";
import { useProgress } from "@/lib/progress-store";
import type { Domain } from "@/lib/types";

const ACCENT_HEX: Record<string, string> = {
  indigo: "#6366F1",
  emerald: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  sky: "#0EA5E9",
};

interface HexLayout {
  lesson: Lesson;
  cx: number;
  cy: number;
}

/** Honeycomb layout — pointy-top hexagons, snaking row pattern. */
function layoutHexes(lessons: Lesson[], cols: number): HexLayout[] {
  const hexW = 110;
  const hexH = 100;
  const xStep = hexW * 0.86;
  const yStep = hexH * 0.78;
  return lessons.map((l, i) => {
    const row = Math.floor(i / cols);
    const colIdx = i % cols;
    const reverse = row % 2 === 1;
    const col = reverse ? cols - 1 - colIdx : colIdx;
    const cx = 80 + col * xStep + (row % 2 === 1 ? xStep / 2 : 0);
    const cy = 70 + row * yStep;
    return { lesson: l, cx, cy };
  });
}

export function DomainSkillTree({ domain }: { domain: Domain }) {
  const { isCompleted, completed } = useProgress();
  const accent = ACCENT_HEX[domain.accent] ?? ACCENT_HEX.indigo;
  const lessons = LESSONS.filter((l) => l.domainId === domain.id);

  const cols = lessons.length <= 4 ? lessons.length : Math.ceil(lessons.length / 2);
  const layout = useMemo(() => layoutHexes(lessons, cols), [lessons, cols]);
  const rows = Math.ceil(lessons.length / cols);
  const svgHeight = rows * 78 + 60;
  const svgWidth = cols * 95 + 100;

  const done = lessons.filter((l) => completed.has(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-clay-200 bg-gradient-to-br from-clay-50 to-white p-5 sm:p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-clay-500">
            Skill tree · Domain {domain.number}
          </p>
          <p className="mt-1 text-sm font-semibold text-clay-900">
            {done} / {lessons.length} unlocked · {pct}%
          </p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
          style={{ minWidth: svgWidth, maxWidth: "100%" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id={`glow-${domain.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* Connecting paths — light up if both endpoints ticked */}
          {layout.slice(0, -1).map((from, i) => {
            const to = layout[i + 1];
            const bothTicked = isCompleted(from.lesson.id) && isCompleted(to.lesson.id);
            const halfTicked = isCompleted(from.lesson.id) || isCompleted(to.lesson.id);
            return (
              <line
                key={`path-${i}`}
                x1={from.cx}
                y1={from.cy}
                x2={to.cx}
                y2={to.cy}
                stroke={bothTicked ? accent : halfTicked ? accent : "#DDD5C3"}
                strokeWidth={bothTicked ? 3 : 2}
                strokeLinecap="round"
                strokeDasharray={!bothTicked && !halfTicked ? "5 4" : undefined}
                opacity={bothTicked ? 1 : halfTicked ? 0.6 : 0.4}
              />
            );
          })}

          {/* Hex nodes */}
          {layout.map((h, i) => {
            const ticked = isCompleted(h.lesson.id);
            // A node is "unlocked" if it's the first or its predecessor is ticked
            const prev = i > 0 ? layout[i - 1] : null;
            const unlocked = i === 0 || !prev || isCompleted(prev.lesson.id) || ticked;
            return (
              <Link
                key={h.lesson.id}
                href={`/learn/${h.lesson.id}`}
                aria-label={`Lesson ${h.lesson.id}`}
              >
                <g
                  transform={`translate(${h.cx} ${h.cy})`}
                  style={{
                    cursor: "pointer",
                    transformOrigin: "center",
                  }}
                >
                  {/* Glow ring on ticked */}
                  {ticked && (
                    <polygon
                      points={hexPoints(40)}
                      fill={accent}
                      filter={`url(#glow-${domain.id})`}
                      opacity={0.4}
                    />
                  )}
                  {/* Hex shape */}
                  <polygon
                    points={hexPoints(36)}
                    fill={ticked ? accent : "#FFFFFF"}
                    stroke={ticked ? accent : unlocked ? "#A89A7E" : "#DDD5C3"}
                    strokeWidth={ticked ? 3 : 2}
                    style={{
                      animation: ticked ? "hex-pop 0.5s cubic-bezier(.22,1,.36,1)" : "none",
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  />
                  {/* Lesson id */}
                  <text
                    x={0}
                    y={ticked ? -2 : 0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={14}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={700}
                    fill={ticked ? "#FFFFFF" : unlocked ? "#1F1D19" : "#A89A7E"}
                  >
                    {h.lesson.id}
                  </text>
                  {/* Status icon */}
                  {ticked ? (
                    <g transform="translate(0 14)">
                      <circle r={9} fill="#FFFFFF" />
                      <path
                        d="M -4 0 L -1 3 L 4 -3"
                        stroke={accent}
                        strokeWidth={2.4}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  ) : !unlocked ? (
                    <g transform="translate(0 14)">
                      <circle r={9} fill="#FBF8F4" stroke="#DDD5C3" strokeWidth={1.5} />
                      <foreignObject x={-6} y={-6} width={12} height={12}>
                        <Lock className="h-3 w-3 text-clay-400" />
                      </foreignObject>
                    </g>
                  ) : null}
                </g>
              </Link>
            );
          })}
        </svg>
      </div>

      <style>{`
        @keyframes hex-pop {
          0% { transform: scale(0.8); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function hexPoints(r: number): string {
  // Pointy-top hex
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

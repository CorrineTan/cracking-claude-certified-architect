"use client";

/**
 * JungleSidebar — vertical companion to lesson + question pages.
 * Modeled on JungleAI's review-deck layout (split pane: content left,
 * illustrated jungle right). Shows a hand-drawn flower garden whose
 * blooms = lessons ticked + questions answered.
 *
 * Renders nothing on small screens — sidebar is hidden under lg.
 */

import { useEffect, useMemo, useState } from "react";
import { LESSONS } from "@/lib/lessons";
import { DOMAINS } from "@/lib/domains";
import { QUESTIONS } from "@/lib/questions";
import { useProgress } from "@/lib/progress-store";
import { useAnswerStore } from "@/lib/answer-store";
import { subscribeAnswerEvents, type AnswerEvent } from "@/lib/answer-events";
import { MuteToggle } from "./MuteToggle";

const PALETTES: Record<
  string,
  { petal: string; center: string; bud: string }
> = {
  indigo:  { petal: "#A5B4FC", center: "#FBBF24", bud: "#7C8AE0" },
  emerald: { petal: "#86EFAC", center: "#FBBF24", bud: "#4ADE80" },
  amber:   { petal: "#FCD34D", center: "#F97316", bud: "#FBBF24" },
  rose:    { petal: "#F9A8D4", center: "#FBBF24", bud: "#F472B6" },
  sky:     { petal: "#7DD3FC", center: "#FBBF24", bud: "#38BDF8" },
};

const STROKE = "#2D2317";

export function JungleSidebar() {
  const { isCompleted, completed, loaded } = useProgress();
  const { answers } = useAnswerStore();

  // Latest answer event — drives the centerstage flower
  const [latest, setLatest] = useState<AnswerEvent | null>(null);
  useEffect(() => subscribeAnswerEvents(setLatest), []);

  const totalLessons = LESSONS.length;
  const totalQuestions = QUESTIONS.length;
  const lessonsTicked = completed.size;

  // Distinguish answered/correct/wrong so wrong answers don't grow flowers.
  let answered = 0;
  let correct = 0;
  let wrong = 0;
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (!a) continue;
    answered += 1;
    if (a === q.correctAnswer) correct += 1;
    else wrong += 1;
  }
  const total = totalLessons + totalQuestions;
  // Progress only counts ticks + correct answers (not wrong attempts)
  const done = lessonsTicked + correct;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // 30 flower spots — one per lesson — reused as visual anchor
  const spots = useMemo(() => {
    const out: Array<{
      lessonId: string;
      cx: number;
      cy: number;
      stemH: number;
      rotation: number;
      size: number;
      domain: string;
    }> = [];
    DOMAINS.forEach((d, di) => {
      const lessons = LESSONS.filter((l) => l.domainId === d.id);
      lessons.forEach((l, i) => {
        // 5 columns × ~6 rows organic layout
        const col = di;
        const seed =
          (l.id.charCodeAt(0) * 31 +
            (l.id.charCodeAt(2) ?? 0) * 17 +
            i * 11) %
          100;
        const rowRatio = (i + 0.5) / Math.max(lessons.length, 1);
        const x = 50 + col * 60 + ((seed % 18) - 9);
        const y = 470 - rowRatio * 280 - ((seed % 11));
        out.push({
          lessonId: l.id,
          cx: x,
          cy: y,
          stemH: 30 + (seed % 30),
          rotation: ((seed % 9) - 4) * 5,
          size: 14 + (seed % 5),
          domain: d.accent,
        });
      });
    });
    return out;
  }, []);

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[320px] shrink-0 lg:block">
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-clay-900/10 bg-gradient-to-b from-amber-50 via-amber-50/80 to-emerald-50 shadow-md">
        {/* Top progress label + bar */}
        <div className="relative z-10 px-5 pt-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-clay-700">
              your progress
            </p>
            <MuteToggle />
          </div>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-clay-900">
            {loaded ? `${pct}%` : "—"}
          </p>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-emerald-700/30 bg-white">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-clay-700">
            <span className="font-semibold">{lessonsTicked}</span>/{totalLessons} lessons ·{" "}
            <span className="font-semibold">{correct}</span>/{answered} correct
            {wrong > 0 && (
              <span className="text-rose-700"> · {wrong} wilted</span>
            )}
          </p>
        </div>

        {/* Garden SVG fills the rest */}
        <div className="relative flex-1">
          <svg
            viewBox="0 0 400 600"
            preserveAspectRatio="xMidYEnd meet"
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="jsky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF8EE" />
                <stop offset="60%" stopColor="#FAE5D5" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#A8D8B9" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="jground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#67865B" />
                <stop offset="100%" stopColor="#3F6A2D" />
              </linearGradient>
            </defs>

            {/* Sky */}
            <rect x={0} y={0} width={400} height={500} fill="url(#jsky)" />

            {/* Sun */}
            <circle cx={70} cy={80} r={28} fill="#FBBF24" opacity={0.5} />
            <circle
              cx={70}
              cy={80}
              r={20}
              fill="#F59E0B"
              stroke={STROKE}
              strokeWidth={2}
            />

            {/* Mountains */}
            <path
              d="M -20 460 Q 80 380 170 430 T 420 420 L 420 500 L -20 500 Z"
              fill="#86A56B"
              stroke={STROKE}
              strokeWidth={2}
            />
            <path
              d="M -20 480 Q 110 430 220 460 T 420 470 L 420 500 L -20 500 Z"
              fill="#67865B"
              stroke={STROKE}
              strokeWidth={2}
            />

            {/* Cloud */}
            <Cloud cx={280} cy={70} scale={0.55} />

            {/* Ground */}
            <path
              d="M 0 500 Q 100 492 200 502 T 400 500 L 400 600 L 0 600 Z"
              fill="url(#jground)"
              stroke={STROKE}
              strokeWidth={2}
            />

            {/* Background ferns */}
            <Fern x={20} y={510} flip={false} />
            <Fern x={380} y={510} flip={true} />

            {/* Centerstage flower — animates on the latest answer event */}
            {latest && (
              <CenterstageFlower
                key={`${latest.questionId}-${latest.at}`}
                event={latest}
              />
            )}

            {/* Wilted flowers — one per wrong question, scattered foreground */}
            {QUESTIONS.filter((q) => answers[q.id] && answers[q.id] !== q.correctAnswer)
              .slice(0, 30)
              .map((q, i) => {
                const seed =
                  (q.id.charCodeAt(0) * 13 + i * 23 + (q.id.charCodeAt(2) ?? 0) * 7) %
                  1000;
                const x = 20 + (seed % 360);
                const y = 540 + (seed % 50);
                return (
                  <g
                    key={q.id}
                    className="j-wilt"
                    transform={`translate(${x} ${y})`}
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  >
                    <title>{`✗ Wrong answer: ${q.id}`}</title>
                    {/* Drooping stem */}
                    <path
                      d="M 0 0 Q 3 -8 6 -16 Q 9 -22 12 -25"
                      fill="none"
                      stroke="#7a6a4a"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                    {/* Wilted flower head — petals folded down */}
                    <g transform="translate(12 -25) rotate(40)">
                      <ellipse cx={0} cy={3} rx={5} ry={3} fill="#9F8F6F" stroke={STROKE} strokeWidth={1.2} />
                      <ellipse cx={-3} cy={5} rx={3} ry={2} fill="#A89A7E" stroke={STROKE} strokeWidth={1.1} />
                      <ellipse cx={3} cy={5} rx={3} ry={2} fill="#A89A7E" stroke={STROKE} strokeWidth={1.1} />
                    </g>
                  </g>
                );
              })}

            {/* Flowers (30) */}
            {spots.map((s, i) => {
              const ticked = isCompleted(s.lessonId);
              const palette = PALETTES[s.domain] ?? PALETTES.indigo;
              const groundY = 500;
              const stemEndY = s.cy;
              const ctrlX = s.cx + (i % 2 === 0 ? -4 : 4);
              const ctrlY = (groundY + stemEndY) / 2;
              return (
                <g
                  key={s.lessonId}
                  className={ticked ? "j-bloom" : "j-bud"}
                  style={{ transformOrigin: `${s.cx}px ${stemEndY}px` }}
                >
                  <title>{`Lesson ${s.lessonId}${ticked ? " · ✓ done" : ""}`}</title>
                  {/* Stem */}
                  <path
                    d={`M ${s.cx} ${groundY} Q ${ctrlX} ${ctrlY} ${s.cx} ${stemEndY}`}
                    fill="none"
                    stroke="#3F6A2D"
                    strokeWidth={ticked ? 2.4 : 2}
                    strokeLinecap="round"
                  />
                  {ticked ? (
                    <g
                      transform={`translate(${s.cx} ${stemEndY}) rotate(${s.rotation})`}
                    >
                      {[0, 1, 2, 3, 4, 5].map((p) => (
                        <ellipse
                          key={p}
                          cx={0}
                          cy={-s.size * 0.5}
                          rx={s.size * 0.35}
                          ry={s.size * 0.5}
                          fill={palette.petal}
                          stroke={STROKE}
                          strokeWidth={1.5}
                          transform={`rotate(${p * 60})`}
                        />
                      ))}
                      <circle
                        r={s.size * 0.32}
                        fill={palette.center}
                        stroke={STROKE}
                        strokeWidth={1.5}
                      />
                    </g>
                  ) : (
                    <g
                      transform={`translate(${s.cx} ${stemEndY}) rotate(${s.rotation})`}
                    >
                      <ellipse
                        cx={0}
                        cy={-2}
                        rx={4}
                        ry={6}
                        fill={palette.bud}
                        stroke={STROKE}
                        strokeWidth={1.4}
                      />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Drift petals — only when there's progress */}
            {pct > 0 &&
              Array.from({ length: Math.min(Math.ceil(pct / 5), 12) }).map(
                (_, i) => {
                  const cx = 30 + ((i * 53) % 360);
                  const cy = 100 + ((i * 17) % 280);
                  const colors = [
                    "#F9A8D4",
                    "#FCD34D",
                    "#A5B4FC",
                    "#86EFAC",
                    "#FDBA74",
                  ];
                  return (
                    <g
                      key={i}
                      className={`j-drift j-drift-${i % 4}`}
                      transform={`translate(${cx} ${cy})`}
                    >
                      <ellipse
                        rx={3.2}
                        ry={2}
                        fill={colors[i % colors.length]}
                        stroke={STROKE}
                        strokeWidth={1}
                      />
                    </g>
                  );
                },
              )}
          </svg>
        </div>

        {/* Bottom completion message */}
        {pct === 100 && (
          <div className="relative z-10 px-5 pb-5 text-center">
            <p className="text-sm font-bold text-emerald-700">
              🌸 The whole garden is in bloom
            </p>
          </div>
        )}

        <style jsx>{`
          /* Bloom — richer multi-stage opening: starts as bud, pops, then settles + sways */
          :global(.j-bloom) {
            animation: j-bloom 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards,
              j-sway 5s ease-in-out infinite 1.4s;
          }
          :global(.j-bud) {
            animation: j-bud-sway 6s ease-in-out infinite;
          }
          :global(.j-wilt) {
            animation: j-wilt 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          @keyframes j-bloom {
            /* Stage 1: pop out as small dot */
            0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
            15%  { transform: scale(0.4) rotate(-15deg); opacity: 1; }
            /* Stage 2: bud forms */
            35%  { transform: scale(0.7) rotate(-5deg); }
            /* Stage 3: petals burst open (overshoot) */
            65%  { transform: scale(1.35) rotate(5deg); }
            /* Stage 4: settle */
            85%  { transform: scale(0.95) rotate(-2deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes j-sway {
            0%, 100% { transform: rotate(0deg); }
            50%      { transform: rotate(2deg); }
          }
          @keyframes j-bud-sway {
            0%, 100% { transform: rotate(0deg); }
            50%      { transform: rotate(-2deg); }
          }
          @keyframes j-wilt {
            0%   { transform: scale(0.6) rotate(-30deg); opacity: 0; }
            50%  { transform: scale(1.1) rotate(5deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          }
          :global(.j-drift) {
            animation: j-drift-anim 8s ease-in-out infinite;
          }
          :global(.j-drift-1) { animation-duration: 9s; animation-delay: 0.3s; }
          :global(.j-drift-2) { animation-duration: 7s; animation-delay: 0.8s; }
          :global(.j-drift-3) { animation-duration: 10s; animation-delay: 1.4s; }
          @keyframes j-drift-anim {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50%      { transform: translate(10px, -8px) rotate(15deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            :global(.j-bloom),
            :global(.j-bud),
            :global(.j-wilt),
            :global(.j-drift) {
              animation: none !important;
            }
          }
        `}</style>
      </div>
    </aside>
  );
}

function CenterstageFlower({ event }: { event: AnswerEvent }) {
  // Position: center horizontally, just above the mountains
  const cx = 200;
  const cy = 220;
  const stemTopY = cy + 35;
  const stemBottomY = 480; // hidden under ground line for depth
  const palette = event.correct
    ? { petal: "#FCD34D", center: "#F97316", stem: "#3F6A2D" }
    : { petal: "#9F8F6F", center: "#5C4A2E", stem: "#7a6a4a" };

  if (event.correct) {
    return (
      <g className="cs-flower cs-bloom">
        <title>Just bloomed — correct!</title>
        {/* Stem grows from ground to flower */}
        <path
          className="cs-stem"
          d={`M ${cx} ${stemBottomY} Q ${cx + 6} ${(stemBottomY + stemTopY) / 2} ${cx} ${stemTopY}`}
          fill="none"
          stroke={palette.stem}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* Leaf along stem */}
        <g
          className="cs-leaf"
          transform={`translate(${cx + 8} ${(stemBottomY + stemTopY) / 2}) rotate(45)`}
        >
          <path
            d="M 0 0 Q 10 -8 22 -2 Q 24 6 12 10 Q 2 8 0 0 Z"
            fill={palette.stem}
            stroke={STROKE}
            strokeWidth={1.6}
          />
        </g>
        {/* Flower head — 6 petals open */}
        <g className="cs-head" transform={`translate(${cx} ${cy})`}>
          {[0, 1, 2, 3, 4, 5].map((p) => (
            <ellipse
              key={p}
              cx={0}
              cy={-22}
              rx={14}
              ry={22}
              fill={palette.petal}
              stroke={STROKE}
              strokeWidth={2}
              transform={`rotate(${p * 60})`}
            />
          ))}
          <circle r={14} fill={palette.center} stroke={STROKE} strokeWidth={2} />
          <circle r={7} fill="#92400E" opacity={0.45} />
        </g>
        {/* Sparkles */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2;
          const r = 60;
          return (
            <g
              key={i}
              className={`cs-sparkle cs-sparkle-${i}`}
              transform={`translate(${cx + Math.cos(angle) * r} ${cy + Math.sin(angle) * r})`}
            >
              <path
                d="M 0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z"
                fill="#FBBF24"
                stroke={STROKE}
                strokeWidth={1}
              />
            </g>
          );
        })}
        <style jsx>{`
          :global(.cs-flower) {
            pointer-events: none;
          }
          :global(.cs-stem) {
            stroke-dasharray: 300;
            stroke-dashoffset: 300;
            animation: cs-stem-grow 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          :global(.cs-leaf) {
            transform-origin: ${cx + 8}px ${(stemBottomY + stemTopY) / 2}px;
            animation: cs-leaf-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards;
          }
          :global(.cs-head) {
            transform-origin: ${cx}px ${cy}px;
            animation: cs-head-bloom 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s backwards;
          }
          :global(.cs-sparkle) {
            opacity: 0;
            animation: cs-spark 1.4s ease-out 0.9s both;
          }
          :global(.cs-sparkle-0) { animation-delay: 0.85s; }
          :global(.cs-sparkle-1) { animation-delay: 0.95s; }
          :global(.cs-sparkle-2) { animation-delay: 1.05s; }
          :global(.cs-sparkle-3) { animation-delay: 1.15s; }
          :global(.cs-sparkle-4) { animation-delay: 1.25s; }
          @keyframes cs-stem-grow {
            from { stroke-dashoffset: 300; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes cs-leaf-pop {
            0%   { transform: translate(${cx + 8}px ${(stemBottomY + stemTopY) / 2}px) rotate(45deg) scale(0); }
            100% { transform: translate(${cx + 8}px ${(stemBottomY + stemTopY) / 2}px) rotate(45deg) scale(1); }
          }
          @keyframes cs-head-bloom {
            0%   { transform: scale(0); }
            30%  { transform: scale(0.4); }
            65%  { transform: scale(1.4); }
            100% { transform: scale(1); }
          }
          @keyframes cs-spark {
            0%   { opacity: 0; transform: scale(0) translate(0, 0); }
            40%  { opacity: 1; transform: scale(1.3) translate(0, 0); }
            100% { opacity: 0; transform: scale(0.6) translate(0, -20px); }
          }
          @media (prefers-reduced-motion: reduce) {
            :global(.cs-stem),
            :global(.cs-leaf),
            :global(.cs-head),
            :global(.cs-sparkle) {
              animation: none !important;
              stroke-dashoffset: 0 !important;
              opacity: 1 !important;
            }
          }
        `}</style>
      </g>
    );
  }

  // Wrong — wilt: stem grows then collapses
  return (
    <g className="cs-flower cs-wilt-wrap">
      <title>Just wilted — wrong answer</title>
      <g className="cs-wilt-tilt" style={{ transformOrigin: `${cx}px ${stemBottomY}px` }}>
        <path
          d={`M ${cx} ${stemBottomY} Q ${cx + 12} ${(stemBottomY + cy) / 2 + 30} ${cx + 22} ${cy + 35}`}
          fill="none"
          stroke={palette.stem}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <g transform={`translate(${cx + 22} ${cy + 35}) rotate(85)`}>
          {/* Drooping bud */}
          <ellipse cx={0} cy={2} rx={8} ry={10} fill={palette.petal} stroke={STROKE} strokeWidth={2} />
          <ellipse cx={-5} cy={6} rx={5} ry={3} fill="#A89A7E" stroke={STROKE} strokeWidth={1.5} />
          <ellipse cx={5} cy={6} rx={5} ry={3} fill="#A89A7E" stroke={STROKE} strokeWidth={1.5} />
          <circle r={4} fill={palette.center} />
        </g>
      </g>
      {/* Falling petals */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={i}
          className={`cs-fall cs-fall-${i}`}
          cx={cx + 22}
          cy={cy + 35}
          rx={4}
          ry={2.5}
          fill={i === 0 ? "#9F8F6F" : i === 1 ? "#A89A7E" : i === 2 ? "#7a6a4a" : "#92856a"}
          stroke={STROKE}
          strokeWidth={1}
        />
      ))}
      <style jsx>{`
        :global(.cs-flower) {
          pointer-events: none;
        }
        :global(.cs-wilt-tilt) {
          animation: cs-wilt-tilt 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        :global(.cs-fall) {
          opacity: 0;
          animation: cs-fall-anim 1.6s ease-in 0.4s both;
        }
        :global(.cs-fall-0) { animation-delay: 0.4s; }
        :global(.cs-fall-1) { animation-delay: 0.6s; }
        :global(.cs-fall-2) { animation-delay: 0.8s; }
        :global(.cs-fall-3) { animation-delay: 1.0s; }
        @keyframes cs-wilt-tilt {
          0%   { transform: rotate(-25deg) translateY(-6px); opacity: 0; }
          30%  { transform: rotate(0deg) translateY(0); opacity: 1; }
          70%  { transform: rotate(15deg) translateY(2px); opacity: 1; }
          100% { transform: rotate(35deg) translateY(8px); opacity: 0.85; }
        }
        @keyframes cs-fall-anim {
          0%   { opacity: 0; transform: translate(0, 0) rotate(0deg); }
          25%  { opacity: 1; transform: translate(0, 6px) rotate(20deg); }
          100% { opacity: 0; transform: translate(${Math.random() * 30 - 15}px, 70px) rotate(180deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.cs-wilt-tilt),
          :global(.cs-fall) {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </g>
  );
}

function Cloud({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <ellipse cx={0} cy={0} rx={28} ry={14} fill="#FFFFFF" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={-22} cy={4} rx={18} ry={11} fill="#FFFFFF" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={22} cy={4} rx={18} ry={11} fill="#FFFFFF" stroke={STROKE} strokeWidth={2} />
    </g>
  );
}

function Fern({ x, y, flip }: { x: number; y: number; flip: boolean }) {
  const sx = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} 1)`}>
      <path
        d="M 0 0 Q -8 -40 0 -80 Q 4 -100 -8 -120"
        fill="none"
        stroke="#3F6A2D"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {[18, 40, 65, 90, 110].map((d, i) => {
        const px = -6 + (i % 2 === 0 ? -8 : 8);
        const py = -d;
        const rot = i % 2 === 0 ? -65 : 65;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${rot})`}>
            <path
              d="M 0 0 Q 8 -8 18 -2 Q 20 4 10 8 Q 2 6 0 0 Z"
              fill="#67865B"
              stroke={STROKE}
              strokeWidth={1.4}
            />
          </g>
        );
      })}
    </g>
  );
}

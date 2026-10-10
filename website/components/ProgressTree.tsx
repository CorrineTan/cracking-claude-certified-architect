"use client";

/**
 * ProgressGarden — replaces the technical "tree" with a hand-drawn flower
 * field. Each lesson is a stem with a bud at its tip. Ticking the lesson
 * makes the bud bloom into a 6-petal flower with a yellow center.
 *
 * Aesthetic notes (loosely inspired by JungleAI's cartoon-jungle style,
 * not copied):
 *   - chunky black-ish stroke outlines (currentColor #2D2317)
 *   - flat fills with a single highlight stroke
 *   - a few wandering vines and ground plants for atmosphere
 *   - 5 colors keyed to the 5 domains
 */

import { useMemo } from "react";
import { LESSONS } from "@/lib/lessons";
import { DOMAINS } from "@/lib/domains";
import { useProgress } from "@/lib/progress-store";

// Five flower palettes — one per domain. Soft cartoon colors, hand-drawn vibe.
const PALETTES: Record<string, { petal: string; center: string; stem: string; bud: string }> = {
  indigo:  { petal: "#A5B4FC", center: "#FBBF24", stem: "#3F6A2D", bud: "#7C8AE0" },
  emerald: { petal: "#86EFAC", center: "#FBBF24", stem: "#3F6A2D", bud: "#4ADE80" },
  amber:   { petal: "#FCD34D", center: "#F97316", stem: "#3F6A2D", bud: "#FBBF24" },
  rose:    { petal: "#F9A8D4", center: "#FBBF24", stem: "#3F6A2D", bud: "#F472B6" },
  sky:     { petal: "#7DD3FC", center: "#FBBF24", stem: "#3F6A2D", bud: "#38BDF8" },
};

// Hand-drawn stroke — slightly off-black, used everywhere for outline
const STROKE = "#2D2317";

const W = 800;
const H = 480;

interface FlowerSpot {
  lessonId: string;
  domain: string;
  /** anchor on the ground line */
  x: number;
  /** stem length */
  stemH: number;
  /** flower head x offset from anchor (slight sway) */
  headOffsetX: number;
  /** rotation of the flower head (degrees) */
  rotation: number;
  /** size of the flower */
  size: number;
}

export function ProgressTree() {
  const { isCompleted, completed, loaded } = useProgress();

  const spots = useMemo<FlowerSpot[]>(() => {
    const all: FlowerSpot[] = [];
    // Group lessons by domain so each domain gets its own "patch" of flowers
    DOMAINS.forEach((d, di) => {
      const lessonsInDomain = LESSONS.filter((l) => l.domainId === d.id);
      const patchWidth = (W - 100) / DOMAINS.length;
      const patchStart = 50 + di * patchWidth;
      lessonsInDomain.forEach((l, i) => {
        const ratio = (i + 0.5) / lessonsInDomain.length;
        const x = patchStart + ratio * patchWidth;
        // Deterministic pseudo-random sway based on hash
        const seed =
          (l.id.charCodeAt(0) * 31 +
            (l.id.charCodeAt(2) ?? 0) * 17 +
            i * 11) %
          100;
        const stemH = 110 + (seed % 60);
        const headOffsetX = ((seed % 13) - 6) * 1.5;
        const rotation = ((seed % 11) - 5) * 3;
        const size = 22 + (seed % 8);
        all.push({
          lessonId: l.id,
          domain: d.accent,
          x,
          stemH,
          headOffsetX,
          rotation,
          size,
        });
      });
    });
    return all;
  }, []);

  const total = LESSONS.length;
  const done = completed.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const groundY = H - 60;

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Garden of progress — ${done} of ${total} flowers bloomed`}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF8EE" />
            <stop offset="60%" stopColor="#FAE5D5" />
            <stop offset="100%" stopColor="#FCD9A8" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67865B" />
            <stop offset="100%" stopColor="#3F6A2D" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect x={0} y={0} width={W} height={groundY} fill="url(#sky)" />

        {/* Soft sun in the sky */}
        <circle cx={W - 110} cy={90} r={42} fill="#FBBF24" opacity={0.55} />
        <circle cx={W - 110} cy={90} r={32} fill="#F59E0B" opacity={0.7} stroke={STROKE} strokeWidth={2.5} />

        {/* Ground */}
        <path
          d={`M 0 ${groundY} Q ${W / 4} ${groundY - 8} ${W / 2} ${groundY + 2} T ${W} ${groundY} L ${W} ${H} L 0 ${H} Z`}
          fill="url(#ground)"
          stroke={STROKE}
          strokeWidth={2.5}
        />

        {/* Background hills */}
        <path
          d={`M -20 ${groundY - 30} Q 200 ${groundY - 100} 420 ${groundY - 40} T ${W + 20} ${groundY - 20}`}
          fill="#86A56B"
          stroke={STROKE}
          strokeWidth={2}
          opacity={0.85}
        />

        {/* Far cloud */}
        <Cloud cx={150} cy={70} scale={0.7} />
        <Cloud cx={420} cy={50} scale={0.5} />

        {/* Background fern silhouettes (decorative) */}
        <Fern x={30} y={groundY} flip={false} />
        <Fern x={W - 60} y={groundY} flip={true} />

        {/* Domain "patch" labels */}
        {DOMAINS.map((d, di) => {
          const patchWidth = (W - 100) / DOMAINS.length;
          const patchStart = 50 + di * patchWidth;
          const lessonsInDomain = LESSONS.filter((l) => l.domainId === d.id);
          const doneInDomain = lessonsInDomain.filter((l) => isCompleted(l.id)).length;
          const palette = PALETTES[d.accent] ?? PALETTES.indigo;
          return (
            <g key={d.id}>
              {/* Wooden sign */}
              <g transform={`translate(${patchStart + patchWidth / 2} ${groundY - 6})`}>
                <line x1={0} y1={0} x2={0} y2={26} stroke={STROKE} strokeWidth={3} strokeLinecap="round" />
                <g transform={`translate(0 -10)`}>
                  <rect
                    x={-30}
                    y={-12}
                    width={60}
                    height={22}
                    rx={3}
                    fill={palette.petal}
                    stroke={STROKE}
                    strokeWidth={2}
                  />
                  <text
                    x={0}
                    y={1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    fontSize={11}
                    fontWeight={800}
                    fill={STROKE}
                  >
                    D{d.number}
                  </text>
                  <text
                    x={0}
                    y={28}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize={10}
                    fontWeight={700}
                    fill={STROKE}
                    opacity={0.85}
                  >
                    {loaded ? `${doneInDomain}/${lessonsInDomain.length}` : `${lessonsInDomain.length}`}
                  </text>
                </g>
              </g>
            </g>
          );
        })}

        {/* Flowers — bloom on tick */}
        {spots.map((s, i) => {
          const ticked = isCompleted(s.lessonId);
          const palette = PALETTES[s.domain] ?? PALETTES.indigo;
          const tipX = s.x + s.headOffsetX;
          const tipY = groundY - s.stemH;
          // Curvy stem with one bend
          const ctrlX = s.x + s.headOffsetX * 0.4;
          const ctrlY = groundY - s.stemH / 2 + 8;
          return (
            <g
              key={s.lessonId}
              className={ticked ? "garden-bloomed" : "garden-bud"}
              style={{ transformOrigin: `${tipX}px ${tipY}px` }}
            >
              <title>{`Lesson ${s.lessonId}${ticked ? " · ✓ bloomed" : ""}`}</title>

              {/* Stem */}
              <path
                d={`M ${s.x} ${groundY} Q ${ctrlX} ${ctrlY} ${tipX} ${tipY}`}
                fill="none"
                stroke={palette.stem}
                strokeWidth={ticked ? 3.5 : 2.8}
                strokeLinecap="round"
              />
              {/* One leaf along the stem */}
              <Leaf
                x={ctrlX + (i % 2 === 0 ? -8 : 8)}
                y={ctrlY}
                rotation={i % 2 === 0 ? -55 : 55}
                fill={palette.stem}
              />

              {ticked ? (
                /* Open flower — 6 petals around a center */
                <g transform={`translate(${tipX} ${tipY}) rotate(${s.rotation})`}>
                  {[0, 1, 2, 3, 4, 5].map((p) => (
                    <ellipse
                      key={p}
                      cx={0}
                      cy={-s.size * 0.55}
                      rx={s.size * 0.4}
                      ry={s.size * 0.55}
                      fill={palette.petal}
                      stroke={STROKE}
                      strokeWidth={2}
                      transform={`rotate(${p * 60})`}
                    />
                  ))}
                  <circle r={s.size * 0.35} fill={palette.center} stroke={STROKE} strokeWidth={2} />
                  <circle r={s.size * 0.18} fill="#92400E" opacity={0.4} />
                </g>
              ) : (
                /* Closed bud */
                <g transform={`translate(${tipX} ${tipY}) rotate(${s.rotation})`}>
                  {/* sepals */}
                  <path
                    d={`M -7 8 Q -10 -2 0 -8 Q 10 -2 7 8 Z`}
                    fill={palette.stem}
                    stroke={STROKE}
                    strokeWidth={2}
                  />
                  {/* bud peeking out */}
                  <ellipse
                    cx={0}
                    cy={-3}
                    rx={6}
                    ry={9}
                    fill={palette.bud}
                    stroke={STROKE}
                    strokeWidth={2}
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Floating petals once you have progress */}
        {done > 0 &&
          Array.from({ length: Math.min(done * 2, 14) }).map((_, i) => {
            const cx = 80 + i * 55 + ((i * 31) % 30);
            const cy = 50 + ((i * 17) % 80);
            const colors = ["#F9A8D4", "#FCD34D", "#A5B4FC", "#86EFAC", "#FDBA74"];
            const c = colors[i % colors.length];
            return (
              <g
                key={i}
                className={`drift drift-${i % 4}`}
                transform={`translate(${cx} ${cy})`}
              >
                <ellipse rx={4} ry={2.5} fill={c} stroke={STROKE} strokeWidth={1.2} />
              </g>
            );
          })}
      </svg>

      {/* Centered overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-3 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-clay-700">
          Your garden
        </p>
        <p className="mt-1 text-xl font-semibold tabular-nums text-clay-900 sm:text-2xl">
          <span className="text-ember-700">{loaded ? done : "—"}</span>
          <span className="text-clay-500"> / {total} </span>
          <span className="text-sm font-normal text-clay-700">in bloom</span>
        </p>
        {done > 0 && done < total && loaded && (
          <p className="text-xs text-clay-700">{pct}% there · keep planting</p>
        )}
        {done === total && total > 0 && (
          <p className="text-xs font-semibold text-emerald-700">🌸 The whole garden is in bloom</p>
        )}
      </div>

      <style jsx>{`
        :global(.garden-bloomed) {
          animation: bloom 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards,
            sway 5s ease-in-out infinite 0.7s;
        }
        :global(.garden-bud) {
          animation: bud-sway 6s ease-in-out infinite;
        }
        @keyframes bloom {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50%      { transform: rotate(2deg); }
        }
        @keyframes bud-sway {
          0%, 100% { transform: rotate(0deg); }
          50%      { transform: rotate(-2deg); }
        }
        :global(.drift) {
          animation: drift-anim 8s ease-in-out infinite;
        }
        :global(.drift-1) { animation-duration: 9s; animation-delay: 0.5s; }
        :global(.drift-2) { animation-duration: 7s; animation-delay: 1s; }
        :global(.drift-3) { animation-duration: 10s; animation-delay: 1.5s; }
        @keyframes drift-anim {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50%      { transform: translate(15px, -12px) rotate(20deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.garden-bloomed),
          :global(.garden-bud),
          :global(.drift) {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* Decorative atoms */

function Leaf({ x, y, rotation, fill }: { x: number; y: number; rotation: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <path
        d="M 0 0 Q 6 -8 12 -2 Q 14 4 8 8 Q 2 6 0 0 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth={1.6}
      />
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
      {/* main stem curving up */}
      <path
        d="M 0 0 Q -10 -50 0 -100 Q 5 -130 -10 -150"
        fill="none"
        stroke="#3F6A2D"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* leaflets along the stem */}
      {[20, 50, 80, 110, 135].map((d, i) => {
        const px = -8 + (i % 2 === 0 ? -10 : 10);
        const py = -d;
        const rot = i % 2 === 0 ? -65 : 65;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${rot})`}>
            <path
              d="M 0 0 Q 10 -10 22 -2 Q 24 6 12 10 Q 2 8 0 0 Z"
              fill="#67865B"
              stroke={STROKE}
              strokeWidth={1.6}
            />
          </g>
        );
      })}
    </g>
  );
}

"use client";

/**
 * Animated hero diagram — six looping exam-domain scenes.
 *
 * Stack:
 *   - GSAP + @gsap/react for the per-scene timelines (entrances, edge draws,
 *     pulsing halos, traveling tokens). useGSAP gives automatic cleanup when
 *     the scene unmounts.
 *   - Framer Motion's AnimatePresence drives the cross-fade + scale + blur
 *     between scenes. mode="wait" guarantees the outgoing scene's GSAP
 *     timeline is killed before the next one mounts.
 *   - One master "scene" component per domain. Each builds its own scoped
 *     timeline against `containerRef` so selectors don't leak across scenes.
 */

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const SCENES = [
  "agent-loop",
  "mcp",
  "claude-md",
  "ci-cd",
  "structured",
  "context",
] as const;

type SceneKey = (typeof SCENES)[number];

const SCENE_META: Record<SceneKey, { kicker: string; title: string; sub: string }> = {
  "agent-loop": {
    kicker: "Domain 1",
    title: "The agentic loop",
    sub: "stop_reason · tool_use · feedback",
  },
  mcp: {
    kicker: "Domain 2",
    title: "MCP routing",
    sub: "client · server · tools & resources",
  },
  "claude-md": {
    kicker: "Domain 3",
    title: "CLAUDE.md hierarchy",
    sub: "managed → project → user → local",
  },
  "ci-cd": {
    kicker: "Domain 3",
    title: "Claude Code in CI/CD",
    sub: "claude code -p · JSON output · review",
  },
  structured: {
    kicker: "Domain 4",
    title: "Structured output",
    sub: "JSON schema · validate · retry · batch",
  },
  context: {
    kicker: "Domain 5",
    title: "Context management",
    sub: "lost in the middle · prompt caching",
  },
};

const SCENE_DURATION = 7000;

export function AnimatedHeroDiagram() {
  const [active, setActive] = useState<SceneKey>(SCENES[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => SCENES[(SCENES.indexOf(prev) + 1) % SCENES.length]);
    }, SCENE_DURATION);
    return () => clearInterval(id);
  }, []);

  // Mouse parallax — gentle 1.5° tilt that follows cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [2, -2]), { stiffness: 80, damping: 18 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-2, 2]), { stiffness: 80, damping: 18 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  const meta = SCENE_META[active];

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-clay-500">
          <span className="rounded-full border border-ember-200 bg-ember-50 px-2 py-0.5 text-ember-700">
            {meta.kicker}
          </span>{" "}
          · <AnimatedTitle text={meta.title} />
        </p>
        <p className="hidden font-mono text-[10px] text-clay-400 sm:block">
          {meta.sub}
        </p>
      </div>

      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: "preserve-3d",
          perspective: 1200,
        }}
        className="relative w-full overflow-hidden rounded-2xl border border-clay-200 bg-gradient-to-br from-clay-50 via-white to-ember-50/30 shadow-sm"
      >
        {/* Decorative aurora blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-ember-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-ember-200/20 blur-3xl" />
        {/* Faint dot grid */}
        <DotGrid />

        <div
          className="relative w-full"
          style={{ aspectRatio: "16 / 7", minHeight: 240 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {active === "agent-loop" && <AgentLoopScene />}
              {active === "mcp" && <MCPScene />}
              {active === "claude-md" && <ClaudeMdScene />}
              {active === "ci-cd" && <CiCdScene />}
              {active === "structured" && <StructuredOutputScene />}
              {active === "context" && <ContextScene />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Scene rail */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {SCENES.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActive(k)}
            className={`group relative h-1.5 overflow-hidden rounded-full transition-all ${
              active === k ? "w-10 bg-clay-200" : "w-2 bg-clay-300 hover:bg-clay-500"
            }`}
            aria-label={SCENE_META[k].title}
          >
            {active === k && (
              <motion.span
                className="absolute inset-y-0 left-0 bg-ember-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SCENE_DURATION / 1000, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function AnimatedTitle({ text }: { text: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={text}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35 }}
        className="inline-block text-clay-700"
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}

function DotGrid() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#A89A7E" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────── *
 * Layout helpers
 * ────────────────────────────────────────────────────────────── */

function widthFor(text: string, fontSize: number): number {
  return text.length * fontSize * 0.62;
}

function nodeRectWidth(text: string, fontSize: number, paddingX = 18, min = 80): number {
  return Math.max(min, Math.ceil(widthFor(text, fontSize) + paddingX * 2));
}

/* ────────────────────────────────────────────────────────────── *
 * Shared SVG primitives (declarative — GSAP animates them via class)
 * ────────────────────────────────────────────────────────────── */

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={`arr-${id}`}
        markerWidth="11"
        markerHeight="9"
        refX="10"
        refY="4.5"
        orient="auto"
      >
        <polygon points="0 0, 10 4.5, 0 9" fill="#D97757" />
      </marker>
      <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id={`edgeGrad-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#D97757" stopOpacity="0" />
        <stop offset="50%" stopColor="#D97757" stopOpacity="1" />
        <stop offset="100%" stopColor="#D97757" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`pulseGrad-${id}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#D97757" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#D97757" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

interface PillProps {
  cx: number;
  cy: number;
  text: string;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  textColor?: string;
  glow?: string;
  height?: number;
  paddingX?: number;
  minWidth?: number;
}

function Pill({
  cx,
  cy,
  text,
  fontSize = 11,
  fill = "#FFFFFF",
  stroke = "#DDD5C3",
  textColor = "#33302A",
  glow,
  height = 40,
  paddingX = 16,
  minWidth = 70,
}: PillProps) {
  const w = nodeRectWidth(text, fontSize, paddingX, minWidth);
  return (
    <g className="hero-node" data-cx={cx} data-cy={cy}>
      <rect
        x={cx - w / 2}
        y={cy - height / 2}
        width={w}
        height={height}
        rx={height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.6}
        filter={glow}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontWeight={600}
        fill={textColor}
      >
        {text}
      </text>
    </g>
  );
}

function Edge({
  d,
  id,
  arrow = true,
  label,
  labelX,
  labelY,
}: {
  d: string;
  id: string;
  arrow?: boolean;
  label?: string;
  labelX?: number;
  labelY?: number;
}) {
  return (
    <g>
      <path d={d} fill="none" stroke="#DDD5C3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path
        className="hero-edge"
        d={d}
        fill="none"
        stroke={`url(#edgeGrad-${id})`}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={400}
        strokeDashoffset={400}
        markerEnd={arrow ? `url(#arr-${id})` : undefined}
      />
      {label && labelX !== undefined && labelY !== undefined && (
        <g className="hero-label">
          <rect
            x={labelX - widthFor(label, 10) / 2 - 6}
            y={labelY - 9}
            width={widthFor(label, 10) + 12}
            height={16}
            rx={8}
            fill="#FBF8F4"
            opacity={0.95}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            fill="#7A6F5A"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

/* ────────────────────────────────────────────────────────────── *
 * useSceneTimeline — shared GSAP entrance + loop for every scene.
 * Stagger-pops every .hero-node, draws every .hero-edge, then runs
 * a continuous "shimmer" pass on edges so the diagram always feels
 * alive even after the entrance completes.
 * ────────────────────────────────────────────────────────────── */

function useSceneTimeline(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  useGSAP(
    () => {
      // Entrance — nodes pop with elastic ease, edges draw in sequence
      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      intro.from(".hero-node", {
        scale: 0.5,
        opacity: 0,
        filter: "blur(6px)",
        transformOrigin: "center",
        duration: 0.55,
        ease: "back.out(1.6)",
        stagger: { each: 0.06, from: "start" },
      }, 0);

      intro.fromTo(
        ".hero-edge",
        { strokeDashoffset: 400 },
        {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: "power2.inOut",
          stagger: { each: 0.08, from: "start" },
        },
        0.25,
      );

      intro.from(".hero-label", {
        opacity: 0,
        y: 4,
        duration: 0.4,
        stagger: 0.05,
      }, 0.6);

      // Continuous shimmer — never stops; tween dashoffset back & forth
      gsap.to(".hero-edge", {
        strokeDashoffset: -400,
        duration: 4,
        ease: "none",
        repeat: -1,
        delay: 1.2,
      });

      // Halo pulses (any element with .hero-pulse)
      gsap.to(".hero-pulse", {
        scale: 1.18,
        opacity: 0.04,
        duration: 1.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "center",
      });

      // Floating particles
      gsap.utils.toArray<SVGCircleElement>(".hero-particle").forEach((p, i) => {
        gsap.to(p, {
          y: "+=8",
          x: "+=4",
          duration: 2 + (i % 5) * 0.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: (i % 7) * 0.2,
        });
      });
    },
    { scope: containerRef },
  );
}

/* Particles — small dots scattered across the scene viewport */
function Particles({ count = 12 }: { count?: number }) {
  const seeds = Array.from({ length: count }, (_, i) => i);
  return (
    <g>
      {seeds.map((i) => {
        const x = (i * 53.7 + 30) % 820;
        const y = (i * 31.1 + 20) % 290;
        const r = 1 + (i % 3) * 0.5;
        const op = 0.35 + (i % 4) * 0.12;
        return (
          <circle
            key={i}
            className="hero-particle"
            cx={x}
            cy={y}
            r={r}
            fill="#D97757"
            opacity={op}
          />
        );
      })}
    </g>
  );
}

/* ────────────────────────────────────────────────────────────── *
 * Scene 1 — Agent loop
 * ────────────────────────────────────────────────────────────── */

function AgentLoopScene() {
  const id = useId().replace(/:/g, "-");
  const ref = useRef<HTMLDivElement>(null);
  useSceneTimeline(ref);

  const X = { user: 70, claude: 240, agent: 420, tools: 600, ctx: 770 };
  const Y = { mid: 175, top: 95, bot: 255 };

  return (
    <div ref={ref} className="absolute inset-0">
      <svg viewBox="0 0 840 320" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <Defs id={id} />
        <Particles />

        {/* Pulsing halo behind Claude */}
        <circle className="hero-pulse" cx={X.claude} cy={Y.mid} r={50} fill={`url(#pulseGrad-${id})`} />

        {/* Edges */}
        <Edge id={id} d={`M ${X.user + 38} ${Y.mid} H ${X.claude - 56}`} label="prompt" labelX={(X.user + X.claude) / 2 + 5} labelY={Y.mid - 16} />
        <Edge id={id} d={`M ${X.claude + 56} ${Y.mid} H ${X.agent - 60}`} label="stop_reason" labelX={(X.claude + X.agent) / 2} labelY={Y.mid - 16} />
        <Edge id={id} d={`M ${X.agent + 60} ${Y.mid} H ${(X.agent + X.tools) / 2} V ${Y.top} H ${X.tools - 56}`} />
        <Edge id={id} d={`M ${X.agent + 60} ${Y.mid} H ${X.tools - 56}`} />
        <Edge id={id} d={`M ${X.agent + 60} ${Y.mid} H ${(X.agent + X.tools) / 2} V ${Y.bot} H ${X.tools - 56}`} />
        <Edge id={id} d={`M ${X.tools + 56} ${Y.top} H ${X.ctx - 16} V ${Y.mid - 22}`} />
        <Edge id={id} d={`M ${X.tools + 56} ${Y.mid} H ${X.ctx - 56}`} />
        <Edge id={id} d={`M ${X.tools + 56} ${Y.bot} H ${X.ctx - 16} V ${Y.mid + 22}`} />
        <Edge id={id} d={`M ${X.ctx - 56} ${Y.mid - 28} V 35 H ${X.claude} V ${Y.mid - 28}`} label="feedback" labelX={(X.ctx + X.claude) / 2 - 20} labelY={28} />

        {/* Nodes */}
        <Pill cx={X.user}   cy={Y.mid} text="User" />
        <Pill cx={X.claude} cy={Y.mid} text="Claude" fill="#D97757" stroke="#9B4830" textColor="#FFFFFF" fontSize={13} height={50} glow={`url(#glow-${id})`} />
        <Pill cx={X.agent}  cy={Y.mid} text="Agent loop" fill="#FAE5D5" stroke="#D97757" textColor="#9B4830" fontSize={12} height={42} />
        <Pill cx={X.tools}  cy={Y.top} text="MCP tool" />
        <Pill cx={X.tools}  cy={Y.mid} text="Web search" />
        <Pill cx={X.tools}  cy={Y.bot} text="Code edit" />
        <Pill cx={X.ctx}    cy={Y.mid} text="Context" />

        <circle r="5" fill="#D97757" filter={`url(#glow-${id})`}>
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            path={`M ${X.user} ${Y.mid} H ${X.claude} H ${X.agent} H ${X.tools} H ${X.ctx} V 35 H ${X.claude} V ${Y.mid} Z`}
          />
        </circle>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── *
 * Scene 2 — MCP routing
 * ────────────────────────────────────────────────────────────── */

function MCPScene() {
  const id = useId().replace(/:/g, "-");
  const ref = useRef<HTMLDivElement>(null);
  useSceneTimeline(ref);

  const CLIENT = { x: 110, y: 60, w: 200, h: 220 };
  const SERVER = { x: 380, y: 60, w: 240, h: 220 };
  const X = { claude: 50, mcp: 210, srv: 410, prims: 555, backing: 760 };
  const Y = { mid: 180, top: 115, bot: 245 };

  return (
    <div ref={ref} className="absolute inset-0">
      <svg viewBox="0 0 840 320" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <Defs id={id} />
        <Particles />

        <rect x={CLIENT.x} y={CLIENT.y} width={CLIENT.w} height={CLIENT.h} rx={14} fill="#FAE5D5" opacity={0.45} stroke="#D97757" strokeDasharray="4 4" />
        <rect x={SERVER.x} y={SERVER.y} width={SERVER.w} height={SERVER.h} rx={14} fill="#F5F2EB" opacity={0.6} stroke="#A89A7E" strokeDasharray="4 4" />
        <text x={CLIENT.x + 12} y={CLIENT.y + 18} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="#9B4830">CLIENT</text>
        <text x={SERVER.x + 12} y={SERVER.y + 18} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="#544E3F">MCP SERVER</text>

        <circle className="hero-pulse" cx={X.claude} cy={Y.mid} r={36} fill={`url(#pulseGrad-${id})`} />

        <Edge id={id} d={`M ${X.claude + 36} ${Y.mid} H ${X.mcp - 60}`} label="prompt" labelX={(X.claude + X.mcp) / 2 + 5} labelY={Y.mid - 16} />
        <Edge id={id} d={`M ${X.mcp + 60} ${Y.mid} H ${X.srv - 36}`} label="tool_use" labelX={(X.mcp + X.srv) / 2} labelY={Y.mid - 16} />
        <Edge id={id} d={`M ${X.srv + 36} ${Y.mid} H ${(X.srv + X.prims) / 2} V ${Y.top} H ${X.prims - 56}`} />
        <Edge id={id} d={`M ${X.srv + 36} ${Y.mid} H ${X.prims - 56}`} />
        <Edge id={id} d={`M ${X.srv + 36} ${Y.mid} H ${(X.srv + X.prims) / 2} V ${Y.bot} H ${X.prims - 56}`} />
        <Edge id={id} d={`M ${X.prims + 56} ${Y.top} H ${X.backing - 36}`} />
        <Edge id={id} d={`M ${X.prims + 56} ${Y.mid} H ${X.backing - 36}`} />
        <Edge id={id} d={`M ${X.prims + 56} ${Y.bot} H ${X.backing - 36}`} />

        <Pill cx={X.claude}  cy={Y.mid} text="Claude" fill="#D97757" stroke="#9B4830" textColor="#FFFFFF" fontSize={11} height={42} glow={`url(#glow-${id})`} />
        <Pill cx={X.mcp}     cy={Y.mid} text="MCP client" fontSize={11} />
        <Pill cx={X.srv}     cy={Y.mid} text="Server" fill="#FAE5D5" stroke="#D97757" textColor="#9B4830" fontSize={11} />
        <Pill cx={X.prims}   cy={Y.top} text="Tools" />
        <Pill cx={X.prims}   cy={Y.mid} text="Resources" />
        <Pill cx={X.prims}   cy={Y.bot} text="Prompts" />
        <Pill cx={X.backing} cy={Y.top} text="DB" fontSize={10} height={32} minWidth={50} />
        <Pill cx={X.backing} cy={Y.mid} text="Files" fontSize={10} height={32} minWidth={50} />
        <Pill cx={X.backing} cy={Y.bot} text="API" fontSize={10} height={32} minWidth={50} />

        <circle r="4" fill="#D97757" filter={`url(#glow-${id})`}>
          <animateMotion
            dur="5.5s"
            repeatCount="indefinite"
            path={`M ${X.claude} ${Y.mid} H ${X.mcp} H ${X.srv} H ${X.prims} H ${X.backing} V ${Y.top} Z`}
          />
        </circle>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── *
 * Scene 3 — CLAUDE.md hierarchy
 * ────────────────────────────────────────────────────────────── */

function ClaudeMdScene() {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "-");
  useGSAP(
    () => {
      gsap.from(".cmd-bar", {
        x: -40,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.12,
      });
      gsap.to(".cmd-shimmer", {
        backgroundPosition: "200% 0%",
        duration: 3,
        ease: "none",
        repeat: -1,
        stagger: 0.2,
      });
      gsap.to(".cmd-priority", {
        scale: 1.04,
        duration: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.1,
        transformOrigin: "center",
      });
    },
    { scope: ref },
  );

  const layers = [
    { label: "managed", scope: "/etc/claude-code/CLAUDE.md", priority: "non-overridable", color: "#33302A", text: "#FBF8F4" },
    { label: "project", scope: "./CLAUDE.md", priority: "shared via git", color: "#9B4830", text: "#FBF8F4" },
    { label: "user",    scope: "~/.claude/CLAUDE.md", priority: "personal", color: "#D97757", text: "#FBF8F4" },
    { label: "local",   scope: "./CLAUDE.local.md", priority: "gitignored", color: "#FAE5D5", text: "#9B4830" },
  ];

  return (
    <div ref={ref} className="absolute inset-0">
      <svg viewBox="0 0 840 320" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <Defs id={id} />

        {layers.map((l, i) => {
          const y = 38 + i * 62;
          return (
            <g key={l.label} className="cmd-bar">
              <rect x={120} y={y} width={600} height={48} rx={10} fill={l.color} opacity={0.96} />
              <text x={140} y={y + 24} dominantBaseline="central" fontSize={14} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill={l.text}>{l.label}</text>
              <text x={260} y={y + 24} dominantBaseline="central" fontSize={11} fontFamily="JetBrains Mono, monospace" fill={l.text} opacity={0.85}>{l.scope}</text>
              <g className="cmd-priority">
                <rect x={580} y={y + 8} width={130} height={32} rx={16} fill={l.text === "#FBF8F4" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)"} />
                <text x={645} y={y + 24} textAnchor="middle" dominantBaseline="central" fontSize={10} fontFamily="JetBrains Mono, monospace" fill={l.text} opacity={0.95}>{l.priority}</text>
              </g>
              <line className="cmd-shimmer-line" x1={130} y1={y + 55} x2={710} y2={y + 55} stroke="#D97757" strokeWidth={1.4} strokeLinecap="round" strokeDasharray="40 30" opacity={0.45} />
            </g>
          );
        })}

        <text x={420} y={304} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#7A6F5A">
          all four layers merge at runtime · managed cannot be overridden
        </text>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── *
 * Scene 4 — Claude Code in CI/CD
 * ────────────────────────────────────────────────────────────── */

function CiCdScene() {
  const id = useId().replace(/:/g, "-");
  const ref = useRef<HTMLDivElement>(null);
  useSceneTimeline(ref);

  const X = { pr: 80, claude: 245, json: 425, fan: 615, gh: 780 };
  const Y = { mid: 185, top: 110, bot: 260 };

  return (
    <div ref={ref} className="absolute inset-0">
      <svg viewBox="0 0 840 320" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <Defs id={id} />
        <Particles />

        <g className="hero-node">
          <rect x={130} y={28} width={540} height={32} rx={6} fill="#1F1D19" />
          <text x={400} y={44} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#FAE5D5">
            $ claude code -p &quot;review this diff&quot; --output-format json
          </text>
        </g>

        <circle className="hero-pulse" cx={X.claude} cy={Y.mid} r={42} fill={`url(#pulseGrad-${id})`} />

        <Edge id={id} d={`M ${X.pr + 50} ${Y.mid} H ${X.claude - 70}`} />
        <Edge id={id} d={`M ${X.claude + 70} ${Y.mid} H ${X.json - 65}`} label="--output-format json" labelX={(X.claude + X.json) / 2} labelY={Y.mid - 16} />
        <Edge id={id} d={`M ${X.json + 65} ${Y.mid} H ${(X.json + X.fan) / 2} V ${Y.top} H ${X.fan - 70}`} />
        <Edge id={id} d={`M ${X.json + 65} ${Y.mid} H ${X.fan - 70}`} />
        <Edge id={id} d={`M ${X.json + 65} ${Y.mid} H ${(X.json + X.fan) / 2} V ${Y.bot} H ${X.fan - 70}`} />
        <Edge id={id} d={`M ${X.fan + 70} ${Y.top} H ${X.gh - 32}`} />
        <Edge id={id} d={`M ${X.fan + 70} ${Y.mid} H ${X.gh - 32}`} />
        <Edge id={id} d={`M ${X.fan + 70} ${Y.bot} H ${X.gh - 32}`} />

        <Pill cx={X.pr}     cy={Y.mid} text="PR diff" />
        <Pill cx={X.claude} cy={Y.mid} text="claude code" fill="#D97757" stroke="#9B4830" textColor="#FFFFFF" fontSize={12} height={48} glow={`url(#glow-${id})`} />
        <Pill cx={X.json}   cy={Y.mid} text="JSON output" fill="#FAE5D5" stroke="#D97757" textColor="#9B4830" fontSize={11} height={42} />
        <Pill cx={X.fan}    cy={Y.top} text="Code review" />
        <Pill cx={X.fan}    cy={Y.mid} text="Test gen" />
        <Pill cx={X.fan}    cy={Y.bot} text="Lint fixes" />
        <Pill cx={X.gh}     cy={Y.mid} text="GitHub" fontSize={11} height={36} minWidth={62} />

        <circle r="4" fill="#D97757" filter={`url(#glow-${id})`}>
          <animateMotion
            dur="6.5s"
            repeatCount="indefinite"
            path={`M ${X.pr} ${Y.mid} H ${X.claude} H ${X.json} H ${X.fan} V ${Y.top} H ${X.gh} Z`}
          />
        </circle>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── *
 * Scene 5 — Structured output
 * ────────────────────────────────────────────────────────────── */

function StructuredOutputScene() {
  const id = useId().replace(/:/g, "-");
  const ref = useRef<HTMLDivElement>(null);
  useSceneTimeline(ref);

  const X = { doc: 80, claude: 245, json: 425, gate: 595, ok: 760 };
  const Y = { mid: 130, retryY: 250 };

  return (
    <div ref={ref} className="absolute inset-0">
      <svg viewBox="0 0 840 320" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <Defs id={id} />
        <Particles />

        <g className="hero-node">
          <rect x={140} y={22} width={520} height={32} rx={6} fill="#1F1D19" />
          <text x={400} y={38} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#FAE5D5">
            tool_use · {`{ "name": "extract_invoice", "input_schema": {...} }`}
          </text>
        </g>

        <circle className="hero-pulse" cx={X.claude} cy={Y.mid} r={40} fill={`url(#pulseGrad-${id})`} />

        <Edge id={id} d={`M ${X.doc + 50} ${Y.mid} H ${X.claude - 70}`} />
        <Edge id={id} d={`M ${X.claude + 70} ${Y.mid} H ${X.json - 70}`} label="JSON schema" labelX={(X.claude + X.json) / 2} labelY={Y.mid - 16} />
        <Edge id={id} d={`M ${X.json + 70} ${Y.mid} H ${X.gate - 36}`} />
        <Edge id={id} d={`M ${X.gate + 36} ${Y.mid} H ${X.ok - 56}`} label="✓ valid" labelX={(X.gate + X.ok) / 2} labelY={Y.mid - 16} />
        <Edge id={id} d={`M ${X.gate} ${Y.mid + 24} V ${Y.retryY - 22}`} label="✗ invalid" labelX={X.gate + 50} labelY={(Y.mid + Y.retryY) / 2} />
        <Edge id={id} d={`M ${X.gate - 100} ${Y.retryY} H ${X.claude} V ${Y.mid + 26}`} label="retry w/ error context" labelX={(X.claude + X.gate) / 2 - 50} labelY={Y.retryY - 14} />

        <Pill cx={X.doc}    cy={Y.mid} text="Document" fontSize={11} />
        <Pill cx={X.claude} cy={Y.mid} text="Claude" fill="#D97757" stroke="#9B4830" textColor="#FFFFFF" fontSize={12} height={48} glow={`url(#glow-${id})`} />
        <Pill cx={X.json}   cy={Y.mid} text="tool_use(JSON)" fill="#FAE5D5" stroke="#D97757" textColor="#9B4830" fontSize={11} height={42} />

        <g className="hero-node">
          <rect x={X.gate - 36} y={Y.mid - 22} width={72} height={44} rx={22} fill="#FBF8F4" stroke="#9B4830" strokeWidth={1.6} />
          <text x={X.gate} y={Y.mid} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={600} fill="#9B4830">
            validate
          </text>
        </g>

        <Pill cx={X.ok} cy={Y.mid} text="Store" fontSize={11} />
        <Pill cx={X.gate - 100} cy={Y.retryY} text="error context" fontSize={11} fill="#FAE5D5" stroke="#D97757" textColor="#9B4830" height={40} />

        <g className="hero-node" transform="translate(80 286)">
          <rect width={680} height={26} rx={13} fill="#33302A" />
          <text x={20} y={13} dominantBaseline="central" fontSize={10} fontFamily="JetBrains Mono, monospace" fill="#FAE5D5">
            Batch API · custom_id correlation · 50% cost · async (24h)
          </text>
          <text x={660} y={13} textAnchor="end" dominantBaseline="central" fontSize={10} fontFamily="JetBrains Mono, monospace" fill="#EDA378">
            for non-interactive workloads
          </text>
        </g>

        <circle r="4" fill="#D97757" filter={`url(#glow-${id})`}>
          <animateMotion
            dur="6.5s"
            repeatCount="indefinite"
            path={`M ${X.doc} ${Y.mid} H ${X.claude} H ${X.json} H ${X.gate} H ${X.ok} Z`}
          />
        </circle>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── *
 * Scene 6 — Context management
 * ────────────────────────────────────────────────────────────── */

function ContextScene() {
  const id = useId().replace(/:/g, "-");
  const ref = useRef<HTMLDivElement>(null);

  const tokenCount = 18;
  const tokenW = 32;
  const tokenGap = 6;
  const totalW = tokenCount * tokenW + (tokenCount - 1) * tokenGap;
  const startX = (840 - totalW) / 2;

  useGSAP(
    () => {
      // Tokens stagger in
      gsap.from(".ctx-token", {
        scale: 0.4,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.6)",
        stagger: { each: 0.04, from: "edges" },
        transformOrigin: "center",
      });
      // Tokens pulse middle ones (low attention) in a wave
      gsap.to(".ctx-token-middle", {
        opacity: 0.45,
        duration: 1.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.1, from: "center" },
      });
      // Mitigation pills slide up
      gsap.from(".ctx-mit", {
        y: 18,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.15,
        delay: 0.6,
      });
      // Curve "breathes"
      gsap.to(".ctx-curve", {
        opacity: 0.55,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="absolute inset-0">
      <svg viewBox="0 0 840 320" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <Defs id={id} />
        <Particles count={8} />

        <text x={420} y={28} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#9B4830">
          attention curve · &quot;lost in the middle&quot;
        </text>

        <linearGradient id={`attn-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D97757" stopOpacity="0.95" />
          <stop offset="20%" stopColor="#D97757" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#D97757" stopOpacity="0.18" />
          <stop offset="80%" stopColor="#D97757" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#D97757" stopOpacity="0.95" />
        </linearGradient>
        <path
          className="ctx-curve"
          d={`M ${startX} 80 C ${startX + 120} 50, ${startX + 220} 130, 420 130 S ${startX + totalW - 100} 50, ${startX + totalW} 80`}
          fill="none"
          stroke={`url(#attn-${id})`}
          strokeWidth={3}
          strokeLinecap="round"
        />

        <g transform={`translate(${startX} 150)`}>
          {Array.from({ length: tokenCount }).map((_, i) => {
            const middle = i >= 6 && i <= 11;
            return (
              <rect
                key={i}
                className={`ctx-token ${middle ? "ctx-token-middle" : ""}`}
                x={i * (tokenW + tokenGap)}
                y={0}
                width={tokenW}
                height={tokenW}
                rx={5}
                fill={middle ? "#FBF8F4" : "#FAE5D5"}
                stroke={middle ? "#DDD5C3" : "#D97757"}
                strokeWidth={1.5}
              />
            );
          })}
        </g>

        <text x={startX + 10} y={210} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="#9B4830">START — high recall</text>
        <text x={startX + totalW / 2} y={210} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="#7A6F5A" textAnchor="middle">MIDDLE — degraded</text>
        <text x={startX + totalW - 10} y={210} fontSize={10} fontFamily="JetBrains Mono, monospace" fill="#9B4830" textAnchor="end">END — high recall</text>

        <g transform="translate(80 240)">
          {[
            "✓ Move critical facts to start/end",
            "✓ Prompt caching",
            "✓ Subagent context isolation",
          ].reduce<{ x: number; out: React.ReactElement[] }>((acc, label, i) => {
            const w = nodeRectWidth(label, 11, 14, 130);
            const h = 32;
            const node = (
              <g key={i} className="ctx-mit">
                <rect x={acc.x} y={0} width={w} height={h} rx={h / 2} fill="#1F1D19" />
                <text x={acc.x + w / 2} y={h / 2} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#FAE5D5">
                  {label}
                </text>
              </g>
            );
            acc.out.push(node);
            acc.x += w + 12;
            return acc;
          }, { x: 0, out: [] }).out}
        </g>
      </svg>
    </div>
  );
}

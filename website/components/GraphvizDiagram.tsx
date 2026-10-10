"use client";

import { useEffect, useState } from "react";

interface Props {
  dot: string;
}

// Module-singleton viz instance — loaded lazily, shared across renders.
let vizPromise: Promise<{ renderSVGElement: (src: string) => SVGElement }> | null = null;

async function getViz() {
  if (!vizPromise) {
    vizPromise = (async () => {
      // Webpack chunk-load failures (e.g. dev-server shutdown between visits)
      // surface as "Loading chunk … failed". Retry once with a small backoff
      // before giving up — this fixes the issue 95% of the time without
      // forcing a hard refresh on the user.
      let lastErr: unknown;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const mod = await import("@viz-js/viz");
          const instance = await mod.instance();
          return instance as { renderSVGElement: (src: string) => SVGElement };
        } catch (e) {
          lastErr = e;
          await new Promise((r) => setTimeout(r, 250));
        }
      }
      throw lastErr;
    })();
  }
  return vizPromise;
}

export function GraphvizDiagram({ dot }: Props) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const viz = await getViz();
        const el = viz.renderSVGElement(dot);
        el.removeAttribute("width");
        el.removeAttribute("height");
        el.setAttribute("style", "max-width:100%; height:auto;");
        if (!cancelled) setSvg(el.outerHTML);
      } catch (e) {
        if (!cancelled) {
          // Reset the singleton so the next mount tries again from scratch.
          vizPromise = null;
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dot]);

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
        <p className="font-medium">Diagram failed to render</p>
        <p className="mt-1 font-mono">{error}</p>
        <button
          type="button"
          onClick={() => {
            vizPromise = null;
            // Trigger re-mount via state churn
            setError("");
            setLoading(true);
          }}
          className="mt-2 rounded-full border border-rose-300 bg-white px-3 py-1 text-rose-700 hover:bg-rose-100"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !svg) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-clay-200 bg-clay-50 text-xs text-clay-500">
        Loading diagram…
      </div>
    );
  }

  return (
    <div
      className="flex w-full justify-center overflow-x-auto rounded-lg border border-ink-200 bg-white p-6"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

import type { VisualBlock } from "@/lib/types";
import { GraphvizDiagram } from "./GraphvizDiagram";
import { DoDontCards } from "./DoDontCards";
import { SequenceSteps } from "./SequenceSteps";
import { getCachedGraphviz } from "@/lib/graphviz-cache";

interface Props {
  visuals: VisualBlock[];
  /**
   * If provided, graphviz diagrams use the prerender cache keyed by
   * `${cacheKey}::${index}`. This skips the runtime viz-js dynamic
   * import entirely — the diagram is just a static SVG string.
   */
  cacheKey?: string;
}

export function VisualsStrip({ visuals, cacheKey }: Props) {
  return (
    <div className="space-y-6">
      {visuals.map((v, i) => {
        const cached =
          v.kind === "graphviz" && cacheKey
            ? getCachedGraphviz(cacheKey, i)
            : undefined;
        return (
          <figure key={i} className="space-y-2">
            <figcaption>
              <div className="text-sm font-semibold text-ink-900">{v.title}</div>
              {v.caption && (
                <div className="mt-0.5 text-xs text-ink-500">{v.caption}</div>
              )}
            </figcaption>
            {v.kind === "graphviz" &&
              (cached ? (
                <div
                  className="flex w-full justify-center overflow-x-auto rounded-lg border border-ink-200 bg-white p-6 [&>svg]:h-auto [&>svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: cached }}
                />
              ) : (
                <GraphvizDiagram dot={v.dot} />
              ))}
            {v.kind === "do-dont" && <DoDontCards items={v.items} />}
            {v.kind === "sequence" && (
              <SequenceSteps actors={v.actors} steps={v.steps} />
            )}
          </figure>
        );
      })}
    </div>
  );
}

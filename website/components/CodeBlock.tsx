"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  content: string;
  language?: string;
  path?: string;
  lineCount?: number;
  byteSize?: number;
  /** Show the body collapsed by default — useful for big files. */
  defaultCollapsed?: boolean;
  maxHeight?: string;
}

export function CodeBlock({
  content,
  language = "text",
  path,
  lineCount,
  byteSize,
  defaultCollapsed = false,
  maxHeight = "32rem",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="overflow-hidden rounded-xl border border-clay-200 bg-clay-900 text-clay-50 shadow-sm">
      {(path || language) && (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-clay-900 px-4 py-2 text-xs">
          <div className="min-w-0 flex items-center gap-2">
            {path && (
              <span className="truncate font-mono text-clay-200">{path}</span>
            )}
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-clay-300">
              {language}
            </span>
            {lineCount !== undefined && (
              <span className="hidden font-mono text-[10px] text-clay-400 sm:inline">
                {lineCount} lines
                {byteSize !== undefined && ` · ${formatBytes(byteSize)}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-clay-300 transition hover:bg-white/10 hover:text-white"
              aria-label={collapsed ? "Expand" : "Collapse"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-clay-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Copy"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> copy
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {!collapsed && (
        <pre
          className="overflow-x-auto overflow-y-auto px-4 py-4 text-[12.5px] leading-relaxed text-clay-100"
          style={{ maxHeight }}
        >
          <code className="font-mono">{content}</code>
        </pre>
      )}
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

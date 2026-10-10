"use client";

import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { EXERCISE_CODE, type ExerciseFile } from "@/lib/exercise-code";

interface Props {
  exerciseSlug: string;
  steps: string[];
}

/**
 * Renders each step alongside the source files most relevant to it.
 * Falls back gracefully if no snapshot exists for the slug.
 */
export function ExerciseCode({ exerciseSlug, steps }: Props) {
  const code = EXERCISE_CODE[exerciseSlug];
  if (!code) {
    return (
      <ol className="list-decimal space-y-3 pl-5 text-sm text-clay-700">
        {steps.map((s, i) => (
          <li key={i} className="leading-relaxed">
            {s}
          </li>
        ))}
      </ol>
    );
  }

  const fileMap: Record<string, ExerciseFile> = {};
  for (const f of code.files) fileMap[f.path] = f;

  return (
    <div className="space-y-8">
      {steps.map((step, i) => {
        const stepPaths = code.stepFiles[i] ?? [];
        const files = stepPaths
          .map((p) => fileMap[p])
          .filter((f): f is ExerciseFile => !!f);
        return (
          <StepBlock
            key={i}
            index={i + 1}
            text={step}
            files={files}
            exerciseRoot={code.exerciseRoot}
          />
        );
      })}
    </div>
  );
}

function StepBlock({
  index,
  text,
  files,
  exerciseRoot,
}: {
  index: number;
  text: string;
  files: ExerciseFile[];
  exerciseRoot: string;
}) {
  const [openFile, setOpenFile] = useState<string | null>(
    files.length > 0 ? files[0].path : null,
  );

  return (
    <div className="rounded-2xl border border-clay-200 bg-white p-5 sm:p-6">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs font-semibold tabular-nums text-ember-700">
          STEP {String(index).padStart(2, "0")}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-clay-800">{text}</p>

      {files.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((f) => (
              <button
                key={f.path}
                type="button"
                onClick={() => setOpenFile(f.path)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                  openFile === f.path
                    ? "border-ember-300 bg-ember-50 text-ember-700"
                    : "border-clay-200 bg-clay-50 text-clay-700 hover:border-ember-200"
                }`}
              >
                <span className="truncate">{f.path}</span>
                <span className="rounded-full border border-clay-200 bg-white px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-clay-500">
                  {f.language}
                </span>
              </button>
            ))}
          </div>

          {openFile &&
            (() => {
              const file = files.find((f) => f.path === openFile);
              if (!file) return null;
              return (
                <CodeBlock
                  path={`${exerciseRoot}/${file.path}`}
                  language={file.language}
                  content={file.content}
                  lineCount={file.lineCount}
                  byteSize={file.byteSize}
                  defaultCollapsed={file.lineCount > 200}
                />
              );
            })()}
        </div>
      )}
    </div>
  );
}

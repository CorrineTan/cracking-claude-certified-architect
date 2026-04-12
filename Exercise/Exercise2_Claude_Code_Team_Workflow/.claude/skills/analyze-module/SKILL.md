---
context: fork
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
argument-hint: "Module path to analyze (e.g., src/api, src/models, src/frontend)"
---

# Analyze Module

Perform a comprehensive analysis of the specified module and produce a structured summary.

## Instructions

1. Use Glob to list all source files in the module directory.
2. Use Grep to find all public exports (functions, classes, components).
3. Use Read to examine key files and understand the module's responsibilities.
4. Use Bash to count lines of code (`wc -l`) and check for TODO/FIXME comments.
5. Produce a structured report with:
   - **Purpose**: What does this module do?
   - **Public API**: Key exported functions/classes/components.
   - **Dependencies**: What other modules does it import from?
   - **Test coverage**: Which files have corresponding test files?
   - **Issues**: Any TODO/FIXME items, potential problems, or missing tests.

## Output Format

Return the report as a markdown document. Do NOT make changes to any files.

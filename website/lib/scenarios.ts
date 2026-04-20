import type { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
  {
    slug: "customer-support",
    number: 1,
    title: "Customer Support Resolution Agent",
    product: "customer support resolution agent",
    narrative:
      "You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.",
    primaryDomains: ["D1", "D2", "D5"],
    targetMetric: "80%+ first-contact resolution",
  },
  {
    slug: "code-generation",
    number: 2,
    title: "Code Generation with Claude Code",
    product: "Claude Code",
    narrative:
      "You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.",
    primaryDomains: ["D3", "D5"],
  },
  {
    slug: "multi-agent-research",
    number: 3,
    title: "Multi-Agent Research System",
    product: "multi-agent research system",
    narrative:
      "You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.",
    primaryDomains: ["D1", "D2", "D5"],
  },
  {
    slug: "developer-productivity",
    number: 4,
    title: "Developer Productivity with Claude",
    product: "developer productivity tools",
    narrative:
      "You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.",
    primaryDomains: ["D2", "D3", "D1"],
  },
  {
    slug: "ci-cd",
    number: 5,
    title: "Claude Code for Continuous Integration",
    product: "Claude Code in CI/CD",
    narrative:
      "You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.",
    primaryDomains: ["D3", "D4"],
  },
  {
    slug: "structured-extraction",
    number: 6,
    title: "Structured Data Extraction",
    product: "structured data extraction system",
    narrative:
      "You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.",
    primaryDomains: ["D4", "D5"],
  },
];

export function getScenario(slug: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.slug === slug);
}

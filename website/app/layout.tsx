import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Claude Architect — Pass the Foundations exam with running code",
  description:
    "Open study workspace for the Claude Certified Architect Foundations exam. 200+ annotated questions, six scenarios, and runnable MCP + Claude Code reference projects — all free, all on GitHub.",
  keywords: [
    "Claude certification",
    "Claude Certified Architect",
    "Claude Foundations exam",
    "Anthropic certification",
    "MCP",
    "Claude Code",
    "agent architecture",
  ],
  openGraph: {
    title: "Claude Architect — Pass the Foundations exam with running code",
    description:
      "200+ annotated questions, six scenarios, runnable MCP + Claude Code reference projects.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-clay-50 font-sans text-clay-900 antialiased">
        <SessionProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}

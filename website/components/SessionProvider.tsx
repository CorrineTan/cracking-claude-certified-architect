"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // When auth is not configured we deliberately do NOT mount the next-auth
  // SessionProvider — its background `/api/auth/session` poll is what
  // throws ClientFetchError when the server has no AUTH_SECRET/Google
  // creds. Components below use `useAuthEnabled()` to gate calls to
  // useSession() so the page still renders cleanly.
  if (process.env.NEXT_PUBLIC_AUTH_CONFIGURED !== "1") {
    return <>{children}</>;
  }
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

/** Simple client-side flag — true only when AUTH env was filled in. */
export function useAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_CONFIGURED === "1";
}

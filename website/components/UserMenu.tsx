"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useAuthEnabled } from "./SessionProvider";

export function UserMenu() {
  const authEnabled = useAuthEnabled();

  if (!authEnabled) {
    return (
      <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
        Sign-in disabled — see AUTH_SETUP.md
      </span>
    );
  }
  return <SignedInMenu />;
}

// Hooks must run unconditionally inside the SignedInMenu — split into its own
// component so the parent can early-return when auth isn't configured (no
// useSession call → no ClientFetchError when env is missing).
function SignedInMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-20 animate-pulse rounded-full bg-clay-100" />;
  }
  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("google")}
        className="rounded-full border border-clay-200 bg-white px-4 py-1.5 text-sm font-medium text-clay-800 transition hover:bg-clay-50"
      >
        Sign in
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {session.user.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={session.user.image} alt="" className="h-7 w-7 rounded-full" />
      )}
      <span className="hidden text-sm text-clay-800 sm:inline">
        {session.user.name?.split(" ")[0]}
      </span>
      <button
        type="button"
        onClick={() => signOut()}
        className="text-xs text-clay-500 hover:text-ember-600"
      >
        sign out
      </button>
    </div>
  );
}

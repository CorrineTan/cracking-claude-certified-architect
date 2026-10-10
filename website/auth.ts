import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * NextAuth v5 — Google-only sign-in. Stateless JWT, no DB.
 *
 * Behavior when env is missing: rather than crash with a vague
 * `ClientFetchError`, we return a config without providers — `auth()`
 * still works (returns null) and the comment route surfaces a clear 401
 * "sign in disabled" message.
 *
 * Required env:
 *   AUTH_SECRET           random 32+ char (openssl rand -base64 32)
 *   AUTH_GOOGLE_ID        Google OAuth client id
 *   AUTH_GOOGLE_SECRET    Google OAuth client secret
 *
 * NEXTAUTH_URL is auto-detected on Vercel; for other deployments set
 *   NEXTAUTH_URL=https://your-domain.com   (and AUTH_TRUST_HOST=true)
 */

const googleConfigured =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

export const isAuthConfigured =
  !!process.env.AUTH_SECRET && googleConfigured;

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: googleConfigured
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
      ]
    : [],
  // trustHost is required behind any proxy (Vercel, Cloudflare, etc.). Safe
  // to leave on for local dev too.
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.email = profile.email ?? token.email;
        token.name = profile.name ?? token.name;
        token.picture = (profile as { picture?: string }).picture ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
        session.user.image =
          (token.picture as string | undefined) ?? session.user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});

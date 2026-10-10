# Google sign-in — setup

Comments require Google sign-in. Reads + writes both check the session.

## What you do once on Google Cloud

1. Open <https://console.cloud.google.com/> → create a project (or pick one).
2. **APIs & Services → OAuth consent screen**:
   - User type: **External** (for public sign-in)
   - App name: `Claude Architect Study`
   - User support email: your email
   - Scopes: leave default (`email`, `profile`, `openid`)
   - Test users (during development): add your own Google account
   - Save & continue
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `Study site (dev)` or `(prod)`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (dev)
     - `https://your-prod-domain.com` (prod)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://your-prod-domain.com/api/auth/callback/google` (prod)
   - Save → copy the **Client ID** and **Client secret**.
4. When you're ready for the public, **OAuth consent screen → Publish app**
   to leave testing mode.

## Env vars

Add to `website/.env.local` (and the same to Vercel project env in production):

```
# Auth — required
AUTH_SECRET=<random 32+ chars; run: openssl rand -base64 32>
AUTH_GOOGLE_ID=<from step 3>
AUTH_GOOGLE_SECRET=<from step 3>

# Vercel sets AUTH_TRUST_HOST=true automatically; if you self-host behind a proxy, set it.

# GitHub Discussions (already set up via COMMENTS_SETUP.md)
GITHUB_TOKEN=github_pat_xxx
GITHUB_REPO_OWNER=corrtan
GITHUB_REPO_NAME=cracking-claude-certified-architect
GITHUB_DISCUSSION_CATEGORY=Question Comments
```

## Troubleshooting `ClientFetchError`

Almost always one of:

1. **`AUTH_SECRET` missing or empty.**
   `cd website && grep AUTH_SECRET .env.local`
   Fix: `openssl rand -base64 32` → paste into `.env.local`. Restart `npm run dev`.

2. **Mismatched redirect URI.** Google rejects the callback because the URI
   in the OAuth client doesn't include port / scheme exactly. Local dev needs
   `http://localhost:3000/api/auth/callback/google` — note the **http** (not https), the port, and the trailing path.

3. **Server not restarted after adding env.** `.env.local` is only read at boot.
   Stop `npm run dev` and start it again.

4. **Behind a proxy without `trustHost`.** This codebase sets `trustHost: true`
   already, so this only bites if you fork.

5. **Discussion category missing.** Sign-in works, but `/api/comments/...` returns 502 because the GitHub category `Question Comments` doesn't exist yet. Create it (see `COMMENTS_SETUP.md`).

If you still see the error, open the browser dev tools network tab → click the failing `/api/auth/session` request → look at the response body. Next-auth returns a structured error there (e.g. `{"error":"Configuration","code":"AUTH_SECRET_MISSING"}`). The error link in the toast (`https://errors.authjs.dev`) only shows when env vars are missing.

## Flow at runtime

1. User opens any question → sees the **Question** tab and a **Discussion** tab.
2. Click the Discussion tab unauthenticated → "Sign in with Google" panel.
3. Click → Google OAuth → back to the same page, signed in.
4. Comments load (auth-gated), form is enabled, name + avatar from Google
   are stamped on every comment server-side.

## Why it's safe

- **Google OAuth** — no password storage, MFA inherited from the user's
  Google account, identity verified.
- **Server-side gate** — both `GET` and `POST /api/comments/...` call
  `auth()`; without a session the route returns 401.
- **Server-stamped identity** — the comment body is composed *server-side*
  using the session, not the request payload. Users can't impersonate.
- **Rate-limited per-identity** — limiter keys off `session.user.email`,
  not just IP, so signing in doesn't bypass abuse controls.
- **Filter still runs** — profanity + relevance + length checks still apply
  to authenticated users. Sign-in is identity, not a license to spam.

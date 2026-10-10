# Comments — setup & operation

The site has per-question discussions backed by **GitHub Discussions**. No
user login is required to comment; posts are validated, rate-limited, and
relayed to GitHub by a server action under the repo bot's identity.

## Architecture in 30 seconds

```
Browser
  ↓ POST /api/comments/[questionId]
Next.js route ──→ profanity + relevance filter
                  ↓ honeypot + IP rate-limit (4/min, 30/day)
                  ↓ GitHub GraphQL (createDiscussion if missing → addDiscussionComment)
GitHub Discussions: one thread per questionId, titled `comment:<questionId>`
```

Reads are unauthenticated through the same route — the server fetches the
thread and returns a flat list to the client.

## One-time setup

### 1. Enable Discussions

In the GitHub repo: **Settings → Features → Discussions** (tick the box).

### 2. Create the category

Go to the repo's **Discussions** tab. Click the gear icon next to
"Categories" → **New category**:

| Field | Value |
|---|---|
| Name | `Question Comments` |
| Description | `Per-question discussion threads relayed from the study site.` |
| Format | **Open-ended discussion** |

If you change the name, also set the env var
`GITHUB_DISCUSSION_CATEGORY` accordingly.

### 3. Create a fine-grained PAT

1. https://github.com/settings/tokens?type=beta → **Generate new token**
2. Resource owner: your account / org
3. Repository access: **Only select repositories** → pick this repo
4. Repository permissions:
   - **Discussions** → Read and write
   - **Metadata** → Read-only (mandatory)
5. Expiration: 90 days is fine; rotate before it lapses.

(For higher-trust deployments, use a GitHub App installation token instead —
same scopes, no expiry baked in.)

### 4. Set environment variables

For local dev, `website/.env.local`:

```
GITHUB_TOKEN=github_pat_xxx
GITHUB_REPO_OWNER=corrtan
GITHUB_REPO_NAME=cracking-claude-certified-architect
GITHUB_DISCUSSION_CATEGORY=Question Comments
```

For Vercel production, add the same vars under
**Project → Settings → Environment Variables**.

`GITHUB_TOKEN` must be set or the comment routes return 500.
`OWNER` / `REPO` / `CATEGORY` default to the values above; override only if
you fork.

### 5. Verify

```bash
npm run dev
# open any question page, click "Discuss this question", post a test comment
```

If it lands in the GitHub Discussions tab under the right category, you're
wired up.

## Moderation playbook

- **Bad comment** → click **Hide** on the GitHub Discussion comment. It
  disappears from the site immediately (the API only returns visible
  comments).
- **Bad thread** → **Lock** the discussion. New posts via the site will
  return 502 (GraphQL error), which we surface as a generic "could not
  post" — no leakage of repo-side state.
- **Persistent abuser** → block the IP at the edge (Vercel firewall) or
  bump up `MAX_HITS_PER_DAY` lower in `lib/rate-limit.ts`.
- **Tighten the filter** → edit `lib/comment-filter.ts`:
  - `PROFANITY` for new banned terms
  - `EXAM_TERMS` for the on-topic whitelist
  - `STOP_PHRASES` for promotional patterns
  - `COMMENT_LIMITS.MIN_RELEVANT_TERMS` to require more on-topic vocabulary

## What the user-facing UX promises

- **No login** — name field is optional, freeform, sanitized server-side
- **Rules above the textarea**: min length, exam-related, no profanity
- **Live feedback** turns green / amber / red as you type
- **Honeypot field** — invisible to humans, bots fill it and silently fail
- **Rate limit**: 4 comments per minute per IP, 30 per day. Returns HTTP 429
  with a friendly message.
- **Persistent storage**: every comment lives forever on GitHub
  Discussions, attributed to the bot account. Clicking "view on GitHub"
  opens the original.

## Cost & quota

GitHub GraphQL is **5,000 points/hour** per token. Each list = ~2 points,
each post = ~3 points (incl. the optional `createDiscussion`). At 10,000
daily readers and 100 daily posters that's ~250 points/hour — well under
the limit.

/**
 * Thin wrapper around GitHub Discussions GraphQL API.
 *
 * Server-side only. Reads GITHUB_TOKEN from env (a fine-grained PAT with
 * "Discussions: read+write" on the target repo, or a GitHub App installation
 * token).
 *
 * Each question gets ONE Discussion thread. The thread is identified by the
 * exact title `comment:<questionId>`. We resolve the discussion id lazily on
 * first comment; subsequent reads/writes use the cached id.
 *
 * Why per-question discussions instead of one giant one: makes mod and search
 * trivially scoped, and preserves a clean URL fallback (users can click
 * through to GitHub if they want richer formatting).
 */

const GH_API = "https://api.github.com/graphql";

const REPO_OWNER = process.env.GITHUB_REPO_OWNER ?? "corrtan";
const REPO_NAME = process.env.GITHUB_REPO_NAME ?? "cracking-claude-certified-architect";
const CATEGORY_NAME = process.env.GITHUB_DISCUSSION_CATEGORY ?? "Question Comments";

export interface GitHubComment {
  id: string;
  body: string;
  authorLogin: string | null;
  authorAvatar: string | null;
  createdAt: string;
  url: string;
}

export interface DiscussionThread {
  discussionId: string;
  discussionNumber: number;
  url: string;
  comments: GitHubComment[];
}

class GitHubError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function tokenOrThrow(): string {
  const t = process.env.GITHUB_TOKEN;
  if (!t) {
    throw new GitHubError(
      500,
      "GITHUB_TOKEN env var is not set — comments are disabled.",
    );
  }
  return t;
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(GH_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenOrThrow()}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "User-Agent": "claude-architect-study-site",
    },
    body: JSON.stringify({ query, variables }),
    // Don't cache — discussions change.
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new GitHubError(res.status, `GitHub API ${res.status}: ${text}`);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors && json.errors.length > 0) {
    throw new GitHubError(502, json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new GitHubError(502, "Empty GraphQL response");
  return json.data;
}

interface RepoInfo {
  repositoryId: string;
  categoryId: string;
}

let _repoCache: RepoInfo | null = null;

async function getRepoInfo(): Promise<RepoInfo> {
  if (_repoCache) return _repoCache;
  const data = await gql<{
    repository: {
      id: string;
      discussionCategories: { nodes: { id: string; name: string }[] };
    };
  }>(
    `query($owner:String!,$name:String!){
       repository(owner:$owner,name:$name){
         id
         discussionCategories(first:25){nodes{id name}}
       }
     }`,
    { owner: REPO_OWNER, name: REPO_NAME },
  );
  const repositoryId = data.repository.id;
  const cat = data.repository.discussionCategories.nodes.find(
    (c) => c.name.toLowerCase() === CATEGORY_NAME.toLowerCase(),
  );
  if (!cat) {
    throw new GitHubError(
      500,
      `Discussion category "${CATEGORY_NAME}" not found in ${REPO_OWNER}/${REPO_NAME}. Create it in repo Settings → Discussions.`,
    );
  }
  _repoCache = { repositoryId, categoryId: cat.id };
  return _repoCache;
}

function threadTitle(questionId: string): string {
  return `comment:${questionId}`;
}

/**
 * Find the discussion thread for a question. Returns null if it has not been
 * created yet (no comments posted yet).
 */
async function findDiscussion(questionId: string): Promise<{
  id: string;
  number: number;
  url: string;
} | null> {
  // GitHub's discussion search by title isn't directly exposed via GraphQL
  // search filters, so we use the REST search endpoint scoped to the repo.
  const q = encodeURIComponent(
    `repo:${REPO_OWNER}/${REPO_NAME} in:title "${threadTitle(questionId)}"`,
  );
  const res = await fetch(
    `https://api.github.com/search/issues?q=${q}+is:discussion`,
    {
      headers: {
        Authorization: `Bearer ${tokenOrThrow()}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "claude-architect-study-site",
      },
      cache: "no-store",
    },
  );
  // Search may rate-limit / not return discussions reliably for unauthenticated
  // search of private state. Fall back to listing recent discussions instead.
  if (!res.ok) {
    return findDiscussionViaListing(questionId);
  }
  const body = (await res.json()) as { items: { node_id: string; number: number; html_url: string; title: string }[] };
  const exact = body.items.find((it) => it.title === threadTitle(questionId));
  if (!exact) return findDiscussionViaListing(questionId);
  return { id: exact.node_id, number: exact.number, url: exact.html_url };
}

async function findDiscussionViaListing(questionId: string): Promise<{
  id: string;
  number: number;
  url: string;
} | null> {
  const { categoryId } = await getRepoInfo();
  const data = await gql<{
    repository: {
      discussions: {
        nodes: { id: string; number: number; title: string; url: string }[];
      };
    };
  }>(
    `query($owner:String!,$name:String!,$cat:ID!){
       repository(owner:$owner,name:$name){
         discussions(first:100, categoryId:$cat, orderBy:{field:UPDATED_AT,direction:DESC}){
           nodes{id number title url}
         }
       }
     }`,
    { owner: REPO_OWNER, name: REPO_NAME, cat: categoryId },
  );
  const target = data.repository.discussions.nodes.find(
    (d) => d.title === threadTitle(questionId),
  );
  if (!target) return null;
  return { id: target.id, number: target.number, url: target.url };
}

async function createDiscussion(questionId: string): Promise<{
  id: string;
  number: number;
  url: string;
}> {
  const { repositoryId, categoryId } = await getRepoInfo();
  const data = await gql<{
    createDiscussion: {
      discussion: { id: string; number: number; url: string };
    };
  }>(
    `mutation($repo:ID!,$cat:ID!,$title:String!,$body:String!){
       createDiscussion(input:{repositoryId:$repo,categoryId:$cat,title:$title,body:$body}){
         discussion{id number url}
       }
     }`,
    {
      repo: repositoryId,
      cat: categoryId,
      title: threadTitle(questionId),
      body: `Automatic thread for question \`${questionId}\` on the study site.\n\nKeep replies on-topic — exam concepts only.`,
    },
  );
  const d = data.createDiscussion.discussion;
  return { id: d.id, number: d.number, url: d.url };
}

export async function listComments(questionId: string): Promise<DiscussionThread | null> {
  const found = await findDiscussion(questionId);
  if (!found) return null;
  const data = await gql<{
    node: {
      __typename: "Discussion";
      url: string;
      number: number;
      comments: {
        nodes: {
          id: string;
          body: string;
          createdAt: string;
          url: string;
          author: { login: string; avatarUrl: string } | null;
        }[];
      };
    } | null;
  }>(
    `query($id:ID!){
       node(id:$id){
         ... on Discussion {
           __typename url number
           comments(first:50, orderBy:{field:UPDATED_AT,direction:ASC}){
             nodes{ id body createdAt url author{login avatarUrl} }
           }
         }
       }
     }`,
    { id: found.id },
  );
  if (!data.node) return null;
  return {
    discussionId: found.id,
    discussionNumber: data.node.number,
    url: data.node.url,
    comments: data.node.comments.nodes.map((c) => ({
      id: c.id,
      body: c.body,
      authorLogin: c.author?.login ?? null,
      authorAvatar: c.author?.avatarUrl ?? null,
      createdAt: c.createdAt,
      url: c.url,
    })),
  };
}

export async function postComment(
  questionId: string,
  body: string,
): Promise<{ url: string }> {
  let target = await findDiscussion(questionId);
  if (!target) {
    target = await createDiscussion(questionId);
  }
  const data = await gql<{
    addDiscussionComment: { comment: { url: string } };
  }>(
    `mutation($id:ID!,$body:String!){
       addDiscussionComment(input:{discussionId:$id,body:$body}){
         comment{url}
       }
     }`,
    { id: target.id, body },
  );
  return { url: data.addDiscussionComment.comment.url };
}

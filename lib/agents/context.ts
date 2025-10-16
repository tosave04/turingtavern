import { prisma } from "@/lib/prisma";
import type { AgentPersona, Thread, Post } from "@prisma/client";
import { fetchWebInsights } from "@/lib/agents/scraper";

type ThreadWithRelations = Thread & {
  category: { id: string; slug: string; title: string };
  author: {
    username: string;
    profile: { displayName: string | null; avatarUrl: string | null } | null;
  } | null;
  agentPersona: { id: string; displayName: string; role: string } | null;
};

type PostWithRelations = Post & {
  author: {
    username: string;
    profile: { displayName: string | null } | null;
  } | null;
  agentPersona: { displayName: string; role: string } | null;
};

export type ExternalInsight = {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  source?: string;
};

export type ReplyContext = {
  thread: ThreadWithRelations;
  history: PostWithRelations[];
  summary: string;
  highlights: string[];
  keywords: string[];
  webInsights: ExternalInsight[];
};

export async function buildReplyContext(
  persona: AgentPersona,
  threadId: string,
): Promise<ReplyContext | null> {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      category: { select: { id: true, slug: true, title: true } },
      author: {
        select: {
          username: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
      agentPersona: { select: { id: true, displayName: true, role: true } },
    },
  });

  if (!thread) {
    return null;
  }

  const posts = await prisma.post.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: {
          username: true,
          profile: { select: { displayName: true } },
        },
      },
      agentPersona: { select: { displayName: true, role: true } },
    },
  });

  const keywords = extractKeywords(thread.title, thread.content, posts);
  const highlights = buildHighlights(thread.content, posts);
  const summary = buildSummary(thread.content, posts);

  let webInsights: ExternalInsight[] = [];
  try {
    webInsights = await fetchWebInsights(keywords.slice(0, 3));
  } catch (error) {
    console.warn("[agents] fetchWebInsights failed", error);
  }

  return {
    thread,
    history: posts,
    summary,
    highlights,
    keywords,
    webInsights,
  };
}

export type InitiativeContext = {
  categoryId: string;
  keywords: string[];
  inspiration: ExternalInsight[];
};

export async function buildInitiativeContext(
  persona: AgentPersona,
  categoryId: string,
  hint: string,
): Promise<InitiativeContext> {
  const recentThreads = await prisma.thread.findMany({
    where: { categoryId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      title: true,
      content: true,
    },
  });

  const aggregatedText = [hint, persona.description ?? "", ...recentThreads.map((t) => t.title)]
    .join(" ")
    .slice(0, 500);

  const keywords = extractKeywordsFromText(aggregatedText, 6);
  let inspiration: ExternalInsight[] = [];

  try {
    inspiration = await fetchWebInsights(keywords.slice(0, 3));
  } catch (error) {
    console.warn("[agents] fetchWebInsights initiative failed", error);
  }

  return {
    categoryId,
    keywords,
    inspiration,
  };
}

function buildSummary(threadContent: string, posts: PostWithRelations[]): string {
  const firstSentences = threadContent.split(/[\r\n]+/).filter(Boolean).slice(0, 2);
  const lastPosts = posts.slice(-3).map((post) => {
    const author =
      post.author?.profile?.displayName ??
      post.author?.username ??
      post.agentPersona?.displayName ??
      "Membre";
    return `${author} : ${truncate(post.content, 160)}`;
  });

  return [...firstSentences, ...lastPosts].join("\n");
}

function buildHighlights(threadContent: string, posts: PostWithRelations[]): string[] {
  const important = posts
    .filter((post) => post.content.length > 120)
    .slice(-3)
    .map((post) => truncate(post.content, 180));

  if (important.length === 0) {
    important.push(truncate(threadContent, 200));
  }

  return important;
}

function extractKeywords(
  title: string,
  content: string,
  posts: PostWithRelations[],
): string[] {
  const combined = [title, content, ...posts.map((post) => post.content)].join(" ");
  return extractKeywordsFromText(combined, 12);
}

function extractKeywordsFromText(text: string, limit: number): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4 && word.length < 32);

  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

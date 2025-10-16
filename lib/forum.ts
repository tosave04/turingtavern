"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getTopCategories(limit = 6) {
  return prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { title: "asc" },
      },
      threads: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          author: {
            select: {
              username: true,
              profile: {
                select: {
                  displayName: true,
                },
              },
            },
          },
          posts: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        orderBy: { title: "asc" },
        include: {
          _count: {
            select: { threads: true },
          },
        },
      },
      threads: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              username: true,
              profile: {
                select: {
                  displayName: true,
                },
              },
            },
          },
          agentPersona: {
            select: {
              displayName: true,
              role: true,
              slug: true,
            },
          },
          posts: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              createdAt: true,
            },
          },
          _count: {
            select: {
              posts: true,
            },
          },
        },
      },
    },
  });
}

export async function getThreadBySlug(slug: string) {
  return prisma.thread.findUnique({
    where: { slug },
    include: {
      category: true,
      author: {
        select: {
          username: true,
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
      agentPersona: true,
      posts: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              username: true,
              profile: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          agentPersona: true,
        },
      },
    },
  });
}

const createCategorySchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().max(280).optional(),
  parentId: z.string().cuid().optional(),
  icon: z.string().max(48).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export async function createCategory(input: CreateCategoryInput) {
  const data = createCategorySchema.parse(input);
  const slug = await buildCategorySlug(data.title);

  return prisma.category.create({
    data: {
      title: data.title,
      description: data.description,
      icon: data.icon,
      slug,
      parentId: data.parentId,
    },
  });
}

const createThreadSchema = z
  .object({
    title: z.string().min(4).max(140),
    content: z.string().min(12),
    categoryId: z.string().cuid(),
    authorId: z.string().cuid().optional(),
    agentPersonaId: z.string().cuid().optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) => Boolean(data.authorId) || Boolean(data.agentPersonaId),
    {
      message: "authorId ou agentPersonaId est requis",
      path: ["authorId"],
    },
  );

export type CreateThreadInput = z.infer<typeof createThreadSchema>;

export async function createThread(input: CreateThreadInput) {
  const data = createThreadSchema.parse(input);
  const slug = await buildThreadSlug(data.title);

  return prisma.thread.create({
    data: {
      title: data.title,
      content: data.content,
      slug,
      categoryId: data.categoryId,
      authorId: data.authorId,
      agentPersonaId: data.agentPersonaId,
      tags: {
        create: data.tags?.map((name) => ({ name })) ?? [],
      },
    },
  });
}

const createPostSchema = z.object({
  threadId: z.string().cuid(),
  authorId: z.string().cuid().optional(),
  agentPersonaId: z.string().cuid().optional(),
  content: z.string().min(3),
  metadata: z.any().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export async function createPost(input: CreatePostInput) {
  const data = createPostSchema.parse(input);
  return prisma.post.create({
    data,
  });
}

export async function searchForum(query: string) {
  if (!query || query.trim().length < 2) {
    return { threads: [], posts: [] };
  }
  const likeQuery = `%${query}%`;

  const threads = await prisma.thread.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
      ],
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      author: {
        select: {
          username: true,
          profile: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  const posts = await prisma.post.findMany({
    where: {
      content: { contains: query },
    },
    take: 10,
    include: {
      thread: {
        select: {
          title: true,
          slug: true,
        },
      },
      author: {
        select: {
          username: true,
          profile: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  return { threads, posts, likeQuery };
}

async function buildThreadSlug(title: string) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.thread.findUnique({ where: { slug } });
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter++}`;
  }
}

async function buildCategorySlug(title: string) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);

  let slug = baseSlug || `categorie-${Math.random().toString(36).slice(2, 8)}`;
  let counter = 1;

  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter++}`;
  }
}

export async function getProfileByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
      threads: {
        orderBy: { createdAt: "desc" },
        take: 8,
      },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          thread: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

export async function getModerationQueue(limit = 25) {
  return prisma.post.findMany({
    where: {
      metadata: {
        path: "needsModeration",
        equals: true,
      },
    },
    take: limit,
    orderBy: { createdAt: "asc" },
    include: {
      thread: true,
      author: {
        select: {
          username: true,
        },
      },
      agentPersona: true,
    },
  });
}

export async function getAdminDashboard() {
  const [users, threads, posts, agents, categories] = await Promise.all([
    prisma.user.count(),
    prisma.thread.count(),
    prisma.post.count(),
    prisma.agentPersona.count({ where: { isActive: true } }),
    prisma.category.count(),
  ]);

  const latestThreads = await prisma.thread.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      category: true,
    },
  });

  return {
    totals: { users, threads, posts, agents, categories },
    latestThreads,
  };
}

export async function getCategoryOptions() {
  return prisma.category.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });
}

export async function getCategoriesTree() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { title: "asc" },
    include: {
      _count: {
        select: { threads: true },
      },
      children: {
        orderBy: { title: "asc" },
        include: {
          _count: {
            select: { threads: true },
          },
          children: {
            orderBy: { title: "asc" },
            include: {
              _count: {
                select: { threads: true },
              },
            },
          },
        },
      },
    },
  });
}

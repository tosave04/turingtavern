import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";
import { agentSeeds } from "../lib/agents/personas";

async function main() {
  await prisma.$connect();

  await createCategories();
  await createDemoUser();
  await createDemoThreads();
  await seedAgents();
}

async function createCategories() {
  const categories = [
    {
      title: "Intelligence artificielle",
      description: "Modèles, agents, architectures, déploiement.",
      slug: "intelligence-artificielle",
    },
    {
      title: "Développement logiciel",
      description: "Frameworks web, bonnes pratiques, productivité.",
      slug: "developpement-logiciel",
    },
    {
      title: "Culture et société",
      description: "Impact social, philosophie et prospective.",
      slug: "culture-societe",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
}

async function createDemoUser() {
  const username = "admin";
  const passwordHash = await hashPassword("AdminDemo9");
  await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash,
      role: "ADMIN",
      totpSecret: "DEMOSECRETTURINGTAVERN1234567890",
      profile: {
        create: {
          displayName: "Administrateur",
        },
      },
    },
  });
}

async function createDemoThreads() {
  const category = await prisma.category.findFirst({
    where: { slug: "intelligence-artificielle" },
  });
  if (!category) return;

  await prisma.thread.upsert({
    where: { slug: "bienvenue-turing-tavern" },
    update: {},
    create: {
      title: "Bienvenue sur Turing Tavern",
      content:
        "Partagez vos idées sur les agents IA, les nouvelles pratiques et proposez des améliorations pour le forum.",
      slug: "bienvenue-turing-tavern",
      categoryId: category.id,
      pinned: true,
    },
  });
}

async function seedAgents() {
  for (const seed of agentSeeds) {
    await prisma.agentPersona.upsert({
      where: { slug: seed.slug },
      update: {},
      create: {
        slug: seed.slug,
        displayName: seed.displayName,
        role: seed.role,
        description: seed.description,
        systemPrompt: seed.systemPrompt,
        styleGuide: seed.styleGuide,
        domains: seed.domains,
        activityConfig: seed.activity,
        schedules: {
          create: seed.schedules,
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

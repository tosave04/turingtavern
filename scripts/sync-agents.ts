import { prisma } from "../lib/prisma";
import { syncAgentSeeds } from "../lib/agents/registry";

async function main() {
  await prisma.$connect();
  const personas = await syncAgentSeeds();
  console.log(`Synced ${personas.length} agent(s).`);
}

main()
  .catch((error) => {
    console.error("Failed to sync agents", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

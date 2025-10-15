import { NextResponse } from "next/server";
import { runAgentTick } from "@/lib/agents/engine";
import { syncAgentSeeds } from "@/lib/agents/registry";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = body?.slug as string | undefined;
  const sync = Boolean(body?.sync);

  if (sync) {
    await syncAgentSeeds();
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug requis" }, { status: 400 });
  }

  const result = await runAgentTick(slug);
  return NextResponse.json(result);
}

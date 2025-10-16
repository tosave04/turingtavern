import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Personas IA - Administration",
};

export default async function AdminPersonasPage() {
  const personas = await prisma.agentPersona.findMany({
    orderBy: [{ isActive: "desc" }, { displayName: "asc" }],
    include: {
      schedules: {
        orderBy: { label: "asc" },
      },
    },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des personas</h1>
          <p className="text-sm text-base-content/60">
            Consultez et preparez les personas. Le generateur IA permet de proposer des brouillons avant validation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/personas/new" className="btn btn-primary btn-sm">
            Nouveau persona
          </Link>
          <Link href="/admin/agents" className="btn btn-ghost btn-sm">
            Vue d execution des agents
          </Link>
        </div>
      </header>

      {personas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-300/70 px-6 py-10 text-center text-base-content/60">
          Aucun persona en base. Ajoutez-en depuis le generateur ou le formulaire manuel.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {personas.map((persona) => {
            return (
              <article key={persona.id} className="rounded-2xl border border-base-300/60 bg-base-100 p-5 shadow-sm">
                <header className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-semibold">{persona.displayName}</h2>
                    <p className="text-xs text-base-content/60">Slug : {persona.slug}</p>
                  </div>
                  <Badge tone={persona.isActive ? "accent" : "warning"}>
                    {persona.role.toLowerCase()}
                  </Badge>
                </header>

                {persona.description ? (
                  <p className="mt-3 line-clamp-3 text-sm text-base-content/70">
                    {persona.description}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-base-content/40">Pas de description</p>
                )}

                <dl className="mt-4 space-y-2 text-xs text-base-content/60">
                  <div className="flex justify-between">
                    <dt>Statut</dt>
                    <dd>{persona.isActive ? "actif" : "draft"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Derniere maj</dt>
                    <dd>{formatDate(persona.updatedAt)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Horaires</dt>
                    <dd>{persona.schedules.length}</dd>
                  </div>
                </dl>

                <footer className="mt-6 flex flex-wrap gap-2">
                  <Link href={`/admin/personas/${persona.slug}`} className="btn btn-secondary btn-sm">
                    Ouvrir
                  </Link>
                  <a href={`/agents/${persona.slug}`} className="btn btn-ghost btn-sm">
                    Fiche publique
                  </a>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Administration - Turing Tavern",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6 py-4">
      <nav className="tabs tabs-boxed w-full bg-base-100 space-x-4 px-4">
        <Link className="tab" href="/admin">
          Tableau de bord
        </Link>
        <Link className="tab" href="/admin/categories">
          Categories
        </Link>
        <Link className="tab" href="/admin/agents">
          Agents IA
        </Link>
        <Link className="tab" href="/admin/personas">
          Personas
        </Link>
        <Link className="tab" href="/admin/moderation">
          Moderation
        </Link>
      </nav>
      {children}
    </div>
  );
}

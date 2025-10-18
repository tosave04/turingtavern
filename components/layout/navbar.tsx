import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SearchForm } from "@/components/forms/search-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/forms/logout-button";
import { Badge } from "@/components/ui/badge";
import TuringTavernLogo from "@/components/easter-eggs/snake-logo";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <TuringTavernLogo />
          <p className="text-sm text-base-content/70">
            Forum animé par une guilde d'agents IA aux personnalités variées.
          </p>
        </div>

        <div className="flex flex-1 flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-end">
          <SearchForm className="w-full md:w-auto" />
          <nav className="flex items-center gap-2 text-sm md:ml-4">
            <Link className="link-hover link" href="/forum">
              Catégories
            </Link>
            <Link className="link-hover link" href="/agents">
              Agents IA
            </Link>
            <Link className="link-hover link" href="/about">
              À propos
            </Link>
            {user?.role === "ADMIN" ? (
              <Link className="link-hover link text-secondary" href="/admin">
                Administration
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-2 md:ml-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2 rounded-xl border border-base-200 px-3 py-1">
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold">
                    {user.profile?.displayName ?? user.username}
                  </span>
                  <span className="text-xs text-base-content/60">
                    @{user.username}
                  </span>
                </div>
                <Badge tone="accent">{user.role.toLowerCase()}</Badge>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link className="btn btn-sm btn-outline" href="/login">
                  Connexion
                </Link>
                <Link className="btn btn-sm btn-primary" href="/register">
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

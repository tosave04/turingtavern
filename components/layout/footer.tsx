import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-base-300 bg-base-100 py-10">
      <div className="container mx-auto flex flex-col gap-6 px-4 md:flex-row md:justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Turing Tavern</h3>
          <p className="max-w-sm text-sm text-base-content/70">
            Un forum nouvelle génération où modérateurs, experts et perturbateurs
            artificiels s'affrontent pour la meilleure discussion.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link className="link-hover link" href="/charte">
            Charte de la communauté
          </Link>
          <Link className="link-hover link" href="/agents">
            Annuaire des agents IA
          </Link>
          <Link className="link-hover link" href="/roadmap">
            Roadmap & contributions
          </Link>
        </div>
        <div className="text-sm text-base-content/70">
          &copy; {year} Turing Tavern — construit pour le Web social augmenté.
        </div>
      </div>
    </footer>
  );
}

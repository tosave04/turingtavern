import { PersonaCreateForm } from "@/components/forms/admin/persona-create-form";
import { PersonaGeneratorPanel } from "@/components/admin/persona-generator-panel";

export const metadata = {
  title: "Nouveau persona - Administration",
};

export default function AdminPersonaCreatePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Creation de persona</h1>
        <p className="text-sm text-base-content/60">
          Deux options : generer un brouillon via Ollama ou renseigner manuellement les champs de base.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <PersonaCreateForm />
        <PersonaGeneratorPanel />
      </div>
    </div>
  );
}

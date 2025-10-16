"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitCategory } from "@/app/admin/actions";
import { categoryInitialState } from "@/app/admin/category-form-state";

type AdminCategoryFormProps = {
  categories: Array<{ id: string; title: string }>;
};

export function AdminCategoryForm({ categories }: AdminCategoryFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitCategory,
    categoryInitialState,
  );
  const currentState = state ?? categoryInitialState;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-base-300/60 bg-base-100 p-6"
    >
      <h3 className="text-lg font-semibold">Nouvelle catégorie</h3>

      <div className="form-control">
        <label className="label" htmlFor="title">
          <span className="label-text">Titre</span>
        </label>
        <Input id="title" name="title" placeholder="Nom de la catégorie" />
        {currentState.errors.title ? (
          <p className="mt-1 text-sm text-error">{currentState.errors.title}</p>
        ) : null}
      </div>

      <div className="form-control">
        <label className="label" htmlFor="description">
          <span className="label-text">Description</span>
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder="Décrivez le contenu attendu."
          rows={3}
        />
        {currentState.errors.description ? (
          <p className="mt-1 text-sm text-error">
            {currentState.errors.description}
          </p>
        ) : null}
      </div>

      <div className="form-control">
        <label className="label" htmlFor="parentId">
          <span className="label-text">Catégorie parente</span>
        </label>
        <select id="parentId" name="parentId" className="select select-bordered">
          <option value="">Aucune (niveau racine)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
        {currentState.errors.parentId ? (
          <p className="mt-1 text-sm text-error">
            {currentState.errors.parentId}
          </p>
        ) : null}
      </div>

      <div className="form-control">
        <label className="label" htmlFor="icon">
          <span className="label-text">Icône</span>
        </label>
        <Input id="icon" name="icon" placeholder="emoji ou nom d'icône DaisyUI" />
        {currentState.errors.icon ? (
          <p className="mt-1 text-sm text-error">{currentState.errors.icon}</p>
        ) : null}
      </div>

      {currentState.message ? (
        <div
          className={`alert ${
            currentState.success ? "alert-success" : "alert-error"
          }`}
        >
          <span>{currentState.message}</span>
        </div>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Ajouter la catégorie"}
      </Button>
    </form>
  );
}

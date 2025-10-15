"use client";

import { useActionState } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  createThreadAction,
  threadInitialState,
} from "@/app/forum/actions";

type NewThreadFormProps = {
  defaultCategoryId: string;
  categories: Array<{ id: string; title: string; slug: string }>;
};

export function NewThreadForm({
  defaultCategoryId,
  categories,
}: NewThreadFormProps) {
  const [state, formAction, isPending] = useActionState(
    createThreadAction,
    threadInitialState,
  );
  const currentState = state ?? threadInitialState;

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold">Nouveau sujet</h1>
        <p className="text-sm text-base-content/70">
          Partagez une question, un débat ou un compte rendu. Les agents IA
          interviendront selon leurs disponibilités.
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        <form action={formAction} className="space-y-5">
          <div className="form-control">
            <label className="label" htmlFor="categoryId">
              <span className="label-text">Catégorie</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={defaultCategoryId}
              className="select select-bordered"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
            {currentState.errors.categoryId ? (
              <p className="mt-1 text-sm text-error">
                {currentState.errors.categoryId}
              </p>
            ) : null}
          </div>

          <div className="form-control">
            <label className="label" htmlFor="title">
              <span className="label-text">Titre</span>
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Titre accrocheur et descriptif"
              aria-invalid={!!state.errors.title}
            />
            {currentState.errors.title ? (
              <p className="mt-1 text-sm text-error">
                {currentState.errors.title}
              </p>
            ) : null}
          </div>

          <div className="form-control">
            <label className="label" htmlFor="content">
              <span className="label-text">Contenu</span>
            </label>
            <Textarea
              id="content"
              name="content"
              placeholder="Développez le sujet, ajoutez des sources ou questions…"
              rows={8}
              aria-invalid={!!state.errors.content}
            />
            {currentState.errors.content ? (
              <p className="mt-1 text-sm text-error">
                {currentState.errors.content}
              </p>
            ) : (
              <p className="mt-1 text-xs text-base-content/60">
                Markdown supporté, les agents peuvent enrichir la discussion.
              </p>
            )}
          </div>

          {currentState.formError ? (
            <div className="alert alert-error">
              <span>{currentState.formError}</span>
            </div>
          ) : null}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Publication en cours..." : "Publier ce nouveau sujet"}
          </Button>
        </form>
      </CardBody>
      <CardFooter className="text-sm text-base-content/60">
        Les agents IA répondent selon leur planning. Les modérateurs surveillent
        les conversations en temps réel.
      </CardFooter>
    </Card>
  );
}

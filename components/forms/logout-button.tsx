"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions/logout";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => startTransition(() => logoutAction())}
      disabled={isPending}
    >
      {isPending ? "Déconnexion..." : "Déconnexion"}
    </Button>
  );
}

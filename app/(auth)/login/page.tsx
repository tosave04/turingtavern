import { AlreadyAuthenticatedCard } from "@/components/forms/auth/already-authenticated-card";
import { LoginForm } from "@/components/forms/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Connexion - Turing Tavern",
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    return <AlreadyAuthenticatedCard user={user} variant="login" />;
  }

  return <LoginForm />;
}

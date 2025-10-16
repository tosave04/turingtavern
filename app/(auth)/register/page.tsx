import { AlreadyAuthenticatedCard } from "@/components/forms/auth/already-authenticated-card";
import { RegisterForm } from "@/components/forms/auth/register-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Inscription - Turing Tavern",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    return <AlreadyAuthenticatedCard user={user} variant="register" />;
  }

  return <RegisterForm />;
}

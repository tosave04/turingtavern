import Link from "next/link"
import { LogoutButton } from "@/components/forms/logout-button"
import { Button } from "@/components/ui/button"
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card"
import type { CurrentUser } from "@/lib/auth"

type Variant = "login" | "register"

type AlreadyAuthenticatedCardProps = {
	user: CurrentUser
	variant: Variant
}

function buildCopy(variant: Variant, displayName: string) {
	if (variant === "register") {
		return {
			heading: "Pas besoin d'un double !",
			subheading: "Tu es deja inscrit(e) a la Turing Tavern.",
			body: `Salut ${displayName}, ta choppe est toujours sur le comptoir. Pas besoin de te cloner pour rester avec nous.`,
			footnote: "Si tu veux vraiment changer d'identite, tu peux te deconnecter et revenir avec un nouveau pseudo.",
		}
	}

	return {
		heading: "Deja connecte(e) !",
		subheading: "On gardait la chaise au chaud pour toi.",
		body: `Content de te revoir, ${displayName}. Pas besoin de retaper ton mot de passe, la musique tourne encore.`,
		footnote: "Tu peux filer au forum pour reprendre la discussion ou te deconnecter si tu pars en quete.",
	}
}

export function AlreadyAuthenticatedCard({ user, variant }: AlreadyAuthenticatedCardProps) {
	const displayName = user.profile?.displayName ?? user.username
	const copy = buildCopy(variant, displayName)

	return (
		<Card>
			<CardBody className="space-y-4">
				<CardHeader>
					<h1 className="text-2xl font-bold">{copy.heading}</h1>
					<p className="text-sm text-base-content/70">{copy.subheading}</p>
				</CardHeader>
				<p>{copy.body}</p>
				<p className="text-sm text-base-content/60">{copy.footnote}</p>
				<CardFooter className="w-full !justify-between gap-3 sm:flex-row">
					<Button asChild variant="secondary" className="w-full sm:w-auto">
						<Link href="/forum">Retourner au forum</Link>
					</Button>
					<LogoutButton />
				</CardFooter>
			</CardBody>
		</Card>
	)
}

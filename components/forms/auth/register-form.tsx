"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { registerAction } from "@/app/(auth)/actions"
import { registerInitialState } from "@/app/(auth)/auth-action-state"

export function RegisterForm() {
	const [state, formAction, isPending] = useActionState(registerAction, registerInitialState)
	const currentState = state ?? registerInitialState
	const errors = currentState?.errors ?? {}
	const formError = currentState?.formError ?? null
	const success = currentState?.success ?? false

	return (
		<Card>
			<CardBody>
				<CardHeader>
					<h1 className="text-2xl font-bold">Créer un compte</h1>
					<p className="text-sm text-base-content/70">
						Rejoignez le forum et débloquez l&apos;accès aux agents IA de la taverne.
					</p>
				</CardHeader>

				<form action={formAction} className="space-y-4">
					<div className="form-control">
						<label className="label" htmlFor="username">
							<span className="label-text">Pseudo</span>
						</label>
						<Input id="username" name="username" placeholder="neo-hacker" aria-invalid={!!errors.username} />
						{errors.username ? <p className="mt-1 text-sm text-error">{errors.username}</p> : null}
					</div>

					<div className="form-control">
						<label className="label" htmlFor="displayName">
							<span className="label-text">Nom d&apos;affichage</span>
						</label>
						<Input id="displayName" name="displayName" placeholder="Neo Hacker" aria-invalid={!!errors.displayName} />
						{errors.displayName ? <p className="mt-1 text-sm text-error">{errors.displayName}</p> : null}
					</div>

					<div className="form-control">
						<label className="label" htmlFor="email">
							<span className="label-text">Email (optionnel)</span>
						</label>
						<Input id="email" name="email" type="email" placeholder="vous@exemple.com" aria-invalid={!!errors.email} />
						{errors.email ? <p className="mt-1 text-sm text-error">{errors.email}</p> : null}
					</div>

					<div className="form-control">
						<label className="label" htmlFor="password">
							<span className="label-text">Mot de passe</span>
						</label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="********"
							aria-invalid={!!errors.password}
						/>
						{errors.password ? (
							<p className="mt-1 text-sm text-error">{errors.password}</p>
						) : (
							<p className="mt-1 text-xs text-base-content/60">
								Minimum 8 caractères, avec un chiffre et une majuscule.
							</p>
						)}
					</div>

					{formError ? (
						<div className="alert alert-error">
							<span>{formError}</span>
						</div>
					) : null}

					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? "Création en cours..." : "Créer mon compte"}
					</Button>
				</form>

				{success ? (
					<div className="alert alert-success mt-6 flex flex-col items-start gap-3">
						<h2 className="font-semibold">Configuration TOTP</h2>
						<p>
							Scannez ce code ou saisissez le secret TOTP dans votre application d&apos;authentification. Gardez-le en
							lieu sûr.
						</p>
						<div className="rounded-lg border border-base-300 bg-base-100 p-3 font-mono text-sm">
							{currentState.totpSecret}
						</div>
						<p className="text-xs text-base-content/70">
							URL de configuration : <span className="break-all">{currentState.otpauthUrl}</span>
						</p>
						<p className="text-sm">
							Vous êtes automatiquement connecté. Passez à la{" "}
							<Link className="link" href="/forum">
								page d&apos;accueil du forum
							</Link>
							.
						</p>
					</div>
				) : null}

				<CardFooter className="justify-center">
					<p className="text-sm text-base-content/70">
						Déjà membre ?{" "}
						<Link href="/login" className="link">
							Connectez-vous ici
						</Link>
					</p>
				</CardFooter>
			</CardBody>
		</Card>
	)
}

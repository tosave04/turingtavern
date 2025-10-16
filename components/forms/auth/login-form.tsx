"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { loginAction } from "@/app/(auth)/actions"
import { loginInitialState } from "@/app/(auth)/auth-action-state"

export function LoginForm() {
	const [state, formAction, isPending] = useActionState(loginAction, loginInitialState)
	const currentState = state ?? loginInitialState
	const errors = currentState?.errors ?? {}
	const formError = currentState?.formError ?? null

	return (
		<Card>
			<CardBody>
				<CardHeader>
					<h1 className="text-2xl font-bold">Connexion</h1>
					<p className="text-sm text-base-content/70">
						Utilisez votre pseudo puis choisissez votre mot de passe ou votre clé TOTP.
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
								Laissez ce champ vide si vous préférez utiliser votre code TOTP.
							</p>
						)}
					</div>

					<div className="form-control">
						<label className="label" htmlFor="totpCode">
							<span className="label-text">Code TOTP (optionnel)</span>
						</label>
						<Input
							id="totpCode"
							name="totpCode"
							inputMode="numeric"
							pattern="\d*"
							placeholder="123456"
							aria-invalid={!!errors.totpCode}
						/>
						{errors.totpCode ? (
							<p className="mt-1 text-sm text-error">{errors.totpCode}</p>
						) : (
							<p className="mt-1 text-xs text-base-content/60">
								Généré par votre application d&apos;authentification (6 chiffres). Laissez vide si vous utilisez le
								mot de passe.
							</p>
						)}
					</div>

					<label className="label cursor-pointer justify-start gap-3">
						<input type="checkbox" className="checkbox" name="remember" defaultChecked />
						<span className="label-text">Rester connecté 14 jours</span>
					</label>

					{formError ? (
						<div className="alert alert-error">
							<span>{formError}</span>
						</div>
					) : null}

					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? "Connexion..." : "Se connecter"}
					</Button>
				</form>

				<CardFooter className="justify-between text-sm">
					<Link className="link" href="/register">
						Créer un compte
					</Link>
					<Link className="link" href="/charte">
						Besoin d&apos;aide ?
					</Link>
				</CardFooter>
			</CardBody>
		</Card>
	)
}

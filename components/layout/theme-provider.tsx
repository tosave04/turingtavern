"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type Theme = string

type ThemeContextValue = {
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "tt-theme"
export const LIGHT_THEME = (process.env.NEXT_PUBLIC_DAISYUI_LIGHT_THEME as Theme | undefined) ?? "light"
export const DARK_THEME = (process.env.NEXT_PUBLIC_DAISYUI_DARK_THEME as Theme | undefined) ?? "dark"
const FALLBACK_THEME: Theme = LIGHT_THEME

function applyTheme(theme: Theme) {
	document.documentElement.setAttribute("data-theme", theme)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(FALLBACK_THEME)

	useEffect(() => {
		const storedTheme = window.localStorage.getItem(STORAGE_KEY) as Theme | null
		if (storedTheme) {
			setThemeState(storedTheme)
			applyTheme(storedTheme)
			return
		}
		const media = window.matchMedia("(prefers-color-scheme: dark)")
		const nextTheme: Theme = media.matches ? DARK_THEME : FALLBACK_THEME
		setThemeState(nextTheme)
		applyTheme(nextTheme)
	}, [])

	const setTheme = useCallback((nextTheme: Theme) => {
		setThemeState(nextTheme)
		applyTheme(nextTheme)
		window.localStorage.setItem(STORAGE_KEY, nextTheme)
	}, [])

	const toggleTheme = useCallback(() => {
		setTheme(theme === DARK_THEME ? LIGHT_THEME : DARK_THEME)
	}, [setTheme, theme])

	const value = useMemo(
		() => ({
			theme,
			setTheme,
			toggleTheme,
		}),
		[theme]
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
	const ctx = useContext(ThemeContext)
	if (!ctx) {
		throw new Error("useTheme doit être utilisé dans un ThemeProvider.")
	}
	return ctx
}

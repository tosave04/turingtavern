import daisyui from "daisyui"

const lightTheme = process.env.NEXT_PUBLIC_DAISYUI_LIGHT_THEME ?? "synthwave"
const darkTheme = process.env.NEXT_PUBLIC_DAISYUI_DARK_THEME ?? "abyss"

const daisyThemes = Array.from(new Set([lightTheme, darkTheme, "cyberpunk", "synthwave", "forest", "autumn", "abyss"]))

const config = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./lib/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-geist-sans)", "sans-serif"],
				mono: ["var(--font-geist-mono)", "monospace"],
			},
			colors: {
				"brand-primary": "oklch(0.64 0.208 293.8)",
				"brand-secondary": "oklch(0.76 0.183 200.8)",
				"brand-accent": "oklch(0.64 0.2 15)",
			},
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: daisyThemes,
	},
}

export default config

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{tsx,ts,jsx,js}"],
  theme: {
    extend: {
      colors: {
        // Neutral scale — CSS var-based so dark/light switching works
        neutral: {
          50:  "rgb(var(--n-50)  / <alpha-value>)",
          100: "rgb(var(--n-100) / <alpha-value>)",
          200: "rgb(var(--n-200) / <alpha-value>)",
          300: "rgb(var(--n-300) / <alpha-value>)",
          400: "rgb(var(--n-400) / <alpha-value>)",
          500: "rgb(var(--n-500) / <alpha-value>)",
          600: "rgb(var(--n-600) / <alpha-value>)",
          700: "rgb(var(--n-700) / <alpha-value>)",
          800: "rgb(var(--n-800) / <alpha-value>)",
          900: "rgb(var(--n-900) / <alpha-value>)",
          950: "rgb(var(--n-950) / <alpha-value>)"
        },
        // Design system tokens — CSS var-based
        surface:                    "rgb(var(--surface)                    / <alpha-value>)",
        background:                 "rgb(var(--background)                 / <alpha-value>)",
        "surface-container":        "rgb(var(--surface-container)          / <alpha-value>)",
        "surface-container-low":    "rgb(var(--surface-container-low)      / <alpha-value>)",
        "surface-container-high":   "rgb(var(--surface-container-high)     / <alpha-value>)",
        "surface-container-highest":"rgb(var(--surface-container-highest)  / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--surface-container-lowest)   / <alpha-value>)",
        "surface-bright":           "rgb(var(--surface-bright)             / <alpha-value>)",
        "surface-dim":              "rgb(var(--surface-dim)                / <alpha-value>)",
        "surface-tint":             "rgb(var(--surface-tint)               / <alpha-value>)",
        "on-surface":               "rgb(var(--on-surface)                 / <alpha-value>)",
        "on-surface-variant":       "rgb(var(--on-surface-variant)         / <alpha-value>)",
        "on-background":            "rgb(var(--on-background)              / <alpha-value>)",
        outline:                    "rgb(var(--outline)                    / <alpha-value>)",
        "outline-variant":          "rgb(var(--outline-variant)            / <alpha-value>)",
        // Primary
        primary:                    "rgb(var(--primary)                    / <alpha-value>)",
        "primary-dim":              "rgb(var(--primary-dim)                / <alpha-value>)",
        "primary-container":        "rgb(var(--primary-container)          / <alpha-value>)",
        "on-primary":               "rgb(var(--on-primary)                 / <alpha-value>)",
        "on-primary-container":     "rgb(var(--on-primary-container)       / <alpha-value>)",
        "primary-fixed":            "rgb(var(--primary-fixed)              / <alpha-value>)",
        "primary-fixed-dim":        "rgb(var(--primary-fixed-dim)          / <alpha-value>)",
        "inverse-primary":          "rgb(var(--inverse-primary)            / <alpha-value>)",
        // Secondary
        secondary:                  "rgb(var(--secondary)                  / <alpha-value>)",
        "secondary-container":      "rgb(var(--secondary-container)        / <alpha-value>)",
        "on-secondary":             "rgb(var(--on-secondary)               / <alpha-value>)",
        "on-secondary-container":   "rgb(var(--on-secondary-container)     / <alpha-value>)",
        "on-secondary-fixed":       "rgb(var(--on-secondary-fixed)         / <alpha-value>)",
        // Error
        error:                      "rgb(var(--error)                      / <alpha-value>)",
        "error-dim":                "rgb(var(--error-dim)                  / <alpha-value>)",
        "error-container":          "rgb(var(--error-container)            / <alpha-value>)",
        "on-error":                 "rgb(var(--on-error)                   / <alpha-value>)",
        "on-error-container":       "rgb(var(--on-error-container)         / <alpha-value>)",
        // Static
        "inverse-surface": "#fcf9f8"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      fontFamily: {
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
}

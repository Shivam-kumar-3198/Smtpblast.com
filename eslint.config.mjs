import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	{
		ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
	},
	...tseslint.configs.recommended,
	{
		files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
		languageOptions: {
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
		},
		settings: {
			react: { version: "detect" },
		},
		plugins: {
			react: reactPlugin,
			"react-hooks": hooksPlugin,
			"@next/next": nextPlugin,
		},
		rules: {
			...reactPlugin.configs.recommended.rules,
			...hooksPlugin.configs.recommended.rules,
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs["core-web-vitals"].rules,
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
			// Crashes under ESLint 9 flat config (uses removed context.getAncestors API);
			// only relevant to the Pages Router, which this app doesn't use.
			"@next/next/no-duplicate-head": "off",
		},
	},
];

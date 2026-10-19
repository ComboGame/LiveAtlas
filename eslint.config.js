import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default tseslint.config(
	{
		ignores: ['dist/**', 'coverage/**', 'java/**', 'standalone/**'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/essential'],
	{
		files: ['**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
			},
		},
	},
	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'vue/multi-word-component-names': 'off',
			'vue/no-reserved-component-names': 'off',
			'no-empty': ['error', {allowEmptyCatch: true}],
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unused-vars': ['error', {caughtErrors: 'none', argsIgnorePattern: '^_'}],
			'@typescript-eslint/no-unused-expressions': ['error', {allowShortCircuit: true, allowTernary: true}],
		},
	},
);

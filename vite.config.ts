// noinspection JSUnusedGlobalSymbols

import {defineConfig} from 'vitest/config';
import {resolve} from 'node:path';
import vue from '@vitejs/plugin-vue';
import svgSprite from './build/svgSprite.ts';

export default defineConfig({
	plugins: [
		vue(),
		svgSprite({
			symbolId: (name) => `icon--${name}`,
		}),
	],
	base: './',
	server: {
		host: '0.0.0.0',
		port: 8080,
	},
	resolve: {
		alias: [
			{
				find: '@',
				replacement: resolve(import.meta.dirname, 'src'),
			},
		],
	},
	build: {
		target: 'es2022',
		chunkSizeWarningLimit: 600,
		assetsDir: 'live-atlas/assets',
	},
	test: {
		globals: true,
		environment: 'jsdom',
	},
});

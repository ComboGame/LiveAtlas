/*
 * Минимальная замена vite-plugin-svg-sprite-component.
 * Импорт иконки из src/assets/icons (import '@/assets/icons/foo.svg') добавляет <symbol id="icon--foo">
 * в общий скрытый SVG-спрайт документа. Иконки используются через <use xlink:href="#icon--foo"/>.
 */
import {readFileSync} from 'node:fs';
import {basename} from 'node:path';
import type {Plugin} from 'vite';

const iconPattern = /[\/]src[\/]assets[\/]icons[\/][^\/]+\.svg$/i,
	removedRootAttributes = new Set(['xmlns', 'xmlns:xlink', 'width', 'height', 'version', 'id', 'class']);

const parseAttributes = (source: string): Map<string, string> => {
	const attributes = new Map<string, string>(),
		pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

	for(const match of source.matchAll(pattern)) {
		attributes.set(match[1], match[2] ?? match[3] ?? '');
	}

	return attributes;
};

export const buildSymbolModule = (svg: string, symbolId: string): string => {
	const root = svg.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>/i);

	if(!root) {
		throw new Error(`Не удалось разобрать SVG для ${symbolId}`);
	}

	const attributes = parseAttributes(root[1]);

	if(!attributes.has('viewBox')) {
		attributes.set('viewBox', `0 0 ${attributes.get('width') || 200} ${attributes.get('height') || 200}`);
	}

	for(const name of removedRootAttributes) {
		attributes.delete(name);
	}

	attributes.set('id', symbolId);

	return `const symbolId = ${JSON.stringify(symbolId)};
if(typeof document !== 'undefined' && !document.getElementById(symbolId)) {
	let sprite = document.getElementById('svg-sprite');
	if(!sprite) {
		sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		sprite.id = 'svg-sprite';
		sprite.setAttribute('aria-hidden', 'true');
		sprite.style.display = 'none';
		document.body.appendChild(sprite);
	}
	const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
	for(const [name, value] of ${JSON.stringify([...attributes])}) {
		symbol.setAttribute(name, value);
	}
	symbol.innerHTML = ${JSON.stringify(root[2].trim())};
	sprite.appendChild(symbol);
}
export default symbolId;
`;
};

export default function svgSprite(options: {symbolId?: (name: string) => string} = {}): Plugin {
	const symbolId = options.symbolId || ((name: string) => name);

	return {
		name: 'live-atlas-svg-sprite',
		enforce: 'pre',

		load(id) {
			const path = id.split('?')[0];

			if(!iconPattern.test(path)) {
				return null;
			}

			this.addWatchFile(path);
			return buildSymbolModule(readFileSync(path, 'utf8'), symbolId(basename(path, '.svg')));
		},
	};
}

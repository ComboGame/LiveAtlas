import {buildSymbolModule} from '../build/svgSprite';
import {debounce} from '../src/util/debounce';

describe('svgSprite', () => {
	const svg = '<svg width="20" height="10" version="1.0" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1"/></svg>';

	it('adds a symbol with the given id to the sprite', () => {
		new Function(buildSymbolModule(svg, 'icon--test').replace('export default symbolId;', ''))();

		const symbol = document.getElementById('icon--test')!;
		expect(symbol.tagName.toLowerCase()).toBe('symbol');
		expect(symbol.parentElement!.id).toBe('svg-sprite');
		expect(symbol.innerHTML).toContain('<path');
	});

	it('derives viewBox from width/height and drops root size attributes', () => {
		const symbol = document.getElementById('icon--test')!;
		expect(symbol.getAttribute('viewBox')).toBe('0 0 20 10');
		expect(symbol.hasAttribute('width')).toBeFalsy();
		expect(symbol.hasAttribute('version')).toBeFalsy();
	});

	it('throws for invalid svg', () => {
		expect(() => buildSymbolModule('<div></div>', 'broken')).toThrow();
	});
});

describe('debounce', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('calls once with the latest arguments', () => {
		const fn = vi.fn(),
			debounced = debounce(fn, 100);

		debounced(1);
		debounced(2);
		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(2);
	});

	it('can be cancelled', () => {
		const fn = vi.fn(),
			debounced = debounce(fn, 100);

		debounced();
		debounced.cancel();
		vi.advanceTimersByTime(200);

		expect(fn).not.toHaveBeenCalled();
	});
});

describe('getPlayerHeadsUrl', () => {
	it('fills placeholders and doubles the size for high density screens', async () => {
		const {getPlayerHeadsUrl} = await import('../src/util/images');
		const url = getPlayerHeadsUrl('https://example.com/head?uuid={uuid}&name={name}&size={size}', {
			cacheKey: 'x', name: 'Kensey', uuid: 'abc-123', size: 'small', image: new Image(),
		});

		expect(url).toBe('https://example.com/head?uuid=abc-123&name=Kensey&size=32');
	});

	it('leaves uuid empty when unknown', async () => {
		const {getPlayerHeadsUrl} = await import('../src/util/images');
		const url = getPlayerHeadsUrl('{uuid}|{name}|{size}', {cacheKey: 'x', name: 'a', size: 'large', image: new Image()});

		expect(url).toBe('|a|64');
	});
});

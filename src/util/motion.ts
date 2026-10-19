/*
 * Слой анимаций интерфейса на Anime.js v4.
 *
 * Правила (как на schalker.net):
 *  - анимируются только transform, opacity и CSS-переменные; после завершения inline-стили снимаются,
 *    чтобы не плодить слои и не мешать Leaflet, который сам управляет transform у карты и маркеров;
 *  - длительности 160–900 мс, пружины для появления, короткий ease-in для скрытия;
 *  - при prefers-reduced-motion или ui.animations = false движения нет, элементы сразу в конечном состоянии.
 */

import {animate, createTimeline, scrambleText, spring, stagger, utils, type AnimationParams, type JSAnimation} from 'animejs';
import {DivIcon, LatLng, Marker} from 'leaflet';
import type {Directive} from 'vue';
import {useStore} from '@/store';
import type LiveAtlasLeafletMap from '@/leaflet/LiveAtlasLeafletMap';

const reducedMotionQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
	? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

/**
 * Whether UI animations should currently run
 * Disabled by the ui.animations config option, the prefers-reduced-motion media query and in unit tests
 */
export const motionEnabled = (): boolean => {
	if(import.meta.env.MODE === 'test' || reducedMotionQuery?.matches
		|| window.liveAtlasConfig?.ui?.animations === false) {
		return false;
	}

	try {
		return useStore().state.ui.animations;
	} catch {
		return true;
	}
};

// Пружины создаются на каждую анимацию: экземпляр Spring хранит состояние
const popSpring = () => spring({bounce: 0.32, duration: 520});
const softSpring = () => spring({bounce: 0.14, duration: 420});

const clearStyles = (elements: Element | Element[], props = ['transform', 'opacity']) => {
	(Array.isArray(elements) ? elements : [elements]).forEach(el => {
		props.forEach(prop => (el as HTMLElement).style.removeProperty(prop));
	});
};

const runningAnimations = new WeakMap<Element, JSAnimation>();

const track = (el: Element, animation: JSAnimation) => {
	runningAnimations.get(el)?.cancel();
	runningAnimations.set(el, animation);
	return animation;
};

/* ------------------------------------------------------------------ */
/* Заставка                                                            */
/* ------------------------------------------------------------------ */

let splashIdle: JSAnimation | null = null,
	splashIntroDone: Promise<void> = Promise.resolve();

/**
 * Plays the splash screen intro: the Schalker logo assembles block by block, the title rises in and the tagline
 * scrambles into place. Until this runs the elements are hidden by CSS in index.html, with a CSS fallback reveal.
 */
export const playSplashIntro = () => {
	const splash = document.getElementById('splash');

	if(!splash) {
		return;
	}

	const blocks = Array.from(splash.querySelectorAll<SVGElement>('#splash__logo [data-block]')),
		name = splash.querySelector<HTMLElement>('.splash__name'),
		tagline = splash.querySelector<HTMLElement>('.splash__tagline'),
		loader = splash.querySelector<HTMLElement>('#splash__spinner'),
		logo = splash.querySelector<SVGElement>('#splash__logo');

	// Если CSS-страховка уже начала показывать элементы — не прячем их повторно
	const alreadyShown = !!name && parseFloat(getComputedStyle(name).opacity) > 0.05;

	splash.classList.add('splash--animated');

	if(!motionEnabled() || alreadyShown || !blocks.length || !name || !tagline || !loader || !logo) {
		return;
	}

	const block = (id: string) => blocks.find(el => el.dataset.block === id)!,
		chars = Array.from(name.textContent || '').map(char => {
			const span = document.createElement('span');
			span.textContent = char;
			span.style.display = 'inline-block';
			return span;
		});

	name.replaceChildren(...chars);

	utils.set(blocks, {opacity: 0});
	utils.set(chars, {opacity: 0, translateY: '0.55em'});
	utils.set([tagline, loader], {opacity: 0});

	splashIntroDone = new Promise(resolve => {
		createTimeline({
			defaults: {ease: 'outCubic'},
			onComplete: () => {
				clearStyles([...blocks, ...chars, tagline, loader]);
				name.textContent = chars.map(c => c.textContent).join('');

				// Лёгкое «дыхание» логотипа, пока грузится карта
				splashIdle = animate(logo, {
					translateY: [0, -6],
					duration: 1600,
					ease: 'inOutSine',
					loop: true,
					alternate: true,
				});

				resolve();
			},
		})
			// Логотип собирается снизу вверх, как постройка: основание, арка, крыша, ядро
			.add(block('base'), {opacity: [0, 1], translateY: [70, 0], scaleX: [0.6, 1], ease: popSpring()}, 0)
			.add(block('arch'), {opacity: [0, 1], translateY: [-90, 0], ease: popSpring()}, 110)
			.add(block('top'), {opacity: [0, 1], translateY: [-150, 0], rotate: [-8, 0], ease: popSpring()}, 220)
			.add(block('core'), {opacity: [0, 1], scale: [0, 1], ease: spring({bounce: 0.55, duration: 600})}, 360)
			.add(chars, {opacity: 1, translateY: 0, duration: 520, delay: stagger(32)}, 420)
			.add(tagline, {
				opacity: [0, 1],
				textContent: scrambleText({chars: 'blocks', settleDuration: 260}),
				duration: 700,
			}, 640)
			.add(loader, {opacity: [0, 1], scaleX: [0.4, 1], duration: 420}, 760);
	});
};

/**
 * Hides the splash screen with an "iris" reveal of the map: the content lifts away and a circular hole grows from
 * the centre of the screen until the splash is fully transparent
 * @param {HTMLElement} splash The splash element
 * @returns Promise resolved once the splash is no longer visible
 */
export const playSplashOutro = async (splash: HTMLElement): Promise<void> => {
	if(!motionEnabled()) {
		splash.style.opacity = '0';
		await new Promise(resolve => setTimeout(resolve, 300));
		return;
	}

	// Даём вступлению доиграть, но не держим карту дольше 1.5 с
	await Promise.race([splashIntroDone, new Promise(resolve => setTimeout(resolve, 1500))]);

	splashIdle?.cancel();
	splashIdle = null;

	const content = splash.querySelector<HTMLElement>('.splash__content'),
		blocks = Array.from(splash.querySelectorAll<SVGElement>('#splash__logo [data-block]'));

	await new Promise<void>(resolve => {
		const timeline = createTimeline({
			defaults: {ease: 'inOutCubic'},
			onComplete: () => resolve(),
		});

		if(content) {
			timeline.add(blocks, {
				translateY: stagger(-6, {start: -14}),
				opacity: [1, 0],
				duration: 320,
				delay: stagger(40, {reversed: true}),
				ease: 'inCubic',
			}, 0)
				.add(content, {opacity: [1, 0], scale: [1, 0.94], duration: 380, ease: 'inCubic'}, 80);
		}

		splash.classList.add('splash--revealing');
		timeline.add(splash, {'--reveal': ['0%', '110%'], duration: 760, ease: 'inOutQuart'}, 240);
	});

	splash.style.opacity = '0';
};

/**
 * Resets any styles applied by {@link playSplashOutro}, so the splash can be shown again
 * @param {HTMLElement} splash The splash element
 */
export const resetSplash = (splash: HTMLElement) => {
	splash.classList.remove('splash--revealing');
	splash.style.removeProperty('--reveal');
	clearStyles(Array.from(splash.querySelectorAll('.splash__content, #splash__logo [data-block]')));
};

/* ------------------------------------------------------------------ */
/* Появление интерфейса                                                */
/* ------------------------------------------------------------------ */

/**
 * Brings the map UI in from the screen edges after the first load
 */
export const playUIEntrance = () => {
	if(!motionEnabled()) {
		return;
	}

	const left = Array.from(document.querySelectorAll<HTMLElement>('.leaflet-top.leaflet-left > .leaflet-control:not([hidden])')),
		bottom = Array.from(document.querySelectorAll<HTMLElement>('.leaflet-bottom > .leaflet-control, .leaflet-top.leaflet-center > *')),
		buttons = Array.from(document.querySelectorAll<HTMLElement>('.sidebar__buttons > button')),
		sections = Array.from(document.querySelectorAll<HTMLElement>('.sidebar__section:not([hidden])')),
		all = [...left, ...bottom, ...buttons, ...sections];

	if(!all.length) {
		return;
	}

	utils.set(all, {opacity: 0});

	const timeline = createTimeline({
		defaults: {ease: softSpring()},
		onComplete: () => clearStyles(all),
	});

	const groups: [HTMLElement[], AnimationParams, number][] = [
		[left, {opacity: [0, 1], translateX: [-28, 0], delay: stagger(55)}, 0],
		[buttons, {opacity: [0, 1], translateY: [-24, 0], scale: [0.8, 1], delay: stagger(60, {reversed: true})}, 80],
		[sections, {opacity: [0, 1], translateX: [32, 0], delay: stagger(70)}, 180],
		[bottom, {opacity: [0, 1], translateY: [28, 0], delay: stagger(60)}, 220],
	];

	groups.filter(([targets]) => targets.length)
		.forEach(([targets, params, position]) => timeline.add(targets, params, position));
};

/* ------------------------------------------------------------------ */
/* Разделы боковой панели                                              */
/* ------------------------------------------------------------------ */

const sectionItemsSelector = [
	'.section__content .menu > label',
	'.section__content .world',
	'.section__content .section__search',
	'.section__content .markers__header',
	'.following__target',
].join(', ');

/**
 * Animates a sidebar section into view, staggering in its first few list items
 * @param {HTMLElement} el The section element
 */
export const animateSectionIn = (el: HTMLElement) => {
	el.hidden = false;

	if(!motionEnabled()) {
		clearStyles(el);
		return;
	}

	const items = Array.from(el.querySelectorAll<HTMLElement>(sectionItemsSelector)).slice(0, 18);

	track(el, animate(el, {
		opacity: [0, 1],
		translateX: [28, 0],
		scale: [0.97, 1],
		ease: softSpring(),
		onComplete: () => clearStyles(el),
	}));

	if(items.length) {
		animate(items, {
			opacity: [0, 1],
			translateX: [14, 0],
			duration: 380,
			delay: stagger(22, {start: 60}),
			ease: 'outCubic',
			onComplete: () => clearStyles(items),
		});
	}
};

/**
 * Animates a sidebar section out of view, setting the hidden attribute once complete
 * @param {HTMLElement} el The section element
 */
export const animateSectionOut = (el: HTMLElement) => {
	if(!motionEnabled() || el.hidden) {
		runningAnimations.get(el)?.cancel();
		clearStyles(el);
		el.hidden = true;
		return;
	}

	track(el, animate(el, {
		opacity: 0,
		translateX: 18,
		duration: 170,
		ease: 'inQuad',
		onComplete: () => {
			el.hidden = true;
			clearStyles(el);
		},
	}));
};

/**
 * Directive which toggles the hidden attribute of an element with enter/leave animations
 * Usage: v-motion-hidden="!visible"
 */
export const vMotionHidden: Directive<HTMLElement, boolean> = {
	mounted(el, {value}) {
		el.hidden = value;

		// Sections mounted while the splash screen is visible are animated by playUIEntrance instead
		if(!value && document.getElementById('splash')?.hidden) {
			animateSectionIn(el);
		}
	},

	updated(el, {value, oldValue}) {
		if(value === oldValue) {
			return;
		}

		if(value) {
			animateSectionOut(el);
		} else {
			animateSectionIn(el);
		}
	},
};

/**
 * Animates the collapsing or expanding of a sidebar section's content
 * @param {HTMLElement} content The content element
 * @param {boolean} collapse Whether the content is collapsing
 * @returns Promise resolved once the animation completes
 */
export const animateCollapse = (content: HTMLElement, collapse: boolean): Promise<void> => {
	if(!motionEnabled()) {
		return Promise.resolve();
	}

	const height = content.scrollHeight;

	content.style.overflow = 'hidden';

	return new Promise(resolve => {
		track(content, animate(content, {
			height: collapse ? [height, 0] : [0, height],
			opacity: collapse ? [1, 0] : [0, 1],
			duration: collapse ? 220 : 320,
			ease: collapse ? 'inOutQuad' : 'outCubic',
			onComplete: () => {
				clearStyles(content, ['height', 'opacity', 'overflow']);
				resolve();
			},
		}));
	});
};

/* ------------------------------------------------------------------ */
/* Всплывающие элементы                                                */
/* ------------------------------------------------------------------ */

/**
 * Springs an element into view from a slightly smaller scale, used for menus and dialogs
 * @param {HTMLElement} el The element
 * @param {number} y Initial vertical offset in px
 */
export const popIn = (el: HTMLElement | null, y = -8) => {
	if(!el || !motionEnabled()) {
		return;
	}

	track(el, animate(el, {
		opacity: [0, 1],
		scale: [0.92, 1],
		translateY: [y, 0],
		ease: popSpring(),
		onComplete: () => clearStyles(el),
	}));
};

/**
 * Animates a modal dialog in: the backdrop fades, then the panels rise in one after another
 * @param {HTMLElement} modal The modal element
 */
export const animateModalIn = (modal: HTMLElement) => {
	if(!motionEnabled()) {
		return;
	}

	const panels = Array.from(modal.querySelectorAll<HTMLElement>(':scope > .modal__header, :scope > .modal__content'));

	animate(modal, {opacity: [0, 1], duration: 220, ease: 'outQuad', onComplete: () => clearStyles(modal)});
	animate(panels, {
		opacity: [0, 1],
		translateY: [36, 0],
		scale: [0.97, 1],
		delay: stagger(50),
		ease: softSpring(),
		onComplete: () => clearStyles(panels),
	});
};

/**
 * Animation adapter for @kyvg/vue3-notification's "velocity" animation type
 * @param {HTMLElement} el The notification wrapper element
 * @param {string} action 'enter' or 'leave', as returned by the configured animation
 * @param {Object} options Duration and completion callback from the notification library
 */
export const notificationAnimator = (el: HTMLElement, action: 'enter' | 'leave',
									 options: {duration?: number, complete?: () => void}) => {
	const complete = () => options.complete?.();

	if(!motionEnabled()) {
		complete();
		return;
	}

	if(action === 'enter') {
		animate(el, {
			opacity: [0, 1],
			translateY: [28, 0],
			scale: [0.9, 1],
			ease: popSpring(),
			onComplete: () => {
				clearStyles(el);
				complete();
			},
		});
		return;
	}

	createTimeline({onComplete: complete})
		.add(el, {opacity: 0, translateY: 10, scale: 0.96, duration: 180, ease: 'inQuad'})
		.add(el, {height: [el.offsetHeight, 0], duration: 160, ease: 'inOutQuad'});
};

/* ------------------------------------------------------------------ */
/* Карта                                                               */
/* ------------------------------------------------------------------ */

/**
 * Shows an expanding "ping" at the given map location, to draw attention to a location the map has moved to
 * @param {LiveAtlasLeafletMap} map The leaflet map
 * @param {LatLng} latLng The location to ping
 */
export const pingLocation = (map: LiveAtlasLeafletMap, latLng: LatLng) => {
	if(!motionEnabled()) {
		return;
	}

	const marker = new Marker(latLng, {
		icon: new DivIcon({
			className: 'map-ping',
			html: '<span class="map-ping__ring"></span><span class="map-ping__ring"></span><span class="map-ping__ring"></span><span class="map-ping__dot"></span>',
			iconSize: [0, 0],
		}),
		interactive: false,
		keyboard: false,
		pane: 'markerPane',
		zIndexOffset: 2000,
	}).addTo(map);

	const element = marker.getElement();

	if(!element) {
		marker.remove();
		return;
	}

	const rings = Array.from(element.querySelectorAll<HTMLElement>('.map-ping__ring')),
		dot = element.querySelector<HTMLElement>('.map-ping__dot');

	createTimeline({onComplete: () => marker.remove()})
		.add(dot!, {scale: [0, 1], opacity: [0, 1], ease: popSpring()}, 0)
		.add(rings, {
			scale: [0.2, 4.2],
			opacity: [0.9, 0],
			duration: 1300,
			delay: stagger(240),
			ease: 'outCubic',
		}, 80)
		.add(dot!, {scale: 0, opacity: 0, duration: 260, ease: 'inBack(2)'}, 1500);
};

/**
 * Plays a short transition when the current map changes: tiles fade in from a blurred state under a pink glow
 * @param {HTMLElement} container The leaflet map container
 */
export const playMapTransition = (container: HTMLElement) => {
	if(!motionEnabled()) {
		return;
	}

	const tilePane = container.querySelector<HTMLElement>('.leaflet-tile-pane'),
		glow = document.createElement('div');

	glow.className = 'map-transition-glow';
	container.appendChild(glow);

	animate(glow, {
		opacity: [0, 1, 0],
		scale: [0.6, 1.4],
		duration: 900,
		ease: 'outQuad',
		onComplete: () => glow.remove(),
	});

	if(tilePane) {
		animate(tilePane, {
			opacity: [0.2, 1],
			filter: ['blur(10px) saturate(0.4)', 'blur(0px) saturate(1)'],
			duration: 700,
			ease: 'outCubic',
			onComplete: () => clearStyles(tilePane, ['opacity', 'filter']),
		});
	}
};

let recentMarkerPops = 0;

/**
 * Pops a newly created player marker into view. Skipped when many markers appear at once.
 * @param {HTMLElement} label The marker label element
 */
export const popInMarker = (label: HTMLElement) => {
	if(!motionEnabled() || recentMarkerPops > 12) {
		return;
	}

	recentMarkerPops++;
	setTimeout(() => recentMarkerPops--, 600);

	animate(label, {
		opacity: [0, 1],
		scale: [0.6, 1],
		translateX: [-10, 0],
		ease: popSpring(),
		onComplete: () => clearStyles(label),
	});
};

/* ------------------------------------------------------------------ */
/* Бренд                                                               */
/* ------------------------------------------------------------------ */

/**
 * Re-stacks the blocks of the Schalker logo one after another, used on hover of the brand control
 * @param {Element} logo The logo svg
 */
export const bounceLogo = (logo: Element | null) => {
	if(!logo || !motionEnabled()) {
		return;
	}

	const blocks = Array.from(logo.querySelectorAll<SVGElement>('[data-block]'));

	if(!blocks.length || runningAnimations.has(logo)) {
		return;
	}

	runningAnimations.set(logo, animate(blocks, {
		translateY: [0, -46, 0],
		duration: 520,
		delay: stagger(70, {reversed: true}),
		ease: 'outQuad',
		onComplete: () => {
			clearStyles(blocks);
			runningAnimations.delete(logo);
		},
	}));
};

/**
 * Scrambles the text of an element into place using Minecraft-like block characters
 * @param {HTMLElement} el The element
 */
export const scrambleIn = (el: HTMLElement | null) => {
	if(!el || !motionEnabled()) {
		return;
	}

	track(el, animate(el, {
		textContent: scrambleText({chars: 'blocks', settleDuration: 220}),
		duration: 600,
	}));
};

import {Control, ControlOptions, DomEvent, DomUtil} from 'leaflet';
import {LiveAtlasBrandConfig} from "@/index";
import logoSvg from '@/assets/images/schalker-logo.svg?raw';
import {bounceLogo, scrambleIn} from "@/util/motion";

export interface BrandControlOptions extends ControlOptions {
	brand: LiveAtlasBrandConfig;
}

/**
 * Leaflet map control displaying the server brand (logo, name and tagline) with an optional link to the website
 * The logo assembles itself on hover using Anime.js
 */
export class BrandControl extends Control {
	declare options: BrandControlOptions;

	constructor(options: BrandControlOptions) {
		super(options);
	}

	onAdd() {
		const {brand} = this.options,
			container = DomUtil.create('div', 'leaflet-control-brand'),
			link = DomUtil.create(brand.url ? 'a' : 'div', 'brand', container),
			text = DomUtil.create('span', 'brand__text'),
			name = DomUtil.create('span', 'brand__name', text);

		if(brand.url) {
			const anchor = link as HTMLAnchorElement;
			anchor.href = brand.url;
			// Карта может быть открыта во фрейме на сайте — переходим во всём окне
			anchor.target = '_top';
			anchor.rel = 'noopener';
			anchor.title = brand.url.replace(/^https?:\/\//, '');
		}

		if(brand.logo) {
			const image = DomUtil.create('img', 'brand__logo', link) as HTMLImageElement;
			image.src = brand.logo;
			image.alt = '';
		} else {
			link.insertAdjacentHTML('afterbegin', logoSvg.replace('<svg ', '<svg class="brand__logo" aria-hidden="true" '));
		}

		name.textContent = brand.name;
		link.appendChild(text);

		if(brand.tagline) {
			const tagline = DomUtil.create('span', 'brand__tagline', text);
			tagline.textContent = brand.tagline;

			requestAnimationFrame(() => scrambleIn(tagline));
		}

		DomEvent.on(link, 'mouseenter focus', () => bounceLogo(link.querySelector('.brand__logo')));
		DomEvent.disableClickPropagation(container);

		return container;
	}
}

# LiveAtlas [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Discord](https://img.shields.io/discord/390942438061113344?color=8C9CFE&label=discord&logo=discord&logoColor=white)](https://discord.gg/DBduB9qyv3) [![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/JLyne/LiveAtlas/main.yml?branch=master)](https://github.com/JLyne/LiveAtlas/actions)

## Schalker

Форк LiveAtlas для карты сервера [Schalker](https://schalker.net) (squaremap).

- **Дизайн в стиле schalker.net**: тёмные стеклянные панели, розовый акцент `#F44D89`, шрифты Inter и Noto Sans, Monocraft для координат, русский интерфейс. Цвета и тексты меняются в `index.html` (`:root` и `messages`).
- **Анимации на [Anime.js](https://animejs.com) v4** (`src/util/motion.ts`): логотип на заставке собирается из блоков, карта раскрывается «диафрагмой», интерфейс въезжает с краёв, разделы панели и меню появляются на пружинах, точка назначения подсвечивается «пингом», при смене мира тайлы проявляются из размытия. При `prefers-reduced-motion` или `ui.animations: false` анимации отключаются.
- **Плашка бренда** в левом верхнем углу (`ui.brand` в `index.html`, `null` — скрыть).

### Установка на сервер

1. `npm ci`, затем `npm run build` (в Windows PowerShell 5.1 нет `&&`: запускайте по очереди или через `;`)
2. Скопировать содержимое `dist/` в веб-папку squaremap (`plugins/squaremap/web/`), рядом с папкой `tiles/`.
   В `plugins/squaremap/config.yml` выключить перезапись веб-файлов: `settings.web-directory.auto-update: false`.
   Если карту раздаёт nginx, кладите `dist/` в корень сайта, где доступен `tiles/`.
3. В `index.html` сервер настроен как `squaremap: window.location.pathname`, то есть LiveAtlas ищет `tiles/` по тому же пути, что и сама страница.

Заголовки списков миров и игроков squaremap передаёт сам: `ui.sidebar.world_list_label` и `player_list_label`.

### Разработка

```bash
npm install
npm run dev        # dev-сервер на :8080
npm test           # vitest
npm run lint       # eslint
npm run build      # проверка типов + сборка в dist/
npm run build:plugin  # то же + сборка Spigot-плагина через Maven
```

---



A map frontend built with [Vue.js](https://github.com/vuejs/vue) and Typescript. Supports [Dynmap](https://github.com/webbukkit/dynmap), [Squaremap](https://github.com/jpenilla/squaremap), [Pl3xmap](https://github.com/NeumimTo/Pl3xMap) and [Overviewer](https://github.com/overviewer/Minecraft-Overviewer).

![A LiveAtlas screenshot](https://minecraft.rtgame.co.uk/liveatlas/liveatlas8.png)

LiveAtlas is an alternative frontend which aims to provide a more modern interface and improved performance for busy maps. LiveAtlas is a drop-in replacement for Dynmap; Squaremap, Pl3xmap and Overviewer maps are supported with some additional configuration.

Development is ongoing, but the major features of each map plugin are supported.

You can see it in action [here](https://minecraft.rtgame.co.uk/map/build)

## Supported map features
[See the wiki](https://github.com/JLyne/LiveAtlas/wiki/Supported-Maps-and-Features)

## Supported Browsers
- Chrome 66+
- Edge 80+
- Firefox 60+
- Opera 53+
- Safari 11.1+

IE is not supported

## Download
LiveAtlas is available on [SpigotMC](https://www.spigotmc.org/resources/liveatlas-a-dynmap-frontend-for-the-modern-web.86939/), [Polymart](https://polymart.org/resource/liveatlas-alternative-map-ui.1977) and [MCMarket](https://www.mc-market.org/resources/22740/)

Dev builds are available in [Github actions](https://github.com/JLyne/LiveAtlas/actions/workflows/main.yml)

## Installation
[See the wiki](https://github.com/JLyne/LiveAtlas/wiki/Installation)

## Customisation
The index.html file can be edited to add custom favicons, styles or analytics, just like the map plugins original UIs. All LiveAtlas messages can also be modified here for translation purposes.
You are also free to build LiveAtlas yourself to make further changes.

## Building
Run `npm install`, then `npm run dev` to start a local dev server, or `npm run build` to build LiveAtlas into `dist/`. `npm run build:plugin` additionally packages the Spigot plugin with Maven.

## Support
If you find a bug, please create an issue with as must detail as possible. I'm working on this in my spare time, so fixes are on a best effort basis, but I'll eventually find time for them.

Please do not contact the Dynmap, Squaremap, Pl3xmap or Overviewer teams regarding any issue with LiveAtlas. They will be very upset.

## Donate
If you appreciate my work, feel free to:

<a href='https://ko-fi.com/jlyne' target='_blank'><img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
___
  
Cross-browser testing provided by [Browserstack](http://browserstack.com/).

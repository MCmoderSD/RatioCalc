# RatioCalc

A stretch calculator for **Rainbow Six Siege**. See how stretched your game is, compare every in-game aspect ratio preset, and find the ratio that keeps your stretch when you move to a new monitor.

**Live:** [mcmodersd.github.io/RatioCalc](https://mcmodersd.github.io/RatioCalc/)

## Features

- **Your stretch at a glance:** pick your monitor and in-game aspect ratio and get the stretch factor and percent, e.g. `4:3` on `16:9` → `×1.333` (+33.3 % stretched).
- **Compare presets:** a number line and a table show every R6 preset and how much wider or narrower it would be than your current setup.
- **Migrate to a new monitor:** pick the new monitor and get the aspect ratio that keeps your stretch, plus the closest R6 preset.
- **Monitor detection:** your current monitor is pre-selected from your screen resolution.
- **Custom values:** enter any ratio, resolution or decimal (`16:9`, `3440x1440`, `1.85`).
- **Shareable links:** your setup lives in the URL, e.g. `?monitor=16:9&ratio=4:3&target=16:10`.
- **Private by design:** no cookies, no tracking, no external requests. Everything runs in your browser.

## How it's calculated

```text
stretch factor = monitor ratio ÷ in-game ratio
stretch %      = (stretch factor − 1) × 100
ideal ratio    = new monitor ratio ÷ stretch factor
```

Positive values are stretched, negative values are squished. A factor is used instead of a difference because only the factor looks the same on every monitor. Details and reference values are in [docs/LOGIC.md](docs/LOGIC.md).

## Tech stack

- [TypeScript](https://www.typescriptlang.org/) with the strictest compiler settings and explicit types everywhere
- [Vite](https://vite.dev/) for dev server and build
- Plain DOM and CSS, with no framework and no runtime dependencies
- Hosted on GitHub Pages and deployed by GitHub Actions

## Development

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open [localhost:5173/RatioCalc/](http://localhost:5173/RatioCalc/).

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Start the dev server               |
| `npm run build`   | Type-check and build to `dist/`    |
| `npm run preview` | Serve the production build locally |

## Deployment

Every push to `master` or `main` runs [.github/workflows/publish.yml](.github/workflows/publish.yaml), which type-checks, builds the site and publishes `dist/` to GitHub Pages. It can also be started manually from the *Actions* tab.

[Dependabot](.github/dependabot.yaml) checks npm packages and GitHub Actions weekly and opens one grouped pull request per ecosystem.

## Project structure

```text
index.html            calculator page
imprint/  privacy/    legal pages
src/                  TypeScript modules and styles
docs/                 concept, logic, design and architecture docs
```

| Doc                                     | Content                                                |
|-----------------------------------------|--------------------------------------------------------|
| [OVERVIEW.md](docs/OVERVIEW.md)         | Purpose, features, user flows                          |
| [LOGIC.md](docs/LOGIC.md)               | Formulas, parsing, monitor detection, reference values |
| [DESIGN.md](docs/DESIGN.md)             | Colors, typography, components, motion                 |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Modules, types, data flow                              |

## License

[BSD 3-Clause](LICENSE) © 2026 Seraphin Berger

## Disclaimer

This project is independent and not affiliated with, endorsed or sponsored by Ubisoft Entertainment. Tom Clancy's Rainbow Six® Siege is a trademark of Ubisoft Entertainment.
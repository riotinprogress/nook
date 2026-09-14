# Nook — Your personal start page

Your favorite corners of the internet, all in one place. Bookmarks in groups, drag-and-drop organization, and **353 color themes** imported from the [Windows Terminal theme collection](https://windowsterminalthemes.dev/) and [terminalcolors.com](https://terminalcolors.com/) — Dracula, Tokyo Night, Nord, Gruvbox, Solarized, Rosé Pine and hundreds more.

## Themes

- **353 palettes**, each with **3–5 color variations** derived from that theme's own 16-color terminal palette.
- **Click a theme's preview** to apply it; click again to cycle its variations. The dots under the name (and the `2/5` badge) show which variation you're on — click any dot to jump straight to it.
- **The cog icon** (left of the radio check) opens an editor for all 13 interface colors. Edits preview live behind the dialog, then you can name it and **save it as a new theme** under "Yours".
- Every derived palette is contrast-checked, so text stays readable even on the low-contrast source schemes.

To re-import the upstream collection: `node scripts/gen-themes.mjs` (regenerates `src/palettes.ts`).

## Open it (2 minutes)

Browsers cannot run the project source directly — it needs one build step first:

```bash
npm install
npm run build
```

Then open **`dist/index.html`** — that's it. It's a single, self-contained file (React, styles, and everything bundled inside), so you can double-click it, send it to a friend, or drop it on a USB drive. No server required.

## Work on it

```bash
npm run dev
```

Then open the local address it prints (usually `http://localhost:5173`).

## Notes

- Requires [Node.js](https://nodejs.org) 18+ for the build step.
- All bookmarks, themes, and settings are stored in your browser's `localStorage` per-URL path. If you open `dist/index.html` from a different folder location, your data starts fresh there — use **Settings → Export bookmarks** to move it.
- If you see "One more step to open your Nook", you opened the source file — follow the steps above.

## Icon libraries

The bookmark icon explorer bundles these open-source libraries (artwork ships with the app, no network needed):

- [Font Awesome Free](https://fontawesome.com) 7.3.1 — CC BY 4.0
- [Tabler Icons](https://tabler.io/icons) 3.46.0 — MIT
- [Streamline Icons](https://www.streamlinehq.com/icons) (free set) — CC BY 4.0
- [Iconoir](https://iconoir.com) 7.12.1 — MIT
- [Lineicons](https://lineicons.com) (free set) — MIT
- [Boxicons](https://boxicons.com) 2.1.4 — CC BY 4.0 / OFL
- [Mingcute](https://www.mingcute.com) 2.9.72 — Apache-2.0

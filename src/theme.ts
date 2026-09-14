import { palettes, type Palette } from './palettes';

export type Vars = Record<string, string>;
export type CustomTheme = { id: string; name: string; dark: boolean; vars: Vars; from?: string };

/** The editable surface of a theme — every colour Nook paints with. */
export const VARS: { key: string; css: string; label: string; hint: string }[] = [
  { key: 'bg', css: '--bg', label: 'Background', hint: 'The page behind everything' },
  { key: 'sidebar', css: '--sidebar', label: 'Sidebar', hint: 'Navigation panel' },
  { key: 'card', css: '--card', label: 'Cards', hint: 'Bookmarks, menus, inputs' },
  { key: 'hover', css: '--hover', label: 'Hover surface', hint: 'Rows and buttons on hover' },
  { key: 'line', css: '--line', label: 'Borders', hint: 'Dividers and outlines' },
  { key: 'text', css: '--text', label: 'Text', hint: 'Headings and names' },
  { key: 'secondary', css: '--secondary', label: 'Secondary text', hint: 'Supporting copy' },
  { key: 'muted', css: '--muted', label: 'Muted text', hint: 'Hints and counts' },
  { key: 'accent', css: '--accent', label: 'Accent', hint: 'Buttons and highlights' },
  { key: 'accentDark', css: '--accent-dark', label: 'Accent hover', hint: 'Pressed accent state' },
  { key: 'accentSoft', css: '--accent-soft', label: 'Accent tint', hint: 'Active nav background' },
  { key: 'banner', css: '--banner', label: 'Banner', hint: 'Highlight strip' },
  { key: 'onAccent', css: '--on-accent', label: 'Text on accent', hint: 'Label inside accent buttons' },
];

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
export const norm = (c: string) => {
  let s = String(c || '').trim().replace(/^#/, '');
  if (s.length === 3) s = s.split('').map((x) => x + x).join('');
  return /^[0-9a-fA-F]{6}$/.test(s) ? '#' + s.toLowerCase() : '#000000';
};
const toRgb = (c: string) => {
  const h = norm(c).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
export const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = toRgb(a);
  const [r2, g2, b2] = toRgb(b);
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
};
const lum = (c: string) =>
  toRgb(c)
    .map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    })
    .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
export const isDarkColor = (c: string) => lum(c) < 0.36;

/** Name an accent by hue so alternates read as "Purple", "Cyan", etc. */
export function hueName(c: string) {
  const [r, g, b] = toRgb(c).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d < 0.08) return lum(c) > 0.5 ? 'Light' : 'Slate';
  let h = 0;
  if (mx === r) h = ((g - b) / d) % 6;
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const names: [number, string][] = [
    [16, 'Red'], [42, 'Orange'], [66, 'Yellow'], [160, 'Green'], [200, 'Teal'],
    [232, 'Cyan'], [265, 'Blue'], [292, 'Violet'], [330, 'Magenta'], [360, 'Red'],
  ];
  return (names.find(([max]) => h < max) || names[9])[1];
}

/** Derive Nook's full interface palette from a terminal scheme. */
export function buildVars(bgHex: string, fgHex: string, accentHex: string, dark: boolean): Vars {
  const bg = norm(bgHex);
  const white = '#ffffff', black = '#000000';
  // The direction that pushes a colour *away* from this background.
  const lift = dark ? white : black;
  const ensure = (c: string, against: string, min: number, toward: string) => {
    let out = c;
    for (let i = 0; i < 40 && contrast(out, against) < min; i++) out = mix(out, toward, 0.06);
    return out;
  };

  // Some terminal schemes are gorgeous but very low contrast; hold a readable floor.
  const text = ensure(norm(fgHex), bg, 4.5, lift);
  let card = dark ? mix(bg, white, 0.055) : mix(bg, white, 0.62);
  for (let i = 0; i < 30 && contrast(text, card) < 4; i++) card = mix(card, bg, 0.18);

  const accent = ensure(norm(accentHex), bg, 2.9, lift);
  const accentSoft = mix(bg, accent, dark ? 0.22 : 0.16);
  const accentDark = ensure(dark ? mix(accent, white, 0.22) : mix(accent, black, 0.2), accentSoft, 3, lift);
  const ink = mix(bg, black, dark ? 0.6 : 0.78);
  const onAccent =
    contrast(accent, white) >= 3.2 ? white : contrast(accent, ink) >= 3.2 ? ink : contrast(accent, black) >= contrast(accent, white) ? black : white;

  return {
    bg,
    sidebar: dark ? mix(bg, black, 0.34) : mix(bg, black, 0.042),
    card,
    hover: dark ? mix(bg, white, 0.1) : mix(bg, accent, 0.07),
    line: dark ? mix(bg, white, 0.125) : mix(bg, black, 0.085),
    text,
    secondary: ensure(mix(text, bg, dark ? 0.26 : 0.3), bg, 3.2, text),
    muted: ensure(mix(text, bg, dark ? 0.52 : 0.48), bg, 2.4, text),
    accent,
    accentDark,
    accentSoft,
    banner: mix(bg, accent, dark ? 0.13 : 0.1),
    onAccent,
  };
}

export const paletteById = new Map(palettes.map((p) => [p.i, p]));

export function paletteVars(p: Palette, alt: number): Vars {
  const accents = p.a.length ? p.a : [p.f];
  return buildVars(p.b, p.f, accents[((alt % accents.length) + accents.length) % accents.length], !!p.d);
}

export type Resolved = { id: string; name: string; vars: Vars; dark: boolean; altCount: number; alt: number; custom: boolean };

export function resolveTheme(id: string, alt: number, customs: CustomTheme[]): Resolved {
  const custom = customs.find((c) => c.id === id);
  if (custom)
    return { id, name: custom.name, vars: custom.vars, dark: custom.dark, altCount: 1, alt: 0, custom: true };
  const p = paletteById.get(id) || paletteById.get(DEFAULT_THEME) || palettes[0];
  const count = Math.max(1, p.a.length);
  const index = ((alt % count) + count) % count;
  return { id: p.i, name: p.n, vars: paletteVars(p, index), dark: !!p.d, altCount: count, alt: index, custom: false };
}

export function applyVars(vars: Vars, dark: boolean) {
  const root = document.documentElement;
  const css: Record<string, string> = { '--input': vars.card || '' };
  for (const v of VARS) css[v.css] = vars[v.key] || '';
  for (const name in css) root.style.setProperty(name, css[name]);
  root.dataset.mode = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', vars.bg || '#faf9fc');
  // Cached so the boot script can paint the right colours before React loads.
  try {
    localStorage.setItem('nook-vars', JSON.stringify({ css, mode: dark ? 'dark' : 'light' }));
  } catch {
    /* storage unavailable — the app still works, just with a first-paint flash */
  }
}

export const DEFAULT_THEME = 'rose-pine';
/** Earlier builds shipped six hand-written themes; keep those users where they were. */
export const LEGACY: Record<string, string> = {
  latte: 'github',
  tokyo: 'tokyonight',
  dracula: 'dracula',
  nord: 'nord',
  onedark: 'onedark',
  rose: 'rose-pine',
};

// Converts terminal theme datasets into a compact palette file for Nook.
// Sources: Windows Terminal collection (github.com/atomcorp/themes) + terminalcolors.com.
// Full regen (needs network):  node scripts/gen-themes.mjs
// Offline append of terminalcolors.com data onto the current palettes.ts:
//   node scripts/gen-themes.mjs --merge-only
import fs from 'node:fs';

const SOURCE = 'https://raw.githubusercontent.com/atomcorp/themes/master/themes.json';
const CACHE = 'scripts/.themes-cache.json';
const TC_CACHE = 'scripts/.terminalcolors-cache.json';
const MERGE_ONLY = process.argv.includes('--merge-only');

const hex = (c) => {
  let s = String(c || '').trim().replace('#', '');
  if (s.length === 3) s = s.split('').map((x) => x + x).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return s.toLowerCase();
};
const rgb = (h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
const lum = (h) => {
  const [r, g, b] = rgb(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const hsl = (h) => {
  const [r, g, b] = rgb(h).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let hue = 0;
  if (d) {
    if (mx === r) hue = ((g - b) / d) % 6;
    else if (mx === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  const l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [hue, s, l];
};
const hslToHex = (h, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const seg = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h / 60) % 6];
  return seg.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
};
const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

// Pick 3-5 visually distinct, readable accents from the theme's own 16 colors.
function accents(t, bg, isDark) {
  const order = ['purple', 'blue', 'cyan', 'green', 'yellow', 'red'];
  const pool = [];
  for (const key of order) {
    for (const name of [key, 'bright' + key[0].toUpperCase() + key.slice(1)]) {
      const c = hex(t[name]);
      if (!c) continue;
      const [hu, sa, li] = hsl(c);
      if (sa < 0.14 || li < 0.05 || li > 0.97) continue; // skip greys / near-black / near-white
      pool.push({ c, hue: hu, sat: sa, light: li, ratio: contrast(c, bg), key });
    }
  }
  // Prefer the most readable variant of each hue family, then keep hues far apart.
  const chosen = [];
  for (const key of order) {
    const family = pool.filter((p) => p.key === key && p.ratio >= (isDark ? 2.9 : 2.6));
    if (!family.length) continue;
    family.sort((a, b) => b.sat * Math.min(b.ratio, 7) - a.sat * Math.min(a.ratio, 7));
    const pick = family[0];
    if (chosen.some((c) => hueGap(c.hue, pick.hue) < 24)) continue;
    chosen.push(pick);
    if (chosen.length === 5) break;
  }
  // Guarantee at least three options by nudging lightness of the best remaining colors.
  if (chosen.length < 3) {
    const extra = pool.slice().sort((a, b) => b.ratio * b.sat - a.ratio * a.sat);
    for (const p of extra) {
      if (chosen.length >= 3) break;
      if (chosen.some((c) => hueGap(c.hue, p.hue) < 20)) continue;
      const [r, g, b] = rgb(p.c);
      const t2 = isDark ? 0.42 : 0.34;
      const mixed = isDark
        ? [r + (255 - r) * t2, g + (255 - g) * t2, b + (255 - b) * t2]
        : [r * (1 - t2), g * (1 - t2), b * (1 - t2)];
      const c = mixed.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
      if (contrast(c, bg) >= 2.5) chosen.push({ ...p, c, hue: hsl(c)[0] });
    }
  }
  if (!chosen.length) {
    const base = hex(t.foreground);
    chosen.push({ c: base, hue: hsl(base)[0] });
  }
  // Near-monochrome schemes: derive extra options by rotating the base accent's hue.
  let guard = 0;
  while (chosen.length < 3 && guard++ < 12) {
    const base = chosen[0];
    const [h0, s0, l0] = hsl(base.c);
    const rot = (h0 + 38 * chosen.length * (chosen.length % 2 ? 1 : -1) + 360) % 360;
    const sat = Math.max(0.32, Math.min(0.62, s0 || 0.4));
    let light = Math.max(0.2, Math.min(0.8, l0 || (isDark ? 0.66 : 0.42)));
    let c = null;
    for (let step = 0; step < 14; step++) {
      c = hslToHex(rot, sat, light);
      if (contrast(c, bg) >= (isDark ? 3 : 2.8)) break;
      light += isDark ? 0.045 : -0.045;
      light = Math.max(0.06, Math.min(0.94, light));
    }
    if (chosen.some((x) => x.c === c)) break;
    chosen.push({ c, hue: rot });
  }
  return chosen.slice(0, 5).map((c) => c.c);
}

const slugify = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Convert one raw scheme to a palette entry (null when unusable). slugName
// overrides the id source (used to strip diacritics for terminalcolors names).
function convertOne(t, seen, slugName) {
  const bg = hex(t.background), fg = hex(t.foreground);
  if (!bg || !fg) return null;
  if (contrast(bg, fg) < 1.6) return null; // unreadable source scheme
  let id = slugify(slugName ?? t.name);
  if (seen.has(id)) id = id + '-' + (seen.get(id) + 1);
  seen.set(id, (seen.get(id) || 0) + 1);
  const isDark = t.meta?.isDark ?? lum(bg) < 0.4;
  return { i: id, n: t.name.trim(), d: isDark ? 1 : 0, b: bg, f: fg, a: accents(t, bg, isDark) };
}

function parsePalettesTs() {
  const src = fs.readFileSync('src/palettes.ts', 'utf8');
  const m = src.match(/=\s*(\[.*\]);\s*$/s);
  if (!m) throw new Error('could not parse src/palettes.ts');
  return JSON.parse(m[1].replace(/\b([a-z]):/g, '"$1":'));
}

const nn = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

let out;
const seen = new Map();
if (MERGE_ONLY) {
  out = parsePalettesTs();
  for (const p of out) seen.set(p.i, (seen.get(p.i) || 0) + 1);
} else {
  if (!fs.existsSync(CACHE)) {
    const res = await fetch(SOURCE);
    if (!res.ok) throw new Error('download failed: ' + res.status);
    fs.writeFileSync(CACHE, await res.text());
  }
  const raw = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  out = [];
  for (const t of raw) {
    const e = convertOne(t, seen);
    if (e) out.push(e);
  }
}

const baseCount = out.length;
const haveNorms = new Set(
  out.flatMap((p) => [nn(p.n), nn(p.i), nn(p.n.replace(/^builtin\s+/i, '')), nn(p.i.replace(/^builtin-/i, ''))])
);
const haveBgFg = new Set(out.map((p) => p.b + '/' + p.f));
const tc = JSON.parse(fs.readFileSync(TC_CACHE, 'utf8'));
const added = [];
const skipped = [];
for (const t of tc) {
  const n = nn(t.name);
  const stripped = nn(t.name.replace(/\s*default\s*/gi, ''));
  const bg = hex(t.background), fg = hex(t.foreground);
  if (haveNorms.has(n) || (stripped !== n && haveNorms.has(stripped))) {
    skipped.push(t.name + ' (have it)');
    continue;
  }
  if (bg && fg) {
    const dupe = out.find((p) => {
      if (p.b !== bg || p.f !== fg) return false;
      const h = [nn(p.n), nn(p.i)];
      return h.some((x) => x.includes(n) || n.includes(x));
    });
    if (dupe) {
      skipped.push(t.name + ' (same colors as ' + dupe.n + ')');
      continue;
    }
  }
  const slugName = t.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const e = convertOne(t, seen, slugName);
  if (!e) {
    skipped.push(t.name + ' (unreadable)');
    continue;
  }
  out.push(e);
  added.push(e.n + ' [' + e.i + ']');
  haveNorms.add(nn(e.n));
  haveNorms.add(nn(e.i));
  haveBgFg.add(e.b + '/' + e.f);
}

out.sort((a, b) => a.n.localeCompare(b.n));
const json = JSON.stringify(out).replace(/"([a-z])":/g, '$1:');
fs.writeFileSync(
  'src/palettes.ts',
  `// Auto-generated from the Windows Terminal theme collection (windowsterminalthemes.dev)\n` +
    `// plus terminalcolors.com. Sources: github.com/atomcorp/themes, terminalcolors.com.\n` +
    `// Regenerate with: node scripts/gen-themes.mjs [--merge-only]\n` +
    `export type Palette = { i: string; n: string; d: number; b: string; f: string; a: string[] };\n` +
    `export const palettes: Palette[] = ${json};\n`
);

const counts = out.reduce((m, t) => ((m[t.a.length] = (m[t.a.length] || 0) + 1), m), {});
console.log('mode:', MERGE_ONLY ? 'merge-only' : 'full');
console.log('themes:', out.length, '(was ' + baseCount + ', +' + added.length + ')',
  'dark:', out.filter((t) => t.d).length, 'light:', out.filter((t) => !t.d).length);
console.log('alternates per theme:', counts);
console.log('file KB:', (fs.statSync('src/palettes.ts').size / 1024).toFixed(1));
console.log('--- added (' + added.length + ') ---');
for (const a of added) console.log(' +', a);
console.log('--- skipped (' + skipped.length + ') ---');
for (const s of skipped) console.log(' -', s);

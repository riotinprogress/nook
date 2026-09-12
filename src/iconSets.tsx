// Provider registry for the browsable icon libraries + the shared glyph renderer.
// Stored values look like `fa-solid:house`, `tabler:home`, `streamline:add-1`,
// `iconoir-regular:home`, `lineicons:home`, `boxicons:bx-home`, `mingcute:mgc_home`.
import { FA_ICONS, FA_STYLES, FA_VERSION_LABEL } from './faIcons';
import type { FaStyle } from './faIcons';
import {
  SETS_VERSIONS,
  TABLER, STREAMLINE, LINEICONS, ICONOIR_REGULAR, ICONOIR_SOLID, BOXICONS, MINGCUTE,
} from './setsData';
import type { SvgRec, IconoirRec } from './setsData';

export type SetId = 'fa' | 'tabler' | 'streamline' | 'iconoir' | 'lineicons' | 'boxicons' | 'mingcute';

export interface SetMeta {
  id: SetId; label: string; version: string; credit: string; styles?: { id: string; label: string }[];
}
const ICONOIR_STYLES = [
  { id: 'all', label: 'All' },
  { id: 'regular', label: 'Regular' },
  { id: 'solid', label: 'Solid' },
];
export const SETS: SetMeta[] = [
  { id: 'fa', label: 'Font Awesome', version: FA_VERSION_LABEL, credit: 'CC BY 4.0', styles: FA_STYLES },
  { id: 'tabler', label: 'Tabler', version: SETS_VERSIONS.tabler, credit: 'MIT' },
  { id: 'streamline', label: 'Streamline', version: SETS_VERSIONS.streamline, credit: 'CC BY 4.0' },
  { id: 'iconoir', label: 'Iconoir', version: SETS_VERSIONS.iconoir, credit: 'MIT', styles: ICONOIR_STYLES },
  { id: 'lineicons', label: 'Lineicons', version: SETS_VERSIONS.lineicons, credit: 'MIT' },
  { id: 'boxicons', label: 'Boxicons', version: SETS_VERSIONS.boxicons, credit: 'CC BY 4.0 / OFL' },
  { id: 'mingcute', label: 'Mingcute', version: SETS_VERSIONS.mingcute, credit: 'Apache-2.0' },
];

const SET_PREFIXES = [
  'fa-solid:', 'fa-regular:', 'fa-brands:', 'tabler:', 'streamline:',
  'iconoir-regular:', 'iconoir-solid:', 'lineicons:', 'boxicons:', 'mingcute:',
];
/** Prefix check: is this value meant for one of the browsable libraries? */
export function isSetIcon(value: string): boolean {
  return SET_PREFIXES.some((p) => value.startsWith(p));
}

export function humanize(raw: string): string {
  return raw.split(/[-_]+/g).map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w)).join(' ');
}

export type Glyph =
  | { kind: 'font'; cls: string }
  | { kind: 'svg'; body: string; vb: string; props: Record<string, string> };

const TABLER_PROPS: Record<string, string> = {
  fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
};

const tablerMap = new Map(TABLER.map((r) => [r[0], r]));
const streamlineMap = new Map(STREAMLINE.map((r) => [r[0], r]));
const lineiconsMap = new Map(LINEICONS.map((r) => [r[0], r]));
const iconoirRegMap = new Map(ICONOIR_REGULAR.map((r) => [r[0], r]));
const iconoirSolidMap = new Map(ICONOIR_SOLID.map((r) => [r[0], r]));
const boxiconsSet = new Set(BOXICONS);
const mingcuteSet = new Set(MINGCUTE);
const faSet = new Set(FA_ICONS.map((e) => `${e.style}:${e.name}`));

function svgGlyph(r: SvgRec): Glyph {
  return { kind: 'svg', body: r[2], vb: `0 0 ${r[3]} ${r[4]}`, props: {} };
}
function iconoirGlyph(r: IconoirRec): Glyph {
  return {
    kind: 'svg', body: r[2], vb: '0 0 24 24',
    props: r[3] ? { fill: 'none', strokeWidth: r[3] } : { fill: 'none' },
  };
}

/** Resolve a stored value to renderable glyph data, or null when unknown/stale. */
export function glyphFor(value: string): Glyph | null {
  if (value.startsWith('tabler:')) {
    const r = tablerMap.get(value.slice(7));
    return r ? { kind: 'svg', body: r[2], vb: '0 0 24 24', props: TABLER_PROPS } : null;
  }
  if (value.startsWith('streamline:')) {
    const r = streamlineMap.get(value.slice(11));
    return r ? svgGlyph(r) : null;
  }
  if (value.startsWith('lineicons:')) {
    const r = lineiconsMap.get(value.slice(10));
    return r ? svgGlyph(r) : null;
  }
  if (value.startsWith('iconoir-regular:')) {
    const r = iconoirRegMap.get(value.slice(16));
    return r ? iconoirGlyph(r) : null;
  }
  if (value.startsWith('iconoir-solid:')) {
    const r = iconoirSolidMap.get(value.slice(14));
    return r ? iconoirGlyph(r) : null;
  }
  if (value.startsWith('boxicons:')) {
    const cls = value.slice(9);
    if (!boxiconsSet.has(cls)) return null;
    const base = cls.startsWith('bxs-') ? 'bxs' : cls.startsWith('bxl-') ? 'bxl' : 'bx';
    return { kind: 'font', cls: `${base} ${cls}` };
  }
  if (value.startsWith('mingcute:')) {
    const cls = value.slice(9);
    return mingcuteSet.has(cls) ? { kind: 'font', cls } : null;
  }
  if (value.startsWith('fa-')) {
    const m = /^(fa-solid|fa-regular|fa-brands):([a-z0-9-]+)$/.exec(value);
    if (!m || !faSet.has(value)) return null;
    return { kind: 'font', cls: `${m[1]} fa-${m[2]}` };
  }
  return null;
}

export function SetGlyph({ g }: { g: Glyph }) {
  if (g.kind === 'font') return <i className={`${g.cls} set-glyph`} aria-hidden="true" />;
  // Bodies come from our own generated data files (npm packages), never user input.
  return <svg className="set-glyph" viewBox={g.vb} {...g.props} aria-hidden="true" dangerouslySetInnerHTML={{ __html: g.body }} />;
}

export interface SetEntry {
  value: string;
  label: string;
  search: string;
  glyph: Glyph;
}

function faEntries(style: FaStyle | 'all'): SetEntry[] {
  return FA_ICONS.filter((e) => style === 'all' || e.style === style).map((e) => ({
    value: `${e.style}:${e.name}`,
    label: e.label,
    search: `${e.name} ${e.label}`,
    glyph: { kind: 'font', cls: `${e.style} fa-${e.name}` },
  }));
}
function svgEntries(recs: SvgRec[], prefix: string): SetEntry[] {
  return recs.map((r) => ({
    value: `${prefix}:${r[0]}`,
    label: humanize(r[0]),
    search: r[1],
    glyph: prefix === 'tabler'
      ? { kind: 'svg', body: r[2], vb: '0 0 24 24', props: TABLER_PROPS }
      : svgGlyph(r),
  }));
}

const cache = new Map<string, SetEntry[]>();
/** Browsable entries for one set (+style where applicable). Results are memoized. */
export function entriesFor(set: SetId, style?: string): SetEntry[] {
  const key = style ? `${set}:${style}` : set;
  const hit = cache.get(key);
  if (hit) return hit;
  let out: SetEntry[] = [];
  if (set === 'fa') out = faEntries((style as FaStyle | 'all') || 'all');
  else if (set === 'tabler') out = svgEntries(TABLER, 'tabler');
  else if (set === 'streamline') out = svgEntries(STREAMLINE, 'streamline');
  else if (set === 'lineicons') out = svgEntries(LINEICONS, 'lineicons');
  else if (set === 'iconoir') {
    const recs: { r: (typeof ICONOIR_REGULAR)[number]; p: string }[] = [];
    if (!style || style === 'all' || style === 'regular')
      for (const r of ICONOIR_REGULAR) recs.push({ r, p: 'iconoir-regular' });
    if (!style || style === 'all' || style === 'solid')
      for (const r of ICONOIR_SOLID) recs.push({ r, p: 'iconoir-solid' });
    out = recs.map(({ r, p }) => ({
      value: `${p}:${r[0]}`, label: `${humanize(r[0])} (${p === 'iconoir-solid' ? 'Solid' : 'Regular'})`,
      search: r[1], glyph: iconoirGlyph(r),
    }));
  } else if (set === 'boxicons') {
    out = BOXICONS.map((cls) => {
      const base = cls.startsWith('bxs-') ? 'bxs' : cls.startsWith('bxl-') ? 'bxl' : 'bx';
      const core = cls.replace(/^(?:bx|bxs|bxl)-/, '');
      const fam = base === 'bxs' ? 'Solid' : base === 'bxl' ? 'Logo' : 'Regular';
      return {
        value: `boxicons:${cls}`, label: `${humanize(core)} (${fam})`, search: `${cls} ${core} ${fam}`,
        glyph: { kind: 'font', cls: `${base} ${cls}` },
      };
    });
  } else if (set === 'mingcute') {
    out = MINGCUTE.map((cls) => ({
      value: `mingcute:${cls}`, label: humanize(cls.replace(/^mgc_/, '')), search: cls,
      glyph: { kind: 'font', cls },
    }));
  }
  cache.set(key, out);
  return out;
}

export function countFor(set: SetId): number {
  if (set === 'fa') return FA_ICONS.length;
  if (set === 'iconoir') return ICONOIR_REGULAR.length + ICONOIR_SOLID.length;
  return entriesFor(set).length;
}

/** Which set tab owns a stored value (for preselecting the explorer tab). */
export function setFor(value: string): SetId {
  if (value.startsWith('tabler:')) return 'tabler';
  if (value.startsWith('streamline:')) return 'streamline';
  if (value.startsWith('lineicons:')) return 'lineicons';
  if (value.startsWith('iconoir-')) return 'iconoir';
  if (value.startsWith('boxicons:')) return 'boxicons';
  if (value.startsWith('mingcute:')) return 'mingcute';
  return 'fa';
}

/** Which style filter owns a stored value (FA + Iconoir only, else 'all'). */
export function styleFor(value: string): string {
  if (value.startsWith('fa-regular:')) return 'fa-regular';
  if (value.startsWith('fa-brands:')) return 'fa-brands';
  if (value.startsWith('fa-solid:')) return 'fa-solid';
  if (value.startsWith('iconoir-solid:')) return 'solid';
  if (value.startsWith('iconoir-regular:')) return 'regular';
  return 'all';
}

import type { CSSProperties } from 'react';

/** Per-level typography. `inherit` / `null` means "use the parent level". */
export type FontSettings = {
  family: string; // 'inherit' or a font value like 'DM Sans'
  size: number | null; // px, null = inherit / default
  weight: number | null; // 100-900, null = inherit / default
  style: string; // 'inherit' | 'normal' | 'italic' | 'oblique'
  variant: string; // 'inherit' | css font-variant value
  effect: string; // 'inherit' | 'none' | effect id
  hover: string; // 'inherit' | 'none' | hover id
  effectColor: string; // 'inherit' | 'auto' (theme) | '#rrggbb'
  effectIntensity: number | null; // 0-100
  effectDirection: number | null; // 0-360 degrees
  effectWidth: number | null; // px, 1-10
  effectSpeed: number | null; // 0-100
  hoverColor: string;
  hoverIntensity: number | null;
  hoverDirection: number | null;
  hoverWidth: number | null;
  hoverSpeed: number | null;
};

export const INHERIT_FONT: FontSettings = {
  family: 'inherit',
  size: null,
  weight: null,
  style: 'inherit',
  variant: 'inherit',
  effect: 'inherit',
  hover: 'inherit',
  effectColor: 'inherit',
  effectIntensity: null,
  effectDirection: null,
  effectWidth: null,
  effectSpeed: null,
  hoverColor: 'inherit',
  hoverIntensity: null,
  hoverDirection: null,
  hoverWidth: null,
  hoverSpeed: null,
};

export const DEFAULT_GLOBAL_FONT: FontSettings = {
  family: 'DM Sans',
  size: null,
  weight: null,
  style: 'normal',
  variant: 'normal',
  effect: 'none',
  hover: 'none',
  effectColor: 'auto',
  effectIntensity: null,
  effectDirection: null,
  effectWidth: null,
  effectSpeed: null,
  hoverColor: 'auto',
  hoverIntensity: null,
  hoverDirection: null,
  hoverWidth: null,
  hoverSpeed: null,
};

export const FONT_FAMILIES: { value: string; label: string; stack: string }[] = [
  { value: 'DM Sans', label: 'DM Sans (Default)', stack: "'DM Sans', sans-serif" },
  { value: 'Manrope', label: 'Manrope', stack: "'Manrope', sans-serif" },
  { value: 'Inter', label: 'Inter', stack: "'Inter', sans-serif" },
  { value: 'Poppins', label: 'Poppins', stack: "'Poppins', sans-serif" },
  { value: 'Montserrat', label: 'Montserrat', stack: "'Montserrat', sans-serif" },
  { value: 'Roboto', label: 'Roboto', stack: "'Roboto', sans-serif" },
  { value: 'Open Sans', label: 'Open Sans', stack: "'Open Sans', sans-serif" },
  { value: 'Lato', label: 'Lato', stack: "'Lato', sans-serif" },
  { value: 'Nunito', label: 'Nunito', stack: "'Nunito', sans-serif" },
  { value: 'Raleway', label: 'Raleway', stack: "'Raleway', sans-serif" },
  { value: 'Space Grotesk', label: 'Space Grotesk', stack: "'Space Grotesk', sans-serif" },
  { value: 'Outfit', label: 'Outfit', stack: "'Outfit', sans-serif" },
  { value: 'Quicksand', label: 'Quicksand', stack: "'Quicksand', sans-serif" },
  { value: 'Work Sans', label: 'Work Sans', stack: "'Work Sans', sans-serif" },
  { value: 'Ubuntu', label: 'Ubuntu', stack: "'Ubuntu', sans-serif" },
  { value: 'Cabin', label: 'Cabin', stack: "'Cabin', sans-serif" },
  { value: 'Playfair Display', label: 'Playfair Display', stack: "'Playfair Display', serif" },
  { value: 'Merriweather', label: 'Merriweather', stack: "'Merriweather', serif" },
  { value: 'Georgia', label: 'Georgia (Serif)', stack: "Georgia, 'Times New Roman', serif" },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', stack: "'JetBrains Mono', monospace" },
  { value: 'Monospace', label: 'System Monospace', stack: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace" },
  { value: 'Orbitron', label: 'Orbitron (Futuristic)', stack: "'Orbitron', sans-serif" },
  { value: 'Bebas Neue', label: 'Bebas Neue (Tall)', stack: "'Bebas Neue', sans-serif" },
  { value: 'Pacifico', label: 'Pacifico (Script)', stack: "'Pacifico', cursive" },
  { value: 'Dancing Script', label: 'Dancing Script', stack: "'Dancing Script', cursive" },
  { value: 'Lobster', label: 'Lobster', stack: "'Lobster', cursive" },
  { value: 'System', label: 'System UI', stack: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
];

export const SIZE_PRESETS = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 40, 48];
export const SIZE_MIN = 8;
export const SIZE_MAX = 72;

export const WEIGHT_PRESETS: { value: number; label: string }[] = [
  { value: 100, label: '100 · Thin' },
  { value: 200, label: '200 · Extra Light' },
  { value: 300, label: '300 · Light' },
  { value: 400, label: '400 · Regular' },
  { value: 500, label: '500 · Medium' },
  { value: 600, label: '600 · Semi Bold' },
  { value: 700, label: '700 · Bold' },
  { value: 800, label: '800 · Extra Bold' },
  { value: 900, label: '900 · Black' },
];
export const WEIGHT_MIN = 100;
export const WEIGHT_MAX = 900;

export const STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'normal', label: 'Normal (upright)' },
  { value: 'italic', label: 'Italic' },
  { value: 'oblique', label: 'Oblique (slanted)' },
];

export const VARIANT_OPTIONS: { value: string; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'small-caps', label: 'Small Caps' },
  { value: 'all-small-caps', label: 'All Small Caps' },
  { value: 'petite-caps', label: 'Petite Caps' },
  { value: 'all-petite-caps', label: 'All Petite Caps' },
  { value: 'unicase', label: 'Unicase' },
  { value: 'titling-caps', label: 'Titling Caps' },
];

export const EFFECT_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'shadow-soft', label: 'Soft Shadow' },
  { value: 'shadow-hard', label: 'Hard Shadow' },
  { value: 'glow', label: 'Glow' },
  { value: 'neon', label: 'Neon Glow' },
  { value: 'outline', label: 'Outline' },
  { value: 'retro', label: 'Retro / Vintage' },
  { value: 'emboss', label: 'Embossed' },
  { value: 'etched', label: 'Engraved' },
  { value: 'threed', label: '3D Block' },
  { value: 'gradient', label: 'Gradient Text' },
];

export const HOVER_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'grow', label: 'Grow (scale up)' },
  { value: 'lift', label: 'Lift + Shadow' },
  { value: 'glow', label: 'Glow Up' },
  { value: 'neon', label: 'Neon Flicker' },
  { value: 'underline', label: 'Animated Underline' },
  { value: 'bold', label: 'Bold Pop' },
  { value: 'slant', label: 'Slant Shift' },
  { value: 'gradient', label: 'Gradient Sweep' },
  { value: 'shine', label: 'Shine Sweep' },
  { value: 'bounce', label: 'Bouncy Hop' },
  { value: 'tilt', label: 'Funky Tilt' },
  { value: 'spacing', label: 'Letter-Space Out' },
  { value: 'wiggle', label: 'Wavy Wiggle' },
];

/** Tunable knobs an effect can expose. Only applicable ones are shown per effect. */
export type EffectParam = 'color' | 'intensity' | 'direction' | 'width' | 'speed';

export const TEXT_EFFECT_PARAMS: Record<string, EffectParam[]> = {
  none: [],
  'shadow-soft': ['direction', 'intensity', 'color'],
  'shadow-hard': ['direction', 'intensity', 'color'],
  glow: ['intensity', 'color'],
  neon: ['intensity', 'color'],
  outline: ['width', 'color'],
  retro: ['direction', 'intensity', 'color'],
  emboss: ['direction', 'intensity'],
  etched: ['direction', 'intensity'],
  threed: ['direction', 'intensity'],
  gradient: ['direction', 'speed', 'color'],
};

export const HOVER_EFFECT_PARAMS: Record<string, EffectParam[]> = {
  none: [],
  grow: ['intensity'],
  lift: ['intensity', 'color'],
  glow: ['intensity', 'color'],
  neon: ['intensity', 'color', 'speed'],
  underline: ['direction', 'width', 'color'],
  bold: [],
  slant: ['intensity'],
  gradient: ['speed'],
  shine: ['speed', 'color'],
  bounce: ['intensity', 'speed'],
  tilt: ['intensity'],
  spacing: ['intensity'],
  wiggle: ['intensity', 'speed'],
};

export const PARAM_RANGES: Record<Exclude<EffectParam, 'color'>, { min: number; max: number; unit: string; label: string }> = {
  intensity: { min: 0, max: 100, unit: '', label: 'Intensity' },
  direction: { min: 0, max: 360, unit: '°', label: 'Direction' },
  width: { min: 1, max: 10, unit: 'px', label: 'Width' },
  speed: { min: 0, max: 100, unit: '', label: 'Speed' },
};

export const PARAM_DEFAULTS = { intensity: 50, direction: 90, width: 2, speed: 50 };

export const choiceLabel = (opts: { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? v;

const familyValues = new Set(FONT_FAMILIES.map((f) => f.value));
const styleValues = new Set(STYLE_OPTIONS.map((o) => o.value));
const variantValues = new Set(VARIANT_OPTIONS.map((o) => o.value));
const effectValues = new Set(EFFECT_OPTIONS.map((o) => o.value));
const hoverValues = new Set(HOVER_OPTIONS.map((o) => o.value));

const clampInt = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : typeof v === 'number' ? v : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, Math.round(n)));
};

/** Normalize `#rgb` / `#rrggbb` (any case) or return null. */
export function normHex(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const m = v.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return '#' + h.toLowerCase();
}

const normColor = (v: unknown, allowInherit: boolean): string => {
  if (v === 'inherit' && allowInherit) return 'inherit';
  if (v === 'auto') return 'auto';
  return normHex(v) ?? (allowInherit ? 'inherit' : 'auto');
};

/** Clean up stored / imported font data so old backups keep working. */
export function normFont(input: unknown, allowInherit = true): FontSettings {
  const fallback = allowInherit ? INHERIT_FONT : DEFAULT_GLOBAL_FONT;
  if (!input || typeof input !== 'object') return { ...fallback };
  const f = input as Partial<FontSettings>;
  const pick = (val: unknown, valid: Set<string>, fb: string) =>
    typeof val === 'string' && (valid.has(val) || (allowInherit && val === 'inherit')) ? val : fb;
  return {
    family:
      typeof f.family === 'string' && (familyValues.has(f.family) || (allowInherit && f.family === 'inherit'))
        ? f.family
        : fallback.family,
    size: clampInt(f.size, SIZE_MIN, SIZE_MAX),
    weight: clampInt(f.weight, WEIGHT_MIN, WEIGHT_MAX),
    style: pick(f.style, styleValues, fallback.style),
    variant: pick(f.variant, variantValues, fallback.variant),
    effect: pick(f.effect, effectValues, fallback.effect),
    hover: pick(f.hover, hoverValues, fallback.hover),
    effectColor: normColor(f.effectColor, allowInherit),
    effectIntensity: clampInt(f.effectIntensity, 0, 100),
    effectDirection: clampInt(f.effectDirection, 0, 360),
    effectWidth: clampInt(f.effectWidth, 1, 10),
    effectSpeed: clampInt(f.effectSpeed, 0, 100),
    hoverColor: normColor(f.hoverColor, allowInherit),
    hoverIntensity: clampInt(f.hoverIntensity, 0, 100),
    hoverDirection: clampInt(f.hoverDirection, 0, 360),
    hoverWidth: clampInt(f.hoverWidth, 1, 10),
    hoverSpeed: clampInt(f.hoverSpeed, 0, 100),
  };
}

export type ResolvedFont = {
  family: string; // concrete font value, never 'inherit'
  size: number | null;
  sizeFrom: 'global' | 'group' | 'bookmark' | null; // which level set the size
  weight: number | null;
  style: string;
  variant: string;
  effect: string;
  hover: string;
  effectColor: string; // 'auto' | '#rrggbb'
  effectIntensity: number;
  effectDirection: number;
  effectWidth: number | null; // null = per-effect default (1 for outline)
  effectSpeed: number;
  hoverColor: string;
  hoverIntensity: number;
  hoverDirection: number;
  hoverWidth: number | null; // null = 2 for underline
  hoverSpeed: number;
};

/** Merge global → group → bookmark, later levels winning unless set to inherit. */
export function resolveFont(
  global?: FontSettings | null,
  group?: FontSettings | null,
  bookmark?: FontSettings | null
): ResolvedFont {
  const out: ResolvedFont = {
    family: DEFAULT_GLOBAL_FONT.family,
    size: null,
    sizeFrom: null,
    weight: null,
    style: 'normal',
    variant: 'normal',
    effect: 'none',
    hover: 'none',
    effectColor: 'auto',
    effectIntensity: PARAM_DEFAULTS.intensity,
    effectDirection: PARAM_DEFAULTS.direction,
    effectWidth: null,
    effectSpeed: PARAM_DEFAULTS.speed,
    hoverColor: 'auto',
    hoverIntensity: PARAM_DEFAULTS.intensity,
    hoverDirection: PARAM_DEFAULTS.direction,
    hoverWidth: null,
    hoverSpeed: PARAM_DEFAULTS.speed,
  };
  const num = (v: number | null | undefined, min: number, max: number): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : null;
  const levels: { level?: FontSettings | null; sizeTag: 'global' | 'group' | 'bookmark' }[] = [
    { level: global, sizeTag: 'global' },
    { level: group, sizeTag: 'group' },
    { level: bookmark, sizeTag: 'bookmark' },
  ];
  for (const { level, sizeTag } of levels) {
    if (!level) continue;
    if (level.family && level.family !== 'inherit' && familyValues.has(level.family)) out.family = level.family;
    const size = num(level.size, SIZE_MIN, SIZE_MAX);
    if (size != null) {
      out.size = size;
      out.sizeFrom = sizeTag;
    }
    const weight = num(level.weight, WEIGHT_MIN, WEIGHT_MAX);
    if (weight != null) out.weight = weight;
    if (level.style && level.style !== 'inherit' && styleValues.has(level.style)) out.style = level.style;
    if (level.variant && level.variant !== 'inherit' && variantValues.has(level.variant)) out.variant = level.variant;
    if (level.effect && level.effect !== 'inherit' && effectValues.has(level.effect)) out.effect = level.effect;
    if (level.hover && level.hover !== 'inherit' && hoverValues.has(level.hover)) out.hover = level.hover;
    if (level.effectColor === 'auto' || normHex(level.effectColor)) out.effectColor = level.effectColor;
    if (level.hoverColor === 'auto' || normHex(level.hoverColor)) out.hoverColor = level.hoverColor;
    const ei = num(level.effectIntensity, 0, 100);
    if (ei != null) out.effectIntensity = ei;
    const ed = num(level.effectDirection, 0, 360);
    if (ed != null) out.effectDirection = ed;
    const ew = num(level.effectWidth, 1, 10);
    if (ew != null) out.effectWidth = ew;
    const es = num(level.effectSpeed, 0, 100);
    if (es != null) out.effectSpeed = es;
    const hi = num(level.hoverIntensity, 0, 100);
    if (hi != null) out.hoverIntensity = hi;
    const hd = num(level.hoverDirection, 0, 360);
    if (hd != null) out.hoverDirection = hd;
    const hw = num(level.hoverWidth, 1, 10);
    if (hw != null) out.hoverWidth = hw;
    const hs = num(level.hoverSpeed, 0, 100);
    if (hs != null) out.hoverSpeed = hs;
  }
  return out;
}

export function familyStack(value: string): string | undefined {
  const found = FONT_FAMILIES.find((f) => f.value === value);
  return found?.stack;
}

/** Inline styles for a resolved font (effects ship as inline style / hover classes). */
export function fontStyle(r: ResolvedFont): CSSProperties {
  const s: CSSProperties = {};
  const stack = familyStack(r.family);
  if (stack) s.fontFamily = stack;
  if (typeof r.size === 'number') s.fontSize = `${r.size}px`;
  if (typeof r.weight === 'number') s.fontWeight = r.weight;
  if (r.style && r.style !== 'normal') s.fontStyle = r.style as CSSProperties['fontStyle'];
  else if (r.style === 'normal') s.fontStyle = 'normal';
  if (r.variant && r.variant !== 'normal') s.fontVariant = r.variant;
  else if (r.variant === 'normal') s.fontVariant = 'normal';
  return s;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function setProp(s: CSSProperties, key: string, value: string | number) {
  (s as unknown as Record<string, string | number>)[key] = value;
}

/** Inline style for the static text effect, honoring its tuning knobs. */
export function effectTextStyle(r: ResolvedFont): CSSProperties {
  const s: CSSProperties = {};
  const fx = r.effect;
  if (!fx || fx === 'none') return s;
  const k = r.effectIntensity / 100; // 0..1
  const a = (r.effectDirection * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const custom = r.effectColor !== 'auto' ? r.effectColor : null;
  const at = (dist: number): [number, number] => [round2(dx * dist), round2(dy * dist)];

  switch (fx) {
    case 'shadow-soft': {
      const d = 0.5 + k * 3;
      const blur = 1 + k * 6;
      const [x, y] = at(d);
      const col = custom ? `color-mix(in srgb, ${custom} ${Math.round(25 + k * 50)}%, transparent)` : 'rgba(23,12,45,0.32)';
      s.textShadow = `${x}px ${y}px ${round2(blur)}px ${col}`;
      break;
    }
    case 'shadow-hard': {
      const d = 0.5 + k * 3;
      const [x, y] = at(d);
      const col = custom
        ? `color-mix(in srgb, ${custom} ${Math.round(30 + k * 50)}%, transparent)`
        : `color-mix(in srgb, var(--accent) ${Math.round(20 + k * 40)}%, transparent)`;
      s.textShadow = `${x}px ${y}px 0 ${col}`;
      break;
    }
    case 'glow': {
      const col = custom ?? 'var(--accent)';
      s.textShadow = `0 0 ${round2(3 + k * 10)}px ${col}, 0 0 ${round2(8 + k * 20)}px ${col}`;
      break;
    }
    case 'neon': {
      const col = custom ?? 'var(--accent)';
      s.color = custom ?? 'var(--accent-dark)';
      s.textShadow = `0 0 ${round2(2 + k * 4)}px ${col}, 0 0 ${round2(6 + k * 12)}px ${col}, 0 0 ${round2(14 + k * 24)}px ${col}`;
      break;
    }
    case 'outline': {
      const w = r.effectWidth ?? 1;
      setProp(s, 'WebkitTextStroke', `${w}px ${custom ?? 'currentColor'}`);
      setProp(s, 'paintOrder', 'stroke fill');
      break;
    }
    case 'retro': {
      const [x1, y1] = at(0.5 + k * 1.5);
      const [x2, y2] = at(1 + k * 3);
      const soft = custom ? `color-mix(in srgb, ${custom} 30%, #ffffff)` : 'var(--accent-soft)';
      const deep = custom ? `color-mix(in srgb, ${custom} 70%, transparent)` : 'color-mix(in srgb, var(--accent) 55%, transparent)';
      s.textShadow = `${x1}px ${y1}px 0 ${soft}, ${x2}px ${y2}px 0 ${deep}`;
      s.letterSpacing = '0.4px';
      break;
    }
    case 'emboss': {
      const [x, y] = at(1);
      const light = `rgba(255,255,255,${round2(0.3 + k * 0.8)})`;
      const dark = `rgba(0,0,0,${round2(0.12 + k * 0.32)})`;
      s.textShadow = `${x}px ${y}px 0 ${light}, ${-x}px ${-y}px 1px ${dark}`;
      break;
    }
    case 'etched': {
      const [x, y] = at(1);
      const dark = `rgba(0,0,0,${round2(0.15 + k * 0.4)})`;
      const light = `rgba(255,255,255,${round2(0.25 + k * 0.6)})`;
      s.textShadow = `${x}px ${y}px 1px ${dark}, ${-x}px ${-y}px 0 ${light}`;
      break;
    }
    case 'threed': {
      const step = 0.5 + k;
      const [x1, y1] = at(step);
      const [x2, y2] = at(step * 2);
      const [x3, y3] = at(step * 3);
      const [xb, yb] = at(1.5 + k * 3);
      const t1 = 'color-mix(in srgb, var(--text) 25%, transparent)';
      const t2 = 'color-mix(in srgb, var(--text) 20%, transparent)';
      s.textShadow =
        `${x1}px ${y1}px 0 ${t1}, ${x2}px ${y2}px 0 ${t2}, ${x3}px ${y3}px 0 ${t2}, ` +
        `${xb}px ${yb}px ${round2(3 + k * 6)}px rgba(0,0,0,0.25)`;
      break;
    }
    case 'gradient': {
      const stops = custom ? `${custom}, var(--accent-dark) 50%, ${custom}` : 'var(--accent-dark), var(--accent) 45%, #d99ad9 75%, var(--accent-dark)';
      s.backgroundImage = `linear-gradient(${Math.round(r.effectDirection)}deg, ${stops})`;
      s.backgroundSize = '200% 100%';
      s.backgroundClip = 'text';
      setProp(s, 'WebkitBackgroundClip', 'text');
      s.color = 'transparent';
      setProp(s, 'WebkitTextFillColor', 'transparent');
      if (r.effectSpeed > 0) s.animation = `fx-gradient-pan ${round2(12 * Math.pow(2, -r.effectSpeed / 50))}s linear infinite`;
      break;
    }
  }
  return s;
}

/** CSS variables consumed by the `:hover` rules for the active hover effect. */
export function hoverVars(r: ResolvedFont): CSSProperties {
  const v: Record<string, string> = {};
  const h = r.hover;
  if (!h || h === 'none') return v as unknown as CSSProperties;
  const custom = r.hoverColor !== 'auto' ? r.hoverColor : null;
  const dur = (base: number) => `${round2(base * Math.pow(2, 1 - r.hoverSpeed / 50))}s`;
  switch (h) {
    case 'grow':
      v['--fxh-i'] = String(r.hoverIntensity);
      break;
    case 'lift':
      v['--fxh-i'] = String(r.hoverIntensity);
      v['--fxh-c'] = custom ? `color-mix(in srgb, ${custom} 45%, transparent)` : 'color-mix(in srgb, var(--accent) 40%, transparent)';
      break;
    case 'glow':
    case 'neon':
      v['--fxh-i'] = String(r.hoverIntensity);
      v['--fxh-c'] = custom ?? 'var(--accent)';
      v['--fxh-ink'] = custom ?? 'var(--accent-dark)';
      if (h === 'neon') v['--fxh-d'] = dur(1.1);
      break;
    case 'underline': {
      v['--fxh-w'] = String(r.hoverWidth ?? 2);
      v['--fxh-c'] = custom ?? 'var(--accent)';
      const d = r.hoverDirection;
      v['--fxh-o'] = d < 150 ? 'left' : d < 210 ? 'center' : 'right';
      break;
    }
    case 'bold':
      break;
    case 'slant':
      v['--fxh-i'] = String(r.hoverIntensity);
      break;
    case 'gradient':
      v['--fxh-d'] = dur(1.4);
      break;
    case 'shine':
      v['--fxh-d'] = dur(1.0);
      v['--fxh-c'] = custom ?? '#ffffff';
      break;
    case 'bounce':
      v['--fxh-i'] = String(r.hoverIntensity);
      v['--fxh-d'] = dur(0.55);
      break;
    case 'tilt':
      v['--fxh-i'] = String(r.hoverIntensity);
      break;
    case 'spacing':
      v['--fxh-i'] = String(r.hoverIntensity);
      break;
    case 'wiggle':
      v['--fxh-i'] = String(r.hoverIntensity);
      v['--fxh-d'] = dur(0.5);
      break;
  }
  return v as unknown as CSSProperties;
}

/** Class for the hover effect (static effects are inline styles). */
export function fontClasses(r: ResolvedFont): string {
  return r.hover && r.hover !== 'none' ? `fx-hover-${r.hover}` : '';
}

/**
 * Full title styling: base font + static text effect + hover-effect variables.
 * Explicit group/bookmark sizes scale with the page (`--fs`); a global-level
 * size is applied as page zoom instead, so it is omitted here to avoid doubling.
 */
export function titleStyle(r: ResolvedFont): CSSProperties {
  const s: CSSProperties = { ...fontStyle(r), ...effectTextStyle(r), ...hoverVars(r) };
  if (r.sizeFrom === 'global' || r.size == null) delete s.fontSize;
  else s.fontSize = `calc(${r.size}px * var(--fs, 1))`;
  return s;
}

/** Global type applied to the whole app shell (size/effects stay scoped to titles). */
export function globalAppStyle(global: FontSettings): CSSProperties {
  const s: CSSProperties = {};
  if (global.family && global.family !== 'inherit') {
    const stack = familyStack(global.family);
    if (stack) s.fontFamily = stack;
  }
  if (typeof global.weight === 'number') s.fontWeight = global.weight;
  if (global.style && global.style !== 'inherit') s.fontStyle = global.style as CSSProperties['fontStyle'];
  if (global.variant && global.variant !== 'inherit') s.fontVariant = global.variant;
  return s;
}

export function isInheritFont(f: FontSettings): boolean {
  return (
    f.family === 'inherit' &&
    f.size == null &&
    f.weight == null &&
    f.style === 'inherit' &&
    f.variant === 'inherit' &&
    f.effect === 'inherit' &&
    f.hover === 'inherit' &&
    f.effectColor === 'inherit' &&
    f.effectIntensity == null &&
    f.effectDirection == null &&
    f.effectWidth == null &&
    f.effectSpeed == null &&
    f.hoverColor === 'inherit' &&
    f.hoverIntensity == null &&
    f.hoverDirection == null &&
    f.hoverWidth == null &&
    f.hoverSpeed == null
  );
}

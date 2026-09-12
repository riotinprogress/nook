import { useMemo } from 'react';
import { Icon, ICON_NAMES } from './Icon';
import { glyphFor, isSetIcon, SetGlyph } from './iconSets';

/** Renders a group icon value: built-in glyph, letter monogram, or library icon. */
export function GroupGlyph({ icon, name, text, size = 16 }: { icon: string; name: string; text?: string; size?: number }) {
  if (icon === 'letter') {
    return <span className="group-letter">{text || name.slice(0, 2).toUpperCase() || 'Aa'}</span>;
  }
  if (isSetIcon(icon)) {
    const g = glyphFor(icon);
    if (g) return <SetGlyph g={g} />;
  } else if ((ICON_NAMES as string[]).includes(icon)) {
    return <Icon name={icon as (typeof ICON_NAMES)[number]} size={size} />;
  }
  return <Icon name="folder" size={size} />;
}

/** Validate a stored hex color. */
export function normHex(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(t)) return t;
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(t);
  return short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : undefined;
}

/** Group-color swatch hexes, mirroring the `.group-icon.<color>` classes. */
const GROUP_CLASS_COLORS: Record<string, string> = {
  purple: '#a98ecd',
  peach: '#d09a72',
  green: '#7fa791',
  blue: '#7ba0c9',
  pink: '#c4849f',
  yellow: '#c2a75f',
};

const mix = (fg: string, bg: string, pct: number): string => {
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  const out = [1, 3, 5].map((i) => Math.round((ch(fg, i) * pct + ch(bg, i) * (100 - pct)) / 100));
  return '#' + out.map((n) => n.toString(16).padStart(2, '0')).join('');
};

/** Effective tile colors for a group still following its color class. */
export function groupColorDefaults(colorClass: string): { bg: string; fg: string } {
  const fg = GROUP_CLASS_COLORS[colorClass] || GROUP_CLASS_COLORS.purple!;
  const cs = getComputedStyle(document.documentElement);
  const page = normHex(cs.getPropertyValue('--bg').trim()) || '#ffffff';
  const dark = document.documentElement.dataset.mode === 'dark';
  return { bg: mix(fg, page, dark ? 26 : 15), fg };
}

function hexToHsl(hex: string): [number, number, number] {
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16) / 255;
  const r = n(1), g = n(3), b = n(5);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (t: number) => (t + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (t: number) => l - a * Math.max(-1, Math.min(k(t) - 3, Math.min(9 - k(t), 1)));
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * Random two-tone pair that fits the active theme: the hue stays analogous to
 * the theme accent, and lightness adapts to light/dark mode with tile/glyph
 * contrast built in.
 */
export function randomIconColors(): { bg: string; fg: string } {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const accent = normHex(cs.getPropertyValue('--accent').trim()) || '#8a71bb';
  const page = normHex(cs.getPropertyValue('--bg').trim()) || '#ffffff';
  const lum = [1, 3, 5].map((i) => parseInt(page.slice(i, i + 2), 16) / 255);
  const dark = root.dataset.mode === 'dark' || (0.2126 * lum[0]! + 0.7152 * lum[1]! + 0.0722 * lum[2]!) < 0.45;
  const [accentH] = hexToHsl(accent);
  const hue = (accentH + rand(-45, 45) + 360) % 360;
  if (dark) {
    return { fg: hslToHex(hue, rand(58, 76), rand(68, 79)), bg: hslToHex(hue, rand(38, 54), rand(21, 27)) };
  }
  return { fg: hslToHex(hue, rand(52, 66), rand(37, 47)), bg: hslToHex(hue, rand(58, 76), rand(88, 93)) };
}

type SectionProps = {
  icon: string;
  iconText: string;
  bg: string;
  fg: string;
  colorClass: string;
  sampleName: string;
  onIcon: (icon: string) => void;
  onIconText: (text: string) => void;
  onColors: (bg: string, fg: string) => void;
  onRandom: () => void;
  onBrowse: () => void;
};

/** Group-modal icon picker: built-ins + letter + library explorer, two-tone colors, randomizer. */
export function GroupIconSection({
  icon, iconText, bg, fg, colorClass, sampleName, onIcon, onIconText, onColors, onRandom, onBrowse,
}: SectionProps) {
  const dflt = useMemo(() => groupColorDefaults(colorClass), [colorClass]);
  const effBg = bg || dflt.bg;
  const effFg = fg || dflt.fg;
  const custom = !!(bg || fg);
  return (
    <>
      <label>Group icon</label>
      <div className="icon-options wrap">
        {ICON_NAMES.map((name) => (
          <button key={name} type="button" title={name}
            className={icon === name ? 'selected' : ''} onClick={() => onIcon(name)}>
            <Icon name={name} size={19} />
          </button>
        ))}
        <button type="button" title="Letter" className={icon === 'letter' ? 'selected' : ''}
          onClick={() => onIcon('letter')}>
          <span className="custom-brand brand-letter">
            {iconText || sampleName.slice(0, 2).toUpperCase() || 'Aa'}
          </span>
        </button>
        <button type="button" title="Browse icon libraries" aria-haspopup="dialog"
          className={isSetIcon(icon) ? 'selected' : ''} onClick={onBrowse}>
          {isSetIcon(icon)
            ? <GroupGlyph icon={icon} name={sampleName} text={iconText} size={20} />
            : <Icon name="sparkles" size={20} />}
        </button>
      </div>
      {icon === 'letter' && (
        <label className="letter-input">
          Custom letters
          <input value={iconText} maxLength={2} placeholder="Aa"
            onChange={(e) => onIconText(e.target.value)} aria-label="Custom letters" />
        </label>
      )}
      <label>Icon colors</label>
      <div className="group-icon-colors">
        <span className="group-icon preview" style={{ background: effBg, color: effFg }}>
          <GroupGlyph icon={icon} name={sampleName} text={iconText} />
        </span>
        <label className="gcolor">
          Background
          <input type="color" className="is-color" value={effBg}
            onChange={(e) => onColors(e.target.value, fg || dflt.fg)} aria-label="Icon background color" />
        </label>
        <label className="gcolor">
          Icon
          <input type="color" className="is-color" value={effFg}
            onChange={(e) => onColors(bg || dflt.bg, e.target.value)} aria-label="Icon color" />
        </label>
        <button type="button" className="secondary-button" onClick={onRandom} title="Randomize theme-matching colors">
          <Icon name="refresh" size={15} />
          Randomize
        </button>
        {custom && (
          <button type="button" className="ghost-button" onClick={() => onColors('', '')}>
            Reset
          </button>
        )}
      </div>
    </>
  );
}

export default GroupIconSection;

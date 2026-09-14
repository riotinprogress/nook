import { FA_RAW, FA_VERSION } from './faRaw';

export type FaStyle = 'fa-solid' | 'fa-regular' | 'fa-brands';
export type FaEntry = { style: FaStyle; name: string; label: string; value: string };

export const FA_VERSION_LABEL = FA_VERSION;

const humanize = (name: string) =>
  name
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

const parse = (raw: string): FaEntry => {
  const [style, name] = raw.split(':') as [FaStyle, string];
  return { style, name, label: humanize(name), value: raw };
};

export const FA_ICONS: FaEntry[] = FA_RAW.map(parse);

export const FA_STYLES: { id: FaStyle | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'fa-solid', label: 'Solid' },
  { id: 'fa-regular', label: 'Regular' },
  { id: 'fa-brands', label: 'Brands' },
];

export const isFaIcon = (value: string): value is `${FaStyle}:${string}` =>
  /^(fa-solid|fa-regular|fa-brands):[a-z0-9-]+$/.test(value);

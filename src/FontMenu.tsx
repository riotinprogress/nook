import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { SliderRow } from './SliderRow';
import {
  DEFAULT_GLOBAL_FONT,
  EFFECT_OPTIONS,
  FONT_FAMILIES,
  HOVER_EFFECT_PARAMS,
  HOVER_OPTIONS,
  INHERIT_FONT,
  PARAM_RANGES,
  SIZE_MAX,
  SIZE_MIN,
  SIZE_PRESETS,
  STYLE_OPTIONS,
  TEXT_EFFECT_PARAMS,
  VARIANT_OPTIONS,
  WEIGHT_MAX,
  WEIGHT_MIN,
  WEIGHT_PRESETS,
  choiceLabel,
  fontClasses,
  normHex,
  resolveFont,
  titleStyle,
  type EffectParam,
  type FontSettings,
  type ResolvedFont,
} from './fonts';

type Props = {
  value: FontSettings;
  onChange: (next: FontSettings) => void;
  allowInherit?: boolean;
  inheritFrom?: (FontSettings | undefined | null)[];
  sample?: string;
  idPrefix?: string;
  label?: string;
  footerHint?: string;
  sizeHint?: string;
};

type PanelKey = 'font' | 'style';
type Pos = { top: number; left: number; width: number; side: 'right' | 'left' | 'center'; maxHeight: number };

const MENU_W = 300;
const PANEL_W = 340;
const MOBILE_BP = 680;

function placeFlyout(anchor: { top: number; bottom: number; left: number; right: number }, w: number, dy = 0): Pos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw < MOBILE_BP) {
    const width = Math.min(w, vw - 24);
    const top = Math.max(10, Math.min(anchor.bottom + 8, vh - 220));
    return { top, left: Math.max(12, (vw - width) / 2), width, side: 'center', maxHeight: vh - top - 10 };
  }
  let left = anchor.right + 10;
  let side: Pos['side'] = 'right';
  if (left + w + 8 > vw) {
    left = anchor.left - w - 10;
    side = 'left';
  }
  if (left < 8) {
    left = Math.max(8, (vw - w) / 2);
    side = 'center';
  }
  const top = Math.max(10, Math.min(anchor.top + dy, vh - 220));
  return { top, left, width: w, side, maxHeight: vh - top - 10 };
}

const styleShort = (v: string) => (v === 'italic' ? 'Italic' : v === 'oblique' ? 'Oblique' : 'Normal');

export function summarizeFont(value: FontSettings, resolved: ResolvedFont, allowInherit: boolean, scope: 'all' | 'font' | 'style'): string {
  const bits: string[] = [];
  const isSet = (v: string, dflt: string) => (allowInherit ? v !== 'inherit' : v !== dflt);
  if (scope !== 'style') {
    if (isSet(value.family, 'DM Sans')) bits.push(value.family);
    if (value.size != null) bits.push(`${value.size}px`);
    if (value.weight != null) bits.push(`${value.weight}`);
  }
  if (scope !== 'font') {
    if (isSet(value.style, 'normal')) bits.push(styleShort(value.style));
    if (isSet(value.variant, 'normal')) bits.push(choiceLabel(VARIANT_OPTIONS, value.variant));
    if (resolved.effect !== 'none') bits.push(choiceLabel(EFFECT_OPTIONS, resolved.effect));
    if (resolved.hover !== 'none') bits.push(`${choiceLabel(HOVER_OPTIONS, resolved.hover)} on hover`);
  }
  if (!bits.length) return allowInherit ? 'Inherit everything' : 'Defaults';
  return bits.slice(0, 3).join(' · ') + (bits.length > 3 ? ` +${bits.length - 3}` : '');
}

function accentFallback(): string {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return normHex(v) ?? '#8a71bb';
  } catch {
    return '#8a71bb';
  }
}

function ColorRow({
  label,
  value,
  allowInherit,
  onChange,
}: {
  label: string;
  value: string;
  allowInherit: boolean;
  onChange: (v: string) => void;
}) {
  const mode = value === 'inherit' || value === 'auto' ? value : 'custom';
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const swatch = normHex(value) ?? '#8a71bb';
  return (
    <div className="fm-field">
      <span id={`${label}-label`}>{label}</span>
      <div className="fm-color-row" aria-labelledby={`${label}-label`}>
        <select value={mode} onChange={(e) => onChange(e.target.value === 'custom' ? accentFallback() : e.target.value)} aria-label={`${label} source`}>
          {allowInherit && <option value="inherit">Inherit</option>}
          <option value="auto">Auto (theme)</option>
          <option value="custom">Custom…</option>
        </select>
        {mode === 'custom' && (
          <>
            <input
              type="color"
              className="fm-swatch"
              value={swatch}
              onChange={(e) => onChange(e.target.value)}
              aria-label={`${label} color picker`}
            />
            <input
              type="text"
              className="fm-hex"
              value={text}
              spellCheck={false}
              maxLength={7}
              placeholder="#8a71bb"
              onChange={(e) => {
                setText(e.target.value);
                const n = normHex(e.target.value);
                if (n) onChange(n);
              }}
              onBlur={() => setText(value)}
              aria-label={`${label} hex color`}
            />
          </>
        )}
      </div>
    </div>
  );
}

const TEXT_FIELD: Record<EffectParam, keyof FontSettings> = {
  color: 'effectColor',
  intensity: 'effectIntensity',
  direction: 'effectDirection',
  width: 'effectWidth',
  speed: 'effectSpeed',
};
const HOVER_FIELD: Record<EffectParam, keyof FontSettings> = {
  color: 'hoverColor',
  intensity: 'hoverIntensity',
  direction: 'hoverDirection',
  width: 'hoverWidth',
  speed: 'hoverSpeed',
};

function EffectParams({
  kind,
  value,
  onChange,
  resolvedEffect,
  allowInherit,
  idPrefix,
}: {
  kind: 'text' | 'hover';
  value: FontSettings;
  onChange: (next: FontSettings) => void;
  resolvedEffect: string;
  allowInherit: boolean;
  idPrefix: string;
}) {
  if (resolvedEffect === 'none') return null;
  const map = kind === 'text' ? TEXT_EFFECT_PARAMS : HOVER_EFFECT_PARAMS;
  const params = map[resolvedEffect] ?? [];
  if (!params.length) return <p className="field-hint fm-note">This effect has no extra options.</p>;
  const fields = kind === 'text' ? TEXT_FIELD : HOVER_FIELD;
  const setParam = (p: EffectParam, v: string | number | null) => onChange({ ...value, [fields[p]]: v } as FontSettings);
  const ordered: EffectParam[] = ['color', 'intensity', 'direction', 'width', 'speed'].filter((p) => params.includes(p as EffectParam)) as EffectParam[];
  return (
    <div className="fm-params">
      {ordered.map((p) => {
        if (p === 'color') {
          const key = fields.color;
          return (
            <ColorRow
              key={`${kind}-color`}
              label={kind === 'text' ? 'Effect color' : 'Hover color'}
              value={value[key] as string}
              allowInherit={allowInherit}
              onChange={(v) => setParam('color', v)}
            />
          );
        }
        const meta = PARAM_RANGES[p];
        const key = fields[p];
        const dflt = p === 'width' ? 2 : p === 'direction' ? 90 : 50;
        return (
          <div className="fm-field" key={`${kind}-${p}`}>
            <span>{meta.label}</span>
            <SliderRow
              label={`${idPrefix} ${kind} ${meta.label.toLowerCase()}`}
              value={value[key] as number | null}
              dflt={dflt}
              min={meta.min}
              max={meta.max}
              unit={meta.unit}
              wide={p !== 'width'}
              onChange={(n) => setParam(p, n)}
            />
          </div>
        );
      })}
    </div>
  );
}

function FontPanel({
  value,
  onChange,
  allowInherit,
  sizeHint,
}: {
  value: FontSettings;
  onChange: (next: FontSettings) => void;
  allowInherit: boolean;
  sizeHint?: string;
}) {
  const set = (patch: Partial<FontSettings>) => onChange({ ...value, ...patch });
  const sizeSelect = value.size == null ? 'inherit' : SIZE_PRESETS.includes(value.size) ? String(value.size) : 'custom';
  const weightSelect =
    value.weight == null ? 'inherit' : WEIGHT_PRESETS.some((w) => w.value === value.weight) ? String(value.weight) : 'custom';
  const inheritLabel = allowInherit ? 'Inherit' : 'Default';
  return (
    <>
      <div className="fm-title">Font</div>
      <label className="fm-field">
        <span>Font</span>
        <select value={value.family} onChange={(e) => set({ family: e.target.value })} aria-label="Font family">
          {allowInherit && <option value="inherit">Inherit (use parent font)</option>}
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      <div className="fm-field">
        <span>Font size</span>
        <select
          value={sizeSelect}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'inherit') set({ size: null });
            else if (v !== 'custom') set({ size: Number(v) });
          }}
          aria-label="Font size preset"
        >
          <option value="inherit">
            {inheritLabel} (automatic size)
          </option>
          {SIZE_PRESETS.map((s) => (
            <option key={s} value={String(s)}>
              {s}px
            </option>
          ))}
          {sizeSelect === 'custom' && typeof value.size === 'number' && <option value="custom">{value.size}px (custom)</option>}
        </select>
        <SliderRow label="Font size" value={value.size} dflt={14} min={SIZE_MIN} max={SIZE_MAX} unit="px" onChange={(n) => set({ size: n })} />
        {sizeHint && <p className="field-hint fm-note">{sizeHint}</p>}
      </div>
      <div className="fm-field">
        <span>Font weight</span>
        <select
          value={weightSelect}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'inherit') set({ weight: null });
            else if (v !== 'custom') set({ weight: Number(v) });
          }}
          aria-label="Font weight preset"
        >
          <option value="inherit">
            {inheritLabel} (automatic weight)
          </option>
          {WEIGHT_PRESETS.map((w) => (
            <option key={w.value} value={String(w.value)}>
              {w.label}
            </option>
          ))}
          {weightSelect === 'custom' && typeof value.weight === 'number' && <option value="custom">{value.weight} (custom)</option>}
        </select>
        <SliderRow label="Font weight" value={value.weight} dflt={500} min={WEIGHT_MIN} max={WEIGHT_MAX} wide onChange={(n) => set({ weight: n })} />
      </div>
    </>
  );
}

function StylePanel({
  value,
  onChange,
  resolved,
  allowInherit,
  idPrefix,
}: {
  value: FontSettings;
  onChange: (next: FontSettings) => void;
  resolved: ResolvedFont;
  allowInherit: boolean;
  idPrefix: string;
}) {
  const set = (patch: Partial<FontSettings>) => onChange({ ...value, ...patch });
  return (
    <>
      <div className="fm-title">Style & effects</div>
      <div className="fm-grid">
        <label className="fm-field">
          <span>Font style</span>
          <select value={value.style} onChange={(e) => set({ style: e.target.value })} aria-label="Font style">
            {allowInherit && <option value="inherit">Inherit</option>}
            {STYLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="fm-field">
          <span>Font variant</span>
          <select value={value.variant} onChange={(e) => set({ variant: e.target.value })} aria-label="Font variant">
            {allowInherit && <option value="inherit">Inherit</option>}
            {VARIANT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="fm-field">
        <span>Text effect</span>
        <select value={value.effect} onChange={(e) => set({ effect: e.target.value })} aria-label="Text effect like glow or shadow">
          {allowInherit && <option value="inherit">Inherit</option>}
          {EFFECT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <EffectParams kind="text" value={value} onChange={onChange} resolvedEffect={resolved.effect} allowInherit={allowInherit} idPrefix={idPrefix} />
      <label className="fm-field">
        <span>Hover effect</span>
        <select value={value.hover} onChange={(e) => set({ hover: e.target.value })} aria-label="Effect when hovering over text">
          {allowInherit && <option value="inherit">Inherit</option>}
          {HOVER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <EffectParams kind="hover" value={value} onChange={onChange} resolvedEffect={resolved.hover} allowInherit={allowInherit} idPrefix={idPrefix} />
      <p className="field-hint fm-note">Hover the preview in the menu to try the hover effect.</p>
    </>
  );
}

export function FontMenu({
  value,
  onChange,
  allowInherit = true,
  inheritFrom = [],
  sample,
  idPrefix = 'font',
  label = 'Text style',
  footerHint,
  sizeHint,
}: Props) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [menuPos, setMenuPos] = useState<Pos | null>(null);
  const [panelPos, setPanelPos] = useState<Pos | null>(null);
  const [mobile, setMobile] = useState(false);
  const [hoverable] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const resolved = resolveFont(inheritFrom[0], inheritFrom[1], value);
  const title = titleStyle(resolved);
  const previewStyle = { ...title, fontSize: title.fontSize ?? '16px' };
  const previewClass = fontClasses(resolved);
  const resetLabel = allowInherit ? 'Reset to inherit' : 'Reset to defaults';

  const closeAll = () => {
    setOpen(false);
    setPanel(null);
  };

  const openMenu = () => {
    const el = triggerRef.current;
    if (!el) return;
    setMobile(window.innerWidth < MOBILE_BP);
    setMenuPos(placeFlyout(el.getBoundingClientRect(), MENU_W, -6));
    setPanel(null);
    setOpen(true);
  };

  const openPanel = (key: PanelKey, anchorEl?: HTMLElement | null) => {
    const anchor =
      anchorEl?.getBoundingClientRect() ??
      menuRef.current?.getBoundingClientRect() ??
      triggerRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const isMobile = window.innerWidth < MOBILE_BP;
    setMobile(isMobile);
    if (isMobile && menuPos) {
      const width = Math.min(PANEL_W, window.innerWidth - 24);
      setPanelPos({ ...menuPos, width, left: Math.max(12, (window.innerWidth - width) / 2) });
    } else {
      setPanelPos(placeFlyout(anchor, PANEL_W, -12));
    }
    setPanel(key);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (panel) setPanel(null);
        else closeAll();
      }
    };
    const onResize = () => closeAll();
    const onScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node) || panelRef.current?.contains(e.target as Node)) return;
      closeAll();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, panel]);

  const rowProps = (key: PanelKey) => ({
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => openPanel(key, e.currentTarget),
    ...(hoverable ? { onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => openPanel(key, e.currentTarget) } : {}),
  });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="fontmenu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? closeAll() : openMenu())}
      >
        <span className="fontmenu-aa">Aa</span>
        <span className="fontmenu-trigger-text">
          <span className="fontmenu-trigger-label">{label}</span>
          <span className="fontmenu-trigger-summary">{summarizeFont(value, resolved, allowInherit, 'all')}</span>
        </span>
        <Icon name="chevron" size={15} />
      </button>
      {open &&
        menuPos &&
        createPortal(
          <>
            <div
              className="fontmenu-overlay"
              onMouseDown={(e) => {
                e.preventDefault();
                closeAll();
              }}
            />
            <div
              ref={menuRef}
              className="fontmenu-pop fontmenu-anim"
              data-side={menuPos.side}
              role="menu"
              aria-label={label}
              style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width, maxHeight: menuPos.maxHeight }}
            >
              <div className="fontmenu-preview" aria-label="Font preview">
                <span className={previewClass} style={previewStyle}>
                  {sample || 'Ag Mm Qq 123'}
                </span>
              </div>
              <button type="button" role="menuitem" className={'fontmenu-row' + (panel === 'font' ? ' is-open' : '')} {...rowProps('font')}>
                <span className="fontmenu-row-text">
                  <span className="fontmenu-row-name">Font, size & weight</span>
                  <span className="fontmenu-row-summary">{summarizeFont(value, resolved, allowInherit, 'font')}</span>
                </span>
                <Icon name="chevron" size={14} />
              </button>
              <button type="button" role="menuitem" className={'fontmenu-row' + (panel === 'style' ? ' is-open' : '')} {...rowProps('style')}>
                <span className="fontmenu-row-text">
                  <span className="fontmenu-row-name">Style, variant & effects</span>
                  <span className="fontmenu-row-summary">{summarizeFont(value, resolved, allowInherit, 'style')}</span>
                </span>
                <Icon name="chevron" size={14} />
              </button>
              <div className="fontmenu-footer">
                <button
                  type="button"
                  className="ghost-button fontmenu-reset"
                  onClick={() => onChange({ ...(allowInherit ? INHERIT_FONT : DEFAULT_GLOBAL_FONT) })}
                >
                  {resetLabel}
                </button>
                {footerHint && <span className="fontmenu-hint">{footerHint}</span>}
              </div>
            </div>
            {panel && panelPos && (
              <div
                ref={panelRef}
                className="fontmenu-panel fontmenu-anim"
                data-side={panelPos.side}
                style={{ top: panelPos.top, left: panelPos.left, width: panelPos.width, maxHeight: panelPos.maxHeight }}
              >
                {mobile && (
                  <button type="button" className="fontmenu-back" onClick={() => setPanel(null)} aria-label="Back to text style menu">
                    ‹ Back
                  </button>
                )}
                {panel === 'font' ? (
                  <FontPanel value={value} onChange={onChange} allowInherit={allowInherit} sizeHint={sizeHint} />
                ) : (
                  <StylePanel value={value} onChange={onChange} resolved={resolved} allowInherit={allowInherit} idPrefix={idPrefix} />
                )}
              </div>
            )}
          </>,
          document.body
        )}
    </>
  );
}

export default FontMenu;

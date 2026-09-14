import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';
import { SliderRow } from './SliderRow';

/** Per-bookmark icon adjustments. Unset (null/undefined) fields render normally. */
export type IconStyle = {
  size?: number | null;
  rotate?: number | null;
  dx?: number | null;
  dy?: number | null;
  shadow?: boolean;
  shadowX?: number | null;
  shadowY?: number | null;
  shadowBlur?: number | null;
  shadowColor?: string;
};

const clampNum = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : NaN;
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : null;
};

/** Validate + normalize stored/imported icon style; undefined when effectively empty. */
export function normIconStyle(input: unknown): IconStyle | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const v = input as IconStyle;
  const out: IconStyle = {};
  const size = clampNum(v.size, 20, 300);
  const rotate = clampNum(v.rotate, -180, 180);
  const dx = clampNum(v.dx, -40, 40);
  const dy = clampNum(v.dy, -40, 40);
  if (size != null && size !== 100) out.size = size;
  if (rotate) out.rotate = rotate;
  if (dx) out.dx = dx;
  if (dy) out.dy = dy;
  if (v.shadow === true) {
    out.shadow = true;
    const sx = clampNum(v.shadowX, -20, 20);
    const sy = clampNum(v.shadowY, -20, 20);
    const blur = clampNum(v.shadowBlur, 0, 30);
    if (sx) out.shadowX = sx;
    if (sy) out.shadowY = sy;
    if (blur != null && blur !== 6) out.shadowBlur = blur;
    if (typeof v.shadowColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(v.shadowColor)) out.shadowColor = v.shadowColor;
  }
  return Object.keys(out).length ? out : undefined;
}

export function hasIconStyle(s?: IconStyle | null): boolean {
  return !!s && Object.keys(s).length > 0;
}

/** CSS applied to the icon wrapper (cards + styling preview). */
export function iconStyleCss(s?: IconStyle | null): CSSProperties | undefined {
  if (!hasIconStyle(s)) return undefined;
  const t: string[] = [];
  if (s!.dx || s!.dy) t.push(`translate(${s!.dx || 0}px, ${s!.dy || 0}px)`);
  if (s!.rotate) t.push(`rotate(${s!.rotate}deg)`);
  if (s!.size != null && s!.size !== 100) t.push(`scale(${s!.size / 100})`);
  const css: CSSProperties = {};
  if (t.length) css.transform = t.join(' ');
  if (s!.shadow) {
    css.filter = `drop-shadow(${s!.shadowX || 0}px ${s!.shadowY || 0}px ${s!.shadowBlur ?? 6}px ${s!.shadowColor || '#000000'})`;
  }
  return css;
}

type Props = {
  name: string;
  value: IconStyle;
  onChange: (next: IconStyle) => void;
  onClose: () => void;
  renderIcon: () => ReactNode;
};

/** Two-pane window: live preview + sliders for size/rotation/offset/shadow. */
export function IconStyleModal({ name, value, onChange, onClose, renderIcon }: Props) {
  const set = (patch: Partial<IconStyle>) => onChange({ ...value, ...patch });
  return (
    <div className="modal-overlay icon-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="modal icon-style-modal" role="dialog" aria-modal="true" aria-labelledby="icon-style-title">
        <button className="modal-close icon-button" onClick={onClose} aria-label="Close icon style">
          <Icon name="close" />
        </button>
        <span className="modal-symbol">
          <Icon name="sliders" size={24} />
        </span>
        <h2 id="icon-style-title">Icon style.</h2>
        <p className="modal-subtitle">Resize, rotate, nudge, and add shadow. Applies when you save.</p>
        <div className="is-panes">
          <div className="is-preview">
            <span className="site-logo is-logo" style={iconStyleCss(value)}>
              {renderIcon()}
            </span>
            <span className="is-preview-name">{name}</span>
          </div>
          <div className="is-controls">
            <p className="is-group-label">Transform</p>
            <div className="is-row">
              <span>Size</span>
              <SliderRow label="Icon size" value={value.size ?? null} dflt={100} min={20} max={300} unit="%" onChange={(n) => set({ size: n })} />
            </div>
            <div className="is-row">
              <span>Rotate</span>
              <SliderRow label="Icon rotation" value={value.rotate ?? null} dflt={0} min={-180} max={180} unit="°" onChange={(n) => set({ rotate: n })} />
            </div>
            <div className="is-row">
              <span>Offset X</span>
              <SliderRow label="Horizontal offset" value={value.dx ?? null} dflt={0} min={-40} max={40} unit="px" onChange={(n) => set({ dx: n })} />
            </div>
            <div className="is-row">
              <span>Offset Y</span>
              <SliderRow label="Vertical offset" value={value.dy ?? null} dflt={0} min={-40} max={40} unit="px" onChange={(n) => set({ dy: n })} />
            </div>
            <p className="is-group-label">Shadow</p>
            <div className="is-row">
              <span>Shadow</span>
              <button type="button" className={'toggle' + (value.shadow ? ' on' : '')} role="switch"
                aria-checked={!!value.shadow} aria-label="Icon shadow" onClick={() => set({ shadow: !value.shadow })}>
                <span />
              </button>
            </div>
            {value.shadow && (
              <>
                <div className="is-row">
                  <span>X</span>
                  <SliderRow label="Shadow horizontal offset" value={value.shadowX ?? null} dflt={0} min={-20} max={20} unit="px" onChange={(n) => set({ shadowX: n })} />
                </div>
                <div className="is-row">
                  <span>Y</span>
                  <SliderRow label="Shadow vertical offset" value={value.shadowY ?? null} dflt={0} min={-20} max={20} unit="px" onChange={(n) => set({ shadowY: n })} />
                </div>
                <div className="is-row">
                  <span>Blur</span>
                  <SliderRow label="Shadow blur" value={value.shadowBlur ?? null} dflt={6} min={0} max={30} unit="px" onChange={(n) => set({ shadowBlur: n })} />
                </div>
                <div className="is-row">
                  <span>Color</span>
                  <input type="color" className="is-color" value={value.shadowColor || '#000000'}
                    onChange={(e) => set({ shadowColor: e.target.value })} aria-label="Shadow color" />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={() => onChange({})}>
            Reset style
          </button>
          <button type="button" className="primary-button" onClick={onClose}>
            <Icon name="check" size={16} />
            Done
          </button>
        </div>
      </section>
    </div>
  );
}

export default IconStyleModal;

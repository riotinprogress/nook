import { useMemo, useState } from 'react';
import { Icon } from './Icon';
import { palettes } from './palettes';
import { VARS, hueName, norm, paletteById, paletteVars, resolveTheme, type CustomTheme, type Vars } from './theme';

/** Miniature of the Nook interface, painted with a theme's own colours. */
export function ThemePreview({ vars }: { vars: Vars }) {
  return (
    <span className="theme-preview" style={{ background: vars.bg }}>
      <span className="preview-sidebar" style={{ borderColor: vars.line }}>
        <i style={{ background: vars.accent }} />
        <i style={{ background: vars.muted }} />
        <i style={{ background: vars.muted, opacity: 0.6 }} />
        <i style={{ background: vars.muted, opacity: 0.4 }} />
      </span>
      <span className="preview-content">
        <i style={{ background: vars.accent }} />
        <span>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <i key={n} style={{ background: vars.card, borderColor: vars.line }}>
              <b style={{ background: n % 3 === 0 ? vars.accent : vars.secondary, opacity: n % 3 === 0 ? 1 : 0.55 }} />
            </i>
          ))}
        </span>
      </span>
    </span>
  );
}

type GalleryProps = {
  themeId: string;
  alts: Record<string, number>;
  customs: CustomTheme[];
  onPick: (id: string, alt: number) => void;
  onCycle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ThemeGallery({ themeId, alts, customs, onPick, onCycle, onEdit, onDelete }: GalleryProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'all' | 'dark' | 'light' | 'mine'>('all');
  const [limit, setLimit] = useState(36);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const mine = customs.map((c) => ({ id: c.id, name: c.name, dark: c.dark, custom: true, alt: 0, count: 1 }));
    const stock = palettes.map((p) => ({ id: p.i, name: p.n, dark: !!p.d, custom: false, alt: alts[p.i] ?? 0, count: p.a.length }));
    return [...mine, ...stock].filter(
      (t) =>
        (mode === 'all' || (mode === 'mine' ? t.custom : mode === 'dark' ? t.dark : !t.dark)) &&
        (!q || t.name.toLowerCase().includes(q))
    );
  }, [query, mode, alts, customs]);

  const shown = list.slice(0, limit);
  const change = (fn: () => void) => {
    fn();
    setLimit(36);
  };

  return (
    <>
      <div className="theme-filters">
        <div className="theme-search">
          <Icon name="search" size={17} />
          <input
            value={query}
            placeholder={`Search ${palettes.length} themes…`}
            onChange={(e) => change(() => setQuery(e.target.value))}
            aria-label="Search themes"
          />
          {query && (
            <button className="icon-button" onClick={() => change(() => setQuery(''))} aria-label="Clear search">
              <Icon name="close" size={15} />
            </button>
          )}
        </div>
        <div className="theme-chips" role="tablist">
          {(['all', 'dark', 'light', 'mine'] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'chip on' : 'chip'} onClick={() => change(() => setMode(m))}>
              {m === 'mine' ? 'Yours' : m[0].toUpperCase() + m.slice(1)}
              {m === 'mine' && customs.length > 0 && <span className="chip-count">{customs.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {!list.length && (
        <p className="theme-empty">
          {mode === 'mine' ? 'Edit any theme with the cog to save your own version here.' : 'No themes match that search.'}
        </p>
      )}

      <div className="theme-options" role="radiogroup" aria-label="Colour themes">
        {shown.map((t) => {
          const active = themeId === t.id;
          const resolved = resolveTheme(t.id, t.alt, customs);
          const palette = paletteById.get(t.id);
          return (
            <div key={t.id} className={'theme-option' + (active ? ' selected' : '')}>
              <button
                className="theme-option-preview"
                onClick={() => (active && t.count > 1 ? onCycle(t.id) : onPick(t.id, t.alt))}
                title={t.count > 1 ? (active ? 'Click to try the next colour variation' : `Apply ${t.name}`) : `Apply ${t.name}`}
                aria-label={active && t.count > 1 ? `Next colour variation of ${t.name}` : `Apply theme ${t.name}`}
              >
                <ThemePreview vars={resolved.vars} />
                {t.count > 1 && (
                  <span className="cycle-badge">
                    <Icon name="refresh" size={12} />
                    {t.alt + 1}/{t.count}
                  </span>
                )}
              </button>

              <div className="theme-option-label">
                <span className="theme-option-id">
                  <strong title={t.name}>{t.name}</strong>
                  <span className="theme-meta-row">
                    {t.custom ? (
                      <em className="theme-tag">Yours</em>
                    ) : (
                      <span className="alt-dots" role="group" aria-label={`${t.count} colour variations`}>
                        {(palette?.a || []).map((accent, i) => (
                          <button
                            key={accent + i}
                            className={'alt-dot' + (t.alt === i ? ' on' : '')}
                            style={{ background: norm(accent) }}
                            onClick={() => onPick(t.id, i)}
                            title={`Variation ${i + 1} of ${t.count} — ${hueName(accent)}`}
                            aria-label={`Variation ${i + 1} of ${t.count}, ${hueName(accent)}`}
                            aria-pressed={t.alt === i}
                          >
                            <span className="alt-index">{i + 1}</span>
                          </button>
                        ))}
                      </span>
                    )}
                    <small>{t.dark ? 'Dark' : 'Light'}</small>
                  </span>
                </span>

                <span className="theme-option-tools">
                  {t.custom && (
                    <button className="tool-button danger" onClick={() => onDelete(t.id)} title={`Delete ${t.name}`} aria-label={`Delete ${t.name}`}>
                      <Icon name="trash" size={15} />
                    </button>
                  )}
                  <button className="tool-button" onClick={() => onEdit(t.id)} title={`Edit the colours of ${t.name}`} aria-label={`Edit the colours of ${t.name}`}>
                    <Icon name="settings" size={16} />
                  </button>
                  <button
                    className="theme-check"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onPick(t.id, t.alt)}
                    title={active ? `${t.name} is active` : `Apply ${t.name}`}
                  >
                    {active && <Icon name="check" size={13} />}
                  </button>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {list.length > shown.length && (
        <button className="load-more" onClick={() => setLimit((l) => l + 48)}>
          Show more themes<span>{list.length - shown.length} left</span>
        </button>
      )}
    </>
  );
}

export type Draft = { sourceId: string; sourceName: string; name: string; vars: Vars; dark: boolean; isCustom: boolean };

export function makeDraft(id: string, alt: number, customs: CustomTheme[]): Draft {
  const r = resolveTheme(id, alt, customs);
  const p = paletteById.get(id);
  const base = r.custom ? r.vars : p ? paletteVars(p, alt) : r.vars;
  return {
    sourceId: id,
    sourceName: r.name,
    name: r.custom ? r.name : `${r.name} (mine)`,
    vars: { ...base },
    dark: r.dark,
    isCustom: r.custom,
  };
}

type EditorProps = {
  draft: Draft;
  onChange: (d: Draft) => void;
  onCancel: () => void;
  onSaveNew: () => void;
  onUpdate: () => void;
  onReset: () => void;
};

export function ThemeEditor({ draft, onChange, onCancel, onSaveNew, onUpdate, onReset }: EditorProps) {
  const set = (key: string, value: string) => onChange({ ...draft, vars: { ...draft.vars, [key]: value } });
  return (
    <>
      <span className="modal-symbol">
        <Icon name="sliders" size={24} />
      </span>
      <h2 id="modal-title">Mix your own.</h2>
      <p className="modal-subtitle">
        Every colour in <strong>{draft.sourceName}</strong> is yours to change — the page behind this window updates as you go.
      </p>

      <div className="editor-rows">
        {VARS.map((v) => (
          <div className="swatch-row" key={v.key}>
            <label className="swatch-chip" style={{ background: norm(draft.vars[v.key]) }} title={`Pick ${v.label.toLowerCase()}`}>
              <input type="color" value={norm(draft.vars[v.key])} onChange={(e) => set(v.key, e.target.value)} aria-label={v.label} />
            </label>
            <span className="swatch-meta">
              <strong>{v.label}</strong>
              <small>{v.hint}</small>
            </span>
            <input
              className="hex-input"
              value={draft.vars[v.key] || ''}
              spellCheck={false}
              onChange={(e) => set(v.key, e.target.value)}
              aria-label={`${v.label} hex value`}
            />
          </div>
        ))}
      </div>

      <div className="setting-row editor-mode">
        <div>
          <strong>Treat as a dark theme</strong>
          <p>Tunes group icons and shadows for darker backgrounds.</p>
        </div>
        <button
          role="switch"
          aria-checked={draft.dark}
          aria-label="Treat as a dark theme"
          className={'toggle ' + (draft.dark ? 'on' : '')}
          onClick={() => onChange({ ...draft, dark: !draft.dark })}
        >
          <span />
        </button>
      </div>

      <label className="editor-name">
        Name your theme
        <input value={draft.name} maxLength={42} placeholder="e.g. Midnight Plum" onChange={(e) => onChange({ ...draft, name: e.target.value })} />
      </label>

      <div className="modal-actions editor-actions">
        <button type="button" className="ghost-button" onClick={onReset}>
          <Icon name="refresh" size={15} />
          Reset
        </button>
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        {draft.isCustom && (
          <button type="button" className="secondary-button" onClick={onUpdate}>
            Save changes
          </button>
        )}
        <button type="button" className="primary-button" onClick={onSaveNew} disabled={!draft.name.trim()}>
          <Icon name="check" size={16} />
          Save as new theme
        </button>
      </div>
    </>
  );
}

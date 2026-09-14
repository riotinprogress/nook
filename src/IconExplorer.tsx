import { useMemo, useState } from 'react';
import { Icon } from './Icon';
import { SETS, countFor, entriesFor, SetGlyph } from './iconSets';
import type { SetId } from './iconSets';

const PAGE = 240;

type Props = {
  initialSet: SetId;
  initialStyle: string;
  current: string;
  onPick: (value: string) => void;
  onClose: () => void;
};

/** Large explorer window for browsing + searching the bundled icon libraries. */
export function IconExplorer({ initialSet, initialStyle, current, onPick, onClose }: Props) {
  const [set, setSet] = useState<SetId>(initialSet);
  const [style, setStyle] = useState(initialStyle);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const meta = SETS.find((s) => s.id === set)!;
  const total = countFor(set);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = entriesFor(set, meta.styles ? style : undefined);
    if (!q) return all;
    return all.filter((e) => e.search.toLowerCase().includes(q));
  }, [query, set, style, meta.styles]);
  const shown = list.slice(0, limit);
  const change = (fn: () => void) => {
    fn();
    setLimit(PAGE);
  };

  return (
    <div
      className="modal-overlay icon-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal icon-explorer" role="dialog" aria-modal="true" aria-labelledby="icon-explorer-title">
        <button className="modal-close icon-button" onClick={onClose} aria-label="Close icon explorer">
          <Icon name="close" />
        </button>
        <span className="modal-symbol">
          <Icon name="sparkles" size={24} />
        </span>
        <h2 id="icon-explorer-title">Icon explorer.</h2>
        <p className="modal-subtitle">
          {total.toLocaleString()} {meta.label} {meta.version} icons
          {query.trim() ? ` · ${list.length.toLocaleString()} match${list.length === 1 ? '' : 'es'}` : ''}. Pick one
          for your bookmark.
        </p>
        <div className="theme-chips icon-tabs" role="tablist" aria-label="Icon libraries">
          {SETS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === set}
              title={`${s.label} ${s.version} (${s.credit})`}
              className={s.id === set ? 'chip on' : 'chip'}
              onClick={() => change(() => { setSet(s.id); setStyle('all'); })}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="theme-filters">
          <div className="theme-search">
            <Icon name="search" size={17} />
            <input
              value={query}
              placeholder={`Search ${meta.label} icons…`}
              onChange={(e) => change(() => setQuery(e.target.value))}
              aria-label="Search icons"
            />
            {query && (
              <button className="icon-button" onClick={() => change(() => setQuery(''))} aria-label="Clear search">
                <Icon name="close" size={15} />
              </button>
            )}
          </div>
          {meta.styles && (
            <div className="theme-chips" role="tablist" aria-label="Icon styles">
              {meta.styles.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={style === s.id}
                  className={style === s.id ? 'chip on' : 'chip'}
                  onClick={() => change(() => setStyle(s.id))}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {!list.length && <p className="theme-empty">No icons match that search.</p>}

        <div className="set-grid" role="radiogroup" aria-label={`${meta.label} icons`}>
          {shown.map((e) => (
            <button
              key={e.value}
              role="radio"
              aria-checked={current === e.value}
              title={e.label}
              className={'set-cell' + (current === e.value ? ' selected' : '')}
              onClick={() => onPick(e.value)}
            >
              <SetGlyph g={e.glyph} />
              <span>{e.label}</span>
            </button>
          ))}
        </div>

        {list.length > shown.length && (
          <button className="load-more" onClick={() => setLimit((l) => l + PAGE)}>
            Show more icons<span>{list.length - shown.length} left</span>
          </button>
        )}
        <p className="icon-credits">
          Libraries: {SETS.map((s) => `${s.label} (${s.credit})`).join(' · ')}
        </p>
      </section>
    </div>
  );
}

export default IconExplorer;

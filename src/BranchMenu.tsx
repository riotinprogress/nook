import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from './Icon';

export type BranchPanel = {
  id: string;
  label: string;
  description?: string;
  /** Settings controls shown when this branch is active. */
  content: ReactNode;
};

type Props = {
  label: string;
  panels: BranchPanel[];
  defaultId?: string;
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Nook-native take on EasyUI's branching-submenu: a category rail beside an
 * animated panel. Tabs pattern (arrow keys, roving tabindex), a measured
 * sliding pill, staggered panel entrances, and no animation libraries.
 */
export function BranchMenu({ label, panels, defaultId }: Props) {
  const uid = useId();
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState(defaultId ?? panels[0]?.id);
  const activeIndex = Math.max(
    0,
    panels.findIndex((p) => p.id === activeId)
  );
  const active = panels[activeIndex];
  const railRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [pill, setPill] = useState({ x: 0, y: 0, w: 0, h: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const rail = railRef.current;
      const btn = btnRefs.current[activeIndex];
      if (!rail || !btn) return;
      const r = rail.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      setPill({ x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height });
    };
    measure();
    const rail = railRef.current;
    const ro = new ResizeObserver(measure);
    if (rail) ro.observe(rail);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [activeIndex, panels.length]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (activeIndex + 1) % panels.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (activeIndex - 1 + panels.length) % panels.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = panels.length - 1;
    if (next == null || !panels[next]) return;
    e.preventDefault();
    setActiveId(panels[next].id);
    btnRefs.current[next]?.focus();
  };

  if (!active) return null;
  return (
    <div className={'branch-menu' + (reduced ? ' reduced' : '')}>
      <div
        ref={railRef}
        role="tablist"
        aria-label={label}
        aria-orientation="vertical"
        className="branch-rail"
        onKeyDown={onKeyDown}
      >
        <span
          aria-hidden="true"
          className="branch-pill"
          style={{ transform: `translate(${pill.x}px, ${pill.y}px)`, width: pill.w, height: pill.h }}
        />
        {panels.map((p, i) => {
          const selected = i === activeIndex;
          return (
            <button
              key={p.id}
              ref={(node) => {
                btnRefs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${p.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              className={'branch-tab' + (selected ? ' is-active' : '')}
              onClick={() => setActiveId(p.id)}
            >
              <span className="branch-tab-text">
                <span className="branch-tab-label">{p.label}</span>
                {p.description && <span className="branch-tab-desc">{p.description}</span>}
              </span>
              <Icon name="chevron" size={14} className="branch-tab-chevron" />
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${active.id}`} className="branch-panel">
        <div key={active.id} className="branch-body">
          {active.content}
        </div>
      </div>
    </div>
  );
}

export default BranchMenu;

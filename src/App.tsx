import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import './index.css';
import { Icon } from './Icon';
import { palettes } from './palettes';
import { applyVars, DEFAULT_THEME, LEGACY, norm, resolveTheme, VARS, type CustomTheme, type Vars } from './theme';
import { makeDraft, ThemeEditor, ThemeGallery, type Draft } from './Themes';
import { FontMenu, summarizeFont } from './FontMenu';
import { BranchMenu, type BranchPanel } from './BranchMenu';
import { glyphFor, isSetIcon, setFor, styleFor, SetGlyph } from './iconSets';
import { IconExplorer } from './IconExplorer';
import { IconStyleModal, hasIconStyle, iconStyleCss, normIconStyle, type IconStyle } from './IconStyleModal';
import { GroupGlyph, GroupIconSection, normHex, randomIconColors } from './groupIcon';
import { SliderRow } from './SliderRow';
import {
  DEFAULT_GLOBAL_FONT,
  INHERIT_FONT,
  fontClasses,
  globalAppStyle,
  normFont,
  resolveFont,
  titleStyle,
  type FontSettings,
} from './fonts';

const sanitize = (vars: Vars, fallback: Vars): Vars =>
  Object.fromEntries(
    VARS.map((v) => [
      v.key,
      /^#?[0-9a-fA-F]{6}$/.test(String(vars[v.key] || '').trim()) ? norm(vars[v.key]) : fallback[v.key],
    ])
  );

function Brand({ kind, name, url, text }: { kind: string; name: string; url?: string; text?: string }) {
  if (kind === 'auto') return <AutoIcon url={url || ''} name={name} />;
  if (isSetIcon(kind)) {
    const g = glyphFor(kind);
    if (!g) return <span className="custom-brand brand-letter">{name.slice(0, 2).toUpperCase()}</span>;
    return <SetGlyph g={g} />;
  }
  const common = { viewBox: '0 0 40 40', width: 36, height: 36 };
  if (kind === 'figma')
    return (
      <svg {...common}>
        <path fill="#f24e1e" d="M13 2h7v12h-7a6 6 0 0 1 0-12" />
        <path fill="#ff7262" d="M20 2h7a6 6 0 0 1 0 12h-7" />
        <path fill="#a259ff" d="M13 14h7v12h-7a6 6 0 0 1 0-12" />
        <circle fill="#1abcfe" cx="26" cy="20" r="6" />
        <path fill="#0acf83" d="M13 26h7v6a6 6 0 1 1-7-6" />
      </svg>
    );
  if (kind === 'github')
    return (
      <svg {...common} fill="currentColor">
        <path d="M20 3a17 17 0 0 0-5.4 33.1c.9.2 1.2-.4 1.2-.8v-3.2c-4.9 1.1-5.9-2.1-5.9-2.1-.8-2-1.9-2.5-1.9-2.5-1.6-1.1.1-1.1.1-1.1 1.7.1 2.6 1.8 2.6 1.8 1.5 2.6 4 1.8 5.1 1.4.2-1.1.6-1.8 1.1-2.2-3.9-.4-8-2-8-8.8 0-1.9.7-3.5 1.8-4.7-.2-.4-.8-2.2.2-4.6 0 0 1.5-.5 4.9 1.8a16.6 16.6 0 0 1 8.9 0c3.4-2.3 4.9-1.8 4.9-1.8 1 2.4.4 4.2.2 4.6a6.8 6.8 0 0 1 1.8 4.7c0 6.8-4.1 8.3-8 8.8.6.5 1.2 1.6 1.2 3.2v4.7c0 .4.3 1 1.2.8A17 17 0 0 0 20 3Z" />
      </svg>
    );
  if (kind === 'notion')
    return (
      <svg {...common}>
        <path d="m6 6 24-2 5 4v27L9 37l-4-5V7Z" fill="var(--card)" stroke="currentColor" strokeWidth="2" />
        <path d="m6 6 5 4 24-2M11 10v26" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="14" y="30" fill="currentColor" fontSize="23" fontWeight="bold" fontFamily="Georgia">
          N
        </text>
      </svg>
    );
  if (kind === 'linear')
    return (
      <svg {...common}>
        <defs>
          <clipPath id="linear-clip">
            <circle cx="20" cy="20" r="16" />
          </clipPath>
        </defs>
        <g clipPath="url(#linear-clip)" fill="#6b68e9">
          <path d="M0 0h40v40Z" />
          <path d="m-6 11 35 35M-9 16l30 30M-9 23l26 26M-8 30l20 20" stroke="var(--card)" strokeWidth="2.6" />
        </g>
      </svg>
    );
  if (kind === 'slack')
    return (
      <svg {...common}>
        <g fill="#36c5f0">
          <rect x="3" y="14" width="16" height="7" rx="3.5" />
          <rect x="12" y="5" width="7" height="7" rx="3.5" />
        </g>
        <g fill="#2eb67d">
          <rect x="21" y="3" width="7" height="16" rx="3.5" />
          <rect x="30" y="12" width="7" height="7" rx="3.5" />
        </g>
        <g fill="#ecb22e">
          <rect x="21" y="21" width="16" height="7" rx="3.5" />
          <rect x="21" y="30" width="7" height="7" rx="3.5" />
        </g>
        <g fill="#e01e5a">
          <rect x="12" y="23" width="7" height="16" rx="3.5" />
          <rect x="3" y="23" width="7" height="7" rx="3.5" />
        </g>
      </svg>
    );
  if (kind === 'gmail')
    return (
      <svg {...common} fill="none" strokeWidth="6" strokeLinejoin="round">
        <path stroke="#4285f4" d="M5 33V10" />
        <path stroke="#34a853" d="M35 10v23" />
        <path stroke="#ea4335" d="m5 10 15 11 15-11" />
        <path stroke="#c5221f" d="M5 17v-7l6 4.4" />
        <path stroke="#fbbc04" d="M29 14.4 35 10v7" />
      </svg>
    );
  if (kind === 'youtube')
    return (
      <svg {...common}>
        <rect x="2" y="8" width="36" height="25" rx="8" fill="#ff0033" />
        <path d="m17 14 10 6.5L17 27Z" fill="white" />
      </svg>
    );
  if (kind === 'spotify')
    return (
      <svg {...common}>
        <circle cx="20" cy="20" r="18" fill="#1ed760" />
        <g fill="none" stroke="#143c22" strokeLinecap="round">
          <path d="M10 15c8-3 15-2 21 2" strokeWidth="3" />
          <path d="M11 21c7-2 13-1 18 2" strokeWidth="2.5" />
          <path d="M13 27c5-1.5 10-1 14 1" strokeWidth="2.2" />
        </g>
      </svg>
    );
  if (kind === 'google')
    return (
      <svg {...common} fill="none" strokeWidth="7">
        <path d="M31 10A14 14 0 0 0 8 11" stroke="#ea4335" />
        <path d="M8 11a14 14 0 0 0 0 18" stroke="#fbbc05" />
        <path d="M8 29a14 14 0 0 0 23 1" stroke="#34a853" />
        <path d="M31 30a14 14 0 0 0 3-12H20" stroke="#4285f4" />
      </svg>
    );
  if (kind === 'reddit')
    return (
      <svg {...common}>
        <circle cx="20" cy="20" r="18" fill="#ff4500" />
        <path d="m21 15 2-7 6 2" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="30" cy="10" r="3" fill="white" />
        <circle cx="9" cy="20" r="4" fill="white" />
        <circle cx="31" cy="20" r="4" fill="white" />
        <ellipse cx="20" cy="24" rx="13" ry="9" fill="white" />
        <g fill="#ff4500">
          <circle cx="15" cy="22" r="2" />
          <circle cx="25" cy="22" r="2" />
        </g>
        <path d="M15 28q5 4 10 0" fill="none" stroke="#ff4500" strokeWidth="1.5" />
      </svg>
    );
  if (kind === 'dribbble')
    return (
      <svg {...common} fill="none">
        <circle cx="20" cy="20" r="17" fill="#f5a2c5" stroke="#bd447c" strokeWidth="2" />
        <g stroke="#bd447c" strokeWidth="2">
          <path d="M11 6c10 10 15 20 17 30M4 17c13 2 23-3 29-10M8 32c6-12 15-15 29-11" />
        </g>
      </svg>
    );
  if (kind === 'pinterest')
    return (
      <svg {...common}>
        <circle cx="20" cy="20" r="18" fill="#e60023" />
        <path
          d="M17 29c2 2 4 2 6 1 6-2 9-14 3-18-5-4-15-2-16 6-1 4 1 7 3 7l1-3c-3-5 2-11 7-9 7 2 3 15-2 13-3-1 0-6 0-9-1-4-6-1-5 3l-3 15 4-1Z"
          fill="white"
        />
      </svg>
    );
  if (kind === 'awwwards') return <span className="awwwards">w.</span>;
  if (kind === 'unsplash')
    return (
      <svg {...common} fill="currentColor">
        <path d="M15 4h10v10H15ZM4 18h11v10h10V18h11v18H4Z" />
      </svg>
    );
  return (
    <span className={'custom-brand brand-' + kind}>
      {kind === 'globe' ? (
        <Icon name="link" size={27} />
      ) : kind === 'code' ? (
        '< />'
      ) : kind === 'star' ? (
        <Icon name="star" size={27} />
      ) : kind === 'heart' ? (
        '♡'
      ) : kind === 'letter' && text ? (
        text
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}

function AutoIcon({ url, name }: { url: string; name: string }) {
  const [stage, setStage] = useState(0);
  const [seenUrl, setSeenUrl] = useState(url);
  if (seenUrl !== url) {
    setSeenUrl(url);
    setStage(0);
  }
  let host = '';
  try {
    const u = new URL(url);
    if (u.protocol === 'https:' || u.protocol === 'http:') host = u.protocol + '//' + u.hostname;
  } catch {
    host = '';
  }
  const srcs = host ? [host + '/apple-touch-icon.png', host + '/favicon.ico'] : [];
  if (stage >= srcs.length) {
    return <span className="custom-brand brand-letter">{name.slice(0, 2).toUpperCase()}</span>;
  }
  return <img src={srcs[stage]} alt="" draggable={false} loading="lazy" onError={() => setStage((s) => s + 1)} />;
}

type Bookmark = {
  id: string;
  name: string;
  url: string;
  icon: string;
  iconText?: string;
  iconStyle?: IconStyle;
  favorite: boolean;
  created: number;
  font?: FontSettings;
};
type Group = {
  id: string;
  name: string;
  icon: string;
  iconText?: string;
  iconBg?: string;
  iconFg?: string;
  color: string;
  bookmarks: Bookmark[];
  collapsed?: boolean;
  font?: FontSettings;
};
type Settings = {
  newTab: boolean;
  clock: boolean;
  clock24: boolean;
  compact: boolean;
  footer: boolean;
  name: string;
  font: FontSettings;
  showBookmarkIcon: boolean;
  showBookmarkName: boolean;
  showBookmarkDomain: boolean;
  contentWidth: number;
  cardGap: number;
  sidebarWidth: number;
  sidebarMode: 'show' | 'hide' | 'hover';
};

const site = (name: string, url: string, icon: string): Bookmark => ({
  id: icon,
  name,
  url: 'https://' + url,
  icon,
  favorite: false,
  created: Date.now(),
});
const initial: Group[] = [
  {
    id: 'work',
    name: 'Work & create',
    icon: 'briefcase',
    color: 'purple',
    bookmarks: [
      site('Notion', 'notion.so', 'notion'),
      site('Figma', 'figma.com', 'figma'),
      site('GitHub', 'github.com', 'github'),
      site('Linear', 'linear.app', 'linear'),
      site('Slack', 'slack.com', 'slack'),
    ],
  },
  {
    id: 'daily',
    name: 'Daily essentials',
    icon: 'sun',
    color: 'peach',
    bookmarks: [
      site('Gmail', 'mail.google.com', 'gmail'),
      site('YouTube', 'youtube.com', 'youtube'),
      site('Spotify', 'open.spotify.com', 'spotify'),
      site('Google', 'google.com', 'google'),
      site('Reddit', 'reddit.com', 'reddit'),
    ],
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    icon: 'sparkles',
    color: 'green',
    bookmarks: [
      site('Dribbble', 'dribbble.com', 'dribbble'),
      site('Pinterest', 'pinterest.com', 'pinterest'),
      site('Awwwards', 'awwwards.com', 'awwwards'),
      site('Unsplash', 'unsplash.com', 'unsplash'),
    ],
  },
];

const DEFAULT_SETTINGS: Settings = {
  newTab: true,
  clock: true,
  clock24: false,
  compact: false,
  footer: true,
  name: '',
  font: { ...DEFAULT_GLOBAL_FONT },
  showBookmarkIcon: true,
  showBookmarkName: true,
  showBookmarkDomain: true,
  contentWidth: 1190,
  cardGap: 12,
  sidebarWidth: 232,
  sidebarMode: 'show',
};

const STORE = {
  groups: 'nook-groups',
  theme: 'nook-theme',
  alts: 'nook-alts',
  customs: 'nook-customs',
  settings: 'nook-settings',
} as const;
/** Pre-rename keys — read once so existing users keep their data. */
const LEGACY_STORE: Record<string, string> = {
  'nook-groups': 'nest-groups',
  'nook-theme': 'nest-theme',
  'nook-alts': 'nest-alts',
  'nook-customs': 'nest-customs',
  'nook-settings': 'nest-settings',
};

const clampNum = (v: unknown, min: number, max: number, dflt: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : dflt;

function saved<T>(key: string, fallback: T): T {
  try {
    const legacy = LEGACY_STORE[key];
    const value = localStorage.getItem(key) ?? (legacy ? localStorage.getItem(legacy) : null);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
const domain = (url: string) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};
const withProtocol = (value: string) => {
  const url = value.trim();
  return /^https?:\/\//i.test(url) ? url : 'https://' + url;
};
const seedIconByDomain = new Map(initial.flatMap((g) => g.bookmarks).map((b) => [domain(b.url), b.icon]));
/** Built-in artwork for known sites, otherwise 'auto' to fetch the live favicon. */
const resolveAutoIcon = (url: string): string => seedIconByDomain.get(domain(url)) || 'auto';

function normGroups(input: unknown): Group[] {
  if (!Array.isArray(input)) return initial;
  return (input as Group[]).map((g) => ({
    ...g,
    font: g && typeof g === 'object' && g.font ? normFont(g.font, true) : undefined,
    icon: typeof (g as Group).icon === 'string' && (g as Group).icon ? (g as Group).icon : 'folder',
    iconText:
      typeof (g as Group).iconText === 'string' && (g as Group).iconText
        ? (g as Group).iconText!.slice(0, 2)
        : undefined,
    iconBg: normHex((g as Group).iconBg),
    iconFg: normHex((g as Group).iconFg),
    collapsed: (g as Group).collapsed === true ? true : undefined,
    bookmarks: Array.isArray(g.bookmarks)
      ? g.bookmarks.map((b) => ({
          ...b,
          iconText:
            typeof (b as Bookmark).iconText === 'string' && (b as Bookmark).iconText
              ? (b as Bookmark).iconText!.slice(0, 2)
              : undefined,
          iconStyle: normIconStyle((b as Bookmark).iconStyle),
          font: b && typeof b === 'object' && (b as Bookmark).font ? normFont((b as Bookmark).font, true) : undefined,
        }))
      : [],
  }));
}

function App() {
  const [groups, setGroups] = useState<Group[]>(() => normGroups(saved(STORE.groups, initial)));
  const [themeId, setThemeId] = useState<string>(() => {
    const s = saved<string>(STORE.theme, DEFAULT_THEME);
    return LEGACY[s] || s;
  });
  const [alts, setAlts] = useState<Record<string, number>>(() => saved(STORE.alts, {}));
  const [customs, setCustoms] = useState<CustomTheme[]>(() => saved(STORE.customs, []));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [view, setView] = useState('all');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<'bookmark' | 'group' | 'themes' | 'settings' | 'editor' | null>(null);
  const [bookmarkForm, setBookmarkForm] = useState({
    id: '',
    name: '',
    url: '',
    icon: 'auto',
    iconText: '',
    iconStyle: {} as IconStyle,
    group: 'work',
    font: { ...INHERIT_FONT } as FontSettings,
  });
  const [groupForm, setGroupForm] = useState({
    id: '',
    name: '',
    color: 'purple',
    icon: 'folder',
    iconText: '',
    iconBg: '',
    iconFg: '',
    font: { ...INHERIT_FONT } as FontSettings,
  });
  const [formError, setFormError] = useState('');
  const [menu, setMenu] = useState<string | null>(null);
  const [libOpen, setLibOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [drag, setDrag] = useState<{ id: string; group: string } | null>(null);
  const [dropTarget, setDropTarget] = useState('');
  const [groupDrag, setGroupDrag] = useState<string | null>(null);
  const [groupDrop, setGroupDrop] = useState<{ id: string; after: boolean } | null>(null);
  const [toast, setToast] = useState('');
  const [now, setNow] = useState(new Date());
  const [settings, setSettings] = useState<Settings>(() => {
    const s = saved<Partial<Settings>>(STORE.settings, DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...s,
      font: normFont((s as Settings)?.font, false),
      showBookmarkIcon: (s as Settings)?.showBookmarkIcon !== false,
      showBookmarkName: (s as Settings)?.showBookmarkName !== false,
      showBookmarkDomain: (s as Settings)?.showBookmarkDomain !== false,
      contentWidth: clampNum((s as Settings)?.contentWidth, 640, 2000, DEFAULT_SETTINGS.contentWidth),
      cardGap: clampNum((s as Settings)?.cardGap, 0, 48, DEFAULT_SETTINGS.cardGap),
      sidebarWidth: clampNum((s as Settings)?.sidebarWidth, 160, 480, DEFAULT_SETTINGS.sidebarWidth),
      sidebarMode: ['show', 'hide', 'hover'].includes((s as Settings)?.sidebarMode as string)
        ? ((s as Settings).sidebarMode as Settings['sidebarMode'])
        : 'show',
    };
  });
  const [sidePeek, setSidePeek] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const libOpenRef = useRef(false);
  libOpenRef.current = libOpen;
  const styleOpenRef = useRef(false);
  styleOpenRef.current = styleOpen;
  const total = groups.reduce((n, g) => n + g.bookmarks.length, 0);
  const current = useMemo(() => resolveTheme(themeId, alts[themeId] ?? 0, customs), [themeId, alts, customs]);
  const globalFont = useMemo(() => normFont(settings.font, false), [settings.font]);
  const appFontStyle = useMemo(() => globalAppStyle(globalFont), [globalFont]);
  // Overall font size scales every font on the page (100% at 16px).
  const fontScale = globalFont.size == null ? 1 : globalFont.size / 16;
  const appStyle = useMemo(
    () => ({ ...appFontStyle, '--sbw': `${settings.sidebarWidth}px` }) as CSSProperties,
    [appFontStyle, settings.sidebarWidth]
  );
  useEffect(() => {
    document.documentElement.style.setProperty('--fs', String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem(STORE.groups, JSON.stringify(groups));
  }, [groups]);
  useEffect(() => {
    localStorage.setItem(STORE.theme, JSON.stringify(themeId));
  }, [themeId]);
  useEffect(() => {
    localStorage.setItem(STORE.alts, JSON.stringify(alts));
  }, [alts]);
  useEffect(() => {
    localStorage.setItem(STORE.customs, JSON.stringify(customs));
  }, [customs]);
  useEffect(() => {
    const live = modal === 'editor' && draft;
    applyVars(live ? sanitize(draft.vars, current.vars) : current.vars, live ? draft.dark : current.dark);
  }, [current, draft, modal]);
  useEffect(() => {
    localStorage.setItem(STORE.settings, JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3200);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (styleOpenRef.current) {
          setStyleOpen(false);
          return;
        }
        if (libOpenRef.current) {
          setLibOpen(false);
          return;
        }
        setModal(null);
        setDraft(null);
        setMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const notify = (text: string) => setToast(text);

  function openAdd(group?: string, b?: Bookmark) {
    setBookmarkForm({
      id: b?.id || '',
      name: b?.name || '',
      url: b?.url || '',
      icon: b?.icon || 'auto',
      iconText: b?.iconText || '',
      iconStyle: b?.iconStyle ? { ...b.iconStyle } : {},
      group: group || groups[0]?.id || '',
      font: b?.font ? normFont(b.font, true) : { ...INHERIT_FONT },
    });
    setFormError('');
    setModal('bookmark');
    setMenu(null);
  }

  function saveBookmark(e: FormEvent) {
    e.preventDefault();
    const url = withProtocol(bookmarkForm.url);
    try {
      const u = new URL(url);
      if (!u.hostname.includes('.') || !['https:', 'http:'].includes(u.protocol)) throw Error();
    } catch {
      setFormError('Enter a valid website address, like example.com.');
      return;
    }
    if (!bookmarkForm.group) {
      setFormError('Create a group first to save your bookmark.');
      return;
    }
    const old = groups.flatMap((g) => g.bookmarks).find((b) => b.id === bookmarkForm.id);
    const b: Bookmark = {
      id: bookmarkForm.id || crypto.randomUUID(),
      name: bookmarkForm.name.trim() || domain(url),
      url,
      icon: bookmarkForm.icon === 'auto' ? resolveAutoIcon(url) : bookmarkForm.icon,
      iconText:
        bookmarkForm.icon === 'letter' && bookmarkForm.iconText.trim()
          ? bookmarkForm.iconText.trim().slice(0, 2)
          : undefined,
      iconStyle: normIconStyle(bookmarkForm.iconStyle),
      favorite: old?.favorite || false,
      created: old?.created || Date.now(),
      font: normFont(bookmarkForm.font, true),
    };
    setGroups((gs) =>
      gs.map((g) => {
        const existing = g.bookmarks.findIndex((x) => x.id === b.id);
        const bookmarks = g.bookmarks.filter((x) => x.id !== b.id);
        if (g.id === bookmarkForm.group) bookmarks.splice(existing >= 0 ? existing : bookmarks.length, 0, b);
        return { ...g, bookmarks };
      })
    );
    setModal(null);
    notify(old ? 'Bookmark updated' : 'A new favorite place, saved.');
  }

  function saveGroup(e: FormEvent) {
    e.preventDefault();
    if (!groupForm.name.trim()) return;
    const id = groupForm.id || crypto.randomUUID();
    const font = normFont(groupForm.font, true);
    setGroups((gs) =>
      groupForm.id
        ? gs.map((g) =>
            g.id === id
              ? {
                  ...g,
                  name: groupForm.name.trim(),
                  color: groupForm.color,
                  icon: groupForm.icon || 'folder',
                  iconText: groupForm.icon === 'letter' && groupForm.iconText.trim() ? groupForm.iconText.trim().slice(0, 2) : undefined,
                  iconBg: normHex(groupForm.iconBg),
                  iconFg: normHex(groupForm.iconFg),
                  font,
                }
              : g
          )
        : [
            ...gs,
            {
              id,
              name: groupForm.name.trim(),
              color: groupForm.color,
              icon: groupForm.icon || 'folder',
              iconText: groupForm.icon === 'letter' && groupForm.iconText.trim() ? groupForm.iconText.trim().slice(0, 2) : undefined,
              iconBg: normHex(groupForm.iconBg),
              iconFg: normHex(groupForm.iconFg),
              bookmarks: [],
              font,
            },
          ]
    );
    setModal(null);
    notify(groupForm.id ? 'Group updated' : 'Your new group is ready');
  }

  function pickTheme(id: string, alt: number) {
    setThemeId(id);
    setAlts((a) => ({ ...a, [id]: alt }));
    const r = resolveTheme(id, alt, customs);
    notify(r.name + (r.altCount > 1 ? ' · variation ' + (alt + 1) : '') + ' applied');
  }
  function cycleTheme(id: string) {
    const count = Math.max(1, resolveTheme(id, 0, customs).altCount);
    const next = ((alts[id] ?? 0) + 1) % count;
    setThemeId(id);
    setAlts((a) => ({ ...a, [id]: next }));
    const r = resolveTheme(id, next, customs);
    notify(r.name + ' · variation ' + (next + 1) + ' of ' + count);
  }
  function openEditor(id: string) {
    setDraft(makeDraft(id, alts[id] ?? 0, customs));
    setModal('editor');
  }
  function saveNewTheme() {
    if (!draft) return;
    const name = draft.name.trim() || 'My theme';
    const id = 'my-' + crypto.randomUUID().slice(0, 8);
    setCustoms((c) => [{ id, name, dark: draft.dark, vars: sanitize(draft.vars, current.vars), from: draft.sourceName }, ...c]);
    setThemeId(id);
    setDraft(null);
    setModal('themes');
    notify('“' + name + '” saved to your themes');
  }
  function updateTheme() {
    if (!draft) return;
    const name = draft.name.trim() || 'My theme';
    setCustoms((c) => c.map((t) => (t.id === draft.sourceId ? { ...t, name, dark: draft.dark, vars: sanitize(draft.vars, current.vars) } : t)));
    setDraft(null);
    setModal('themes');
    notify('Theme updated');
  }
  function deleteCustom(id: string) {
    const t = customs.find((c) => c.id === id);
    if (!t || !confirm('Delete “' + t.name + '”?')) return;
    setCustoms((c) => c.filter((x) => x.id !== id));
    if (themeId === id) setThemeId(DEFAULT_THEME);
    notify('Theme deleted');
  }
  function newGroup() {
    setGroupForm({ id: '', name: '', color: 'purple', icon: 'folder', iconText: '', iconBg: '', iconFg: '', font: { ...INHERIT_FONT } });
    setModal('group');
  }
  function editGroup(g: Group) {
    setGroupForm({ id: g.id, name: g.name, color: g.color, icon: g.icon || 'folder', iconText: g.iconText || '', iconBg: g.iconBg || '', iconFg: g.iconFg || '', font: g.font ? normFont(g.font, true) : { ...INHERIT_FONT } });
    setModal('group');
    setMenu(null);
  }
  function moveBookmark(target: string, before?: string) {
    if (!drag) return;
    if (before === drag.id) {
      setDrag(null);
      setDropTarget('');
      return;
    }
    setGroups((gs) => {
      const bookmark = gs.find((g) => g.id === drag.group)?.bookmarks.find((b) => b.id === drag.id);
      if (!bookmark) return gs;
      return gs.map((g) => {
        const bookmarks = g.bookmarks.filter((b) => b.id !== drag.id);
        if (g.id === target) {
          const index = before ? bookmarks.findIndex((b) => b.id === before) : -1;
          bookmarks.splice(index < 0 ? bookmarks.length : index, 0, bookmark);
        }
        return { ...g, bookmarks };
      });
    });
    setDrag(null);
    setDropTarget('');
  }
  function dropGroup(targetId: string, after: boolean) {
    if (!groupDrag || groupDrag === targetId) {
      setGroupDrag(null);
      setGroupDrop(null);
      return;
    }
    setGroups((gs) => {
      const from = gs.findIndex((x) => x.id === groupDrag);
      const without = gs.filter((x) => x.id !== groupDrag);
      const to = without.findIndex((x) => x.id === targetId);
      if (from < 0 || to < 0) return gs;
      const next = [...without];
      next.splice(after ? to + 1 : to, 0, gs[from]);
      return next;
    });
    setGroupDrag(null);
    setGroupDrop(null);
  }
  function armGroupDrag(e: React.MouseEvent, on: boolean) {
    const sec = (e.currentTarget as HTMLElement).closest('.bookmark-group') as HTMLElement | null;
    if (sec) sec.draggable = on;
  }
  function startSidebarResize(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = settings.sidebarWidth;
    setResizing(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
    const move = (ev: MouseEvent) => {
      const w = Math.max(160, Math.min(480, Math.round(startW + ev.clientX - startX)));
      setSettings((s) => ({ ...s, sidebarWidth: w }));
    };
    const up = () => {
      setResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }
  function deleteBookmark(id: string) {
    setGroups((gs) => gs.map((g) => ({ ...g, bookmarks: g.bookmarks.filter((b) => b.id !== id) })));
    setMenu(null);
    notify('Bookmark removed');
  }
  function favorite(id: string) {
    setGroups((gs) => gs.map((g) => ({ ...g, bookmarks: g.bookmarks.map((b) => (b.id === id ? { ...b, favorite: !b.favorite } : b)) })));
    setMenu(null);
  }

  const changeView = (next: string) => {
    setView(next);
    setQuery('');
    setMobileOpen(false);
  };

  const filteredGroups = groups
    .filter((g) => ['all', 'favorites', 'recent'].includes(view) || g.id === view)
    .map((g) => ({
      ...g,
      bookmarks: g.bookmarks
        .filter(
          (b) =>
            (view !== 'favorites' || b.favorite) &&
            (!query || (b.name + ' ' + b.url + ' ' + g.name).toLowerCase().includes(query.toLowerCase()))
        )
        .sort((a, b) => (view === 'recent' ? b.created - a.created : 0)),
    }))
    .filter((g) => (!query && view !== 'favorites') || g.bookmarks.length > 0);

  const visibleCount = filteredGroups.reduce((n, g) => n + g.bookmarks.length, 0);
  const pageName =
    view === 'all'
      ? 'All bookmarks'
      : view === 'favorites'
        ? 'Favorites'
        : view === 'recent'
          ? 'Recently added'
          : groups.find((g) => g.id === view)?.name || 'All bookmarks';
  const shownParts = [
    settings.showBookmarkIcon && 'Icons',
    settings.showBookmarkName && 'Names',
    settings.showBookmarkDomain && 'Domains',
  ].filter(Boolean) as string[];
  const bookmarkSummary = shownParts.length ? shownParts.join(' · ') : 'All hidden';
  const typeSummary = summarizeFont(globalFont, resolveFont(globalFont), false, 'all');
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const detailPanels: BranchPanel[] = [
    {
      id: 'typography',
      label: 'Typography.',
      description: typeSummary,
      content: (
        <>
            <p>Set the overall font for your space. Groups and bookmarks can override it.</p>
            <FontMenu
              value={globalFont}
              onChange={(font) => setSettings({ ...settings, font: normFont(font, false) })}
              allowInherit={false}
              inheritFrom={[]}
              sample={settings.name ? `${settings.name}’s space` : 'Your personal space'}
              idPrefix="global-font"
              label="Typography"
              footerHint="Changes are saved automatically"
              sizeHint="100% at 16px — scales all text on the page."
            />
        </>
      ),
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks.',
      description: bookmarkSummary,
      content: (
        <>
            <p>Choose what each card shows, and how the grid is laid out.</p>
            <div className="settings-list">
              {
                [
                  { key: 'showBookmarkIcon' as const, title: 'Bookmark icons', sub: 'Show each site’s logo or letter.' },
                  { key: 'showBookmarkName' as const, title: 'Bookmark names', sub: 'Show the name on each card.' },
                  { key: 'showBookmarkDomain' as const, title: 'Website addresses', sub: 'Show the domain under each name.' },
                ].map((s) => (
                  <div className="setting-row" key={s.key}>
                    <div>
                      <strong>{s.title}</strong>
                      <p>{s.sub}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={settings[s.key]}
                      aria-label={s.title}
                      className={'toggle ' + (settings[s.key] ? 'on' : '')}
                      onClick={() => setSettings({ ...settings, [s.key]: !settings[s.key] })}
                    >
                      <span />
                    </button>
                  </div>
                ))
              }
            </div>
            <div className="setting-slider">
              <div>
                <strong>Content width</strong>
                <p>How wide the bookmark area gets.</p>
              </div>
              <SliderRow
                label="Content width"
                value={settings.contentWidth}
                dflt={DEFAULT_SETTINGS.contentWidth}
                min={640}
                max={2000}
                unit="px"
                wide
                onChange={(n) => n != null && setSettings({ ...settings, contentWidth: n })}
              />
            </div>
            <div className="setting-slider">
              <div>
                <strong>Space between cards</strong>
                <p>Padding around each bookmark.</p>
              </div>
              <SliderRow
                label="Space between cards"
                value={settings.cardGap}
                dflt={DEFAULT_SETTINGS.cardGap}
                min={0}
                max={48}
                unit="px"
                onChange={(n) => n != null && setSettings({ ...settings, cardGap: n })}
              />
            </div>
        </>
      ),
    },
  ];
  const formUrl = withProtocol(bookmarkForm.url);
  const bookmarkParentGroup = groups.find((g) => g.id === bookmarkForm.group);

  const peeking = settings.sidebarMode === 'hover' && sidePeek;
  return (
    <div
      className={'app ' + (settings.compact ? 'compact' : '') + (peeking ? ' sidebar-peek' : '')}
      style={appStyle}
      data-sidebar={settings.sidebarMode}
    >
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      {settings.sidebarMode === 'hover' && (
        <div className="sidebar-hoverzone" aria-hidden="true" onMouseEnter={() => setSidePeek(true)} />
      )}
      <aside
        className={'sidebar ' + (mobileOpen ? 'is-open' : '')}
        onMouseLeave={() => {
          if (settings.sidebarMode === 'hover') setSidePeek(false);
        }}
      >
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            changeView('all');
          }}
        >
          <span className="nook-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          nook<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">
          YOUR SPACE <span>⌘</span>
        </div>
        <nav className="main-nav">
          <button className={view === 'all' ? 'active' : ''} onClick={() => changeView('all')}>
            <Icon name="grid" size={18} />
            All bookmarks<span className="nav-count">{total}</span>
          </button>
          <button className={view === 'favorites' ? 'active' : ''} onClick={() => changeView('favorites')}>
            <Icon name="star" size={18} />
            Favorites
          </button>
          <button className={view === 'recent' ? 'active' : ''} onClick={() => changeView('recent')}>
            <Icon name="clock" size={18} />
            Recently added
          </button>
        </nav>
        <div className="workspace-label groups-label">
          MY GROUPS{' '}
          <button title="Create group" onClick={newGroup}>
            <Icon name="plus" size={15} />
          </button>
        </div>
        <nav className="group-nav">
          {groups.map((g) => {
            const resolved = resolveFont(globalFont, g.font);
            const navStyle = titleStyle(resolved);
            delete navStyle.fontSize; // group size never resizes the sidebar
            return (
              <button
                key={g.id}
                className={(view === g.id ? 'active ' : '') + (dropTarget === 'nav-' + g.id ? 'nav-drop' : '')}
                onClick={() => changeView(g.id)}
                onDragOver={(e) => {
                  if (groupDrag) return;
                  e.preventDefault();
                  setDropTarget('nav-' + g.id);
                }}
                onDrop={(e) => {
                  if (groupDrag) return;
                  e.preventDefault();
                  moveBookmark(g.id);
                }}
              >
                <span className={'group-dot ' + g.color} />
                <span className={'group-nav-name ' + fontClasses(resolved)} style={navStyle}>
                  {g.name}
                </span>
                <span className="group-nav-count">{g.bookmarks.length}</span>
              </button>
            );
          })}
          <button className="new-group" onClick={newGroup}>
            <Icon name="plus" size={17} />
            New group
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="theme-widget" onClick={() => setModal('themes')}>
            <span className="theme-widget-top">
              <span>
                <Icon name="palette" size={17} />
                Make it your own
              </span>
              <Icon name="chevron" size={15} />
            </span>
            <span className="theme-swatches">
              {[current.vars.accent, current.vars.accentSoft, current.vars.line, current.vars.text].map((c, i) => (
                <i style={{ background: c }} key={i} />
              ))}
              <span title={current.name}>{current.name}</span>
            </span>
          </button>
          <button className="sidebar-setting" onClick={() => setModal('themes')}>
            <Icon name="palette" size={18} />
            Themes<span className="new-badge">{palettes.length}</span>
          </button>
          <button className="sidebar-setting" onClick={() => setModal('settings')}>
            <Icon name="settings" size={18} />
            Settings
          </button>
          <div className="local-profile">
            <span className="avatar">{settings.name ? settings.name[0].toUpperCase() : 'Y'}</span>
            <div>
              <strong>{settings.name ? settings.name + '’s space' : 'Your personal space'}</strong>
              <span>
                <i />
                Saved on this device
              </span>
            </div>
            <Icon name="chevron" size={14} />
          </div>
        </div>
        <div
          className={'sidebar-resize' + (resizing ? ' is-dragging' : '')}
          title="Drag to resize the sidebar · double-click to reset"
          onMouseDown={startSidebarResize}
          onDoubleClick={() => setSettings((s) => ({ ...s, sidebarWidth: DEFAULT_SETTINGS.sidebarWidth }))}
        />
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Icon name="grid" />
            </button>
            <span className="desktop-home">
              <Icon name="grid" size={16} />
            </span>
            <span className="breadcrumb-divider">/</span>
            <span>{pageName}</span>
          </div>
          <div className="topbar-actions">
            <span className="local-status">
              <span /> All changes saved
            </span>
            <button className="icon-button" title="Change theme" onClick={() => setModal('themes')}>
              <Icon name={current.dark ? 'moon' : 'sun'} size={19} />
            </button>
            <span className="topbar-divider" />
            <button className="primary-button add-top" onClick={() => openAdd()}>
              <Icon name="plus" size={17} />
              Add bookmark
            </button>
          </div>
        </header>

        <main style={{ maxWidth: settings.contentWidth }}>
          <section className="welcome">
            <div>
              <div className="eyebrow">
                <span /> A LITTLE SPACE. A CLEARER MIND.
              </div>
              <h1>
                {greeting}
                {settings.name ? ', ' + settings.name : ''}
                <span className="greeting-dot">.</span>{' '}
                <span className="sun-doodle">
                  <Icon name="sun" size={31} />
                </span>
              </h1>
              <p>Your favorite corners of the internet, all in one place.</p>
            </div>
            {settings.clock && (
              <div className="clock">
                <div>
                  {now
                    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: !settings.clock24 })
                    .replace(/\s?[AP]M$/i, '')}
                  {!settings.clock24 && <span>{hour >= 12 ? 'PM' : 'AM'}</span>}
                </div>
                <p>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            )}
          </section>

          <form
            className="search-box"
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank', 'noopener,noreferrer');
            }}
          >
            <Icon name="search" size={21} />
            <input
              ref={searchRef}
              placeholder="Search your bookmarks or search the web..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query ? (
              <>
                <button type="button" className="icon-button" onClick={() => setQuery('')} title="Clear search">
                  <Icon name="close" size={16} />
                </button>
                <button className="search-web" type="submit">
                  Search web <Icon name="arrow" size={15} />
                </button>
              </>
            ) : (
              <kbd>
                ⌘ <span>K</span>
              </kbd>
            )}
          </form>

          <div className="collection-toolbar">
            <div>
              <h2>{query ? 'Search results' : pageName}</h2>
              <span className="count-badge">{query || view !== 'all' ? visibleCount : total}</span>
            </div>
            <div>
              <span className="drag-hint">
                <Icon name="grip" size={14} />
                Drag to make it yours
              </span>
              <span className="toolbar-divider" />
              <button onClick={newGroup}>
                <Icon name="plus" size={15} />
                New group
              </button>
            </div>
          </div>

          <div className="collections">
            {filteredGroups.map((g, index) => {
              const groupResolved = resolveFont(globalFont, g.font);
              const groupStyle = titleStyle(groupResolved);
              const groupClass = fontClasses(groupResolved);
              return (
                <section
                  key={g.id}
                  className={
                    'bookmark-group ' +
                    (dropTarget === g.id ? 'group-drag-over ' : '') +
                    (groupDrag === g.id ? 'group-dragging ' : '') +
                    (groupDrop?.id === g.id ? (groupDrop.after ? 'group-drop-after' : 'group-drop-before') : '')
                  }
                  style={{ '--group-index': index } as CSSProperties}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    try {
                      e.dataTransfer.setData('text/plain', 'group:' + g.id);
                    } catch {
                      /* some browsers restrict setData — dragging still works */
                    }
                    setGroupDrag(g.id);
                    setMenu(null);
                  }}
                  onDragEnd={(e) => {
                    (e.currentTarget as HTMLElement).draggable = false;
                    setGroupDrag(null);
                    setGroupDrop(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (groupDrag) {
                      if (groupDrag === g.id) return;
                      const r = e.currentTarget.getBoundingClientRect();
                      setGroupDrop({ id: g.id, after: e.clientY > r.top + r.height / 2 });
                    } else if (drag) {
                      setDropTarget(g.id);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (groupDrag) {
                      const r = e.currentTarget.getBoundingClientRect();
                      dropGroup(g.id, e.clientY > r.top + r.height / 2);
                    } else {
                      moveBookmark(g.id);
                    }
                  }}
                >
                  <div className="group-heading">
                    <div className="group-title-zone">
                      <span
                        className="group-grip"
                        title="Drag to reorder this group"
                        onMouseDown={(e) => armGroupDrag(e, true)}
                        onMouseUp={(e) => armGroupDrag(e, false)}
                      >
                        <Icon name="grip" size={13} />
                      </span>
                      <span
                        className={'group-icon ' + g.color}
                        style={g.iconBg || g.iconFg ? { background: g.iconBg, color: g.iconFg } : undefined}
                      >
                        <GroupGlyph icon={g.icon} name={g.name} text={g.iconText} />
                      </span>
                      <h3 className={groupClass} style={groupStyle}>
                        {g.name}
                      </h3>
                      <span className="group-number">{g.bookmarks.length}</span>
                    </div>
                    <div className="group-controls">
                      <button className="icon-button" title={'Add to ' + g.name} onClick={() => openAdd(g.id)}>
                        <Icon name="plus" size={17} />
                      </button>
                      <div className="menu-container">
                        <button className="icon-button" title={'Options for ' + g.name} onClick={() => setMenu(menu === g.id ? null : g.id)}>
                          <Icon name="more" size={19} />
                        </button>
                        {menu === g.id && (
                          <div className="dropdown">
                            <button onClick={() => editGroup(g)}>
                              <Icon name="edit" size={15} />
                              Edit group
                            </button>
                            <button
                              className="danger"
                              onClick={() => {
                                setMenu(null);
                                if (confirm(`Delete “${g.name}” and its ${g.bookmarks.length} bookmarks?`)) {
                                  setGroups((gs) => gs.filter((x) => x.id !== g.id));
                                  if (view === g.id) setView('all');
                                  notify('Group deleted');
                                }
                              }}
                            >
                              <Icon name="trash" size={15} />
                              Delete group
                            </button>
                          </div>
                        )}
                      </div>
                    <button
                        className={'icon-button collapse-btn' + (g.collapsed ? '' : ' open')}
                        title={(g.collapsed ? 'Expand ' : 'Collapse ') + g.name}
                        aria-expanded={!g.collapsed}
                        onClick={() =>
                          setGroups((gs) => gs.map((x) => (x.id === g.id ? { ...x, collapsed: !x.collapsed } : x)))
                        }
                      >
                        <Icon name="chevron" size={17} />
                      </button>
                    </div>
                  </div>

                  {!g.collapsed && (
                  <div className="bookmark-grid" style={{ gap: settings.cardGap }}>
                    {g.bookmarks.map((b) => {
                      const resolved = resolveFont(globalFont, g.font, b.font);
                      const style = titleStyle(resolved);
                      const cls = fontClasses(resolved);
                      return (
                        <div
                          className={
                            'bookmark-card ' + (drag?.id === b.id ? 'dragging ' : '') + (dropTarget === b.id ? 'drop-before' : '')
                          }
                          key={b.id}
                          draggable
                          onDragStart={(e) => {
                            setDrag({ id: b.id, group: g.id });
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', b.id);
                            setMenu(null);
                          }}
                          onDragEnd={() => {
                            setDrag(null);
                            setDropTarget('');
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (groupDrag) return;
                            setDropTarget(b.id);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (groupDrag) return;
                            moveBookmark(g.id, b.id);
                          }}
                        >
                          <a
                            href={b.url}
                            target={settings.newTab ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            draggable={false}
                            className="bookmark-link"
                          >
                            {settings.showBookmarkIcon && (
                              <span className="site-logo" style={iconStyleCss(b.iconStyle)}>
                                <Brand kind={b.icon} name={b.name} url={b.url} text={b.iconText} />
                              </span>
                            )}
                            {settings.showBookmarkName && (
                              <strong className={cls} style={style}>
                                {b.name}
                              </strong>
                            )}
                            {settings.showBookmarkDomain && <span className="site-domain">{domain(b.url)}</span>}
                            <span className="visit-arrow">
                              <Icon name="external" size={12} />
                            </span>
                          </a>
                          {b.favorite && (
                            <span className="favorite-mark">
                              <Icon name="star" size={11} />
                            </span>
                          )}
                          <span className="card-grip">
                            <Icon name="grip" size={13} />
                          </span>
                          <div className="bookmark-menu">
                            <button
                              className="card-menu-button"
                              aria-label={'Options for ' + b.name}
                              onClick={() => setMenu(menu === b.id ? null : b.id)}
                            >
                              <Icon name="more" size={16} />
                            </button>
                            {menu === b.id && (
                              <div className="dropdown">
                                <button onClick={() => favorite(b.id)}>
                                  <Icon name="star" size={15} />
                                  {b.favorite ? 'Unfavorite' : 'Add to favorites'}
                                </button>
                                <button onClick={() => openAdd(g.id, b)}>
                                  <Icon name="edit" size={15} />
                                  Edit or move
                                </button>
                                <button className="danger" onClick={() => deleteBookmark(b.id)}>
                                  <Icon name="trash" size={15} />
                                  Remove bookmark
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {!query && view !== 'favorites' && (
                      <button
                        className={'add-bookmark-card ' + (dropTarget === 'add-' + g.id ? 'drop-before' : '')}
                        onClick={() => openAdd(g.id)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (groupDrag) return;
                          setDropTarget('add-' + g.id);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (groupDrag) return;
                          moveBookmark(g.id);
                        }}
                      >
                        <span>
                          <Icon name="plus" size={21} />
                        </span>
                        <span>Add bookmark</span>
                      </button>
                    )}
                  </div>
                  )}
                </section>
              );
            })}
          </div>

          {!filteredGroups.length && (
            <div className="empty-state">
              <span>
                <Icon name={view === 'favorites' ? 'star' : 'search'} size={30} />
              </span>
              <h3>{query ? 'No bookmarks found' : view === 'favorites' ? 'Keep your favorites close' : 'A fresh start'}</h3>
              <p>
                {query
                  ? 'Try a different search, or press Enter to search the web.'
                  : view === 'favorites'
                    ? 'Open a bookmark’s menu and add it to your favorites.'
                    : 'Create a group to start collecting your favorite places.'}
              </p>
              {view === 'favorites' ? (
                <button className="secondary-button" onClick={() => changeView('all')}>
                  Explore your bookmarks
                </button>
              ) : (
                !query && (
                  <button className="primary-button" onClick={newGroup}>
                    <Icon name="plus" size={16} />
                    Create a group
                  </button>
                )
              )}
            </div>
          )}

          <button className="add-group-line" onClick={newGroup}>
            <Icon name="plus" size={16} />
            Add a new group
          </button>

          {settings.footer && (
            <>
              <div className="personalize-banner">
                <span className="banner-icon">
                  <Icon name="sparkles" size={22} />
                </span>
                <div>
                  <strong>A little more you.</strong>
                  <p>Find a color palette that feels like home.</p>
                </div>
                <div className="banner-swatches">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <button className="secondary-button" onClick={() => setModal('themes')}>
                  Explore themes
                  <Icon name="arrow" size={15} />
                </button>
              </div>

              <footer>
                <span>
                  <span className="mini-nook">✦</span> Less searching. More doing.
                </span>
                <span>
                  Made for your everyday<span className="footer-sparkle">✧</span>
                </span>
              </footer>
            </>
          )}
        </main>
      </div>

      {menu && <div className="menu-dismiss" onClick={() => setMenu(null)} />}

      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className={'modal ' + (modal === 'themes' ? 'theme-modal' : modal === 'editor' ? 'editor-modal' : modal === 'settings' ? 'settings-modal' : '')}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button className="modal-close icon-button" onClick={() => setModal(null)} aria-label="Close dialog">
              <Icon name="close" />
            </button>

            {modal === 'bookmark' && (
              <>
                <span className="modal-symbol">
                  <Icon name="link" size={24} />
                </span>
                <h2 id="modal-title">{bookmarkForm.id ? 'Edit your bookmark' : 'A new favorite place'}</h2>
                <p className="modal-subtitle">Keep the good parts of the internet close.</p>
                <form onSubmit={saveBookmark}>
                  <label>
                    Website URL
                    <input
                      autoFocus
                      required
                      placeholder="https://example.com"
                      value={bookmarkForm.url}
                      onChange={(e) => setBookmarkForm({ ...bookmarkForm, url: e.target.value })}
                    />
                  </label>
                  <label>
                    Name
                    <input
                      required
                      placeholder="What would you like to call it?"
                      value={bookmarkForm.name}
                      onChange={(e) => setBookmarkForm({ ...bookmarkForm, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Save to group
                    <select value={bookmarkForm.group} onChange={(e) => setBookmarkForm({ ...bookmarkForm, group: e.target.value })}>
                      <option value="" disabled>
                        Select a group
                      </option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>Bookmark icon</label>
                  <div className="icon-options">
                    {['auto', 'letter'].map((icon) => (
                      <button
                        type="button"
                        className={bookmarkForm.icon === icon ? 'selected' : ''}
                        onClick={() => setBookmarkForm({ ...bookmarkForm, icon })}
                        key={icon}
                        title={icon === 'auto' ? 'Detect website logo' : icon}
                      >
                        {icon === 'auto' ? (
                          bookmarkForm.url.trim() ? (
                            <Brand name={bookmarkForm.name || 'Aa'} kind={resolveAutoIcon(formUrl)} url={formUrl} />
                          ) : (
                            <Icon name="sparkles" />
                          )
                        ) : (
                          <Brand name={bookmarkForm.name || 'Aa'} kind={icon} text={bookmarkForm.iconText} />
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={isSetIcon(bookmarkForm.icon) ? 'selected' : ''}
                      onClick={() => setLibOpen(true)}
                      title="Browse icon libraries"
                      aria-haspopup="dialog"
                    >
                      {isSetIcon(bookmarkForm.icon) ? (
                        <Brand name={bookmarkForm.name || 'Aa'} kind={bookmarkForm.icon} />
                      ) : (
                        <Icon name="sparkles" size={24} />
                      )}
                    </button>
                  </div>
                  {bookmarkForm.icon === 'letter' && (
                    <label className="letter-input">
                      Custom letters
                      <input
                        value={bookmarkForm.iconText}
                        maxLength={2}
                        placeholder="Aa"
                        onChange={(e) => setBookmarkForm({ ...bookmarkForm, iconText: e.target.value })}
                        aria-label="Custom letters"
                      />
                    </label>
                  )}
                  {bookmarkForm.icon === 'auto' && (
                    <p className="field-hint icon-hint">Auto fetches the site&apos;s icon when available. Or choose your own.</p>
                  )}

                  <label>Icon style</label>
                  <div className="is-open-row">
                    <button type="button" className="secondary-button" onClick={() => setStyleOpen(true)}>
                      <Icon name="sliders" size={16} />
                      Customize…
                    </button>
                    {hasIconStyle(bookmarkForm.iconStyle) ? (
                      <>
                        <span className="is-customized">Customized</span>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => setBookmarkForm({ ...bookmarkForm, iconStyle: {} })}
                        >
                          Reset
                        </button>
                      </>
                    ) : (
                      <span className="field-hint is-hint">Size, rotation, position, shadow</span>
                    )}
                  </div>

                  <p className="field-hint font-scope-hint">
                    Styles this bookmark&apos;s name. Anything left on Inherit uses its group, then your overall settings.
                  </p>
                  <FontMenu
                    value={bookmarkForm.font}
                    onChange={(font) => setBookmarkForm({ ...bookmarkForm, font })}
                    allowInherit
                    inheritFrom={[globalFont, bookmarkParentGroup?.font]}
                    sample={bookmarkForm.name || 'Bookmark name'}
                    idPrefix="bookmark-font"
                    label="Text style"
                    footerHint="Applies when you save"
                    sizeHint={fontScale !== 1 ? `Scales with the overall text size (${Math.round(fontScale * 100)}%).` : undefined}
                  />

                  {formError && <p className="form-error">{formError}</p>}
                  <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={() => setModal(null)}>
                      Cancel
                    </button>
                    <button className="primary-button" type="submit">
                      <Icon name="check" size={16} />
                      {bookmarkForm.id ? 'Save changes' : 'Add bookmark'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {modal === 'group' && (
              <>
                <span className="modal-symbol">
                  <Icon name="folder" size={24} />
                </span>
                <h2 id="modal-title">{groupForm.id ? 'Make it your own' : 'Room for something new'}</h2>
                <p className="modal-subtitle">A little organization goes a long way.</p>
                <form onSubmit={saveGroup}>
                  <label>
                    Group name
                    <input
                      autoFocus
                      required
                      placeholder="e.g. Side projects"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    />
                  </label>
                  <label>Group color</label>
                  <div className="color-options">
                    {['purple', 'peach', 'green', 'blue', 'pink', 'yellow'].map((color) => (
                      <button
                        type="button"
                        className={color + (groupForm.color === color ? ' selected' : '')}
                        title={color}
                        key={color}
                        onClick={() => setGroupForm({ ...groupForm, color })}
                      >
                        {groupForm.color === color && <Icon name="check" size={19} />}
                      </button>
                    ))}
                  </div>

                  <GroupIconSection
                    icon={groupForm.icon}
                    iconText={groupForm.iconText}
                    bg={groupForm.iconBg}
                    fg={groupForm.iconFg}
                    colorClass={groupForm.color}
                    sampleName={groupForm.name || 'Group'}
                    onIcon={(icon) => setGroupForm({ ...groupForm, icon })}
                    onIconText={(iconText) => setGroupForm({ ...groupForm, iconText })}
                    onColors={(iconBg, iconFg) => setGroupForm({ ...groupForm, iconBg, iconFg })}
                    onRandom={() => {
                      const c = randomIconColors();
                      setGroupForm({ ...groupForm, iconBg: c.bg, iconFg: c.fg });
                    }}
                    onBrowse={() => setLibOpen(true)}
                  />

                  <p className="field-hint font-scope-hint">
                    Styles this group&apos;s title and its bookmarks. Anything left on Inherit uses your overall settings.
                  </p>
                  <FontMenu
                    value={groupForm.font}
                    onChange={(font) => setGroupForm({ ...groupForm, font })}
                    allowInherit
                    inheritFrom={[globalFont]}
                    sample={groupForm.name || 'Group name'}
                    idPrefix="group-font"
                    label="Text style"
                    footerHint="Applies when you save"
                    sizeHint={fontScale !== 1 ? `Scales with the overall text size (${Math.round(fontScale * 100)}%).` : undefined}
                  />

                  <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={() => setModal(null)}>
                      Cancel
                    </button>
                    <button className="primary-button" type="submit">
                      {groupForm.id ? 'Save changes' : 'Create group'}
                      <Icon name="plus" size={16} />
                    </button>
                  </div>
                </form>
              </>
            )}

            {modal === 'themes' && (
              <>
                <span className="modal-symbol">
                  <Icon name="palette" size={24} />
                </span>
                <h2 id="modal-title">Set the mood.</h2>
                <p className="modal-subtitle">
                  {palettes.length} palettes imported from the Windows Terminal collection. Click a preview to cycle its colour variations,
                  or open the cog to mix your own.
                </p>
                <ThemeGallery
                  themeId={themeId}
                  alts={alts}
                  customs={customs}
                  onPick={pickTheme}
                  onCycle={cycleTheme}
                  onEdit={openEditor}
                  onDelete={deleteCustom}
                />
                <p className="theme-note">
                  <Icon name="check" size={14} />
                  Your theme is saved automatically on this device.
                </p>
              </>
            )}

            {modal === 'editor' && draft && (
              <ThemeEditor
                draft={draft}
                onChange={setDraft}
                onCancel={() => {
                  setDraft(null);
                  setModal('themes');
                }}
                onSaveNew={saveNewTheme}
                onUpdate={updateTheme}
                onReset={() => setDraft(makeDraft(draft.sourceId, alts[draft.sourceId] ?? 0, customs))}
              />
            )}

            {modal === 'settings' && (
              <>
                <span className="modal-symbol">
                  <Icon name="settings" size={24} />
                </span>
                <h2 id="modal-title">Your space, your rules.</h2>
                <p className="modal-subtitle">Small details that make your day a little better.</p>
                <label>
                  Your name
                  <input
                    placeholder="What should we call you?"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  />
                </label>
                <div className="settings-list">
                  {
                    [
                      { key: 'newTab' as const, title: 'Open in a new tab', sub: 'Keep your start page right where you left it.', disabled: false },
                      { key: 'clock' as const, title: 'Show the clock', sub: 'A little perspective on your day.', disabled: false },
                      { key: 'clock24' as const, title: '24-hour clock', sub: 'Afternoon reads 14:30 instead of 2:30 PM.', disabled: !settings.clock },
                      { key: 'compact' as const, title: 'Compact layout', sub: 'More bookmarks, a little less space.', disabled: false },
                      { key: 'footer' as const, title: 'Show the footer', sub: 'The themes banner and sign-off below your groups.', disabled: false },
                    ].map((s) => (
                      <div className={'setting-row' + (s.disabled ? ' is-off' : '')} key={s.key}>
                        <div>
                          <strong>{s.title}</strong>
                          <p>{s.sub}</p>
                        </div>
                        <button
                          role="switch"
                          aria-checked={settings[s.key]}
                          aria-label={s.title}
                          disabled={s.disabled}
                          className={'toggle ' + (settings[s.key] ? 'on' : '')}
                          onClick={() => setSettings({ ...settings, [s.key]: !settings[s.key] })}
                        >
                          <span />
                        </button>
                      </div>
                    ))
                  }
                </div>

                <div className="data-settings">
                  <strong>Details.</strong>
                  <p>Fonts and cards, tuned to taste.</p>
                  <BranchMenu label="Detail settings" panels={detailPanels} />
                </div>

                <div className="data-settings">
                  <strong>Sidebar.</strong>
                  <p>Decide when the left menu sticks around.</p>
                  <div className="theme-chips sidebar-chips" role="radiogroup" aria-label="Sidebar visibility">
                    {(['show', 'hover', 'hide'] as const).map((v) => (
                      <button
                        key={v}
                        role="radio"
                        aria-checked={settings.sidebarMode === v}
                        className={settings.sidebarMode === v ? 'chip on' : 'chip'}
                        onClick={() => {
                          setSettings({ ...settings, sidebarMode: v });
                          setSidePeek(false);
                        }}
                      >
                        {v === 'show' ? 'Always show' : v === 'hover' ? 'Show on hover' : 'Hidden'}
                      </button>
                    ))}
                  </div>
                  <p className="field-hint">Drag the sidebar’s right edge to resize it · double-click resets it.</p>
                </div>

                <div className="data-settings">
                  <strong>Always yours.</strong>
                  <p>Your bookmarks stay in this browser. Back them up to take them with you.</p>
                  <div>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(
                          new Blob([JSON.stringify({ groups, theme: themeId, alts, customs, settings }, null, 2)], {
                            type: 'application/json',
                          })
                        );
                        a.download = 'nook-backup.json';
                        a.click();
                        URL.revokeObjectURL(a.href);
                        notify('Your backup is ready');
                      }}
                    >
                      Export bookmarks
                    </button>
                    <button className="secondary-button" onClick={() => importRef.current?.click()}>
                      Import backup
                    </button>
                    <input
                      ref={importRef}
                      type="file"
                      accept="application/json"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const data = JSON.parse(await file.text());
                          if (
                            !Array.isArray(data.groups) ||
                            !data.groups.every(
                              (g: Group) =>
                                typeof g.id === 'string' &&
                                typeof g.name === 'string' &&
                                Array.isArray(g.bookmarks) &&
                                g.bookmarks.every(
                                  (b) =>
                                    typeof b.id === 'string' &&
                                    typeof b.name === 'string' &&
                                    typeof b.icon === 'string' &&
                                    /^https?:\/\//.test(b.url)
                                )
                            )
                          )
                            throw Error();
                          if (confirm('Replace your current bookmarks with this backup?')) {
                            setGroups(normGroups(data.groups));
                            if (typeof data.theme === 'string') setThemeId(LEGACY[data.theme] || data.theme);
                            if (data.alts && typeof data.alts === 'object') setAlts(data.alts);
                            if (Array.isArray(data.customs))
                              setCustoms(
                                data.customs.filter(
                                  (c: CustomTheme) => c && typeof c.id === 'string' && typeof c.name === 'string' && c.vars && typeof c.vars === 'object'
                                )
                              );
                            if (data.settings && typeof data.settings === 'object') {
                              const ds = data.settings as Partial<Settings>;
                              setSettings((prev) => ({
                                ...prev,
                                ...(typeof ds.newTab === 'boolean' ? { newTab: ds.newTab } : {}),
                                ...(typeof ds.clock === 'boolean' ? { clock: ds.clock } : {}),
                                ...(typeof ds.clock24 === 'boolean' ? { clock24: ds.clock24 } : {}),
                                ...(typeof ds.compact === 'boolean' ? { compact: ds.compact } : {}),
                                ...(typeof ds.footer === 'boolean' ? { footer: ds.footer } : {}),
                                ...(typeof ds.name === 'string' ? { name: ds.name } : {}),
                                ...(ds.font ? { font: normFont(ds.font, false) } : {}),
                                ...(typeof ds.showBookmarkIcon === 'boolean' ? { showBookmarkIcon: ds.showBookmarkIcon } : {}),
                                ...(typeof ds.showBookmarkName === 'boolean' ? { showBookmarkName: ds.showBookmarkName } : {}),
                                ...(typeof ds.showBookmarkDomain === 'boolean' ? { showBookmarkDomain: ds.showBookmarkDomain } : {}),
                                ...(typeof ds.contentWidth === 'number' ? { contentWidth: clampNum(ds.contentWidth, 640, 2000, prev.contentWidth) } : {}),
                                ...(typeof ds.cardGap === 'number' ? { cardGap: clampNum(ds.cardGap, 0, 48, prev.cardGap) } : {}),
                                ...(typeof ds.sidebarWidth === 'number' ? { sidebarWidth: clampNum(ds.sidebarWidth, 160, 480, prev.sidebarWidth) } : {}),
                                ...(ds.sidebarMode === 'show' || ds.sidebarMode === 'hide' || ds.sidebarMode === 'hover'
                                  ? { sidebarMode: ds.sidebarMode }
                                  : {}),
                              }));
                            }
                            setView('all');
                            notify('Your bookmarks are back home');
                          }
                        } catch {
                          notify('This file isn’t a valid Nook backup.');
                        }
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <span className="field-hint">Changes are saved automatically</span>
                  <button className="primary-button" onClick={() => setModal(null)}>
                    All done
                    <Icon name="check" size={16} />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {libOpen && modal === 'bookmark' && (
        <IconExplorer
          initialSet={setFor(bookmarkForm.icon)}
          initialStyle={styleFor(bookmarkForm.icon)}
          current={bookmarkForm.icon}
          onPick={(value) => {
            setBookmarkForm({ ...bookmarkForm, icon: value });
            setLibOpen(false);
          }}
          onClose={() => setLibOpen(false)}
        />
      )}

      {libOpen && modal === 'group' && (
        <IconExplorer
          initialSet={setFor(groupForm.icon)}
          initialStyle={styleFor(groupForm.icon)}
          current={groupForm.icon}
          onPick={(value) => {
            setGroupForm({ ...groupForm, icon: value });
            setLibOpen(false);
          }}
          onClose={() => setLibOpen(false)}
        />
      )}

      {styleOpen && modal === 'bookmark' && (
        <IconStyleModal
          name={bookmarkForm.name || 'Bookmark'}
          value={bookmarkForm.iconStyle}
          onChange={(iconStyle) => setBookmarkForm({ ...bookmarkForm, iconStyle })}
          onClose={() => setStyleOpen(false)}
          renderIcon={() => (
            <Brand
              kind={bookmarkForm.icon === 'auto' ? resolveAutoIcon(formUrl) : bookmarkForm.icon}
              name={bookmarkForm.name || 'Aa'}
              url={formUrl}
              text={bookmarkForm.iconText}
            />
          )}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
;

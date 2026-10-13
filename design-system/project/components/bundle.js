/* @ds-bundle: {"format":4,"namespace":"Reisetavla","components":[{"name":"Root"},{"name":"Switch"},{"name":"CrowdMeter"},{"name":"AppHeader"},{"name":"StatusBadge"},{"name":"Note"},{"name":"Button"},{"name":"IconButton"},{"name":"Icon"},{"name":"SavedChip"},{"name":"SearchCard"},{"name":"SegmentedControl"},{"name":"ModeChip"},{"name":"SuggestionList"},{"name":"LinePill"},{"name":"WalkChip"},{"name":"TripCard"},{"name":"DepartureRow"},{"name":"WarningLine"},{"name":"EmptyState"},{"name":"Skeleton"},{"name":"BottomSheet"},{"name":"Toast"},{"name":"TabBar"},{"name":"ResultHeader"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var Fragment = React.Fragment;

  var ICON = {
    bus: '<path d="M5 3.5h10a2 2 0 0 1 2 2V14H3V5.5a2 2 0 0 1 2-2z"/><path d="M3 9.5h14M3 6.5h14"/><circle cx="6.5" cy="15.8" r="1.2"/><circle cx="13.5" cy="15.8" r="1.2"/>',
    coach: '<path d="M2 5.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2V14H2z"/><path d="M2 9h16M7 3.5V9M12 3.5V9"/><circle cx="5.5" cy="15.8" r="1.2"/><circle cx="14.5" cy="15.8" r="1.2"/>',
    rail: '<rect x="5" y="2.5" width="10" height="12" rx="3"/><path d="M5 9h10"/><path d="M8 12h.01M12 12h.01"/><path d="M7 14.5 5 18M13 14.5l2 3.5"/>',
    tram: '<path d="M7 2h6M10 2v3"/><rect x="5" y="5" width="10" height="10" rx="2.5"/><path d="M5 10h10M7 15l-2 3M13 15l2 3"/>',
    metro: '<circle cx="10" cy="10" r="7.5"/><path d="M6.5 6.5h7M10 6.5v8"/>',
    water: '<path d="M3 11h14l-2.2 4H5.2z"/><path d="M6 11V7.5h6l2 3.5M9 7.5V4.5"/><path d="M2 18.2c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/>',
    air: '<path d="M10 2c.8 0 1.3.7 1.3 1.6V8l5.7 3.4v1.8l-5.7-1.7v3.6l2 1.5V18L10 17l-3.3 1v-1.4l2-1.5v-3.6L3 13.2v-1.8L8.7 8V3.6C8.7 2.7 9.2 2 10 2z"/>',
    foot: '<circle cx="11" cy="3.5" r="1.6"/><path d="M10.5 6.5 8 10l3 2-1 6M10.5 6.5l2 4 2.5 1M8 10l-2.5 1M11 12l2.5 2.5 1 3.5"/>',
    pin: '<path d="M10 18s-5.5-5.2-5.5-9.3a5.5 5.5 0 0 1 11 0C15.5 12.8 10 18 10 18z"/><circle cx="10" cy="8.7" r="2"/>',
    me: '<circle cx="10" cy="10" r="3"/><path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3"/><circle cx="10" cy="10" r="6.5"/>',
    warn: '<path d="M10 3 18 17H2z"/><path d="M10 8v4M10 14.5h.01"/>',
    star: '<path d="M10 2.8l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 8.1l5-.7z"/>',
    share: '<path d="M10 13V2.5M6.5 6 10 2.5 13.5 6M6 9H4.5v8.5h11V9H14"/>',
    swap: '<path d="M7 3v14M7 3 4 6M7 3l3 3M13 17V3M13 17l-3-3M13 17l3-3"/>',
    close: '<path d="M5 5l10 10M15 5 5 15"/>',
    board: '<rect x="2.5" y="4" width="15" height="12" rx="2"/><path d="M5.5 8h5M5.5 11h3M13 8h1.5M13 11h1.5"/>'
  };
  var MODE_LABEL = { bus: 'Buss', rail: 'Tog', metro: 'T-bane', tram: 'Trikk', water: 'Båt', coach: 'Ekspressbuss', air: 'Fly', foot: 'Gange' };
  function modeKey(m) { return ICON[m] ? m : 'bus'; }
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }

  function Icon(p) {
    return h('svg', { className: cx('rt-i', p.className), viewBox: '0 0 20 20', 'aria-hidden': 'true', dangerouslySetInnerHTML: { __html: ICON[p.name] || ICON.bus } });
  }

  function systemTheme() {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function Root(p) {
    var st = React.useState(systemTheme), sys = st[0], setSys = st[1];
    React.useEffect(function () {
      if (p.theme || !window.matchMedia) return;
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var on = function () { setSys(mq.matches ? 'dark' : 'light'); };
      on();
      if (mq.addEventListener) { mq.addEventListener('change', on); return function () { mq.removeEventListener('change', on); }; }
      mq.addListener(on); return function () { mq.removeListener(on); };
    }, [p.theme]);
    var theme = p.theme === 'light' || p.theme === 'dark' ? p.theme : sys;
    return h('div', { className: cx('rt-root', p.screen && 'rt-screen', p.className), 'data-theme': theme, style: p.style }, p.children);
  }

  function StatusBadge(p) {
    var live = !!p.live;
    return h('span', { className: cx('rt-status', live && 'is-live') }, h('i'), h('span', null, p.label || (live ? 'Live · Entur' : 'Eksempeldata')));
  }

  function AppHeader(p) {
    return h('div', { className: 'rt-header' },
      h('div', { className: 'rt-wordmark' }, 'Reise', h('span', null, 'tavla')),
      p.status === false ? null : h(StatusBadge, { live: p.live, label: p.statusLabel }));
  }

  function Note(p) { return h('p', { className: 'rt-note' }, p.children); }

  function Button(p) {
    var variant = p.variant || 'primary';
    var rest = Object.assign({}, p); delete rest.variant; delete rest.icon; delete rest.children;
    return h('button', Object.assign({ type: 'button' }, rest, { className: cx('rt-btn', variant === 'ghost' && 'is-ghost', p.className) }),
      p.icon ? h(Icon, { name: p.icon }) : null, p.children);
  }

  function IconButton(p) {
    return h('button', {
      type: 'button', className: cx('rt-icon-btn', p.inset && 'is-inset', p.className),
      'aria-label': p.label, 'aria-pressed': p.pressed === undefined ? undefined : String(!!p.pressed), onClick: p.onClick
    }, h(Icon, { name: p.icon }));
  }

  function SavedChip(p) {
    return h('span', { className: 'rt-saved-chip' },
      h('button', { type: 'button', onClick: p.onOpen }, h('b', null, p.name)),
      h('button', { type: 'button', className: 'rt-x', 'aria-label': 'Fjern ' + p.name, onClick: p.onRemove }, h(Icon, { name: 'close' })));
  }

  function Field(p) {
    var inp = Object.assign({ id: p.id, placeholder: 'Valgfritt · stopp eller adresse', autoComplete: 'off', enterKeyHint: 'search' },
      p.inputProps && 'value' in p.inputProps ? {} : { defaultValue: p.value || '' }, p.inputProps || {});
    return h('div', { className: 'rt-field' },
      h('label', { htmlFor: p.id }, p.label),
      h('input', inp),
      p.onClear ? h('button', { type: 'button', className: 'rt-clear', 'aria-label': 'Tøm ' + p.label.toLowerCase(), onClick: p.onClear }, h(Icon, { name: 'close' })) : null,
      p.extra || null);
  }

  function SearchCard(p) {
    var idp = p.idPrefix || 'rt';
    return h('section', { className: 'rt-card', 'aria-label': 'Søk' },
      h('div', { className: 'rt-route' },
        h('div', { className: 'rt-dots', 'aria-hidden': 'true' }, h('span', { className: 'o' }), h('span', { className: 'l' }), h('span', { className: 'f' })),
        h(Field, { id: idp + '-from', label: 'Fra', value: p.from, inputProps: p.fromInputProps, onClear: p.onClearFrom, extra: p.fromExtra }),
        h(IconButton, { icon: 'swap', label: 'Bytt fra og til', inset: true, className: 'rt-swap', onClick: p.onSwap }),
        h(Field, { id: idp + '-to', label: 'Til', value: p.to, inputProps: p.toInputProps, onClear: p.onClearTo, extra: p.toExtra })),
      p.children);
  }

  function SegmentedControl(p) {
    var opts = p.options || [];
    return h('div', { className: 'rt-seg', role: 'group', 'aria-label': p.label },
      opts.map(function (o) {
        return h('button', { key: o.id, type: 'button', 'aria-pressed': String(o.id === p.value), onClick: p.onChange ? function () { p.onChange(o.id); } : undefined }, o.label);
      }));
  }

  function ModeChip(p) {
    var m = modeKey(p.mode);
    return h('button', { type: 'button', className: 'rt-mode', style: { '--mc': 'var(--m-' + m + ')' }, 'aria-pressed': String(p.pressed !== false), onClick: p.onClick },
      h(Icon, { name: m }), p.label || MODE_LABEL[m]);
  }

  function SuggestionList(p) {
    return h('div', { className: cx('rt-suggest', p.floating && 'is-floating'), role: 'listbox' },
      (p.items || []).map(function (it, i) {
        var ic = it.kind === 'me' ? 'me' : it.kind === 'stop' ? 'bus' : 'pin';
        return h('button', { key: i, type: 'button', role: 'option',
          onMouseDown: function (e) { e.preventDefault(); },
          onClick: p.onSelect ? function () { p.onSelect(it, i); } : undefined },
          h('span', { className: cx('ic', it.kind === 'me' && 'me') }, h(Icon, { name: ic })),
          h('span', null, h('b', null, it.name), h('small', null, it.sub || '')));
      }));
  }

  function lineStyle(p) {
    var s = { '--lc': p.colour ? p.colour : 'var(--m-' + modeKey(p.mode) + ')' };
    if (p.textColour) s['--lt'] = p.textColour;
    return s;
  }

  function LinePill(p) {
    var m = modeKey(p.mode);
    return h('span', { className: 'rt-pill', style: lineStyle(p) }, h(Icon, { name: m }), p.code || MODE_LABEL[m]);
  }

  function WalkChip(p) {
    return h('span', { className: 'rt-walk', 'aria-label': p.minutes + ' min gange' }, h(Icon, { name: 'foot' }), p.minutes);
  }

  function WarningLine(p) {
    return h('div', { className: cx('rt-warn', p.tone === 'crit' && 'is-crit') }, h(Icon, { name: 'warn' }), h('span', null, p.children));
  }

  var CROWD_LABEL = [null, 'God plass', 'Noe trangt', 'Trangt'];
  var CROWD_TONE = [null, 'var(--ok)', 'var(--warn)', 'var(--crit)'];

  function CrowdMeter(p) {
    var lv = Math.max(1, Math.min(3, p.level || 1));
    var label = p.label === undefined ? CROWD_LABEL[lv] : p.label;
    return h('span', { className: 'rt-crowd-item' },
      p.code ? h('b', { className: 'rt-crowd-code' }, p.code) : null,
      h('span', { className: 'rt-meter', 'aria-hidden': 'true' }, [1, 2, 3].map(function (n) {
        return h('i', { key: n, style: { background: n <= lv ? CROWD_TONE[lv] : 'var(--line)' } });
      })),
      label ? h('span', { className: 'rt-crowd-label' }, label) : null);
  }

  function Switch(p) {
    var on = !!p.checked;
    return h('button', { type: 'button', role: 'switch', className: 'rt-switch', 'aria-checked': String(on), 'aria-label': p.label,
      disabled: p.disabled, onClick: p.onChange ? function () { p.onChange(!on); } : undefined }, h('span', { className: 'knob' }));
  }

  function seatsText(n, cap) {
    if (n == null) return '';
    var t = n < 10 ? 'bare ' + n + ' ledige seter' : n + ' ledige seter';
    return cap ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  }

  function flightRows(f, toName) {
    var rows = [];
    if (f.number) rows.push(['Flightnummer', f.number + (f.airline ? ' · ' + f.airline : '')]);
    if (f.status) rows.push(['Status', f.status]);
    if (f.seats != null) rows.push(['Ledige seter', String(f.seats)]);
    if (f.gate) rows.push(['Gate', f.gate + (f.gateOpen ? ' · åpner ' + f.gateOpen : '')]);
    if (f.checkIn) rows.push(['Innsjekk', 'Område ' + f.checkIn]);
    if (f.bagDrop) rows.push(['Bagasjeslipp stenger', f.bagDrop]);
    if (f.belt) rows.push(['Bagasjebånd' + (f.beltAirport ? ' i ' + f.beltAirport : ''), 'Bånd ' + f.belt + (f.beltTime ? ' · ' + f.beltTime : '')]);
    if (f.aircraft) rows.push(['Fly', f.aircraft]);
    return rows;
  }

  function Leg(l, i) {
    if (l.mode === 'foot') {
      return h('li', { key: i, className: 'rt-leg foot' },
        h('div', { className: 'tm' }, h('span', null, l.start), h('span', null, l.end)),
        h('div', { className: 'ln' }),
        h('div', { className: 'tx' },
          h('b', null, 'Gå ' + (l.meters ? l.meters + ' m · ' : '') + l.minutes + ' min'),
          l.to ? h('span', { className: 'sub' }, 'Til ' + l.to) : null));
    }
    var f = l.mode === 'air' ? (l.flight || {}) : null;
    var plat = l.platform ? (/^(spor|plattform|gate)\b/i.test(l.platform) ? l.platform : (l.mode === 'rail' ? 'Spor ' : 'Plattform ') + l.platform) : '';
    var dir = f ? [f.airline, f.status].filter(Boolean).join(' · ') : (l.towards ? 'mot ' + l.towards : '');
    var from = f ? 'Fra ' + l.from + (f.gate ? ' · Gate ' + f.gate : '') : 'Fra ' + l.from + (plat ? ' · ' + plat : '');
    var to = 'Til ' + l.to + (f || l.stops == null ? '' : ' · ' + (l.stops > 0 ? l.stops + ' stopp underveis' : 'uten stopp'));
    var rows = f ? flightRows(f) : [];
    return h('li', { key: i, className: 'rt-leg', style: lineStyle(l) },
      h('div', { className: 'tm' }, h('span', { className: l.late ? 'rt-late' : undefined }, l.start), h('span', null, l.end)),
      h('div', { className: 'ln' }),
      h('div', { className: 'tx' },
        h('span', { className: 'rt-leg-line' }, h(LinePill, { mode: l.mode, code: l.code, colour: l.colour, textColour: l.textColour }), dir ? h('span', { className: 'sub' }, dir) : null),
        h('b', null, from),
        h('span', { className: 'sub' }, to),
        f ? (f.seats != null ? h('span', { className: 'rt-crowd-line' }, seatsText(f.seats, true)) : null)
          : (l.crowd ? h('span', { className: 'rt-crowd-line' }, h(CrowdMeter, { level: l.crowd, label: CROWD_LABEL[l.crowd] + ' om bord' })) : null),
        l.control ? h(WarningLine, null, l.control) : null,
        rows.length ? h('div', { className: 'rt-flight' }, rows.map(function (r, k) { return h('div', { key: k }, h('span', null, r[0]), h('b', null, r[1])); })) : null));
  }

  function TripCard(p) {
    var st = React.useState(!!p.open), own = st[0], setOwn = st[1];
    var controlled = p.expanded !== undefined;
    var open = controlled ? !!p.expanded : own;
    var toggle = function () { if (p.onToggle) p.onToggle(!open); if (!controlled) setOwn(!open); };
    var legs = p.legs || [];
    var transit = legs.filter(function (l) { return l.mode !== 'foot'; });
    var changes = Math.max(0, transit.length - 1);
    var chips = [];
    legs.forEach(function (l, i) {
      if (l.mode === 'foot') { if (l.minutes >= 2) chips.push(h(WalkChip, { key: 'c' + i, minutes: l.minutes })); }
      else chips.push(h(LinePill, { key: 'c' + i, mode: l.mode, code: l.code, colour: l.colour, textColour: l.textColour }));
    });
    var withSep = [];
    chips.forEach(function (c, i) { if (i) withSep.push(h('span', { key: 's' + i, className: 'rt-sep', 'aria-hidden': 'true' }, '›')); withSep.push(c); });
    var crowd = transit.map(function (l, i) {
      if (l.mode === 'air') return l.flight && l.flight.seats != null ? h('span', { key: i, className: 'rt-crowd-item' }, h('b', { className: 'rt-crowd-code' }, l.code), h('span', { className: 'rt-crowd-label' }, seatsText(l.flight.seats))) : null;
      return l.crowd ? h(CrowdMeter, { key: i, code: l.code, level: l.crowd }) : null;
    }).filter(Boolean);
    var notes = [].concat(p.notices || [], p.warnings || []);
    var lateDep = !!p.wasDep;
    return h('li', { className: 'rt-trip' },
      h('button', { type: 'button', className: 'rt-trip-head', 'aria-expanded': String(open), onClick: toggle },
        h('span', { className: 'rt-t1' },
          h('b', { className: 'times' },
            lateDep ? h('span', { className: 'rt-was' }, p.wasDep) : null,
            h('span', { className: lateDep ? 'rt-late' : undefined }, p.dep), ' – ', p.arr),
          h('span', { className: 'dur' }, p.duration)),
        h('span', { className: 'rt-meta' },
          p.soon ? h('b', { className: 'soon' }, p.soon) : null,
          h('span', null, changes ? changes + ' bytte' + (changes > 1 ? 'r' : '') : 'Direkte'),
          p.realtime ? h('span', { className: 'rt-rt' }, 'Sanntid') : null,
          p.platform ? h('span', null, p.platform) : null),
        h('span', { className: 'rt-chips' }, withSep),
        h('span', { className: 'rt-bar', 'aria-hidden': 'true' }, legs.map(function (l, i) {
          return h('span', { key: i, className: l.mode === 'foot' ? 'foot' : undefined, style: { flex: Math.max(2, l.duration || l.minutes || 1), '--seg': l.mode === 'foot' ? 'transparent' : (l.colour || 'var(--m-' + modeKey(l.mode) + ')') } });
        })),
        crowd.length ? h('span', { className: 'rt-crowd' }, h('span', { className: 'rt-crowd-title' }, 'Passasjerer'), crowd) : null),
      (p.cancelled || notes.length) ? h('div', { className: 'rt-trip-notes' },
        p.cancelled ? h(WarningLine, { tone: 'crit' }, 'Del av reisen er innstilt.') : null,
        notes.map(function (w, i) { return h(WarningLine, { key: i }, w); })) : null,
      open ? h('div', { className: 'rt-trip-body' },
        h('ol', { className: 'rt-legs' }, legs.map(Leg)),
        p.actions ? h('div', { className: 'rt-trip-actions' }, p.actions) : null) : null);
  }

  function DepartureRow(p) {
    var line = h(LinePill, { mode: p.mode, code: p.code, colour: p.colour, textColour: p.textColour });
    var sub = [];
    if (p.platform) sub.push((p.mode === 'rail' ? 'Spor ' : 'Plattform ') + p.platform + ' · ');
    sub.push(p.operator || MODE_LABEL[modeKey(p.mode)]);
    return h('li', { className: cx('rt-dep', p.cancelled && 'is-cancel') },
      line,
      h('div', { className: 'dest' }, h('b', null, p.destination),
        h('small', null, sub.join(''), p.realtime ? h(Fragment, null, ' · ', h('span', { className: 'rt-rt' }, 'Sanntid')) : null)),
      h('div', { className: cx('w', p.late && !p.cancelled && 'rt-late') },
        p.cancelled ? h('span', { className: 'cx' }, 'Innstilt') : p.when,
        p.sub ? h('small', null, p.sub) : null));
  }

  function EmptyState(p) {
    return h('div', { className: 'rt-empty' }, h('b', null, p.title), h('span', null, p.text),
      p.action ? h(Button, { variant: 'ghost', onClick: p.onAction }, p.action) : null);
  }

  function Skeleton(p) {
    var n = p.count || 3, out = [];
    for (var i = 0; i < n; i++) out.push(h('li', { key: i, className: 'rt-skel', 'aria-hidden': 'true' }));
    return h('ul', { className: 'rt-list', 'aria-busy': 'true', 'aria-label': 'Henter reiser' }, out);
  }

  function BottomSheet(p) {
    return h('div', { className: cx('rt-scrim', p.inline && 'is-inline'), onClick: p.onClose },
      h('div', { className: 'rt-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': p.title, onClick: function (e) { e.stopPropagation(); } },
        h('div', { className: 'rt-grab' }),
        h('h3', null, p.title),
        p.children));
  }

  function Toast(p) { return h('div', { className: cx('rt-toast', p.inline && 'is-inline'), role: 'status' }, p.children); }

  function TabBar(p) {
    var items = p.items || [{ id: 'reiser', label: 'Reiser', icon: 'pin' }, { id: 'avganger', label: 'Avganger', icon: 'board' }, { id: 'mine', label: 'Mine reiser', icon: 'star' }];
    return h('nav', { className: 'rt-tabbar', 'aria-label': 'Hovedmeny' }, items.map(function (it) {
      return h('button', { key: it.id, type: 'button', 'aria-current': it.id === p.active ? 'page' : undefined, onClick: p.onChange ? function () { p.onChange(it.id); } : undefined },
        h(Icon, { name: it.icon }), it.label);
    }));
  }

  function ResultHeader(p) {
    return h('div', { className: 'rt-res-head' },
      h('div', { style: { minWidth: 0 } }, h('h2', null, p.title), p.subtitle ? h('p', null, p.subtitle) : null),
      h('div', { className: 'rt-acts' },
        p.onSave === null ? null : h(IconButton, { icon: 'star', label: p.saved ? 'Fjern fra Mine reiser' : 'Lagre reisen', pressed: !!p.saved, onClick: p.onSave }),
        p.onShare === null ? null : h(IconButton, { icon: 'share', label: 'Del oppsettet', onClick: p.onShare })));
  }

  window.Reisetavla = Object.assign(window.Reisetavla || {}, {
    Root: Root, Switch: Switch, CrowdMeter: CrowdMeter, AppHeader: AppHeader, StatusBadge: StatusBadge, Note: Note, Button: Button, IconButton: IconButton, Icon: Icon,
    SavedChip: SavedChip, SearchCard: SearchCard, SegmentedControl: SegmentedControl, ModeChip: ModeChip,
    SuggestionList: SuggestionList, LinePill: LinePill, WalkChip: WalkChip, TripCard: TripCard, DepartureRow: DepartureRow,
    WarningLine: WarningLine, EmptyState: EmptyState, Skeleton: Skeleton, BottomSheet: BottomSheet, Toast: Toast,
    TabBar: TabBar, ResultHeader: ResultHeader, MODE_LABEL: MODE_LABEL
  });
})();

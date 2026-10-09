# Reisetavla Mobile — conventions for building with this library

Reisetavla is a Norwegian public-transport app for phones (Entur real-time data). All UI copy is Norwegian bokmål, sentence case, no emoji, no exclamation marks.

## Setup: always wrap in `Root`

Every Reisetavla component must sit inside `Reisetavla.Root`. Root sets the body font (Atkinson Hyperlegible), `ink` text colour, `bg` background and the button reset. Without it, buttons render with browser chrome and text falls back to the system font.

- `<Root screen>` gives the phone screen layout: one column, max 560px, 16px side gutter, 14px gap between sections. Use it as the outermost element of every screen.
- `<Root theme="dark">` forces the dark theme; omit `theme` to follow the OS. Never hand-pick dark colours — the tokens switch automatically.

## Styling idiom: tokens via `var(--*)`, plus a few layout classes

There is no utility-class system. Compose screens from components; for your own layout glue use inline styles with these tokens only:

| Family | Tokens |
|---|---|
| Surfaces | `--bg` (screen), `--surface` (cards), `--surface-2` (inset areas inside a card) |
| Text | `--ink` (primary), `--muted` (secondary) |
| Lines | `--line` (decorative hairlines only) |
| Brand | `--accent`, `--accent-ink` (text on accent) |
| Status | `--ok` (sanntid), `--warn` (forsinket), `--crit` (innstilt) |
| Modes | `--m-bus` `--m-coach` `--m-rail` `--m-metro` `--m-tram` `--m-water` `--m-air` `--m-foot`, `--on-mode` |
| Spacing | `--space-3` `--space-4` `--space-6` `--space-8` `--space-10` `--space-12` `--space-14` `--space-16` `--space-18` `--space-20` |
| Radius | `--radius-8` … `--radius-24`, `--radius-full` |
| Other | `--shadow` (only on things that sit directly on `--bg`), `--touch-target` (44px), `--font-display` (Overpass, for times and titles), `--font-body` |

Layout classes that ship in the stylesheet: `rt-list` (vertical list of TripCard/DepartureRow — wrap them in `<ul className="rt-list">`), `rt-chips` (row of LinePill/WalkChip, separated by `<span className="rt-sep">›</span>`), `rt-modes` (horizontally scrolling ModeChip row), `rt-saved` (horizontally scrolling SavedChip row).

## Composition rules

- Screen order: `AppHeader` → `rt-saved` row of `SavedChip` → `SearchCard` (with `SegmentedControl` and an `rt-modes` row as children) → `ResultHeader` → `rt-list` of `TripCard` or `DepartureRow` → `TabBar` pinned at the bottom.
- Times are `HH:MM` strings; under an hour use `soon="om 4 min"`. A delay is shown by passing the original time as `wasDep` (TripCard) or `late` + `sub="var 08:47"` (DepartureRow). Cancellation: `cancelled`.
- Use one primary `Button` per screen or sheet; everything else `variant="ghost"`. In-screen actions use `IconButton` with a Norwegian `label`.
- Overlays: `BottomSheet` (pass `inline` only for static mockups) and `Toast`.
- Loading = `Skeleton`; empty or error = `EmptyState`.

## Where the truth lives

Read `styles.css` and its import `_ds_bundle.css` for exact values; each component's `.prompt.md` has usage rules, and `guidelines/` holds the full brand book (tone, time formatting, mobile rules).

## Example

```jsx
const { Root, AppHeader, ResultHeader, TripCard, TabBar } = window.Reisetavla;

<Root screen>
  <AppHeader live />
  <ResultHeader title="Nationaltheatret → Oslo lufthavn" subtitle="avreise nå · Tog, Ekspressbuss" />
  <ul className="rt-list">
    <TripCard dep="08:42" arr="09:17" duration="35 min" soon="om 4 min" realtime platform="Spor 2"
      legs={[{ mode: 'foot', minutes: 3, duration: 3 }, { mode: 'rail', code: 'F2', duration: 29 }, { mode: 'foot', minutes: 3, duration: 3 }]} />
  </ul>
  <div style={{ marginTop: 'var(--space-14)' }}><TabBar active="reiser" /></div>
</Root>
```

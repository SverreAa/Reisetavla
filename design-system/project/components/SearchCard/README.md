# SearchCard

Søkekortet: Fra og Til med rutelinje og byttknapp, og tidsvalg og transportmidler som barn.

- Rutelinjen er appens signatur: åpen ring i `ink` (Fra), prikket `line` og fylt prikk i `accent` (Til). Gjenbruk den ikke andre steder.
- Feltene har versal etikett (`label`) og inntastet tekst i `field` (17 px, så iOS ikke zoomer). Fokus gir `accent`-understrek.
- Begge feltene er valgfrie, og plassholderen sier det: «Valgfritt · stopp eller adresse». Bare Fra gir avgangstavle, bare Til bruker posisjonen som start, og begge gir reiseforslag.
- Kortet er `surface` med `radius-22` og `shadow`; innhold med `space-14` mellomrom.- I appen: `fromInputProps`/`toInputProps` spres på inputene (value, onChange, onFocus, onBlur, onKeyDown), `onClearFrom`/`onClearTo` viser et kryss, og `fromExtra`/`toExtra` rendres inne i feltet – legg `<SuggestionList floating onSelect={…}>` der.
- Under feltene: SegmentedControl for tidspunkt og en «Reisevalg»-rad (surface-2, radius-12, min 48 px) med etikett, sammendrag («Maks gange 800 m · Alle ruter») og «Endre» i `accent`.

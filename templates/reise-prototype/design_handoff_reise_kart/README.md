# Overlevering: Reiseforslag og kartvisning (12 nye funksjoner)

## Oversikt
Utvidelse av Reisetavla Mobile (norsk reiseplanlegger, sanntidsdata fra Entur). Pakken beskriver 12 funksjoner i resultatlisten og kartvisningen:

1. Passasjerbelegg per delstrekning
2. Varsel om billettkontroll (bare når det finnes en melding)
3. Valgt reise og rulleposisjon huskes etter «Tilbake» fra kart
4. Flyinformasjon på flyetapper (flightnummer, ledige seter, gate, bagasjeslipp, bagasjebånd, flytype, status)
5. Kart: velg en rute (f.eks. trikk 19) → hele ruta og ALLE kjøretøy i begge retninger vises, med «på vei mot deg / fra deg»
6. Maks gange: velg grense; finnes ingen stopp innenfor, vis beste alternativ og forklar at det er utenfor grensen
7. Tilbakemelding til forbedring av appen
8. Ekskluder ruter (f.eks. en bussrute) fra reiseforslagene
9. Varsel én stasjon før du skal av
10. Tydelige stoppnavn (på/av/bytte) på kartet ved hver overgang
11. Detaljarket nederst i kartet kan minimeres
12. Tilbakelagt strekning vises svakere enn strekningen foran deg

## Om designfilene
Filene i denne pakken er **designreferanser laget i HTML** – en prototype som viser tiltenkt utseende og oppførsel, ikke produksjonskode. Oppgaven er å **gjenskape designet i den eksisterende kodebasen** (reisetavla-ds React-biblioteket og appen som bruker det), med kodebasens mønstre, komponenter og datalag. All data i prototypen er oppdiktet; ekte data skal komme fra Entur (og flydata fra en egnet kilde, se «Data»).

## Detaljnivå
**High-fidelity.** Farger, typografi, avstander og tekst er endelige og bygger på reisetavla-ds-tokens. Kartet er derimot **skjematisk** (håndplasserte koordinater på et rutenett) – i appen skal det være et ekte kart (f.eks. MapLibre/Leaflet) med de samme lagene og merkelappene.

## Generelle regler (fra designsystemet)
- All tekst på bokmål, setningsstavelse, ingen utropstegn, ingen emoji.
- Alt ligger i `Root`. Bruk tokens (`var(--surface)`, `--ink`, `--muted`, `--accent`, `--ok`, `--warn`, `--crit`, `--m-<modus>`), aldri egne farger.
- Status vises aldri med farge alene – alltid ord i tillegg (gjelder belegg, kontroll, kjøretøy).
- Trykkflater minst 44 px. Én primærknapp per skjerm/ark.
- Tider `HH:MM` med tabulære tall. «om 6 min», «2 t 44 min», «Direkte / 1 bytte / 2 bytter». Tog: «Spor», ellers «Plattform».

---

## Skjerm 1: Reiseforslag

**Rekkefølge:** AppHeader (live) → SearchCard (Fra/Til) med «Reisevalg»-rad som barn → [maks-gange-varsel] → ResultHeader → [skjulte forslag-linje] → reiseliste → tilbakemeldingskort → kreditering → TabBar.

### Reisevalg-rad (inne i SearchCard)
- Full bredde knapp, `surface-2`, `radius-12`, min-høyde 48, padding 8/12.
- Venstre: etikett «REISEVALG» (12px, 700, letter-spacing .08em, versaler, `muted`) over sammendrag 15px/700: `Maks gange 800 m · Alle ruter` eller `Maks gange 400 m · Uten 19, FB2`.
- Høyre: «Endre» i `accent`, 15px/700. Åpner Reisevalg-arket.

### Reisekort (erstatter/utvider TripCard)
TripCard i reisetavla-ds har ikke plass til belegg, kontroll eller flyinfo. Enten utvid TripCard med nye props (anbefalt: `crowd`, `notices`, `flight` på `Leg`), eller lag en variant. Utseende:
- `surface`, `radius-20`, `shadow`. Hodet er én knapp (`aria-expanded`), padding 14/16/12, `gap 10`.
- Linje 1: `07:41 – 10:25` (Overpass 800, 24px, line-height 1.1, `white-space: nowrap`) + reisetid til høyre (Overpass 700, 16px, `muted`).
- Linje 2 (14px, `muted`): «om 6 min» (`ink`, bold) · «2 bytter» · «Sanntid» (`ok`, bold) · første plattform/spor.
- Linje 3: LinePill/WalkChip-rad med «›» mellom.
- Linje 4: reisestolpe 8px, `gap 3`, hver etappe `flex: <minutter>` (min 2), linjefarge; gange = prikket `m-foot`.
- **Linje 5 – Passasjerer (NY):** etikett «PASSASJERER» (11px, 700, versaler, `muted`), deretter per kjøretøyetappe: linjekode (Overpass 800) + tre søyler (4px brede, høyde 7/10/13px, `gap 2`, radius 1) + ord.
  - Nivå 1 «God plass»: 1 søyle i `--ok`
  - Nivå 2 «Noe trangt»: 2 søyler i `--warn`
  - Nivå 3 «Trangt»: 3 søyler i `--crit`
  - Ufylte søyler: `--line`
  - Fly: ingen søyler, tekst «14 ledige seter» (under 10: «bare 6 ledige seter»).
- **Merknader (NY)** under hodet, padding 0/16/14, WarningLine (tone warn):
  - Billettkontroll: `Billettkontroll meldt ved Tullinløkka på trikk 19 for 12 min siden`. Vises bare når det finnes en melding for en linje i reisen (og skjules når meldingen er eldre enn en grense, foreslått 30 min).
  - Utenfor maks gange: `350 m gange til Holbergs plass er over maks gange (200 m).`

### Åpent kort – etappeliste
Toppkant 1px `line`, padding 14/16/16, `gap 14`. Hver etappe: grid `44px 6px 1fr`, `gap 0 10`.
- Tidkolonne: start øverst, slutt nederst (Overpass 700, 14px; slutt i `muted`).
- Stolpe 6px: linjefarge, gange = vertikal prikket `m-foot`.
- Gange: «Gå 350 m · 5 min» (15px/700) + «Til Holbergs plass» (14px `muted`).
- Kjøretøy: LinePill + «mot Ljabru»; «Fra Holbergs plass · Plattform B» (15px/700); «Til Jernbanetorget · 4 stopp underveis» (14px `muted`); beleggsrad med søyler + «Trangt om bord»; ev. WarningLine for kontroll.
- **Fly (NY):** LinePill (`air`, kode «SK 263») + «SAS · I rute»; «Fra Oslo lufthavn · Gate D7»; «Til Bergen lufthavn, Flesland»; «14 ledige seter»; deretter infoboks (`surface-2`, `radius-12`, padding 10/12, `gap 6`), rader med nøkkel venstre (`muted`) og verdi høyre (bold, 14px):
  - Flightnummer — SK 263 · SAS
  - Status — I rute
  - Ledige seter — 14
  - Gate — D7 · åpner 08:55
  - Bagasjeslipp stenger — 08:50
  - Bagasjebånd i Bergen — Bånd 3 · ca. 10:40
  - Fly — Boeing 737-800
- Nederst: primær Button med ikon `pin`: «Vis i kart».

### Maks gange-varsel (NY)
Vises når ingen forslag har all gange innenfor grensen. Kort (`surface`, `radius-16`, `shadow`, padding 12, `gap 10`) med WarningLine:
`Ingen stopp innenfor 200 m gange. Nærmeste alternativ er Holbergs plass, 350 m unna. Vi viser det beste forslaget utenfor maks gange.`
+ ghost Button «Øk til 400 m» (neste trinn som dekker alternativet).
Logikk: kandidater = forslag uten ekskluderte linjer. Innenfor = kandidater der *lengste* gangetappe ≤ grensen. Er innenfor tom og kandidater ikke tom → vis kandidaten med kortest lengste gangetappe, merket som utenfor.

### Skjulte forslag (NY)
Når ruter er ekskludert og forslag er fjernet: linje 14px `muted` «1 forslag skjult fordi FB2 er ekskludert.» + «Endre» (accent, 44px høy). Er alle fjernet: kort med «Ingen reiser uten de ekskluderte rutene. Ta med en rute igjen under Reisevalg.»

### Tilbakemeldingskort (NY)
`surface`, `radius-20`, `shadow`, padding 14/16. Tittel «Hjelp oss å gjøre appen bedre» (Overpass 700, 17px), undertekst «Fortell hva som mangler eller ikke virker.» (14px `muted`), ghost Button full bredde «Gi tilbakemelding».

---

## Ark: Reisevalg (BottomSheet, tittel «Reisevalg»)
- «MAKS GANGE TIL OG FRA STOPP» + SegmentedControl: `200 m | 400 m | 800 m | 1,5 km` (standard 800 m). Hjelpetekst: «Finnes det ingen stopp innenfor grensen, viser vi det beste alternativet og sier fra.»
- «EKSKLUDER RUTER»: én rad per linje som finnes i søkeresultatet (min-høyde 52): LinePill · navn (15px/700) + strekning (13px `muted`) · statusord «Med»/«Ekskludert» · bryter.
- Bryter: 50×30, `radius-full`, `role="switch"`, `aria-checked`, `aria-label="Ekskluder Trikk 19"`. På = `accent`, av = `muted`; knott 24px `surface`, venstre 3 → 23px, overgang .15s.
- Primær Button: «Vis 3 reiser» (antall oppdateres live; 0 → «Lukk»).
- Valgene lagres per bruker (lokalt) og brukes i alle søk til de endres.

## Ark: Gi tilbakemelding (BottomSheet)
- Tekst: «Hva kan vi gjøre bedre? Vi leser alt, men svarer ikke på hver melding.»
- Kategoribrikker (enkeltvalg, `aria-pressed`, 38px høye, `radius-full`): Forslag · Feil i rutedata · Noe virket ikke · Annet. Valgt = `ink`-bakgrunn/`bg`-tekst; ellers `surface-2`/`ink`.
- Tekstfelt: etikett «DIN TILBAKEMELDING», textarea 4 rader, 17px (unngår iOS-zoom), `surface-2`, `radius-12`, placeholder «Beskriv hva du opplevde eller ønsker deg».
- Bryter «Legg ved dette reisesøket» (standard på) – sender med fra/til, tid, filtre, app-versjon.
- Primær «Send tilbakemelding» → lukker arket, Toast «Tilbakemeldingen er sendt» (1,8 s).
- Tomt felt: deaktiver knappen eller vis «Skriv noen ord før du sender.» (anbefalt).

---

## Skjerm 2: Kartvisning

Fullskjerm-kart; resten flyter over.

### Toppfelt (over kartet, padding-top = safe area)
- «‹ Tilbake» (pille, `surface`, `shadow`, 44px) + reisetittel-pille («Pilestredet 35 → Bergen», 14px/700).
- **Rutevalg (NY):** horisontalt rullende brikker, én per kjøretøyetappe i reisen: LinePill + «Alle trikker på linjen» / «Alle tog på linjen» / «Alle busser på linjen» / «Alle T-baner på linjen». `aria-pressed`. Valgt: ring 2px `accent` og tekst «Vises». Trykk igjen slår av.

### Kartlag (nederst → øverst)
1. **Valgt rute (NY):** hele linjens trasé, 12px, linjefarge, opasitet .2; alle stopp som små ringer (r 3).
2. **Reisen:** hver etappe tegnes i linjefarge (6px). Gange: prikket (`muted`, 4px, dash `1 8`, runde ender). Fly: stiplet `m-air` 3px (dash `8 8`) mot kanten i retning destinasjonen.
3. **Tilbakelagt strekning (NY):** delen bak brukerens posisjon tegnes med opasitet **0.28**; delen foran med 1. Gjelder alle etapper, og den aktive etappen deles ved nåværende posisjon. Passerte stopp får opasitet .4.
4. Stopp på reisen: av-/påstigning = ring r 6 (strek 3), mellomstopp r 3.5.
5. **Stoppmerkelapper (NY):** ved start og slutt for hver kjøretøyetappe. Kort `surface`, radius 10, `shadow`, padding 5/9/6, høyde ~54:
   - Linje 1 (10.5px, 700, versaler, `muted`, med 8px prikk i linjefarge): «PÅ · TRIKK 19» / «AV · TRIKK 19»
   - Linje 2 (13.5px, 700): stoppnavn
   - Linje 3 (12px `muted`): «07:46 · Plattform B»
   - Er «av» og neste «på» samme stopp, slås de sammen: «BYTTE · FLY SK 263», «Oslo lufthavn», «08:29 → 09:30».
   - Merkelappene skal ikke overlappe hverandre, brukerens posisjon eller reiselinjen, og skal holde seg innenfor synlig kartflate (mellom toppfeltet og arket). Bruk kartbibliotekets kollisjonshåndtering (symbol-layer med `text-variable-anchor`) eller samme prinsipp som prototypen: prøv sidene tr, br, tl, bl, r, l, t, b og velg den med minst overlapp.
   - Passerte merkelapper: opasitet .55.
6. **Billettkontroll (NY):** rundt merke 28px ved stoppet, `warn` på `warn`-tonet `surface`, ikon `warn`, `aria-label="Billettkontroll meldt"`.
7. **Kjøretøy på valgt rute (NY):** 28px sirkel i linjefarge med linjekode (Overpass 800, 11px, `on-mode`). På vei **mot** brukerens stopp: full opasitet + ring (3px `surface`, 5px `accent`). På vei **fra**: opasitet .5. Posisjonen oppdateres jevnt (overgang 1s lineær) ved hver sanntidsoppdatering.
8. Brukerens posisjon: 20px `accent`, ring 4px `surface` + 10px halo (accent 22 %).

### Detaljark nederst (NY: kan minimeres)
`surface`, radius 24/24/0/0, skygge `0 -12px 32px -20px rgba(14,26,43,.55)`, maks høyde 380px (innholdet ruller).
- Grep-knapp øverst (hele bredden, 44px): håndtak 40×5 + «Skjul detaljer» / «Vis detaljer», `aria-expanded`. Minimert vises bare varsel, tider og statuslinje.
- **Avstigningsvarsel (NY):** øverst i arket, `role="alert"`, `ink`-bakgrunn / `bg`-tekst, `radius-14`, padding 10/14, én linje: «Gå av ved neste stopp» (Overpass 800, 16px) + «Jernbanetorget · ankomst 07:55». Ved stoppet: «Gå av nå». Utløses når neste stopp er etappens siste (også for direktetog). Sammen med vibrasjon og systemvarsel når appen er i bakgrunnen.
- Tider «07:41 – 10:25» (Overpass 800, 22px) + reisetid; statuslinje: «Om bord på trikk 19 · ved Tullinløkka · neste: Øvre Slottsgate». Ved endestasjon før fly: «… · gate D7 åpner 08:55».
- **Valgt rute-panel (NY):** `surface-2`, `radius-16`, tittel «Trikk 19 i trafikk nå» + StatusBadge «Sanntid». Forklaring «Ring rundt: på vei mot deg. Blek: på vei fra deg.» To grupper: «MOT LJABRU – DIN RETNING» og «MOT MAJORSTUEN – MOTSATT SPOR». Rader: «Ved Valkyrie plass» + «om 4 min til Holbergs plass» (`ink`, bold) eller «har passert Holbergs plass» (`muted`). Sortert: på vei mot deg først, så etter avstand.
- Bryter «Varsle én stasjon før jeg skal av» / «Vibrerer og viser et varsel» (standard på, lagres).
- (Prototype-only) «Neste stopp (demo)» og «Start på nytt» – fjernes i appen; posisjon kommer fra GPS/sanntid.
- WarningLine for billettkontroll om reisen har det.
- Etappeliste: WalkChip/LinePill + «Holbergs plass → Jernbanetorget» (14px/700) + «07:46–07:55 · Trangt» (13px `muted`). Tilbakelagte etapper: opasitet .5 og «· tilbakelagt».

### Tilbake fra kart (NY)
«Tilbake» returnerer til resultatlisten med **samme kort åpent** og **samme rulleposisjon**. Valgt reise lagres også ved omstart (lokal lagring), sammen med maks gange, ekskluderte ruter og varselvalg.

---

## Tilstand
- `screen`: 'results' | 'map'
- `openTripId` (huskes), `mapTripId`, `savedScrollTop`
- `maxWalkMeters`: 200 | 400 | 800 | 1500 (lagres)
- `excludedLines`: string[] (lagres)
- `alightAlertOn`: boolean (lagres)
- `sheet`: null | 'filter' | 'feedback'
- `mapRouteId`: null | linje-id (valgt rute i kart)
- `mapSheetExpanded`: boolean
- `feedback`: { category, text, attachSearch }
- `toast`: string | null (auto-skjul 1,8 s)

## Data
- **Belegg:** Entur/SIRI-ET `OccupancyStatus` per kall der det finnes (manyEmptySeats/fewSeatsAvailable/standingRoomOnly/full → nivå 1–3). Mangler data: vis ikke beleggsraden for den etappen.
- **Billettkontroll:** finnes ikke i Entur. Krever egen kilde (operatør-API eller brukerrapporter). Vis bare ferske meldinger (foreslått ≤ 30 min) med alder.
- **Kjøretøy på rute:** Entur Vehicle Positions (GraphQL `vehicles(lineRef: …)`), oppdater hvert ~5–10 s mens kartet er åpent og en rute er valgt; stopp oppdatering ellers.
- **Fly:** Entur dekker flyavganger i reiseplanen, men ikke gate/seter/bånd. Gate og bagasjebånd: Avinor flydata-API. Ledige seter: krever flyselskapets API – vis raden bare når data finnes.
- **Maks gange:** send `walkSpeed`/maks gangedistanse til Entur Journey Planner, og kjør et ekstra søk uten grense når resultatet er tomt for å finne beste alternativ.
- **Ekskluder ruter:** Journey Planner `banned: { lines: [...] }`.
- **Avstigningsvarsel:** beregn fra sanntids ankomst og GPS; varsle når kjøretøyet forlater nest siste stopp.
- **Tilbakemelding:** POST til eget endepunkt med kategori, tekst, valgfritt reisesøk, app-versjon, plattform.

## Designtokens (lyst tema; mørkt tema finnes i `_ds_bundle.css`)
- Flater: bg `#edf1f6`, surface `#ffffff`, surface-2 `#f3f6fa`, line `#d7dee8`
- Tekst: ink `#0e1a2b`, muted `#5a6779`
- Merke: accent `#0b5fad`, accent-ink `#ffffff`
- Status: ok `#1c8448`, warn `#a9500c`, crit `#bf2a2a`
- Moduser: bus `#c8352b`, coach `#7b3fa0`, rail `#1f5fae`, metro `#d66a0d`, tram `#178454`, water `#0b8399`, air `#4e57c4`, foot `#8a96a6`, on-mode `#ffffff`
- Radius: 8 (linjebrikke), 10 (kartmerkelapp), 12 (felt), 14 (knapp/varsel), 16, 20 (reisekort), 22 (søkekort), 24 (ark), full
- Avstand: 3, 4, 6, 8, 10, 12, 14, 16, 18, 20
- Skygge: `0 1px 0 rgba(14,26,43,.06), 0 10px 28px -18px rgba(14,26,43,.45)`
- Fonter: Overpass 700/800 (tider, titler, linjekoder), Atkinson Hyperlegible 400/700 (brødtekst)

**Kjent problem i designsystemet:** 22 mørkt-tema-variabler ligger under `:root:not([data-theme="light"])` inne i en media query. Flytt dem til `:root` / `[data-theme="dark"]`-scope og kjør `/design-sync` på nytt.

## Ressurser
Ingen bilder. Ikoner fra reisetavla-ds `Icon` (`pin`, `warn`, modusikoner). Kartet i prototypen er en plassholder – bruk et ekte kartgrunnlag.

## Filer
- `ReisePrototype.reference.html.txt` – kildekoden til hele prototypen som ren tekst (mal + logikk). Logikken (`class Component`) inneholder eksempeldata (`ROUTES`, `TRIPS`, `FLIGHTS`), filtrering (`filtered()`), kortmodell (`tripVM()`), og kartmodell med tilbakelagt-deling, merkelapp-plassering, kjøretøy og avstigningsvarsel (`mapVM()`).
- Live-versjon i designsystemprosjektet: `templates/reise-prototype/ReisePrototype.dc.html` (åpnes i nettleseren der designsystemet er lastet).

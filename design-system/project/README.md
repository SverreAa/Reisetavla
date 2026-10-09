Reisetavla er en reiseplanlegger for hele Norge som henter sanntidsdata fra Entur. Den er laget for telefonen: én hånd, én kolonne, og et svar på et blikk. Designspråket skal få neste avgang til å stå klart frem og alt annet til å holde seg i bakgrunnen.

## Prinsipper

- **Tiden først.** Avgangs- og ankomsttider er det største på skjermen (`time-lg`, `countdown`). Alt annet er mindre og står i `muted`.
- **Linjen er merket.** Linjebrikken bruker linjens egen farge fra Entur, slik skiltet på stoppet gjør. Appens egne farger viker for den.
- **Sanntid må synes.** Forsinket, innstilt og sanntid har hver sin farge (`warn`, `crit`, `ok`) og står alltid sammen med et ord eller gjennomstreking.
- **Tommelen bestemmer.** Alt som kan trykkes, er minst `touch-target` (44 px). Handlinger som brukes ofte, ligger i nedre halvdel eller i bunnark.
- **Én kolonne.** Innholdet er aldri bredere enn `content-max` (560 px), heller ikke på nettbrett. Sidemargen er `space-16`.

## Språk og tone

Skriv kort og konkret, slik en kollega ved stoppet ville sagt det. Appen er på bokmål.

- Vanlig setningsstavelse og ingen utropstegn. Versaler bare i etiketter (`label`, `status`).
- Skriv fra brukerens side: «Mine reiser», «Hvor reiser du fra?», «Velg FRA, TIL eller begge».
- Feilmeldinger sier hva som skjedde og hva brukeren kan gjøre: «Fikk ikke hentet reiser. Sjekk nettforbindelsen og prøv igjen.» Ingen unnskyldninger.
- Bekreftelser beskriver resultatet: «Lagret i Mine reiser», «Lenken er kopiert».
- Ingen emoji.

### Tider og tall

- Klokkeslett i `nb-NO` som `08:42`, alltid med tabulære tall (`font-variant-numeric: tabular-nums`).
- Under en time til avgang skriver du «om 4 min». Når avgangen er nå, skriver du «Går nå». Avgangstavler bruker «nå» og «N min» under 15 minutter, ellers klokkeslett.
- Reisetid: «35 min», «1 t 12 min».
- Bytter: «Direkte», «1 bytte», «2 bytter».
- Tog har «Spor», alt annet «Plattform».
- Forsinkelse: opprinnelig tid gjennomstreket i `muted`, ny tid i `warn`. Innstilt: gjennomstreket i `muted` og ordet «Innstilt» i `crit`.

## Farger

- Skjermen er `bg`. Alt innhold ligger på kort i `surface`, og innfelte flater i et kort er `surface-2`. Lag hierarki med flater, ikke med rammer.
- Tekst er `ink` eller `muted`. Begge holder minst 4.5:1 på `bg`, `surface` og `surface-2` i begge temaer.
- `accent` er merkefargen. Den brukes på «tavla» i ordmerket, Til-prikken, primærknappen, valgt stjerne, aktiv fane og fokusringen. Det skal være én primærhandling per skjerm.
- `line` er bare dekor (hårlinjer, feltunderstrek). Den holder ikke 3:1, så en kontroll må aldri skilles ut av `line` alene.
- Transportmidler har hver sin farge (`m-bus`, `m-rail`, `m-metro`, `m-tram`, `m-water`, `m-coach`, `m-air`, og `m-foot` for gange). Enturs linjefarge går foran. Bruk modusfargene bare på linjebrikker, reisestolper og modusbrikker, aldri på knapper eller tekst.
- Tekst på en modusfarget brikke er `on-mode` når Entur ikke oppgir tekstfarge.
- Mørkt tema er et eget, fullverdig tema og ikke en invertering. Fargene er lysere og mindre mettede, og `accent-ink` og `on-mode` blir mørke.

## Typografi

- **Overpass** (`display`) brukes til ordmerket, tider, linjenummer og titler, alltid i 700 eller 800. Den er utviklet fra skilttypen på amerikanske motorveier og passer til tavler og skilt.
- **Atkinson Hyperlegible** (`body`) brukes til all løpende tekst. Den er laget for lesbarhet ved nedsatt syn, med tydelige forskjeller på I, l og 1 og på 0 og O.
- Begge lastes fra Google Fonts med systemfonter som reserve.
- Hold deg til stilene: `wordmark`, `time-lg`, `title`, `sheet-title`, `countdown`, `time-md`, `pill` (display) og `field`, `body`, `body-strong`, `body-sm`, `meta`, `caption`, `status`, `label` (body).
- Inntastingsfelt er minst 16 px (`field` er 17 px), så iOS ikke zoomer inn ved fokus.
- Overskrifter har `text-wrap: balance`.

## Form og rom

- Radius vokser med størrelsen på flaten: `radius-8` på linjebrikker, `radius-12` på felt, `radius-14` på knapper, `radius-16` på rader, `radius-20` på reisekort, `radius-22` på søkekortet og `radius-24` på bunnark. Brikker og merker er `radius-full`.
- Det finnes én skygge, `shadow`. Den brukes på alt som ligger rett på `bg`, og aldri på noe inne i et kort.
- Avstand: `space-14` mellom seksjoner på skjermen og inne i kort, `space-10` mellom kort i en liste, `space-8` mellom brikker og `space-16` som sidemarg.
- Rutelinjen i SearchCard (åpen ring, prikket linje, fylt `accent`-prikk) er appens signatur. Den brukes bare der.

## Mobil

- **Safe areas.** Skjermen er polstret med `env(safe-area-inset-top)` og `env(safe-area-inset-bottom)`. Bunnark, TabBar og Toast legger innrykket til sin egen bunnmarg.
- **Trykkflater.** Minst `touch-target` (44 × 44 px). Brikker i rader kan være 38 px høye når raden har `space-8` luft rundt.
- **Bunnark fremfor nye sider.** Deling, valg og detaljer åpnes i BottomSheet over `scrim`. Arket lukkes ved trykk utenfor.
- **Navigasjon.** TabBar nederst med høyst fire faner, hver med ikon og ord. Det er ingen hamburgermeny.
- **Horisontale rader.** Lagrede reiser og modusbrikker ruller sidelengs og blør ut i sidemargen. Andre rader bryter til ny linje.
- **Oppdatering.** Med tiden satt til «Nå» oppdateres resultatene hvert 30. sekund og når appen kommer tilbake i forgrunnen. Det skjer ikke mens et ark er åpent.
- **Lasting.** Bruk Skeleton (tre plassholdere), ikke spinner.
- **PWA.** `theme-color` er `#0E1A2B` (`ink` i lyst tema), og `apple-mobile-web-app-title` er «Reisetavla».

## Bevegelse

Bevegelse brukes bare når den forklarer noe.

- Bunnark glir inn på 0,22 s med ease-out.
- Byttknappen roterer 180° på 0,25 s.
- Live-prikken pulserer hvert 2. sekund.
- Skeleton-skimmeret går i 1,2 s.
- Toast vises i 1,8 s.
- `prefers-reduced-motion: reduce` slår av all animasjon og overgang.

## Tilgjengelighet

- Fokusringen er 2 px heltrukket `accent` med 2 px avstand. Den holder over 3:1 på alle flater i begge temaer.
- Status vises aldri med farge alene. «Sanntid», «Innstilt» og forsinket tid har ord eller gjennomstreking i tillegg, og modusbrikker har ikon og navn.
- Ikonknapper har alltid `aria-label`. Av/på-knapper bruker `aria-pressed`, og reisekort bruker `aria-expanded`.
- Resultatlisten er `aria-live="polite"`.

## Ikoner

Strekikoner i et 20 × 20-rutenett med 1,6 strek, avrundede ender og hjørner. De ligger i bundle som komponenten `Icon` (tegnet i `currentColor`) og som SVG-filer under Ikoner. Filene er tegnet i `#0e1a2b` (`ink`, lyst tema). Hvert transportmiddel har sitt eget ikon, og det står alltid i linjebrikken sammen med linjenummeret. Ikoner er aldri pynt, og det brukes ingen emoji.

## Data

Rutedata kommer fra Entur AS under NLOD-lisensen og dekker alle operatører i Norge. Kreditering står nederst på skjermen i `caption` og `muted`: «Rutedata: Entur AS (NLOD-lisens) · alle operatører i Norge».

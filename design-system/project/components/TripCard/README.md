# TripCard

Ett reiseforslag. Lukket viser kortet svaret på et blikk; åpent viser det hver etappe og en «Vis i kart»-handling.

- Hodet er én knapp med `aria-expanded`. Linje 1: `07:41 – 10:25` (Overpass 800, 24 px, aldri brutt) og reisetid til høyre i `muted`. Er avgangen forsinket, står opprinnelig tid gjennomstreket foran og ny tid i `warn`.
- Linje 2: «om N min» i `ink` under en time, «Direkte» / «1 bytte» / «2 bytter», «Sanntid» i `ok` og første spor eller plattform.
- Linje 3: LinePill/WalkChip-rad med «›». Linje 4: reisestolpe der hver etappe er `flex: minutter` (minst 2), gange prikket i `m-foot`.
- Linje 5 «PASSASJERER»: CrowdMeter per kjøretøyetappe med `crowd`, fly med ledige seter. Etapper uten data utelates; ingen data gir ingen rad.
- `notices` vises under hodet som WarningLine: billettkontroll («Billettkontroll meldt ved Tullinløkka på trikk 19 for 12 min siden») og gange over grensen. Vis billettkontroll bare når meldingen er fersk (≤ 30 min).
- Åpent kort: etappeliste med tider, linjefarget stolpe (gange prikket), «Fra X · Plattform B», «Til Y · 4 stopp underveis», belegg «Trangt om bord». Fly får infoboks med flightnummer, status, ledige seter, gate, bagasjeslipp, bagasjebånd og flytype – bare radene som har data.
- `expanded` + `onToggle` gjør kortet kontrollert, slik at appen kan huske åpent kort. `actions` vises nederst i åpent kort; bruk én primær Button med ikon `pin`: «Vis i kart».
- Legg kortene i `<ul className="rt-list">`.

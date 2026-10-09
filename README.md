# Reisetavla

Reisesøk og avgangstavle for kollektivtrafikk i Norge. Data fra Entur (NLOD).

## Filer
- `index.html` – hele appen
- `manifest.webmanifest` – navn, ikon og fullskjerm når den legges på Hjem-skjerm
- `sw.js` – service worker: appen åpner raskt og uten nett; rutedata hentes alltid ferskt
- `icons/` – app-ikoner

## Oppdatere appen
Endre `index.html`, last opp på nytt. Endrer du ikoner eller manifest, øk `VERSION` i `sw.js` (f.eks. `reisetavla-v2`).

## Deling
Lenken inneholder hele oppsettet:
`?fra=NSR:StopPlace:58404&fn=Nationaltheatret&til=60.1934,11.0976&tn=Oslo lufthavn&k=avreise&t=08:00&m=rail,coach`
Alle felt er valgfrie.

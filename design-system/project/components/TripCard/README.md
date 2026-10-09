# TripCard

Ett reiseforslag. Lukket viser kortet svaret, og åpent viser det hver etappe.

- Første linje: avgang – ankomst i `time-lg` og reisetid i `time-md` til høyre. Er avgangen forsinket, står opprinnelig tid gjennomstreket foran, og ny tid står i `warn`.
- Metalinje: «om N min» i `ink` under en time, ellers ingenting; deretter «Direkte» eller «N bytte(r)», «Sanntid» og spor eller plattform.
- Reisestolpen (`bar-height`) viser etappene i riktig lengde: linjefarge for kjøring og prikket `m-foot` for gange.
- Avvik vises med WarningLine nederst i kortet. Innstilt etappe gir en `crit`-linje.
- Hele hodet er én knapp med `aria-expanded`. Etappelisten bruker linjefargen som stolpe.
# DepartureRow

Én avgang på en avgangstavle: linjebrikke, destinasjon og tid.

- Tiden til høyre: «nå», «N min» under 15 minutter med klokkeslett under, ellers klokkeslett.
- Forsinket gir tid i `warn` og «var HH:MM» under.
- Innstilt gir destinasjon og tid gjennomstreket i `muted`, med ordet «Innstilt» i `crit`.
- Destinasjonen kuttes med ellipse på én linje. Spor eller plattform, operatør og «Sanntid» står under i `caption`.
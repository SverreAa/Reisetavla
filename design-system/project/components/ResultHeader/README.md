# ResultHeader

Overskriften over resultatlisten, med lagre- og deleknapp til høyre.

- Tittel i `title` beskriver søket («Fra → Til» eller «Avganger fra X»). Undertittelen i `muted` gjentar tidspunkt og transportmidler.
- Stjernen er `pressed` når akkurat dette oppsettet er lagret.- `onSave` og `onShare` kobler knappene; send `null` for å skjule en av dem.

# Root

Rotelementet som alle Reisetavla-komponenter må ligge inni. Det setter font (`body`), tekstfarge (`ink`), bakgrunn (`bg`) og nullstiller knapper.

- Uten Root får knapper nettleserens standardutseende, og teksten faller tilbake til systemfonten.
- `screen` gir skjermoppsettet: én kolonne på maks `content-max` (560 px), sidemarg `space-16` og `space-14` mellom seksjoner.
- `theme="dark"` eller `theme="light"` tvinger et tema. Uten `theme` følger appen systemets innstilling.
- Uten `theme` leser Root systemets lys/mørk-innstilling og setter `data-theme` selv, så mørkt tema virker uten media query i CSS.

# CrowdMeter

Passasjerbelegg for én etappe: tre søyler og et ord. Data kommer fra Enturs `occupancyStatus`; mangler data, vises ingenting.

- Nivå 1 «God plass»: én søyle i `ok`. Nivå 2 «Noe trangt»: to søyler i `warn`. Nivå 3 «Trangt»: tre søyler i `crit`. Ufylte søyler er `line`.
- Søylene er 4 px brede, 7/10/13 px høye med 2 px mellomrom. Ordet står alltid med, så belegget aldri vises med farge alene.
- `code` setter linjekoden foran (brukes i TripCard-hodet). `label` overstyrer ordet, for eksempel «Trangt om bord».
- Fly har ingen søyler; vis «14 ledige seter» (under 10: «bare 6 ledige seter») som tekst i stedet.

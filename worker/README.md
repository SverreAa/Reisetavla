# Reisetavla flydata (Cloudflare Worker)

Henter Avinors åpne flydata (gate, innsjekk, status, ny tid, bagasjebånd) for flyplassene appen spør om.
Avinor avviser forespørsler direkte fra nettlesere, så appen spør denne Worker-en.

```
GET /flydata?airports=OSL,BGO               → alle flygninger for OSL og BGO
GET /flydata?airports=OSL,BGO&flights=WF1403 → bare WF1403
```

- Hver flyplass mellomlagres i 3 minutter, så Avinor får høyst én forespørsel per flyplass per 3. minutt.
- Svarer bare nettsider fra `https://sverreaa.github.io` (og `localhost:5173` for utvikling).
- Samme JSON-format som `flydata.json` fra reservejobben på GitHub. Tolkingen ligger i `src/avinor.js` og deles med `scripts/flydata.mjs`.
- Gratisplanen hos Cloudflare holder godt: 100 000 forespørsler per døgn.

## Oppsett (én gang)

1. Lag en gratis konto på https://dash.cloudflare.com/sign-up.
2. **Konto-ID:** i dashbordet, velg *Workers & Pages*. Konto-ID står i høyre kolonne («Account ID»). Kopier den.
3. **Underdomene:** første gang du åpner *Workers & Pages* blir du bedt om å velge et underdomene, f.eks. `sverreaa`. Worker-en får da adressen `https://reisetavla-flydata.sverreaa.workers.dev`.
4. **API-token:** øverst til høyre → *My Profile* → *API Tokens* → *Create Token* → malen **Edit Cloudflare Workers** → *Use template* → velg kontoen din under «Account Resources» og «All zones» under «Zone Resources» → *Continue to summary* → *Create Token*. Kopier tokenet (vises bare én gang).
5. **Hemmeligheter i GitHub:** github.com/SverreAa/Reisetavla → *Settings* → *Secrets and variables* → *Actions* → *New repository secret*:
   - `CLOUDFLARE_API_TOKEN` = tokenet fra punkt 4
   - `CLOUDFLARE_ACCOUNT_ID` = konto-ID fra punkt 2
6. **Rull ut:** *Actions* → *Cloudflare Worker for flydata* → *Run workflow*. Etter et halvt minutt svarer
   `https://reisetavla-flydata.<underdomene>.workers.dev/flydata?airports=OSL`.
7. Sett adressen i `app/src/lib/config.js` (`FLYDATA_WORKER`), bygg appen og publiser.

Senere endringer i `worker/` rulles ut automatisk ved push til `main`.

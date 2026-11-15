// Kobler Enturs flyplassnavn («Bergen lufthavn Flesland», «Harstad/Narvik lufthavn Evenes») til Avinors
// IATA-koder, så appen kan be om flydata for akkurat de flyplassene reisen går via.
// Rekkefølgen betyr noe: mer spesifikke navn først (Evenes før Narvik).
const TABLE = [
  ['OSL', ['gardermoen', 'oslo']], ['BGO', ['flesland', 'bergen']], ['TRD', ['værnes', 'trondheim']],
  ['SVG', ['sola', 'stavanger']], ['TOS', ['tromsø']], ['BOO', ['bodø']], ['AES', ['vigra', 'ålesund']],
  ['KRS', ['kjevik', 'kristiansand']], ['HAU', ['karmøy', 'haugesund']], ['MOL', ['årø', 'molde']],
  ['KSU', ['kvernberget', 'kristiansund']], ['EVE', ['evenes', 'harstad']], ['BDU', ['bardufoss']],
  ['ALF', ['alta']], ['LKL', ['banak', 'lakselv']], ['HFT', ['hammerfest']], ['HVG', ['valan', 'honningsvåg']],
  ['MEH', ['mehamn']], ['VDS', ['vadsø']], ['KKN', ['høybuktmoen', 'kirkenes']], ['BVG', ['berlevåg']],
  ['SOJ', ['sørkjosen']], ['VAW', ['svartnes', 'vardø']], ['BJF', ['båtsfjord']], ['SSJ', ['stokka', 'sandnessjøen']],
  ['MQN', ['røssvoll', 'mo i rana']], ['MJF', ['kjærstad', 'mosjøen']], ['RVK', ['ryum', 'rørvik']],
  ['ANX', ['andøya', 'andenes']], ['LKN', ['leknes']], ['SVJ', ['helle', 'svolvær']], ['BNN', ['brønnøysund', 'brønnøy']],
  ['SKN', ['skagen', 'stokmarknes']], ['SOG', ['haukåsen', 'sogndal']], ['FDE', ['bringeland', 'førde']],
  ['FRO', ['florø']], ['SDN', ['anda', 'sandane']], ['HOV', ['hovden', 'ørsta', 'volda']], ['OSY', ['namsos']],
  ['RRS', ['røros']], ['RET', ['røst']], ['NVK', ['framnes', 'narvik']], ['HAA', ['hasvik']],
  ['VDB', ['leirin', 'fagernes']], ['LYR', ['longyearbyen', 'svalbard']],
];
const W = 'a-zæøåäöü0-9';
const RULES = TABLE.map(([code, words]) => [code, words.map((w) => new RegExp(`(^|[^${W}])${w}($|[^${W}])`))]);

export function airportCode(name) {
  const n = String(name || '').toLowerCase();
  if (!n) return null;
  for (const [code, rxs] of RULES) if (rxs.some((rx) => rx.test(n))) return code;
  return null;
}

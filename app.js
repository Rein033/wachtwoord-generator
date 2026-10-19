/* Wachtwoord Generator: alles via crypto.getRandomValues, zonder modulo-afwijking */
const SETS = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', digits: '0123456789', symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~' };
const LIJKT = /[Il1O0o|]/g;
const WOORDEN = ('aap appel arm auto baan baard bad bak bal band bank bus bed beer been berg beurs bezem bij bijl bil blad blik bloem boek boom boon boot bord bos bot boter brief bril brood brug buik bui buur cake clown dag dak dal dans das deeg deken deur dief dier dijk ding dok dolfijn dom doos dorp draak draad drop duif duim duin ei eend eiland emmer engel erwt ezel fiets film fles fluit fontein fort foto fruit gans gat geit geld gips glas goud gras grot haai haan haar hagel hak hal halm ham hamer hand hark hart haven hek held hemel hert hoed hoek hok hond honing hoorn hoofd hooi huis hut ijs inkt jas jurk kaas kabel kaars kaart kade kalf kam kamer kameel kanaal kano kap kar kast kat kegel kelder kerk kers ketel kever kikker kip kist klei klok knie knoop koe koek koffer kogel kok kom konijn koning kool kop koraal kous kraan kroon kruik kuil kussen laars ladder lamp land lans lat leeuw lepel les lever licht lied lijm lijn lint lip lucht maan mand mast mat meer meeuw melk mes mier molen mond mos muis munt muur mug naald nacht neus nest net noot oever olie oma oog oor opa oven paal pad pak pan papier park pauw peer pen peper pet piano pijl pijp pil plank plas plein ploeg pluim poes pomp pop post pot prik pruik raam rad radijs rat regen reus riem ring rits rivier rok roos rots rug ruit schaap schaar schelp schep schip schoen school schuur sjaal slak slang sleutel slot sluis smid sneeuw snoep sok soep spar speer spin spons stal stam ster stoel stok storm straat strik strand stroom suiker taart tafel tak tand tang tas tegel tent ton toren touw trap trein trui tuin tulp uil ui vaas vaatje vacht val valk varken veer veld venster verf vest vijver vinger vis vlag vlam vleugel vlieg vlinder vloer vlot vogel volk vork vos vuur wagen wal walvis wand wang want water web weg wiel wind wolk wolf worm worst zaag zaal zadel zak zand zee zeef zeep zeil zon zool zout zwaan zwaard') .split(' ')
  .concat('blauw groen rood geel paars oranje roze grijs zwart wit bruin zilver gouden snel traag groot klein lang kort dik dun warm koud nat droog zacht hard licht donker blij stil luid vrolijk dapper slim wild tam rond scherp bot zoet zuur zout bitter vers oud nieuw jong rijk arm vol leeg hoog laag diep breed smal sterk zwak ruw glad vrij'.split(' '))
  .concat('lopen rennen zwemmen fietsen vliegen dansen zingen lezen schrijven tekenen koken bakken spelen werken slapen dromen lachen huilen fluiten springen klimmen vissen roeien zeilen varen bouwen breken graven planten plukken wassen poetsen'.split(' '));

function rnd(n) {   // eerlijk getal in [0, n)
  const max = Math.floor(0x100000000 / n) * n, a = new Uint32Array(1);
  do crypto.getRandomValues(a); while (a[0] >= max);
  return a[0] % n;
}
const st = opslag.lees('pw.inst', { modus: 'tekens', len: 16, cnt: 5, sets: { upper: true, lower: true, digits: true, symbols: false }, similar: false, wrd: 6, sep: '-', hoofd: true, getal: true });

function pool() {
  let p = Object.keys(SETS).filter((k) => st.sets[k]).map((k) => SETS[k]).join('');
  if (st.similar) p = p.replace(LIJKT, '');
  return p;
}
function maakTekens() {
  const p = pool(), gekozen = Object.keys(SETS).filter((k) => st.sets[k]);
  // zorg dat elk gekozen soort teken minstens één keer voorkomt (opnieuw trekken tot het klopt: blijft eerlijk verdeeld)
  for (let poging = 0; poging < 50; poging++) {
    const pw = Array.from({ length: st.len }, () => p[rnd(p.length)]).join('');
    if (st.len < gekozen.length || gekozen.every((k) => [...pw].some((c) => SETS[k].includes(c)))) return pw;
  }
  return Array.from({ length: st.len }, () => p[rnd(p.length)]).join('');
}
function maakZin() {
  const w = Array.from({ length: st.wrd }, () => { const x = WOORDEN[rnd(WOORDEN.length)]; return st.hoofd ? x[0].toUpperCase() + x.slice(1) : x; });
  return w.join(st.sep) + (st.getal ? st.sep + rnd(100) : '');
}
function bits() {
  if (st.modus === 'zin') return st.wrd * Math.log2(WOORDEN.length) + (st.getal ? Math.log2(100) : 0);
  const n = pool().length; return n ? st.len * Math.log2(n) : 0;
}
function duur(b) {   // 10 miljard pogingen per seconde, gemiddeld de helft van alle mogelijkheden
  const s = Math.pow(2, b - 1) / 1e10;
  const een = [[31557600e9, 'miljard jaar'], [31557600e6, 'miljoen jaar'], [31557600e3, 'duizend jaar'], [31557600, 'jaar'], [86400, 'dag', 'dagen'], [3600, 'uur'], [60, 'minuut', 'minuten'], [1, 'seconde', 'seconden']];
  if (s < 1) return 'minder dan een seconde';
  if (s > 31557600e12) return 'langer dan het heelal bestaat';
  const [d, l, mv] = een.find(([x]) => s >= x), n = Math.round(s / d); return `ongeveer ${n.toLocaleString('nl-NL')} ${n === 1 || !mv ? l : mv}`;
}
function sterkte() {
  const b = Math.round(bits());
  const [label, kl, w] = b < 40 ? ['Zwak', 'var(--bad)', 20] : b < 60 ? ['Matig', 'var(--warn)', 45] : b < 80 ? ['Goed', '#1e88e5', 70] : ['Erg sterk', 'var(--ok)', 100];
  $('#sterk').textContent = `${label} · ${b} bits`;
  $('#sterkuit').textContent = `Raden met een snelle computer: ${duur(b)}`;
  $('#sbar').style.width = w + '%'; $('#sbar').style.background = kl; $('#sic').style.color = kl;
}
let huidige = [];
function genereer() {
  if (st.modus === 'tekens' && !pool()) return toast('Kies minstens één soort tekens');
  huidige = Array.from({ length: st.cnt }, () => (st.modus === 'zin' ? maakZin() : maakTekens()));
  $('#lijst').innerHTML = huidige.map((pw, i) => `<div class="pw"><code>${[...pw].map((c) => /\d/.test(c) ? `<span class="d">${esc(c)}</span>` : /[^A-Za-z0-9 ]/.test(c) && st.modus === 'tekens' ? `<span class="y">${esc(c)}</span>` : esc(c)).join('')}</code>
    <button type="button" class="ib" data-i="${i}" title="Kopiëren"><i class="mdi mdi-content-copy"></i></button></div>`).join('');
  sterkte(); opslag.schrijf('pw.inst', st);
}
function zetUI() {
  $$('#modus button').forEach((b) => b.classList.toggle('on', b.dataset.v === st.modus));
  $('#opt-tekens').hidden = st.modus !== 'tekens'; $('#opt-zin').hidden = st.modus !== 'zin';
  $('#len').value = st.len; $('#lenv').textContent = st.len; $('#cnt').value = st.cnt; $('#cntv').textContent = st.cnt; $('#wrd').value = st.wrd; $('#wrdv').textContent = st.wrd;
  $$('[data-set]').forEach((c) => { c.checked = !!st.sets[c.dataset.set]; });
  $('#similar').checked = st.similar; $('#hoofd').checked = st.hoofd; $('#getal').checked = st.getal;
  $$('#sep button').forEach((b) => b.classList.toggle('on', b.dataset.v === st.sep));
}
$('#modus').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; st.modus = b.dataset.v; zetUI(); genereer(); };
$('#sep').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; st.sep = b.dataset.v; zetUI(); genereer(); };
for (const [id, k] of [['len', 'len'], ['cnt', 'cnt'], ['wrd', 'wrd']]) $('#' + id).oninput = (e) => { st[k] = +e.target.value; $('#' + id + 'v').textContent = st[k]; genereer(); };
$$('[data-set]').forEach((c) => { c.onchange = () => { st.sets[c.dataset.set] = c.checked; if (!pool()) { c.checked = true; st.sets[c.dataset.set] = true; return toast('Minstens één soort tekens nodig'); } genereer(); }; });
for (const k of ['similar', 'hoofd', 'getal']) $('#' + k).onchange = (e) => { st[k] = e.target.checked; genereer(); };
$('#gen').onclick = genereer;
$('#lijst').onclick = (e) => { const b = e.target.closest('[data-i]'); if (b) kopieer(huidige[+b.dataset.i], 'Wachtwoord gekopieerd'); };
$('#alles').onclick = () => kopieer(huidige.join('\n'), `${huidige.length} wachtwoorden gekopieerd`);
zetUI(); genereer();

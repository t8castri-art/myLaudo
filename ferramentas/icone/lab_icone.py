import base64, os
sp = os.path.dirname(os.path.abspath(__file__))
mask = base64.b64encode(open(os.path.join(sp, 'mono_mask.png'), 'rb').read()).decode()
dest = os.path.join(sp, "..", "..", "docs", "laboratorio-do-icone.html")

html = """<meta charset="utf-8">
<title>Laboratório do Ícone</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400&display=swap">
<style>
:root{
  --bg:#09080b;--s1:#100e13;--s2:#16141b;--bd:#221f28;--bd2:#2f2b37;
  --tx:#ececee;--tx2:#9b97a3;--tx3:#605c69;
  --ac:#bc7ba4;--acT:#dcb9cd;--acTint:rgba(188,123,164,.12);--sal:#9aaf9c;
  --f:'IBM Plex Sans',system-ui,sans-serif;--m:'IBM Plex Mono',ui-monospace,monospace;
  /* controles */
  --w:9;               /* peso do traço */
  --icBg:#09080b;      /* fundo do ícone */
  --icAc:#bc7ba4;      /* cor principal */
  --icSec:#9aaf9c;     /* cor de apoio */
}
*{box-sizing:border-box}
html{color-scheme:dark}
body{margin:0;background:var(--bg);color:var(--tx);font-family:var(--f);font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0;text-align:left}
:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.wrap{max-width:1080px;margin:0 auto;padding-inline:20px;padding-block:26px 80px}
header h1{font-size:22px;font-weight:500;margin:0;letter-spacing:-.01em}
header p{margin:6px 0 0;color:var(--tx2);font-size:13.5px;max-width:74ch}
.bar{position:sticky;top:0;z-index:5;background:linear-gradient(var(--bg) 70%,transparent);padding-block:16px;margin-block:18px 6px;display:flex;flex-wrap:wrap;gap:18px}
.grupo{display:flex;flex-direction:column;gap:6px}
.grupo .k{font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--tx3)}
.segm{display:flex;border:1px solid var(--bd2);border-radius:9px;overflow:hidden}
.segm button{text-align:center;font-size:12.5px;padding:7px 12px;color:var(--tx2);border-left:1px solid var(--bd2)}
.segm button:first-child{border-left:0}
.segm button[aria-pressed="true"]{background:var(--acTint);color:var(--acT)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:14px}
.card{border:1px solid var(--bd);border-radius:14px;background:var(--s1);padding:14px}
.card h2{font-size:14px;font-weight:500;margin:0 0 2px}
.card p{margin:0 0 12px;font-size:12px;color:var(--tx2);min-height:32px}
.tiles{display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap}
.tile{display:flex;flex-direction:column;align-items:center;gap:6px}
.tile small{font-size:10px;color:var(--tx3);font-family:var(--m)}
.ic{border-radius:22.5%;overflow:hidden;display:block;box-shadow:0 6px 18px rgba(0,0,0,.5)}
.ic.g60{width:60px;height:60px;border-radius:14px}
.ic.g120{width:120px;height:120px;border-radius:27px}
.antes{opacity:.9}
.antes .ic{filter:saturate(.9)}
.home{margin-top:34px;border:1px solid var(--bd);border-radius:20px;background:
  radial-gradient(120% 90% at 20% 0%,#1d1a23 0%,#0b0a0d 60%);padding:26px 20px 30px}
.home .linha{display:flex;gap:26px;flex-wrap:wrap;justify-content:center}
.home .app{display:flex;flex-direction:column;align-items:center;gap:7px;width:76px}
.home .app span{font-size:11px;color:#d7d4da;text-align:center}
.nota{font-size:12px;color:var(--tx3);margin-top:10px}
.sel{outline:2px solid var(--ac);outline-offset:3px}
.escolha{margin-top:8px;font-size:12px;color:var(--acT)}
</style>

<div class="wrap">
  <header>
    <h1>Laboratório do ícone</h1>
    <p>As ferramentas do aparelho como ícone: caliper em X, elipse, espectro Doppler com subida rápida e o campo do transdutor, agora também na versão minimalista. Abre já no seu ajuste: traço fino, rosa com sálvia e degradê que fecha em preto embaixo. Mexa nos controles e tudo muda junto. No fim da página, a simulação da tela do iPhone, que é onde o ícone precisa funcionar.</p>
  </header>

  <div class="bar">
    <div class="grupo"><span class="k">Fundo</span>
      <div class="segm" id="fundo">
        <button type="button" data-v="chapado">chapado</button>
        <button type="button" data-v="degrade" aria-pressed="true">degradê</button>
        <button type="button" data-v="claro">invertido</button>
      </div>
    </div>
    <div class="grupo"><span class="k">Peso do traço</span>
      <div class="segm" id="peso">
        <button type="button" data-v="6" aria-pressed="true">fino</button>
        <button type="button" data-v="9">médio</button>
        <button type="button" data-v="14">grosso</button>
      </div>
    </div>
    <div class="grupo"><span class="k">Cor</span>
      <div class="segm" id="cor">
        <button type="button" data-v="rosa">rosa</button>
        <button type="button" data-v="duo" aria-pressed="true">rosa + sálvia</button>
        <button type="button" data-v="claro">rosa claro</button>
      </div>
    </div>
  </div>

  <div class="grid" id="grid"></div>

  <section class="home">
    <p class="k" style="text-align:center;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--tx3);margin:0 0 18px">Na tela do iPhone</p>
    <div class="linha" id="home"></div>
    <p class="nota" style="text-align:center">Toque num ícone da grade para trocar o que aparece aqui.</p>
  </section>
</div>

<script>
const MONO="data:image/png;base64,__MASK__";
const S=512;
const bgDef=()=>`<defs>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3a2833"/><stop offset=".18" stop-color="#2b1e26"/>
    <stop offset=".40" stop-color="#1c141a"/><stop offset=".62" stop-color="#110c10"/>
    <stop offset=".82" stop-color="#070507"/><stop offset="1" stop-color="#000000"/>
  </linearGradient></defs>`;
const fundo=()=>`${bgDef()}<rect width="${S}" height="${S}" fill="var(--icBg)"/>`;
const W=()=>'var(--w)';

// --- peças ---
// caliper em X: não encosta na cápsula do nódulo
const caliper=(x,y,r,cor='var(--icAc)')=>`
  <g stroke="${cor}" stroke-width="calc(${W()} * 1px)" stroke-linecap="round" fill="none">
    <line x1="${x-r}" y1="${y-r}" x2="${x+r}" y2="${y+r}"/>
    <line x1="${x-r}" y1="${y+r}" x2="${x+r}" y2="${y-r}"/>
  </g>`;
const base=(y=320)=>`<line x1="92" y1="${y}" x2="420" y2="${y}" stroke="var(--icSec)" stroke-width="calc(${W()} * .6px)" stroke-linecap="round" opacity=".85"/>`;
const tracejado=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--icSec)" stroke-width="calc(${W()} * .55px)" stroke-dasharray="14 16" stroke-linecap="round"/>`;
const marca=(x,y,w,cor='var(--icAc)')=>`
  <foreignObject x="${x}" y="${y}" width="${w}" height="${w*1.25}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${cor};
      -webkit-mask:url(${MONO}) center/contain no-repeat;mask:url(${MONO}) center/contain no-repeat"></div>
  </foreignObject>`;
// espectro Doppler: subida sistólica quase vertical, n ciclos, com ou sem componente reverso
function espectro(n,{peak=132,base=320,rev=0,x0=98,x1=414,fill=false}={}){
  const w=(x1-x0)/n; let d=`M ${x0} ${base}`;
  for(let i=0;i<n;i++){
    const s=x0+i*w, sub=s+w*0.10, pk=s+w*0.15, meio=s+w*0.42, vale=s+w*0.56, volta=s+w*0.72;
    d+=` L ${s+w*0.05} ${base}`;
    d+=` C ${sub} ${base}, ${sub} ${peak}, ${pk} ${peak}`;
    d+=` C ${pk+w*0.10} ${peak}, ${meio-w*0.06} ${base-(base-peak)*0.30}, ${meio} ${rev?base+rev*0.55:base-6}`;
    if(rev){ d+=` C ${meio+w*0.06} ${base+rev}, ${vale} ${base+rev}, ${volta} ${base}`; }
    else   { d+=` C ${meio+w*0.06} ${base}, ${vale} ${base}, ${volta} ${base}`; }
    d+=` L ${s+w} ${base}`;
  }
  const traco=`<path d="${d}" fill="none" stroke="var(--icAc)" stroke-width="calc(${W()} * 1.2px)" stroke-linecap="round" stroke-linejoin="round"/>`;
  return (fill?`<path d="${d} L ${x1} ${base} Z" fill="var(--icSec)" fill-opacity=".24" stroke="none"/>`:'')+traco;
}
// campo do transdutor linear com trapezoidal ligado
const campo=(nodulo=true)=>`
  <rect x="150" y="70" width="212" height="46" rx="20" fill="var(--icAc)" opacity=".92"/>
  <path d="M 152 126 H 360 L 434 404 Q 256 452 78 404 Z" fill="#050406"/>
  <path d="M 152 126 H 360 L 434 404 Q 256 452 78 404 Z" fill="none" stroke="var(--icAc)" stroke-width="calc(${W()} * .6px)" opacity=".55" stroke-linejoin="round"/>
  ${nodulo?`<circle cx="256" cy="286" r="62" fill="none" stroke="var(--icSec)" stroke-width="calc(${W()} * 1.1px)"/>
    ${caliper(168,286,22)}${caliper(344,286,22)}`:''}`;
const texto=(t,y,size,peso,cor='var(--icAc)',x=S/2)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="'IBM Plex Sans',system-ui,sans-serif" font-size="${size}" font-weight="${peso}" fill="${cor}" letter-spacing="-6">${t}</text>`;

const VAR=[
 {id:'nod', nome:'Nódulo medido', desc:'O nódulo entre os calipers, medido na horizontal. Versão de ontem, agora com traço fino e as marcas fora da cápsula.', antes:true,
  svg:p=>`${fundo()}
    <circle cx="256" cy="256" r="112" fill="none" stroke="var(--icAc)" stroke-width="calc(${W()} * 1.3px)"/>
    ${tracejado(150,256,362,256)}${caliper(140,256,30,'var(--icSec)')}${caliper(372,256,30,'var(--icSec)')}`},
 {id:'cal-duplo', nome:'Só os calipers', desc:'Os dois X e a linha de medida entre eles. Nada mais.', antes:false,
  svg:p=>`${fundo()}${tracejado(176,256,336,256)}${caliper(160,256,36)}${caliper(352,256,36)}`},
 {id:'elipse', nome:'Elipse medida', desc:'A ferramenta de elipse do aparelho, inclinada, com as marcas no eixo maior.', antes:false,
  svg:p=>`${fundo()}
    <ellipse cx="256" cy="256" rx="150" ry="86" fill="none" stroke="var(--icAc)" stroke-width="calc(${W()} * 1.3px)" transform="rotate(-18 256 256)"/>
    ${caliper(114,300,26,'var(--icSec)')}${caliper(398,212,26,'var(--icSec)')}`},
 {id:'dop1', nome:'Doppler · 1 onda', desc:'Subida sistólica quase vertical, pico fino e componente reverso. Um ciclo só.', antes:false,
  svg:p=>`${fundo()}${base()}${espectro(1,{rev:56})}`},
 {id:'dop2', nome:'Doppler · 2 ondas', desc:'O mesmo espectro, dois ciclos. Já parece um traçado de verdade.', antes:false,
  svg:p=>`${fundo()}${base()}${espectro(2,{rev:52})}`},
 {id:'campo', nome:'Campo trapezoidal', desc:'O transdutor linear com o trapezoidal ligado, o campo em preto sobre o degradê e o nódulo calipado dentro.', antes:false,
  svg:p=>`${fundo()}${campo(true)}`},
 {id:'campo-min', nome:'Campo minimalista', desc:'Fundo todo preto, o degradê só dentro do feixe e o nódulo medido no meio. O transdutor fica subentendido na borda de cima.', antes:false,
  svg:p=>`${bgDef()}<rect width="${S}" height="${S}" fill="#000"/>
    <path d="M 170 0 H 342 L 470 452 Q 256 500 42 452 Z" fill="url(#g)"/>
    <circle cx="256" cy="286" r="88" fill="none" stroke="var(--icAc)" stroke-width="calc(${W()} * 1.2px)"/>
    ${tracejado(172,286,340,286)}${caliper(160,286,24,'var(--icSec)')}${caliper(352,286,24,'var(--icSec)')}`},
 {id:'mL-cal', nome:'mL medido', desc:'O nome do app entre as marcas de medida.', antes:false,
  svg:p=>`${fundo()}${texto('<tspan fill="#ececee">m</tspan>L',318,180,p.leve?300:500)}${caliper(256,112,28,'var(--icSec)')}${caliper(256,400,28,'var(--icSec)')}`},
];

const ANTES={peso:14,fundo:'chapado',cor:'rosa'};
let cfg={peso:'6',fundo:'degrade',cor:'duo'}, atual='cal-duplo';

function estilo(p){
  const bg = p.fundo==='degrade' ? 'url(#g)' : p.fundo==='claro' ? '#e8e5ea' : '#09080b';
  const ac = p.cor==='claro' ? '#dcb9cd' : '#bc7ba4';
  const sec= p.cor==='duo' ? '#9aaf9c' : ac;
  return `--w:${p.peso};--icBg:${bg};--icAc:${ac};--icSec:${sec}`;
}
function icone(v,px,p){
  const leve = +p.peso <= 6;
  return `<svg class="ic ${px<=60?'g60':'g120'}" viewBox="0 0 ${S} ${S}" width="${px}" height="${px}" style="${estilo(p)}" role="img" aria-label="${v.nome}">${v.svg({leve})}</svg>`;
}
function pinta(){
  document.querySelectorAll('.segm').forEach(g=>g.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.v===cfg[g.id])));
  document.getElementById('grid').innerHTML = VAR.map(v=>`
    <div class="card ${v.id===atual?'sel':''}" data-id="${v.id}">
      <h2>${v.nome}</h2><p>${v.desc}</p>
      <div class="tiles">
        ${v.antes?`<div class="tile antes">${icone(v,120,ANTES)}<small>antes</small></div>`:''}
        <div class="tile">${icone(v,120,cfg)}<small>agora</small></div>
        <div class="tile">${icone(v,60,cfg)}<small>60 px</small></div>
      </div>
    </div>`).join('');
  document.querySelectorAll('.card').forEach(c=>c.onclick=()=>{atual=c.dataset.id;pinta();});
  const v=VAR.find(x=>x.id===atual);
  document.getElementById('home').innerHTML=['Fotos','myLaudo','Zanno','Notas'].map(nome=>`
    <div class="app">${nome==='myLaudo'?icone(v,60,cfg):`<div class="ic g60" style="background:#1d1a23"></div>`}<span>${nome}</span></div>`).join('');
}
document.querySelectorAll('.segm').forEach(g=>g.querySelectorAll('button').forEach(b=>b.onclick=()=>{cfg[g.id]=b.dataset.v;pinta();}));
pinta();
</script>
"""

open(dest, 'w', encoding='utf8').write(html.replace('__MASK__', mask))
print('ok', dest, len(html) + len(mask))

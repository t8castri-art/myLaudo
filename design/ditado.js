// myLaudo · ditado por item (nódulo, linfonodo, lesão do leito).
// A voz vira texto no iPhone; este arquivo reparte o texto nos campos. Nada vai para IA.
// Ordem esperada da fala: localização + características + medidas em cm por último.

// ---------- texto falado → texto com números ----------
const DITADO_NUM={zero:0,um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,onze:11,doze:12,treze:13,quatorze:14,catorze:14,quinze:15,dezesseis:16,dezasseis:16,dezessete:17,dezoito:18,dezenove:19,vinte:20,trinta:30,quarenta:40,cinquenta:50,sessenta:60,setenta:70,oitenta:80,noventa:90};
function ditadoTexto(s){
  let t=String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  t=t.replace(/(\d)\s*[x×*]\s*(?=\d)/g,'$1 por ').replace(/[;:!?]/g,' , ');
  const tk=t.split(/\s+/).filter(Boolean), out=[];
  for(let i=0;i<tk.length;i++){
    const m=tk[i].match(/^(.*?)([.,]*)$/), w=m[1];
    if(w in DITADO_NUM){ let v=DITADO_NUM[w];
      if(v>=20&&tk[i+1]==='e'&&DITADO_NUM[tk[i+2]]<10){ v+=DITADO_NUM[tk[i+2]]; i+=2; }
      out.push(String(v)+(m[2]&&!/^\d/.test(tk[i+1]||'')?m[2]:''));
    } else out.push(tk[i]);
  }
  return ' '+out.join(' ')
    .replace(/(\d+)\s+(?:virgula|ponto)\s+(\d+)/g,'$1,$2')
    .replace(/(\d+)\s+e\s+meio\b/g,'$1,5')
    .replace(/\bmeio\s+(centimetro)/g,'0,5 $1')
    .replace(/(\d)[.,](?!\d)/g,'$1 ,')+' ';
}
// "sem X" / "não X" / "ausência de X" anulam X até a próxima vírgula ou "com"
function ditadoNeg(txt,i){ const pre=txt.slice(Math.max(0,i-40),i); const m=[...pre.matchAll(/\b(sem|nao|ausencia de)\b/g)].pop(); if(!m) return false; return !/[,.]|\bcom\b/.test(pre.slice(m.index+m[0].length)); }
function ditadoTem(re,txt){ for(const m of txt.matchAll(new RegExp(re.source,'g'))) if(!ditadoNeg(txt,m.index)) return true; return false; }
// medidas: a última sequência "a por b por c"; cm por padrão, mm se disser ou se passar de 10
function ditadoMedidas(t){
  const N='(\\d+(?:[.,]\\d+)?)', U='\\s*(cm|centimetros?|mm|milimetros?)?', S='\\s*(?:por|x|×)\\s*';
  const ms=[...t.matchAll(new RegExp(N+U+S+N+U+'(?:'+S+N+U+')?','g'))].pop();
  if(!ms) return null;
  const v=[ms[1],ms[3],ms[5]].filter(Boolean).map(x=>parseFloat(x.replace(',','.')));
  const un=[ms[2],ms[4],ms[6]].filter(Boolean).join(' ');
  const emMm=/\bm/.test(un)?true:/c/.test(un)?false:v.some(x=>x>=10);
  return [0,1,2].map(i=>{ if(v[i]==null) return ''; const mm=Math.round((emMm?v[i]:v[i]*10)*10)/10; return Number.isInteger(mm)?String(mm):String(mm).replace('.',','); });
}
const ditadoLado=t=>/\bdireit[oa]\b/.test(t)?'D':/\besquerd[oa]\b/.test(t)?'E':null;
function ditadoEco(t,r){
  if(/(muito|acentuadamente|marcadamente)\s+hipo\s*-?\s*ec/.test(t)) r.eco='muito hipoecoica';
  else if(/hipo\s*-?\s*ec/.test(t)) r.eco='hipoecoica';
  else if(/hiper\s*-?\s*ec/.test(t)) r.eco='hiperecoica';
  else if(/\biso\s*-?\s*ec/.test(t)) r.eco='isoecoica';
  else if(/\ban\s*-?\s*ec/.test(t)) r.eco='anecoica';
}
// Doppler de nódulo/lesão: ausente / central / periférica (combináveis)
function ditadoDopNod(t){
  const td=t.replace(/calcificac\w*\s+periferic\w*/g,' '), d=new Set();
  if(/(vasculariz\w*|fluxo|padrao)(\s+\w+)?\s+mist/.test(td)){ d.add('central'); d.add('periférica'); }
  if(ditadoTem(/\b(central|centrais|intranodular)\b/,td)) d.add('central');
  if(ditadoTem(/periferic|perinodular/,td)) d.add('periférica');
  if(d.size) return d;
  if(/avascular|sem\s+(fluxo|vasculariz|sinal)|(vasculariz\w*|fluxo)\s+(ausente|nao\s+detect)|doppler\s+negativo/.test(td)) return new Set(['ausente']);
  return null;
}
const semMisto=t=>t.replace(/(vasculariz\w*|fluxo|padrao)(\s+\w+)?\s+mist\w*/g,' ');

// ---------- nódulo de tireoide ----------
function ditadoNodulo(fala){
  const t=ditadoTexto(fala), r={};
  if(/lobo\s+direit/.test(t)) r.lobo='D'; else if(/lobo\s+esquerd/.test(t)) r.lobo='E';
  else if(/\bistmo\b/.test(t)) r.lobo='I'; else { const l=ditadoLado(t); if(l) r.lobo=l; }
  const tc=t.match(/\b(superior|medio|media|inferior)\b/); if(tc) r.terco=tc[1]==='superior'?'superior':tc[1]==='inferior'?'inferior':'médio';
  const tcomp=semMisto(t);
  if(/\bmist[oa]\b|solido[\s-]*cistic|cistico[\s-]*solid|predominantemente\s+(solid|cistic)|\bcomplex[oa]\b/.test(tcomp)) r.comp='mista';
  else if(/espongiform/.test(t)) r.comp='espongiforme';
  else if(ditadoTem(/\bcistic[oa]\b|\bcisto\b/,t)) r.comp='cística';
  else if(/\bsolid[oa]\b/.test(t)) r.comp='sólida';
  ditadoEco(t,r); if(!r.eco&&r.comp==='cística') r.eco='anecoica';
  if(/mais\s+alto/.test(t)) r.forma='mais alto que largo'; else if(/mais\s+largo|paralelo/.test(t)) r.forma='mais largo que alto';
  if(ditadoTem(/extens\w*\s+extra\s*-?\s*tireoid/,t)) r.marg='extensão extratireoidiana';
  else if(/lobulad/.test(t)) r.marg='lobuladas';
  else if(/irregular|espiculad|angulad|infiltrativ/.test(t)) r.marg='irregulares';
  else if(/mal\s+(definid|delimitad)|imprecis/.test(t)) r.marg='mal definidas';
  else if(/\blisa|\bregulares\b|bem\s+(definid|delimitad)|circunscrit/.test(t)) r.marg='lisas';
  const f=new Set();
  if(ditadoTem(/cometa/,t)) f.add('cauda de cometa');
  if(ditadoTem(/microcalcific|puntiform/,t)) f.add('microcalcificações');
  if(ditadoTem(/calcificac\w*\s+periferic|casca\s+de\s+ovo|calcificac\w*\s+(anelar|em\s+anel)/,t)) f.add('calcificação periférica');
  if(ditadoTem(/macrocalcific|calcificac\w*\s+grosseir|calcificac\w*\s+grossa/,t)) f.add('macrocalcificações');
  if(f.size) r.focos=f; else if(/\bsem\s+(focos|calcific|microcalcific)/.test(t)) r.focos=new Set(['nenhum']);
  const d=ditadoDopNod(t); if(d) r.dop=d;
  const m=ditadoMedidas(t); if(m) r.med=m;
  return r;
}

// ---------- linfonodo cervical ----------
const DITADO_ROM={i:'I',ii:'II',iii:'III',iv:'IV',v:'V',vi:'VI',vii:'VII','1':'I','2':'II','3':'III','4':'IV','5':'V','6':'VI','7':'VII'};
function ditadoLinf(fala){
  const t=ditadoTexto(fala), r={};
  const nv=t.match(/\bniv\w*\s+(vii|vi|iv|v|iii|ii|i|[1-7])(?:\s*[ab]\b)?/); if(nv) r.nivel=DITADO_ROM[nv[1]];
  const l=ditadoLado(t); if(l) r.lado=l;
  if(/arredondad|redond|globos/.test(t)) r.forma='arredondado'; else if(/\boval|alongad|elipt|reniform/.test(t)) r.forma='ovalado';
  if(/sem\s+hilo|hilo\s+(apagad|ausente|nao\s+(visu|ident|carac))|(ausencia|perda|apagamento)\s+d[oa]\s+hilo/.test(t)) r.hilo='apagado';
  else if(/hilo\s+(preservad|present|visivel|caracteriz|ecogenico|gorduroso)|com\s+hilo/.test(t)) r.hilo='preservado';
  if(/cortical\s+heterogen/.test(t)) r.cort='heterogênea';
  else if(ditadoTem(/cortical\s+espessad|espessamento\s+(da\s+)?cortical/,t)) r.cort='espessada';
  else if(/cortical\s+fina|cortical\s+(preservad|normal)/.test(t)) r.cort='fina';
  if(ditadoTem(/microcalcific|puntiform/,t)) r.extra='microcalcificações';
  else if(ditadoTem(/cistic|necrose|liquefe/,t)) r.extra='cístico';
  else if(/\bsem\s+(microcalcific|calcific|areas\s+cistic)/.test(t)) r.extra='nenhum';
  const td=t.replace(/(areas?|degeneracao|componente)\s+cistic\w*\s+periferic\w*/g,' ');
  const hil=/\bhilar|\bcentral\b/.test(td), per=/periferic|capsular/.test(td);
  if(/(vasculariz\w*|fluxo|padrao)(\s+\w+)?\s+mist/.test(td)||(hil&&per)) r.dop='mista'; else if(per) r.dop='periférica'; else if(hil) r.dop='hilar';
  const m=ditadoMedidas(t); if(m) r.med=m;
  return r;
}

// ---------- lesão do leito tireoidiano (cervical) ----------
function ditadoLeito(fala){
  const t=ditadoTexto(fala), r={};
  if(/\bistmo\b/.test(t)) r.lado='I'; else { const l=ditadoLado(t); if(l) r.lado=l; }
  const tc=semMisto(t);
  if(/\bmist[oa]\b|solido[\s-]*cistic|cistico[\s-]*solid|complex[oa]/.test(tc)) r.comp='mista';
  else if(ditadoTem(/\bcistic[oa]\b|\bcisto\b/,t)) r.comp='cística';
  else if(/\bsolid[oa]\b/.test(t)) r.comp='sólida';
  ditadoEco(t,r); if(r.eco&&!['isoecoica','hipoecoica','muito hipoecoica'].includes(r.eco)) delete r.eco;
  if(/irregular|espiculad|angulad|infiltrativ|lobulad/.test(t)) r.marg='irregulares';
  else if(/mal\s+(definid|delimitad)|imprecis/.test(t)) r.marg='mal definidas';
  else if(/\blisa|\bregulares\b|bem\s+(definid|delimitad)|circunscrit/.test(t)) r.marg='regulares';
  const d=ditadoDopNod(t); if(d) r.dop=d;
  const m=ditadoMedidas(t); if(m) r.med=m;
  return r;
}

// ---------- tela: cartão de ditado ----------
const DITADO_NOMES={lobo:'lobo',terco:'terço',comp:'composição',eco:'ecogenicidade',forma:'forma',marg:'margens',focos:'focos ecogênicos',dop:'Doppler',med:'medidas',nivel:'nível',lado:'lado',hilo:'hilo',cort:'cortical',extra:'microcalcificações / cístico'};
const DITADO_TIPOS={
  nod:{parse:ditadoNodulo,campos:['lobo','terco','comp','eco','forma','marg','focos','dop','med'],ex:'terço superior do lobo direito, nódulo sólido hipoecoico, margens irregulares, com microcalcificações, vascularização central, 2,0 por 1,4 por 1,2'},
  linf:{parse:ditadoLinf,campos:['nivel','lado','forma','hilo','cort','extra','dop','med'],ex:'nível três à direita, linfonodo arredondado, sem hilo, cortical espessada, fluxo periférico, 1,2 por 0,8 por 0,9'},
  leito:{parse:ditadoLeito,campos:['lado','comp','eco','marg','dop','med'],ex:'leito direito, lesão sólida hipoecoica, margens irregulares, fluxo central, 0,8 por 0,6 por 0,5'},
};
const DITADO_CSS=`
.dit{display:flex;gap:10px;align-items:flex-start}
.mic{width:48px;height:48px;border-radius:999px;border:1px solid var(--ac);color:var(--acT);display:flex;align-items:center;justify-content:center;flex:none}
.mic.on{background:var(--ac);color:var(--bg);border-color:var(--ac)}
@media (prefers-reduced-motion:no-preference){.mic.on{animation:micpulse 1.2s ease-in-out infinite}}
@keyframes micpulse{50%{box-shadow:0 0 0 7px var(--acTint)}}
.fala{flex:1;min-width:0;min-height:48px;resize:vertical;padding:7px 9px;border-radius:8px;background:var(--s2);border:1px dashed var(--bd2);color:var(--tx);font:13px/1.45 var(--f);outline:none}
.fala:focus{border-style:solid;border-color:var(--ac);box-shadow:0 0 0 2px var(--acTint)}
.fala::placeholder{color:var(--tx3)}
.dit-falta{font-size:11.5px;color:var(--tx3);margin-top:8px;line-height:1.45}
.dit-falta b{color:var(--alert);font-weight:500}
.dit-on{outline:1px dashed var(--ac);outline-offset:2px}
@media (max-width:600px){.fala{font-size:16px}}`;
if(typeof document!=='undefined') (function(){ const s=document.createElement('style'); s.textContent=DITADO_CSS; document.head.appendChild(s); })();
const DITADO_MIC='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const DITADO_STOP='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
const ditEsc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function ditadoCard(item,tipo){
  const T=DITADO_TIPOS[tipo], falta=item.fala?T.campos.filter(k=>!(item.dict&&item.dict.has(k))):[];
  return `<div class="card"><div class="lbl">Ditado <span class="act">fale tudo de uma vez</span></div>
    <div class="dit"><button type="button" class="mic" id="micBtn" aria-label="Gravar ditado">${DITADO_MIC}</button>
    <textarea class="fala" id="falaTxt" rows="3" placeholder="ex.: ${ditEsc(T.ex)}">${ditEsc(item.fala||'')}</textarea></div>
    ${item.fala?`<div class="dit-falta">${falta.length?`Não ouvi <b>${falta.map(k=>DITADO_NOMES[k]).join(', ')}</b>: ficou o padrão, confira.`:'Todos os campos vieram do ditado. Confira os tracejados.'}</div>`:''}</div>`;
}
// liga o microfone e a caixa; attrs = campo → data-atributo dos chips daquele campo
let DITADO_REC=null, DITADO_ATUAL=null;
// mexeu à mão num campo ditado: some o tracejado dele
if(typeof document!=='undefined') ['click','input'].forEach(ev=>document.addEventListener(ev,e=>{ const A=DITADO_ATUAL; if(!A||!A.item.dict) return;
  Object.entries(A.attrs).forEach(([k,a])=>{ if(e.target.closest&&e.target.closest(`[data-${a}]`)) A.item.dict.delete(k); }); },true));
function ditadoLigar(item,tipo,attrs,rerender,avisar){
  const T=DITADO_TIPOS[tipo], btn=document.getElementById('micBtn'), box=document.getElementById('falaTxt'); if(!btn||!box) return;
  DITADO_ATUAL={item,attrs};
  // marca o que veio do ditado
  if(item.dict) item.dict.forEach(k=>{ const a=attrs[k]; if(!a) return;
    document.querySelectorAll(`#phone [data-${a}]`).forEach(el=>{ if(el.tagName==='INPUT'||el.getAttribute('aria-pressed')==='true') el.classList.add('dit-on'); }); });
  const aplicar=()=>{ const r=T.parse(item.fala); Object.keys(r).forEach(k=>{ item[k]=Array.isArray(r[k])?r[k].slice():r[k]; }); item.dict=new Set(Object.keys(r)); rerender(); };
  box.addEventListener('change',()=>{ item.fala=box.value.trim(); aplicar(); });
  btn.addEventListener('click',()=>{
    if(DITADO_REC){ DITADO_REC.stop(); return; }
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ box.focus(); avisar('Toque no microfone do teclado para ditar'); return; }
    const rec=new SR(); rec.lang='pt-BR'; rec.continuous=true; rec.interimResults=true;
        rec.onresult=e=>{ let s=''; for(let i=0;i<e.results.length;i++) s+=e.results[i][0].transcript; box.value=s.replace(/\s+/g,' ').trim(); };
    rec.onerror=e=>{ avisar(e.error==='not-allowed'||e.error==='service-not-allowed'?'Microfone bloqueado aqui. Use o microfone do teclado.':e.error==='no-speech'?'Não ouvi nada. Toque de novo e fale.':'Ditado falhou ('+e.error+'). Use o microfone do teclado.'); if(e.error!=='no-speech') box.focus(); };
    rec.onend=()=>{ DITADO_REC=null; btn.classList.remove('on'); btn.innerHTML=DITADO_MIC; const v=box.value.trim(); if(v){ item.fala=v; aplicar(); } };
    try{ rec.start(); }catch(err){ avisar('Não deu para abrir o microfone. Use o do teclado.'); box.focus(); return; }
    DITADO_REC=rec; box.value=''; btn.classList.add('on'); btn.innerHTML=DITADO_STOP; btn.setAttribute('aria-label','Parar ditado');
  });
}
if(typeof module!=='undefined') module.exports={ditadoNodulo,ditadoLinf,ditadoLeito,ditadoTexto};

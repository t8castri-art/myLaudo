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
function ditadoNeg(txt,i){ const pre=txt.slice(Math.max(0,i-40),i); const m=[...pre.matchAll(/\b(sem|nao|nega|ausencia de)\b/g)].pop(); if(!m) return false; return !/[,.]|\bcom\b/.test(pre.slice(m.index+m[0].length)); }
function ditadoTem(re,txt){ for(const m of txt.matchAll(new RegExp(re.source,'g'))) if(!ditadoNeg(txt,m.index)) return true; return false; }
// medidas: a última sequência "a por b por c"; cm por padrão, mm se disser ou se passar de 10
function ditadoMedidas(t,primeira){
  const N='(\\d+(?:[.,]\\d+)?)', U='\\s*(cm|centimetros?|mm|milimetros?)?', S='\\s*(?:por|x|×)\\s*';
  const all=[...t.matchAll(new RegExp(N+U+S+N+U+'(?:'+S+N+U+')?','g'))], ms=primeira?all[0]:all.pop();
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
  nod:{parse:ditadoNodulo,campos:['lobo','terco','comp','eco','med'],ex:'terço superior do lobo direito, nódulo sólido hipoecoico, margens irregulares, com microcalcificações, vascularização central, 2,0 por 1,4 por 1,2'},
  linf:{parse:ditadoLinf,campos:['nivel','lado','med'],ex:'nível três à direita, linfonodo arredondado, sem hilo, cortical espessada, fluxo periférico, 1,2 por 0,8 por 0,9'},
  leito:{parse:ditadoLeito,campos:['lado','comp','med'],ex:'leito direito, lesão sólida hipoecoica, margens irregulares, fluxo central, 0,8 por 0,6 por 0,5'},
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

// ======================================================================
// Ditado do exame inteiro (cartão no topo do laudo): preenche indicação,
// anamnese, órgão e medidas. Itens (nódulo, linfonodo...) têm ditado próprio.
// Cada parser devolve {caminho no estado: valor}, ex. {'gl.sim':'assimétrica'}.
// ======================================================================
const DIT_MESES={janeiro:1,fevereiro:2,marco:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12};
const p2=n=>String(n).padStart(2,'0');
// pedaços do texto depois de cada rótulo, até o próximo rótulo
function ditSegs(t,labels){
  const hits=[]; Object.entries(labels).forEach(([k,re])=>{ for(const m of t.matchAll(new RegExp(re.source,'g'))) hits.push({k,i:m.index,e:m.index+m[0].length}); });
  hits.sort((a,b)=>a.i-b.i); const out={};
  hits.forEach((h,j)=>{ const fim=j+1<hits.length?hits[j+1].i:t.length; out[h.k]=(out[h.k]||'')+' '+t.slice(h.e,fim)+' '; });
  return out;
}
// texto sem os trechos que falam de nódulo/lesão (para não confundir com o órgão)
const ditSemItens=(t,re,ate)=>t.replace(new RegExp('('+re.source+')[\\s\\S]*?(?='+ate.source+'|$)','g'),' ');
// número depois de um rótulo; devolve em mm (cm vira mm)
function ditNum(t,re,padraoMm){
  const m=t.match(new RegExp(re.source+'[^0-9]{0,25}?(\\d+(?:[.,]\\d+)?)\\s*(mm|milimetros?|cm|centimetros?)?')); if(!m) return null;
  let v=parseFloat(m[m.length-2].replace(',','.')); const u=m[m.length-1]||'';
  if(/^c/.test(u)||(!u&&!padraoMm&&v<5&&/[.,]/.test(m[m.length-2]))) v=v*10;
  v=Math.round(v*10)/10; return Number.isInteger(v)?String(v):String(v).replace('.',',');
}
// "06/25", "junho de 2025", "junho de 25" → mm/aa
function ditMesAno(t){
  let m=t.match(/\b(\d{1,2})\s*\/\s*(\d{2,4})\b/); if(m&&+m[1]<=12) return p2(m[1])+'/'+m[2].slice(-2);
  m=t.match(/\b(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+(?:de\s+)?(\d{2,4})\b/); if(m) return p2(DIT_MESES[m[1]])+'/'+m[2].slice(-2);
  return null;
}
// "28/08/2026", "28 de agosto de 2026", "28 de agosto" → dd/mm/aaaa
function ditData(t){
  let m=t.match(/\b(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})\b/); if(m) return p2(m[1])+'/'+p2(m[2])+'/'+(m[3].length===2?'20'+m[3]:m[3]);
  m=t.match(/\b(\d{1,2})\s+(?:de\s+)?(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+(?:de\s+)?(\d{4}))?/);
  if(m){ const hoje=new Date(), mes=DIT_MESES[m[2]]; let a=m[3]?+m[3]:hoje.getFullYear(); if(!m[3]&&mes>hoje.getMonth()+1) a--; return p2(m[1])+'/'+p2(mes)+'/'+a; }
  return null;
}
const ditPrimeiro=(t,pares)=>{ for(const [re,v] of pares) if(re.test(t)) return v; return null; };
// sim / não para um achado citado ("nega X", "sem X" → não)
const ditSimNao=(t,re)=>{ const m=t.match(re); if(!m) return null; return !ditadoNeg(t,m.index); };
// exames anteriores
function ditPrev(t,r){
  if(/\b(sem|nao\s+(trouxe|tem|possui))\s+(\w+\s+){0,2}(exames?|us|ultrass\w*)\s+(anterior|previo)/.test(t)) r['prev.tem']='nao';
  else { const m=t.match(/(exames?|us|ultrass\w*)\s+(anterior|previo)\w*/); if(m){ r['prev.tem']='sim'; const d=ditMesAno(t.slice(m.index,m.index+60)); if(d) r['prev.data']=d; } }
}
// sintomas: lista [nome no chip, regex]
function ditSint(t,lista){ const s=new Set(); lista.forEach(([v,re])=>{ if(ditadoTem(re,t)) s.add(v); }); return s.size?s:null; }

// ---------- tireoide ----------
function ditadoLaudoTireoide(fala){
  const t=ditadoTexto(fala), r={};
  const ind=ditPrimeiro(t,[[/vigilancia\s+ativa/,'Vigilância ativa'],[/pos[\s-]*operatori/,'Pós-operatório'],[/(acompanhamento|controle|seguimento)\s+d[eo]\s+nodul/,'Acompanhamento de nódulo'],[/nodulo\s+palpavel/,'Nódulo palpável'],[/hipotireoid|hipertireoid|funcao\s+tireoid|tsh|tireoidite|hashimoto|graves/,'Alteração de função tireoidiana'],[/\brotina\b|check[\s-]*up/,'Rotina']]); if(ind) r.ind=ind;
  ditPrev(t,r);
  const fm=t.match(/historia\s+familiar|antecedente\s+familiar|(mae|pai|irma|irmao|filh[oa])\s+(com|teve|tem)\s+(cancer|ca)\b/);
  if(fm) r['anam.fam']=ditadoNeg(t,fm.index)?'nao':/(1|primeiro)\s*o?\s*grau|\b(mae|pai|irma|irmao|filh[oa])\b/.test(t)?'sim1':'sim';
  const co=t.match(/(conhec\w*|sabia|sabe)\s+(\w+\s+){0,3}nodul|nodul\w*\s+(ja\s+)?conhecid/); if(co) r['anam.conhece']=!ditadoNeg(t,co.index);
  const tx=ditSimNao(t,/tireoidectomi|operou\s+a\s+tireoide/); if(tx!=null){ r['anam.tx']=tx; if(tx) r['anam.txCa']=/tireoidectomi\w*[^.]{0,40}(cancer|carcinoma|neoplas|maligno)/.test(t); }
  const lv=ditSimNao(t,/levotiroxina|puran|synthroid|euthyrox|tiroxina/); if(lv!=null){ r['anam.levo']=lv; const d=t.match(/(\d+(?:[.,]\d+)?)\s*(mcg|microgramas?|mg)\b/); if(lv&&d) r['anam.dose']=d[1]; }
  const si=ditSint(t,[['pigarro',/pigarro/],['rouquidão',/rouquid|rouca/],['disfagia',/disfag|dificuldade\s+para\s+engolir|engasg/],['falta de ar',/falta\s+de\s+ar|dispneia|cansaco\s+para\s+respirar/]]); if(si) r['anam.sint']=si;
  const g=ditSemItens(t,/\bnodul/,/lobo\s+(direito|esquerdo)[^.]{0,6}\d|\bistmo\b[^.]{0,6}\d|\.|$/).replace(/(vasculariz\w*|fluxo)\s+(\w+\s+)?aumentad\w*/g,' VASCAUM ');
  if(/assimetric/.test(g)) r['gl.sim']='assimétrica'; else if(/\bsimetric/.test(g)) r['gl.sim']='simétrica';
  const dim=ditPrimeiro(g,[[/(dimens\w*|medidas|tamanho|volume)\s+(\w+\s+)?(aumentad|elevad)|(glandula|tireoide)\s+(\w+\s+)?aumentad|bocio|volume\s+aumentado/,'aumentadas'],[/(dimens\w*|medidas|tamanho|volume)\s+(\w+\s+)?(reduzid|diminuid)|(glandula|tireoide)\s+(\w+\s+)?(reduzid|atrofic)/,'reduzidas'],[/(dimens\w*|medidas|tamanho|volume)\s+(\w+\s+)?(habitua|norma|preservad)/,'habituais']]); if(dim) r['gl.dim']=dim;
  if(/(superficie|contorno)\w*\s+(\w+\s+)?(lobulad|irregular)|glandula\s+lobulada/.test(g)) r['gl.sup']='lobulada'; else if(/(superficie|contorno)\w*\s+(\w+\s+)?(regular|lis)/.test(g)) r['gl.sup']='regular';
  if(/heterogene/.test(g)) r['gl.eco']='heterogênea'; else if(/homogene/.test(g)) r['gl.eco']='homogênea';
  if(/VASCAUM|hipervascular|inferno/.test(g)) r['gl.dop']='aumentada'; else if(/doppler\s+(\w+\s+)?(normal|sem\s+altera)|vasculariz\w*\s+(\w+\s+)?(normal|preservad|habitual)/.test(g)) r['gl.dop']='sem alterações';
  const sg=ditSegs(t,{ld:/lobo\s+direito/,le:/lobo\s+esquerdo/,istmo:/\bistmo\b/,nod:/\bnodul\w*/,para:/paratireoide/});
  [['ld','med.ld'],['le','med.le'],['istmo','med.istmo']].forEach(([k,path])=>{ if(!sg[k]) return; const m=ditadoMedidas(sg[k].slice(0,60),true); if(m) r[path]=m; });
  if(/paratireoide\s+(\w+\s+){0,2}(visibiliz|visualiz|identific)/.test(t)&&!/paratireoides?\s+nao\s+(visibiliz|visualiz|identific)/.test(t)) r.para='sim';
  else if(/paratireoides?\s+nao\s+(visibiliz|visualiz|identific)/.test(t)) r.para='nao';
  return r;
}

// ---------- cervical e salivares ----------
function ditadoLaudoCervical(fala){
  const t=ditadoTexto(fala), r={};
  const ind=ditPrimeiro(t,[[/vigilancia|seguimento\s+oncologic|controle\s+oncologic|pesquisa\s+de\s+recidiva/,'Vigilância oncológica'],[/aumento\s+(de\s+)?(volume\s+)?(da\s+)?(glandula|parotida|submandibular|salivar)/,'Aumento de glândula salivar'],[/sinais\s+inflamat|\bdor\s+(cervical|local)/,'Dor / sinais inflamatórios'],[/(nodulo|massa|abaulamento)\s+cervical/,'Nódulo cervical'],[/\brotina\b/,'Rotina']]); if(ind) r.ind=ind;
  ditPrev(t,r);
  const ca=t.match(/(cancer|carcinoma|neoplasia|\bca\b)\s+(\w+\s+){0,2}(tireoide|papilifer|folicular|medular)|(carcinoma|cancer)\s+papilifer/);
  const caO=t.match(/(cancer|carcinoma|neoplasia|\bca\b)\s+(\w+\s+){0,2}(laringe|boca|lingua|faringe|cabeca|epidermoide|orofaringe|nasofaringe)|carcinoma\s+epidermoide/);
  if(ca) r['anam.ca']=ditadoNeg(t,ca.index)?'nao':'tireoide'; else if(caO) r['anam.ca']=ditadoNeg(t,caO.index)?'nao':'outro'; else if(/\b(sem|nega)\s+(historia\s+de\s+)?(cancer|neoplasia)/.test(t)) r['anam.ca']='nao';
  const tx=ditSimNao(t,/tireoidectomi/); if(tx!=null){ r['anam.tx']=tx; if(tx) r['anam.txCa']=/tireoidectomi\w*[^.]{0,40}(cancer|carcinoma|neoplas|maligno)/.test(t)||r['anam.ca']==='tireoide'; }
  const lv=ditSimNao(t,/levotiroxina|puran|synthroid|euthyrox|tiroxina/); if(lv!=null){ r['anam.levo']=lv; const d=t.match(/(\d+(?:[.,]\d+)?)\s*(mcg|microgramas?)\b/); if(lv&&d) r['anam.dose']=d[1]; }
  const si=ditSint(t,[['nódulo palpável',/nodulo\s+palpavel|caroco/],['dor',/\bdor\b|doloros/],['aumento de volume',/aumento\s+de\s+volume|inchaco/],['xerostomia',/xerostomia|boca\s+seca/],['febre',/febre/]]); if(si) r['anam.sint']=si;
  if(/(glandulas?\s+salivares|parotidas\s+e\s+submandibulares)\s+(\w+\s+){0,2}(normais|habituais|sem\s+altera|preservad)/.test(t)) ['parD','parE','subD','subE'].forEach(k=>r['glst.'+k]='habitual');
  [['parD',/parotida\s+direita/],['parE',/parotida\s+esquerda/],['subD',/submandibular\s+direita/],['subE',/submandibular\s+esquerda/]].forEach(([k,re])=>{
    const m=t.match(re); if(!m) return; const w=t.slice(Math.max(0,m.index-40),m.index+m[0].length+50);
    if(/sialoadenite|parotidite|inflamat|aumentad\w*\s+(\w+\s+)?heterogene|hipervascular/.test(w)) r['glst.'+k]='sialoadenite'; else if(/normal|habitual|sem\s+altera/.test(w)) r['glst.'+k]='habitual'; });
  if(/sialoadenite|parotidite/.test(t)&&!Object.keys(r).some(k=>k.startsWith('glst.'))){ const l=ditadoLado(t); if(/parotid/.test(t)) r['glst.par'+(l||'D')]='sialoadenite'; else if(/submandibular/.test(t)) r['glst.sub'+(l||'D')]='sialoadenite'; }
  return r;
}

// ---------- mamas e axilas ----------
function ditadoLaudoMamas(fala){
  const t=ditadoTexto(fala), r={};
  const ind=ditPrimeiro(t,[[/complementa\w*\s+(d[ae]\s+)?mamografia/,'Complementação de mamografia'],[/(seguimento|controle|acompanhamento)\s+d[eo]\s+nodul/,'Seguimento de nódulo'],[/nodulo\s+palpavel/,'Nódulo palpável'],[/(dor|mastalgia)/,'Dor mamária'],[/\brotina\b|check[\s-]*up/,'Rotina']]); if(ind) r.ind=ind;
  if(/nao\s+trouxe\s+(a\s+)?mamografia|mamografia\s+(\w+\s+)?nao\s+trouxe/.test(t)) r['mmg.feita']='naotrouxe';
  else if(/(nunca\s+fez|nao\s+fez|sem|nao\s+realizou)\s+(\w+\s+)?mamografia/.test(t)) r['mmg.feita']='nao';
  else { const m=t.match(/mamografia/); if(m){ r['mmg.feita']='trouxe'; const w=t.slice(m.index,m.index+90); const b=w.match(/bi\s*-?\s*rads\s*(\d)/); if(b&&'012345'.includes(b[1])) r['mmg.birads']=b[1]; const d=ditMesAno(w.replace(/bi\s*-?\s*rads\s*\d/,' ')); if(d) r['mmg.data']=d; } }
  const fam=t.match(/historia\s+familiar|antecedente\s+familiar|(mae|irma|filha|tia|avo|prima)\s+(\w+\s+){0,2}(cancer|\bca\b)/);
  if(fam){ r['anam.fam']=!ditadoNeg(t,fam.index); if(r['anam.fam']) r['anam.famGrau']=/(2|segundo)\s*o?\s*grau|\b(tia|avo|prima)\b/.test(t)&&!/(1|primeiro)\s*o?\s*grau|\b(mae|irma|filha)\b/.test(t)?'2º grau':'1º grau'; }
  [['pessoal',/(cancer|\bca\b|carcinoma)\s+de\s+mama\s+(previo|anterior)|ja\s+teve\s+cancer|mastectomi/],['bx',/biopsia/],['cir',/cirurgia\s+(mamaria|na\s+mama|de\s+mama)|mamoplastia|setorectomia|quadrantectomia|protese/],['palp',/nodulo\s+palpavel|palpa\s+(um\s+)?nodulo|caroco/],['desc',/descarga|secrecao\s+(papilar|mamilar|no\s+mamilo)/],['gest',/gestacao\s+recente|gravida|gestante|puerper/],['lact',/amament|lactante|lactacao/]].forEach(([k,re])=>{ const v=ditSimNao(t,re); if(v!=null) r['anam.'+k]=v; });
  if(r['anam.bx']){ if(/biopsia[^.]{0,40}malign/.test(t)) r['anam.bxRes']='maligna'; else if(/biopsia[^.]{0,40}benign/.test(t)) r['anam.bxRes']='benigna'; }
  if(/pos[\s-]*menopausa|menopausa/.test(t)&&!/pre[\s-]*menopausa|nao\s+(esta\s+na\s+)?menopausa/.test(t)) r['anam.meno']='pós'; else if(/pre[\s-]*menopausa|menstrua|ciclos?\s+regular|nao\s+(esta\s+na\s+)?menopausa/.test(t)) r['anam.meno']='pré';
  const trh=ditSimNao(t,/terapia\s+(de\s+reposicao\s+)?hormonal|reposicao\s+hormonal|\btrh\b/); if(trh!=null) r['anam.trh']=trh;
  const g=ditSemItens(t,/\b(nodul|cisto)/,/\.|$/);
  if(/heterogene/.test(g)) r.textura='heterogênea'; else if(/homogene/.test(g)) r.textura='homogênea';
  const pr=ditPrimeiro(g,[[/fibroglandular\s+e\s+(gordur|adipos)|(gordur|adipos)\w*\s+e\s+fibroglandular|predominio\s+misto/,'fibroglandular e gorduroso'],[/predominio\s+(\w+\s+)?(gordur|adipos)|liposubstitu|lipossubstitu|substituicao\s+gordurosa/,'gorduroso'],[/predominio\s+(\w+\s+)?fibroglandular|fibroglandular/,'fibroglandular']]); if(pr) r.predominio=pr;
  const ec=ditSimNao(t,/ectasia/); if(ec!=null) r.ectasia=ec;
  if(/axilas\s+(\w+\s+){0,2}(normais|sem\s+linfonodomegalia|sem\s+altera|livres)|sem\s+linfonodomegalias?\s+axilar/.test(t)){ r['axila.D']='normal'; r['axila.E']='normal'; }
  [['D','direita'],['E','esquerda']].forEach(([k,lad])=>{ const re=new RegExp('axil\\w*\\s+'+lad); const m=t.match(re); if(!m) return; const w=t.slice(Math.max(0,m.index-50),m.index+m[0].length+50);
    r['axila.'+k]=/suspeit|atipic|perda\s+do\s+hilo|sem\s+hilo/.test(w)?'suspeito':/reacional|hilo\s+preservado|linfonodo/.test(w)?'reacional':/normal|sem\s+linfonodomegalia|livre/.test(w)?'normal':r['axila.'+k]; if(!r['axila.'+k]) delete r['axila.'+k]; });
  return r;
}

// ---------- transvaginal ----------
function ditadoLaudoTransvaginal(fala){
  const t=ditadoTexto(fala), r={};
  const ind=ditPrimeiro(t,[[/controle\s+(de\s+|do\s+)?diu/,'Controle de DIU'],[/sangramento/,'Sangramento uterino anormal'],[/infertilidade|dificuldade\s+para\s+engravidar/,'Infertilidade'],[/endometriose/,'Suspeita de endometriose'],[/massa\s+anexial|(avaliacao|pesquisa)\s+de\s+(massa|cisto)/,'Avaliação de massa anexial'],[/dor\s+pelvica|dismenorreia/,'Dor pélvica'],[/\brotina\b|preventivo|check[\s-]*up/,'Rotina']]); if(ind) r.ind=ind;
  ditPrev(t,r);
  const meno=ditSimNao(t,/menopausa/); if(meno!=null&&!/pre[\s-]*menopausa/.test(t)) r['anam.meno']=meno;
  const dm=t.match(/\bdum\b|ultima\s+menstruacao|data\s+da\s+ultima/); if(dm){ const d=ditData(t.slice(dm.index,dm.index+50)); if(d){ r['anam.dum']=d; r['anam.meno']=false; } }
  const gpa=t.match(/\bg\s*(\d+)\s*p\s*(\d+)\s*a\s*(\d+)/);
  if(gpa){ r['anam.g']=gpa[1]; r['anam.p']=gpa[2]; r['anam.a']=gpa[3]; }
  else if(/nuligesta/.test(t)){ r['anam.g']='0'; r['anam.p']='0'; r['anam.a']='0'; }
  else { let m=t.match(/\bgesta\w*\s+(\d+)|(\d+)\s+gestac/); if(m) r['anam.g']=m[1]||m[2]; m=t.match(/\bpara\s+(\d+)|(\d+)\s+partos?/); if(m) r['anam.p']=m[1]||m[2]; m=t.match(/\baborto\w*\s+(\d+)|(\d+)\s+abortos?/); if(m) r['anam.a']=m[1]||m[2]; }
  if(/cesar/.test(t)&&!ditadoNeg(t,t.search(/cesar/))) r['anam.ces']=true; else if(/parto\w*\s+(normal|vagina)/.test(t)) r['anam.ces']=false;
  const sg=ditSegs(t,{ut:/\butero\b/,endo:/endometrio/,od:/ovario\s+direito/,oe:/ovario\s+esquerdo/,mio:/\bmioma/,les:/\b(cisto|lesao|massa)\b/,liq:/liquido/,colo:/\bcolo\b/,diu:/\bdiu\b/});
  const u=sg.ut||'';
  const pos=ditPrimeiro(t,[[/retrovers|retrovertido|retrofletido/,'retroversão'],[/antevers|antevertido|antefletido/,'anteversão'],[/medio\s*-?\s*vers|mediovers|posicao\s+intermediaria/,'medioversão']]); if(pos) r['ut.pos']=pos;
  if(/contornos?\s+(\w+\s+)?(lobulad|irregular)/.test(u)) r['ut.cont']='lobulados'; else if(/contornos?\s+(\w+\s+)?regular/.test(u)) r['ut.cont']='regulares';
  const um=ditadoMedidas(u,true); if(um) r['ut.med']=um;
  if(/adenomiose\s+focal/.test(t)) r['ut.mio']='adenomiose focal'; else if(ditadoTem(/adenomiose/,t)) r['ut.mio']='adenomiose difusa'; else if(/miometrio\s+(\w+\s+)?homogene/.test(t)) r['ut.mio']='homogêneo';
  if(sg.endo){ const e=ditNum(sg.endo.slice(0,50),/(espessura|mede|medindo|com|de)?/,true); if(e) r['ut.endo']=e;
    if(/trilaminar/.test(sg.endo)) r['ut.endoAsp']='trilaminar'; else if(/heterogene/.test(sg.endo)) r['ut.endoAsp']='heterogêneo'; else if(/hiperecoic|homogene/.test(sg.endo)) r['ut.endoAsp']='hiperecoico e homogêneo'; }
  if(/naboth/.test(t)&&!ditadoNeg(t,t.search(/naboth/))) r['ut.colo']='Naboth'; else if(/colo\s+(\w+\s+)?(sem\s+altera|normal|habitual)/.test(t)) r['ut.colo']='sem alterações';
  const diu=ditSimNao(t,/\bdiu\b|dispositivo\s+intrauterino|mirena/); if(diu!=null){ r['ut.diu']=diu; if(diu&&sg.diu){ const d=ditNum(sg.diu,/(haste|a|distancia)?/,true); if(d) r['ut.diuDist']=d; } }
  [['D','od'],['E','oe']].forEach(([k,sk])=>{ const s=sg[sk]; if(!s) return;
    if(/^\s*(nao\s+(visibiliz|visualiz|caracteriz|identific)|ausente)/.test(s)) { r['ov.'+k+'.visto']=false; return; }
    r['ov.'+k+'.visto']=true; const m=ditadoMedidas(s,true); if(m) r['ov.'+k+'.med']=m;
    if(/policistic|micropolicist/.test(s)) r['ov.'+k+'.asp']='policístico'; else if(/atrofic|reduzid/.test(s)) r['ov.'+k+'.asp']='atrófico'; else if(/habitual|normal/.test(s)) r['ov.'+k+'.asp']='habitual'; });
  if(/ovarios\s+(\w+\s+)?(de\s+)?(aspecto\s+)?(habitua|norma)/.test(t)){ ['D','E'].forEach(k=>{ if(r['ov.'+k+'.asp']==null) r['ov.'+k+'.asp']='habitual'; }); }
  if(/(sem|ausencia\s+de|nao\s+ha)\s+liquido/.test(t)) r.liq='ausente'; else if(/liquido/.test(t)){ const w=sg.liq||''; const all=t; r.liq=/moderad|grande|volumos/.test(w+all.slice(Math.max(0,all.search(/liquido/)-30),all.search(/liquido/)))?'moderada':'pequena'; }
  return r;
}

// ---------- próstata via abdominal ----------
function ditadoLaudoProstata(fala){
  const t=ditadoTexto(fala), r={};
  const ind=ditPrimeiro(t,[[/retencao\s+urinaria/,'Retenção urinária'],[/psa\s+(alto|elevado|aumentado|alterado)/,'PSA elevado'],[/avalia\w*\s+(do\s+)?volume\s+prostatico/,'Avaliação de volume prostático'],[/sintomas?\s+urinari|\bluts\b|prostatismo/,'Sintomas urinários'],[/\brotina\b|check[\s-]*up/,'Rotina']]); if(ind) r.ind=ind;
  ditPrev(t,r);
  const ps=t.match(/\bpsa\s+(total\s+)?(de\s+)?(\d+(?:[.,]\d+)?)/); if(ps){ r['anam.psa']=ps[3].replace('.',','); const d=ditMesAno(t.slice(ps.index+ps[0].length,ps.index+ps[0].length+30)); if(d) r['anam.psaData']=d; }
  const si=ditSint(t,[['jato fraco',/jato\s+(fraco|fino|reduzido)/],['noctúria',/nocturia|levanta\s+(\w+\s+){0,3}noite|urina\s+(\w+\s+){0,2}noite/],['urgência',/urgencia/],['polaciúria',/polaciuria|urina\s+muit\w*\s+vez/],['esvaziamento incompleto',/esvaziamento\s+incompleto|sensacao\s+de\s+(esvaziamento|residuo)/],['retenção',/retencao/]]); if(si) r['anam.sint']=si;
  const dr=t.match(/tansulosina|tamsulosina|finasterida|dutasterida|doxazosina|silodosina|alfuzosina|combodart|secotex/);
  if(dr){ if(ditadoNeg(t,dr.index)) r['anam.med']=false; else { r['anam.med']=true; const w=t.slice(dr.index).match(/^[a-z]+(\s+\d+(?:[.,]\d+)?\s*mg)?/); r['anam.medTxt']=w[0].replace(/(\d)\.(\d)/,'$1,$2'); } }
  else if(/(sem|nao\s+usa|nega)\s+(\w+\s+){0,2}medica/.test(t)) r['anam.med']=false;
  const sg=ditSegs(t,{bx:/\bbexiga\b/,pr:/\bprostata\b/,vs:/vesiculas?\s+seminais?/,pos:/pos[\s-]*miccion\w*|apos\s+(a\s+)?miccao/,juv:/juncao|juncoes|ureter/,ipp:/protrusao|lobo\s+mediano/});
  const posIdx=t.search(/pos[\s-]*miccion|apos\s+(a\s+)?miccao/);
  const antes=posIdx<0?t:t.slice(0,posIdx), depois=posIdx<0?'':t.slice(posIdx);
  const sa=ditSegs(antes,{bx:/\bbexiga\b/,pr:/\bprostata\b/,vs:/vesiculas?\s+seminais?/,juv:/juncao|juncoes|ureter/,ipp:/protrusao|lobo\s+mediano/});
  const b=sa.bx||'';
  if(/(boa|adequada|bem)\s+(\w+\s+)?(replec|repleta|distendida)|repleta/.test(b)&&!/parcial|pouco\s+repleta|semi/.test(b)) r['bx.rep']='boa'; else if(/parcial|pouco\s+repleta|semi[\s-]*repleta/.test(b)) r['bx.rep']='parcial';
  const bm=ditadoMedidas(b,true); if(bm) r['bx.med']=bm;
  const pa=b.match(/parede/); if(pa){ const n=ditNum(b.slice(pa.index,pa.index+40),/parede/,true); if(n) r['bx.parede']=n; }
  if(/trabecul/.test(b)) r['bx.parAsp']='trabeculada'; else if(/parede\s+(\w+\s+)?espessad|espessamento\s+parietal/.test(b)) r['bx.parAsp']='espessada'; else if(/parede\s+(\w+\s+)?(regular|fina|normal)/.test(b)) r['bx.parAsp']='regular';
  if(ditadoTem(/calculo/,b)) r['bx.cont']='calculo'; else if(ditadoTem(/\becos\b|debris|sedimento|grumos/,b)) r['bx.cont']='ecos'; else if(/anecoic|conteudo\s+(\w+\s+)?(normal|habitual|limpo)/.test(b)) r['bx.cont']='anecoico';
  if(/juncoes\s+(\w+\s+){0,2}(livres|normais|sem\s+altera)/.test(t)){ r['juv.D']='livre'; r['juv.E']='livre'; }
  [['D','direita'],['E','esquerda']].forEach(([k,l])=>{ const m=t.match(new RegExp('(juncao\\s+(ureterovesical\\s+)?'+l+'|ureter\\w*\\s+'+l+')')); if(!m) return; const w=t.slice(m.index,m.index+60);
    const v=/calculo/.test(w)?'calculo':/ureterocele/.test(w)?'ureterocele':/dilatad|ectasi|hidroureter/.test(w)?'dilatada':/livre|normal|sem\s+altera/.test(w)?'livre':null; if(v) r['juv.'+k]=v; });
  const p=sa.pr||'';
  const pm=ditadoMedidas(p,true); if(pm) r['pr.med']=pm;
  if(/contornos?\s+(\w+\s+)?(lobulad|irregular)/.test(p)) r['pr.cont']='lobulados'; else if(/contornos?\s+(\w+\s+)?regular/.test(p)) r['pr.cont']='regulares';
  if(/heterogene/.test(p)) r['pr.text']='heterogênea'; else if(/homogene/.test(p)) r['pr.text']='homogênea';
  const ca=ditSimNao(p,/calcific/); if(ca!=null){ r['pr.calc']=ca; if(ca){ const m=p.match(/calcific[^.]*/); r['pr.calcTxt']=fala.match(/calcifica[^.]*/i)?fala.match(/calcifica[^.]*/i)[0].trim():m[0]; } }
  if(sa.ipp){ if(/^\s*(ausente|nao)/.test(sa.ipp)) r['pr.ipp']='0'; else { const n=ditNum(sa.ipp.slice(0,40),/(intravesical|de|mede|medindo|com)?/,true); if(n) r['pr.ipp']=n; } }
  else if(/sem\s+protrusao/.test(t)) r['pr.ipp']='0';
  if(sa.vs){ if(/alterad|dilatad|assimetric|heterogene/.test(sa.vs)) r.vs='alterada'; else if(/habitua|norma|sem\s+altera|preservad/.test(sa.vs)) r.vs='habitual'; }
  if(depois){ const sd=ditSegs(depois,{bx:/\bbexiga\b|residuo/,pr:/\bprostata\b/}); const m1=sd.bx?ditadoMedidas(sd.bx,true):null, m2=sd.pr?ditadoMedidas(sd.pr,true):null;
    const anyM=!m1&&!m2?ditadoMedidas(depois,true):null;
    if(m1||anyM) r['pos.0.bx']=m1||anyM; if(m2) r['pos.0.pr']=m2; }
  return r;
}

// ---------- tipos do ditado ----------
Object.assign(DITADO_TIPOS,{
  tireoide:{laudo:true,parse:ditadoLaudoTireoide,ex:'rotina, nega história familiar, tireoide assimétrica, dimensões habituais, homogênea; lobo direito 4,7 por 1,8 por 2,0; lobo esquerdo 4,6 por 1,6 por 1,9; istmo 0,3'},
  cervical:{laudo:true,parse:ditadoLaudoCervical,ex:'vigilância oncológica, tireoidectomia por câncer, levotiroxina 112, glândulas salivares normais'},
  mamas:{laudo:true,parse:ditadoLaudoMamas,ex:'rotina, pós-menopausa, trouxe mamografia BI-RADS 2 de 06/26, mamas heterogêneas com predomínio fibroglandular, axilas normais'},
  transvaginal:{laudo:true,parse:ditadoLaudoTransvaginal,ex:'rotina, DUM 28/08/2026, G2 P2 A0 cesárea, útero antevertido 5,9 por 3,4 por 5,0, endométrio 8 mm trilaminar, ovário direito 2,5 por 1,8 por 1,5, sem líquido livre'},
  prostata:{laudo:true,parse:ditadoLaudoProstata,ex:'sintomas urinários, PSA 4,2 de 05/26, noctúria e jato fraco; bexiga boa repleção 9,0 por 8,0 por 7,5; próstata 4,5 por 3,8 por 4,0 homogênea; pós-miccional bexiga 4 por 3 por 2'},
});

// ---------- tela: cartões de ditado ----------
function ditadoCard(item,tipo){
  const T=DITADO_TIPOS[tipo];
  let aviso='';
  if(item.fala&&T.laudo){ const n=item.dict?item.dict.size:0; aviso=n?`Entendi ${n} ${n>1?'campos':'campo'}. Os tracejados já estão no laudo; toque só no que quiser trocar. Nódulos e outros achados têm ditado próprio.`:'<b>Não reconheci nenhum campo.</b> Ajuste a frase na caixa.'; }
  else if(item.fala){ const falta=T.campos.filter(k=>!(item.dict&&item.dict.has(k))&&!(k==='terco'&&item.lobo==='I')); aviso=falta.length?`Não ouvi <b>${falta.map(k=>DITADO_NOMES[k]).join(', ')}</b>. O resto já está no laudo.`:'Os tracejados já estão no laudo; toque só no que quiser trocar. O que não foi dito conta como ausente.'; }
  return `<div class="card"><div class="lbl">${T.laudo?'Ditado do exame':'Ditado'} <span class="act">fale tudo de uma vez</span></div>
    <div class="dit"><button type="button" class="mic" id="micBtn" aria-label="Gravar ditado">${DITADO_MIC}</button>
    <textarea class="fala" id="falaTxt" rows="3" placeholder="ex.: ${ditEsc(T.ex)}">${ditEsc(item.fala||'')}</textarea></div>
    ${aviso?`<div class="dit-falta">${aviso}</div>`:''}</div>`;
}
// liga o microfone e a caixa; attrs = campo → data-atributo (ou seletor) dos chips daquele campo
let DITADO_REC=null, DITADO_ATUAL=null;
const ditSel=a=>'[#'.includes(a[0])?a:`[data-${a}]`;
// mexeu à mão num campo ditado: some o tracejado dele
if(typeof document!=='undefined') ['click','input'].forEach(ev=>document.addEventListener(ev,e=>{ const A=DITADO_ATUAL; if(!A||!A.item.dict) return;
  Object.entries(A.attrs).forEach(([k,a])=>{ if(e.target.closest&&e.target.closest(ditSel(a))) A.item.dict.delete(k); }); },true));
function ditSet(o,path,v){ const ks=path.split('.'); let x=o; for(let i=0;i<ks.length-1;i++){ if(x[ks[i]]==null) return; x=x[ks[i]]; } x[ks[ks.length-1]]=Array.isArray(v)?v.slice():v instanceof Set?new Set(v):v; }
// item: guarda fala e tracejados; alvo: onde os valores entram (o próprio item, ou o estado do exame)
function ditadoLigar(item,tipo,attrs,rerender,avisar,alvo){
  const T=DITADO_TIPOS[tipo], btn=document.getElementById('micBtn'), box=document.getElementById('falaTxt'); if(!btn||!box) return;
  alvo=alvo||item; DITADO_ATUAL={item,attrs};
  if(item.dict) item.dict.forEach(k=>{ const a=attrs[k]; if(!a) return;
    document.querySelectorAll('#phone '+ditSel(a)).forEach(el=>{ if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.getAttribute('aria-pressed')==='true') el.classList.add('dit-on'); }); });
  const aplicar=()=>{ const r=T.parse(item.fala); Object.keys(r).forEach(k=>ditSet(alvo,k,r[k])); item.dict=new Set(Object.keys(r)); rerender(); };
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

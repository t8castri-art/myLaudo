// myLaudo · exames anteriores: fotos e PDFs dos laudos antigos → texto no iPhone →
// sem identificação → IA (pela ponte) → resumo agrupado por lobo e terço.
// Só sai do aparelho o texto já limpo. As imagens e os PDFs nunca saem.

const ANT_TESS='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const ANT_PDF='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
const ANT_PDFW='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
let antSeq=1, antTessP=null, antPdfP=null;

// ---------- configuração da ponte (fica só neste aparelho) ----------
const ANT_PONTE_PADRAO='https://wandering-firefly-afd6.drluiz-pericias.workers.dev';   // o endereço é público; só a senha protege
const antCfg={ get(){ let c={}; try{ c=JSON.parse(localStorage.getItem('mylaudo.ponte')||'null')||{}; }catch(e){} if(!c.url) c.url=ANT_PONTE_PADRAO; return c; },
  set(v){ try{ localStorage.setItem('mylaudo.ponte',JSON.stringify(v)); }catch(e){} } };

// ---------- leitura ----------
function antScript(src){ return new Promise((ok,erro)=>{ const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=()=>erro(new Error('não carregou '+src)); document.head.appendChild(s); }); }
async function antOcr(){ if(!antTessP) antTessP=antScript(ANT_TESS).then(()=>Tesseract.createWorker('por')); return antTessP; }
async function antPdfLib(){ if(!antPdfP) antPdfP=import(ANT_PDF).then(m=>{ m.GlobalWorkerOptions.workerSrc=ANT_PDFW; return m; }); return antPdfP; }
async function antLerImagem(src,status){ status('lendo a imagem…'); const w=await antOcr(); const r=await w.recognize(src); return r.data.text; }
async function antLerPdf(file,status){
  const lib=await antPdfLib(); const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise; const partes=[];
  for(let p=1;p<=doc.numPages;p++){
    status(`página ${p} de ${doc.numPages}…`);
    const pg=await doc.getPage(p); const tc=await pg.getTextContent();
    let txt=''; let y=null; tc.items.forEach(it=>{ const yy=Math.round(it.transform[5]); if(y!==null&&Math.abs(yy-y)>2) txt+='\n'; else if(txt&&!txt.endsWith(' ')) txt+=' '; txt+=it.str; y=yy; });
    if(txt.replace(/\s/g,'').length<40){ // PDF escaneado: vira imagem e passa pela leitura
      const vp=pg.getViewport({scale:2}); const c=document.createElement('canvas'); c.width=vp.width; c.height=vp.height;
      await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise; txt=await antLerImagem(c,()=>status(`lendo a página ${p} (imagem)…`));
    }
    partes.push(txt);
  }
  return partes.join('\n');
}

// ---------- tira a identificação ----------
const ANT_LINHA_ID=/\b(paciente|pacient|nome|nasc|data\s+de\s+nasc|d\.?\s*n\.?|idade|sexo|cpf|rg\b|documento|telefone|fone|celular|whats|e-?mail|endere[cç]o|rua\b|bairro|cep\b|prontu[aá]rio|atendimento|protocolo|pedido|requisi[cç][aã]o|conv[eê]nio|carteir|plano\s+de\s+sa[uú]de|m[eé]dico\s+solicitante|solicitante|crm\b|dr\.?\s|dra\.?\s|assinad|respons[aá]vel\s+t[eé]cnico)/i;
function antLimpar(txt,nome){
  let linhas=String(txt||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean).filter(l=>!ANT_LINHA_ID.test(l));
  let t=linhas.join('\n')
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,'[cpf]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,'[e-mail]')
    .replace(/\(\d{2}\)\s?9?\d{4}[-\s]?\d{4}\b|\b9?\d{4}-\d{4}\b/g,'[telefone]');
  // o nome que já está na ficha, se aparecer solto no texto
  String(nome||'').split(/\s+/).filter(p=>p.length>=3&&!/^(da|de|do|das|dos)$/i.test(p)).forEach(p=>{ t=t.replace(new RegExp('\\b'+p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','gi'),'[nome]'); });
  return t;
}

// ---------- conserta texto que passou por Mac Roman ("√ó" em vez de "×", "√ß" em vez de "ç") ----------
const ANT_MACROMAN="ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø"; // bytes 0x80-0xBF
function antConserta(t){ return String(t||'').replace(/√([\s\S])/g,(m,c)=>{ const i=ANT_MACROMAN.indexOf(c); if(i<0) return m; try{ return new TextDecoder().decode(new Uint8Array([0xC3,0x80+i])); }catch(e){ return m; } }); }

// laudo enxuto: sem valores de referência
function antSemReferencia(t){ return String(t||'')
  .replace(/\s*\((?:[^()]*\b(?:VR|v\.?\s?r\.?|refer[eê]ncia|ref\.|normal\s+(?:at[eé]|de|entre))\b[^()]*)\)/gi,'')
  .replace(/[,;]?\s*(?:VR|valor(?:es)?\s+de\s+refer[eê]ncia|refer[eê]ncia)\s*:?\s*[^,;\n]*/gi,'')
  .replace(/[ \t]+\n/g,'\n'); }

// ---------- tela ----------
const ANT_I={
  lapis:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  cam:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/><circle cx="12" cy="13" r="3"/></svg>',
  x:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};
const ANT_CSS=`
.antcam{grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:8px;height:46px;border:1px solid var(--ac);border-radius:10px;color:var(--acT);font-size:13.5px;font-weight:500}
.antst{grid-column:1/-1;font-size:12px;color:var(--acT)}
.antst.erro{color:var(--alert)}
.lbl .act[data-prev]{display:flex;padding:2px;color:var(--tx3)}
.antsplit{display:flex;border:1px solid var(--ac);border-radius:10px;overflow:hidden;grid-column:1/-1}
.antsplit button{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:44px;color:var(--acT);font-size:13px;font-weight:500}
.antsplit button+button{border-left:1px solid var(--ac)}
.antarqs{grid-column:1/-1;display:flex;flex-direction:column;gap:6px}
.antarq{display:flex;align-items:center;gap:8px;padding:7px 8px 7px 10px;border:1px solid var(--bd2);border-radius:8px;background:var(--s2);font-size:12.5px}
.antarq .n{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.antarq .s{color:var(--tx3);font-size:11.5px;white-space:nowrap}
.antarq .s.ok{color:var(--ok)} .antarq .s.erro{color:var(--alert)}
.antarq button{color:var(--tx3);padding:4px;display:flex}
.antorg{grid-column:1/-1;height:44px;border-radius:10px;border:1px solid var(--ac);background:var(--acTint);color:var(--acT);font-size:13.5px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px}
.antorg[disabled]{opacity:.45}
.antcfg{grid-column:1/-1;display:flex;flex-direction:column;gap:6px;padding:10px;border:1px dashed var(--bd2);border-radius:10px}
.antcfg input{width:100%;padding:8px 10px;border-radius:7px;background:var(--s2);border:1px solid var(--bd2);color:var(--tx);font:13px var(--f)}
.antcfg .h{font-size:11.5px;color:var(--tx3)}
.antcfg button{align-self:flex-start;font-size:12.5px;padding:6px 14px;border-radius:999px;border:1px solid var(--ac);color:var(--acT)}
.antlink{grid-column:1/-1;font-size:11.5px;color:var(--tx3);text-decoration:underline;justify-self:start}
@media (max-width:600px){.antcfg input{font-size:16px}}`;
(function(){ const s=document.createElement('style'); s.textContent=ANT_CSS; document.head.appendChild(s); })();

// cartão inteiro de "Exames anteriores"; prev = st.prev; exemploTxt = placeholder da caixa
function anterioresCard(prev,exemploTxt){
  prev.arqs=prev.arqs||[]; prev.manuais=prev.manuais||[];
  if(/√/.test(prev.txt||'')) prev.txt=antConserta(prev.txt);
  const cfg=antCfg.get(), ligada=!!(cfg.url&&cfg.senha);
  const esc2=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  if(prev.tem!=='sim') return `<div class="card"><div class="lbl">Exames anteriores</div><div class="form dir">
    <div class="k">Trouxe</div><div class="segm"><button type="button" data-prev="nao" aria-pressed="true">não</button><button type="button" data-prev="sim" aria-pressed="false">sim</button></div></div></div>`;
  const precisaCfg=!prev.semIA&&((prev.arqs.length||prev.manuais.length)&&!ligada||prev.cfgAberta);
  return `<div class="card"><div class="lbl">Exames anteriores <button type="button" class="act" data-prev="nao" aria-label="Não trouxe">${ANT_I.x}</button></div><div class="form dir">
    <button type="button" class="antcam" id="antCam">${ANT_I.cam}escanear ou PDF</button>
    <input type="file" id="antArq" accept="image/*,application/pdf" multiple hidden>
    ${prev.arqs.length?`<div class="antarqs">${prev.arqs.map(a=>`<div class="antarq"><span class="n">${esc2(a.nome)}</span><span class="s ${a.status==='pronto'?'ok':a.status==='erro'?'erro':''}">${esc2(a.status==='pronto'?'lido':a.msg||a.status)}</span><button type="button" data-antdel="${a.id}" aria-label="Tirar">${ANT_I.x}</button></div>`).join('')}</div>`:''}
    ${prev.organizando?'<div class="antst">Organizando por lobo e terço…</div>':prev.erroIA?`<div class="antst erro">${esc2(prev.erroIA)}</div>`:''}
    ${precisaCfg?`<div class="antcfg"><div class="h">Ligar a IA neste aparelho (uma vez só)</div>
      <input id="antSenha" placeholder="senha da ponte" value="${esc2(cfg.senha||'')}" autocomplete="off" autocapitalize="off">
      ${prev.cfgAberta?`<input id="antUrl" placeholder="endereço da ponte" value="${esc2(cfg.url||'')}" autocomplete="off" autocapitalize="off">`:''}
      <button type="button" id="antSalvar">Salvar</button></div>`:''}
    <textarea class="obs" id="prevTxt" rows="${prev.txtDaIA?Math.min(18,String(prev.txt||'').split('\n').length+3):3}" placeholder="${esc2(exemploTxt)}">${esc2(prev.txt||'')}</textarea>
    ${ligada&&!prev.cfgAberta&&!prev.semIA?'<button type="button" class="antlink" id="antCfg">ajustar ponte da IA</button>':''}
  </div></div>`;
}
// liga o cartão; exame = 'tireoide'...; nome = nome do paciente (para apagar se aparecer)
function anterioresLigar(prev,exame,nome,rerender,avisar){
  prev.nomePac=nome;
  const $i=id=>document.getElementById(id);
  const arq=$i('antArq'), cam=$i('antCam'), box=$i('prevTxt');
  if(cam&&arq) cam.onclick=()=>arq.click();
  const auto=()=>antAuto(prev,exame,rerender,avisar);
  if(arq) arq.onchange=()=>{ [...arq.files].forEach(f=>antAdicionar(prev,f,nome,rerender,auto)); arq.value=''; };
  // caixa: texto ditado/transcrito (ou digitado antes de haver resumo) vai para a IA; correção do resumo, não
  if(box) box.addEventListener('change',()=>{ const v=box.value.trim(), ditado=box.dataset.ditado==='1', novo=box.dataset.novo; delete box.dataset.ditado; delete box.dataset.novo; prev.txt=v;
    if(!v){ prev.manuais=[]; prev.txtDaIA=false; return; }
    if(ditado){ prev.manuais.push(novo||v); auto(); } else if(!prev.txtDaIA){ prev.manuais=[v]; auto(); } });
  document.querySelectorAll('#phone [data-antdel]').forEach(b=>b.onclick=()=>{ prev.arqs=prev.arqs.filter(a=>a.id!==+b.dataset.antdel); rerender(); });
  const sv=$i('antSalvar'); if(sv) sv.onclick=()=>{ const url=($i('antUrl')?$i('antUrl').value.trim():antCfg.get().url).replace(/\/$/,''), senha=$i('antSenha').value.trim(); if(!/^https:\/\//.test(url)||!senha){ avisar('Preencha o endereço (https://…) e a senha'); return; } antCfg.set({url,senha}); prev.cfgAberta=false; avisar('IA ligada neste aparelho'); rerender(); auto(); };
  const cf=$i('antCfg'); if(cf) cf.onclick=()=>{ prev.cfgAberta=true; rerender(); };
}
async function antAdicionar(prev,file,nome,rerender,depois){
  const a={id:antSeq++,nome:file.name||(file.type.includes('pdf')?'PDF':'foto'),status:'lendo',msg:'lendo…',texto:''}; prev.arqs.push(a); rerender();
  const status=m=>{ a.msg=m; const el=[...document.querySelectorAll('#phone [data-antdel]')].find(b=>+b.dataset.antdel===a.id); if(el) el.previousElementSibling.textContent=m; };
  try{
    const bruto=/pdf/i.test(file.type)||/\.pdf$/i.test(file.name)?await antLerPdf(file,status):await antLerImagem(file,status);
    a.texto=antLimpar(bruto,nome); a.status=a.texto.replace(/\s/g,'').length>20?'pronto':'erro'; if(a.status==='erro') a.msg='não achei texto';
  }catch(e){ a.status='erro'; a.msg='não consegui ler'; }
  rerender(); if(depois) depois();
}
// organiza quando tudo terminou de ler e a ponte está ligada
function antAuto(prev,exame,rerender,avisar){
  if(prev.semIA||!exame){ rerender(); return; }
  const cfg=antCfg.get(); if(!(cfg.url&&cfg.senha)) { rerender(); return; }
  if(prev.organizando){ prev.pendente=true; return; }
  if(prev.arqs.some(a=>a.status!=='pronto'&&a.status!=='erro')) return;
  if(!prev.arqs.some(a=>a.status==='pronto')&&!prev.manuais.length) return;
  antOrganizar(prev,exame,rerender,avisar);
}
async function antOrganizar(prev,exame,rerender,avisar){
  const cfg=antCfg.get(); const textos=prev.arqs.filter(a=>a.status==='pronto').map(a=>({texto:a.texto}));
  (prev.manuais||[]).forEach(m=>textos.push({texto:antLimpar(m,prev.nomePac)})); // o que você ditou também entra
  prev.organizando=true; prev.erroIA=''; rerender();
  try{
    const r=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({senha:cfg.senha,exame,textos})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(j.erro||('erro '+r.status));
    prev.txt=antSemReferencia(antConserta(j.texto)); prev.txtDaIA=true;
  }catch(e){ prev.erroIA=e.message==='senha incorreta'?'Senha da ponte incorreta.':'Não consegui organizar ('+e.message+'). O texto lido continua guardado.'; }
  prev.organizando=false; rerender();
  if(prev.pendente){ prev.pendente=false; antOrganizar(prev,exame,rerender,avisar); }
}
// cadastro → exame: o texto bruto dos exames anteriores (ditado ou lido do papel) vai junto com o paciente
function anterioresTextos(prev){ return (prev.arqs||[]).filter(x=>x.status==='pronto').map(x=>x.texto).concat(prev.manuais||[]); }
function anterioresDoPaciente(prev){ try{ const p=JSON.parse(localStorage.getItem('mylaudo.pac')||'null'); if(!p||!p.prev||!p.prev.length) return false;
  prev.tem='sim'; prev.manuais=p.prev.slice(); prev.txt=p.prev.join('\n\n'); prev.txtDaIA=false; return true; }catch(e){ return false; } }
// ---------- evolução: lê a lista dos exames anteriores e compara com as lesões de hoje ----------
// Linhas de lesão: "N1 TM LD TIRADS 4: 9 × 6 × 7 mm", "N1 MD QSL 10h BIRADS 3: 12 × 8 × 9 mm", "LN1 III D: 12 × 8 × 9 mm, suspeito",
// "M1 intramural posterior FIGO 4: 21 × 18 × 20 mm", "L1 ovário D O-RADS 2: 35 × 30 × 28 mm". Linhas de campo: "Volume: 17,6 cm³", "Próstata: 45 × 38 × 40 mm, 37 g", "Resíduo: 60 mL".
const ANT_RANK={'0':0,'1':1,'2':2,'3':3,'4':4,'4A':4,'4B':5,'4C':6,'5':7,'6':8};
function antLer(txt){
  const exames=[]; let ex=null;
  antConserta(txt).split(/\r?\n/).forEach(l0=>{ const l=l0.trim(); if(!l) return;
    let m=l.match(/^(US|PAAF|CORE|MMG|RM|TC|BX)\s+(?:de\s+)?(?:(?:(\d{1,2})\s*\/\s*)?(\d{1,2})\s*\/\s*(\d{2,4})|sem\s+data)(?:\s+([^:]*?))?\s*(?::\s*(.*))?$/i);
    if(m){ const mmaa=m[3]?String(m[3]).padStart(2,'0')+'/'+String(m[4]).slice(-2):null;
      ex={tipo:m[1].toUpperCase(),data:mmaa,dataFull:mmaa?(m[2]?String(m[2]).padStart(2,'0')+'/':'')+mmaa:null,origem:(m[5]||'').trim(),nota:m[6]||'',nods:[],campos:{}}; exames.push(ex); return; }
    if(!ex) return;
    m=l.match(/^([A-Z]{1,2}\d+)\s+([^:]*?)\s*:\s*([\d.,]+(?:\s*[×x*]\s*[\d.,]+){0,2})\s*(mm|cm)?\b(.*)$/i);
    if(m){
      const loc=m[2].trim(), LOC=loc.toUpperCase(), un=(m[4]||'mm').toLowerCase(), resto=m[5]||'';
      const lado=/\b(LD|MD)\b|DIREIT/.test(LOC)?'D':/\b(LE|ME)\b|ESQUERD/.test(LOC)?'E':/ISTMO/.test(LOC)?'I':/(^|\s)D(\s|$)/.test(LOC)?'D':/(^|\s)E(\s|$)/.test(LOC)?'E':null;
      const rads=LOC.match(/(TI|BI|O)-?RADS\s*([0-6][ABC]?|NI)/); const cat=rads&&/^[0-6]/.test(rads[2])?rads[2]:null;
      let rank=cat!=null?(rads[1]==='O'?+cat[0]:ANT_RANK[cat]):null;
      if(rank==null) rank=/suspeit|atipic/i.test(resto)&&!/sem\s+(crit|susp)|n[aã]o\s+susp/i.test(resto)?1:0;
      const beth=resto.match(/bethesda\s*([IVX]+)/i), hist=resto.match(/(histologia|citologia)\s*:\s*([^.;]+)/i), figo=LOC.match(/FIGO\s*(\d)/);
      ex.nods.push({rot:m[1].toUpperCase(),lado,loc,escala:rads?rads[1]:null,cat,rank,figo:figo?+figo[1]:null,
        med:m[3].split(/\s*[×x*]\s*/).map(v=>parseFloat(v.replace(',','.'))*(un==='cm'?10:1)),bethesda:beth?beth[1].toUpperCase():null,hist:hist?hist[2].trim():null});
      return;
    }
    m=l.match(/^([A-Za-zÀ-ÿ³ ]+?)(?:\s+\d{1,2}\/\d{2,4})?\s*:\s*(.+)$/);
    if(m){ const k=m[1].trim().toLowerCase(), v=m[2].trim(); const u=ex.nods[ex.nods.length-1];
      if(u&&(k==='citologia'||k==='histologia')){ const b=v.match(/bethesda\s*([IVX]+)/i); if(b) u.bethesda=b[1].toUpperCase(); else u.hist=v; }
      else ex.campos[k]=v; }
  });
  return exames;
}
const antMeses=(d,hoje)=>{ if(!d) return null; const [mm,aa]=d.split('/').map(Number); return (hoje.getFullYear()-(2000+aa))*12+(hoje.getMonth()+1-mm); };
const antCm=mm=>(mm/10).toFixed(1).replace('.',',');
// atuais: [{rot:'N1', lado:'D', nome:'N1 MD', tag:'TI-RADS 5', rank:7, med:[mm,mm,mm]}]; exame: tireoide | mamas | cervical | transvaginal
function antEvolucao(txt,atuais,hoje,exame){
  hoje=hoje||new Date(); exame=exame||'tireoide'; const exames=antLer(txt); if(!exames.length||!atuais.length) return '';
  const frases=[], estaveis=[], sem=[];
  const ordem=atuais.slice().sort((a,b)=>(b.rank||0)-(a.rank||0));
  ordem.forEach((n,i)=>{
    const hist=[]; exames.forEach(e=>e.nods.forEach(p=>{ if(p.rot===n.rot&&(!p.lado||!n.lado||p.lado===n.lado)) hist.push({...p,data:e.data,dataFull:e.dataFull,tipo:e.tipo}); }));
    const proc=hist.filter(h=>h.bethesda||h.hist).pop();
    const ant=hist.filter(h=>h.med&&h.med.filter(isFinite).length).pop();
    const agora=n.med.filter(isFinite), nome=n.nome||n.rot;
    const destaque=i===0&&ordem.length>1&&(n.rank||0)>0?'o mais suspeito':'';
    const quem=nome+((n.tag||destaque)?` (${[n.tag,destaque].filter(Boolean).join(', ')})`:'');
    if(!ant||!agora.length){ if(!hist.length) sem.push(quem); return; }
    const maxA=Math.max(...ant.med), maxN=Math.max(...agora), d=Math.round((maxN-maxA)*10)/10, meses=antMeses(ant.data,hoje);
    const rel=maxA?(maxN-maxA)/maxA:0;
    let volP=null; if(ant.med.length===3&&agora.length===3) volP=Math.round((agora.reduce((x,y)=>x*y,1)/ant.med.reduce((x,y)=>x*y,1)-1)*100);
    let signif, rapido=false, rotulo;
    if(exame==='tireoide'){ let dims=0; if(ant.med.length===agora.length) agora.forEach((v,k)=>{ if(v-ant.med[k]>=2&&v>=ant.med[k]*1.2) dims++; });
      signif=dims>=2||(volP!=null&&volP>=50); rapido=d>=4&&meses!=null&&meses<=6; rotulo=rapido?', crescimento rápido':signif&&d>0?', crescimento significativo pelo ACR':''; }
    else { signif=rel>=0.2&&d>=2; rotulo=signif?(meses!=null&&meses<=6?', aumento ≥ 20% na maior medida em até 6 meses':', aumento ≥ 20% na maior medida'):''; }
    const prazo=meses!=null?` em ${meses} ${meses===1?'mês':'meses'}`:'';
    const pf=proc?`; ${proc.tipo} em ${proc.dataFull||proc.data||'data não informada'}: ${proc.bethesda?'Bethesda '+proc.bethesda:proc.hist}`:'';
    if(Math.abs(d)<=2&&!signif){ if(i===0||pf) frases.push(`${quem}: estável (${antCm(maxA)} → ${antCm(maxN)} cm${prazo})${pf}.`); else estaveis.push(nome); return; }
    frases.push(`${quem}: ${d<-2?'redução':'aumento'} de ${antCm(maxA)} para ${antCm(maxN)} cm (${d>0?'+':''}${String(d).replace('.',',')} mm${volP!=null&&exame==='tireoide'?`, volume ${volP>0?'+':''}${volP}%`:''})${prazo}${rotulo}${pf}.`);
  });
  if(estaveis.length) frases.push(`${estaveis.join(', ')}: ${estaveis.length>1?'estáveis':'estável'}.`);
  if(sem.length) frases.push(`${sem.join(', ')}: sem correspondente nos exames anteriores.`);
  return frases.length?'Evolução: '+frases.join(' '):'';
}
// próstata: compara peso e resíduo com o último US anterior que os trouxe
function antEvolucaoProstata(txt,hojeV,hoje){
  hoje=hoje||new Date(); const exames=antLer(txt).filter(e=>e.tipo==='US'); const f=[];
  const num=s=>{ const m=String(s||'').match(/(\d+(?:[.,]\d+)?)/); return m?parseFloat(m[1].replace(',','.')):NaN; };
  const ultimo=k=>exames.slice().reverse().find(e=>e.campos[k]!=null);
  const ep=ultimo('próstata'), er=ultimo('resíduo');
  if(ep&&isFinite(hojeV.peso)){ const g=num((ep.campos['próstata'].match(/(\d+(?:[.,]\d+)?)\s*g\b/)||[])[1]); if(isFinite(g)){ const m=antMeses(ep.data,hoje), p=Math.round((hojeV.peso/g-1)*100);
    f.push(`próstata ${Math.round(g)} → ${Math.round(hojeV.peso)} g (${p>0?'+':''}${p}%)${m!=null?` em ${m} ${m===1?'mês':'meses'}`:''}`); } }
  if(er&&isFinite(hojeV.residuo)){ const r=num(er.campos['resíduo']); if(isFinite(r)) f.push(`resíduo ${Math.round(r)} → ${Math.round(hojeV.residuo)} mL`); }
  return f.length?'Evolução: '+f.join('; ')+'.':'';
}
if(typeof module!=='undefined') module.exports={antLimpar,antLer,antEvolucao,antEvolucaoProstata};

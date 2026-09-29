// myLaudo · exames anteriores: fotos e PDFs dos laudos antigos → texto no iPhone →
// sem identificação → IA (pela ponte) → resumo agrupado por lobo e terço.
// Só sai do aparelho o texto já limpo. As imagens e os PDFs nunca saem.

const ANT_TESS='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const ANT_PDF='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
const ANT_PDFW='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
let antSeq=1, antTessP=null, antPdfP=null;

// ---------- configuração da ponte (fica só neste aparelho) ----------
const antCfg={ get(){ try{ return JSON.parse(localStorage.getItem('mylaudo.ponte')||'null')||{}; }catch(e){ return {}; } },
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

// ---------- tela ----------
const ANT_I={
  lapis:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  cam:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/><circle cx="12" cy="13" r="3"/></svg>',
  x:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};
const ANT_CSS=`
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
  prev.arqs=prev.arqs||[];
  const cfg=antCfg.get(), lidos=prev.arqs.filter(a=>a.status==='pronto').length, lendo=prev.arqs.some(a=>a.status!=='pronto'&&a.status!=='erro');
  const esc2=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return `<div class="card"><div class="lbl">Exames anteriores</div><div class="form dir">
    <div class="k">Trouxe</div><div class="segm"><button type="button" data-prev="nao" aria-pressed="${prev.tem==='nao'}">não</button><button type="button" data-prev="sim" aria-pressed="${prev.tem==='sim'}">sim</button></div>
    ${prev.tem==='sim'?`
    <div class="antsplit"><button type="button" id="antDig">${ANT_I.lapis}digitar</button><button type="button" id="antCam">${ANT_I.cam}escanear ou PDF</button></div>
    <input type="file" id="antArq" accept="image/*,application/pdf" multiple hidden>
    ${prev.arqs.length?`<div class="antarqs">${prev.arqs.map(a=>`<div class="antarq"><span class="n">${esc2(a.nome)}</span><span class="s ${a.status==='pronto'?'ok':a.status==='erro'?'erro':''}">${esc2(a.status==='pronto'?'lido':a.msg||a.status)}</span><button type="button" data-antdel="${a.id}" aria-label="Tirar">${ANT_I.x}</button></div>`).join('')}</div>
      ${cfg.url&&cfg.senha?`<button type="button" class="antorg" id="antOrg" ${lidos&&!lendo&&!prev.organizando?'':'disabled'}>${prev.organizando?'Organizando…':lendo?'Lendo…':'Organizar por lobo e terço'}</button>`:''}`:''}
    ${prev.arqs.length&&!(cfg.url&&cfg.senha)||prev.cfgAberta?`<div class="antcfg"><div class="h">Ligar a IA neste aparelho (uma vez só)</div>
      <input id="antUrl" placeholder="endereço da ponte (https://…workers.dev)" value="${esc2(cfg.url||'')}" autocomplete="off" autocapitalize="off">
      <input id="antSenha" placeholder="senha da ponte" value="${esc2(cfg.senha||'')}" autocomplete="off" autocapitalize="off">
      <button type="button" id="antSalvar">Salvar</button></div>`:''}
    ${prev.txtDaIA?'':`<div class="k">Data</div><div class="in"><input class="cell" style="width:72px" data-f="prevdata" value="${esc2(prev.data||'')}" placeholder="mm/aa" data-mask="mmaa" inputmode="numeric"></div>`}
    <textarea class="obs" id="prevTxt" rows="${prev.txtDaIA?Math.min(18,String(prev.txt||'').split('\n').length+3):3}" placeholder="${esc2(exemploTxt)}">${esc2(prev.txt||'')}</textarea>
    ${cfg.url&&cfg.senha&&!prev.cfgAberta?'<button type="button" class="antlink" id="antCfg">ajustar ponte da IA</button>':''}`:''}
  </div></div>`;
}
// liga o cartão; exame = 'tireoide'...; nome = nome do paciente (para apagar se aparecer)
function anterioresLigar(prev,exame,nome,rerender,avisar){
  const $i=id=>document.getElementById(id);
  const arq=$i('antArq'), dig=$i('antDig'), cam=$i('antCam');
  if(dig) dig.onclick=()=>{ const t=$i('prevTxt'); if(t){ t.focus(); t.scrollIntoView({block:'center'}); } };
  if(cam&&arq) cam.onclick=()=>arq.click();
  if(arq) arq.onchange=()=>{ [...arq.files].forEach(f=>antAdicionar(prev,f,nome,rerender)); arq.value=''; };
  document.querySelectorAll('#phone [data-antdel]').forEach(b=>b.onclick=()=>{ prev.arqs=prev.arqs.filter(a=>a.id!==+b.dataset.antdel); rerender(); });
  const sv=$i('antSalvar'); if(sv) sv.onclick=()=>{ const url=$i('antUrl').value.trim().replace(/\/$/,''), senha=$i('antSenha').value.trim(); if(!/^https:\/\//.test(url)||!senha){ avisar('Preencha o endereço (https://…) e a senha'); return; } antCfg.set({url,senha}); prev.cfgAberta=false; avisar('IA ligada neste aparelho'); rerender(); };
  const cf=$i('antCfg'); if(cf) cf.onclick=()=>{ prev.cfgAberta=true; rerender(); };
  const org=$i('antOrg'); if(org) org.onclick=()=>antOrganizar(prev,exame,rerender,avisar);
}
async function antAdicionar(prev,file,nome,rerender){
  const a={id:antSeq++,nome:file.name||(file.type.includes('pdf')?'PDF':'foto'),status:'lendo',msg:'lendo…',texto:''}; prev.arqs.push(a); rerender();
  const status=m=>{ a.msg=m; const el=[...document.querySelectorAll('#phone [data-antdel]')].find(b=>+b.dataset.antdel===a.id); if(el) el.previousElementSibling.textContent=m; };
  try{
    const bruto=/pdf/i.test(file.type)||/\.pdf$/i.test(file.name)?await antLerPdf(file,status):await antLerImagem(file,status);
    a.texto=antLimpar(bruto,nome); a.status=a.texto.replace(/\s/g,'').length>20?'pronto':'erro'; if(a.status==='erro') a.msg='não achei texto';
  }catch(e){ a.status='erro'; a.msg='não consegui ler'; }
  rerender();
}
async function antOrganizar(prev,exame,rerender,avisar){
  const cfg=antCfg.get(); const textos=prev.arqs.filter(a=>a.status==='pronto').map(a=>({texto:a.texto}));
  if(prev.txt&&prev.txt.trim()&&!prev.txtDaIA) textos.push({texto:prev.txt.trim()}); // o que você digitou/ditou também entra
  prev.organizando=true; rerender();
  try{
    const r=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({senha:cfg.senha,exame,textos})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(j.erro||('erro '+r.status));
    prev.txt=j.texto; prev.txtDaIA=true;
    avisar('Exames anteriores organizados');
  }catch(e){ avisar(e.message==='senha incorreta'?'Senha da ponte incorreta':'Não consegui organizar: '+e.message); }
  prev.organizando=false; rerender();
}
if(typeof module!=='undefined') module.exports={antLimpar};

// COLE ESTE ARQUIVO NA CLOUDFLARE (so letras simples; acentos viram \uXXXX e voltam sozinhos).
// myLaudo \u00b7 ponte para a IA (Cloudflare Worker).
// Recebe o texto dos exames anteriores J\u00c1 SEM IDENTIFICA\u00c7\u00c3O (o app limpa no iPhone),
// pede ao Claude para agrupar os achados por lobo e ter\u00e7o e devolve o texto pronto.
// Segredos (Cloudflare \u2192 Worker \u2192 Settings \u2192 Variables and Secrets):
//   ANTHROPIC_API_KEY  chave da API da Anthropic
//   SENHA              a senha curta que o app manda em cada pedido

const ORIGENS = ['https://t8castri-art.github.io', 'http://localhost:8765'];
const MODELO = 'claude-opus-5-5';
const VERSAO = '2026-10-06b';

const INSTRUCOES = {
  tireoide: `Voc\u00ea recebe o texto de exames anteriores de tireoide (laudos de ultrassom e de PAAF, de colegas diferentes, ou ditados pelo pr\u00f3prio m\u00e9dico). A identifica\u00e7\u00e3o do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada al\u00e9m dele:

US 06/24:
N1 TM LD TIRADS 4: 9 \u00d7 6 \u00d7 7 mm
N2 TI LD TIRADS 4: 14 \u00d7 16 \u00d7 17 mm
N3 TI LE TIRADS 2: 23 \u00d7 17 \u00d7 12 mm
Volume: 17,6 cm\u00b3

PAAF 06/25:
N2 TI LD TIRADS 5: 19 \u00d7 21 \u00d7 24 mm, Bethesda III

Regras:
- Cabe\u00e7alho: "US dd/mm/aa:" quando o dia for conhecido, sen\u00e3o "US mm/aa:" (idem PAAF; "US sem data:" se faltar). Se o laudo disser a cl\u00ednica ou o servi\u00e7o de origem, entre a data e os dois-pontos, em uma palavra: "US 29/08/26 Cliniprev:". Uma linha em branco entre exames.
- Uma linha por n\u00f3dulo: r\u00f3tulo, ter\u00e7o (TS superior, TM m\u00e9dio, TI inferior; omita se o laudo n\u00e3o disser), lado (LD, LE ou istmo), "TIRADS" e o n\u00famero, dois-pontos, medidas.
- Ordem das linhas: LD de cima para baixo (TS, TM, TI), depois LE, depois istmo.
- R\u00f3tulo: o que o laudo usou (N1, N2...). Sem r\u00f3tulo, numere na ordem em que aparece.
- TIRADS: s\u00f3 o n\u00famero escrito no laudo. Se n\u00e3o tiver, "TIRADS NI". N\u00e3o calcule.
- Medidas sempre em mm, separadas por " \u00d7 ", v\u00edrgula decimal (1,2 cm = 12 mm). O m\u00e9dico dita em mm: "18 por 12 por 16" \u00e9 18 \u00d7 12 \u00d7 16 mm.
- PAAF: o n\u00f3dulo puncionado e, na mesma linha, ", Bethesda" em algarismos romanos.
- N\u00e3o diga que n\u00f3dulos de exames diferentes s\u00e3o o mesmo. N\u00e3o compare, n\u00e3o conclua, n\u00e3o recomende.
- \u00daltima linha de cada US: "Volume: X cm\u00b3" com o volume total da tireoide que o laudo trouxer (mL = cm\u00b3, v\u00edrgula decimal). Se o laudo s\u00f3 trouxer volume por lobo, some os dois. Se n\u00e3o trouxer volume, omita a linha. S\u00f3 o n\u00famero: sem "aumentado", sem "normal".
- Achado relevante fora de n\u00f3dulo (linfonodo suspeito, tireoidite, tireoidectomia): uma linha "Outros: ..." antes do volume.
- Nunca escreva valores de refer\u00eancia ("VR", "refer\u00eancia", "normal at\u00e9 ..."). Laudo enxuto.
- Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- O texto pode vir do ditado com erros do reconhecimento de voz do iPhone: "THATS", "tirades", "tai rads" = TI-RADS; "PF", "PAF", "p\u00e1-af" = PAAF; "betesda" = Bethesda; "bi hads", "birades" = BI-RADS; "hipo iko", "hipoecoide" = hipoecoico; "est\u00edmulo" = istmo; "logo direito" = lobo direito; "classifica\u00e7\u00e3o perif\u00e9rica" = calcifica\u00e7\u00e3o perif\u00e9rica; "para tireoide" = paratireoide. Corrija em sil\u00eancio.
- Sem markdown, sem t\u00edtulo, sem coment\u00e1rios.`,
  mamas: `Voc\u00ea recebe o texto de exames anteriores de mama (ultrassom, mamografia, core biopsy ou PAAF, de colegas diferentes, ou ditados pelo pr\u00f3prio m\u00e9dico). A identifica\u00e7\u00e3o do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada al\u00e9m dele:

MMG 05/24: BIRADS 2

US 06/24:
N1 MD QSL 10h BIRADS 3: 12 \u00d7 8 \u00d7 9 mm
C1 ME QSM 11h BIRADS 2: 6 \u00d7 5 \u00d7 5 mm

CORE 07/24:
N1 MD QSL 10h BIRADS 4A: 13 \u00d7 8 \u00d7 9 mm, histologia: fibroadenoma

Regras:
- Cabe\u00e7alho: "US", "MMG", "CORE", "PAAF" ou "RM" + data "dd/mm/aa" quando o dia for conhecido, sen\u00e3o "mm/aa" ("sem data" se faltar); cl\u00ednica de origem opcional em uma palavra antes dos dois-pontos ("US 29/08/26 Cliniprev:"). Uma linha em branco entre exames. Mamografia sem n\u00f3dulo descrito fica numa linha s\u00f3: "MMG mm/aa: BIRADS n" e, se houver, um achado curto.
- Uma linha por les\u00e3o: r\u00f3tulo (N para n\u00f3dulo, C para cisto; o que o laudo usou, ou numere por mama na ordem), mama (MD ou ME), quadrante, hor\u00e1rio se houver, "BIRADS" e a categoria, dois-pontos, medidas.
- Quadrante s\u00f3 nas quatro siglas cl\u00e1ssicas: QSL, QSM, QIL, QIM. Se o laudo der s\u00f3 o hor\u00e1rio: na MD, 10-11h QSL, 1-2h QSM, 7-8h QIL, 4-5h QIM; na ME, 1-2h QSL, 10-11h QSM, 4-5h QIL, 7-8h QIM. Les\u00e3o em 12h, 3h, 6h ou 9h (na linha entre quadrantes) ou em uni\u00e3o de quadrantes: sem sigla, s\u00f3 o hor\u00e1rio. Atr\u00e1s do mamilo: "retroareolar" por extenso. Se quadrante e hor\u00e1rio faltarem, omita.
- BIRADS: a categoria escrita no laudo (0 a 6, 4A/4B/4C). Se n\u00e3o tiver, "BIRADS NI". N\u00e3o calcule.
- Medidas sempre em mm, separadas por " \u00d7 ", v\u00edrgula decimal (1,2 cm = 12 mm). O m\u00e9dico dita em mm: "18 por 12 por 16" \u00e9 18 \u00d7 12 \u00d7 16 mm.
- CORE/PAAF: a les\u00e3o biopsiada e, na mesma linha, ", histologia: ..." ou ", citologia: ..." curtos.
- N\u00e3o diga que les\u00f5es de exames diferentes s\u00e3o a mesma. N\u00e3o compare, n\u00e3o conclua, n\u00e3o recomende.
- Achado relevante fora de n\u00f3dulo (linfonodo axilar suspeito, ectasia, pr\u00f3tese, cirurgia): uma linha "Outros: ..." no fim do exame.
- Nunca escreva valores de refer\u00eancia. Laudo enxuto.
- Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- O texto pode vir do ditado com erros do reconhecimento de voz do iPhone: "THATS", "tirades", "tai rads" = TI-RADS; "PF", "PAF", "p\u00e1-af" = PAAF; "betesda" = Bethesda; "bi hads", "birades" = BI-RADS; "hipo iko", "hipoecoide" = hipoecoico; "est\u00edmulo" = istmo; "logo direito" = lobo direito; "classifica\u00e7\u00e3o perif\u00e9rica" = calcifica\u00e7\u00e3o perif\u00e9rica; "para tireoide" = paratireoide. Corrija em sil\u00eancio.
- Sem markdown, sem t\u00edtulo, sem coment\u00e1rios.`,
  cervical: `Voc\u00ea recebe o texto de exames anteriores da regi\u00e3o cervical (ultrassom cervical, de linfonodos ou do leito tireoidiano, PAAF, TC ou RM, de colegas diferentes, ou ditados pelo pr\u00f3prio m\u00e9dico). A identifica\u00e7\u00e3o do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada al\u00e9m dele:

US 03/25:
LN1 III D: 12 \u00d7 8 \u00d7 9 mm, suspeito
LN2 II E: 8 \u00d7 4 \u00d7 5 mm, reacional
LT1 leito D: 6 \u00d7 4 \u00d7 5 mm

PAAF 04/25:
LN1 III D: 12 \u00d7 8 \u00d7 9 mm, Bethesda VI, Tg no lavado 250

Regras:
- Cabe\u00e7alho: "US", "PAAF", "TC" ou "RM" + data "dd/mm/aa" quando o dia for conhecido, sen\u00e3o "mm/aa" ("sem data" se faltar); cl\u00ednica de origem opcional em uma palavra antes dos dois-pontos. Uma linha em branco entre exames.
- Linfonodo: "LN" e n\u00famero, n\u00edvel (I a VII), lado (D ou E), dois-pontos, medidas em mm, e depois ", suspeito" ou ", reacional" conforme o laudo disser. Sem r\u00f3tulo, numere na ordem.
- Les\u00e3o do leito tireoidiano: "LT" e n\u00famero, "leito D", "leito E" ou "leito istmo", dois-pontos, medidas.
- N\u00f3dulo de gl\u00e2ndula salivar: "LS" e n\u00famero, a gl\u00e2ndula (par\u00f3tida D, par\u00f3tida E, submandibular D, submandibular E), dois-pontos, medidas.
- Medidas sempre em mm, separadas por " \u00d7 ", v\u00edrgula decimal (1,2 cm = 12 mm). O m\u00e9dico dita em mm: "18 por 12 por 16" \u00e9 18 \u00d7 12 \u00d7 16 mm.
- PAAF: o alvo e, na mesma linha, ", Bethesda" em romanos e, se houver, ", Tg no lavado" com o valor.
- N\u00e3o diga que les\u00f5es de exames diferentes s\u00e3o a mesma. N\u00e3o compare, n\u00e3o conclua, n\u00e3o recomende.
- Achado relevante fora de les\u00e3o (tireoidectomia, esvaziamento cervical, sialoadenite, sialolit\u00edase): uma linha "Outros: ..." no fim do exame.
- Nunca escreva valores de refer\u00eancia. Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- O texto pode vir do ditado com erros do reconhecimento de voz do iPhone: "THATS", "tirades", "tai rads" = TI-RADS; "PF", "PAF", "p\u00e1-af" = PAAF; "betesda" = Bethesda; "bi hads", "birades" = BI-RADS; "hipo iko", "hipoecoide" = hipoecoico; "est\u00edmulo" = istmo; "logo direito" = lobo direito; "classifica\u00e7\u00e3o perif\u00e9rica" = calcifica\u00e7\u00e3o perif\u00e9rica; "para tireoide" = paratireoide. Corrija em sil\u00eancio.
- Sem markdown, sem t\u00edtulo, sem coment\u00e1rios.`,
  transvaginal: `Voc\u00ea recebe o texto de exames anteriores de ultrassom p\u00e9lvico ou transvaginal (ou RM da pelve), de colegas diferentes, ou ditados pelo pr\u00f3prio m\u00e9dico. A identifica\u00e7\u00e3o do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada al\u00e9m dele:

US 03/25:
M1 intramural posterior FIGO 4: 21 \u00d7 18 \u00d7 20 mm
L1 ov\u00e1rio D O-RADS 2: 35 \u00d7 30 \u00d7 28 mm, cisto simples
\u00datero: 59 \u00d7 34 \u00d7 50 mm
Endom\u00e9trio: 8 mm

Regras:
- Cabe\u00e7alho: "US" ou "RM" + data "dd/mm/aa" quando o dia for conhecido, sen\u00e3o "mm/aa" ("sem data" se faltar); cl\u00ednica de origem opcional em uma palavra antes dos dois-pontos. Uma linha em branco entre exames.
- Mioma: "M" e n\u00famero, tipo (submucoso, intramural, subseroso, pediculado), parede (anterior, posterior, fundo, lateral D, lateral E), "FIGO" e o n\u00famero se o laudo trouxer, dois-pontos, medidas.
- Les\u00e3o anexial: "L" e n\u00famero, "ov\u00e1rio D", "ov\u00e1rio E" ou "anexo D/E", "O-RADS" e o n\u00famero se o laudo trouxer, dois-pontos, medidas, e depois uma descri\u00e7\u00e3o de at\u00e9 4 palavras (cisto simples, hemorr\u00e1gico, endometrioma, dermoide, s\u00f3lido...).
- Depois das les\u00f5es, "\u00datero:" com as tr\u00eas medidas e "Endom\u00e9trio:" com a espessura em mm, se o laudo trouxer.
- Medidas sempre em mm, separadas por " \u00d7 ", v\u00edrgula decimal (1,2 cm = 12 mm). O m\u00e9dico dita em mm: "18 por 12 por 16" \u00e9 18 \u00d7 12 \u00d7 16 mm.
- N\u00e3o diga que les\u00f5es de exames diferentes s\u00e3o a mesma. N\u00e3o compare, n\u00e3o conclua, n\u00e3o recomende.
- Achado relevante fora de les\u00e3o (DIU, adenomiose, l\u00edquido livre, histerectomia): uma linha "Outros: ..." no fim do exame.
- Nunca escreva valores de refer\u00eancia. Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- O texto pode vir do ditado com erros do reconhecimento de voz do iPhone: "THATS", "tirades", "tai rads" = TI-RADS; "PF", "PAF", "p\u00e1-af" = PAAF; "betesda" = Bethesda; "bi hads", "birades" = BI-RADS; "hipo iko", "hipoecoide" = hipoecoico; "est\u00edmulo" = istmo; "logo direito" = lobo direito; "classifica\u00e7\u00e3o perif\u00e9rica" = calcifica\u00e7\u00e3o perif\u00e9rica; "para tireoide" = paratireoide. Corrija em sil\u00eancio.
- Sem markdown, sem t\u00edtulo, sem coment\u00e1rios.`,
  prostata: `Voc\u00ea recebe o texto de exames anteriores de pr\u00f3stata (ultrassom abdominal ou transretal, PSA, RM, bi\u00f3psia), de colegas diferentes, ou ditados pelo pr\u00f3prio m\u00e9dico. A identifica\u00e7\u00e3o do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada al\u00e9m dele:

US 03/25:
Pr\u00f3stata: 45 \u00d7 38 \u00d7 40 mm, 37 g
Res\u00edduo: 60 mL
PSA 02/25: 4,2 ng/mL

Regras:
- Cabe\u00e7alho: "US", "RM" ou "BX" (bi\u00f3psia) + data "dd/mm/aa" quando o dia for conhecido, sen\u00e3o "mm/aa" ("sem data" se faltar); cl\u00ednica de origem opcional em uma palavra antes dos dois-pontos. Uma linha em branco entre exames. PSA isolado vira uma linha "PSA mm/aa: valor ng/mL" dentro do exame mais pr\u00f3ximo ou sozinho.
- "Pr\u00f3stata:" com as tr\u00eas medidas em mm e, depois da v\u00edrgula, o peso ou volume em g (se o laudo s\u00f3 trouxer mL ou cm\u00b3, use o mesmo n\u00famero em g).
- "Res\u00edduo:" com o res\u00edduo p\u00f3s-miccional em mL, se o laudo trouxer.
- Bi\u00f3psia: "Gleason" ou "ISUP" com o resultado em uma linha.
- Medidas sempre em mm, separadas por " \u00d7 ", v\u00edrgula decimal.
- N\u00e3o compare, n\u00e3o conclua, n\u00e3o recomende.
- Achado relevante (protrus\u00e3o intravesical, c\u00e1lculo vesical, hidronefrose, les\u00e3o focal): uma linha "Outros: ..." no fim do exame.
- Nunca escreva valores de refer\u00eancia. Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- O texto pode vir do ditado com erros do reconhecimento de voz do iPhone: "THATS", "tirades", "tai rads" = TI-RADS; "PF", "PAF", "p\u00e1-af" = PAAF; "betesda" = Bethesda; "bi hads", "birades" = BI-RADS; "hipo iko", "hipoecoide" = hipoecoico; "est\u00edmulo" = istmo; "logo direito" = lobo direito; "classifica\u00e7\u00e3o perif\u00e9rica" = calcifica\u00e7\u00e3o perif\u00e9rica; "para tireoide" = paratireoide. Corrija em sil\u00eancio.
- Sem markdown, sem t\u00edtulo, sem coment\u00e1rios.`,
};

function cors(origem) {
  const ok = ORIGENS.includes(origem) ? origem : ORIGENS[0];
  return {
    'Access-Control-Allow-Origin': ok,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}
const resp = (obj, status, origem) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origem) } });

export default {
  async fetch(request, env) {
    const origem = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origem) });
    if (request.method !== 'POST') return resp({ erro: 'use POST', versao: VERSAO }, 405, origem);
    if (!ORIGENS.includes(origem)) return resp({ erro: 'origem n\u00e3o autorizada' }, 403, origem);

    let corpo;
    try { corpo = await request.json(); } catch { return resp({ erro: 'JSON inv\u00e1lido' }, 400, origem); }
    if (!env.SENHA || corpo.senha !== env.SENHA) return resp({ erro: 'senha incorreta' }, 401, origem);

    const exame = Object.prototype.hasOwnProperty.call(INSTRUCOES, corpo.exame) ? corpo.exame : 'tireoide';
    const textos = Array.isArray(corpo.textos) ? corpo.textos.filter(t => t && typeof t.texto === 'string' && t.texto.trim()) : [];
    if (!textos.length) return resp({ erro: 'nenhum texto' }, 400, origem);
    const total = textos.reduce((s, t) => s + t.texto.length, 0);
    if (total > 120000) return resp({ erro: 'texto grande demais' }, 413, origem);

    const conteudo = textos.map((t, i) => `<laudo n="${i + 1}">\n${t.texto.trim()}\n</laudo>`).join('\n\n');

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 16000,
        output_config: { effort: 'low' },
        fallbacks: 'default',
        system: INSTRUCOES[exame],
        messages: [{ role: 'user', content: conteudo }],
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) return resp({ erro: 'IA indispon\u00edvel', detalhe: j && j.error ? j.error.message : r.status }, 502, origem);
    if (j.stop_reason === 'refusal') return resp({ erro: 'a IA recusou este texto' }, 422, origem);
    const texto = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (!texto) return resp({ erro: 'resposta vazia' }, 502, origem);
    return resp({ texto, uso: j.usage }, 200, origem);
  },
};

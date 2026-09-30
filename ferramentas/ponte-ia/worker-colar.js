// COLE ESTE ARQUIVO NA CLOUDFLARE (so letras simples; acentos viram \uXXXX e voltam sozinhos).
// myLaudo \u00b7 ponte para a IA (Cloudflare Worker).
// Recebe o texto dos exames anteriores J\u00c1 SEM IDENTIFICA\u00c7\u00c3O (o app limpa no iPhone),
// pede ao Claude para agrupar os achados por lobo e ter\u00e7o e devolve o texto pronto.
// Segredos (Cloudflare \u2192 Worker \u2192 Settings \u2192 Variables and Secrets):
//   ANTHROPIC_API_KEY  chave da API da Anthropic
//   SENHA              a senha curta que o app manda em cada pedido

const ORIGENS = ['https://t8castri-art.github.io', 'http://localhost:8765'];
const MODELO = 'claude-opus-5-5';
const VERSAO = '2026-09-29b';

const INSTRUCOES = {
  tireoide: `Voc\u00ea recebe o texto de exames anteriores de tireoide (laudos de ultrassom e de PAAF, de colegas diferentes, ou ditados pelo pr\u00f3prio m\u00e9dico). A identifica\u00e7\u00e3o do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada al\u00e9m dele:

US 06/24:
N1 TM LD TIRADS 4: 9 \u00d7 6 \u00d7 7 mm
N2 TI LD TIRADS 4: 14 \u00d7 16 \u00d7 17 mm
N3 TI LE TIRADS 2: 23 \u00d7 17 \u00d7 12 mm

PAAF 06/25:
N2 TI LD TIRADS 5: 19 \u00d7 21 \u00d7 24 mm, Bethesda III

Regras:
- Cabe\u00e7alho: "US mm/aa:" ou "PAAF mm/aa:" ("US sem data:" se faltar). Uma linha em branco entre exames.
- Uma linha por n\u00f3dulo: r\u00f3tulo, ter\u00e7o (TS superior, TM m\u00e9dio, TI inferior; omita se o laudo n\u00e3o disser), lado (LD, LE ou istmo), "TIRADS" e o n\u00famero, dois-pontos, medidas.
- Ordem das linhas: LD de cima para baixo (TS, TM, TI), depois LE, depois istmo.
- R\u00f3tulo: o que o laudo usou (N1, N2...). Sem r\u00f3tulo, numere na ordem em que aparece.
- TIRADS: s\u00f3 o n\u00famero escrito no laudo. Se n\u00e3o tiver, "TIRADS NI". N\u00e3o calcule.
- Medidas sempre em mm, separadas por " \u00d7 ", v\u00edrgula decimal (1,2 cm = 12 mm).
- PAAF: o n\u00f3dulo puncionado e, na mesma linha, ", Bethesda" em algarismos romanos.
- N\u00e3o diga que n\u00f3dulos de exames diferentes s\u00e3o o mesmo. N\u00e3o compare, n\u00e3o conclua, n\u00e3o recomende.
- Achado relevante fora de n\u00f3dulo (linfonodo suspeito, tireoidite, tireoidectomia): uma linha "Outros: ..." no fim do exame.
- Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
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
- Cabe\u00e7alho: "US mm/aa:", "MMG mm/aa:", "CORE mm/aa:", "PAAF mm/aa:" ou "RM mm/aa:" ("sem data" se faltar). Uma linha em branco entre exames. Mamografia sem n\u00f3dulo descrito fica numa linha s\u00f3: "MMG mm/aa: BIRADS n" e, se houver, um achado curto.
- Uma linha por les\u00e3o: r\u00f3tulo (N para n\u00f3dulo, C para cisto; o que o laudo usou, ou numere por mama na ordem), mama (MD ou ME), quadrante, hor\u00e1rio se houver, "BIRADS" e a categoria, dois-pontos, medidas.
- Quadrante s\u00f3 nas quatro siglas cl\u00e1ssicas: QSL, QSM, QIL, QIM. Se o laudo der s\u00f3 o hor\u00e1rio: na MD, 10-11h QSL, 1-2h QSM, 7-8h QIL, 4-5h QIM; na ME, 1-2h QSL, 10-11h QSM, 4-5h QIL, 7-8h QIM. Les\u00e3o em 12h, 3h, 6h ou 9h (na linha entre quadrantes) ou em uni\u00e3o de quadrantes: sem sigla, s\u00f3 o hor\u00e1rio. Atr\u00e1s do mamilo: "retroareolar" por extenso. Se quadrante e hor\u00e1rio faltarem, omita.
- BIRADS: a categoria escrita no laudo (0 a 6, 4A/4B/4C). Se n\u00e3o tiver, "BIRADS NI". N\u00e3o calcule.
- Medidas sempre em mm, separadas por " \u00d7 ", v\u00edrgula decimal (1,2 cm = 12 mm).
- CORE/PAAF: a les\u00e3o biopsiada e, na mesma linha, ", histologia: ..." ou ", citologia: ..." curtos.
- N\u00e3o diga que les\u00f5es de exames diferentes s\u00e3o a mesma. N\u00e3o compare, n\u00e3o conclua, n\u00e3o recomende.
- Achado relevante fora de n\u00f3dulo (linfonodo axilar suspeito, ectasia, pr\u00f3tese, cirurgia): uma linha "Outros: ..." no fim do exame.
- Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
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

    const exame = corpo.exame in INSTRUCOES ? corpo.exame : 'tireoide';
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

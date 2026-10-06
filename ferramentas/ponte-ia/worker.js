// myLaudo · ponte para a IA (Cloudflare Worker).
// Recebe o texto dos exames anteriores JÁ SEM IDENTIFICAÇÃO (o app limpa no iPhone),
// pede ao Claude para agrupar os achados por lobo e terço e devolve o texto pronto.
// Segredos (Cloudflare → Worker → Settings → Variables and Secrets):
//   ANTHROPIC_API_KEY  chave da API da Anthropic
//   SENHA              a senha curta que o app manda em cada pedido

const ORIGENS = ['https://t8castri-art.github.io', 'http://localhost:8765'];
const MODELO = 'claude-opus-5-5';
const VERSAO = '2026-10-06a';

const INSTRUCOES = {
  tireoide: `Você recebe o texto de exames anteriores de tireoide (laudos de ultrassom e de PAAF, de colegas diferentes, ou ditados pelo próprio médico). A identificação do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada além dele:

US 06/24:
N1 TM LD TIRADS 4: 9 × 6 × 7 mm
N2 TI LD TIRADS 4: 14 × 16 × 17 mm
N3 TI LE TIRADS 2: 23 × 17 × 12 mm
Volume: 17,6 cm³

PAAF 06/25:
N2 TI LD TIRADS 5: 19 × 21 × 24 mm, Bethesda III

Regras:
- Cabeçalho: "US dd/mm/aa:" quando o dia for conhecido, senão "US mm/aa:" (idem PAAF; "US sem data:" se faltar). Se o laudo disser a clínica ou o serviço de origem, entre a data e os dois-pontos, em uma palavra: "US 29/08/26 Cliniprev:". Uma linha em branco entre exames.
- Uma linha por nódulo: rótulo, terço (TS superior, TM médio, TI inferior; omita se o laudo não disser), lado (LD, LE ou istmo), "TIRADS" e o número, dois-pontos, medidas.
- Ordem das linhas: LD de cima para baixo (TS, TM, TI), depois LE, depois istmo.
- Rótulo: o que o laudo usou (N1, N2...). Sem rótulo, numere na ordem em que aparece.
- TIRADS: só o número escrito no laudo. Se não tiver, "TIRADS NI". Não calcule.
- Medidas sempre em mm, separadas por " × ", vírgula decimal (1,2 cm = 12 mm). O médico dita em mm: "18 por 12 por 16" é 18 × 12 × 16 mm.
- PAAF: o nódulo puncionado e, na mesma linha, ", Bethesda" em algarismos romanos.
- Não diga que nódulos de exames diferentes são o mesmo. Não compare, não conclua, não recomende.
- Última linha de cada US: "Volume: X cm³" com o volume total da tireoide que o laudo trouxer (mL = cm³, vírgula decimal). Se o laudo só trouxer volume por lobo, some os dois. Se não trouxer volume, omita a linha. Só o número: sem "aumentado", sem "normal".
- Achado relevante fora de nódulo (linfonodo suspeito, tireoidite, tireoidectomia): uma linha "Outros: ..." antes do volume.
- Nunca escreva valores de referência ("VR", "referência", "normal até ..."). Laudo enxuto.
- Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- Sem markdown, sem título, sem comentários.`,
  mamas: `Você recebe o texto de exames anteriores de mama (ultrassom, mamografia, core biopsy ou PAAF, de colegas diferentes, ou ditados pelo próprio médico). A identificação do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada além dele:

MMG 05/24: BIRADS 2

US 06/24:
N1 MD QSL 10h BIRADS 3: 12 × 8 × 9 mm
C1 ME QSM 11h BIRADS 2: 6 × 5 × 5 mm

CORE 07/24:
N1 MD QSL 10h BIRADS 4A: 13 × 8 × 9 mm, histologia: fibroadenoma

Regras:
- Cabeçalho: "US", "MMG", "CORE", "PAAF" ou "RM" + data "dd/mm/aa" quando o dia for conhecido, senão "mm/aa" ("sem data" se faltar); clínica de origem opcional em uma palavra antes dos dois-pontos ("US 29/08/26 Cliniprev:"). Uma linha em branco entre exames. Mamografia sem nódulo descrito fica numa linha só: "MMG mm/aa: BIRADS n" e, se houver, um achado curto.
- Uma linha por lesão: rótulo (N para nódulo, C para cisto; o que o laudo usou, ou numere por mama na ordem), mama (MD ou ME), quadrante, horário se houver, "BIRADS" e a categoria, dois-pontos, medidas.
- Quadrante só nas quatro siglas clássicas: QSL, QSM, QIL, QIM. Se o laudo der só o horário: na MD, 10-11h QSL, 1-2h QSM, 7-8h QIL, 4-5h QIM; na ME, 1-2h QSL, 10-11h QSM, 4-5h QIL, 7-8h QIM. Lesão em 12h, 3h, 6h ou 9h (na linha entre quadrantes) ou em união de quadrantes: sem sigla, só o horário. Atrás do mamilo: "retroareolar" por extenso. Se quadrante e horário faltarem, omita.
- BIRADS: a categoria escrita no laudo (0 a 6, 4A/4B/4C). Se não tiver, "BIRADS NI". Não calcule.
- Medidas sempre em mm, separadas por " × ", vírgula decimal (1,2 cm = 12 mm). O médico dita em mm: "18 por 12 por 16" é 18 × 12 × 16 mm.
- CORE/PAAF: a lesão biopsiada e, na mesma linha, ", histologia: ..." ou ", citologia: ..." curtos.
- Não diga que lesões de exames diferentes são a mesma. Não compare, não conclua, não recomende.
- Achado relevante fora de nódulo (linfonodo axilar suspeito, ectasia, prótese, cirurgia): uma linha "Outros: ..." no fim do exame.
- Nunca escreva valores de referência. Laudo enxuto.
- Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- Sem markdown, sem título, sem comentários.`,
  cervical: `Você recebe o texto de exames anteriores da região cervical (ultrassom cervical, de linfonodos ou do leito tireoidiano, PAAF, TC ou RM, de colegas diferentes, ou ditados pelo próprio médico). A identificação do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada além dele:

US 03/25:
LN1 III D: 12 × 8 × 9 mm, suspeito
LN2 II E: 8 × 4 × 5 mm, reacional
LT1 leito D: 6 × 4 × 5 mm

PAAF 04/25:
LN1 III D: 12 × 8 × 9 mm, Bethesda VI, Tg no lavado 250

Regras:
- Cabeçalho: "US", "PAAF", "TC" ou "RM" + data "dd/mm/aa" quando o dia for conhecido, senão "mm/aa" ("sem data" se faltar); clínica de origem opcional em uma palavra antes dos dois-pontos. Uma linha em branco entre exames.
- Linfonodo: "LN" e número, nível (I a VII), lado (D ou E), dois-pontos, medidas em mm, e depois ", suspeito" ou ", reacional" conforme o laudo disser. Sem rótulo, numere na ordem.
- Lesão do leito tireoidiano: "LT" e número, "leito D", "leito E" ou "leito istmo", dois-pontos, medidas.
- Nódulo de glândula salivar: "LS" e número, a glândula (parótida D, parótida E, submandibular D, submandibular E), dois-pontos, medidas.
- Medidas sempre em mm, separadas por " × ", vírgula decimal (1,2 cm = 12 mm). O médico dita em mm: "18 por 12 por 16" é 18 × 12 × 16 mm.
- PAAF: o alvo e, na mesma linha, ", Bethesda" em romanos e, se houver, ", Tg no lavado" com o valor.
- Não diga que lesões de exames diferentes são a mesma. Não compare, não conclua, não recomende.
- Achado relevante fora de lesão (tireoidectomia, esvaziamento cervical, sialoadenite, sialolitíase): uma linha "Outros: ..." no fim do exame.
- Nunca escreva valores de referência. Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- Sem markdown, sem título, sem comentários.`,
  transvaginal: `Você recebe o texto de exames anteriores de ultrassom pélvico ou transvaginal (ou RM da pelve), de colegas diferentes, ou ditados pelo próprio médico. A identificação do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada além dele:

US 03/25:
M1 intramural posterior FIGO 4: 21 × 18 × 20 mm
L1 ovário D O-RADS 2: 35 × 30 × 28 mm, cisto simples
Útero: 59 × 34 × 50 mm
Endométrio: 8 mm

Regras:
- Cabeçalho: "US" ou "RM" + data "dd/mm/aa" quando o dia for conhecido, senão "mm/aa" ("sem data" se faltar); clínica de origem opcional em uma palavra antes dos dois-pontos. Uma linha em branco entre exames.
- Mioma: "M" e número, tipo (submucoso, intramural, subseroso, pediculado), parede (anterior, posterior, fundo, lateral D, lateral E), "FIGO" e o número se o laudo trouxer, dois-pontos, medidas.
- Lesão anexial: "L" e número, "ovário D", "ovário E" ou "anexo D/E", "O-RADS" e o número se o laudo trouxer, dois-pontos, medidas, e depois uma descrição de até 4 palavras (cisto simples, hemorrágico, endometrioma, dermoide, sólido...).
- Depois das lesões, "Útero:" com as três medidas e "Endométrio:" com a espessura em mm, se o laudo trouxer.
- Medidas sempre em mm, separadas por " × ", vírgula decimal (1,2 cm = 12 mm). O médico dita em mm: "18 por 12 por 16" é 18 × 12 × 16 mm.
- Não diga que lesões de exames diferentes são a mesma. Não compare, não conclua, não recomende.
- Achado relevante fora de lesão (DIU, adenomiose, líquido livre, histerectomia): uma linha "Outros: ..." no fim do exame.
- Nunca escreva valores de referência. Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- Sem markdown, sem título, sem comentários.`,
  prostata: `Você recebe o texto de exames anteriores de próstata (ultrassom abdominal ou transretal, PSA, RM, biópsia), de colegas diferentes, ou ditados pelo próprio médico. A identificação do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada além dele:

US 03/25:
Próstata: 45 × 38 × 40 mm, 37 g
Resíduo: 60 mL
PSA 02/25: 4,2 ng/mL

Regras:
- Cabeçalho: "US", "RM" ou "BX" (biópsia) + data "dd/mm/aa" quando o dia for conhecido, senão "mm/aa" ("sem data" se faltar); clínica de origem opcional em uma palavra antes dos dois-pontos. Uma linha em branco entre exames. PSA isolado vira uma linha "PSA mm/aa: valor ng/mL" dentro do exame mais próximo ou sozinho.
- "Próstata:" com as três medidas em mm e, depois da vírgula, o peso ou volume em g (se o laudo só trouxer mL ou cm³, use o mesmo número em g).
- "Resíduo:" com o resíduo pós-miccional em mL, se o laudo trouxer.
- Biópsia: "Gleason" ou "ISUP" com o resultado em uma linha.
- Medidas sempre em mm, separadas por " × ", vírgula decimal.
- Não compare, não conclua, não recomende.
- Achado relevante (protrusão intravesical, cálculo vesical, hidronefrose, lesão focal): uma linha "Outros: ..." no fim do exame.
- Nunca escreva valores de referência. Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- Sem markdown, sem título, sem comentários.`,
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
    if (!ORIGENS.includes(origem)) return resp({ erro: 'origem não autorizada' }, 403, origem);

    let corpo;
    try { corpo = await request.json(); } catch { return resp({ erro: 'JSON inválido' }, 400, origem); }
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
    if (!r.ok || !j) return resp({ erro: 'IA indisponível', detalhe: j && j.error ? j.error.message : r.status }, 502, origem);
    if (j.stop_reason === 'refusal') return resp({ erro: 'a IA recusou este texto' }, 422, origem);
    const texto = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (!texto) return resp({ erro: 'resposta vazia' }, 502, origem);
    return resp({ texto, uso: j.usage }, 200, origem);
  },
};

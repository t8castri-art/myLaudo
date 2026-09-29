// myLaudo · ponte para a IA (Cloudflare Worker).
// Recebe o texto dos exames anteriores JÁ SEM IDENTIFICAÇÃO (o app limpa no iPhone),
// pede ao Claude para agrupar os achados por lobo e terço e devolve o texto pronto.
// Segredos (Cloudflare → Worker → Settings → Variables and Secrets):
//   ANTHROPIC_API_KEY  chave da API da Anthropic
//   SENHA              a senha curta que o app manda em cada pedido

const ORIGENS = ['https://t8castri-art.github.io', 'http://localhost:8765'];
const MODELO = 'claude-opus-5-5';

const INSTRUCOES = {
  tireoide: `Você recebe o texto de exames anteriores de tireoide (laudos de ultrassom e de PAAF, de colegas diferentes, ou ditados pelo próprio médico). A identificação do paciente foi removida.

Reescreva tudo neste formato exato, exame por exame, do mais antigo para o mais recente, sem nada além dele:

US 06/24:
Lobo direito
Terço médio: N1 TI-RADS 4: 9 × 6 × 7 mm
Terço inferior: N2 TI-RADS 4: 14 × 16 × 17 mm
Lobo esquerdo
Terço inferior: N3 TI-RADS 2: 23 × 17 × 12 mm

PAAF 06/25:
Lobo direito
Terço inferior: N2 TI-RADS 5: 19 × 21 × 24 mm
Citologia: Bethesda III

Regras:
- Cabeçalho de cada exame: "US mm/aa:" ou "PAAF mm/aa:". Sem data, "US sem data:". Uma linha em branco entre exames.
- Dentro do exame, "Lobo direito" e depois "Lobo esquerdo", cada nódulo numa linha começando pelo terço ("Terço superior:", "Terço médio:", "Terço inferior:" ou "Terço não informado:"). Nódulo no istmo: linha "Istmo: N4 TI-RADS 2: 5 × 4 × 3 mm", depois dos lobos.
- Rótulo: o que o laudo usou (N1, N2...). Sem rótulo, numere na ordem em que aparece.
- TI-RADS: só o número que está no laudo. Se não tiver, "TI-RADS não informado". Não calcule.
- Medidas sempre em mm, separadas por " × ", com vírgula decimal quando houver (1,2 cm = 12 mm).
- PAAF: o nódulo puncionado com TI-RADS e medidas se constarem, e a linha "Citologia: Bethesda ..." (em algarismos romanos).
- Não diga que nódulos de exames diferentes são o mesmo. Não compare, não conclua, não recomende.
- Se houver achado relevante fora de nódulo (linfonodo suspeito, tireoidite, tireoidectomia), uma linha "Outros: ..." no fim do exame.
- Ignore qualquer nome, documento ou dado pessoal que tenha sobrado.
- Sem markdown, sem título geral, sem comentários.`,
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
    if (request.method !== 'POST') return resp({ erro: 'use POST' }, 405, origem);
    if (!ORIGENS.includes(origem)) return resp({ erro: 'origem não autorizada' }, 403, origem);

    let corpo;
    try { corpo = await request.json(); } catch { return resp({ erro: 'JSON inválido' }, 400, origem); }
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
    if (!r.ok || !j) return resp({ erro: 'IA indisponível', detalhe: j && j.error ? j.error.message : r.status }, 502, origem);
    if (j.stop_reason === 'refusal') return resp({ erro: 'a IA recusou este texto' }, 422, origem);
    const texto = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (!texto) return resp({ erro: 'resposta vazia' }, 502, origem);
    return resp({ texto, uso: j.usage }, 200, origem);
  },
};

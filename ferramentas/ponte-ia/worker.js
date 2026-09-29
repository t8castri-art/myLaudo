// myLaudo · ponte para a IA (Cloudflare Worker).
// Recebe o texto dos exames anteriores JÁ SEM IDENTIFICAÇÃO (o app limpa no iPhone),
// pede ao Claude para agrupar os achados por lobo e terço e devolve o texto pronto.
// Segredos (Cloudflare → Worker → Settings → Variables and Secrets):
//   ANTHROPIC_API_KEY  chave da API da Anthropic
//   SENHA              a senha curta que o app manda em cada pedido

const ORIGENS = ['https://t8castri-art.github.io', 'http://localhost:8765'];
const MODELO = 'claude-opus-5-5';

const INSTRUCOES = {
  tireoide: `Você recebe o texto de um ou mais laudos anteriores de ultrassonografia de tireoide, de colegas diferentes. A identificação do paciente foi removida.

Monte um resumo curto, em português do Brasil, agrupando os nódulos por localização. Grupos, nesta ordem, só os que tiverem nódulo:
Lobo direito, terço superior / Lobo direito, terço médio / Lobo direito, terço inferior / Istmo / Lobo esquerdo, terço superior / Lobo esquerdo, terço médio / Lobo esquerdo, terço inferior / Localização não informada.

Dentro de cada grupo, uma linha por nódulo por exame, do exame mais antigo para o mais recente:
- mm/aa (rótulo que o colega usou, ex. "N6"): composição e ecogenicidade em poucas palavras, medidas em cm com vírgula (a × b × c), ACR TI-RADS.

Regras:
- Não diga que nódulos de exames diferentes são o mesmo nódulo. Não compare, não conclua, não recomende conduta. Só agrupe.
- Se o laudo não traz o terço, use "terço não informado" dentro do lobo.
- Se o laudo não traz o TI-RADS, escreva "TI-RADS não informado". Não calcule.
- Mantenha as medidas exatamente como no laudo, convertendo mm para cm só se precisar.
- Primeira linha: "Exames: " e as datas (mm/aa) de cada laudo recebido, separadas por vírgula. Se um laudo não tiver data, "sem data".
- Se houver achado relevante fora de nódulo (linfonodo suspeito, tireoidite, volume alterado), uma linha final "Outros: ...".
- Ignore qualquer nome, documento ou dado pessoal que tenha sobrado no texto.
- Responda só com o resumo, sem título, sem markdown, sem comentários.`,
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

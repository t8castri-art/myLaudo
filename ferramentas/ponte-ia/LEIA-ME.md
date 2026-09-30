# Ponte da IA (Cloudflare Worker)

O app manda para cá só o texto dos exames anteriores **já sem identificação**. A ponte guarda a chave da Anthropic e devolve o resumo agrupado por lobo e terço.

## Montar (uma vez)

1. **Chave da Anthropic**: console.anthropic.com → API Keys → Create Key. Copie a chave (começa com `sk-ant-`). Coloque crédito em Billing.
2. **Cloudflare**: dash.cloudflare.com → Workers & Pages → Create → Create Worker → nome `mylaudo-ponte` → Deploy.
3. Depois de criado, **Edit code**: apague tudo, cole o conteúdo de **`worker-colar.js`** (versão só com letras simples, que não estraga na colagem) e clique em **Deploy**. O `worker.js` é o mesmo código, legível; edite nele e gere o `worker-colar.js` de novo.
4. No Worker → **Settings → Variables and Secrets → Add**:
   - `ANTHROPIC_API_KEY` (tipo Secret) = a chave do passo 1
   - `SENHA` (tipo Secret) = uma senha curta que você inventa
5. Copie o endereço do Worker (`https://mylaudo-ponte.<sua-conta>.workers.dev`).
6. No celular, na tireoide → Exames anteriores → sim → anexe um laudo → aparece "Ligar a IA neste aparelho". Cole o endereço e a senha e toque em **Salvar**. Fica guardado só naquele aparelho.

## Ajustes

- Modelo: `claude-opus-5-5`, com esforço baixo (resposta rápida). Para trocar, mude `MODELO` no topo do `worker.js`.
- Só aceita pedidos vindos do site `t8castri-art.github.io` (e do `localhost:8765` para testes), e com a senha.
- O pedido e a resposta não ficam gravados na ponte.

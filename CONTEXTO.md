# myLaudo — contexto para continuar o desenvolvimento

Leia isto antes de mexer em qualquer tela. É o estado atual das decisões do Dr. Luiz Altomare, médico ultrassonografista em Cuiabá/MT. O histórico rodada a rodada está em `HISTORICO.md`. Quando os dois discordarem, vale este arquivo.

## O que é
App **pessoal** para gerar laudos de ultrassom no celular (iPhone). Não é produto, não é público. O fluxo é marcar chips, conferir o texto, **Copiar** e colar no sistema oficial (Zanno, sistema do Instituto ou HMC) ou mandar por WhatsApp ou e-mail.

- Site no ar: https://t8castri-art.github.io/myLaudo/ (repositório público `t8castri-art/myLaudo`, GitHub Pages, branch `main`, raiz)
- Este repositório (`mylaudo-dev`, privado) guarda as fontes, o laboratório do ícone e este contexto.
- Ele instala o site no iPhone: Safari → Compartilhar → Adicionar à Tela de Início → "Abrir como App Web".

## Duas máquinas: PC com Windows e MacBook

O trabalho anda nas duas, e o GitHub é quem sincroniza. O histórico de conversa NÃO vai junto: cada máquina tem a sua. Este arquivo é a memória compartilhada.

**Sempre que começar uma sessão, seja onde for:**
1. `git pull` antes de qualquer coisa.
2. Trabalhe normalmente.
3. `git commit` e `git push` ao terminar, mesmo que a mudança seja pequena.

Se esquecer o pull e der conflito, não force nada: pare e resolva arquivo por arquivo.

**Quando mudar alguma regra do app** (texto do laudo, comportamento de tela, decisão de design), atualize este CONTEXTO.md na mesma sessão. É ele que ensina a próxima conversa, na outra máquina.

**Publicar o site** continua sendo à parte: copie de `design/` para o repositório público `t8castri-art/myLaudo` (`mylaudo.html` vira `index.html`) e dê push lá também.

## Como trabalhar com ele
- **Ritmo devagar.** Mostre, pergunte, e só então empilhe a próxima decisão.
- **Mínimo de palavras** no texto do laudo. Nunca repita a mesma informação duas vezes.
- **Sem valores de referência** no laudo (nem nos exames anteriores). Normal é só "normal"/"habitual"; alterado é "aumentado"/"reduzido". Laudo enxuto, nunca frente e verso.
- Ele pede mudanças curtas e diretas. Aplique, confira o texto gerado e mostre um trecho de exemplo.
- Sempre em português do Brasil.

## Estrutura
```
design/               fontes das telas (é aqui que se edita)
  ditado.js           ditado por item: fala → chips e medidas (vai junto para o site)
  mylaudo.html        início: serviço, + novo paciente, lista de exames  → vira site/index.html
  novo-paciente.html  cadastro com botão duplo ditado/scanner
  emitir-laudo-*.html tireoide, mamas, transvaginal, cervical, prostata
  laboratorio-*.html  laboratórios de cor/layout e do ícone
  modelos.js          31 rascunhos de modelos (sintaxe {a|b|c} = chips, ___ = lacuna)
ferramentas/icone/    script que gera o laboratório do ícone + recortes da logo
exigencias-laudo-us.md  normas (CFM 2.381/2024, CBR/PADI 2025, SBEM etc.)
```
**Publicar uma mudança:** edite em `design/`, copie para o repositório do site (`mylaudo.html` → `index.html`, e as outras telas com o mesmo nome), faça commit e push em `t8castri-art/myLaudo`. O Pages republica em 1 ou 2 minutos.

## Visual (travado)
- Só tema escuro, o mais escuro possível. Estilo discreto, "Batman".
- Paleta Noturno: fundo `#09080b`, superfícies `#100e13` `#16141b` `#1d1a23`, bordas `#221f28` `#2f2b37`, texto `#ececee` `#9b97a3` `#605c69`.
- Acento **Rosa Saudade** `#bc7ba4` (claro `#dcb9cd`), apoio **sálvia** `#9aaf9c` (a mesma cor da logo dele), atenção terracota `#b08183`.
- Fonte IBM Plex Sans + IBM Plex Mono. Botões só contorno. Chips para tudo.

## Regras de interface (valem para o app todo)
- **Medidas em milímetros inteiros**: digita `20`, o laudo sai `2,0 cm`. Com vírgula, 2 casas.
- **Preencheu, pula sozinho** para o próximo campo: 2 dígitos em medida; data completa.
- Datas: exame anterior `mm/aa`; DUM e nascimento `dd/mm/aaaa`, com máscara.
- 3 medidas cabem numa linha.
- Toda alteração marcada "sim" ou "alterada" abre **caixa de texto livre**, que entra no laudo.
- A **prévia do laudo é editável** (fundo claro). Editar à mão congela o texto; o botão "Refazer pelos cartões" volta ao automático. O **Copiar laudo fica abaixo da prévia**.
- **Uso com a mão esquerda** (o probe fica na direita), aprovado em 27/09:
  - O microfone fica fixo no canto inferior esquerdo, em todas as telas. Na tela do exame ele dita o exame; dentro de um item (nódulo etc.), dita o item. Toca para parar, toca de novo para continuar. O texto aparece num painel acima dele com **Concluir** (ou tocar fora do painel) e **Deletar** (zera para recomeçar); depois de concluir, "ver ditado" reabre.
  - Nos cartões com vários campos (anamnese, glândula, órgão...), os botões ficam colados à esquerda e o nome do campo fica à direita. Cartões de dois botões ficam como estão.
  - Nas telas de item, "Concluir" fica à esquerda e "Remover" na ponta direita.
  - **Toda caixa de texto tem um microfone redondo** no canto inferior esquerdo e um **✕** ao lado. O microfone **continua** de onde parou (emenda no texto, para imprevistos); o ✕ apaga tudo para recomeçar. Nada precisa ser digitado.
  - Nos exames anteriores, cada trecho ditado vai para a IA; se chegar um trecho enquanto a IA ainda responde, ele entra na fila e vai junto no pedido seguinte.
  - O Copiar laudo continua embaixo da prévia.
- **Estrutura que nem sempre aparece** (ex.: paratireoide "visibilizada") pergunta "Está normal ou alterada?" e abre o texto pronto da opção escolhida, que dá para editar. Paratireoide normal: "Paratireoide de aspecto habitual, visibilizada adjacente ao terço inferior do lobo direito." Quando alterada, a conclusão ganha "Formação nodular em topografia de paratireoide. Correlacionar com cálcio e PTH."
- Cada exame aberto pelo início abre **limpo**. A seta do topo volta ao início.

## Serviços
| | Instituto | Particular | HMC (SUS) |
|---|---|---|---|
| Nome do paciente no laudo | sim | sim | não |
| Técnica cita o aparelho | sim | sim | não, só o tipo de transdutor |
| Caráter (eletivo/urgência) | não | não | sim, dentro da técnica |
| US + PAAF/CORE | **1 laudo só** (US + bloco Procedimento) | 2 laudos | 2 laudos |

Para ele, "particular" é tudo que não é SUS. Aparelho: **Samsung HM70 EVO**, transdutores linear 3–16 MHz, minilinear 2–22 MHz, convexo 2–8 MHz, endocavitário 2–9 MHz.

## Ordem do laudo (todas as telas)
Título → Paciente (fora do HMC) → Indicação → **Técnica** → Informações clínicas → US anterior → Descrição → Conclusão → Sugestão.

- **Técnica** concentra tudo, sem linhas separadas de Equipamento, Caráter ou Transdutor:
  - HMC: "Exame realizado com transdutor convexo por via suprapúbica, com avaliação pós-miccional, em caráter eletivo." (urgência → "em caráter de urgência")
  - Fora do HMC: "Exame realizado em aparelho Samsung HM70 EVO, com transdutor convexo 2–8 MHz, por via suprapúbica, …"
  - Tireoide, cervical, mama e transvaginal sempre com "estudo Doppler colorido e PowerDoppler".
- **Exames anteriores**: "sim" abre data `mm/aa` e uma caixa de texto. No laudo: `US anterior de 06/25: <texto>.` Sem exame: "Sem exames anteriores para comparação." (em Informações clínicas).
- Cada nódulo, mioma, ovário e lesão em **parágrafo próprio**.

## Regras por exame
- **Tireoide**: descreve TODOS os nódulos, de qualquer tamanho. ACR TI-RADS 2017 (não existe "2025"); pontos escondidos. No texto entram a composição e só o que pontua, mais o Doppler do nódulo (ausente / central / periférica, combináveis). **Focos ecogênicos são multi-seleção e os pontos somam.** Sugestão curta: "PAAF de N1." (com linfonodo: "PAAF de N1 e LN1, com tireoglobulina no lavado do linfonodo."). Conduta pela MAIOR medida (TR3 PAAF ≥ 2,5, seguimento ≥ 1,5; TR4 ≥ 1,5 / ≥ 1,0; TR5 ≥ 1,0 / ≥ 0,5 cm). Só volume total. Anamnese: história familiar (não / sim / sim 1º grau), conhece nódulos, tireoidectomia (por câncer?), levotiroxina + dose, sintomas (pigarro, rouquidão, disfagia, falta de ar). TSH e anticorpos não entram.
- **Mamas e axilas** (sempre juntas): cada lesão em parágrafo próprio, nesta ordem: rótulo, **quadrante** (QSL/QSM/QIL/QIM, calculado pelo horário e pela mama; em 12/3/6/9h só o horário), **horário**, distância **da pele**, distância **do mamilo**, depois os descritores na ordem do léxico BI-RADS (forma, orientação, margens, ecogenicidade, acústica posterior, calcificações, Doppler) e **as medidas no fim**. Ex.: "N1, QSL, 10h, distando 1,5 cm da pele e 3,0 cm do mamilo: nódulo oval, paralelo à pele, … Mediu 1,3 × 0,9 × 0,6 cm." Descritores antes da classificação. BI-RADS por mama, só na conclusão. Mamografia (não fez / trouxe com BI-RADS e data / não trouxe). Anamnese sem nada marcado → "Nega histórico familiar de câncer de mama e biópsia prévia."; se a indicação é Rotina, não escreve negativas. CORE aprovado.
- **Transvaginal**: DUM ou menopausa; G P A com cesárea ou vaginal. Miomas com FIGO sugerido; lesões anexiais com IOTA e O-RADS sugerido. Só endocavitário.
- **Cervical e salivares**: leito tireoidiano, linfonodos por nível I–VII, salivares (todas normais = "Glândulas salivares sem alterações detectáveis."), PAAF com tireoglobulina no lavado quando há linfonodo.
- **Próstata via abdominal**: ordem bexiga (volume inicial) → parede → JUV → próstata → vesículas seminais → protrusão → **pós-miccional** (sempre ≥ 1; cada um mede bexiga e próstata de novo; repete se sobrar volume; não existe "bexiga vazia"). HPB > 30 g (discreto ≤ 50, moderado ≤ 80, acentuado > 80). IPP I < 5, II 5–10, III > 10 mm. Resíduo significativo > 50 mL (último).

## Exames anteriores (tireoide e mamas, desde 29/09)
- Cartão: `Trouxe não | sim`. Com "sim", somem o "Trouxe" e o não/sim (um ✕ discreto no título desfaz). Fica só o botão **escanear ou PDF** (várias fotos e PDFs), a lista dos arquivos e a caixa de texto (clicável, com "transcrever"). Sem botão "digitar", sem campo de data (cada exame traz a sua).
- **Não há botão "organizar"**: agrupar por lobo e terço é a instrução da IA. Terminou de ler os arquivos, ou terminou de transcrever/ditar na caixa, vai sozinho para a IA e volta agrupado. Correção à mão no resumo não é reenviada.
- O texto é lido **no iPhone** (PDF com texto direto; foto ou PDF escaneado pela leitura de imagem), e o app **apaga as linhas de identificação** (nome, nascimento, idade, CPF, telefone, e-mail, convênio, atendimento, médicos) antes de qualquer envio. O nome da ficha também é apagado se aparecer solto.
- Só o texto limpo vai para a **ponte** (`ferramentas/ponte-ia/`, Cloudflare Worker com a chave da Anthropic e uma senha). A IA só **reescreve no formato fixo**, exame por exame, do mais antigo ao mais recente, sem comparar:
  - Tireoide: `US 06/24:` e uma linha por nódulo `N1 TM LD TIRADS 4: 9 × 6 × 7 mm` (TS/TM/TI, LD/LE/istmo); `PAAF 06/25:` com `…, Bethesda III` na linha.
  - Mamas (tela de US e laudo do Core): `MMG 05/24: BIRADS 2`, `US 06/24:` e `N1 MD QSL 10h BIRADS 3: 12 × 8 × 9 mm` (N nódulo, C cisto; só as 4 siglas clássicas QSL/QSM/QIL/QIM; em 12/3/6/9h só o horário; "retroareolar" por extenso); `CORE 07/24:` com `…, histologia: …`.
  - Medidas em mm; rótulo que o laudo usou.
- No laudo sai **"Exames anteriores:"** com essa lista e, no fim, **"Evolução:"**, a mini conclusão, **calculada pelo app** (não pela IA) comparando os nódulos de hoje com o **mesmo rótulo e lobo** nos anteriores. O mais suspeito vem primeiro. Até 2 mm na maior medida = estável; +4 mm em até 6 meses = crescimento rápido; ACR (≥ 20% em 2 medidas e ≥ 2 mm, ou ≥ 50% no volume) = crescimento significativo. Nas mamas: aumento ≥ 20% na maior medida (e ≥ 2 mm) = crescimento, destacando quando em até 6 meses; comparação por rótulo e mama. Lembra a última PAAF (Bethesda). Nódulo de hoje sem rótulo correspondente: "sem correspondente nos exames anteriores". Quem liga os rótulos entre exames é o médico.
- Endereço e senha da ponte ficam guardados só no aparelho.
- A ponte responde a um GET com a versão (`versao`), para conferir qual código está no ar.
- Ditado: tocar de novo no microfone **continua** de onde parou; "Apagar e recomeçar" limpa. O ditado do exame pega também o **nome** ("paciente Fulano de Tal") e o **texto do exame anterior** ("exame anterior de 06/25 mostrava ...").

## Privacidade (regra fixa)
Nada identificável sai do celular. Antes de qualquer texto ou imagem ir para uma IA (ditado ou scanner), o app remove nome, nascimento, CPF, telefone e e-mail; a IA recebe só achados. Os dados ficam no aparelho.

## Próximos passos combinados
1. **Ditado** (no ar desde 24–25/09, código em `design/ditado.js`, compartilhado pelas telas; reconhecimento por regras, no aparelho, sem IA; "sem X" / "nega X" anulam X).
   - **Ditado do exame**: cartão no topo das 5 telas. Preenche indicação, anamnese, exames anteriores, órgão e medidas. Ignora nódulos e lesões.
   - **Ditado do item**: nódulo e linfonodo (tireoide), linfonodo e lesão do leito (cervical), nódulo e cisto de mama (mama, horário, distância do mamilo e da pele, descritores BI-RADS; o ditado pode trocar a mama e o tipo nódulo/cisto). Frase corrida: localização + características + **medidas em cm por último**.
   - Medida sem unidade vale cm; com "milímetros" ou valor ≥ 10, vale mm.
   - "Tudo em milímetros" (ou "medidas em milímetros") vale para a frase inteira. A última menção de um lobo vale (correção falada).
   - Paratireoide: plural ("visibilizadas") sem "não" conta como **não visibilizadas**, porque o iPhone às vezes engole o "não"; só o singular marca visibilizada.
   - O iPhone erra previsivelmente, e o app corrige: frases coladas sem ponto ("PeçanhaExame"), "Estímulo/istimo" = istmo, "logo direito" = lobo direito, "para tireoide" = paratireoide, "leva tiroxina" = levotiroxina, "17h21" entre números = 17 21, "mediu06" = mediu 06. Medidas também com "vezes", só números em sequência ("47 18 20"), "LD/LE". Istmo com um número só = espessura.
   - Para depurar: pedir ao médico o **texto exato da caixa** (o que o iPhone escreveu) e testar o parser em cima dele.
   - **Tracejado = veio do ditado e já está no laudo.** Não precisa tocar para confirmar; só toca para trocar. O que não foi dito fica no padrão, que conta como ausente. O aviso só aparece quando falta o essencial do item (nódulo: lobo, terço, composição, ecogenicidade, medidas).
   - Se o microfone do site falhar, usa-se o do teclado na mesma caixa.
   - Falta ditado de item em: mioma, lesão anexial, lesão salivar e lesão cervical.
2. **Ícone**: laboratório em `design/laboratorio-do-icone.html` (gerado por `ferramentas/icone/lab_icone.py`). Decidido: calipers em **X**, traço fino, rosa + sálvia, degradê esfumaçado que termina em preto. Reprovados: feixe, colchetes, logo dele no ícone, Saturno, traçado livre, cruz "+". Na mesa: nódulo medido, só os calipers, elipse medida, Doppler de 1 e de 2 ondas (subida sistólica rápida), campo trapezoidal e **campo minimalista** (fundo preto, degradê só dentro do feixe, nódulo medido dentro). Falta ele escolher; depois gerar `apple-touch-icon.png` 180×180 e ligar no `index.html`.
3. Exames que faltam para cobrir o HMC: rins e vias, carótidas, depois abdome superior e total.
4. Depois (não agora): agenda (Google Calendar do Instituto e do particular) e integração DICOM com o aparelho.

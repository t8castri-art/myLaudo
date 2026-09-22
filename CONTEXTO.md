# myLaudo — contexto para continuar o desenvolvimento

Leia isto antes de mexer em qualquer tela. É o estado atual das decisões do Dr. Luiz Altomare, médico ultrassonografista em Cuiabá/MT. O histórico rodada a rodada está em `HISTORICO.md`. Quando os dois discordarem, vale este arquivo.

## O que é
App **pessoal** para gerar laudos de ultrassom no celular (iPhone). Não é produto, não é público. O fluxo é marcar chips, conferir o texto, **Copiar** e colar no sistema oficial (Zanno, sistema do Instituto ou HMC) ou mandar por WhatsApp ou e-mail.

- Site no ar: https://t8castri-art.github.io/myLaudo/ (repositório público `t8castri-art/myLaudo`, GitHub Pages, branch `main`, raiz)
- Este repositório (`mylaudo-dev`, privado) guarda as fontes, o laboratório do ícone e este contexto.
- Ele instala o site no iPhone: Safari → Compartilhar → Adicionar à Tela de Início → "Abrir como App Web".

## Como trabalhar com ele
- **Ritmo devagar.** Mostre, pergunte, e só então empilhe a próxima decisão.
- **Mínimo de palavras** no texto do laudo. Nunca repita a mesma informação duas vezes.
- Ele pede mudanças curtas e diretas. Aplique, confira o texto gerado e mostre um trecho de exemplo.
- Sempre em português do Brasil.

## Estrutura
```
design/               fontes das telas (é aqui que se edita)
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
- **Tireoide**: descreve TODOS os nódulos, de qualquer tamanho. ACR TI-RADS 2017 (não existe "2025"); pontos escondidos. No texto entram a composição e só o que pontua, mais o Doppler do nódulo (ausente / central / periférica, combináveis). **Focos ecogênicos são multi-seleção e os pontos somam.** Conduta pela MAIOR medida (TR3 PAAF ≥ 2,5, seguimento ≥ 1,5; TR4 ≥ 1,5 / ≥ 1,0; TR5 ≥ 1,0 / ≥ 0,5 cm). Só volume total. Anamnese: história familiar (não / sim / sim 1º grau), conhece nódulos, tireoidectomia (por câncer?), levotiroxina + dose, sintomas (pigarro, rouquidão, disfagia, falta de ar). TSH e anticorpos não entram.
- **Mamas e axilas** (sempre juntas): nódulo com horário, distância do mamilo, distância da pele e medidas. Descritores antes da classificação. BI-RADS por mama, só na conclusão. Mamografia (não fez / trouxe com BI-RADS e data / não trouxe). Anamnese sem nada marcado → "Nega histórico familiar de câncer de mama e biópsia prévia."; se a indicação é Rotina, não escreve negativas. CORE aprovado.
- **Transvaginal**: DUM ou menopausa; G P A com cesárea ou vaginal. Miomas com FIGO sugerido; lesões anexiais com IOTA e O-RADS sugerido. Só endocavitário.
- **Cervical e salivares**: leito tireoidiano, linfonodos por nível I–VII, salivares (todas normais = "Glândulas salivares sem alterações detectáveis."), PAAF com tireoglobulina no lavado quando há linfonodo.
- **Próstata via abdominal**: ordem bexiga (volume inicial) → parede → JUV → próstata → vesículas seminais → protrusão → **pós-miccional** (sempre ≥ 1; cada um mede bexiga e próstata de novo; repete se sobrar volume; não existe "bexiga vazia"). HPB > 30 g (discreto ≤ 50, moderado ≤ 80, acentuado > 80). IPP I < 5, II 5–10, III > 10 mm. Resíduo significativo > 50 mL (último).

## Privacidade (regra fixa)
Nada identificável sai do celular. Antes de qualquer texto ou imagem ir para uma IA (ditado ou scanner), o app remove nome, nascimento, CPF, telefone e e-mail; a IA recebe só achados. Os dados ficam no aparelho.

## Próximos passos combinados
1. **Ditado de verdade**, começando pela tireoide: aperta gravar, fala, os chips vão marcando, termina revisando o texto e copia. Precisa rodar no site próprio (dentro do claude.ai o microfone é bloqueado). Perguntas pendentes para ele: como fala a medida ("vinte por catorze por doze"?) e se prefere frase corrida por nódulo ou por partes.
2. **Ícone**: laboratório em `design/laboratorio-do-icone.html` (gerado por `ferramentas/icone/lab_icone.py`). Decidido: calipers em **X**, traço fino, rosa + sálvia, degradê esfumaçado que termina em preto. Reprovados: feixe, colchetes, logo dele no ícone, Saturno, traçado livre, cruz "+". Na mesa: nódulo medido, só os calipers, elipse medida, Doppler de 1 e de 2 ondas (subida sistólica rápida), campo trapezoidal e **campo minimalista** (fundo preto, degradê só dentro do feixe, nódulo medido dentro). Falta ele escolher; depois gerar `apple-touch-icon.png` 180×180 e ligar no `index.html`.
3. Exames que faltam para cobrir o HMC: rins e vias, carótidas, depois abdome superior e total.
4. Depois (não agora): agenda (Google Calendar do Instituto e do particular) e integração DICOM com o aparelho.

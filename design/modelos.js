// Modelos de laudo — rascunhos v0 (12/09/2026)
// Fonte: MODELOS US (.docx) + Notion › Sistematização. Lista de exames = db Precificação ago/26, sem combos.
// Sintaxe dentro dos textos:  {a|b|c} = chips de escolha rápida (o primeiro é o padrão) · ___ = lacuna numérica
// Cada seção pode ter: texto (normal), variantes (versões alteradas), medidas, repetivel (botão "Adicionar …" com calculadora), chips (Conclusão/Sugestão).

const TEC = {
  convexo: 'Exame realizado com transdutor convexo multifrequencial, em cortes longitudinais, transversais e oblíquos, em modo B.',
  linear: 'Ultrassonografia realizada com transdutor linear de alta frequência, com varreduras longitudinais, transversais e oblíquas sobre a região de interesse.',
  msk: 'Exame realizado com transdutor linear de alta frequência, com avaliação estática e dinâmica, {unilateral|comparativa}.',
  endocav: 'Exame realizado com transdutor endocavitário, por via transvaginal.',
  doppler: 'Exame realizado com transdutor {linear|convexo} multifrequencial, em modo B, Doppler colorido e Doppler pulsado.',
};

const CARATER = '{eletivo|de urgência}';

// ---------- blocos reutilizáveis ----------
const BEXIGA = {
  t: 'Bexiga',
  texto: 'Bexiga urinária {repleta|pouco repleta} de conteúdo anecoico, paredes finas e lisas, sem cálculos, lesões focais ou projeções em seu interior.',
  variantes: [
    { n: 'Parede espessada', texto: 'Bexiga urinária com paredes {espessadas|irregulares}, medindo ___ mm, conteúdo {anecoico|heterogêneo}.' },
    { n: 'Imagem endoluminal', texto: 'Observa-se imagem {hiperecoica com sombra acústica posterior, móvel|ecogênica aderida à parede, sem sombra|vegetante} em seu interior, medindo ___ mm, compatível com {cálculo|coágulo|lesão vegetante}.' },
    { n: 'Sonda vesical', texto: 'Observa-se balonete insuflado em posição habitual.' },
  ],
  medidas: [
    { k: 'Volume pré-miccional', u: 'mL', dims: 3, auto: 'L × AP × T × 0,52' },
    { k: 'Volume pós-miccional', u: 'mL', dims: 3, auto: 'L × AP × T × 0,52 · residual significativo acima de ~50 mL' },
    { k: 'Parede anterior', u: 'mm', dims: 1, ref: 'até 3–5 mm com bexiga repleta' },
  ],
};

const RINS = {
  t: 'Rins e ureteres',
  texto: 'Rins tópicos e simétricos, apresentando dimensões, contornos e textura parenquimatosa habituais, relação córtico-medular {mantida|adequada para a faixa etária}. Sem evidência de cálculos, massas ou dilatação pielocalicial. Segmentos ureterais distais {sem dilatação|não visibilizados devido a interposição gasosa}.',
  variantes: [
    { n: 'Hidronefrose', texto: 'Rim {direito|esquerdo} apresentando dilatação da pelve e dos cálices, {sem|com} afilamento cortical, compatível com hidronefrose grau {I|II|III|IV}.' },
    { n: 'Nefropatia crônica', texto: 'Rins tópicos, apresentando aumento difuso da ecogenicidade parenquimatosa, associado a {discreto|moderado|acentuado} afilamento cortical, relação córtico-medular {mantida|reduzida}. Não há evidência de dilatação pielocalicial.' },
    { n: 'Rim não avaliado', texto: 'Não foi possível adequada avaliação do rim {esquerdo|direito} devido a interposição gasosa.' },
    { n: 'Lobulação / contorno', texto: 'Rim {direito|esquerdo} com contornos lobulados, {sem|com} redução da espessura cortical.' },
  ],
  medidas: [
    { k: 'Rim direito · bipolar', u: 'cm', dims: 1, ref: '9–12 cm' }, { k: 'Rim direito · córtex', u: 'cm', dims: 1, ref: '≥ 1,0 cm' },
    { k: 'Rim esquerdo · bipolar', u: 'cm', dims: 1, ref: '9–12 cm' }, { k: 'Rim esquerdo · córtex', u: 'cm', dims: 1, ref: '≥ 1,0 cm' },
  ],
  repetiveis: [
    { botao: 'Adicionar cálculo', calc: null, texto: 'Imagem hiperecoica com sombra acústica posterior no {terço superior|terço médio|terço inferior|pelve renal|ureter proximal|ureter distal} do rim {direito|esquerdo}, medindo ___ mm, compatível com cálculo.' },
    { botao: 'Adicionar cisto renal', calc: 'bosniak', texto: 'Formação cística no {terço superior|terço médio|terço inferior} do rim {direito|esquerdo}, {de paredes finas e conteúdo anecoico|com septos finos|com septos espessos ou calcificações|com componente sólido}, medindo ___ × ___ × ___ cm. Bosniak {I|II|IIF|III|IV}.' },
  ],
};

const FIGADO = {
  t: 'Fígado',
  texto: 'Fígado em posição e topografia habituais, com contornos {regulares|lobulados} e bordas {finas|rombas}. Parênquima com ecotextura {homogênea|heterogênea} e ecogenicidade {preservada|aumentada|reduzida}, sem evidência de lesões focais sólidas ou císticas. Vias biliares intra-hepáticas com calibre preservado.',
  variantes: [
    { n: 'Esteatose', texto: 'Fígado de dimensões {habituais|aumentadas}, contornos regulares e ecotextura homogênea, difusamente hiperecogênico, {com boa|com parcial|com má} visibilização dos vasos e do diafragma, compatível com esteatose hepática {leve|moderada|acentuada}.' },
    { n: 'Hepatopatia crônica', texto: 'Fígado de contornos lobulados, bordas rombas e ecotextura grosseiramente heterogênea, com {redução|aumento} do lobo direito e hipertrofia do lobo caudado, achados sugestivos de hepatopatia crônica.' },
  ],
  medidas: [
    { k: 'Lobo direito', u: 'cm', dims: 1, ref: 'até 15 cm' }, { k: 'Lobo esquerdo', u: 'cm', dims: 1, ref: 'até 10 cm' }, { k: 'Veia porta', u: 'mm', dims: 1, ref: 'até 12 mm' },
  ],
  repetiveis: [
    { botao: 'Adicionar lesão hepática', calc: null, texto: 'Lesão {cística de paredes finas e conteúdo anecoico|sólida hiperecogênica homogênea de limites definidos|sólida hipoecoica|sólida heterogênea} no segmento {I|II|III|IVa|IVb|V|VI|VII|VIII}, medindo ___ × ___ × ___ cm, {sem|com} fluxo ao Doppler, {compatível com cisto simples|compatível com hemangioma|de natureza indeterminada}.' },
  ],
};

const VESICULA = {
  t: 'Vesícula e vias biliares',
  texto: 'Vesícula biliar {filiforme|de forma e posição habituais|distendida}, repleta de conteúdo anecoico, com paredes finas e lisas. Não há evidência de cálculos, dilatação das vias biliares ou líquido perivesicular.',
  variantes: [
    { n: 'Colelitíase', texto: 'Vesícula biliar repleta de conteúdo anecoico, com paredes {finas|pouco espessadas (___ mm)}, contendo {imagem única|ao menos ___ imagens|múltiplas imagens} hiperecoica(s) em seu interior, móvel(is) à mudança de decúbito, determinando sombra acústica posterior, a maior medindo ___ mm, compatível(is) com cálculo(s). Não há líquido perivesicular.' },
    { n: 'Lama biliar', texto: 'Observa-se {discreta|moderada} quantidade de material ecogênico sedimentar, móvel, sem sombra acústica, compatível com lama biliar.' },
    { n: 'Pólipo', texto: 'Nota-se imagem ecogênica aderida à parede {anterior|posterior|fundo|colo}, sem sombra acústica posterior e imóvel à mudança de decúbito, medindo ___ mm, compatível com pólipo.' },
    { n: 'Colecistite aguda', texto: 'Vesícula biliar distendida, com paredes espessadas (___ mm) e estratificadas, {com|sem} cálculo impactado no infundíbulo, líquido perivesicular e sinal de Murphy ultrassonográfico positivo.' },
    { n: 'Colecistectomizado', texto: 'Vesícula biliar não caracterizada, compatível com status pós-colecistectomia.' },
    { n: 'Colédoco dilatado', texto: 'Hepatocolédoco com calibre aumentado, medindo ___ mm, {sem causa identificável ao presente exame|com imagem hiperecoica em seu interior compatível com cálculo}.' },
  ],
  medidas: [
    { k: 'Parede', u: 'mm', dims: 1, ref: 'até 3 mm' }, { k: 'Hepatocolédoco', u: 'mm', dims: 1, ref: 'até 6 mm; até 10 mm em idosos ou colecistectomizados' },
  ],
};

const PANCREAS_BACO = {
  t: 'Pâncreas e baço',
  texto: 'Pâncreas {visualizado adequadamente, de dimensões e contornos habituais, com ecotextura homogênea, sem lesões focais. Wirsung não visibilizado.|não visibilizado devido a interposição gasosa.|parcialmente visibilizado (cabeça e corpo), sem alterações nos segmentos avaliados.} Baço de aspecto habitual, ecotextura homogênea e contornos regulares.',
  variantes: [
    { n: 'Pancreatite', texto: 'Pâncreas {hiperecogênico|hipoecogênico} e homogêneo, de dimensões {pouco|moderadamente} aumentadas, com lobulações na porção da cabeça e {discreta|moderada} quantidade de líquido peripancreático, podendo corresponder a processo inflamatório agudo.' },
    { n: 'Esplenomegalia', texto: 'Baço com dimensões aumentadas, índice esplênico de ___ cm², parênquima homogêneo.' },
  ],
  medidas: [ { k: 'Wirsung', u: 'mm', dims: 1, ref: 'até 2 mm' }, { k: 'Índice esplênico', u: 'cm²', dims: 1, ref: 'até 60 cm²' } ],
};

const VASOS_LIQUIDO = { t: 'Vasos e cavidade', texto: 'Veia porta e aorta abdominal com calibres preservados, sem evidência de dilatações. Não há evidência de massas, coleções organizadas ou líquido livre na cavidade.', variantes: [ { n: 'Ascite', texto: 'Nota-se {pequena|moderada|grande} quantidade de líquido anecoico livre na cavidade {abdominal|abdominal e pélvica}, compatível com ascite {leve|moderada|volumosa}.' } ] };

const PELE_MSK = { t: 'Pele, subcutâneo e músculos', texto: 'Pele e tecido celular subcutâneo preservados. Musculatura envolvente íntegra, com trofismo, contratilidade e padrão fibrilar preservados, sem sinais de massa, hematoma ou dilacerações traumáticas. Superfícies ósseas regulares.' };

const CONCL_MSK = (art) => [`Exame ecográfico do ${art} dentro dos padrões de normalidade.`, 'Tendinopatia {insercional|do corpo tendíneo} do tendão ___.', 'Rotura {parcial|completa} do tendão ___.', 'Derrame articular {discreto|moderado|acentuado}.', 'Bursite ___.', 'Tenossinovite ___.'];

// ---------- lista de modelos ----------
const MODELOS = [

  // ============ ABDOME ============
  {
    id: 'abdome-superior', nome: 'Abdome Superior', grupo: 'Abdome', transdutor: 'convexo', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DE ABDOME SUPERIOR',
    fontes: ['MODELOS US/ABDOME/abdome superior normal.docx', 'abdome superior vesícula.docx', 'Notion › Sistematização › ABDOME SUPERIOR'],
    classificacoes: [{ nome: 'Graduação de esteatose (leve / moderada / acentuada)', quando: 'fígado hiperecogênico', app: 'chip' }, { nome: 'LI-RADS US', quando: 'rastreio de CHC em cirrótico', app: 'chip opcional' }],
    secoes: [
      { t: 'Indicação', chips: ['Rotina', 'Avaliação de esteatose hepática', 'Acompanhamento de doença hepática', 'Cirrose hepática', 'Hepatite prévia', 'Suspeita de colelitíase', 'Dor abdominal'] },
      { t: 'Técnica', texto: TEC.convexo + ' Avaliação de fígado, vias biliares, vesícula biliar, pâncreas e baço, em caráter ' + CARATER + '.' },
      FIGADO, VESICULA, PANCREAS_BACO, VASOS_LIQUIDO,
      { t: 'Conclusão', chips: ['Exame ecográfico dentro dos padrões de normalidade.', 'Exame ecográfico compatível com esteatose hepática {leve|moderada|acentuada}.', 'Colelitíase, sem sinais ultrassonográficos de colecistite aguda no presente exame.', 'Pólipo em parede da vesícula biliar.', 'Discreta ectasia do colédoco, sem causa identificável ao presente exame.', 'Pâncreas não visibilizado devido a interposição gasosa.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Correlação clínico-laboratorial.', 'Controle ecográfico em {6|12} meses.'] },
    ],
  },
  {
    id: 'abdome-total', nome: 'Abdome Total', grupo: 'Abdome', transdutor: 'convexo', preco: 250,
    titulo: 'ULTRASSONOGRAFIA DE ABDOME TOTAL',
    fontes: ['MODELOS US/ABDOME/abdome total normal.docx', 'abd total esteatose leve.docx', 'abdome total colelitíase.docx', 'abdome total coledoco dilatado.docx', 'abdome total pancreatite.docx'],
    classificacoes: [{ nome: 'Graduação de esteatose', quando: 'fígado hiperecogênico', app: 'chip' }, { nome: 'Bosniak', quando: 'cisto renal complexo', app: 'chip' }, { nome: 'Hidronefrose grau I–IV', quando: 'dilatação pielocalicial', app: 'chip' }],
    secoes: [
      { t: 'Indicação', chips: ['Rotina', 'Dor abdominal', 'Avaliação de esteatose hepática', 'Suspeita de colelitíase', 'Litíase urinária', 'Acompanhamento'] },
      { t: 'Técnica', texto: TEC.convexo + ' Avaliação de fígado, vias biliares, vesícula biliar, pâncreas, baço, rins, bexiga e cavidade abdominal, em caráter ' + CARATER + '.' },
      BEXIGA, FIGADO, VESICULA, PANCREAS_BACO, RINS, VASOS_LIQUIDO,
      { t: 'Conclusão', chips: ['Exame ecográfico dentro dos padrões de normalidade.', 'Exame ecográfico compatível com esteatose hepática {leve|moderada|acentuada}.', 'Colelitíase, sem sinais ultrassonográficos de colecistite aguda no presente exame.', 'Discreta ectasia do colédoco, sem causa identificável ao presente exame.', 'Ascite {leve|moderada|volumosa}.', 'Pâncreas não visibilizado devido a interposição gasosa.', 'Estudo prejudicado devido a intensa interposição gasosa.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Correlação clínico-laboratorial.', 'Controle ecográfico em {6|12} meses.'] },
    ],
  },
  {
    id: 'rins-vias', nome: 'Rins e Vias', grupo: 'Abdome', transdutor: 'convexo', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DO APARELHO URINÁRIO',
    fontes: ['MODELOS US/ABDOME/rins e vias normal.docx', 'rins e vias drc.docx', 'rins e vias alteradão.docx', 'Notion › Sistematização › RINS E VIAS URINÁRIAS'],
    classificacoes: [{ nome: 'Hidronefrose grau I–IV', quando: 'dilatação pielocalicial', app: 'chip' }, { nome: 'Bosniak', quando: 'cisto renal', app: 'chip' }],
    secoes: [
      { t: 'Indicação', chips: ['Rotina', 'Dor lombar', 'Infecção urinária de repetição', 'Hematúria', 'Litíase urinária', 'Avaliação de hidronefrose', 'Seguimento clínico ou pós-operatório'] },
      { t: 'Técnica', texto: TEC.convexo + ' Avaliação dos rins, ureteres terminais e bexiga urinária, em caráter ' + CARATER + '.' },
      BEXIGA, RINS,
      { t: 'Conclusão', chips: ['Exame ecográfico dentro dos padrões de normalidade.', 'Hidronefrose grau {I|II|III|IV} à {direita|esquerda}, {com|sem} cálculo obstrutivo identificado.', 'Nefrolitíase {à direita|à esquerda|bilateral}, sem sinais de obstrução.', 'Alterações sugestivas de nefropatia crônica.', 'Cisto renal simples (Bosniak I).', 'Resíduo pós-miccional {não significativo|aumentado (___ mL)}.', 'Estudo prejudicado devido a intensa interposição gasosa.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Correlação clínico-laboratorial.', 'Complementação com tomografia computadorizada, a critério clínico.'] },
    ],
  },
  {
    id: 'prostata', nome: 'Próstata abdominal', grupo: 'Abdome', transdutor: 'convexo', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DA PRÓSTATA VIA ABDOMINAL',
    fontes: ['MODELOS US/ABDOME/prostata normal.docx', 'prostata HPB IPP.docx', 'rins e vias + próstata normal.docx', 'Notion › Sistematização › Próstata'],
    classificacoes: [{ nome: 'Grau de protrusão prostática intravesical (IPP I: < 5 mm · II: 5–10 mm · III: > 10 mm)', quando: 'protrusão presente', app: 'calculado' }],
    secoes: [
      { t: 'Indicação', chips: ['Rotina', 'Sintomas do trato urinário inferior', 'Avaliação de volume prostático', 'PSA elevado', 'Retenção urinária'] },
      { t: 'Técnica', texto: TEC.convexo + ' Avaliação da bexiga urinária, próstata e vesículas seminais por via suprapúbica, com medida do resíduo pós-miccional.' },
      BEXIGA,
      { t: 'Próstata', texto: 'Próstata com contornos {regulares|lobulados} e textura parenquimatosa {homogênea|discretamente heterogênea|heterogênea}, sem evidência de lesões focais, calcificações ou protrusões.',
        variantes: [ { n: 'HPB com protrusão', texto: 'Próstata de dimensões aumentadas, contornos lobulados e textura heterogênea, apresentando protrusão intravesical de aproximadamente ___ mm.' }, { n: 'Calcificações', texto: 'Notam-se calcificações {periuretrais|esparsas} no parênquima prostático, sem sombra acústica significativa.' } ],
        medidas: [ { k: 'Próstata (L × AP × T)', u: 'cm', dims: 3 }, { k: 'Volume', u: 'mL', dims: 0, auto: 'L × AP × T × 0,52 · até 30 mL' }, { k: 'Peso estimado', u: 'g', dims: 0, auto: 'volume × 1,05' }, { k: 'Protrusão intravesical', u: 'mm', dims: 1, auto: 'grau I / II / III' } ] },
      { t: 'Vesículas seminais', texto: 'Vesículas seminais simétricas, com aspectos ecográficos habituais.' },
      { t: 'Conclusão', chips: ['Exame ecográfico sem alterações.', 'Próstata de volume {discretamente|moderadamente|acentuadamente} aumentado (~___ g), compatível com hiperplasia prostática benigna.', 'Protrusão prostática intravesical de ___ mm (grau {I|II|III}).', 'Resíduo pós-miccional de ___ mL.', 'Estudo prejudicado devido a bexiga urinária pouco repleta.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Correlação com PSA e toque retal.'] },
    ],
  },
  {
    id: 'parede-abdominal', nome: 'Parede abdominal', grupo: 'Abdome', transdutor: 'linear', preco: 150,
    titulo: 'ULTRASSONOGRAFIA DA PAREDE ABDOMINAL',
    fontes: ['Notion › Sistematização › Roteiro parede abdominal (sem modelo .docx — rascunho novo)'],
    classificacoes: [{ nome: 'Diástase dos retos (medida acima e abaixo da cicatriz umbilical)', quando: 'afastamento > 2 cm', app: 'medida' }],
    secoes: [
      { t: 'Indicação', chips: ['Abaulamento da parede abdominal', 'Suspeita de hérnia', 'Diástase dos retos', 'Dor na parede abdominal', 'Pós-operatório'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor linear de alta frequência sobre a parede abdominal anterior, em repouso e durante manobra de Valsalva, com cortes transversais da linha alba, da cicatriz umbilical e das linhas semilunares.' },
      { t: 'Parede abdominal', texto: 'Pele e tecido celular subcutâneo preservados. Músculos retos abdominais com trofismo e ecotextura habituais. Linha alba íntegra, {sem|com} afastamento dos ventres musculares. Cicatriz umbilical sem alterações. Linhas semilunares íntegras bilateralmente, sem evidência de defeitos aponeuróticos ou herniações, mesmo à manobra de Valsalva.',
        medidas: [ { k: 'Diástase supraumbilical', u: 'cm', dims: 1, ref: 'até 2 cm' }, { k: 'Diástase infraumbilical', u: 'cm', dims: 1, ref: 'até 2 cm' } ],
        repetiveis: [ { botao: 'Adicionar hérnia', calc: null, texto: 'Defeito aponeurótico em {linha alba supraumbilical|cicatriz umbilical|linha alba infraumbilical|linha semilunar direita|linha semilunar esquerda|cicatriz cirúrgica}, com colo medindo ___ mm, através do qual se hernia conteúdo {gorduroso|de alças intestinais|gorduroso e de alças}, {redutível|não redutível} à compressão, {acentuando-se|evidenciando-se apenas} à manobra de Valsalva.' }, { botao: 'Adicionar lesão de parede', calc: null, texto: 'Lesão {sólida hiperecogênica homogênea|cística|heterogênea} no {subcutâneo|plano muscular} da região ___, medindo ___ × ___ × ___ cm, {sem|com} fluxo ao Doppler, compatível com {lipoma|cisto|coleção|hematoma|endometrioma de parede}.' } ] },
      { t: 'Conclusão', chips: ['Exame ecográfico da parede abdominal dentro dos padrões de normalidade.', 'Hérnia {umbilical|epigástrica|de Spiegel|incisional} {redutível|não redutível}, com colo de ___ mm.', 'Diástase dos músculos retos abdominais de ___ cm.', 'Lipoma de parede abdominal.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Avaliação cirúrgica, a critério clínico.'] },
    ],
  },
  {
    id: 'hernia-inguinal', nome: 'Pesquisa hérnia inguinal', grupo: 'Abdome', transdutor: 'linear', preco: 150,
    titulo: 'ULTRASSONOGRAFIA DAS REGIÕES INGUINAIS',
    fontes: ['sem modelo .docx — rascunho novo'],
    classificacoes: [],
    secoes: [
      { t: 'Indicação', chips: ['Dor inguinal', 'Abaulamento inguinal', 'Suspeita de hérnia inguinal', 'Pós-operatório de herniorrafia'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor linear de alta frequência sobre as regiões inguinais, bilateralmente, em decúbito e ortostatismo, em repouso e durante manobra de Valsalva.' },
      { t: 'Regiões inguinais', texto: 'Canais inguinais com aspecto habitual bilateralmente, sem evidência de herniação de conteúdo abdominal, mesmo à manobra de Valsalva e em ortostatismo. Vasos epigástricos inferiores tópicos. Não há evidência de coleções, linfonodomegalias ou lesões expansivas nas regiões inguinais. Cordões espermáticos {de aspecto habitual|não aplicável}.',
        repetiveis: [ { botao: 'Adicionar hérnia', calc: null, texto: 'Hérnia inguinal {indireta (lateral aos vasos epigástricos inferiores)|direta (medial aos vasos epigástricos inferiores)|femoral (abaixo do ligamento inguinal)} à {direita|esquerda}, com colo medindo ___ mm e conteúdo {gorduroso|de alças intestinais|gorduroso e de alças}, {redutível|não redutível}, {evidente em repouso|evidenciada apenas à manobra de Valsalva/ortostatismo}, {sem|com} extensão à bolsa escrotal.' }, { botao: 'Adicionar linfonodo', calc: null, texto: 'Linfonodo inguinal {direito|esquerdo} de {aspecto habitual, com hilo preservado|aspecto atípico, com perda do hilo}, medindo ___ × ___ cm.' } ] },
      { t: 'Conclusão', chips: ['Exame ecográfico sem evidência de hérnias inguinais, mesmo às manobras provocativas.', 'Hérnia inguinal {indireta|direta} {redutível|não redutível} à {direita|esquerda}.', 'Hérnia femoral à {direita|esquerda}.', 'Linfonodomegalia inguinal de aspecto {reacional|atípico}.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Avaliação cirúrgica, a critério clínico.'] },
    ],
  },

  // ============ PELVE E GINECOLOGIA ============
  {
    id: 'pelve-feminina', nome: 'Pelve feminina', grupo: 'Pelve e ginecologia', transdutor: 'convexo', preco: 180,
    titulo: 'ULTRASSONOGRAFIA PÉLVICA VIA ABDOMINAL',
    fontes: ['MODELOS US/pelve fem normal.docx'],
    classificacoes: [{ nome: 'O-RADS US', quando: 'lesão anexial', app: 'calculado (próxima calculadora)' }, { nome: 'FIGO (miomas)', quando: 'mioma', app: 'chip' }],
    secoes: [
      { t: 'Indicação', chips: ['Rotina', 'Dor pélvica', 'Sangramento uterino anormal', 'Avaliação de massa pélvica', 'Controle de DIU'] },
      { t: 'Técnica', texto: TEC.convexo + ' Avaliação da pelve por via suprapúbica, com bexiga repleta, em caráter ' + CARATER + '.' },
      { t: 'Bexiga', texto: 'Bexiga urinária {repleta|pouco repleta} de conteúdo anecoico, com paredes finas e lisas, sem cálculos ou vegetações em seu interior.' },
      { t: 'Útero', texto: 'Útero em {anteversão|retroversão|medioversão}, com forma, dimensões e contornos preservados, ecotextura miometrial homogênea. Endométrio {hiperecoico e homogêneo|trilaminar|heterogêneo}.', medidas: [ { k: 'Útero (L × AP × T)', u: 'cm', dims: 3 }, { k: 'Volume uterino', u: 'cm³', dims: 0, auto: 'L × AP × T × 0,52' }, { k: 'Endométrio', u: 'mm', dims: 1 } ],
        repetiveis: [ { botao: 'Adicionar mioma', calc: 'figo', texto: 'Formação sólida {isoecoica|hipoecoica|heterogênea}, arredondada, de contornos regulares e limites definidos, {submucosa|intramural|subserosa|pediculada} em parede {anterior|posterior|fundo|lateral direita|lateral esquerda}, medindo ___ × ___ × ___ cm, compatível com leiomioma FIGO {0|1|2|3|4|5|6|7|8}.' } ] },
      { t: 'Ovários e anexos', texto: 'Ovários tópicos, com contornos regulares e ecotextura homogênea, apresentando folículos distribuídos pelo parênquima, de aspecto habitual. Ausência de lesões anexiais císticas ou sólidas e de líquido livre na pelve.', variantes: [ { n: 'Ovário não visibilizado', texto: 'Ovário {direito|esquerdo} não visibilizado devido a interposição gasosa.' } ], medidas: [ { k: 'Ovário direito', u: 'cm', dims: 3, auto: 'volume × 0,52' }, { k: 'Ovário esquerdo', u: 'cm', dims: 3, auto: 'volume × 0,52' } ],
        repetiveis: [ { botao: 'Adicionar lesão anexial', calc: 'orads', texto: 'Formação {cística unilocular de paredes finas e conteúdo anecoico|cística unilocular com ecos internos em padrão reticular|cística multilocular|cística com componente sólido|sólida} em região anexial {direita|esquerda}, medindo ___ × ___ × ___ cm, {sem|com} papilas, {sem fluxo|com fluxo escasso|com fluxo moderado|com fluxo abundante} ao Doppler (escore de cor {1|2|3|4}). O-RADS {1|2|3|4|5}.' } ] },
      { t: 'Conclusão', chips: ['Exame ecográfico dentro dos padrões de normalidade.', 'Leiomioma uterino FIGO ___ em parede ___.', 'Formação cística anexial {direita|esquerda}, compatível com {cisto simples|cisto hemorrágico|cisto dermoide}.', 'Ovário {direito|esquerdo} não visibilizado devido a interposição gasosa.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Complementação com ultrassonografia transvaginal.', 'Controle ecográfico em {6|8|12} semanas.'] },
    ],
  },
  {
    id: 'transvaginal', nome: 'Transvaginal', grupo: 'Pelve e ginecologia', transdutor: 'endocavitário', preco: 200,
    titulo: 'ULTRASSONOGRAFIA PÉLVICA TRANSVAGINAL',
    fontes: ['MODELOS US/TRANS/transvaginal normal.docx', 'transvaginal ALTERADO.docx', 'adenomiose difusa.docx', 'diu normo + cisto hemorrágico.docx', 'histerectomizada.docx', 'massa pélvica.docx', 'teratoma.docx'],
    classificacoes: [{ nome: 'O-RADS US', quando: 'toda lesão anexial', app: 'calculado (próxima calculadora)' }, { nome: 'FIGO (miomas)', quando: 'mioma', app: 'chip' }, { nome: 'Critérios MUSA (adenomiose)', quando: 'adenomiose', app: 'chips' }],
    secoes: [
      { t: 'Indicação', chips: ['Rotina', 'Dor pélvica', 'Sangramento uterino anormal', 'Controle de DIU', 'Infertilidade', 'Avaliação de massa anexial', 'Suspeita de endometriose'] },
      { t: 'Exames anteriores', texto: '{Sem exames anteriores para comparação.|Ultrassonografia anterior (___/____): sem alterações.|Ultrassonografia anterior (___/____): mioma.|Ultrassonografia anterior (___/____): cisto anexial.|Ultrassonografia anterior (___/____): adenomiose.}' },
      { t: 'Anamnese', texto: '{DUM ___/___/____.|Menopausa.} G___ P___ A___{, partos cesáreos|, partos vaginais|}.' },
      { t: 'Técnica', texto: TEC.endocav },
      { t: 'Útero', texto: 'Útero em {anteversão|retroversão|medioversão}, com eixo centrado, forma habitual e contornos {regulares|discretamente lobulados}. Miométrio de ecotextura homogênea. Endométrio {hiperecoico e homogêneo|trilaminar|heterogêneo}, medindo ___ mm de espessura. Colo uterino {sem alterações|com cistos de Naboth}.',
        variantes: [ { n: 'Adenomiose difusa', texto: 'Miométrio de ecotextura difusamente heterogênea, com assimetria de paredes, áreas hiperecogênicas produtoras de sombra acústica em leque e pequenos cistos miometriais, compatível com adenomiose difusa.' }, { n: 'Adenomiose focal', texto: 'Nota-se área hiperecogênica de contornos mal definidos em parede {anterior|posterior} do útero, contendo pequenos cistos miometriais, compatível com adenomiose focal.' }, { n: 'DIU', texto: 'DIU em topografia habitual, dentro da cavidade endometrial, com haste longitudinal medindo ~___ cm, situada a ~___ mm do orifício interno do colo uterino. Hastes laterais de aspecto habitual.' }, { n: 'Pós-histerectomia', texto: 'Não foram identificados o útero e o colo uterino na pelve, compatível com estado pós-histerectomia. Cúpula vaginal com aspecto habitual, sem formações expansivas ou coleções.' } ],
        medidas: [ { k: 'Útero (L × AP × T)', u: 'cm', dims: 3 }, { k: 'Volume uterino', u: 'cm³', dims: 0, auto: 'L × AP × T × 0,52' }, { k: 'Endométrio', u: 'mm', dims: 1, ref: 'pós-menopausa até 4–5 mm' } ],
        repetiveis: [ { botao: 'Adicionar mioma', calc: 'figo', texto: 'Formação sólida {isoecoica|hipoecoica|heterogênea}, {arredondada|lobulada}, de contornos regulares e limites definidos, {submucosa|intramural|subserosa|pediculada} em {parede anterior|parede posterior|fundo|parede lateral direita|parede lateral esquerda}, medindo ___ × ___ × ___ cm (~___ cm³), distando ___ mm do endométrio e ___ mm da serosa, compatível com leiomioma FIGO {0|1|2|3|4|5|6|7|8}.' } ] },
      { t: 'Ovários', texto: 'Ovário direito tópico, parauterino, com forma, textura e dimensões habituais. Ovário esquerdo tópico, parauterino, com forma, textura e dimensões habituais.', variantes: [ { n: 'Ovário não visibilizado', texto: 'Ovário {direito|esquerdo} não visibilizado ao presente exame{, provavelmente atrófico| devido a interposição gasosa}.' }, { n: 'Padrão policístico', texto: 'Ovários de volume aumentado, com múltiplos folículos periféricos (≥ 20 por ovário) e estroma central ecogênico, padrão morfológico policístico.' } ],
        medidas: [ { k: 'Ovário direito', u: 'cm', dims: 3, auto: 'volume × 0,52 · até 10 cm³' }, { k: 'Ovário esquerdo', u: 'cm', dims: 3, auto: 'volume × 0,52 · até 10 cm³' } ],
        repetiveis: [ { botao: 'Adicionar lesão anexial', calc: 'orads', texto: 'Formação {cística unilocular de paredes finas e lisas e conteúdo anecoico|cística unilocular com ecos internos em padrão reticular, sem papilas|cística com nódulo mural hiperecogênico e sombra acústica|cística multilocular|cística com componente sólido|sólida} em região anexial {direita|esquerda}, medindo ___ × ___ × ___ cm, {sem fluxo|com fluxo escasso|com fluxo moderado|com fluxo abundante} ao Doppler (escore de cor {1|2|3|4}), compatível com {cisto simples|cisto hemorrágico|cisto dermoide|endometrioma|lesão indeterminada}. O-RADS {1|2|3|4|5}.' } ] },
      { t: 'Cavidade pélvica', texto: 'Ausência de líquido livre em fundo de saco posterior.', variantes: [ { n: 'Líquido livre', texto: '{Pequena|Moderada|Grande} quantidade de líquido livre em fundo de saco posterior.' }, { n: 'Massa pélvica', texto: 'Presença de volumosa lesão {sólida|cística|heterogênea} ocupando a pelve, medindo ___ cm no maior eixo, que distorce a anatomia local e impossibilita a determinação da origem ao método.' } ] },
      { t: 'Conclusão', chips: ['Exame ecográfico dentro dos padrões de normalidade.', 'DIU normoposicionado.', 'Leiomioma FIGO ___ em parede ___.', 'Adenomiose {difusa|focal}.', 'Formação cística anexial {direita|esquerda}, compatível com {cisto simples|cisto hemorrágico|cisto dermoide|endometrioma}. O-RADS ___.', 'Estado pós-histerectomia, a correlacionar com antecedentes cirúrgicos.', 'Volumosa massa pélvica de origem indeterminada ao método.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Controle ecográfico em {6|8|12} semanas.', 'Complementação com ressonância magnética da pelve.', 'Correlação clínico-laboratorial.'] },
    ],
  },

  // ============ OBSTETRÍCIA ============
  {
    id: 'obstetrico', nome: 'Obstétrico simples', grupo: 'Obstetrícia', transdutor: 'convexo', preco: 250,
    titulo: 'ULTRASSONOGRAFIA OBSTÉTRICA',
    fontes: ['sem modelo .docx — rascunho novo, a validar com você'],
    classificacoes: [{ nome: 'Biometria (Hadlock) e peso fetal estimado', quando: 'sempre', app: 'calculado' }, { nome: 'Índice de líquido amniótico / maior bolsão', quando: 'sempre', app: 'medida' }, { nome: 'Grau placentário (Grannum)', quando: 'sempre', app: 'chip' }],
    secoes: [
      { t: 'Indicação', chips: ['Rotina pré-natal', 'Datação da gestação', 'Avaliação de vitalidade', 'Sangramento', 'Avaliação de crescimento fetal'] },
      { t: 'Técnica', texto: TEC.convexo + ' Avaliação por via abdominal{, complementada por via transvaginal|}.' },
      { t: 'Gestação', texto: 'Gestação {única|gemelar} tópica, com {um|dois} concepto(s) apresentando {atividade cardíaca presente, com frequência de ___ bpm|ausência de atividade cardíaca}, movimentos corporais {presentes|ausentes}. Apresentação {cefálica|pélvica|córmica}, dorso {à direita|à esquerda|anterior|posterior}.', medidas: [ { k: 'BCF', u: 'bpm', dims: 1, ref: '110–160' } ] },
      { t: 'Placenta, cordão e líquido', texto: 'Placenta {anterior|posterior|fúndica|lateral direita|lateral esquerda}, grau {0|I|II|III} de Grannum, {sem relação com|a ___ cm do} orifício interno do colo, de espessura habitual. Cordão umbilical com {três|dois} vasos, inserção placentária {central|marginal|velamentosa}. Líquido amniótico em quantidade {normal|reduzida|aumentada}.', medidas: [ { k: 'ILA', u: 'cm', dims: 1, ref: '8–24 cm' }, { k: 'Maior bolsão vertical', u: 'cm', dims: 1, ref: '2–8 cm' } ] },
      { t: 'Biometria', texto: 'Biometria fetal compatível com {idade gestacional pela DUM|idade gestacional pelo primeiro exame}.', medidas: [ { k: 'DBP', u: 'mm', dims: 1 }, { k: 'CC', u: 'mm', dims: 1 }, { k: 'CA', u: 'mm', dims: 1 }, { k: 'CF', u: 'mm', dims: 1 }, { k: 'Peso fetal estimado', u: 'g', dims: 0, auto: 'Hadlock (CC, CA, CF) · percentil' }, { k: 'Idade gestacional (US)', u: 'sem + dias', dims: 0, auto: 'média biométrica' } ] },
      { t: 'Anatomia (avaliação sumária)', texto: 'Crânio, coluna, tórax, coração (quatro câmaras), parede abdominal, estômago, bexiga, rins e membros {de aspecto habitual para a idade gestacional|conforme descrito}. Sexo fetal {masculino|feminino|não determinado}.' },
      { t: 'Colo uterino (quando avaliado)', texto: 'Colo uterino {fechado, medindo ___ mm|com afunilamento}.', medidas: [ { k: 'Colo', u: 'mm', dims: 1, ref: '≥ 25 mm' } ] },
      { t: 'Conclusão', chips: ['Gestação tópica, única, com feto vivo, de ___ semanas e ___ dias pela biometria atual.', 'Biometria fetal compatível com a idade gestacional.', 'Crescimento fetal {adequado|abaixo do percentil 10|acima do percentil 90} para a idade gestacional.', 'Líquido amniótico em quantidade {normal|reduzida (oligoâmnio)|aumentada (polidrâmnio)}.', 'Placenta {tópica|de inserção baixa|prévia}.'] },
      { t: 'Sugestão', chips: ['Seguimento pré-natal com médico assistente.', 'Ultrassonografia morfológica entre 20 e 24 semanas.', 'Controle de crescimento em ___ semanas.'] },
    ],
  },
  {
    id: 'doppler-obstetrico', nome: 'Doppler obstétrico', grupo: 'Obstetrícia', transdutor: 'convexo', preco: 300,
    titulo: 'ULTRASSONOGRAFIA OBSTÉTRICA COM DOPPLER',
    fontes: ['sem modelo .docx — rascunho novo, a validar com você'],
    classificacoes: [{ nome: 'Índices de pulsatilidade por idade gestacional (percentis)', quando: 'sempre', app: 'calculado' }, { nome: 'Relação cerebroplacentária (RCP)', quando: 'sempre', app: 'calculado' }],
    secoes: [
      { t: 'Indicação', chips: ['Avaliação de vitalidade fetal', 'Restrição de crescimento', 'Hipertensão gestacional / pré-eclâmpsia', 'Diabetes', 'Gestação gemelar', 'Rastreio no 1º trimestre'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor convexo multifrequencial, em modo B, Doppler colorido e pulsado, com insonação das artérias uterinas, artéria umbilical, artéria cerebral média e ducto venoso, com ângulo de insonação < 30° e feto em repouso.' },
      { t: 'Artérias uterinas', texto: 'Artérias uterinas com índices de pulsatilidade {dentro da normalidade|elevados} para a idade gestacional, {sem|com} incisura protodiastólica {unilateral|bilateral}.', medidas: [ { k: 'IP uterina direita', u: '', dims: 1 }, { k: 'IP uterina esquerda', u: '', dims: 1 }, { k: 'IP médio', u: '', dims: 0, auto: 'média · percentil por IG' } ] },
      { t: 'Artéria umbilical', texto: 'Artéria umbilical com fluxo de {baixa resistência e diástole positiva|resistência aumentada, diástole positiva|diástole zero|diástole reversa}.', medidas: [ { k: 'IP umbilical', u: '', dims: 1, auto: 'percentil por IG' } ] },
      { t: 'Artéria cerebral média', texto: 'Artéria cerebral média com {padrão de fluxo habitual|sinais de centralização hemodinâmica}.', medidas: [ { k: 'IP ACM', u: '', dims: 1, auto: 'percentil por IG' }, { k: 'VPS ACM', u: 'cm/s', dims: 1, auto: 'MoM por IG' }, { k: 'RCP (IP ACM / IP umbilical)', u: '', dims: 0, auto: 'calculado · anormal abaixo do percentil 5' } ] },
      { t: 'Ducto venoso', texto: 'Ducto venoso com onda {a positiva|a ausente|a reversa}.', medidas: [ { k: 'IP ducto venoso', u: '', dims: 1 } ] },
      { t: 'Conclusão', chips: ['Dopplervelocimetria materno-fetal dentro dos padrões de normalidade para a idade gestacional.', 'Aumento da resistência das artérias uterinas, {com|sem} incisura bilateral.', 'Aumento da resistência da artéria umbilical, com diástole {positiva|zero|reversa}.', 'Sinais de centralização hemodinâmica fetal.', 'Relação cerebroplacentária {normal|reduzida}.'] },
      { t: 'Sugestão', chips: ['Seguimento pré-natal com médico assistente.', 'Repetir Doppler em {1|2} semana(s).', 'Avaliação em pré-natal de alto risco.'] },
    ],
  },

  // ============ MAMA ============
  {
    id: 'mamas', nome: 'Mamas e axilas', grupo: 'Mama', transdutor: 'linear', preco: 200,
    titulo: 'ULTRASSONOGRAFIA DE MAMAS E AXILAS',
    fontes: ['MODELOS US/mama e axilas normal. birads2.docx'],
    classificacoes: [{ nome: 'BI-RADS (ACR, 5ª edição) — uma categoria por MAMA, só na conclusão', quando: 'sempre', app: 'sugerido pelo nódulo mais suspeito, você confirma' }, { nome: 'Composição do tecido', quando: 'sempre', app: 'chip' }],
    secoes: [
      { t: 'Indicação', chips: ['Rotina', 'Nódulo palpável', 'Dor mamária', 'Complementação de mamografia', 'Rastreamento em mama densa', 'Seguimento de nódulo'] },
      { t: 'Mamografia', texto: '{Mamografia (___/____): BI-RADS ___.|Refere mamografia prévia, não apresentada.|Não realizou mamografia.}' },
      { t: 'Anamnese', chips: ['Nega história familiar ou pessoal de câncer de mama, biópsias ou cirurgias mamárias prévias.', 'História familiar de câncer de mama em parente de {1º grau|2º grau}.', 'História pessoal de câncer de mama {tratado|em tratamento}.', 'Biópsia mamária prévia com resultado {benigno|maligno|não informado}.', 'Cirurgia mamária prévia: {prótese|quadrantectomia|mastectomia|nodulectomia}.', '{Pré-menopausa|Pós-menopausa, sem terapia hormonal|Pós-menopausa, em uso de terapia hormonal}.', 'Refere {nódulo palpável|dor mamária|descarga papilar} em mama {direita|esquerda}.', 'Gestação recente.', 'Em amamentação.'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor linear de alta frequência, com varredura radial e antirradial de ambas as mamas, regiões retroareolares e axilas.' },
      { t: 'Mamas', texto: 'Pele, tecido subcutâneo e complexo areolopapilar de aspecto habitual, sem alterações detectáveis. Mamas simétricas, de ecotextura {heterogênea|homogênea}, com predomínio de tecido {fibroglandular|gorduroso|fibroglandular e gorduroso}. Não há evidência de ectasia ductal.',
        variantes: [ { n: 'Ectasia ductal', texto: 'Nota-se em mama {direita|esquerda}, às ___ h, formação {anecoica|hipoecoica} tubular, com aspecto pseudonodular em alguns planos de insonação e comunicação demonstrável, compatível com ectasia ductal, calibre máximo ~___ mm.' }, { n: 'Alterações fibrocísticas', texto: 'Notam-se cistos simples esparsos em ambas as mamas, o maior em mama {direita|esquerda} às ___ h, medindo ___ mm, compatíveis com alterações fibrocísticas.' } ] },
      { t: 'Mama direita', texto: 'Não há evidência de nódulos, cistos ou distorções arquiteturais.',
        repetiveis: [ { botao: 'Adicionar nódulo', calc: 'birads', texto: 'N___, às ___ h, distando ___ cm do mamilo e ___ cm da pele: nódulo {hipoecoico|isoecoico|hiperecoico|heterogêneo|complexo cístico-sólido}, {oval|redondo|irregular}, {paralelo|não paralelo} à pele, com margens {circunscritas|indistintas|anguladas|microlobuladas|espiculadas}, {sem alteração acústica posterior|com reforço acústico posterior|com sombra acústica posterior}, {sem|com} calcificações, vascularização {ausente|central|periférica|central e periférica} ao Doppler. Mediu ___ × ___ × ___ cm.' }, { botao: 'Adicionar cisto', calc: null, texto: 'C___, às ___ h, distando ___ cm do mamilo e ___ cm da pele: cisto {simples, de paredes finas e conteúdo anecoico, com reforço acústico posterior|complicado, com ecos internos homogêneos, sem componente sólido}. Mediu ___ × ___ × ___ cm.' } ] },
      { t: 'Mama esquerda', texto: 'Não há evidência de nódulos, cistos ou distorções arquiteturais.',
        repetiveis: [ { botao: 'Adicionar nódulo', calc: 'birads', texto: 'N___, às ___ h, distando ___ cm do mamilo e ___ cm da pele: nódulo {hipoecoico|isoecoico|hiperecoico|heterogêneo|complexo cístico-sólido}, {oval|redondo|irregular}, {paralelo|não paralelo} à pele, com margens {circunscritas|indistintas|anguladas|microlobuladas|espiculadas}, {sem alteração acústica posterior|com reforço acústico posterior|com sombra acústica posterior}, {sem|com} calcificações, vascularização {ausente|central|periférica|central e periférica} ao Doppler. Mediu ___ × ___ × ___ cm.' }, { botao: 'Adicionar cisto', calc: null, texto: 'C___, às ___ h, distando ___ cm do mamilo e ___ cm da pele: cisto {simples, de paredes finas e conteúdo anecoico, com reforço acústico posterior|complicado, com ecos internos homogêneos, sem componente sólido}. Mediu ___ × ___ × ___ cm.' } ] },
      { t: 'Axilas', texto: 'Cadeia linfonodal axilar direita: {não há evidência de linfonodomegalias|linfonodo de aspecto reacional, com hilo preservado|linfonodo de aspecto atípico, com perda do hilo}. Cadeia linfonodal axilar esquerda: {não há evidência de linfonodomegalias|linfonodo de aspecto reacional, com hilo preservado|linfonodo de aspecto atípico, com perda do hilo}. Cadeias paraesternais: não há evidência de linfonodomegalias.', repetiveis: [ { botao: 'Adicionar linfonodo', calc: null, texto: 'Linfonodo axilar {direito|esquerdo} de {aspecto habitual, com hilo preservado|cortical espessada (___ mm), com hilo preservado|aspecto atípico, arredondado, com perda do hilo}, medindo ___ × ___ cm.' } ] },
      { t: 'Conclusão', chips: ['Exame ecográfico dentro dos padrões de normalidade. BI-RADS US 1 bilateralmente.', 'Mama direita: {exame dentro dos padrões de normalidade. BI-RADS US 1|cisto simples. BI-RADS US 2|nódulo sólido de aspecto provavelmente benigno. BI-RADS US 3|nódulo sólido com características suspeitas. BI-RADS US 4A|nódulo sólido com características suspeitas. BI-RADS US 4B|nódulo sólido com características suspeitas. BI-RADS US 4C|nódulo sólido altamente suspeito. BI-RADS US 5}.', 'Mama esquerda: {exame dentro dos padrões de normalidade. BI-RADS US 1|cisto simples. BI-RADS US 2|nódulo sólido de aspecto provavelmente benigno. BI-RADS US 3|nódulo sólido com características suspeitas. BI-RADS US 4A|nódulo sólido com características suspeitas. BI-RADS US 4B|nódulo sólido com características suspeitas. BI-RADS US 4C|nódulo sólido altamente suspeito. BI-RADS US 5}.', 'Ectasia ductal em mama {direita|esquerda}.'] },
      { t: 'Sugestão', chips: ['Rastreamento de rotina conforme faixa etária.', 'Controle ecográfico em 6 meses.', 'Estudo histopatológico por biópsia percutânea guiada por ultrassonografia.', 'Correlação com mamografia.'] },
    ],
  },

  // ============ TIREOIDE E CERVICAL ============
  {
    id: 'tireoide', nome: 'Tireóide', grupo: 'Tireoide e cervical', transdutor: 'linear', preco: 150,
    titulo: 'ULTRASSONOGRAFIA DA TIREOIDE',
    fontes: ['MODELOS US/Tireóide e cervical/TIREOIDE SEM ALTERAÇÕES.docx', 'tireóide normal.docx', 'tireóide bócio.docx', 'TIREOIDECTOMIZADO.docx', 'Notion › Sistematização › Tireoide e cervical (modelo mestre)'],
    classificacoes: [{ nome: 'ACR TI-RADS — categoria e conduta por nódulo', quando: 'todo nódulo', app: 'calculado' }, { nome: 'Volume tireoidiano (elipsoide)', quando: 'sempre', app: 'calculado' }],
    secoes: [
      { t: 'Indicação', chips: ['Rotina', 'Acompanhamento', 'Nódulo suspeito', 'Pós-operatório', 'Vigilância ativa', 'Alteração de função tireoidiana'] },
      { t: 'Exames anteriores', texto: '{Sem exames anteriores para comparação.|Ultrassonografia anterior (___/____): ___ nódulo(s), o maior medindo ___ cm.|Ultrassonografia anterior (___/____): sem nódulos.}' },
      { t: 'Anamnese', chips: ['Nega história familiar de câncer de tireoide.', 'História familiar de câncer de tireoide{ em parente de 1º grau|}.', 'Nódulos tireoidianos em acompanhamento há anos.', 'Tireoidectomia prévia, {por câncer|por doença benigna}.', 'Em uso de levotiroxina ___ mcg.', 'Refere {pigarro|rouquidão|disfagia|falta de ar}.'] },
      { t: 'Técnica', texto: 'Ultrassonografia realizada com transdutor linear de alta frequência, com varreduras longitudinais, transversais e oblíquas sobre a região cervical anterior.' },
      { t: 'Glândula', texto: 'Glândula tireoide tópica, {simétrica|discretamente assimétrica|assimétrica}, com dimensões {habituais|discretamente aumentadas|aumentadas|reduzidas}, superfície {regular|lobulada|irregular} e ecotextura {homogênea|discretamente heterogênea|heterogênea}, móvel à deglutição, sem evidência de formações nodulares.',
        variantes: [ { n: 'Tireoidite crônica', texto: 'Glândula tireoide tópica, simétrica, discretamente hipoecogênica, com dimensões {habituais|aumentadas|reduzidas}, superfície {regular|lobulada} e ecotextura heterogênea, com áreas hipoecoicas esparsas pelo parênquima e traves fibrosas de permeio, móvel à deglutição.' }, { n: 'Bócio', texto: 'Glândula tireoide tópica, de dimensões aumentadas, {simétrica|assimétrica às custas de aumento predominante do lobo direito|assimétrica às custas de aumento predominante do lobo esquerdo}, contornos lobulados e ecotextura heterogênea, móvel à deglutição{, com prolongamento caudal do lobo ___ sugerindo componente mergulhante|}.' }, { n: 'Pós-tireoidectomia', texto: 'Ausência de tecido tireoidiano visualizado em topografia habitual, achado compatível com estado pós-tireoidectomia total. Leito cirúrgico sem evidência de formações nodulares sólidas ou císticas, nem coleções líquidas.' } ],
        medidas: [ { k: 'Istmo', u: 'cm', dims: 3 }, { k: 'Lobo direito', u: 'cm', dims: 3 }, { k: 'Lobo esquerdo', u: 'cm', dims: 3 }, { k: 'Volume total', u: 'mL', dims: 0, auto: 'soma dos lobos (L × AP × T × 0,52) · até ~18 mL (mulher) / 25 mL (homem)' } ],
        repetiveis: [ { botao: 'Adicionar nódulo', calc: 'tirads', texto: 'Nódulo {sólido|misto|espongiforme|cístico}, {hipoecoico|isoecoico|hiperecoico|muito hipoecoico|anecoico}, {mais largo que alto|mais alto que largo}, de margens {lisas|mal definidas|lobuladas|irregulares}, {sem focos ecogênicos|com microcalcificações|com macrocalcificações|com calcificação periférica|com artefatos em cauda de cometa}, no terço {superior|médio|inferior} do lobo {direito|esquerdo|istmo}, medindo ___ × ___ × ___ cm. ACR TI-RADS ___. (No laudo entram só as características que pontuam; a composição entra sempre.)' } ] },
      { t: 'Paratireoides', texto: 'Paratireoides não visibilizadas ao método.', variantes: [ { n: 'Paratireoide visibilizada', texto: 'Paratireoide visibilizada adjacente ao terço {superior|inferior} do lobo {direito|esquerdo}, de aspecto {habitual|aumentada|liposubstituída}, medindo ___ × ___ × ___ cm.' } ] },
      { t: 'Regiões peritireoidianas e linfonodos', texto: 'Regiões peritireoidianas sem alterações detectáveis. Cadeias linfonodais cervicais sem evidência de linfonodomegalias ou linfonodos com critérios de suspeição.', repetiveis: [ { botao: 'Adicionar linfonodo', calc: null, texto: 'Linfonodo em nível {I|II|III|IV|V|VI|VII} {direito|esquerdo}, de formato {ovalado|arredondado}, com hilo ecogênico {preservado|apagado}, {sem|com} microcalcificações ou áreas císticas, medindo ___ × ___ × ___ cm, {sem|com} critérios ultrassonográficos de suspeição.' } ] },
      { t: 'Comentários', chips: ['Em relação ao exame anterior ({data}), {sem alteração significativa|houve aumento|houve redução} das dimensões do nódulo.', 'Nódulo pequeno (< 1 cm) em topografia de difícil acesso.', 'Achado incidental.'] },
      { t: 'Conclusão', chips: ['Exame ultrassonográfico da tireoide dentro dos padrões de normalidade, sem evidência de nódulos.', 'Nódulo tireoidiano ACR TI-RADS ___ em lobo ___, {com indicação de PAAF|com indicação de seguimento por imagem|sem indicação de PAAF ou seguimento}.', 'Múltiplos nódulos tireoidianos, conforme descrito.', 'Bócio {difuso|multinodular}{, com possível componente mergulhante|}.', 'Achados compatíveis com tireoidopatia difusa crônica, correlacionar com dados clínico-laboratoriais.', 'Estado pós-tireoidectomia total, sem evidência de recidiva local.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Novo exame em até {6|12|24} meses.', 'PAAF guiada por ultrassonografia do nódulo ___.', 'Correlação clínico-laboratorial.', 'Tomografia computadorizada do pescoço e tórax para avaliação da extensão inferior.'] },
    ],
  },
  {
    id: 'tireoide-doppler', nome: 'Tireóide com Doppler', grupo: 'Tireoide e cervical', transdutor: 'linear', preco: 180, herda: 'tireoide',
    titulo: 'ULTRASSONOGRAFIA DA TIREOIDE COM DOPPLER',
    fontes: ['Herda o modelo Tireóide + seção Doppler do modelo mestre (Notion)'],
    classificacoes: [{ nome: 'ACR TI-RADS', quando: 'todo nódulo', app: 'calculado' }, { nome: 'Padrão vascular de Chammas (I–V)', quando: 'nódulo ao Doppler', app: 'chip' }],
    secoes: [
      { t: 'Estudo Doppler da glândula', texto: 'Ao estudo Doppler: {sem alterações detectáveis|aumento difuso da vascularização parenquimatosa}.', variantes: [ { n: 'Inferno tireoidiano', texto: 'Ao estudo Doppler colorido, acentuado aumento difuso da vascularização parenquimatosa ("inferno tireoidiano"), com velocidades de pico sistólico elevadas nas artérias tireoidianas {superiores|inferiores} (___ cm/s).' } ] },
      { t: 'Doppler de cada nódulo', texto: 'Cada nódulo ganha um descritor próprio, com 3 opções e possibilidade de marcar central e periférica juntas: vascularização {ausente|central|periférica|central e periférica} ao Doppler.' },
    ],
  },
  {
    id: 'cervical', nome: 'Cervical e salivares', grupo: 'Tireoide e cervical', transdutor: 'linear', preco: 150,
    titulo: 'ULTRASSONOGRAFIA CERVICAL E DE GLÂNDULAS SALIVARES',
    fontes: ['MODELOS US/Tireóide e cervical/CERVICAL + SALIVARES.docx', 'SEGUIMENTO PÓS CANCER.docx', 'Notion › Sistematização › Bateu o olho › CERVICAL'],
    classificacoes: [{ nome: 'Níveis cervicais I–VII e critérios de suspeição linfonodal', quando: 'todo linfonodo descrito', app: 'chips' }],
    secoes: [
      { t: 'Indicação', chips: ['Avaliação cervical', 'Nódulo cervical', 'Acompanhamento', 'Vigilância oncológica', 'Aumento de glândula salivar', 'Dor ou sinais inflamatórios'] },
      { t: 'Técnica', texto: 'Ultrassonografia realizada com transdutor linear de alta frequência, com varreduras longitudinais, transversais e oblíquas sobre as regiões cervicais anterior e laterais e sobre as glândulas salivares.' },
      { t: 'Regiões cervicais', texto: 'Avaliação das regiões cervicais anterior e laterais, sem evidência de massas sólidas ou císticas profundas, nem coleções líquidas nos planos musculares superficiais.', variantes: [ { n: 'Leito tireoidiano (pós-tireoidectomia)', texto: 'Ausência de tecido tireoidiano em topografia habitual, compatível com estado pós-tireoidectomia total. Leito cirúrgico sem formações nodulares ou coleções.' } ], repetiveis: [ { botao: 'Adicionar lesão cervical', calc: null, texto: 'Lesão {cística|sólida|heterogênea} em região cervical {anterior|lateral direita|lateral esquerda|submandibular|supraclavicular}, {no plano subcutâneo|no plano muscular|profunda}, medindo ___ × ___ × ___ cm, {sem|com} fluxo ao Doppler, compatível com {cisto|lipoma|linfonodo|lesão indeterminada}.' } ] },
      { t: 'Linfonodos cervicais', texto: 'Cadeias linfonodais cervicais avaliadas nos níveis I a VII. Os linfonodos visibilizados apresentam dimensões dentro do habitual, formato ovalado, contornos regulares e hilo ecogênico preservado, sem critérios ultrassonográficos de suspeição.', repetiveis: [ { botao: 'Adicionar linfonodo', calc: null, texto: 'Linfonodo em nível {I|II|III|IV|V|VI|VII} {direito|esquerdo}, de formato {ovalado|arredondado}, com hilo ecogênico {preservado|apagado}, cortical {fina e homogênea|espessada|heterogênea}, {sem|com} microcalcificações ou áreas císticas, vascularização {hilar|periférica|mista} ao Doppler, medindo ___ × ___ × ___ cm, {sem|com} critérios ultrassonográficos de suspeição.' } ] },
      { t: 'Glândulas salivares', texto: 'Glândulas parótidas, submandibulares e sublinguais com morfologia, dimensões e ecotextura habituais, sem evidência de lesões focais sólidas ou císticas ou de litíase ductal.', variantes: [ { n: 'Sialoadenite', texto: 'Glândula {parótida|submandibular} {direita|esquerda} aumentada, hipoecogênica e heterogênea, com aumento da vascularização ao Doppler, compatível com processo inflamatório agudo.' } ], repetiveis: [ { botao: 'Adicionar lesão salivar', calc: null, texto: 'Na glândula {parótida|submandibular|sublingual} {direita|esquerda}, {imagem hiperecoica com sombra acústica posterior no ducto, compatível com sialolitíase|nódulo hipoecoico de contornos regulares|nódulo heterogêneo de contornos lobulados|nódulo de contornos irregulares}, medindo ___ × ___ × ___ cm, {sem|com} dilatação ductal a montante, {sem|com} fluxo ao Doppler.' } ] },
      { t: 'Exames anteriores', texto: '{Sem exames anteriores para comparação.|Ultrassonografia anterior (___/____): {sem linfonodos suspeitos|linfonodo em nível ___ medindo ___ cm}.}' },
      { t: 'Anamnese', chips: ['Nega história familiar de câncer de tireoide.', 'Tireoidectomia prévia, {por câncer|por doença benigna}.', 'Em uso de levotiroxina ___ mcg.', 'Refere {pigarro|rouquidão|disfagia|falta de ar|nódulo cervical palpável}.'] },
      { t: 'Conclusão', chips: ['Exame ultrassonográfico cervical e das glândulas salivares dentro dos padrões de normalidade, sem evidência de linfonodos atípicos ou lesões focais.', 'Linfonodo cervical em nível ___ {de aspecto reacional|com critérios ultrassonográficos de suspeição}.', 'Sialolitíase em glândula {parótida|submandibular} {direita|esquerda}.', 'Sialoadenite {parotídea|submandibular} {direita|esquerda}.', 'Estado pós-tireoidectomia total, sem evidência de recidiva local nem de linfonodos suspeitos.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Seguimento conforme protocolo oncológico.', 'PAAF guiada por ultrassonografia do linfonodo em nível ___, com dosagem de tireoglobulina no lavado.', 'Correlação com tireoglobulina e anticorpos antitireoglobulina.', 'Controle ecográfico em {3|6} meses.'] },
    ],
  },
  {
    id: 'cervical-doppler', nome: 'Cervical e salivares com Doppler', grupo: 'Tireoide e cervical', transdutor: 'linear', preco: 180, herda: 'cervical',
    titulo: 'ULTRASSONOGRAFIA CERVICAL E DE GLÂNDULAS SALIVARES COM DOPPLER',
    fontes: ['Herda o modelo Cervical e salivares + seção Doppler'],
    classificacoes: [{ nome: 'Padrão de vascularização linfonodal (hilar / periférica / mista)', quando: 'todo linfonodo descrito', app: 'chip' }],
    secoes: [
      { t: 'Estudo Doppler', texto: 'Ao estudo Doppler colorido, os linfonodos visibilizados apresentam vascularização {hilar habitual|periférica|mista}, e as glândulas salivares apresentam vascularização {habitual|aumentada}.' },
    ],
  },

  // ============ VASCULAR ============
  {
    id: 'carotidas', nome: 'Doppler Carótidas', grupo: 'Vascular', transdutor: 'linear', preco: 300,
    titulo: 'ECOGRAFIA DOPPLER DE CARÓTIDAS E VERTEBRAIS',
    fontes: ['MODELOS US/Carótidas normal.docx', 'Carótidas muitas placas.docx', 'Carótidas difícil.docx'],
    classificacoes: [{ nome: 'Grau de estenose da carótida interna por NASCET (DIC/CBR/SBACV 2023: < 50% · 50–59% · 60–69% · 70–79% · 80–89% · > 90% · oclusão)', quando: 'placa com redução luminal', app: 'calculado (VPS, VDF, relação ACI/ACC)' }, { nome: 'Morfologia da placa (tipos I–V)', quando: 'toda placa', app: 'chip' }, { nome: 'Espessura médio-intimal', quando: 'quando solicitado (não é rotina)', app: 'medida' }],
    secoes: [
      { t: 'Indicação', chips: ['Rastreamento de aterosclerose', 'Sopro cervical', 'AVC / AIT prévio', 'Tontura / síncope', 'Pré-operatório', 'Controle de placa conhecida'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor linear multifrequencial sobre a região cervical, em modo B, Doppler colorido e Doppler pulsado, com avaliação das artérias carótidas comuns, internas e externas e das artérias vertebrais, bilateralmente.' },
      { t: 'Carótidas à direita', texto: 'Artérias carótida comum, interna e externa com trajeto, calibre e morfologia habituais. Fluxo com sentido fisiológico. Estudo Doppler pulsado demonstrou padrão de fluxo preservado, sem evidência de alterações hemodinamicamente significativas.', medidas: [ { k: 'Complexo médio-intimal D', u: 'mm', dims: 1, ref: 'até 0,9 mm' } ] },
      { t: 'Carótidas à esquerda', texto: 'Artérias carótida comum, interna e externa com trajeto, calibre e morfologia habituais. Fluxo com sentido fisiológico. Estudo Doppler pulsado demonstrou padrão de fluxo preservado, sem evidência de alterações hemodinamicamente significativas.', medidas: [ { k: 'Complexo médio-intimal E', u: 'mm', dims: 1, ref: 'até 0,9 mm' } ],
        repetiveis: [ { botao: 'Adicionar placa', calc: 'estenose-aci', texto: 'Placa {hiperecoica e homogênea|hipoecoica|heterogênea|calcificada, com sombra acústica posterior}, de superfície {lisa|irregular|ulcerada}, em parede {posterior|anterior|lateral} {do bulbo carotídeo|da carótida comum|da origem da carótida interna|da carótida externa} {direita|esquerda}, medindo ~___ × ___ mm, {sem determinar redução significativa do lúmen|determinando estenose estimada de ___% (VPS ___ cm/s, VDF ___ cm/s, relação ACI/ACC ___)}.' } ] },
      { t: 'Artérias vertebrais', texto: 'Artérias vertebrais com fluxos preservados e em sentido cefálico, bilateralmente.', variantes: [ { n: 'Roubo de subclávia', texto: 'Artéria vertebral {direita|esquerda} com fluxo {bidirecional|invertido (sentido caudal)}, sugestivo de fenômeno de roubo da subclávia {parcial|completo}.' }, { n: 'Não visibilizada', texto: 'Artéria vertebral {direita|esquerda} não caracterizada ao método.' } ] },
      { t: 'Velocidades (cm/s)', tabela: { colunas: ['VPS', 'VDF', 'IR'], linhas: ['Carótida comum direita', 'Carótida interna direita', 'Carótida externa direita', 'Vertebral direita', 'Carótida comum esquerda', 'Carótida interna esquerda', 'Carótida externa esquerda', 'Vertebral esquerda'] } },
      { t: 'Conclusão', chips: ['Exame ecográfico das artérias carótidas e vertebrais dentro dos padrões de normalidade.', 'Espessamento médio-intimal {à direita|à esquerda|bilateral}, sem placas.', 'Placa(s) ateromatosa(s) {ecogênica(s)|calcificada(s)} focal(is) em bulbo carotídeo {direito|esquerdo|bilateralmente}, sem repercussão hemodinâmica significativa (estenose < 50%).', 'Estenose de {50–69%|≥ 70%} da artéria carótida interna {direita|esquerda}.', 'Oclusão da artéria carótida interna {direita|esquerda}.', 'Não foi possível avaliação de todos os segmentos e velocidades devido a dificuldade técnica.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Controle ecográfico em {6|12} meses.', 'Avaliação com cirurgia vascular.', 'Complementação com angiotomografia.'] },
    ],
  },
  {
    id: 'doppler-hepatico', nome: 'Doppler Hepático', grupo: 'Vascular', transdutor: 'convexo', preco: 300,
    titulo: 'ULTRASSONOGRAFIA DE ABDOME SUPERIOR COM DOPPLER HEPÁTICO',
    fontes: ['Notion › Sistematização › Roteiro Doppler hepático (sem modelo .docx — rascunho novo)'],
    classificacoes: [{ nome: 'Sinais de hipertensão portal (calibre e velocidade da porta, sentido de fluxo, colaterais, esplenomegalia, ascite)', quando: 'hepatopatia', app: 'chips' }, { nome: 'Índice de resistência da artéria hepática', quando: 'sempre', app: 'medida' }],
    secoes: [
      { t: 'Indicação', chips: ['Hepatopatia crônica / cirrose', 'Suspeita de hipertensão portal', 'Pós-transplante hepático', 'Suspeita de trombose portal', 'Avaliação de shunt (TIPS)'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor convexo multifrequencial, em modo B, Doppler colorido e Doppler pulsado, com avaliação do parênquima hepático, veia porta e ramos, veias hepáticas, artéria hepática, veia esplênica, veia cava inferior e pesquisa de circulação colateral, com correção de ângulo ≤ 60°.' },
      FIGADO, PANCREAS_BACO,
      { t: 'Veia porta', texto: 'Veia porta pérvia, com calibre {preservado|aumentado}, fluxo {hepatopetal|hepatofugal|bidirecional}, {monofásico com discreta ondulação respiratória|contínuo}, velocidade máxima {preservada|reduzida}.', medidas: [ { k: 'Calibre da veia porta', u: 'mm', dims: 1, ref: 'até 12–13 mm' }, { k: 'Velocidade máxima', u: 'cm/s', dims: 1, ref: 'acima de 15 cm/s' } ], variantes: [ { n: 'Trombose portal', texto: 'Veia porta com material ecogênico endoluminal, {sem fluxo|com fluxo periférico residual} ao Doppler, {ocupando parcialmente|ocupando totalmente} o lúmen, compatível com trombose {parcial|total}{, com transformação cavernomatosa|}.' } ] },
      { t: 'Veias hepáticas e cava', texto: 'Veias hepáticas pérvias, com calibre preservado e padrão espectral {trifásico|bifásico|monofásico}. Veia cava inferior de calibre preservado, com variação respiratória.', variantes: [ { n: 'Monofásico', texto: 'Veias hepáticas com padrão espectral monofásico, achado inespecífico que pode se associar a hepatopatia crônica.' } ] },
      { t: 'Artéria hepática', texto: 'Artéria hepática pérvia, com fluxo de {baixa resistência e padrão espectral habitual|resistência aumentada|resistência reduzida}.', medidas: [ { k: 'VPS artéria hepática', u: 'cm/s', dims: 1 }, { k: 'IR artéria hepática', u: '', dims: 1, ref: '0,55–0,70' } ] },
      { t: 'Veia esplênica e colaterais', texto: 'Veia esplênica pérvia, com calibre {preservado|aumentado} e fluxo hepatopetal. Não há evidência de circulação colateral portossistêmica.', medidas: [ { k: 'Calibre da veia esplênica', u: 'mm', dims: 1, ref: 'até 10 mm' } ], variantes: [ { n: 'Colaterais', texto: 'Observam-se vasos colaterais portossistêmicos {na região do hilo esplênico|periesofágicos|em veia paraumbilical recanalizada|em veias gástricas curtas}, com fluxo hepatofugal.' } ] },
      { t: 'Conclusão', chips: ['Estudo Doppler do sistema porta dentro dos padrões de normalidade.', 'Sinais ultrassonográficos de hepatopatia crônica, {sem|com} sinais de hipertensão portal ({calibre portal aumentado|velocidade portal reduzida|fluxo hepatofugal|circulação colateral|esplenomegalia|ascite}).', 'Trombose {parcial|total} da veia porta.', 'Veias hepáticas com padrão monofásico.', 'Índice de resistência da artéria hepática {normal|aumentado|reduzido}.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (hepatologia).', 'Correlação clínico-laboratorial.', 'Complementação com elastografia hepática.', 'Complementação com angiotomografia ou angiorressonância.'] },
    ],
  },
  {
    id: 'doppler-renal', nome: 'Doppler Renal', grupo: 'Vascular', transdutor: 'convexo', preco: 300,
    titulo: 'ULTRASSONOGRAFIA DE RINS COM DOPPLER DAS ARTÉRIAS RENAIS',
    fontes: ['Notion › Sistematização › Roteiro Doppler renal (sem modelo .docx — rascunho novo)'],
    classificacoes: [{ nome: 'Critérios de estenose de artéria renal (VPS > 180–200 cm/s, RAR > 3,5, tardus-parvus)', quando: 'sempre', app: 'calculado' }, { nome: 'Índice de resistência intrarrenal (nefropatia parenquimatosa se > 0,80)', quando: 'sempre', app: 'calculado' }],
    secoes: [
      { t: 'Indicação', chips: ['Hipertensão arterial de difícil controle', 'Suspeita de estenose de artéria renal', 'Insuficiência renal', 'Assimetria renal', 'Pós-transplante renal', 'Controle de stent / angioplastia'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor convexo multifrequencial, em modo B, Doppler colorido e Doppler pulsado, com avaliação da aorta abdominal, das artérias renais principais (óstio, segmentos proximal, médio e distal) e das artérias segmentares/interlobares nos terços superior, médio e inferior de cada rim, com correção de ângulo ≤ 60°.' },
      RINS,
      { t: 'Aorta', texto: 'Aorta abdominal com calibre preservado, sem placas ou dilatações no segmento avaliado.', medidas: [ { k: 'VPS aorta (nível das renais)', u: 'cm/s', dims: 1 }, { k: 'Calibre da aorta', u: 'mm', dims: 1, ref: 'até 30 mm' } ] },
      { t: 'Artéria renal direita', texto: 'Artéria renal direita {visibilizada em toda a extensão|parcialmente visibilizada}, pérvia, com calibre preservado, fluxo laminar e padrão espectral de baixa resistência, sem aliasing ou turbulência.', medidas: [ { k: 'VPS óstio / proximal', u: 'cm/s', dims: 1, ref: 'até 180 cm/s' }, { k: 'VPS médio / distal', u: 'cm/s', dims: 1 }, { k: 'RAR (VPS renal / VPS aorta)', u: '', dims: 0, auto: 'calculado · até 3,5' } ] },
      { t: 'Artéria renal esquerda', texto: 'Artéria renal esquerda {visibilizada em toda a extensão|parcialmente visibilizada}, pérvia, com calibre preservado, fluxo laminar e padrão espectral de baixa resistência, sem aliasing ou turbulência.', medidas: [ { k: 'VPS óstio / proximal', u: 'cm/s', dims: 1, ref: 'até 180 cm/s' }, { k: 'VPS médio / distal', u: 'cm/s', dims: 1 }, { k: 'RAR', u: '', dims: 0, auto: 'calculado · até 3,5' } ] },
      { t: 'Artérias intrarrenais', texto: 'Artérias segmentares e interlobares com padrão espectral habitual, ascensão sistólica rápida, sem padrão tardus-parvus, bilateralmente.', medidas: [ { k: 'IR rim direito (sup / méd / inf)', u: '', dims: 3, ref: 'até 0,70; > 0,80 sugere nefropatia parenquimatosa' }, { k: 'IR rim esquerdo (sup / méd / inf)', u: '', dims: 3 }, { k: 'Tempo de aceleração', u: 'ms', dims: 1, ref: 'até 70 ms' } ] },
      { t: 'Conclusão', chips: ['Estudo Doppler das artérias renais dentro dos padrões de normalidade, sem sinais de estenose hemodinamicamente significativa.', 'Sinais de estenose hemodinamicamente significativa da artéria renal {direita|esquerda} (VPS ___ cm/s, RAR ___).', 'Padrão tardus-parvus nas artérias intrarrenais {à direita|à esquerda}, sugestivo de estenose proximal.', 'Índices de resistência intrarrenais elevados bilateralmente, sugerindo nefropatia parenquimatosa.', 'Artéria renal {direita|esquerda} não visibilizada adequadamente devido a interposição gasosa.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (nefrologia).', 'Complementação com angiotomografia ou angiorressonância das artérias renais.', 'Correlação clínico-laboratorial.'] },
    ],
  },

  // ============ BOLSA ESCROTAL ============
  {
    id: 'bolsa-escrotal', nome: 'Bolsa escrotal com Doppler', grupo: 'Bolsa escrotal', transdutor: 'linear', preco: 200,
    titulo: 'ULTRASSONOGRAFIA DA BOLSA ESCROTAL COM DOPPLER',
    fontes: ['MODELOS US/Bolsa Testicular/bolsa escrotal com Doppler.docx', 'bolsa escrotal epididimite.docx'],
    classificacoes: [{ nome: 'Volume testicular (Lambert: L × AP × T × 0,71)', quando: 'sempre', app: 'calculado' }, { nome: 'Varicocele (calibre > 3 mm e refluxo ao Valsalva)', quando: 'dilatação do plexo', app: 'chips' }],
    secoes: [
      { t: 'Indicação', chips: ['Dor escrotal aguda', 'Aumento de volume escrotal', 'Nódulo testicular', 'Infertilidade / varicocele', 'Trauma', 'Rotina'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor linear de alta frequência, em modo B e Doppler colorido, com avaliação comparativa dos testículos, epidídimos e cordões espermáticos, em repouso e à manobra de Valsalva, em caráter ' + CARATER + '.' },
      { t: 'Testículos', texto: 'Testículos em topografia habitual, simétricos, com contornos regulares, ecotextura homogênea e vascularização preservada e simétrica ao estudo Doppler.', variantes: [ { n: 'Torção', texto: 'Testículo {direito|esquerdo} aumentado, {hipoecoico|heterogêneo}, com {ausência|acentuada redução} de fluxo ao Doppler colorido e pulsado, e cordão espermático com aspecto espiralado ("sinal do redemoinho"), compatível com torção testicular.' }, { n: 'Orquite', texto: 'Testículo {direito|esquerdo} aumentado, hipoecoico e heterogêneo, com aumento da vascularização ao Doppler, compatível com orquite.' }, { n: 'Microlitíase', texto: 'Múltiplos focos ecogênicos puntiformes sem sombra acústica, esparsos pelo parênquima testicular {bilateral|direito|esquerdo}, compatíveis com microlitíase testicular.' } ], medidas: [ { k: 'Testículo direito', u: 'cm', dims: 3, auto: 'volume (× 0,71) · 12–25 mL' }, { k: 'Testículo esquerdo', u: 'cm', dims: 3, auto: 'volume (× 0,71)' } ],
        repetiveis: [ { botao: 'Adicionar lesão testicular', calc: null, texto: 'Lesão {sólida hipoecoica|sólida heterogênea|cística de conteúdo anecoico|com calcificações} {intratesticular|extratesticular} à {direita|esquerda}, medindo ___ × ___ × ___ cm, {sem|com} fluxo ao Doppler.' } ] },
      { t: 'Epidídimos', texto: 'Epidídimos com morfologia, dimensões e ecotextura habituais, bilateralmente.', variantes: [ { n: 'Epididimite', texto: 'Epidídimo {direito|esquerdo} {discretamente|acentuadamente} aumentado, espessado, hipoecoico e heterogêneo, com vascularização aumentada ao estudo Doppler, compatível com processo inflamatório ativo.' }, { n: 'Cisto de epidídimo', texto: 'Formação cística de paredes finas e conteúdo anecoico na {cabeça|corpo|cauda} do epidídimo {direito|esquerdo}, medindo ___ mm, compatível com cisto de epidídimo / espermatocele.' } ] },
      { t: 'Cordões e bolsa', texto: 'Cordões espermáticos com aspecto habitual. Plexos pampiniformes com veias de calibre preservado, sem refluxo à manobra de Valsalva. Ausência de hidrocele. Paredes escrotais de espessura habitual.', variantes: [ { n: 'Hidrocele', texto: '{Discreta|Moderada|Volumosa} hidrocele à {direita|esquerda|bilateral}{, com septos e debris|}.' }, { n: 'Varicocele', texto: 'Dilatação das veias do plexo pampiniforme à {esquerda|direita|bilateral}, com calibre máximo de ___ mm {em repouso|à manobra de Valsalva}, com refluxo {ausente|à manobra de Valsalva|espontâneo}, compatível com varicocele.' } ] },
      { t: 'Conclusão', chips: ['Exame ecográfico da bolsa escrotal dentro dos padrões de normalidade.', 'Epididimite à {direita|esquerda}, com {pequena|moderada} hidrocele reacional.', 'Orquiepididimite à {direita|esquerda}.', 'Sinais de torção testicular à {direita|esquerda}.', 'Varicocele à {esquerda|direita|bilateral}.', 'Hidrocele {discreta|moderada|volumosa} à {direita|esquerda}.', 'Microlitíase testicular {bilateral|unilateral}.', 'Lesão {intratesticular|extratesticular} à {direita|esquerda}, conforme descrito.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (urologia).', 'Avaliação urológica de urgência.', 'Controle ecográfico em {2|4|6} semanas.', 'Correlação com marcadores tumorais.'] },
    ],
  },

  // ============ PARTES MOLES ============
  {
    id: 'partes-moles', nome: 'Partes moles', grupo: 'Partes moles', transdutor: 'linear', preco: 150,
    titulo: 'ULTRASSONOGRAFIA DE PARTES MOLES',
    fontes: ['sem modelo .docx — rascunho novo, com o padrão de descrição dos seus laudos MSK'],
    classificacoes: [],
    secoes: [
      { t: 'Indicação', chips: ['Nódulo palpável', 'Abaulamento', 'Dor localizada', 'Suspeita de coleção / abscesso', 'Corpo estranho', 'Trauma'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor linear de alta frequência sobre a região {___}, em modo B e Doppler colorido, com comparação contralateral quando aplicável.' },
      { t: 'Região avaliada', texto: 'Pele e tecido celular subcutâneo com espessura e ecogenicidade preservadas. Planos musculares íntegros, com trofismo e padrão fibrilar habituais. Não há evidência de coleções, lesões expansivas sólidas ou císticas, ou linfonodomegalias na região avaliada.', variantes: [ { n: 'Celulite', texto: 'Pele e tecido celular subcutâneo com espessamento difuso e aumento da ecogenicidade, com líquido de permeio entre os lóbulos gordurosos, sem coleção organizada, compatível com processo inflamatório de partes moles (celulite).' } ],
        repetiveis: [ { botao: 'Adicionar lesão', calc: null, texto: 'Lesão {sólida hiperecogênica homogênea, de limites definidos|sólida hipoecoica|cística de paredes finas e conteúdo anecoico|cística de conteúdo espesso/debris|heterogênea com debris e paredes espessas|linear hiperecoica com sombra ou reverberação} no plano {subcutâneo|muscular|subfascial} da região ___, medindo ___ × ___ × ___ cm, {sem fluxo|com fluxo periférico|com fluxo central} ao Doppler, {compressível|não compressível}, compatível com {lipoma|cisto epidérmico|coleção/abscesso|hematoma|linfonodo|corpo estranho|lesão indeterminada}.' } ] },
      { t: 'Conclusão', chips: ['Exame ecográfico de partes moles da região ___ dentro dos padrões de normalidade.', 'Lipoma subcutâneo na região ___.', 'Cisto epidérmico na região ___.', 'Coleção organizada na região ___, compatível com abscesso.', 'Celulite na região ___, sem coleção organizada.', 'Corpo estranho na região ___, a ___ mm da pele.'] },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente.', 'Avaliação cirúrgica, a critério clínico.', 'Controle ecográfico em ___ semanas.'] },
    ],
  },

  // ============ MUSCULOESQUELÉTICO ============
  {
    id: 'ombro', nome: 'Ombro', grupo: 'Musculoesquelético', transdutor: 'linear', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DO OMBRO {DIREITO|ESQUERDO}',
    fontes: ['MODELOS US/Articulações/ombro normal base.docx', 'ombro tendinopatia.docx', 'articulacao base.docx'],
    classificacoes: [{ nome: 'Rotura do manguito: parcial (bursal / articular / intrassubstancial) ou completa; extensão em mm', quando: 'rotura', app: 'chips + medida' }],
    secoes: [
      { t: 'Indicação', chips: ['Dor no ombro', 'Suspeita de lesão do manguito rotador', 'Limitação de movimento', 'Trauma', 'Bursite'] },
      { t: 'Técnica', texto: TEC.msk },
      PELE_MSK,
      { t: 'Tendões e manguito', texto: 'Tendão da cabeça longa do bíceps braquial íntegro, ocupando o sulco bicipital, sem líquido em sua bainha. Tendões subescapular, supraespinhal, infraespinhal e redondo menor com espessura, contornos e ecotextura preservados, sem evidência de roturas. Ventres musculares com trofismo preservado.', variantes: [ { n: 'Tendinopatia', texto: 'Tendão(ões) {supraespinhal|subescapular|infraespinhal|supraespinhal e subescapular} espessado(s) e hipoecoico(s), com perda do padrão fibrilar habitual, compatível com tendinopatia, sem evidência de roturas.' }, { n: 'Rotura parcial', texto: 'Rotura parcial {da face bursal|da face articular|intrassubstancial} do tendão {supraespinhal|subescapular|infraespinhal}, caracterizada por área hipoecoica/anecoica de descontinuidade fibrilar, medindo ___ × ___ mm, {sem|com} retração.' }, { n: 'Rotura completa', texto: 'Rotura completa do tendão {supraespinhal|subescapular}, com descontinuidade total das fibras, retração do coto em ___ cm e {ausência|presença} de líquido na bursa.' }, { n: 'Calcificação', texto: 'Calcificação intratendínea no tendão {supraespinhal|infraespinhal|subescapular}, medindo ___ mm, {com|sem} sombra acústica, compatível com tendinopatia calcária.' }, { n: 'Bíceps', texto: 'Tendão da cabeça longa do bíceps {com líquido em sua bainha (tenossinovite)|subluxado medialmente|não caracterizado no sulco, compatível com rotura}.' } ] },
      { t: 'Bursas e articulações', texto: 'Bursa subacromial-subdeltoidea com espessura normal, sem líquido em seu interior. Não há evidência de derrame articular glenoumeral. Articulação acromioclavicular sem alterações significativas. Cabeça umeral de contornos regulares.', variantes: [ { n: 'Bursite', texto: 'Bursa subacromial-subdeltoidea distendida por líquido {anecoico|com debris}, com espessura de ___ mm, compatível com bursite.' }, { n: 'Derrame', texto: 'Derrame articular glenoumeral {discreto|moderado|acentuado}.' }, { n: 'Acromioclavicular', texto: 'Articulação acromioclavicular com {irregularidades ósseas|distensão capsular|osteófitos}, compatível com artropatia degenerativa.' } ] },
      { t: 'Conclusão', chips: CONCL_MSK('ombro').concat(['Tendinopatia do supraespinhal {e subescapular|}.', 'Rotura {parcial|completa} do tendão supraespinhal.', 'Bursite subacromial-subdeltoidea.', 'Tendinopatia calcária do ___.']) },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (ortopedia).', 'Correlação clínica.', 'Complementação com ressonância magnética, a critério clínico.'] },
    ],
  },
  {
    id: 'cotovelo', nome: 'Cotovelo', grupo: 'Musculoesquelético', transdutor: 'linear', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DO COTOVELO {DIREITO|ESQUERDO}',
    fontes: ['MODELOS US/Articulações/cotovelo rotura bíceps distal.docx', 'articulacao base.docx'],
    classificacoes: [],
    secoes: [
      { t: 'Indicação', chips: ['Dor lateral (epicondilite)', 'Dor medial', 'Suspeita de rotura do bíceps distal', 'Trauma', 'Neuropatia ulnar'] },
      { t: 'Técnica', texto: TEC.msk },
      PELE_MSK,
      { t: 'Tendões', texto: 'Tendão comum dos extensores (epicôndilo lateral) e tendão comum dos flexores (epicôndilo medial) com espessura, contornos e ecotextura preservados. Tendões do tríceps braquial e do bíceps distal com espessura, contornos e arranjo fibrilar preservados. Não há coleções peritendíneas.', variantes: [ { n: 'Epicondilite lateral', texto: 'Tendão comum dos extensores espessado, hipoecoico e heterogêneo na inserção no epicôndilo lateral, {sem|com} descontinuidade fibrilar, {sem|com} calcificações, {sem|com} irregularidade cortical, compatível com tendinopatia insercional (epicondilite lateral).' }, { n: 'Epicondilite medial', texto: 'Tendão comum dos flexores espessado e hipoecoico na inserção no epicôndilo medial, compatível com tendinopatia insercional (epicondilite medial).' }, { n: 'Rotura bíceps distal', texto: 'Rotura {completa|parcial} do tendão do bíceps braquial em sua inserção distal, caracterizada por descontinuidade {total|parcial} das fibras {e retração do coto em ~___ cm, com sombra acústica posterior|}.' } ] },
      { t: 'Articulação e nervo ulnar', texto: 'Fossas coronoide e olecraniana livres, com contornos corticais preservados, sem derrame articular. Nervo ulnar com morfologia, contornos e ecogenicidade normais no túnel cubital, sem subluxação à flexão.', variantes: [ { n: 'Derrame', texto: 'Derrame articular {discreto|moderado|acentuado}, distendendo o recesso {anterior|posterior}.' }, { n: 'Neuropatia ulnar', texto: 'Nervo ulnar espessado e hipoecoico no túnel cubital, com área de secção transversa de ___ mm², {sem|com} subluxação à flexão.' }, { n: 'Bursite olecraniana', texto: 'Bursa olecraniana distendida por líquido {anecoico|com debris/septos}, medindo ___ × ___ cm.' } ] },
      { t: 'Conclusão', chips: CONCL_MSK('cotovelo').concat(['Tendinopatia insercional do tendão comum dos extensores (epicondilite lateral).', 'Tendinopatia insercional do tendão comum dos flexores (epicondilite medial).', 'Rotura distal do bíceps, {sem|com} derrame articular significativo.', 'Bursite olecraniana.']) },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (ortopedia).', 'Correlação clínica.', 'Complementação com ressonância magnética, a critério clínico.'] },
    ],
  },
  {
    id: 'punho', nome: 'Punho unilateral', grupo: 'Musculoesquelético', transdutor: 'linear', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DO PUNHO {DIREITO|ESQUERDO}',
    fontes: ['MODELOS US/Articulações/articulacao base.docx (punho, 2 versões)'],
    classificacoes: [{ nome: 'Área de secção transversa do nervo mediano (síndrome do túnel do carpo se > 10 mm²)', quando: 'sempre que houver queixa de parestesia', app: 'medida' }],
    secoes: [
      { t: 'Indicação', chips: ['Dor no punho', 'Parestesia / suspeita de túnel do carpo', 'Tumoração (cisto sinovial)', 'Tenossinovite de De Quervain', 'Trauma'] },
      { t: 'Técnica', texto: TEC.msk },
      PELE_MSK,
      { t: 'Face dorsal', texto: '1º compartimento: tendões abdutor longo e extensor curto do polegar com calibre, contornos e ecotextura normais. 2º compartimento: tendões extensores radiais longo e curto do carpo de aspecto habitual. 3º compartimento: tendão extensor longo do polegar sem alterações junto ao tubérculo de Lister. 4º compartimento: tendões extensores comuns dos dedos e extensor próprio do indicador sem sinais de tenossinovite. 5º compartimento: tendão extensor próprio do 5º dedo de aspecto normal. 6º compartimento: tendão extensor ulnar do carpo de aspecto habitual.', variantes: [ { n: 'De Quervain', texto: 'Tendões do 1º compartimento extensor espessados e hipoecoicos, com líquido e espessamento do retináculo (___ mm), compatível com tenossinovite estenosante de De Quervain.' }, { n: 'Tenossinovite', texto: 'Tendão(ões) do ___º compartimento com líquido na bainha e {sem|com} espessamento sinovial, compatível com tenossinovite.' } ] },
      { t: 'Face ventral e túnel do carpo', texto: 'Túnel do carpo sem alterações ecográficas em seus componentes (nervo mediano, tendões flexores superficiais e profundos dos dedos e flexor longo do polegar), sem abaulamento do retináculo flexor. Nervo mediano com morfologia, contornos, ecotextura e espessura normais. Tendões flexores com espessura, contornos e aspecto fibrilar preservados.', medidas: [ { k: 'Área do nervo mediano (entrada do túnel)', u: 'mm²', dims: 1, ref: 'até 10 mm²' } ], variantes: [ { n: 'Túnel do carpo', texto: 'Nervo mediano espessado e hipoecoico proximalmente ao túnel do carpo, com área de secção transversa de ___ mm² e achatamento no interior do túnel, {sem|com} abaulamento do retináculo flexor, achados compatíveis com síndrome do túnel do carpo.' } ] },
      { t: 'Articulação e outros', texto: 'Ausência de derrame articular radiocárpico. Ausência de nódulos, cistos ou líquido livre.', repetiveis: [ { botao: 'Adicionar cisto / lesão', calc: null, texto: 'Formação cística {unilocular|multilocular} de paredes finas e conteúdo {anecoico|espesso}, na face {dorsal|ventral} do punho, {com|sem} comunicação demonstrável com a articulação {radiocárpica|escafossemilunar}, medindo ___ × ___ × ___ cm, compatível com cisto sinovial (ganglion).' } ] },
      { t: 'Conclusão', chips: CONCL_MSK('punho').concat(['Achados compatíveis com síndrome do túnel do carpo (área do nervo mediano de ___ mm²).', 'Tenossinovite de De Quervain.', 'Cisto sinovial (ganglion) na face {dorsal|ventral} do punho.']) },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (ortopedia).', 'Correlação clínica e com eletroneuromiografia.', 'Complementação com ressonância magnética, a critério clínico.'] },
    ],
  },
  {
    id: 'punhos-bilateral', nome: 'Punhos bilateral', grupo: 'Musculoesquelético', transdutor: 'linear', preco: 220, herda: 'punho',
    titulo: 'ULTRASSONOGRAFIA DOS PUNHOS',
    fontes: ['Mesmo modelo do punho unilateral, aplicado comparativamente aos dois lados'],
    classificacoes: [{ nome: 'Área do nervo mediano por lado', quando: 'sempre', app: 'medida' }],
    secoes: [
      { t: 'Técnica', texto: 'Exame realizado com transdutor linear de alta frequência, com avaliação estática, dinâmica e comparativa de ambos os punhos.' },
      { t: 'Estrutura do laudo', texto: 'As seções do modelo Punho são repetidas para o punho direito e para o punho esquerdo, e a conclusão é dada por lado.' },
      { t: 'Conclusão', chips: ['Exame ecográfico de ambos os punhos dentro dos padrões de normalidade.', 'Achados compatíveis com síndrome do túnel do carpo {bilateral|à direita|à esquerda} (área do nervo mediano: D ___ mm² · E ___ mm²).'] },
    ],
  },
  {
    id: 'mao-dedos', nome: 'Mão e dedos', grupo: 'Musculoesquelético', transdutor: 'linear', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DA MÃO {DIREITA|ESQUERDA}',
    fontes: ['MODELOS US/Articulações/articulacao base.docx (mão)'],
    classificacoes: [],
    secoes: [
      { t: 'Indicação', chips: ['Dor / dedo em gatilho', 'Tumoração', 'Trauma', 'Artrite', 'Corpo estranho'] },
      { t: 'Técnica', texto: TEC.msk },
      PELE_MSK,
      { t: 'Tendões e polias', texto: 'Tendões flexores e extensores com aspecto habitual, sem alterações significativas às manobras dinâmicas. Polias anulares {A1|A2} sem espessamento. Não são observadas alterações peritendíneas ou periarticulares. Musculatura intrínseca com aspecto ecográfico preservado.', variantes: [ { n: 'Dedo em gatilho', texto: 'Polia A1 do ___º dedo espessada (___ mm), hipoecoica, com {líquido na bainha|espessamento} dos tendões flexores subjacentes e bloqueio ao deslizamento à manobra dinâmica, compatível com tenossinovite estenosante (dedo em gatilho).' }, { n: 'Tenossinovite', texto: 'Tendões flexores do ___º dedo com líquido na bainha e {sem|com} espessamento sinovial, compatível com tenossinovite.' }, { n: 'Rotura', texto: 'Descontinuidade das fibras do tendão {flexor|extensor} do ___º dedo ao nível da falange {proximal|média|distal}, com retração de ___ cm.' } ] },
      { t: 'Articulações', texto: 'Articulações metacarpofalangianas e interfalangianas sem derrame, sinovite ou erosões corticais nos segmentos avaliados.', variantes: [ { n: 'Sinovite', texto: 'Articulação {metacarpofalangiana|interfalangiana proximal|interfalangiana distal} do ___º dedo com {derrame|espessamento sinovial hipoecoico}, {sem|com} fluxo ao Doppler de amplificação, {sem|com} erosões corticais.' } ], repetiveis: [ { botao: 'Adicionar lesão', calc: null, texto: 'Formação {cística|sólida hipoecoica|sólida heterogênea} junto {à bainha do tendão flexor|à polia|à articulação} do ___º dedo, medindo ___ × ___ × ___ cm, {sem|com} fluxo ao Doppler, compatível com {cisto sinovial|tumor de células gigantes da bainha tendínea|corpo estranho|lesão indeterminada}.' } ] },
      { t: 'Conclusão', chips: CONCL_MSK('mão').concat(['Tenossinovite estenosante do ___º dedo (dedo em gatilho).', 'Sinovite da articulação ___ do ___º dedo.', 'Cisto sinovial junto ao ___.']) },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (ortopedia).', 'Correlação clínica.'] },
    ],
  },
  {
    id: 'quadril', nome: 'Quadril', grupo: 'Musculoesquelético', transdutor: 'linear', preco: 220,
    titulo: 'ULTRASSONOGRAFIA DO QUADRIL {DIREITO|ESQUERDO}',
    fontes: ['MODELOS US/Articulações/articulacao base.docx (quadril)'],
    classificacoes: [],
    secoes: [
      { t: 'Indicação', chips: ['Dor lateral do quadril (trocantérica)', 'Dor inguinal', 'Suspeita de derrame / sinovite', 'Ressalto', 'Trauma'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor {linear|convexo} de alta frequência, com avaliação estática e dinâmica dos compartimentos anterior, lateral e posterior do quadril, comparativa quando aplicável.' },
      PELE_MSK,
      { t: 'Compartimento anterior', texto: 'Recesso articular anterior sem derrame ou espessamento sinovial. Tendão do iliopsoas com morfologia, contornos e ecotextura preservados, sem bursite. Superfícies ósseas da cortical acetabular e femoral de contornos regulares.', variantes: [ { n: 'Derrame', texto: 'Derrame articular {discreto|moderado|acentuado}, com distância cápsula-colo de ___ mm.' }, { n: 'Bursite iliopsoas', texto: 'Bursa do iliopsoas distendida por líquido, medindo ___ × ___ cm.' } ], medidas: [ { k: 'Distância cápsula-colo', u: 'mm', dims: 1, ref: 'até 7 mm ou diferença < 2 mm entre os lados' } ] },
      { t: 'Compartimento lateral', texto: 'Tendões do glúteo mínimo e do glúteo médio com morfologia, contornos, ecogenicidade e ecotextura preservados, com inserções trocantéricas íntegras. Bursas trocantérica e subglúteas com espessuras normais, sem líquido. Trato iliotibial sem alterações, sem ressalto à manobra dinâmica.', variantes: [ { n: 'Tendinopatia glútea', texto: 'Tendão do glúteo {médio|mínimo|médio e mínimo} espessado e hipoecoico na inserção trocantérica, {sem|com} descontinuidade fibrilar {parcial|completa}, {sem|com} irregularidade cortical, compatível com tendinopatia {insercional|com rotura parcial}.' }, { n: 'Bursite trocantérica', texto: 'Bursa trocantérica distendida por líquido, medindo ___ × ___ cm, compatível com bursite.' } ] },
      { t: 'Compartimento posterior', texto: 'Tendões isquiotibiais com inserção isquiática íntegra. Planos musculares glúteos com morfologia e trofismo conservados.' },
      { t: 'Conclusão', chips: CONCL_MSK('quadril').concat(['Tendinopatia glútea {média|mínima} {com|sem} rotura parcial.', 'Bursite trocantérica.', 'Derrame articular coxofemoral.']) },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (ortopedia).', 'Correlação clínica.', 'Complementação com ressonância magnética, a critério clínico.'] },
    ],
  },
  {
    id: 'joelho', nome: 'Joelho', grupo: 'Musculoesquelético', transdutor: 'linear', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DO JOELHO {DIREITO|ESQUERDO}',
    fontes: ['MODELOS US/Articulações/joelho normal.docx', 'joelho tendinopatia.docx', 'articulacao base.docx'],
    classificacoes: [],
    secoes: [
      { t: 'Indicação', chips: ['Dor no joelho', 'Suspeita de derrame', 'Cisto poplíteo', 'Tendinopatia patelar / quadricipital', 'Trauma', 'Lesão de ligamento colateral'] },
      { t: 'Técnica', texto: 'Exame realizado com transdutor linear de alta frequência, com avaliação estática e dinâmica dos quatro compartimentos do joelho, em caráter ' + CARATER + '.' },
      PELE_MSK,
      { t: 'Compartimento anterior', texto: 'Tendão do quadríceps, tendão patelar e gordura infrapatelar (Hoffa) com aspecto preservado. Recesso suprapatelar sem derrame.', variantes: [ { n: 'Tendinopatia quadricipital', texto: 'Tendão do quadríceps espessado e hipoecoico próximo à inserção patelar, com área heterogênea junto à êntese, predominando nas fibras {mediais|centrais|laterais}, sem evidência de rotura, compatível com tendinopatia insercional.' }, { n: 'Tendinopatia patelar', texto: 'Tendão patelar espessado e hipoecoico em seu terço {proximal|médio|distal}, {sem|com} descontinuidade fibrilar, {sem|com} neovascularização ao Doppler, compatível com tendinopatia.' }, { n: 'Derrame', texto: 'Derrame articular {discreto|moderado|acentuado}, distendendo o recesso suprapatelar{, com deslocamento da gordura de Hoffa|}.' }, { n: 'Bursite', texto: 'Bursa {pré-patelar|infrapatelar superficial|infrapatelar profunda} distendida por líquido, compatível com bursite.' } ] },
      { t: 'Compartimento medial', texto: 'Ligamento colateral medial, corno anterior do menisco medial e região da pata de ganso sem alterações ecográficas significativas.', variantes: [ { n: 'Lesão LCM', texto: 'Ligamento colateral medial espessado e hipoecoico em sua porção {proximal|média|distal}, {sem|com} descontinuidade fibrilar, compatível com lesão grau {I|II|III}.' }, { n: 'Pata de ganso', texto: 'Bursa anserina distendida por líquido, compatível com bursite da pata de ganso.' }, { n: 'Menisco', texto: 'Extrusão do corno {anterior|posterior} do menisco medial de ___ mm, {sem|com} cisto parameniscal.' } ] },
      { t: 'Compartimento lateral', texto: 'Ligamento colateral lateral, trato iliotibial e tendão bicipital com características preservadas.', variantes: [ { n: 'Trato iliotibial', texto: 'Trato iliotibial espessado e hipoecoico ao nível do epicôndilo lateral, com líquido subjacente, compatível com síndrome do atrito.' } ] },
      { t: 'Compartimento posterior', texto: 'Fossa poplítea livre, sem cisto poplíteo. Feixe vascular poplíteo conservado.', variantes: [ { n: 'Cisto de Baker', texto: 'Formação cística {unilocular|multilocular} entre o gastrocnêmio medial e o semimembranoso, com comunicação com a articulação, conteúdo {anecoico|com debris/septos}, medindo ___ × ___ × ___ cm, compatível com cisto poplíteo (Baker){, com sinais de rotura|}.' } ] },
      { t: 'Conclusão', chips: CONCL_MSK('joelho').concat(['Derrame articular {discreto|moderado} no compartimento anterior.', 'Tendinopatia insercional do tendão do quadríceps.', 'Tendinopatia patelar.', 'Cisto poplíteo (Baker) {íntegro|roto}.', 'Lesão grau {I|II|III} do ligamento colateral medial.', 'Bursite anserina.']) },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (ortopedia).', 'Correlação clínica.', 'Complementação com ressonância magnética para avaliação de meniscos e ligamentos cruzados, a critério clínico.'] },
    ],
  },
  {
    id: 'tornozelo', nome: 'Tornozelo', grupo: 'Musculoesquelético', transdutor: 'linear', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DO TORNOZELO {DIREITO|ESQUERDO}',
    fontes: ['MODELOS US/Articulações/tornozelo.docx', 'Perna TennisLeg.docx', 'articulacao base.docx'],
    classificacoes: [],
    secoes: [
      { t: 'Indicação', chips: ['Entorse', 'Dor no tendão calcâneo', 'Dor plantar', 'Suspeita de rotura', 'Derrame / sinovite', 'Trauma'] },
      { t: 'Técnica', texto: TEC.msk },
      PELE_MSK,
      { t: 'Compartimento medial', texto: 'Tendões tibial posterior, flexor longo dos dedos e flexor longo do hálux com espessura habitual, contornos regulares e arranjo fibrilar preservado, sem líquido nas bainhas. Ligamento deltoide íntegro.', variantes: [ { n: 'Tenossinovite tibial posterior', texto: 'Tendão tibial posterior {espessado e hipoecoico|com líquido na bainha}, {sem|com} descontinuidade fibrilar, compatível com {tendinopatia|tenossinovite}.' } ] },
      { t: 'Compartimento lateral', texto: 'Tendões fibulares com características ecográficas habituais, sem subluxação à manobra dinâmica. Ligamentos talofibular anterior e calcaneofibular íntegros.', variantes: [ { n: 'Lesão ligamentar', texto: 'Ligamento {talofibular anterior|calcaneofibular} espessado e hipoecoico, {sem|com} descontinuidade fibrilar {parcial|completa}, compatível com lesão {aguda|crônica/cicatricial}.' } ] },
      { t: 'Compartimento anterior e articulação', texto: 'Tendões extensores sem alterações. Recesso articular tibiotalar anterior sem derrame ou sinovite.', variantes: [ { n: 'Derrame', texto: 'Derrame articular tibiotalar {discreto|moderado|acentuado}.' } ] },
      { t: 'Compartimento posterior e planta', texto: 'Tendão calcâneo com espessura e estrutura fibrilar habituais, sem líquido na bursa retrocalcânea. Fáscia plantar com espessura e ecotextura preservadas na inserção calcânea.', medidas: [ { k: 'Tendão calcâneo (AP)', u: 'mm', dims: 1, ref: 'até 6 mm' }, { k: 'Fáscia plantar (inserção)', u: 'mm', dims: 1, ref: 'até 4 mm' } ], variantes: [ { n: 'Tendinopatia calcânea', texto: 'Tendão calcâneo espessado (___ mm), hipoecoico e heterogêneo em seu terço {médio|distal/insercional}, {sem|com} áreas de descontinuidade fibrilar, {sem|com} neovascularização ao Doppler, compatível com tendinopatia.' }, { n: 'Rotura calcâneo', texto: 'Rotura {parcial intrassubstancial, acometendo cerca de ___% da área do tendão, principalmente fibras {centrais|superficiais|profundas}|completa, com descontinuidade total das fibras e gap de ___ cm} do tendão calcâneo, a ___ cm da inserção.' }, { n: 'Fascite plantar', texto: 'Fáscia plantar espessada (___ mm) e hipoecoica na inserção calcânea, {sem|com} esporão de calcâneo, compatível com fascite plantar.' }, { n: 'Tennis leg', texto: 'Rotura do gastrocnêmio medial com desinserção mioaponeurótica distal e retração das fibras em aproximadamente ___ cm, associada a coleção {anecoica|heterogênea} entre o gastrocnêmio medial e o solear, medindo ___ × ___ cm.' } ] },
      { t: 'Conclusão', chips: CONCL_MSK('tornozelo').concat(['Rotura parcial intrassubstancial do tendão calcâneo.', 'Tendinopatia do tendão calcâneo.', 'Fascite plantar.', 'Lesão {parcial|completa} do ligamento talofibular anterior.', 'Rotura da cabeça medial do gastrocnêmio, com retração distal de ___ cm.']) },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (ortopedia).', 'Correlação clínica.', 'Complementação com ressonância magnética, a critério clínico.'] },
    ],
  },
  {
    id: 'pe', nome: 'Pé', grupo: 'Musculoesquelético', transdutor: 'linear', preco: 180,
    titulo: 'ULTRASSONOGRAFIA DO PÉ {DIREITO|ESQUERDO}',
    fontes: ['MODELOS US/Articulações/articulacao base.docx (pé)'],
    classificacoes: [],
    secoes: [
      { t: 'Indicação', chips: ['Dor plantar', 'Metatarsalgia / neuroma', 'Tumoração', 'Corpo estranho', 'Trauma'] },
      { t: 'Técnica', texto: TEC.msk },
      { t: 'Pé', texto: 'Pele e tecido subcutâneo sem alterações. Espaços interdigitais analisados sem coleções ou lesões expansivas sólidas ou císticas. Musculatura intrínseca com aspecto ecográfico preservado. Fáscia plantar com espessura e ecogenicidade normais. Tendões flexores e extensores dos dedos com aspecto habitual. Articulações metatarsofalangianas sem derrame ou sinovite.', medidas: [ { k: 'Fáscia plantar (inserção)', u: 'mm', dims: 1, ref: 'até 4 mm' } ], variantes: [ { n: 'Neuroma de Morton', texto: 'No ___º espaço intermetatarsal, formação hipoecoica ovalada, não compressível, medindo ___ × ___ mm, com sinal de Mulder {positivo|negativo}, compatível com neuroma de Morton.' }, { n: 'Bursite intermetatarsal', texto: 'Distensão líquida da bursa intermetatarsal do ___º espaço, medindo ___ mm.' }, { n: 'Fascite plantar', texto: 'Fáscia plantar espessada (___ mm) e hipoecoica na inserção calcânea, compatível com fascite plantar.' } ], repetiveis: [ { botao: 'Adicionar lesão', calc: null, texto: 'Lesão {cística|sólida hipoecoica|sólida heterogênea|linear hiperecoica} no plano {subcutâneo|plantar|dorsal} da região ___, medindo ___ × ___ mm, {sem|com} fluxo ao Doppler, compatível com {cisto sinovial|fibroma plantar|corpo estranho|lesão indeterminada}.' } ] },
      { t: 'Conclusão', chips: CONCL_MSK('pé').concat(['Neuroma de Morton no ___º espaço intermetatarsal.', 'Fascite plantar.', 'Fibroma plantar.', 'Corpo estranho na região ___.']) },
      { t: 'Sugestão', chips: ['Acompanhamento com médico assistente (ortopedia).', 'Correlação clínica.'] },
    ],
  },

  // ============ PROCEDIMENTOS ============
  {
    id: 'paaf', nome: 'PAAF (cervical, salivares e tireóide)', grupo: 'Procedimentos', transdutor: 'linear', preco: 500,
    titulo: 'PUNÇÃO ASPIRATIVA POR AGULHA FINA GUIADA POR ULTRASSONOGRAFIA',
    fontes: ['Laudo de procedimento — sem modelo .docx, rascunho novo. Conta 1 por paciente, não por nódulo.', 'Emitido JUNTO com o laudo de US de tireoide/cervical: o app gera os dois documentos de uma vez; este reaproveita a descrição do nódulo puncionado e acrescenta as frases padrão.'],
    classificacoes: [{ nome: 'ACR TI-RADS do nódulo-alvo (a indicação da PAAF depende dele)', quando: 'tireoide', app: 'calculado' }, { nome: 'Bethesda (resultado citológico, chega depois)', quando: 'resultado', app: 'campo a preencher no retorno' }],
    secoes: [
      { t: 'Indicação', chips: ['Nódulo tireoidiano ACR TI-RADS {3|4|5}', 'Linfonodo cervical suspeito', 'Nódulo de glândula salivar', 'Nódulo em leito tireoidiano (suspeita de recidiva)'] },
      { t: 'Consentimento e preparo', texto: 'Paciente esclarecido(a) sobre o procedimento, riscos e benefícios, com termo de consentimento assinado. {Não faz uso|Faz uso, com suspensão orientada,} de anticoagulantes ou antiagregantes. Antissepsia da região cervical com clorexidina alcoólica.' },
      { t: 'Técnica', texto: 'Sob orientação ultrassonográfica em tempo real com transdutor linear de alta frequência, {sem anestesia|com anestesia local (lidocaína 2% sem vasoconstritor)}, realizadas ___ punções com agulha fina {25G|23G|27G}, técnica {de capilaridade|aspirativa}, em cada alvo. Material distribuído em lâminas ({fixadas em álcool|secas ao ar}) e em meio líquido para citologia, identificado e encaminhado ao laboratório {___|escolhido pelo(a) paciente, com termo de entrega de amostra}.' },
      { t: 'Alvos', texto: 'Um bloco por nódulo puncionado.', repetiveis: [ { botao: 'Adicionar alvo', calc: 'tirads', texto: 'Alvo {1|2|3}: nódulo {sólido|misto|espongiforme} no terço {superior|médio|inferior} do lobo {direito|esquerdo|istmo} / linfonodo em nível ___ / nódulo em glândula ___, medindo ___ × ___ × ___ cm, ACR TI-RADS ___, {___ punções|abordagem do componente sólido}.' } ] },
      { t: 'Intercorrências', chips: ['Procedimento realizado sem intercorrências.', 'Discreto sangramento local, contido com compressão.', 'Dor local transitória.', 'Reação vasovagal, revertida com medidas de suporte.', 'Pequeno hematoma cervical, sem necessidade de intervenção.'] },
      { t: 'Orientações', texto: 'Paciente liberado(a) em bom estado geral, orientado(a) sobre compressão local, sinais de alerta e retorno com o resultado citológico ao médico assistente.' },
      { t: 'Conclusão', chips: ['Realizada PAAF guiada por ultrassonografia de nódulo tireoidiano ACR TI-RADS ___ em lobo ___, sem intercorrências. Material encaminhado para citologia.', 'Realizada PAAF guiada por ultrassonografia de linfonodo cervical em nível ___, sem intercorrências.', 'Realizada PAAF de ___ nódulos, conforme descrito, sem intercorrências.'] },
      { t: 'Sugestão', chips: ['Retorno ao médico assistente com o resultado citológico (Bethesda).', 'Correlação clínico-laboratorial.'] },
    ],
  },
  {
    id: 'core', nome: 'CORE Biopsy (nódulo mamário)', grupo: 'Procedimentos', transdutor: 'linear', preco: 700,
    titulo: 'BIÓPSIA PERCUTÂNEA POR AGULHA GROSSA (CORE) GUIADA POR ULTRASSONOGRAFIA',
    fontes: ['Laudo de procedimento — sem modelo .docx, rascunho novo. Conta 1 por paciente, não por fragmento.', 'Emitido JUNTO com o laudo de US de mamas e axilas: o app gera os dois documentos de uma vez; este reaproveita a descrição do nódulo biopsiado e acrescenta as frases padrão.'],
    classificacoes: [{ nome: 'BI-RADS do nódulo-alvo', quando: 'sempre', app: 'sugerido, você confirma' }, { nome: 'Concordância radiológico-patológica (no retorno)', quando: 'resultado', app: 'campo a preencher no retorno' }],
    secoes: [
      { t: 'Indicação', chips: ['Nódulo mamário BI-RADS {4A|4B|4C|5}', 'Nódulo BI-RADS 3 com crescimento / a pedido', 'Linfonodo axilar suspeito', 'Lesão em parede / partes moles'] },
      { t: 'Consentimento e preparo', texto: 'Paciente esclarecida sobre o procedimento, riscos e benefícios, com termo de consentimento assinado. {Não faz uso|Faz uso, com suspensão orientada,} de anticoagulantes ou antiagregantes. Antissepsia com clorexidina alcoólica e campos estéreis. Anestesia local com lidocaína {1%|2%} {sem|com} vasoconstritor, ___ mL.' },
      { t: 'Técnica', texto: 'Sob orientação ultrassonográfica em tempo real com transdutor linear de alta frequência, após pequena incisão cutânea, realizadas ___ passagens com agulha de corte automática {14G|16G|18G} (dispositivo {automático|semiautomático}), com obtenção de ___ fragmentos {íntegros|fragmentados}, acondicionados em formol tamponado a 10%, identificados e encaminhados para estudo histopatológico ao laboratório {___|escolhido pela paciente, com termo de entrega de amostra}. {Não colocado|Colocado} clipe marcador metálico no leito. Hemostasia por compressão local e curativo compressivo.' },
      { t: 'Alvo', repetiveis: [ { botao: 'Adicionar alvo', calc: 'birads', texto: 'Alvo: nódulo {sólido|complexo cístico-sólido}, {oval|redondo|irregular}, de margens {circunscritas|indistintas|anguladas|microlobuladas|espiculadas}, em mama {direita|esquerda}, às ___ h, a ___ cm da papila e ___ cm da pele, medindo ___ × ___ × ___ cm, BI-RADS {3|4A|4B|4C|5}. Fragmentos obtidos {do centro e da periferia|do componente sólido} da lesão, com boa representatividade ao controle ultrassonográfico.' } ] },
      { t: 'Intercorrências', chips: ['Procedimento realizado sem intercorrências.', 'Discreto sangramento local, contido com compressão.', 'Pequeno hematoma no leito da biópsia, sem necessidade de intervenção.', 'Reação vasovagal, revertida com medidas de suporte.'] },
      { t: 'Orientações', texto: 'Paciente liberada em bom estado geral, orientada sobre compressão local, gelo, sinais de alerta (sangramento, dor intensa, febre) e retorno com o resultado histopatológico ao médico assistente.' },
      { t: 'Conclusão', chips: ['Realizada biópsia percutânea por agulha grossa guiada por ultrassonografia de nódulo BI-RADS ___ em mama ___, com obtenção de ___ fragmentos, sem intercorrências. Material encaminhado para estudo histopatológico.'] },
      { t: 'Sugestão', chips: ['Retorno ao médico assistente com o resultado histopatológico para avaliação de concordância radiológico-patológica.', 'Correlação com mamografia.'] },
    ],
  },
];

// ---------- normas e recomendações por modelo (fonte: exigencias-laudo-us.md, 12/09/2026) ----------
const NORMA_GERAL = [
  { tipo: 'exigência', quem: 'CFM 2.381/2024', o: 'Todo laudo traz data do exame e data de emissão; nome e CRM/UF do médico, RQE quando houver; nome e CPF do paciente; assinatura qualificada ou manuscrita com carimbo.' },
  { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Conteúdo mínimo: título, idade e gênero, data, técnica com frequência do transdutor, indicação, descrição por órgão, conclusão.' },
  { tipo: 'recomendação', quem: 'CBR Selo 2026', o: 'Descrição de cada órgão ou estrutura, impressão diagnóstica no final, medidas quando pertinente.' },
];
const NORMAS = {
  'abdome-superior': [ { tipo: 'recomendação', quem: 'CBR Normatização', o: 'Inclui fígado, vias biliares, vesícula, baço e pâncreas. Rins e aorta não fazem parte (são do Abdome Total).' }, { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Medir a veia porta; lobos em hepatomegalia; índice esplênico em esplenomegalia; vesícula em decúbito lateral esquerdo quando viável.' }, { tipo: 'prática', quem: 'sem consenso brasileiro', o: 'Esteatose em leve / moderada / acentuada. Em cirrótico, rastreio de CHC a cada 6 meses (SBH 2015); US LI-RADS é a referência do CBR.' } ],
  'abdome-total': [ { tipo: 'recomendação', quem: 'CBR Normatização', o: 'Abdome Superior + rins, bexiga, aorta e cava em modo B. Alças, apêndice e adrenais só se patologia.' }, { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Rins com diâmetro bipolar e espessura do parênquima; veia porta medida; vesícula em decúbito lateral esquerdo.' } ],
  'rins-vias': [ { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Diâmetro bipolar e espessura do parênquima de cada rim; bexiga repleta com volume e resíduo pós-miccional.' }, { tipo: 'recomendação', quem: 'Radiol Bras 2014', o: 'Cisto simples ou minimamente complexo acompanha por US; cisto complexo vai para TC/RM com contraste para Bosniak.' } ],
  'prostata': [ { tipo: 'recomendação', quem: 'CBR Normatização', o: 'Inclui bexiga, próstata com volumetria e estimativa de peso, vesículas seminais e resíduo pós-miccional.' }, { tipo: 'prática', quem: 'sem diretriz SBU confirmada', o: 'IPP em graus: 1 (< 5 mm), 2 (5–10 mm), 3 (> 10 mm), com bexiga ~200 mL.' } ],
  'parede-abdominal': [ { tipo: 'prática', quem: 'sem fonte brasileira', o: 'Descrever defeito, colo, conteúdo, redutibilidade e comportamento ao Valsalva; diástase medida acima e abaixo do umbigo.' } ],
  'hernia-inguinal': [ { tipo: 'prática', quem: 'sem fonte brasileira', o: 'Exame em decúbito e ortostase, com Valsalva; classificar em indireta, direta ou femoral pela relação com os vasos epigástricos inferiores.' } ],
  'pelve-feminina': [ { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Útero nos 3 eixos, espessura endometrial, ovários nos 3 eixos com volume; léxico IOTA/IETA/MUSA; toda massa anexial com O-RADS; limitação técnica explicitada no laudo.' } ],
  'transvaginal': [ { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Léxico IOTA/IETA/MUSA; massa anexial sempre com O-RADS; endométrio medido; ovários com volume.' }, { tipo: 'recomendação', quem: 'FEBRASGO 2021 (IOTA)', o: 'Classificar a massa em unilocular / multilocular / unilocular-sólido / multilocular-sólido / sólido; medir lesão e papila nos 3 eixos; contar septos e papilas; escore de cor.' } ],
  'obstetrico': [ { tipo: 'recomendação', quem: 'CBR–Febrasgo 2021', o: 'Documentar a DUM (ou desconhecimento) e a IG em semanas e dias; a idade gestacional não deve ser alterada pelas medidas fetais depois de datada; peso fetal com percentil; placenta, LA, cordão com nº de vasos e inserção.' }, { tipo: 'recomendação', quem: 'FEBRASGO 2025', o: 'PFE por Hadlock-3; PIG < p10 e GIG > p90; LA por ILA ou maior bolsão; relação da placenta com o orifício interno.' } ],
  'doppler-obstetrico': [ { tipo: 'recomendação', quem: 'CBR–Febrasgo 2021 / ISUOG', o: 'Índices por idade gestacional com percentil; ângulo de insonação baixo, feto em repouso; documentação de cada vaso.' } ],
  'mamas': [ { tipo: 'recomendação', quem: 'CBR + SBM + Febrasgo 2017', o: 'A ultrassonografia mamária inclui mamas e axilas, conforme BI-RADS 5ª edição. Não há resolução que obrigue a categoria, mas o Selo do CBR e a SBUS a esperam.' }, { tipo: 'recomendação', quem: 'ACR BI-RADS', o: 'Categoria 3: controle em 6 meses; 4 e 5: biópsia; 6: malignidade conhecida.' } ],
  'tireoide': [ { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Lobos nos 3 eixos e istmo, com volume; cada nódulo nos 3 eixos com volume e classificação individual pelo ACR TI-RADS; com múltiplos nódulos, descrever até quatro por lado, priorizando os mais suspeitos ou maiores.' }, { tipo: 'recomendação', quem: 'CBR Normatização', o: 'Linfonodos cervicais e Doppler não fazem parte do exame de tireoide (são exames à parte).' }, { tipo: 'recomendação', quem: 'SBEM 2013', o: 'O consenso brasileiro não usa TI-RADS; usa sinais de suspeição descritivos e limiares próprios de PAAF (sólido hipoecoico ≥ 1 cm; sólido sem sinais ≥ 1,5 cm; misto ≥ 2 cm). O app segue o ACR TI-RADS, que é o padrão de prática e do Selo do CBR.' } ],
  'tireoide-doppler': [ { tipo: 'recomendação', quem: 'CBR Normatização', o: 'Doppler é exame à parte do modo B; descrever padrão vascular do parênquima e de cada nódulo (Chammas).' } ],
  'cervical': [ { tipo: 'recomendação', quem: 'CBR Normatização', o: 'Região cervical inclui linfonodos em todos os compartimentos, leito tireoidiano pós-tireoidectomia, lojas paratireoidianas e músculos (citados só se alterados). Salivares: parótidas, submandibulares e sublinguais bilateralmente.' }, { tipo: 'recomendação', quem: 'SBEM 2013 / Radiol Bras 2004', o: 'Linfonodo suspeito: arredondado, sem hilo, cortical excêntrica, microcalcificações, áreas císticas, vascularização periférica; localizar por níveis I a VII.' } ],
  'cervical-doppler': [ { tipo: 'prática', quem: 'sem classificação padronizada', o: 'Descrever padrão de vascularização (hilar / periférica / mista) de cada linfonodo.' } ],
  'carotidas': [ { tipo: 'recomendação', quem: 'DIC/CBR/SBACV 2023', o: 'Graduar estenose por NASCET: < 50% VPS < 140; 50–59% VPS 140–230 e VDF 40–69, ACI/ACC 2,0–3,1; 60–69% VDF 70–100, relação 3,2–4,0; 70–79% VPS > 230, VDF > 100, relação > 4; 80–89% VDF > 140; > 90% VPS > 400. Placa = estrutura focal ≥ 0,5 mm na luz ou > 50% do EMI adjacente ou EMI > 1,5 mm; morfologia tipos I–V. EMI não é rotina.' }, { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'VPS das carótidas comuns; VPS e VDF das internas; ângulo ≤ 60°; externas e vertebrais com espectral.' } ],
  'doppler-hepatico': [ { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Veia porta medida; padrão espectral das hepáticas; artéria hepática com IR.' }, { tipo: 'prática', quem: 'sem fonte brasileira', o: 'Sinais de hipertensão portal: calibre e velocidade portal, sentido do fluxo, colaterais, esplenomegalia, ascite.' } ],
  'doppler-renal': [ { tipo: 'prática', quem: 'sem fonte brasileira', o: 'Estenose: VPS > 180–200 cm/s, RAR > 3,5, tardus-parvus intrarrenal; nefropatia parenquimatosa: IR > 0,80.' } ],
  'bolsa-escrotal': [ { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Testículos nos 3 eixos com volume de cada lado; epidídimo; plexo pampiniforme em repouso e Valsalva com medida dos segmentos mais calibrosos; varicocele pesquisada em ortostase se negativa em decúbito; refluxo espectral quando possível.' }, { tipo: 'prática', quem: 'ESUR-SPIWG', o: 'Varicocele: veia ≥ 3 mm e refluxo > 2 s; classificação de Sarteschi I–V.' } ],
  'partes-moles': [ { tipo: 'prática', quem: 'sem fonte brasileira', o: 'Descrever camada, tamanho nos 3 eixos, compressibilidade, Doppler e relação com estruturas vizinhas.' } ],
  'ombro': [ { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Protocolo cobre cabeça longa do bíceps, subescapular em rotação externa, supraespinal em rotação interna, infraespinal, acromioclavicular e lábio posterior.' } ],
  'cotovelo': [ { tipo: 'internacional', quem: 'ESSR', o: 'Sem protocolo brasileiro; seguir ESSR: epicôndilos, bíceps distal, tríceps, recessos articulares, nervo ulnar.' } ],
  'punho': [ { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Túnel do carpo com área de secção do nervo mediano; compartimentos extensores I, II, IV e VI.' } ],
  'punhos-bilateral': [ { tipo: 'recomendação', quem: 'CBR/PADI 2025', o: 'Mesmo protocolo do punho, com área do mediano de cada lado.' } ],
  'mao-dedos': [ { tipo: 'internacional', quem: 'ESSR', o: 'Sem protocolo brasileiro; descrever tendões, polias, articulações e lesões por dedo.' } ],
  'quadril': [ { tipo: 'internacional', quem: 'ESSR', o: 'Sem protocolo brasileiro; compartimentos anterior, lateral e posterior; derrame pela distância cápsula-colo.' } ],
  'joelho': [ { tipo: 'internacional', quem: 'ESSR', o: 'Sem protocolo brasileiro (não consta do PADI 2025); quatro compartimentos; meniscos e cruzados têm avaliação limitada ao método.' } ],
  'tornozelo': [ { tipo: 'internacional', quem: 'ESSR', o: 'Sem protocolo brasileiro (não consta do PADI 2025); tendões por compartimento, ligamentos laterais, calcâneo e fáscia plantar.' } ],
  'pe': [ { tipo: 'internacional', quem: 'ESSR', o: 'Sem protocolo brasileiro; espaços intermetatarsais, fáscia plantar, tendões e articulações.' } ],
  'paaf': [ { tipo: 'exigência', quem: 'CFM 2.381/2024 e CEM', o: 'Laudo de procedimento com data, identificação, descrição e conclusão; consentimento documentado.' }, { tipo: 'recomendação', quem: 'SBEM 2013', o: 'PAAF de linfonodo suspeito com dosagem de tireoglobulina no lavado da agulha.' } ],
  'core': [ { tipo: 'exigência', quem: 'CFM 2.381/2024 e CEM', o: 'Laudo de procedimento com data, identificação, descrição e conclusão; consentimento documentado.' }, { tipo: 'recomendação', quem: 'ACR BI-RADS', o: 'No retorno, registrar concordância radiológico-patológica.' } ],
};

if (typeof window !== 'undefined') { window.MODELOS = MODELOS; window.NORMAS = NORMAS; window.NORMA_GERAL = NORMA_GERAL; }

// Testes dos exames anteriores (leitura da lista e evolução). Rodar no Mac:
//   jsc -e "var document={createElement:()=>({}),head:{appendChild(){}}}; var TextDecoder=function(){}; TextDecoder.prototype.decode=function(u){ return decodeURIComponent(Array.from(u).map(x=>'%'+x.toString(16)).join('')); };" docs/anteriores.js ferramentas/testes/anteriores.test.js
var falhas=0; function eq(nome,a,e){ if(a!==e){ falhas++; print('FALHOU '+nome+'\n   esperado: '+e+'\n   veio:     '+a); } }

// limpeza da identificação
var laudo="CLINICA X\nPaciente: MARIA DA SILVA\nData de nascimento: 12/03/1971\nCPF 123.456.789-00  Tel (65) 99912-3456\nData do exame: 14/02/2026\nN5 - terço médio do lobo direito: nódulo sólido, 1,3 x 0,9 x 1,1 cm, TI-RADS 4. Contato maria@gmail.com";
eq('limpar',antLimpar(laudo,'Maria da Silva'),"CLINICA X\nData do exame: 14/02/2026\nN5 - terço médio do lobo direito: nódulo sólido, 1,3 x 0,9 x 1,1 cm, TI-RADS 4. Contato [e-mail]");
eq('conserta',antConserta("30 √ó 21 mm, cr√¥nica"),"30 × 21 mm, crônica");
eq('semRef',antSemReferencia("volume 22 mL (VR: 6 a 18 mL), aumentado"),"volume 22 mL, aumentado");

// tireoide
var tir="US 06/24:\nN1 TM LD TIRADS 4: 9 × 6 × 7 mm\nN2 TI LD TIRADS 4: 14 × 16 × 17 mm\nN3 TI LE TIRADS 2: 23 × 17 × 12 mm\nVolume: 17,6 cm³\n\nUS 06/25:\nN1 TM LD TIRADS 4: 9 × 6 × 7 mm\nN2 TI LD TIRADS 5: 19 × 21 × 24 mm\n\nPAAF 06/25:\nN2 TI LD TIRADS 5: 19 × 21 × 24 mm, Bethesda III";
eq('tir.exames',antLer(tir).length,3); eq('tir.vol',antLer(tir)[0].campos.volume,'17,6 cm³');
eq('tir.evol',antEvolucao(tir,[{rot:'N1',lado:'D',tag:'TI-RADS 4',rank:4,med:[12,8,9]},{rot:'N2',lado:'D',tag:'TI-RADS 5',rank:5,med:[22,25,28]},{rot:'N3',lado:'E',tag:'TI-RADS 2',rank:2,med:[23,17,12]}],new Date(2026,7,15)),
  "Evolução: N2 (TI-RADS 5, o mais suspeito): aumento de 2,4 para 2,8 cm (+4 mm, volume +61%) em 14 meses, crescimento significativo pelo ACR; PAAF em 06/25: Bethesda III. N1 (TI-RADS 4): aumento de 0,9 para 1,2 cm (+3 mm, volume +129%) em 14 meses, crescimento significativo pelo ACR. N3: estável.");

// mamas
var mam="MMG 05/24: BIRADS 2\n\nUS 06/24:\nN1 MD QSL 10h BIRADS 3: 10 × 7 × 6 mm\nC1 ME QSM 11h BIRADS 2: 6 × 5 × 5 mm\n\nCORE 07/24:\nN1 MD QSL 10h BIRADS 4A: 10 × 7 × 6 mm, histologia: fibroadenoma";
eq('mam.evol',antEvolucao(mam,[{rot:'N1',lado:'D',nome:'N1 MD',rank:2,med:[13,8,7]},{rot:'C1',lado:'E',nome:'C1 ME',rank:0,med:[6,5,5]}],new Date(2024,11,15),'mamas'),
  "Evolução: N1 MD (o mais suspeito): aumento de 1,0 para 1,3 cm (+3 mm) em 5 meses, aumento ≥ 20% na maior medida em até 6 meses; CORE em 07/24: fibroadenoma. C1 ME: estável.");

// cervical
var cer="US 03/25:\nLN1 III D: 12 × 8 × 9 mm, suspeito\nLN2 II E: 8 × 4 × 5 mm, reacional\nLT1 leito D: 6 × 4 × 5 mm\n\nPAAF 04/25:\nLN1 III D: 12 × 8 × 9 mm, Bethesda VI, Tg no lavado 250";
var ce=antLer(cer); eq('cer.n',ce[0].nods.length,3); eq('cer.lado',ce[0].nods[0].lado,'D'); eq('cer.rank',ce[0].nods[0].rank,1); eq('cer.beth',ce[1].nods[0].bethesda,'VI');
eq('cer.evol',antEvolucao(cer,[{rot:'LN1',lado:'D',nome:'LN1',tag:'',rank:1,med:[15,9,10]},{rot:'LN2',lado:'E',nome:'LN2',tag:'',rank:0,med:[8,4,5]},{rot:'LT1',lado:'D',nome:'LT1',tag:'',rank:0,med:[6,4,5]}],new Date(2026,2,15),'cervical'),
  "Evolução: LN1 (o mais suspeito): aumento de 1,2 para 1,5 cm (+3 mm) em 11 meses, aumento ≥ 20% na maior medida; PAAF em 04/25: Bethesda VI. LN2, LT1: estáveis.");

// transvaginal
var tv="US 03/25:\nM1 intramural posterior FIGO 4: 21 × 18 × 20 mm\nL1 ovário D O-RADS 2: 35 × 30 × 28 mm, cisto simples\nÚtero: 59 × 34 × 50 mm\nEndométrio: 8 mm";
var te=antLer(tv); eq('tv.n',te[0].nods.length,2); eq('tv.orads',te[0].nods[1].rank,2); eq('tv.utero',te[0].campos['útero'],'59 × 34 × 50 mm');
eq('tv.evol',antEvolucao(tv,[{rot:'M1',lado:null,nome:'M1',tag:'',rank:0,med:[30,25,26]},{rot:'L2',lado:'E',nome:'L2',tag:'O-RADS 3',rank:3,med:[40,30,30]}],new Date(2026,2,15),'transvaginal'),
  "Evolução: M1: aumento de 2,1 para 3,0 cm (+9 mm) em 12 meses, aumento ≥ 20% na maior medida. L2 (O-RADS 3, o mais suspeito): sem correspondente nos exames anteriores.");

// próstata
var pr="US 03/25:\nPróstata: 45 × 38 × 40 mm, 37 g\nResíduo: 60 mL\nPSA 02/25: 4,2 ng/mL\n\nUS 09/25:\nPróstata: 48 × 40 × 42 mm, 42 g\nResíduo: 20 mL";
eq('pr.evol',antEvolucaoProstata(pr,{peso:48,residuo:15},new Date(2026,2,15)),"Evolução: próstata 42 → 48 g (+14%) em 6 meses; resíduo 20 → 15 mL.");
var dd=antLer("US 29/08/26 Cliniprev:\nN1 TM LD TIRADS 4: 9 × 6 × 7 mm")[0]; eq('cab.data',dd.data,'08/26'); eq('cab.full',dd.dataFull,'29/08/26'); eq('cab.origem',dd.origem,'Cliniprev'); eq('cab.nod',dd.nods.length,1);
print(falhas?('\n'+falhas+' falha(s)'):'OK: exames anteriores');

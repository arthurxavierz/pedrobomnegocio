/* ==================================================================
   GERADOR DE FOTOS - CONFIGURACAO DA CAMPANHA
   ------------------------------------------------------------------
   Unico arquivo que muda de um candidato para outro. O motor
   (gerador.js) desenha as artes a partir daqui: nao existe imagem de
   moldura para produzir, tudo e gerado no navegador em alta resolucao.
================================================================== */

window.GERADOR_CAMPANHA = {

  /* --- Identificacao ------------------------------------------- */
  candidato: {
    nome: 'PEDRO',
    sobrenome: 'BOM NEGÓCIO',
    numero: '22550',
    cargo: 'CANDIDATO A DEPUTADO ESTADUAL',
    regiao: 'MINAS GERAIS',
    assinatura: 'MINAS EM MOVIMENTO',
    instagram: 'pedrobomnegocio',
    legal: 'CNPJ 68.464.812/0001-21'
  },

  /* Prefixo do arquivo baixado */
  arquivo: 'pedro-bom-negocio-22550',

  /* --- Paleta --------------------------------------------------- */
  cores: {
    azul: '#26378f',
    azulProfundo: '#151f61',
    azulClaro: '#344bb7',
    amarelo: '#ffd02f',
    verde: '#00ad63',
    vermelho: '#ef3b46',
    tinta: '#08101e',
    branco: '#fffef8'
  },

  /* --- Fontes usadas no canvas ---------------------------------- */
  fontes: {
    display: '"Barlow Condensed", Impact, sans-serif',
    displayEstilo: 'italic 900',
    corpo: 'Manrope, Arial, sans-serif'
  },

  /* --- Marca desenhada dentro da assinatura --------------------- */
  marca: {
    largura: 84.69,
    altura: 100,
    caminhos: [
      { cor: '#00a85a', d: 'M16.25 0H51.17C69.53 0,84.69 14.72,84.69 32.8C84.69 58.75,60.5 71.14,48.83 71.14H27.7L31.34 48.1L38.27 53.88Q38.94 54.43,39.68 53.98L64.71 38.91Q65.83 38.24,64.96 37.26L47.46 16.98Q44.45 13.62,43.47 18.03L42.2 23.8Q41.76 25.8,39.72 25.8H16.25A12.9 12.9 0 0 1 16.25 0Z' },
      { cor: '#ffcc2a', d: 'M23.98 39.07C20.19 39.07,10.61 46.16,9.68 50.73L-0.07 98.57Q-0.36 100,1.09 100H25.73Q27.19 100,27.48 98.57L39.31 40.35Q39.58 39.07,38.27 39.07Z' }
    ]
  },

  /* --- Formatos de saida ---------------------------------------- */
  formatos: [
    { id: 'quadrado', nome: 'QUADRADO', medida: '1080 × 1080', largura: 1080, altura: 1080 },
    { id: 'feed',     nome: 'FEED',     medida: '1080 × 1440', largura: 1080, altura: 1440 },
    { id: 'story',    nome: 'STORY',    medida: '1080 × 1920', largura: 1080, altura: 1920 }
  ],

  /* --- Molduras -------------------------------------------------
     fundo      : duas cores do degrade
     brilho     : halo superior (null desliga)
     textura    : 'grade' | 'pontos' | 'anel' | 'listras' | 'nenhuma'
     janela     : 'circulo' | 'arco' | 'janela'
     canto      : faixa diagonal no rodape da arte
     selo       : etiqueta adesiva sobre a foto
     placa      : assinatura visual da campanha
  --------------------------------------------------------------- */
  molduras: [
    {
      id: '01',
      nome: 'MOVIMENTO',
      fundo: ['#2f44ad', '#151f61'],
      brilho: 'rgba(64,91,196,.55)',
      textura: 'grade',
      janela: 'circulo',
      aro: 'rgba(255,255,255,.28)',
      tintaExtra: '#fffef8',
      canto: ['#ffd02f', '#00ad63'],
      selo: { texto: 'EU VOTO 22550', fundo: '#ffd02f', tinta: '#08101e', borda: '#fffef8' },
      placa: {
        fundo: '#fffef8',
        cargoFundo: '#00ad63', cargoTinta: '#fffef8',
        nome: '#151f61', destaque: '#26378f',
        numeroFundo: '#ffd02f', numeroTinta: '#151f61', numeroSombra: '#00ad63',
        assinatura: '#26378f', risco: '#ffd02f'
      }
    },
    {
      id: '02',
      nome: 'MINAS',
      fundo: ['#ffd83f', '#ffab00'],
      brilho: 'rgba(255,255,255,.5)',
      textura: 'anel',
      janela: 'circulo',
      aro: 'rgba(21,31,97,.22)',
      tintaExtra: '#151f61',
      canto: ['#26378f', '#00ad63'],
      selo: { texto: 'MINAS EM MOVIMENTO', fundo: '#151f61', tinta: '#ffd02f', borda: '#fffef8' },
      placa: {
        fundo: '#26378f',
        cargoFundo: '#ffd02f', cargoTinta: '#151f61',
        nome: '#fffef8', destaque: '#ffd02f',
        numeroFundo: '#ffd02f', numeroTinta: '#151f61', numeroSombra: '#00ad63',
        assinatura: '#ffd02f', risco: '#00ad63'
      }
    },
    {
      id: '03',
      nome: 'TRABALHO',
      fundo: ['#00c06f', '#00653a'],
      brilho: 'rgba(255,255,255,.34)',
      textura: 'listras',
      janela: 'arco',
      aro: 'rgba(255,255,255,.42)',
      tintaExtra: '#fffef8',
      canto: ['#ffd02f', '#26378f'],
      selo: { texto: 'BOM NEGÓCIO PRA MINAS', fundo: '#fffef8', tinta: '#26378f', borda: '#151f61' },
      placa: {
        fundo: '#151f61',
        cargoFundo: '#00ad63', cargoTinta: '#fffef8',
        nome: '#fffef8', destaque: '#ffd02f',
        numeroFundo: '#ffd02f', numeroTinta: '#151f61', numeroSombra: '#00ad63',
        assinatura: '#ffd02f', risco: '#00ad63'
      }
    }
  ]
};

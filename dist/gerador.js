/* ==================================================================
   GERADOR DE FOTOS — motor
   ------------------------------------------------------------------
   Tudo o que é da campanha vive em gerador-campanha.js. As molduras
   são desenhadas no canvas a partir dos tokens de cor e forma, então
   qualquer formato sai em alta resolução sem precisar de arquivo de
   arte. Nenhuma imagem sai do aparelho do apoiador.
================================================================== */
(function () {
  'use strict';

  var CFG = window.GERADOR_CAMPANHA;
  var telaPrincipal = document.querySelector('[data-canvas]');
  if (!CFG || !telaPrincipal) { return; }

  var FONTE = CFG.fontes;
  var MARCA = CFG.marca;

  /* ---------------- Estado ---------------- */
  var estado = {
    imagem: null,
    formato: CFG.formatos[0],
    moldura: CFG.molduras[0],
    vista: { zoom: 1, ox: 0, oy: 0 },
    blobFinal: null,
    urlFinal: ''
  };

  var $ = function (seletor, base) { return (base || document).querySelector(seletor); };
  var $$ = function (seletor, base) { return Array.prototype.slice.call((base || document).querySelectorAll(seletor)); };

  var ctxPrincipal = telaPrincipal.getContext('2d');
  var caixaFormatos = $('[data-formatos]');
  var caixaMolduras = $('[data-molduras]');
  var entradaGaleria = $('[data-entrada-galeria]');
  var entradaCamera = $('[data-entrada-camera]');
  var imagemFinal = $('[data-resultado]');
  var botaoBaixar = $('[data-gerador-acao="baixar"]');
  var botaoCompartilhar = $('[data-gerador-acao="compartilhar"]');
  var caixaAviso = $('[data-gerador-aviso]');

  /* Caminhos da marca, compilados uma vez */
  var marcaCaminhos = null;
  if (MARCA && window.Path2D) {
    try {
      marcaCaminhos = MARCA.caminhos.map(function (parte) {
        return { cor: parte.cor, caminho: new Path2D(parte.d) };
      });
    } catch (erro) { marcaCaminhos = null; }
  }

  /* ==================================================================
     Utilidades de desenho
  ================================================================== */

  function retanguloArredondado(ctx, x, y, largura, altura, raio) {
    var r = Math.min(raio, largura / 2, altura / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + largura - r, y);
    ctx.quadraticCurveTo(x + largura, y, x + largura, y + r);
    ctx.lineTo(x + largura, y + altura - r);
    ctx.quadraticCurveTo(x + largura, y + altura, x + largura - r, y + altura);
    ctx.lineTo(x + r, y + altura);
    ctx.quadraticCurveTo(x, y + altura, x, y + altura - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* Espaçamento entre letras medido caractere a caractere, para o
     resultado ser igual em qualquer navegador. */
  function larguraRastreada(ctx, texto, espaco) {
    var total = 0;
    for (var i = 0; i < texto.length; i++) { total += ctx.measureText(texto[i]).width; }
    return total + espaco * Math.max(0, texto.length - 1);
  }

  function textoRastreado(ctx, texto, x, y, espaco, alinhamento) {
    var total = larguraRastreada(ctx, texto, espaco);
    var cursor = alinhamento === 'centro' ? x - total / 2 : alinhamento === 'direita' ? x - total : x;
    var anterior = ctx.textAlign;
    ctx.textAlign = 'left';
    for (var i = 0; i < texto.length; i++) {
      ctx.fillText(texto[i], cursor, y);
      cursor += ctx.measureText(texto[i]).width + espaco;
    }
    ctx.textAlign = anterior;
    return total;
  }

  function fonteDisplay(tamanho) { return (FONTE.displayEstilo || '') + ' ' + tamanho + 'px ' + FONTE.display; }
  function fonteCorpo(tamanho, peso) { return (peso || 800) + ' ' + tamanho + 'px ' + FONTE.corpo; }

  function desenharMarca(ctx, x, y, altura) {
    if (!marcaCaminhos) { return; }
    var escala = altura / MARCA.altura;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(escala, escala);
    marcaCaminhos.forEach(function (parte) {
      ctx.fillStyle = parte.cor;
      ctx.fill(parte.caminho);
    });
    ctx.restore();
  }

  /* ==================================================================
     Camada de fundo da moldura
  ================================================================== */

  function pintarFundo(ctx, L, A, moldura) {
    var gradiente = ctx.createLinearGradient(0, 0, L * 0.4, A);
    gradiente.addColorStop(0, moldura.fundo[0]);
    gradiente.addColorStop(1, moldura.fundo[1]);
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, L, A);

    if (moldura.brilho) {
      var halo = ctx.createRadialGradient(L * 0.8, A * 0.15, 0, L * 0.8, A * 0.15, L * 0.7);
      halo.addColorStop(0, moldura.brilho);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, L, A);
    }

    var e = L / 1080;
    ctx.save();

    if (moldura.textura === 'grade') {
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.lineWidth = 2 * e;
      var celula = 58 * e;
      for (var gx = celula; gx < L; gx += celula) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, A); ctx.stroke();
      }
      for (var gy = celula; gy < A; gy += celula) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(L, gy); ctx.stroke();
      }
    } else if (moldura.textura === 'pontos') {
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      var passo = 30 * e;
      for (var y = passo; y < A; y += passo) {
        for (var x = passo; x < L; x += passo) {
          ctx.beginPath(); ctx.arc(x, y, 2.1 * e, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (moldura.textura === 'anel') {
      ctx.strokeStyle = 'rgba(255,255,255,.45)';
      ctx.lineWidth = 2 * e;
      for (var i = 1; i <= 5; i++) {
        ctx.beginPath(); ctx.arc(L * 0.5, A * 0.45, L * 0.2 * i, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (moldura.textura === 'listras') {
      ctx.strokeStyle = 'rgba(255,255,255,.15)';
      ctx.lineWidth = 14 * e;
      var salto = 58 * e;
      for (var d = -A; d < L + A; d += salto) {
        ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + A, A); ctx.stroke();
      }
    }

    ctx.restore();

    /* Faixa diagonal no rodapé, com as duas cores de apoio da campanha */
    if (moldura.canto) {
      ctx.save();
      ctx.translate(L * 0.5, A);
      ctx.rotate(-0.075);
      ctx.fillStyle = moldura.canto[1];
      ctx.fillRect(-L, -58 * e, L * 2, 16 * e);
      ctx.fillStyle = moldura.canto[0];
      ctx.fillRect(-L, -34 * e, L * 2, A * 0.3);
      ctx.restore();
    }
  }

  /* ==================================================================
     Janela da foto
  ================================================================== */

  function caminhoJanela(ctx, forma, cx, cy, largura, altura) {
    var x = cx - largura / 2;
    var y = cy - altura / 2;
    ctx.beginPath();
    if (forma === 'circulo') {
      ctx.arc(cx, cy, Math.min(largura, altura) / 2, 0, Math.PI * 2);
    } else if (forma === 'arco') {
      var r = largura / 2;
      var rb = largura * 0.07;
      ctx.moveTo(x, y + altura - rb);
      ctx.lineTo(x, y + r);
      ctx.arc(cx, y + r, r, Math.PI, 0);
      ctx.lineTo(x + largura, y + altura - rb);
      ctx.quadraticCurveTo(x + largura, y + altura, x + largura - rb, y + altura);
      ctx.lineTo(x + rb, y + altura);
      ctx.quadraticCurveTo(x, y + altura, x, y + altura - rb);
      ctx.closePath();
    } else {
      retanguloArredondado(ctx, x, y, largura, altura, largura * 0.1);
    }
  }

  /* ==================================================================
     Placa de assinatura: marca, nome, número e slogan
  ================================================================== */

  function medirPlaca(ctx, escala, larguraMaxima, tentativa) {
    var e = escala;
    var pad = 40 * e;
    var m = {
      e: e,
      pad: pad,
      fCargo: 22 * e,
      trCargo: 3 * e,
      fNome: 104 * e,
      fSub: 34 * e,
      trSub: 5 * e,
      fNum: 88 * e,
      fAss: 25 * e,
      trAss: 6 * e,
      alturaMarca: 108 * e,
      vao: 24 * e
    };

    ctx.font = fonteCorpo(m.fCargo, 800);
    m.larguraCargo = larguraRastreada(ctx, CFG.candidato.cargo, m.trCargo);
    m.padCargo = 16 * e;
    m.alturaCargo = m.fCargo * 2.1;

    ctx.font = fonteDisplay(m.fNome);
    m.larguraNome = ctx.measureText(CFG.candidato.nome).width;

    ctx.font = fonteDisplay(m.fSub);
    m.larguraSub = larguraRastreada(ctx, CFG.candidato.sobrenome, m.trSub);

    ctx.font = fonteDisplay(m.fNum);
    m.larguraTextoNum = ctx.measureText(CFG.candidato.numero).width;
    m.padNum = 18 * e;
    m.larguraNum = m.larguraTextoNum + m.padNum * 2;
    m.alturaNum = m.fNum * 1.02;

    m.larguraMarca = marcaCaminhos ? m.alturaMarca * (MARCA.largura / MARCA.altura) : 0;
    m.larguraTexto = Math.max(m.larguraNome, m.larguraSub);
    m.linha = (m.larguraMarca ? m.larguraMarca + m.vao : 0) + m.larguraTexto + m.vao * 1.1 + m.larguraNum;

    ctx.font = fonteCorpo(m.fAss, 800);
    m.larguraAss = larguraRastreada(ctx, CFG.candidato.assinatura, m.trAss);

    var conteudo = Math.max(m.larguraCargo + m.padCargo * 2, m.linha, m.larguraAss + 90 * e);
    m.largura = conteudo + pad * 2;

    if (m.largura > larguraMaxima && (tentativa || 0) < 5) {
      return medirPlaca(ctx, e * (larguraMaxima / m.largura), larguraMaxima, (tentativa || 0) + 1);
    }

    m.alturaTexto = m.fNome * 0.72 + 10 * e + m.fSub * 0.78;
    m.alturaLinha = Math.max(m.alturaMarca, m.alturaTexto, m.alturaNum);
    m.topoCargo = pad * 0.55;
    m.topoLinha = m.topoCargo + m.alturaCargo + 26 * e;
    m.baseAss = m.topoLinha + m.alturaLinha + 30 * e + m.fAss * 0.72;
    m.altura = m.baseAss + m.fAss * 0.4 + pad * 0.5;
    return m;
  }

  function desenharPlaca(ctx, m, moldura, centroX, topo) {
    var p = moldura.placa;
    var e = m.e;
    var x = centroX - m.largura / 2;

    ctx.save();
    ctx.translate(centroX, topo + m.altura / 2);
    ctx.rotate(-0.015);
    ctx.translate(-centroX, -(topo + m.altura / 2));

    /* Cartão */
    ctx.save();
    ctx.shadowColor = 'rgba(4,10,26,.32)';
    ctx.shadowBlur = 34 * e;
    ctx.shadowOffsetY = 14 * e;
    ctx.fillStyle = p.fundo;
    retanguloArredondado(ctx, x, topo, m.largura, m.altura, 20 * e);
    ctx.fill();
    ctx.restore();

    /* Etiqueta do cargo */
    var larguraEtiqueta = m.larguraCargo + m.padCargo * 2;
    ctx.fillStyle = p.cargoFundo;
    retanguloArredondado(ctx, centroX - larguraEtiqueta / 2, topo + m.topoCargo, larguraEtiqueta, m.alturaCargo, m.alturaCargo / 2);
    ctx.fill();

    ctx.fillStyle = p.cargoTinta;
    ctx.font = fonteCorpo(m.fCargo, 800);
    ctx.textBaseline = 'middle';
    textoRastreado(ctx, CFG.candidato.cargo, centroX, topo + m.topoCargo + m.alturaCargo / 2 + 1 * e, m.trCargo, 'centro');
    ctx.textBaseline = 'alphabetic';

    /* Linha principal: marca, nome e número */
    var inicio = centroX - m.linha / 2;
    var meioLinha = topo + m.topoLinha + m.alturaLinha / 2;

    if (m.larguraMarca) {
      desenharMarca(ctx, inicio, meioLinha - m.alturaMarca / 2, m.alturaMarca);
      inicio += m.larguraMarca + m.vao;
    }

    var topoTexto = meioLinha - m.alturaTexto / 2;
    ctx.textAlign = 'left';
    ctx.font = fonteDisplay(m.fNome);
    ctx.fillStyle = p.nome;
    ctx.fillText(CFG.candidato.nome, inicio, topoTexto + m.fNome * 0.72);

    ctx.font = fonteDisplay(m.fSub);
    ctx.fillStyle = p.destaque;
    textoRastreado(ctx, CFG.candidato.sobrenome, inicio, topoTexto + m.alturaTexto, m.trSub, 'esquerda');

    var numX = inicio + m.larguraTexto + m.vao * 1.1;

    ctx.save();
    ctx.translate(numX + m.larguraNum / 2, meioLinha);
    ctx.rotate(-0.03);
    if (p.numeroSombra) {
      ctx.fillStyle = p.numeroSombra;
      retanguloArredondado(ctx, -m.larguraNum / 2 + 9 * e, -m.alturaNum / 2 + 9 * e, m.larguraNum, m.alturaNum, 7 * e);
      ctx.fill();
    }
    ctx.fillStyle = p.numeroFundo;
    retanguloArredondado(ctx, -m.larguraNum / 2, -m.alturaNum / 2, m.larguraNum, m.alturaNum, 7 * e);
    ctx.fill();
    ctx.fillStyle = p.numeroTinta;
    ctx.font = fonteDisplay(m.fNum);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(CFG.candidato.numero, 0, m.fNum * 0.03);
    ctx.restore();

    /* Slogan com risco dos dois lados */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = fonteCorpo(m.fAss, 800);
    ctx.fillStyle = p.assinatura;
    textoRastreado(ctx, CFG.candidato.assinatura, centroX, topo + m.baseAss, m.trAss, 'centro');

    ctx.strokeStyle = p.risco;
    ctx.lineWidth = 4 * e;
    ctx.lineCap = 'round';
    var meioRisco = topo + m.baseAss - m.fAss * 0.3;
    ctx.beginPath();
    ctx.moveTo(centroX - m.larguraAss / 2 - 40 * e, meioRisco);
    ctx.lineTo(centroX - m.larguraAss / 2 - 14 * e, meioRisco);
    ctx.moveTo(centroX + m.larguraAss / 2 + 14 * e, meioRisco);
    ctx.lineTo(centroX + m.larguraAss / 2 + 40 * e, meioRisco);
    ctx.stroke();

    ctx.restore();
  }

  /* ==================================================================
     Selo adesivo
  ================================================================== */

  function desenharSelo(ctx, moldura, escala, x, y, larguraMaxima, limiteDireito) {
    var selo = moldura.selo;
    if (!selo || !selo.texto) { return; }
    var e = escala;
    var tamanho = 52 * e;

    ctx.font = fonteDisplay(tamanho);
    var largura = ctx.measureText(selo.texto).width;
    var padX = 26 * e;
    var total = largura + padX * 2;
    if (total > larguraMaxima) {
      var reducao = larguraMaxima / total;
      tamanho = tamanho * reducao;
      padX = padX * reducao;
      ctx.font = fonteDisplay(tamanho);
      largura = ctx.measureText(selo.texto).width;
      total = largura + padX * 2;
    }
    var alturaSelo = tamanho * 1.45;

    var meio = total / 2 + 12 * e;
    x = Math.min(x, limiteDireito - meio);
    x = Math.max(x, meio);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.05);

    ctx.shadowColor = 'rgba(4,10,26,.34)';
    ctx.shadowBlur = 26 * e;
    ctx.shadowOffsetY = 10 * e;
    ctx.fillStyle = selo.borda;
    retanguloArredondado(ctx, -total / 2 - 7 * e, -alturaSelo / 2 - 7 * e, total + 14 * e, alturaSelo + 14 * e, 14 * e);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = selo.fundo;
    retanguloArredondado(ctx, -total / 2, -alturaSelo / 2, total, alturaSelo, 9 * e);
    ctx.fill();

    ctx.fillStyle = selo.tinta;
    ctx.font = fonteDisplay(tamanho);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selo.texto, 0, tamanho * 0.04);
    ctx.restore();
  }

  /* ==================================================================
     Layout e composição
  ================================================================== */

  function calcularLayout(ctx, L, A, moldura) {
    var e = L / 1080;
    var placa = medirPlaca(ctx, e, L * 0.9);
    var sobreposicao = placa.altura * 0.4;
    var razao = moldura.janela === 'arco' ? 1.18 : moldura.janela === 'janela' ? 1.1 : 1;

    var largura = L - L * 0.075 * 2;
    var altura = largura * razao;
    var disponivel = A - A * 0.05 * 2 - (placa.altura - sobreposicao);
    if (altura > disponivel) {
      altura = disponivel;
      largura = altura / razao;
    }

    var blocoAltura = altura + (placa.altura - sobreposicao);
    var alto = A > L * 1.15;
    var topo = alto ? (A - blocoAltura) * 0.45 : (A - blocoAltura) / 2;

    return {
      e: e,
      largura: largura,
      altura: altura,
      cx: L / 2,
      cy: topo + altura / 2,
      placa: placa,
      placaTopo: topo + altura - sobreposicao,
      alto: alto
    };
  }

  function desenharFundoMoldura(ctx, L, A, moldura, layout) {
    pintarFundo(ctx, L, A, moldura);
    ctx.save();
    caminhoJanela(ctx, moldura.janela, layout.cx, layout.cy, layout.largura, layout.altura);
    ctx.fillStyle = 'rgba(8,16,30,.45)';
    ctx.fill();
    ctx.restore();
  }

  function desenharFrenteMoldura(ctx, L, A, moldura, layout) {
    var e = layout.e;

    ctx.save();
    caminhoJanela(ctx, moldura.janela, layout.cx, layout.cy, layout.largura, layout.altura);
    ctx.strokeStyle = moldura.aro;
    ctx.lineWidth = 9 * e;
    ctx.stroke();
    ctx.restore();

    desenharSelo(ctx, moldura, e, layout.cx + layout.largura * 0.28, layout.cy - layout.altura * 0.3, L * 0.66, L - L * 0.045);
    desenharPlaca(ctx, layout.placa, moldura, layout.cx, layout.placaTopo);

    if (layout.alto) { desenharExtras(ctx, L, A, moldura, layout); }
  }

  /* Respiro dos formatos verticais: região no topo e perfil no rodapé */
  function desenharExtras(ctx, L, A, moldura, layout) {
    var e = layout.e;
    var tinta = moldura.tintaExtra || '#ffffff';

    ctx.save();
    ctx.fillStyle = tinta;
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.9;
    ctx.font = fonteCorpo(24 * e, 800);
    var larguraRegiao = textoRastreado(ctx, CFG.candidato.regiao, L / 2, A * 0.07, 8 * e, 'centro');

    ctx.strokeStyle = tinta;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2 * e;
    ctx.beginPath();
    ctx.moveTo(L / 2 - larguraRegiao / 2 - 40 * e, A * 0.07);
    ctx.lineTo(L / 2 - larguraRegiao / 2 - 14 * e, A * 0.07);
    ctx.moveTo(L / 2 + larguraRegiao / 2 + 14 * e, A * 0.07);
    ctx.lineTo(L / 2 + larguraRegiao / 2 + 40 * e, A * 0.07);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = tinta;
    ctx.textAlign = 'center';
    ctx.font = fonteDisplay(42 * e);
    ctx.fillText('@' + CFG.candidato.instagram, L / 2, A - A * 0.072);

    ctx.globalAlpha = 0.62;
    ctx.font = fonteCorpo(21 * e, 700);
    textoRastreado(ctx, 'ACOMPANHE A CAMPANHA', L / 2, A - A * 0.043, 5 * e, 'centro');
    ctx.restore();
  }

  function desenharFoto(ctx, imagem, layout, moldura, vista) {
    if (!imagem) { return; }
    var caixa = ajustarVista(imagem, layout, vista);
    ctx.save();
    caminhoJanela(ctx, moldura.janela, layout.cx, layout.cy, layout.largura, layout.altura);
    ctx.clip();
    ctx.drawImage(imagem, caixa.x, caixa.y, caixa.largura, caixa.altura);
    ctx.restore();
  }

  /* Converte zoom e deslocamento (frações) em coordenadas de desenho,
     garantindo que a foto sempre preencha a janela. */
  function ajustarVista(imagem, layout, vista) {
    var cobrir = Math.max(layout.largura / imagem.width, layout.altura / imagem.height);
    var escala = cobrir * vista.zoom;
    var largura = imagem.width * escala;
    var altura = imagem.height * escala;
    var limiteX = Math.max(0, (largura - layout.largura) / 2);
    var limiteY = Math.max(0, (altura - layout.altura) / 2);
    var ox = Math.max(-limiteX, Math.min(limiteX, vista.ox * layout.largura));
    var oy = Math.max(-limiteY, Math.min(limiteY, vista.oy * layout.altura));
    return {
      x: layout.cx - largura / 2 + ox,
      y: layout.cy - altura / 2 + oy,
      largura: largura,
      altura: altura,
      limiteX: limiteX / layout.largura,
      limiteY: limiteY / layout.altura
    };
  }

  function compor(ctx, L, A, moldura, imagem, vista) {
    ctx.clearRect(0, 0, L, A);
    var layout = calcularLayout(ctx, L, A, moldura);
    desenharFundoMoldura(ctx, L, A, moldura, layout);
    desenharFoto(ctx, imagem, layout, moldura, vista);
    desenharFrenteMoldura(ctx, L, A, moldura, layout);
    return layout;
  }

  /* ==================================================================
     Render principal
  ================================================================== */

  var layoutAtual = null;
  var pedidoDeQuadro = null;

  function renderizar() {
    pedidoDeQuadro = null;
    var L = estado.formato.largura;
    var A = estado.formato.altura;
    if (telaPrincipal.width !== L || telaPrincipal.height !== A) {
      telaPrincipal.width = L;
      telaPrincipal.height = A;
    }
    layoutAtual = compor(ctxPrincipal, L, A, estado.moldura, estado.imagem, estado.vista);
  }

  function pedirRender() {
    if (pedidoDeQuadro === null) { pedidoDeQuadro = requestAnimationFrame(renderizar); }
  }

  /* ==================================================================
     Interface
  ================================================================== */

  function irParaPasso(numero) {
    $$('[data-gerador-passo]').forEach(function (secao) {
      var ativo = Number(secao.dataset.geradorPasso) === numero;
      secao.hidden = !ativo;
      secao.classList.toggle('is-ativo', ativo);
    });
    $$('.trilha__item').forEach(function (item) {
      item.classList.toggle('is-ativo', Number(item.dataset.trilha) <= numero);
    });
    var alvo = $('[data-gerador-topo]');
    if (alvo) {
      var y = alvo.getBoundingClientRect().top + window.pageYOffset - 96;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }

  function avisar(mensagem) {
    if (!caixaAviso) { return; }
    caixaAviso.textContent = mensagem;
    caixaAviso.classList.add('is-visible');
    clearTimeout(avisar.tempo);
    avisar.tempo = setTimeout(function () { caixaAviso.classList.remove('is-visible'); }, 4200);
  }

  var SVG_CHEQUE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 5 5 10-11"/></svg>';

  function montarFormatos() {
    caixaFormatos.innerHTML = '';
    CFG.formatos.forEach(function (formato) {
      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'formato' + (formato.id === estado.formato.id ? ' is-ativo' : '');
      botao.setAttribute('role', 'radio');
      botao.setAttribute('aria-checked', String(formato.id === estado.formato.id));
      botao.innerHTML =
        '<span class="formato__icone" data-proporcao="' + formato.id + '"></span>' +
        '<span class="formato__texto"><span class="formato__nome">' + formato.nome + '</span>' +
        '<span class="formato__medida">' + formato.medida + '</span></span>' +
        '<span class="formato__check">' + SVG_CHEQUE + '</span>';
      botao.addEventListener('click', function () {
        estado.formato = formato;
        $$('.formato', caixaFormatos).forEach(function (outro, indice) {
          var ativo = CFG.formatos[indice].id === formato.id;
          outro.classList.toggle('is-ativo', ativo);
          outro.setAttribute('aria-checked', String(ativo));
        });
        pedirRender();
      });
      caixaFormatos.appendChild(botao);
    });
  }

  function montarMolduras() {
    caixaMolduras.innerHTML = '';
    CFG.molduras.forEach(function (moldura) {
      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'moldura' + (moldura.id === estado.moldura.id ? ' is-ativo' : '');
      botao.setAttribute('role', 'radio');
      botao.setAttribute('aria-checked', String(moldura.id === estado.moldura.id));
      botao.setAttribute('aria-label', 'Moldura ' + moldura.id + ', ' + moldura.nome);
      botao.innerHTML =
        '<canvas width="360" height="360"></canvas>' +
        '<span class="moldura__nome">' + moldura.id + '</span>' +
        '<span class="moldura__check">' + SVG_CHEQUE + '</span>';
      botao.addEventListener('click', function () {
        estado.moldura = moldura;
        $$('.moldura', caixaMolduras).forEach(function (outro, indice) {
          var ativo = CFG.molduras[indice].id === moldura.id;
          outro.classList.toggle('is-ativo', ativo);
          outro.setAttribute('aria-checked', String(ativo));
        });
        pedirRender();
      });
      caixaMolduras.appendChild(botao);
    });
    atualizarMiniaturas();
  }

  function atualizarMiniaturas() {
    $$('.moldura canvas', caixaMolduras).forEach(function (tela, indice) {
      compor(tela.getContext('2d'), tela.width, tela.height, CFG.molduras[indice], estado.imagem, estado.vista);
    });
  }

  /* ==================================================================
     Foto do apoiador
  ================================================================== */

  function carregarArquivo(arquivo) {
    if (!arquivo) { return; }
    if (!/^image\//.test(arquivo.type)) {
      avisar('Escolha um arquivo de imagem (JPG, PNG ou WEBP).');
      return;
    }

    var aoTerminar = function (bitmap) {
      estado.imagem = bitmap;
      estado.vista = { zoom: 1, ox: 0, oy: 0 };
      irParaPasso(2);
      pedirRender();
      atualizarMiniaturas();
    };

    if (window.createImageBitmap) {
      createImageBitmap(arquivo, { imageOrientation: 'from-image' })
        .then(aoTerminar)
        .catch(function () { carregarPorElemento(arquivo, aoTerminar); });
    } else {
      carregarPorElemento(arquivo, aoTerminar);
    }
  }

  function carregarPorElemento(arquivo, aoTerminar) {
    var url = URL.createObjectURL(arquivo);
    var img = new Image();
    img.onload = function () { aoTerminar(img); URL.revokeObjectURL(url); };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      avisar('Não foi possível abrir essa imagem. Tente outra foto.');
    };
    img.src = url;
  }

  entradaGaleria.addEventListener('change', function (evento) { carregarArquivo(evento.target.files[0]); evento.target.value = ''; });
  entradaCamera.addEventListener('change', function (evento) { carregarArquivo(evento.target.files[0]); evento.target.value = ''; });

  /* ==================================================================
     Arrastar, ampliar e centralizar
  ================================================================== */

  var ponteiros = {};
  var distanciaInicial = 0;
  var zoomInicial = 1;

  function aplicarLimites() {
    if (!estado.imagem || !layoutAtual) { return; }
    var caixa = ajustarVista(estado.imagem, layoutAtual, estado.vista);
    estado.vista.ox = Math.max(-caixa.limiteX, Math.min(caixa.limiteX, estado.vista.ox));
    estado.vista.oy = Math.max(-caixa.limiteY, Math.min(caixa.limiteY, estado.vista.oy));
  }

  function fatorTela() {
    var retangulo = telaPrincipal.getBoundingClientRect();
    return {
      x: retangulo.width ? telaPrincipal.width / retangulo.width : 1,
      y: retangulo.height ? telaPrincipal.height / retangulo.height : 1
    };
  }

  telaPrincipal.addEventListener('pointerdown', function (evento) {
    if (!estado.imagem) { return; }
    try { telaPrincipal.setPointerCapture(evento.pointerId); } catch (erro) { /* ponteiro sintetico */ }
    ponteiros[evento.pointerId] = { x: evento.clientX, y: evento.clientY };
    var chaves = Object.keys(ponteiros);
    if (chaves.length === 2) {
      var a = ponteiros[chaves[0]];
      var b = ponteiros[chaves[1]];
      distanciaInicial = Math.hypot(a.x - b.x, a.y - b.y);
      zoomInicial = estado.vista.zoom;
    }
  });

  telaPrincipal.addEventListener('pointermove', function (evento) {
    if (!estado.imagem || !ponteiros[evento.pointerId] || !layoutAtual) { return; }
    var chaves = Object.keys(ponteiros);

    if (chaves.length >= 2) {
      ponteiros[evento.pointerId] = { x: evento.clientX, y: evento.clientY };
      var a = ponteiros[chaves[0]];
      var b = ponteiros[chaves[1]];
      var distancia = Math.hypot(a.x - b.x, a.y - b.y);
      if (distanciaInicial > 0) {
        estado.vista.zoom = Math.max(1, Math.min(4, zoomInicial * (distancia / distanciaInicial)));
        aplicarLimites();
        pedirRender();
      }
      return;
    }

    var anterior = ponteiros[evento.pointerId];
    var escala = fatorTela();
    estado.vista.ox += ((evento.clientX - anterior.x) * escala.x) / layoutAtual.largura;
    estado.vista.oy += ((evento.clientY - anterior.y) * escala.y) / layoutAtual.altura;
    ponteiros[evento.pointerId] = { x: evento.clientX, y: evento.clientY };
    aplicarLimites();
    pedirRender();
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (nome) {
    telaPrincipal.addEventListener(nome, function (evento) {
      delete ponteiros[evento.pointerId];
      distanciaInicial = 0;
      atualizarMiniaturas();
    });
  });

  telaPrincipal.addEventListener('wheel', function (evento) {
    if (!estado.imagem) { return; }
    evento.preventDefault();
    estado.vista.zoom = Math.max(1, Math.min(4, estado.vista.zoom * (evento.deltaY > 0 ? 0.94 : 1.06)));
    aplicarLimites();
    pedirRender();
  }, { passive: false });

  $$('[data-zoom]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var direcao = Number(botao.dataset.zoom);
      estado.vista.zoom = Math.max(1, Math.min(4, estado.vista.zoom * (direcao > 0 ? 1.16 : 1 / 1.16)));
      aplicarLimites();
      pedirRender();
      atualizarMiniaturas();
    });
  });

  /* ==================================================================
     Ações
  ================================================================== */

  function gerarArquivo() {
    return new Promise(function (resolve, reject) {
      renderizar();
      if (!telaPrincipal.toBlob) { reject(new Error('sem suporte')); return; }
      telaPrincipal.toBlob(function (blob) {
        if (blob) { resolve(blob); } else { reject(new Error('falhou')); }
      }, 'image/png');
    });
  }

  function nomeArquivo() { return CFG.arquivo + '-' + estado.formato.id + '.png'; }

  function podeCompartilhar(blob) {
    if (!navigator.canShare || !navigator.share) { return false; }
    try {
      return navigator.canShare({ files: [new File([blob], nomeArquivo(), { type: 'image/png' })] });
    } catch (erro) { return false; }
  }

  function finalizar() {
    if (!estado.imagem) { avisar('Escolha uma foto para continuar.'); return; }
    gerarArquivo().then(function (blob) {
      if (estado.urlFinal) { URL.revokeObjectURL(estado.urlFinal); }
      estado.blobFinal = blob;
      estado.urlFinal = URL.createObjectURL(blob);
      imagemFinal.src = estado.urlFinal;
      botaoBaixar.href = estado.urlFinal;
      botaoBaixar.setAttribute('download', nomeArquivo());
      botaoCompartilhar.hidden = !podeCompartilhar(blob);
      irParaPasso(3);
    }).catch(function () {
      avisar('Não foi possível montar a imagem. Tente novamente.');
    });
  }

  document.addEventListener('click', function (evento) {
    var alvo = evento.target.closest('[data-gerador-acao]');
    if (!alvo) { return; }
    var acao = alvo.dataset.geradorAcao;

    if (acao === 'galeria' || acao === 'trocar') { entradaGaleria.click(); }
    if (acao === 'camera') { entradaCamera.click(); }
    if (acao === 'centralizar') {
      estado.vista = { zoom: 1, ox: 0, oy: 0 };
      pedirRender();
      atualizarMiniaturas();
    }
    if (acao === 'finalizar') { finalizar(); }
    if (acao === 'voltar') { irParaPasso(2); pedirRender(); }
    if (acao === 'compartilhar') {
      navigator.share({
        files: [new File([estado.blobFinal], nomeArquivo(), { type: 'image/png' })],
        title: CFG.candidato.nome + ' ' + CFG.candidato.numero,
        text: 'Eu voto ' + CFG.candidato.numero + '.'
      }).catch(function () { /* cancelado pelo usuário */ });
    }
  });

  /* ==================================================================
     Início
  ================================================================== */

  montarFormatos();
  montarMolduras();

  function prepararFontes() {
    if (!document.fonts || !document.fonts.load) { return Promise.resolve(); }
    return Promise.all([
      document.fonts.load('italic 900 100px ' + FONTE.display),
      document.fonts.load('800 100px ' + FONTE.corpo)
    ]).catch(function () { return null; });
  }

  prepararFontes().then(function () {
    pedirRender();
    atualizarMiniaturas();
  });

  pedirRender();
  atualizarMiniaturas();
})();

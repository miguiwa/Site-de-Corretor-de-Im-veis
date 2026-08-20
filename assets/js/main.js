(function () {
  'use strict';

  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (!toggle || !nav) return;

  function fecharMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('is-open');
  }

  function abrirMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    nav.classList.add('is-open');
  }

  toggle.addEventListener('click', function () {
    var aberto = toggle.getAttribute('aria-expanded') === 'true';
    if (aberto) {
      fecharMenu();
    } else {
      abrirMenu();
    }
  });

  // Fecha o menu ao clicar em um link (navegação mobile)
  nav.addEventListener('click', function (evento) {
    if (evento.target.matches('.nav__link')) {
      fecharMenu();
    }
  });

  // Fecha o menu ao redimensionar para desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1023) {
      fecharMenu();
    }
  });

  // Fecha o menu com a tecla Esc
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') {
      fecharMenu();
    }
  });
})();

/* ============================================================================
   CATÁLOGO DE IMÓVEIS — fetch do imoveis.json, filtros, grid único de imóveis
   grid regular e overlay de detalhe. Nenhum dado de imóvel é hardcoded aqui:
   tudo vem do JSON.
   ============================================================================ */

(function () {
  'use strict';

  var regularGrid = document.getElementById('grid-regular');
  var overlay = document.getElementById('imovel-overlay');
  var overlayConteudo = document.getElementById('imovel-overlay-conteudo');
  var filtrosForm = document.getElementById('filtros-form');

  if (!regularGrid) return;

  var TIPO_LABELS = {
    casa: 'Casa',
    apartamento: 'Apartamento',
    terreno: 'Terreno',
    chacara: 'Chácara',
    comercial: 'Comercial'
  };

  var ICONS = {
    pin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.2" stroke="currentColor" stroke-width="1.4"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18v2M21 18v2M5 10V7a2 2 0 0 1 2-2h3v5M3 14h18" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM7 12V6a2 2 0 0 1 3.5-1.3M4 19v2M18 19v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 17h14M5 17v2M19 17v2M5 17l1.2-5.6A2 2 0 0 1 8.15 10h7.7a2 2 0 0 1 1.95 1.4L19 17M7 14h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20V4M4 4h5v5H4M20 20V4M20 4h-5v5h5M4 20h16" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8h9M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    coracao: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.3 4.5 5.7 4c2-.3 3.9.6 5.1 2.3l1.2 1.6 1.2-1.6C14.4 4.6 16.3 3.7 18.3 4c3.4.5 5.2 3.8 3.7 7.2-2.5 4.7-10 9.3-10 9.3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.9.529 3.68 1.447 5.198L2.05 22l4.918-1.34A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.524 2 12.001 2zm0 18.156a8.13 8.13 0 0 1-4.146-1.135l-.298-.177-3.083.84.822-3.005-.194-.31A8.132 8.132 0 0 1 3.845 12c0-4.502 3.653-8.156 8.156-8.156 4.502 0 8.156 3.654 8.156 8.156 0 4.502-3.654 8.156-8.156 8.156z"/></svg>'
  };

  var PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#171D1C"/>' +
    '<g fill="none" stroke="#4a5450" stroke-width="2">' +
    '<path d="M150 190h100M150 190l25-40 20 25 15-18 25 33" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="175" cy="130" r="10"/>' +
    '</g></svg>'
  );

  var state = {
    all: [],
    modo: 'padrao', // 'padrao' | 'terrenos' | 'favoritos'
    finalidade: 'todos',
    localizacao: '',
    tipo: '',
    precoMin: '',
    precoMax: '',
    mostrarTodos: false
  };

  var LIMITE_INICIAL = 3;

  /* -- Favoritos (localStorage) ------------------------------------------------ */

  var FAVORITOS_KEY = 'imoveis_favoritos';

  function obterFavoritos() {
    try {
      var raw = localStorage.getItem(FAVORITOS_KEY);
      var lista = raw ? JSON.parse(raw) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function salvarFavoritos(lista) {
    try {
      localStorage.setItem(FAVORITOS_KEY, JSON.stringify(lista));
    } catch (e) {
      // localStorage indisponível (modo privado, quota, etc.) — falha silenciosa
    }
  }

  function isFavorito(id) {
    return obterFavoritos().indexOf(id) !== -1;
  }

  // Alterna o favorito e persiste. Retorna o novo estado (true = favoritado).
  function alternarFavorito(id) {
    var lista = obterFavoritos();
    var indice = lista.indexOf(id);
    if (indice === -1) {
      lista.push(id);
    } else {
      lista.splice(indice, 1);
    }
    salvarFavoritos(lista);
    return indice === -1;
  }

  function tipoLabel(tipo) {
    return TIPO_LABELS[tipo] || (tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : '');
  }

  // Tag do card: em vez do tipo do imóvel, mostra a disponibilidade —
  // Venda, Aluguel, Venda e Aluguel (caso o JSON traga as duas) ou Terreno.
  function disponibilidadeLabel(imovel) {
    if (imovel.tipo === 'terreno') return 'Terreno';

    var finalidades = Array.isArray(imovel.finalidade) ? imovel.finalidade : [imovel.finalidade];
    var labels = [];
    finalidades.forEach(function (f) {
      var label = f === 'aluguel' ? 'Aluguel' : 'Venda';
      if (labels.indexOf(label) === -1) labels.push(label);
    });
    return labels.join(' e ');
  }

  function formatarPreco(imovel) {
    var valor = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(imovel.preco);
    return imovel.finalidade === 'aluguel' ? valor + '/mês' : valor;
  }

  function localizacaoTexto(imovel) {
    var loc = imovel.localizacao || {};
    return [loc.bairro, loc.cidade].filter(Boolean).join(', ');
  }

  /* -- Busca de localização: normalização, tolerância a acento/maiúscula
     e a pequenos erros de digitação (usado pelo autocomplete e pelo filtro) */

  function normalizarTexto(valor) {
    return (valor || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function distanciaLevenshtein(a, b) {
    var m = a.length;
    var n = b.length;
    if (!m) return n;
    if (!n) return m;

    var linha = [];
    for (var j = 0; j <= n; j++) linha[j] = j;

    for (var i = 1; i <= m; i++) {
      var anterior = linha[0];
      linha[0] = i;
      for (var k = 1; k <= n; k++) {
        var temp = linha[k];
        linha[k] = a.charAt(i - 1) === b.charAt(k - 1)
          ? anterior
          : 1 + Math.min(anterior, linha[k], linha[k - 1]);
        anterior = temp;
      }
    }
    return linha[n];
  }

  // Compara um texto-alvo (ex: "Jardim Primavera, Porto Feliz") com uma
  // consulta digitada pelo usuário, ignorando maiúsculas/acentos, aceitando
  // correspondência parcial e tolerando pequenos erros de digitação.
  //
  // A comparação é feita palavra por palavra: cada palavra digitada precisa
  // corresponder a alguma palavra do texto-alvo (exata, parcial ou dentro de
  // uma pequena distância de edição). Isso é mais confiável do que comparar
  // a consulta inteira contra o texto inteiro, que falha facilmente quando o
  // texto-alvo tem mais de uma palavra (ex: "bairro, cidade").
  function correspondeLocalizacao(alvoTexto, consultaTexto) {
    var alvoNorm = normalizarTexto(alvoTexto);
    var consultaNorm = normalizarTexto(consultaTexto);
    if (!consultaNorm) return true;

    // Atalho: correspondência direta do texto completo.
    if (alvoNorm.indexOf(consultaNorm) !== -1) return true;

    var palavrasConsulta = consultaNorm.split(/\s+/).filter(Boolean);
    var palavrasAlvo = alvoNorm.split(/[\s,]+/).filter(Boolean);

    return palavrasConsulta.every(function (palavraConsulta) {
      return palavrasAlvo.some(function (palavraAlvo) {
        if (palavraAlvo.indexOf(palavraConsulta) !== -1) return true;
        var limite = palavraConsulta.length <= 4 ? 1 : palavraConsulta.length <= 8 ? 2 : 3;
        return distanciaLevenshtein(palavraConsulta, palavraAlvo) <= limite;
      });
    });
  }

  // Deriva a lista de sugestões (bairros + cidades) direto do imoveis.json,
  // sem nenhum valor manual/hardcoded, sem duplicatas (ignorando acento/caixa).
  function obterLocalizacoesUnicas(all) {
    var vistos = {};
    var lista = [];
    (all || []).forEach(function (imovel) {
      var loc = imovel.localizacao || {};
      [loc.bairro, loc.cidade].forEach(function (valor) {
        if (!valor) return;
        var chave = normalizarTexto(valor);
        if (!chave || vistos[chave]) return;
        vistos[chave] = true;
        lista.push(valor);
      });
    });
    return lista.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
  }

  // Cria e liga o autocomplete do campo de localização: monta a lista de
  // sugestões suspensa dinamicamente (não existe no HTML) e não altera
  // nenhum outro campo, estilo ou comportamento de filtro existente.
  function ligarAutocompleteLocalizacao(all) {
    var input = document.getElementById('filtro-localizacao');
    if (!input) return;

    var campo = input.closest('.filtros__campo');
    if (!campo) return;

    var opcoes = obterLocalizacoesUnicas(all);
    var indiceAtivo = -1; // item destacado via teclado (setas ↑/↓), -1 = nenhum

    var lista = document.createElement('ul');
    lista.className = 'filtros__sugestoes';
    lista.id = 'filtro-localizacao-sugestoes';
    lista.setAttribute('role', 'listbox');
    lista.hidden = true;
    campo.appendChild(lista);

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', lista.id);
    input.setAttribute('autocomplete', 'off');

    function abrirSugestoes() {
      lista.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function fecharSugestoes() {
      lista.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      indiceAtivo = -1;
    }

    // Destaca visualmente o item no índice informado (navegação por teclado)
    // e mantém ele visível dentro da lista rolável.
    function destacarItem(indice) {
      var itens = lista.querySelectorAll('li[role="option"]');
      itens.forEach(function (item, i) {
        item.classList.toggle('is-destacada', i === indice);
      });
      if (indice >= 0 && itens[indice]) {
        itens[indice].scrollIntoView({ block: 'nearest' });
        input.setAttribute('aria-activedescendant', itens[indice].id);
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    function renderizarSugestoes(consulta) {
      lista.innerHTML = '';
      indiceAtivo = -1;

      if (!consulta || !consulta.trim()) {
        fecharSugestoes();
        return;
      }

      var correspondencias = opcoes
        .filter(function (opcao) { return correspondeLocalizacao(opcao, consulta); })
        .slice(0, 8);

      if (!correspondencias.length) {
        var vazio = document.createElement('li');
        vazio.className = 'filtros__sugestoes-vazio';
        vazio.textContent = 'Nenhuma localização encontrada';
        vazio.setAttribute('aria-disabled', 'true');
        lista.appendChild(vazio);
        abrirSugestoes();
        return;
      }

      correspondencias.forEach(function (opcao, i) {
        var item = document.createElement('li');
        item.textContent = opcao;
        item.id = 'filtro-localizacao-opcao-' + i;
        item.setAttribute('role', 'option');
        // mousedown (em vez de click) dispara antes do blur do input
        item.addEventListener('mousedown', function (e) {
          e.preventDefault();
          input.value = opcao;
          fecharSugestoes();
        });
        lista.appendChild(item);
      });

      abrirSugestoes();
    }

    input.addEventListener('input', function () {
      renderizarSugestoes(input.value);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) renderizarSugestoes(input.value);
    });

    input.addEventListener('blur', function () {
      // pequeno atraso para o mousedown da sugestão processar antes de fechar
      setTimeout(fecharSugestoes, 100);
    });

    // Navegação por teclado: seta para baixo/cima percorre as sugestões,
    // Enter seleciona a sugestão destacada, Esc fecha a lista.
    input.addEventListener('keydown', function (e) {
      var itens = lista.querySelectorAll('li[role="option"]');
      if (lista.hidden || !itens.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        indiceAtivo = (indiceAtivo + 1) % itens.length;
        destacarItem(indiceAtivo);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        indiceAtivo = (indiceAtivo - 1 + itens.length) % itens.length;
        destacarItem(indiceAtivo);
      } else if (e.key === 'Enter' && indiceAtivo >= 0 && itens[indiceAtivo]) {
        e.preventDefault();
        input.value = itens[indiceAtivo].textContent;
        fecharSugestoes();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fecharSugestoes();
    });
  }

  function imgTag(src, alt, extraAttrs) {
    return '<img src="' + src + '" alt="' + alt + '" loading="lazy" ' + (extraAttrs || '') +
      ' onerror="this.onerror=null;this.src=\'' + PLACEHOLDER_IMG + '\';">';
  }

  // Combina imagens.principal + imagens.galeria em uma única lista, sem duplicar
  // e sem assumir quantidade fixa — qualquer imagem adicionada ao JSON aparece
  // automaticamente aqui.
  function getImagens(imovel) {
    var imagens = imovel.imagens || {};
    var lista = [];
    if (imagens.principal) lista.push(imagens.principal);
    (imagens.galeria || []).forEach(function (src) {
      if (src && lista.indexOf(src) === -1) lista.push(src);
    });
    return lista;
  }

  /* -- Filtros -------------------------------------------------------------- */

  function popularTipos(all) {
    var select = document.getElementById('filtro-tipo');
    if (!select) return;
    var tipos = Array.from(new Set(all.map(function (i) { return i.tipo; }))).sort();
    tipos.forEach(function (tipo) {
      var option = document.createElement('option');
      option.value = tipo;
      option.textContent = tipoLabel(tipo);
      select.appendChild(option);
    });
  }

  function parseMoeda(valor) {
    var limpo = (valor || '').replace(/[^\d]/g, '');
    return limpo ? Number(limpo) : '';
  }

  function definirFinalidade(valor) {
    state.modo = 'padrao';
    state.finalidade = valor;
    // Não reseta state.mostrarTodos: se o usuário já tinha clicado em
    // "Ver todos", trocar o filtro rápido não deve voltar a limitar a
    // lista a 3 imóveis (evita "perder" um imóvel visto mais abaixo).
    document.querySelectorAll('.filtros__segmento-btn').forEach(function (b) {
      var ativo = b.getAttribute('data-finalidade') === valor;
      b.classList.toggle('is-active', ativo);
      b.setAttribute('aria-selected', ativo ? 'true' : 'false');
    });
    renderizarRegular();
  }

  // Aplica no state os valores atualmente selecionados/digitados no painel
  // de filtros. Só é chamada quando o usuário aperta "Buscar" (ou dá Enter).
  function aplicarFiltros() {
    var segmentoAtivo = document.querySelector('.filtros__segmento-btn.is-active');
    var localizacaoInput = document.getElementById('filtro-localizacao');
    var tipoSelect = document.getElementById('filtro-tipo');
    var precoMinInput = document.getElementById('filtro-preco-min');
    var precoMaxInput = document.getElementById('filtro-preco-max');

    state.modo = 'padrao';
    state.finalidade = segmentoAtivo ? segmentoAtivo.getAttribute('data-finalidade') : 'todos';
    state.localizacao = localizacaoInput ? localizacaoInput.value.trim() : '';
    state.tipo = tipoSelect ? tipoSelect.value : '';
    state.precoMin = precoMinInput ? parseMoeda(precoMinInput.value) : '';
    state.precoMax = precoMaxInput ? parseMoeda(precoMaxInput.value) : '';
    state.mostrarTodos = false;

    renderizarRegular();
  }

  // Reseta o formulário de filtros e o state para o estado inicial, e
  // atualiza os resultados na hora — sem recarregar a página.
  function limparFiltros() {
    var localizacaoInput = document.getElementById('filtro-localizacao');
    var tipoSelect = document.getElementById('filtro-tipo');
    var precoMinInput = document.getElementById('filtro-preco-min');
    var precoMaxInput = document.getElementById('filtro-preco-max');

    if (localizacaoInput) {
      localizacaoInput.value = '';
      // dispara 'input' pra fechar a lista de sugestões, se estiver aberta
      localizacaoInput.dispatchEvent(new Event('input'));
    }
    if (tipoSelect) tipoSelect.value = '';
    if (precoMinInput) precoMinInput.value = '';
    if (precoMaxInput) precoMaxInput.value = '';

    document.querySelectorAll('.filtros__segmento-btn').forEach(function (b) {
      var padrao = b.getAttribute('data-finalidade') === 'todos';
      b.classList.toggle('is-active', padrao);
      b.setAttribute('aria-selected', padrao ? 'true' : 'false');
    });

    state.modo = 'padrao';
    state.finalidade = 'todos';
    state.localizacao = '';
    state.tipo = '';
    state.precoMin = '';
    state.precoMax = '';
    state.mostrarTodos = false;

    renderizarRegular();
  }

  // Impede a digitação de letras/símbolos nos campos de preço: bloqueia a
  // tecla no keydown (mantendo teclas de controle como Backspace, Tab, setas
  // e atalhos com Ctrl/Cmd) e, como reforço, também limpa qualquer caractere
  // não numérico que entre por outro caminho (colar, autocompletar, etc.).
  function bloquearLetrasPreco() {
    ['filtro-preco-min', 'filtro-preco-max'].forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;

      input.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key.length !== 1) return; // Backspace, Tab, ArrowLeft, Delete, etc.
        if (!/[0-9]/.test(e.key)) e.preventDefault();
      });

      input.addEventListener('input', function () {
        var apenasNumeros = input.value.replace(/\D/g, '');
        if (apenasNumeros !== input.value) input.value = apenasNumeros;
      });

      input.addEventListener('paste', function (e) {
        var texto = (e.clipboardData || window.clipboardData).getData('text');
        if (/\D/.test(texto)) {
          e.preventDefault();
          input.value = (input.value + texto).replace(/\D/g, '');
        }
      });
    });
  }

  function ligarFiltros() {
    // Botões Todos/Comprar/Alugar dentro do painel: aplicam o filtro de
    // finalidade imediatamente (reaproveita a mesma lógica dos links do
    // header, que já atualiza o state e re-renderiza a lista na hora).
    var segmentoBtns = document.querySelectorAll('.filtros__segmento-btn');
    segmentoBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        definirFinalidade(btn.getAttribute('data-finalidade'));
      });
    });

    // Localização, tipo e preço: apenas guardam o valor digitado/selecionado,
    // sem disparar busca — a busca só roda no clique do botão "Buscar".

    if (filtrosForm) {
      filtrosForm.addEventListener('submit', function (e) {
        e.preventDefault();
        aplicarFiltros();
      });
    }

    var verTodosBtn = document.querySelector('[data-ver-todos]');
    if (verTodosBtn) {
      verTodosBtn.addEventListener('click', function () {
        // "Ver todos" remove o limite de 3 imóveis, mas continua respeitando
        // o filtro atualmente ativo (finalidade, tipo, localização, preço,
        // favoritos ou terrenos) — não deve mostrar imóveis fora do filtro.
        state.mostrarTodos = true;
        renderizarRegular();
      });
    }

    var limparBtn = document.querySelector('[data-limpar-filtros]');
    if (limparBtn) {
      limparBtn.addEventListener('click', limparFiltros);
    }

    var favoritosBtn = document.querySelector('[data-filtro-favoritos]');
    if (favoritosBtn) {
      favoritosBtn.addEventListener('click', function () {
        state.modo = state.modo === 'favoritos' ? 'padrao' : 'favoritos';
        renderizarRegular();
      });
    }

    bloquearLetrasPreco();
  }

  // Liga os links do header (Comprar, Alugar, Terrenos) ao grid de imóveis
  // já existente — sem criar páginas novas.
  function ligarLinksHeader() {
    document.querySelectorAll('[data-filtro-header]').forEach(function (link) {
      link.addEventListener('click', function () {
        var modo = link.getAttribute('data-filtro-header');
        if (modo === 'comprar') {
          definirFinalidade('venda');
        } else if (modo === 'alugar') {
          definirFinalidade('aluguel');
        } else if (modo === 'terrenos') {
          state.modo = 'terrenos';
          state.mostrarTodos = false;
          renderizarRegular();
        }
      });
    });
  }

  function combina(imovel) {
    if (state.modo === 'favoritos') {
      return isFavorito(imovel.id);
    }

    if (state.modo === 'terrenos') {
      if (imovel.tipo !== 'terreno') return false;
    } else {
      if (state.finalidade !== 'todos') {
        // Terrenos são sempre para venda — "Comprar" deve incluí-los mesmo
        // que o campo "finalidade" do imóvel não esteja preenchido como
        // 'venda' no JSON.
        var terrenoEmVenda = state.finalidade === 'venda' && imovel.tipo === 'terreno';
        if (imovel.finalidade !== state.finalidade && !terrenoEmVenda) return false;
      }
      if (state.tipo && imovel.tipo !== state.tipo) return false;
    }

    if (state.localizacao) {
      if (!correspondeLocalizacao(localizacaoTexto(imovel), state.localizacao)) return false;
    }
    if (state.precoMin && imovel.preco < state.precoMin) return false;
    if (state.precoMax && imovel.preco > state.precoMax) return false;
    return true;
  }

  /* -- Grid de imóveis -------------------------------------------------------- */

  function cardRegularHTML(imovel) {
    var imagens = getImagens(imovel);
    var favorito = isFavorito(imovel.id);
    return (
      '<article class="card-regular" data-id="' + imovel.id + '" tabindex="0" role="button" ' +
      'aria-label="Ver detalhes de ' + imovel.titulo + '">' +
      '<div class="card-regular__media">' +
      imgTag(imagens[0] || PLACEHOLDER_IMG, imovel.titulo) +
      '<span class="card-regular__tag">' + disponibilidadeLabel(imovel) + '</span>' +
      '<button type="button" class="card-regular__favorito' + (favorito ? ' is-ativo' : '') + '" ' +
      'data-favorito aria-pressed="' + (favorito ? 'true' : 'false') + '" ' +
      'aria-label="Favoritar ' + imovel.titulo + '">' + ICONS.coracao + '</button>' +
      '</div>' +
      '<div class="card-regular__corpo">' +
      '<p class="card-regular__local">' + ICONS.pin + localizacaoTexto(imovel) + '</p>' +
      '<h3 class="card-regular__titulo">' + imovel.titulo + '</h3>' +
      '<div class="card-regular__rodape">' +
      '<span class="card-regular__preco">' + formatarPreco(imovel) + '</span>' +
      '<div class="card-regular__specs">' +
      (imovel.quartos ? '<span>' + ICONS.bed + imovel.quartos + '</span>' : '') +
      (imovel.vagas ? '<span>' + ICONS.car + imovel.vagas + '</span>' : '') +
      '<span>' + ICONS.area + imovel.area + ' m²</span>' +
      '</div></div></div></article>'
    );
  }

  function renderizarRegular() {
    var favoritosBtn = document.querySelector('[data-filtro-favoritos]');
    if (favoritosBtn) {
      var ativo = state.modo === 'favoritos';
      favoritosBtn.classList.toggle('is-active', ativo);
      favoritosBtn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    }

    var base = state.all.filter(combina);

    var verTodosBtn = document.querySelector('[data-ver-todos]');

    if (!base.length) {
      var mensagemVazia = state.modo === 'favoritos'
        ? 'Você ainda não favoritou nenhum imóvel.'
        : 'Nenhum imóvel encontrado com esses filtros.';
      regularGrid.innerHTML = '<p class="grid-mensagem">' + mensagemVazia + '</p>';
      regularGrid.dataset.estado = 'vazio';
      if (verTodosBtn) verTodosBtn.hidden = true;
      return;
    }

    var visiveis = state.mostrarTodos ? base : base.slice(0, LIMITE_INICIAL);

    regularGrid.innerHTML = visiveis.map(cardRegularHTML).join('');
    regularGrid.dataset.estado = 'pronto';

    if (verTodosBtn) {
      verTodosBtn.hidden = state.mostrarTodos || base.length <= LIMITE_INICIAL;
    }

    regularGrid.querySelectorAll('[data-id]').forEach(function (el) {
      el.addEventListener('click', function () { abrirDetalhe(el.getAttribute('data-id')); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          abrirDetalhe(el.getAttribute('data-id'));
        }
      });
    });

    regularGrid.querySelectorAll('[data-favorito]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var artigo = btn.closest('[data-id]');
        var id = artigo ? artigo.getAttribute('data-id') : null;
        if (!id) return;

        var ativo = alternarFavorito(id);
        btn.classList.toggle('is-ativo', ativo);
        btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');

        if (state.modo === 'favoritos' && !ativo) {
          renderizarRegular();
        }
      });
    });
  }

  /* -- Overlay de detalhe ------------------------------------------------------ */

  // Estado da galeria de fotos do imóvel aberto no overlay: a lista de
  // imagens e o índice da foto exibida atualmente. Usado pelas setas de
  // navegação (clique nos botões ou teclado ←/→).
  var galeriaAtual = [];
  var galeriaIndice = 0;

  function whatsappLink(imovel) {
    var numero = (state.whatsapp || '').replace(/\D/g, '');
    var texto = encodeURIComponent('Olá! Tenho interesse no imóvel "' + imovel.titulo + '" (código ' + imovel.id + ').');
    return 'https://wa.me/' + numero + '?text=' + texto;
  }

  function detalheHTML(imovel) {
    var galeria = getImagens(imovel);
    if (!galeria.length) galeria = [PLACEHOLDER_IMG];

    var miniaturas = galeria.map(function (src, i) {
      return '<button type="button" class="' + (i === 0 ? 'is-ativa' : '') + '" data-src="' + src + '">' +
        imgTag(src, imovel.titulo + ' - foto ' + (i + 1)) + '</button>';
    }).join('');

    var caracteristicas = (imovel.caracteristicas || []).map(function (c) {
      return '<li>' + c + '</li>';
    }).join('');

    return (
      '<div class="detalhe__galeria-principal" id="detalhe-galeria-principal">' +
      imgTag(galeria[0], imovel.titulo) +
      (galeria.length > 1 ?
        '<button type="button" class="detalhe__galeria-seta detalhe__galeria-seta--prev" data-galeria-prev aria-label="Foto anterior">' + ICONS.arrow + '</button>' +
        '<button type="button" class="detalhe__galeria-seta detalhe__galeria-seta--next" data-galeria-next aria-label="Próxima foto">' + ICONS.arrow + '</button>'
        : '') +
      '</div>' +
      (galeria.length > 1 ? '<div class="detalhe__galeria-miniaturas">' + miniaturas + '</div>' : '<div style="margin-bottom:var(--espacamento-32)"></div>') +

      '<div class="detalhe__cabecalho">' +
      '<div>' +
      '<p class="detalhe__tipo">' + tipoLabel(imovel.tipo) + ' · ' + (imovel.finalidade === 'aluguel' ? 'Aluguel' : 'Venda') + '</p>' +
      '<h2 class="detalhe__titulo" id="imovel-overlay-titulo">' + imovel.titulo + '</h2>' +
      '<p class="detalhe__local">' + ICONS.pin + localizacaoTexto(imovel) + (imovel.localizacao && imovel.localizacao.estado ? ' - ' + imovel.localizacao.estado : '') + '</p>' +
      '</div>' +
      '<span class="detalhe__preco">' + formatarPreco(imovel) + '</span>' +
      '</div>' +

      '<div class="detalhe__specs">' +
      (imovel.area ? '<div class="detalhe__spec">' + ICONS.area + '<strong>' + imovel.area + ' m²</strong><span>Área</span></div>' : '') +
      (imovel.quartos ? '<div class="detalhe__spec">' + ICONS.bed + '<strong>' + imovel.quartos + '</strong><span>Quartos</span></div>' : '') +
      (imovel.banheiros ? '<div class="detalhe__spec">' + ICONS.bath + '<strong>' + imovel.banheiros + '</strong><span>Banheiros</span></div>' : '') +
      (imovel.vagas ? '<div class="detalhe__spec">' + ICONS.car + '<strong>' + imovel.vagas + '</strong><span>Vagas</span></div>' : '') +
      '</div>' +

      (imovel.descricao ? '<p class="detalhe__secao-titulo">Sobre o imóvel</p><p class="detalhe__descricao">' + imovel.descricao + '</p>' : '') +

      (caracteristicas ? '<p class="detalhe__secao-titulo">Características</p><ul class="detalhe__caracteristicas">' + caracteristicas + '</ul>' : '') +

      '<div class="detalhe__rodape">' +
      '<span class="detalhe__codigo">Código ' + imovel.id + '</span>' +
      '<a class="detalhe__whatsapp" href="' + whatsappLink(imovel) + '" target="_blank" rel="noopener">' +
      ICONS.whatsapp + 'Falar sobre este imóvel</a>' +
      '</div>'
    );
  }

  // Troca a foto principal exibida pelo índice informado, com wraparound
  // (da última volta pra primeira e vice-versa) e mantém a miniatura
  // correspondente destacada. Usada tanto pelas miniaturas quanto pelas
  // setas (clique ou teclado).
  function mostrarFoto(indice) {
    if (!galeriaAtual.length) return;
    galeriaIndice = ((indice % galeriaAtual.length) + galeriaAtual.length) % galeriaAtual.length;

    var principal = document.getElementById('detalhe-galeria-principal');
    var img = principal ? principal.querySelector('img') : null;
    if (img) img.src = galeriaAtual[galeriaIndice];

    var botoes = overlayConteudo.querySelectorAll('.detalhe__galeria-miniaturas button');
    botoes.forEach(function (b, i) {
      b.classList.toggle('is-ativa', i === galeriaIndice);
    });
  }

  function ligarGaleria() {
    var botoes = overlayConteudo.querySelectorAll('.detalhe__galeria-miniaturas button');
    botoes.forEach(function (btn, i) {
      btn.addEventListener('click', function () { mostrarFoto(i); });
    });

    var setaPrev = overlayConteudo.querySelector('[data-galeria-prev]');
    var setaNext = overlayConteudo.querySelector('[data-galeria-next]');
    if (setaPrev) setaPrev.addEventListener('click', function () { mostrarFoto(galeriaIndice - 1); });
    if (setaNext) setaNext.addEventListener('click', function () { mostrarFoto(galeriaIndice + 1); });
  }

  function abrirDetalhe(id, semHistorico) {
    var imovel = state.all.find(function (i) { return i.id === id; });
    if (!imovel) return;

    galeriaAtual = getImagens(imovel);
    if (!galeriaAtual.length) galeriaAtual = [PLACEHOLDER_IMG];
    galeriaIndice = 0;

    overlayConteudo.innerHTML = detalheHTML(imovel);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    ligarGaleria();

    if (!semHistorico) {
      var url = new URL(window.location);
      url.searchParams.set('imovel', id);
      window.history.pushState({ imovel: id }, '', url);
    }
  }

  function fecharDetalhe(semHistorico) {
    overlay.hidden = true;
    document.body.style.overflow = '';

    if (!semHistorico) {
      var url = new URL(window.location);
      url.searchParams.delete('imovel');
      window.history.pushState({}, '', url);
    }
  }

  function ligarOverlay() {
    document.querySelectorAll('[data-overlay-fechar]').forEach(function (el) {
      el.addEventListener('click', function () { fecharDetalhe(); });
    });
    document.addEventListener('keydown', function (e) {
      if (overlay.hidden) return;
      if (e.key === 'Escape') fecharDetalhe();
      if (e.key === 'ArrowRight') mostrarFoto(galeriaIndice + 1);
      if (e.key === 'ArrowLeft') mostrarFoto(galeriaIndice - 1);
    });
    window.addEventListener('popstate', function () {
      var id = new URL(window.location).searchParams.get('imovel');
      if (id) {
        abrirDetalhe(id, true);
      } else {
        fecharDetalhe(true);
      }
    });
  }

  /* -- Inicialização ------------------------------------------------------------ */

  fetch('./imoveis.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Não foi possível carregar imoveis.json');
      return res.json();
    })
    .then(function (dados) {
      state.all = dados.imoveis || [];
      state.whatsapp = dados.whatsapp || '';

      var headerCta = document.querySelector('.header__cta');
      if (headerCta && state.whatsapp) {
        var numeroGeral = state.whatsapp.replace(/\D/g, '');
        var textoGeral = encodeURIComponent('Olá! Tenho uma dúvida e gostaria de mais informações.');
        headerCta.setAttribute('href', 'https://wa.me/' + numeroGeral + '?text=' + textoGeral);
        headerCta.setAttribute('target', '_blank');
        headerCta.setAttribute('rel', 'noopener');
      }

      popularTipos(state.all);
      ligarAutocompleteLocalizacao(state.all);
      ligarFiltros();
      ligarLinksHeader();
      ligarOverlay();
      renderizarRegular();

      var idInicial = new URL(window.location).searchParams.get('imovel');
      if (idInicial) abrirDetalhe(idInicial, true);
    })
    .catch(function (erro) {
      regularGrid.innerHTML = '<p class="grid-mensagem">Não foi possível carregar os imóveis agora.</p>';
      console.error(erro);
    });
})();
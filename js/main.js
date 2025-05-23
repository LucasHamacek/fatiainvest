// Configuração do Supabase
const SUPABASE_URL = 'https://dblzsjtnokhbkfimghjw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibHpzanRub2toYmtmaW1naGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTMyMTgsImV4cCI6MjA2MzIyOTIxOH0.maoqreHeJbNH6Y6AjPGNMJcpAbwqb8UUcV1ldPj_Wi0';

// Inicializar o cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos DOM
const stockList = document.getElementById('stock-list');
const cardTemplate = document.getElementById('card-template');
const searchInput = document.getElementById('search');
let setorAtivo = 'Todos';
let todasAcoes = [];

// Controle de paginação
let itensPorPagina = 10;
let paginaAtual = 1;
let carregando = false;
let acoesFiltradasGlobal = [];

// Tickes a ocultar
const tickersOcultos = ["AESB3", "CIEL3", "ENAT3", "ODPV3", "TRPL3", "TRPL4"]; // Adicione aqui os tickers que deseja ocultar

// Variável para ordenação
let valorOrdenar = "";

// Carregar dados pré-calculados do Supabase
async function carregarDados() {
  try {
    const { data, error } = await supabaseClient.rpc('calcular_dados_acoes');
    if (error) throw error;

    todasAcoes = data;
    aplicarFiltros();

    // Configurar eventos para filtros
    document.querySelectorAll('.setor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.setor-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setorAtivo = btn.getAttribute('data-setor');
        paginaAtual = 1;
        aplicarFiltros();
      });
    });

    searchInput.addEventListener('input', () => {
      paginaAtual = 1;
      aplicarFiltros();
    });

    // Ordenação por dropdown customizado (botão)
    document.querySelectorAll('.ordenar-opcao').forEach(btn => {
      btn.addEventListener('click', function () {
        valorOrdenar = this.getAttribute('data-value');
        paginaAtual = 1;
        aplicarFiltros();
        document.getElementById('ordenarDropdown').classList.add('hidden');
      });
    });

    // Botão para abrir/fechar dropdown de ordenação
    const ordenarBtn = document.getElementById('ordenarBtn');
    if (ordenarBtn) {
      ordenarBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        document.getElementById('ordenarDropdown').classList.toggle('hidden');
      });
    }
    document.addEventListener('click', function () {
      document.getElementById('ordenarDropdown')?.classList.add('hidden');
    });

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

// Função para buscar dividendos por ano no Supabase
async function carregarGraficoDividendos(ticker) {
  const { data, error } = await supabaseClient
    .rpc('dividendos_por_ano', { ticker_param: ticker });
  if (error) {
    console.error('Erro ao buscar dividendos:', error);
    return [];
  }
  return data;
}

// Função para mostrar o gráfico usando Chart.js
async function mostrarGraficoDividendos(ticker) {
  const dados = await carregarGraficoDividendos(ticker);
  const ctx = document.getElementById('grafico-dividendos').getContext('2d');
  if (window.graficoDividendos) window.graficoDividendos.destroy();

  window.graficoDividendos = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.map(d => d.ano),
      datasets: [{
        label: 'Dividendo por Ano',
        data: dados.map(d => d.dividendo),
        backgroundColor: '#60a5fa'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Renderiza apenas os itens da página atual (append)
function renderizarAcoesPaginado(acoes, append = false) {
  if (!append) stockList.innerHTML = '';

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = paginaAtual * itensPorPagina;

  acoes.slice(inicio, fim).forEach(acao => {
    const card = cardTemplate.content.cloneNode(true);

    card.querySelector('[data-ticker]').textContent = acao.ticker || '';
    card.querySelector('[data-companhia]').textContent = acao.companhia || '';
    card.querySelector('[data-preco_max_calc]').innerHTML =
      acao.preco_max_calc !== undefined
        ? `${acao.preco_max_calc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span class="text-base font-light">BRL</span>`
        : '';
    card.querySelector('[data-dy_medio_calc]').innerHTML =
      acao.dy_medio_calc !== undefined
        ? `${acao.dy_medio_calc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% <span class="text-base font-light"> DY</span>`
        : '';

    // Sheet bottom ao clicar no card
    card.querySelector('.card-stock').addEventListener('click', async () => {
      document.getElementById('sheet-ticker').textContent = acao.ticker;
      document.getElementById('sheet-companhia').textContent = acao.companhia;
      document.getElementById('sheet-setor').textContent = acao.setor;
      document.getElementById('sheet-preco').innerHTML = acao.preco_max_calc !== undefined
        ? acao.preco_max_calc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
        ' <span class="text-base font-light">BRL</span>'
        : '';
      document.getElementById('sheet-dy').textContent = acao.dy_medio_calc !== undefined ?
        acao.dy_medio_calc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%" : '';
      document.getElementById('sheet-dividendo-medio').innerHTML =
        acao.dividendo_calc !== undefined
          ? acao.dividendo_calc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
          ' <span class="text-base font-light">BRL</span>'
          : '';
      document.getElementById('sheet').classList.remove('translate-y-full');
      document.getElementById('sheet-overlay').classList.remove('hidden');
      document.getElementById('sheet').classList.remove('translate-y-full');
      document.getElementById('sheet-overlay').classList.remove('hidden');

      mostrarGraficoDividendos(acao.ticker);

      // Preencher a tabela de dividendos por ano
      const dados = await carregarGraficoDividendos(acao.ticker);
      const tabela = document.getElementById('tabela-dividendos').querySelector('tbody');
      tabela.innerHTML = '';
      dados.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td class="py-1">${d.ano}</td>
      <td class="py-1">R$ ${d.dividendo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    `;
        tabela.appendChild(tr);
      });

      // Limpa os campos antes de buscar
      document.getElementById('sheet-preco-atual').textContent = '...';
      document.getElementById('sheet-variacao').textContent = '...';

      // Busca o preço atual na Brapi usando token na URL
      fetch(`https://brapi.dev/api/quote/${acao.ticker}?token=beApgDhEPuP4bPgiLLa7qn`)
        .then(res => res.json())
        .then(data => {
          const precoAtual = data.results?.[0]?.regularMarketPrice;
          if (
            precoAtual !== undefined &&
            acao.preco_max_calc !== undefined &&
            acao.preco_max_calc !== 0
          ) {
            document.getElementById('sheet-preco-atual').innerHTML =
              precoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
              ' <span class="text-base font-light">BRL</span>';

            const variacao = ((precoAtual - acao.preco_max_calc) / acao.preco_max_calc) * 100;
            const variacaoFormatada =
              (variacao > 0 ? '+' : '') +
              variacao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
              '%';
            document.getElementById('sheet-variacao').textContent = variacaoFormatada;

            if (acao.dividendo_calc !== undefined && precoAtual > 0) {
              const dyProjecao = (acao.dividendo_calc / precoAtual) * 100;
              document.getElementById('sheet-dy-projecao').textContent =
                dyProjecao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
            } else {
              document.getElementById('sheet-dy-projecao').textContent = 'N/A';
            }
          } else {
            document.getElementById('sheet-preco-atual').textContent = 'N/A';
            document.getElementById('sheet-variacao').textContent = 'N/A';
            document.getElementById('sheet-dy-projecao').textContent = 'N/A';
          }
        })
        .catch(() => {
          document.getElementById('sheet-preco-atual').textContent = 'Erro';
          document.getElementById('sheet-variacao').textContent = 'Erro';
          document.getElementById('sheet-dy-projecao').textContent = 'Erro';
        });
    });

    stockList.appendChild(card);
  });

  carregando = false;
}

// Aplicar filtros (pesquisa + setor + ordenação)
function aplicarFiltros() {
  const termoPesquisa = searchInput.value.toLowerCase();

  acoesFiltradasGlobal = todasAcoes
    .filter(acao => !tickersOcultos.includes(acao.ticker))
    .filter(acao => {
      // Filtro de pesquisa
      const matchesPesquisa =
        (acao.ticker && acao.ticker.toLowerCase().includes(termoPesquisa)) ||
        (acao.companhia && acao.companhia.toLowerCase().includes(termoPesquisa));

      // Filtro de setor
      const matchesSetor =
        setorAtivo === 'Todos' ||
        (acao.setor && acao.setor === setorAtivo);

      return matchesPesquisa && matchesSetor;
    });

  // Ordenação
  if (valorOrdenar) {
    const [campo, ordem] = valorOrdenar.split('-');
    acoesFiltradasGlobal.sort((a, b) => {
      if (ordem === 'asc') return (a[campo] ?? 0) - (b[campo] ?? 0);
      else return (b[campo] ?? 0) - (a[campo] ?? 0);
    });
  }

  renderizarAcoesPaginado(acoesFiltradasGlobal, false);
}

// Carregamento infinito ao rolar
window.addEventListener('scroll', () => {
  if (carregando) return;
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    if (acoesFiltradasGlobal.length > paginaAtual * itensPorPagina) {
      carregando = true;
      paginaAtual++;
      renderizarAcoesPaginado(acoesFiltradasGlobal, true);
    }
  }
});

// Evento para fechar o sheet bottom
const fecharSheetBtn = document.getElementById('fecharSheet');
if (fecharSheetBtn) {
  fecharSheetBtn.onclick = () => {
    document.getElementById('sheet').classList.add('translate-y-full');
    document.getElementById('sheet-overlay').classList.add('hidden');
  };
}

// Fecha o sheet ao clicar fora do conteúdo
document.addEventListener('mousedown', function (e) {
  const sheet = document.getElementById('sheet');
  const overlay = document.getElementById('sheet-overlay');
  if (!sheet.classList.contains('translate-y-full')) {
    const sheetContent = sheet.querySelector('.flex.flex-col.p-6');
    if (sheet && !sheetContent.contains(e.target) && overlay.contains(e.target)) {
      sheet.classList.add('translate-y-full');
      overlay.classList.add('hidden');
    }
  }
});

// Expande/retrai o sheet ao clicar no traço
const sheet = document.getElementById('sheet');
const dragger = document.getElementById('sheet-dragger');
let expanded = false;

if (dragger && sheet) {
  dragger.addEventListener('click', () => {
    expanded = !expanded;
    if (expanded) {
      sheet.classList.add('max-h-[80vh]');
      sheet.classList.remove('max-h-[30vh]');
    } else {
      sheet.classList.remove('max-h-[80vh]');
      sheet.classList.add('max-h-[30vh]');
    }
  });
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
});
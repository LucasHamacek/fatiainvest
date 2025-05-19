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

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
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
        ? `${acao.preco_max_calc.toFixed(2)} <span class="text-base font-light">BRL</span>`
        : '';
    card.querySelector('[data-dy_medio_calc]').innerHTML =
      acao.dy_medio_calc !== undefined
        ? `${acao.dy_medio_calc.toFixed(2)}% <span class="text-base font-light"> DY</span>`
        : '';

    stockList.appendChild(card);
  });

  carregando = false;
}

// Aplicar filtros (pesquisa + setor)
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

  renderizarAcoesPaginado(acoesFiltradasGlobal, false);
}

const selectOrdenar = document.getElementById('ordenar');

// Adicione este evento logo após o carregamento dos dados
if (selectOrdenar) {
  selectOrdenar.addEventListener('change', () => {
    paginaAtual = 1;
    aplicarFiltros();
  });
}

// Modifique a função aplicarFiltros para ordenar:
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

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
});
/* ==================== CONFIGURAÇÃO ==================== */
const SHEETY_URL = "https://api.sheety.co/a29cb7c503fdebe716d141ffecf20c16/dataFatiaInvest/dataOutputPremiumBrasil3641";

/* ==================== VARIÁVEIS DE CONTROLE ==================== */
let allStocks = [];
let renderedCount = 0;
const PAGE_SIZE = 10;

/* ==================== FUNÇÕES ==================== */
async function fetchStocks() {
    try {
        const res = await fetch(SHEETY_URL);
        if (!res.ok) throw new Error("Erro ao buscar dados do Sheety");
        const json = await res.json();
        console.log(json);
        // Pega o array correto e ignora as duas primeiras linhas
        const data = json.dataOutputPremiumBrasil3641 || json.lista || json.stocks || [];
        return data.slice(1);
    } catch (err) {
        console.error(err);
        alert("Falha ao carregar dados. Verifique o console.");
        return [];
    }
}

// Filtro por setor
let setorSelecionado = "Todos";

document.querySelectorAll('.setor-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    // Atualiza visual
    document.querySelectorAll('.setor-btn').forEach(b => {
      b.classList.remove('bg-white', 'font-semibold', 'text-black');
      b.classList.add('text-gray-500', 'font-normal');
    });
    this.classList.add('bg-white', 'font-semibold', 'text-black');
    this.classList.remove('text-gray-500', 'font-normal');

    setorSelecionado = this.dataset.setor;
    filtrarEAjustar();
  });
});

// Função para filtrar por setor e pesquisa
function filtrarEAjustar() {
  const termo = document.getElementById('search').value.trim().toLowerCase();
  let filtrados = allStocks;

  if (setorSelecionado !== "Todos") {
    filtrados = filtrados.filter(s => (s.setorUnico || '').toLowerCase() === setorSelecionado.toLowerCase());
  }
  if (termo) {
    filtrados = filtrados.filter(s =>
      s.ticker.toLowerCase().includes(termo) ||
      (s.companhia || '').toLowerCase().includes(termo)
    );
  }
  document.getElementById("stock-list").innerHTML = "";
  renderedCount = PAGE_SIZE;
  renderStocks(filtrados, 0, renderedCount);
}

// Atualize o filtro de pesquisa para usar filtrarEAjustar
document.getElementById('search').addEventListener('input', filtrarEAjustar);

function renderStocks(stocks, start, count) {
    const list = document.getElementById("stock-list");
    const template = document.getElementById("card-template").content;

    for (let i = start; i < Math.min(start + count, stocks.length); i++) {
        const s = stocks[i];
        const clone = document.importNode(template, true);
        clone.querySelector("[data-ticker]").textContent = s.ticker;
        clone.querySelector("[data-companhia]").textContent = (s.companhia || "").replace(/\s+$/, "");
        clone.querySelector("[data-valorMaximoPadrao]").innerHTML = `${Number(s.valorMaximoPadrao).toFixed(2)} <span class="text-sm font-light">BRL</span>`;
        clone.querySelector("[data-dyMedio]").innerHTML = `${(Number(s.dyMedio) * 100).toFixed(2)}% <span class="text-sm font-light">DY</span>`;
        // Adicione o evento de clique no card
        clone.querySelector('.card-stock').addEventListener('click', () => {
            window.location.href = `detalhe.html?ticker=${encodeURIComponent(s.ticker)}`;
        });
        list.appendChild(clone);
    }
}

function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        if (renderedCount < allStocks.length) {
            renderStocks(allStocks, renderedCount, PAGE_SIZE);
            renderedCount += PAGE_SIZE;
        }
    }
}

/* ==================== INICIALIZAÇÃO ==================== */
(async () => {
    allStocks = await fetchStocks();
    renderedCount = PAGE_SIZE;
    renderStocks(allStocks, 0, PAGE_SIZE);
    window.addEventListener('scroll', handleScroll);
})();
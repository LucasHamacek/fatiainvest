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

function renderStocks(stocks, start, count) {
    const list = document.getElementById("stock-list");
    const template = document.getElementById("card-template").content;

    for (let i = start; i < Math.min(start + count, stocks.length); i++) {
        const s = stocks[i];
        const clone = document.importNode(template, true);
        clone.querySelector("[data-ticker]").textContent = s.ticker;
        let companhia = s.companhia || "";
        if (companhia.length > 21) {
            companhia = companhia.slice(0, 21).trimEnd() + "...";
        }
        clone.querySelector("[data-companhia]").textContent = companhia;
        clone.querySelector("[data-valorMaximoPadrao]").textContent = `$${Number(s.valorMaximoPadrao).toFixed(2)}`;
        clone.querySelector("[data-dyMedio]").textContent = `${(Number(s.dyMedio) * 100).toFixed(2)}%`;
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
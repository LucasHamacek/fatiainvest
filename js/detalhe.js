const urlParams = new URLSearchParams(window.location.search);
const ticker = urlParams.get('ticker');

// Busque os dados da API (igual ao main.js)
async function fetchStocks() {
    const SHEETY_URL = "https://api.sheety.co/a29cb7c503fdebe716d141ffecf20c16/dataFatiaInvest/dataOutputPremiumBrasil3641";
    const res = await fetch(SHEETY_URL);
    const json = await res.json();
    const data = json.dataOutputPremiumBrasil3641 || json.lista || json.stocks || [];
    return data.slice(1);
}

function renderDetalhe(stock) {
    if (!stock) {
        document.getElementById('detalhe-card').innerHTML = '<p>Ação não encontrada.</p>';
        return;
    }
    document.getElementById('detalhe-card').innerHTML = `
      <div class="bg-[#E8E8E8] p-6 rounded-2xl max-w-md mx-auto">
        <div class="text-4xl text-left font-medium">${stock.ticker}</div>
        <div class="text-base text-left font-light text-[#A2A2A3] mb-4">${stock.companhia}</div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="font-medium text-lg">${Number(stock.valorMaximoPadrao).toFixed(2)}<span class="text-sm font-light"> BRL</span></div>
            <div class="text-sm text-left font-light text-[#A2A2A3]">Preço Máximo</div>
          </div>
          <div>
            <div class="font-medium text-lg">${Number(stock.valorAtual || 0).toFixed(2)}<span class="text-sm font-light"> BRL</span></div>
            <div class="text-sm text-left font-light text-[#A2A2A3]">Preço Atual</div>
          </div>
          <div>
            <div class="font-medium text-lg">${(Number(stock.variacaoValorMaximoPadrao) * 100).toFixed(2)}%</div>
            <div class="text-sm text-left font-light text-[#A2A2A3]">Variação</div>
          </div>
          <div>
            <div class="font-medium text-lg">${Number(stock.dividendoMedio || 0).toFixed(2)}<span class="text-sm font-light"> BRL</span></div>
            <div class="text-sm text-left font-light text-[#A2A2A3]">Dividendo Médio</div>
          </div>
          <div>
            <div class="font-medium text-lg">${(Number(stock.dyMedio) * 100).toFixed(2)}%</div>
            <div class="text-sm text-left font-light text-[#A2A2A3]">Dividend Yield</div>
          </div>
          <div>
            <div class="font-medium text-base">${(Number(stock.projecaoDy) * 100).toFixed(2)}%</div>
            <div class="text-sm text-left font-light text-[#A2A2A3]">Projeção Dividend Yield</div>
          </div>
        </div>
      </div>
    `;
}

(async () => {
    const stocks = await fetchStocks();
    const stock = stocks.find(s => s.ticker === ticker);
    renderDetalhe(stock);
})();
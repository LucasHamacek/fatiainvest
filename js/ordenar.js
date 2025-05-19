    const ordenarBtn = document.getElementById('ordenarBtn');
    const ordenarDropdown = document.getElementById('ordenarDropdown');
    const ordenarBtnLabel = document.getElementById('ordenarBtnLabel');
    let valorOrdenar = "";

    ordenarBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      ordenarDropdown.classList.toggle('hidden');
    });

    // Fecha o dropdown ao clicar fora
    document.addEventListener('click', function () {
      ordenarDropdown.classList.add('hidden');
    });

    // Seleciona opção
    document.querySelectorAll('.ordenar-opcao').forEach(btn => {
      btn.addEventListener('click', function (e) {
        valorOrdenar = this.getAttribute('data-value');
        ordenarBtnLabel.textContent = this.textContent;
        ordenarDropdown.classList.add('hidden');
        paginaAtual = 1;
        aplicarFiltros();
      });
    });
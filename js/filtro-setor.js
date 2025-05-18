document.addEventListener('DOMContentLoaded', function () {
  // Controle de botão ativo do filtro de setores
  document.querySelectorAll('.setor-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.setor-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  const wrapper = document.getElementById('setor-filtro-wrapper');
  const scrollLeftBtn = document.getElementById('scroll-left');
  const scrollRightBtn = document.getElementById('scroll-right');
  const scrollAmount = 120;

  function updateButtons() {
    // Mostra/esconde botões conforme necessário
    scrollLeftBtn.style.display = wrapper.scrollLeft > 0 ? 'block' : 'none';
    scrollRightBtn.style.display = (wrapper.scrollLeft + wrapper.offsetWidth) < wrapper.scrollWidth ? 'block' : 'none';
  }

  scrollLeftBtn.addEventListener('click', () => {
    wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  scrollRightBtn.addEventListener('click', () => {
    wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  wrapper.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);

  // Inicializa
  setTimeout(updateButtons, 200);
});
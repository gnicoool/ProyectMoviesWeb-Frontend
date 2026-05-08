export function renderNotFound(container) {
  container.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'page-centered';

  page.innerHTML = `
    <h1 class="page-centered-title">404 Página no encontrada</h1>
    <p class="home-sub">La ruta no existe.</p>
    <a href="/" class="btn-primary home-cta">Volver al inicio</a>
  `;

  container.appendChild(page);
}

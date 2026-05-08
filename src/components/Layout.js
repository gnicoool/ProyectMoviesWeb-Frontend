export function createLayout() {
  const app = document.createElement('div');
  app.className = 'app';

  const header = document.createElement('header');
  header.className = 'header';

  const brand = document.createElement('div');
  brand.className = 'header-logo';
  const brandLink = document.createElement('a');
  brandLink.href = '/';
  brandLink.textContent = 'Cine web';
  brand.appendChild(brandLink);

  const nav = document.createElement('nav');
  nav.className = 'header-nav';
  nav.setAttribute('aria-label', 'Main');

  const links = [
    { href: '/', text: 'Inicio', nav: 'home' },
    { href: '/movies', text: 'Catalogo', nav: 'catalog' },
    { href: '/crear', text: 'Agregar película', nav: 'crear' },
    { href: 'https://github.com/gnicoool/ProyectMoviesWeb-Frontend', text: 'Ver repositorio'},
  ];

  links.forEach(({ href, text, nav: navKey }) => {
    const a = document.createElement('a');
    a.href = href;
    a.className = 'header-link';
    a.dataset.nav = navKey;
    a.textContent = text;
    nav.appendChild(a);
  });

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'header-toggle';
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.setAttribute('aria-controls', 'main-nav');
  toggleBtn.setAttribute('aria-label', 'Open menu');
  toggleBtn.textContent = '☰';

  nav.id = 'main-nav';

  toggleBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  header.appendChild(brand);
  header.appendChild(nav);
  header.appendChild(toggleBtn);

  const main = document.createElement('main');
  main.className = 'main';
  main.id = 'main-content';

  app.appendChild(header);
  app.appendChild(main);

  return app;
}

export function setActiveNav(page) {
  document.querySelectorAll('.header-link').forEach((el) => {
    const key = el.dataset.nav;
    const isActive =
      page === 'detail'
        ? key === 'catalog'
        : page !== '' && key === page;
    el.classList.toggle('activa', isActive);
  });
}

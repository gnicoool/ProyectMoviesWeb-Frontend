import { setActiveNav } from './components/Layout.js';
import { renderHome } from './pages/Home.js';
import { renderCatalog } from './pages/Catalog.js';
import { renderNotFound } from './pages/NotFound.js';
import { setNavigateHandler } from './router.js';

function matchRoute(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return { 
    name: 'home'
  };
  if (clean === '/movies') return { 
    name: 'catalog' 
  };
  return { 
    name: 'notfound' 
  };
}

export function createRenderRoute() {
  function renderRoute() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const route = matchRoute(window.location.pathname);

    if (route.name === 'home') {
      setActiveNav('home');
      renderHome(main);
      return;
    }
    if (route.name === 'catalog') {
      setActiveNav('catalog');
      renderCatalog(main);
      return;
    }

    setActiveNav('');
    renderNotFound(main);
  }

  setNavigateHandler(renderRoute);
  return renderRoute;
}

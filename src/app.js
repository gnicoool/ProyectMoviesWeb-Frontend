import { setActiveNav } from './components/Layout.js';
import { renderHome } from './pages/Home.js';
import { renderCatalog } from './pages/Catalog.js';
import { renderDetalle } from './pages/Detalles.js';
import { renderNotFound } from './pages/NotFound.js';
import { renderEditarMovie } from './pages/EditarMovie.js';
import { renderCrearMovie } from './pages/CrearMovie.js';
import { setNavigateHandler } from './router.js';

function matchRoute(pathname) {
  const base = '/ProyectMoviesWeb-Frontend/';

  const clean = pathname
  .replace(base, '')
  .replace(/\/+$/, '') || '/';

  if (clean === '/') return { name: 'home' };
  if (clean === '/movies') return { name: 'catalog' };

  const detail = clean.match(/^\/movies\/(\d+)$/);
  if (detail) return { name: 'detail', id: Number(detail[1]) };

  const edit = clean.match(/^\/movies\/(\d+)\/edit$/);
  if (edit) return { name: 'edit', id: Number(edit[1]) };

  if (clean === '/crear' || clean === '/movies/create') return { name: 'create' };
  return { name: 'notfound' };
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
    if (route.name === 'detail') {
      setActiveNav('detail');
      renderDetalle(main, route.id);
      return;
    }
    if (route.name === 'edit') {
      setActiveNav('edit');
      renderEditarMovie(main, route.id);
      return;
    }
    if (route.name === 'create') {
      setActiveNav('crear');
      renderCrearMovie(main);
      return;
    }

    setActiveNav('');
    renderNotFound(main);
  }

  setNavigateHandler(renderRoute);
  return renderRoute;
}

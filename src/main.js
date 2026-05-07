import { createLayout } from './components/Layout.js';
import { createRenderRoute } from './app.js';

const root = document.getElementById('root');
if (root) {
  root.innerHTML = '';
  root.appendChild(createLayout());
}

const renderRoute = createRenderRoute();

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  document.querySelector('.header-nav')?.classList.remove('is-open');
  const toggle = document.querySelector('.header-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  window.history.pushState({}, '', url.pathname + url.search + url.hash);
  renderRoute();
});

window.addEventListener('popstate', renderRoute);

renderRoute();

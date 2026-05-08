import { createCard } from '../components/cardMovie/Card.js';
import {
  getMovies,
  getCategories,
  getDirectors,
  getLangs,
} from '../services/api.js';
import { navigate } from '../router.js';

function collectFilters(root) {
  const q = {};
  const cat = root.querySelector('[data-filter="id_category"]')?.value;
  const dir = root.querySelector('[data-filter="id_director"]')?.value;
  const lang = root.querySelector('[data-filter="id_lang"]')?.value;
  const prom = root.querySelector('[data-filter="prom_rating"]')?.value;
  if (cat) q.id_category = cat;
  if (dir) q.id_director = dir;
  if (lang) q.id_lang = lang;
  if (prom !== undefined && prom !== null && String(prom).trim() !== '') {
    q.prom_rating = prom;
  }
  return q;
}

export function renderCatalog(container) {
  container.innerHTML = '<p class="status-msg">Cargando catálogo...</p>';

  Promise.all([getCategories(), getDirectors(), getLangs()])
    .then(([categories, directors, langs]) => {
      container.innerHTML = '';

      const page = document.createElement('div');
      page.className = 'items-page';

      const header = document.createElement('div');
      header.className = 'items-header';

      const backLink = document.createElement('a');
      backLink.href = '/';
      backLink.className = 'btn-back';
      backLink.textContent = '← Volver al inicio';

      const h2 = document.createElement('h2');
      h2.textContent = 'Catálogo';

      const controls = document.createElement('div');
      controls.className = 'items-controls';

      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Buscar por título...';
      searchInput.className = 'search-input';

      const randomBtn = document.createElement('button');
      randomBtn.type = 'button';
      randomBtn.className = 'btn-secondary';
      randomBtn.textContent = 'Película aleatoria';

      controls.appendChild(searchInput);
      controls.appendChild(randomBtn);

      header.appendChild(backLink);
      header.appendChild(h2);
      header.appendChild(controls);

      const filters = document.createElement('div');
      filters.className = 'filters-row';

      function selectField(label, dataAttr, options, valueKey, labelKey) {
        const wrap = document.createElement('div');
        wrap.className = 'filter-field';
        const lb = document.createElement('span');
        lb.className = 'filter-label';
        lb.textContent = label;
        const sel = document.createElement('select');
        sel.className = 'filter-select';
        sel.dataset.filter = dataAttr;
        const opt0 = document.createElement('option');
        opt0.value = '';
        opt0.textContent = 'Todas';
        sel.appendChild(opt0);
        options.forEach((row) => {
          const opt = document.createElement('option');
          opt.value = String(row[valueKey]);
          opt.textContent = row[labelKey];
          sel.appendChild(opt);
        });
        wrap.appendChild(lb);
        wrap.appendChild(sel);
        return wrap;
      }

      const catList = Array.isArray(categories) ? categories : [];
      const dirList = Array.isArray(directors) ? directors : [];
      const langList = Array.isArray(langs) ? langs : [];
      const dirForSelect = dirList.map((d) => ({
        ...d,
        director_label: [d.name, d.last_name].filter(Boolean).join(' '),
      }));

      filters.appendChild(
        selectField('Categoría', 'id_category', catList, 'id_category', 'name')
      );
      filters.appendChild(
        selectField(
          'Director',
          'id_director',
          dirForSelect,
          'id_director',
          'director_label'
        )
      );
      filters.appendChild(
        selectField('Idioma', 'id_lang', langList, 'id_lang', 'name')
      );

      const minRatingWrap = document.createElement('div');
      minRatingWrap.className = 'filter-field';
      const minLb = document.createElement('span');
      minLb.className = 'filter-label';
      minLb.textContent = 'Valoración mín.';
      const minInput = document.createElement('input');
      minInput.type = 'number';
      minInput.min = '0';
      minInput.max = '5';
      minInput.step = '0.1';
      minInput.placeholder = 'ej. 3.5';
      minInput.className = 'filter-select';
      minInput.dataset.filter = 'prom_rating';
      minRatingWrap.appendChild(minLb);
      minRatingWrap.appendChild(minInput);

      filters.appendChild(minRatingWrap);

      const gridHost = document.createElement('div');
      gridHost.id = 'catalog-grid-host';

      page.appendChild(header);
      page.appendChild(filters);
      page.appendChild(gridHost);
      container.appendChild(page);

      let allItems = [];

      function renderGrid(items) {
        gridHost.innerHTML = '';
        if (items.length === 0) {
          const empty = document.createElement('p');
          empty.className = 'status-msg';
          empty.textContent = 'No hay películas con estos filtros.';
          gridHost.appendChild(empty);
          return;
        }
        const grid = document.createElement('div');
        grid.className = 'items-grid';
        items.forEach((m) => grid.appendChild(createCard(m)));
        gridHost.appendChild(grid);
      }

      function applyLocalSearch(base) {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) return base;
        return base.filter((m) =>
          String(m.title || '')
            .toLowerCase()
            .includes(q)
        );
      }

      function reloadFromApi() {
        gridHost.innerHTML = '<p class="status-msg">Cargando...</p>';
        const apiQuery = collectFilters(page);
        getMovies(apiQuery)
          .then((movies) => {
            const list = Array.isArray(movies) ? movies : [];
            allItems = list;
            renderGrid(applyLocalSearch(allItems));
          })
          .catch(() => {
            gridHost.innerHTML =
              '<p class="status-msg error">No se pudieron cargar las películas.</p>';
          });
      }

      reloadFromApi();

      filters.querySelectorAll('select').forEach((el) => {
        el.addEventListener('change', reloadFromApi);
      });
      minInput.addEventListener('change', reloadFromApi);
      minInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') reloadFromApi();
      });

      searchInput.addEventListener('input', () => {
        renderGrid(applyLocalSearch(allItems));
      });

      randomBtn.addEventListener('click', () => {
        const visible = applyLocalSearch(allItems);
        if (visible.length === 0) return;
        const pick = visible[Math.floor(Math.random() * visible.length)];
        navigate(`/movies/${pick.id_movie}`);
      });
    })
    .catch(() => {
      container.innerHTML =
        '<p class="status-msg error">No se pudieron cargar categorías, directores o idiomas.</p>';
    });
}

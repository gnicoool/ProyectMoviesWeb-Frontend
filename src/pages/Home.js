import { getMovies, resolveMediaUrl, getCategories, getDirectors } from '../services/api.js';

export function renderHome(container) {
  container.innerHTML = '<p class="status-msg">Cargando películas destacadas...</p>';

  getMovies()
    .then((movies) => {
      const list = Array.isArray(movies) ? movies : [];
      const featured = list.slice(0, 10);
      container.innerHTML = '';

      const page = document.createElement('div');
      page.className = 'home-page';

      const hero = document.createElement('section');
      hero.className = 'home-hero';
      hero.innerHTML = `
        <p class="home-eyebrow">Cine Web</p>
        <h1 class="home-title">Descubre <em>películas</em><br />en tu catálogo</h1>
        <p class="home-sub">Explora la colección</p>
        <a href="/movies" class="btn-primary home-cta">Ver catálogo</a>
        <div class="home-stats">
          <div class="home-stat"><span class="home-stat-num" id="stat-movies">${list.length}</span><span class="home-stat-label">Películas</span></div>
          <div class="home-stat"><span class="home-stat-num" id="stat-directors">—</span><span class="home-stat-label">Directores</span></div>
          <div class="home-stat"><span class="home-stat-num" id="stat-genres">—</span><span class="home-stat-label">Géneros</span></div>
        </div>
      `;

      const gallery = document.createElement('section');
      gallery.className = 'home-movies';
      gallery.innerHTML = `
        <h2 class="home-movies-title">Destacadas</h2>
        <div class="home-gallery-grid" id="home-gallery-grid"></div>
      `;

      page.appendChild(hero);
      page.appendChild(gallery);
      container.appendChild(page);

      Promise.all([getCategories(), getDirectors()])
        .then(([cats, dirs]) => {
          const statDirectors = document.getElementById('stat-directors');
          const statGenres = document.getElementById('stat-genres');
          if (statDirectors) statDirectors.textContent = Array.isArray(dirs) ? dirs.length : '—';
          if (statGenres) statGenres.textContent = Array.isArray(cats) ? cats.length : '—';
        })
        .catch(() => {});

      const grid = document.getElementById('home-gallery-grid');
      if (!grid) return;

      if (featured.length === 0) {
        grid.innerHTML =
          '<p class="status-msg">Aún no hay películas. <a href="/crear" class="btn-primary">Agregar una</a></p>';
        return;
      }

      featured.forEach((movie) => {
        const poster = resolveMediaUrl(movie.image_url);
        const link = document.createElement('a');
        link.href = `/movies/${movie.id_movie}`;
        link.className = 'home-gallery-card';

        if (poster) {
          const img = document.createElement('img');
          img.src = poster;
          img.alt = movie.title || '';
          img.loading = 'lazy';
          link.appendChild(img);
        } else {
          const ph = document.createElement('div');
          ph.style.cssText =
            'display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:13px;padding:12px;text-align:center;';
          ph.textContent = 'Sin póster';
          link.appendChild(ph);
        }

        const overlay = document.createElement('div');
        overlay.className = 'home-gallery-overlay';

        const title = document.createElement('p');
        title.className = 'home-gallery-obra-title';
        title.textContent = movie.title || 'Untitled';

        const sub = document.createElement('p');
        sub.className = 'home-gallery-artist';
        const year = 
          movie.release_year != null ? String(movie.release_year) : 'Año N/D';
        const rating =
          movie.rating != null && !Number.isNaN(Number(movie.rating))
            ? ` · ★ ${Number(movie.rating).toFixed(1)}`
            : '';
        sub.textContent = `${year}${rating}`;

        overlay.appendChild(title);
        overlay.appendChild(sub);
        link.appendChild(overlay);
        grid.appendChild(link);
      });
    })
    .catch(() => {
      container.innerHTML =
        '<p class="status-msg error">No se pudo conectar con la API</p>';
    });
}
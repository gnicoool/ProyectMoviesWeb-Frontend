import { createCardDetalles } from '../components/cardMovie/CardDetalles.js';
import {
  getMovieById,
  getCategories,
  getDirectors,
  getLangs,
  resolveMediaUrl,
  getMovieRating,
  createMovieRating,
  deleteMovie,
} from '../services/api.js';
import { navigate } from '../router.js';

function labelFromList(list, id, idKey, formatRow) {
  if (id == null) return '';
  const row = list.find((x) => Number(x[idKey]) === Number(id));
  return row ? formatRow(row) : '';
}

export function renderDetalle(container, idMovie) {
  container.innerHTML = '<p class="status-msg">Cargando...</p>';

  function parseRatingData(payload) {
    if (!payload || typeof payload !== 'object') return { average: null, count: null };

    const averageRaw = payload.average ?? null;
    const countRaw = payload.votes ?? null;

    const averageNum = averageRaw != null ? Number(averageRaw) : null;
    const countNum = countRaw != null ? Number(countRaw) : null;

    return {
      average: Number.isNaN(averageNum) ? null : averageNum,
      count: Number.isNaN(countNum) ? null : countNum,
    };
  }

  Promise.all([
    getMovieById(idMovie),
    getCategories(),
    getDirectors(),
    getLangs(),
    getMovieRating(idMovie),
  ])
    .then(([movie, categories, directors, langs, ratingData]) => {
      container.innerHTML = '';

      const cats = Array.isArray(categories) ? categories : [];
      const dirs = Array.isArray(directors) ? directors : [];
      const lngs = Array.isArray(langs) ? langs : [];

      const categoryLabel = labelFromList(
        cats,
        movie.id_category,
        'id_category',
        (c) => c.name
      );
      const directorLabel = labelFromList(
        dirs,
        movie.id_director,
        'id_director',
        (d) => [d.name, d.last_name].filter(Boolean).join(' ')
      );
      const langLabel = labelFromList(
        lngs,
        movie.id_lang,
        'id_lang',
        (l) => l.name
      );

      const page = document.createElement('div');
      page.className = 'detalle-page';

      const backLink = document.createElement('a');
      backLink.href = '/movies';
      backLink.className = 'btn-back';
      backLink.textContent = '← Volver al catálogo';

      const content = document.createElement('div');
      content.className = 'detalle-content';

      const imagenpeli = resolveMediaUrl(movie.image_url);
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'detalle-img-wrapper';
      if(imagenpeli){
        const img = document.createElement('img');
        img.src = imagenpeli;
        img.alt = movie.title || '';
        imgWrapper.appendChild(img);
      }else {
        imgWrapper.style.minHeight = '280px';
        imgWrapper.style.display = 'flex';
        imgWrapper.style.alignItems = 'center';
        imgWrapper.style.justifyContent = 'center';
        imgWrapper.style.color = 'var(--text-third)';
        imgWrapper.style.textContent = 'Sin imagen';
      }
      
      const imgActions = document.createElement('div');
      imgActions.className = 'detalle-img-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-primary';
      editBtn.textContent = 'Editar película';
      editBtn.addEventListener('click', () => navigate(`/movies/${movie.id_movie}/edit`));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-danger';
      deleteBtn.textContent = 'Eliminar película';
      deleteBtn.addEventListener('click', () => {
        if (!confirm(`¿Eliminar "${movie.title}"? Esta acción no se puede deshacer.`)) return;
        deleteBtn.disabled = true;
        deleteMovie(Number(movie.id_movie))
            .then(() => navigate('/movies'))
            .catch((err) => {
                alert(err.message || 'No se pudo eliminar.');
                deleteBtn.disabled = false;
            });
      });

      imgActions.appendChild(editBtn);
      imgActions.appendChild(deleteBtn);

      const imgCol = document.createElement('div');
      imgCol.className = 'detalle-img-col';
      imgCol.appendChild(imgWrapper);
      imgCol.appendChild(imgActions);

content.appendChild(imgCol);
      const detalles = createCardDetalles({
        title: movie.title || 'Sin título',
        sinopsis: movie.sinopsis,
        release_year: movie.release_year,
        duration: movie.duration,
        rating:
          parseRatingData(ratingData).average ??
          (movie.rating != null ? Number(movie.rating) : null),
        categoryLabel,
        directorLabel,
        langLabel,
      });

      const ratingBox = document.createElement('div');
      ratingBox.className = 'rating-row';

      const ratingSummary = document.createElement('span');
      ratingSummary.className = 'form-hint';
      const initialRating = parseRatingData(ratingData);
      if (initialRating.average != null) {
        const votesText =
          initialRating.count != null ? ` (${initialRating.count} votos)` : '';
        ratingSummary.textContent = `Rating actual: ${initialRating.average.toFixed(1)}${votesText}`;
      } else {
        ratingSummary.textContent = 'Sin valoraciones todavía.';
      }

      const rateLabel = document.createElement('label');
      rateLabel.htmlFor = 'vote-score';
      rateLabel.textContent = 'Tu valoración (0–5):';

      const select = document.createElement('select');
      select.id = 'vote-score';
      for (let s = 0; s <= 5; s += 1) {
        const opt = document.createElement('option');
        opt.value = String(s);
        opt.textContent = String(s);
        select.appendChild(opt);
      }

      const voteBtn = document.createElement('button');
      voteBtn.type = 'button';
      voteBtn.className = 'btn-secondary';
      voteBtn.textContent = 'Enviar voto';

      const voteMsg = document.createElement('span');
      voteMsg.className = 'form-hint';

      voteBtn.addEventListener('click', () => {
        voteMsg.textContent = '';
        const score = Number(select.value);
        voteBtn.disabled = true;
        createMovieRating(Number(movie.id_movie), score)
          .then((updatedRating) => {
            const current = parseRatingData(updatedRating);
            if (current.average != null) {
              const votesText =
                current.count != null ? ` (${current.count} votos)` : '';
              ratingSummary.textContent = `Rating actual: ${current.average.toFixed(1)}${votesText}`;
            }
            voteMsg.textContent = 'Voto enviado.';
            navigate(window.location.pathname, { replace: true });
          })
          .catch((err) => {
            voteMsg.textContent = err.message || 'No se pudo enviar el voto.';
          })
          .finally(() => {
            voteBtn.disabled = false;
          });
      });

      ratingBox.appendChild(rateLabel);
      ratingBox.appendChild(select);
      ratingBox.appendChild(voteBtn);
      ratingBox.appendChild(ratingSummary);
      ratingBox.appendChild(voteMsg);

      detalles.appendChild(ratingBox);

      content.appendChild(detalles);
      page.appendChild(backLink);
      page.appendChild(content);
      container.appendChild(page);
    })
    .catch((err) => {
      const status = err && typeof err.status === 'number' ? err.status : null;
      container.innerHTML =
        status === 404
          ? '<p class="status-msg error">Película no encontrada.</p>'
          : '<p class="status-msg error">No se pudo cargar la película.</p>';
    });
}

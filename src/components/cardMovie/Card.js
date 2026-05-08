import { resolveMediaUrl } from '../../services/api.js';

export function createCard(movie) {
  const poster = resolveMediaUrl(movie.image_url);
  const card = document.createElement('div');
  card.className = 'card';

  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'card-img-wrapper';

  if (poster) {
    const img = document.createElement('img');
    img.src = poster;
    img.alt = movie.title || 'Póster';
    img.loading = 'lazy';
    imgWrapper.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.className = 'card-no-image';
    span.textContent = 'Sin imagen';
    imgWrapper.appendChild(span);
  }

  const ratingVal =
    movie.rating != null && !Number.isNaN(Number(movie.rating))
      ? Number(movie.rating).toFixed(1)
      : null;

  if (ratingVal) {
    const badge = document.createElement('div');
    badge.className = 'card-badge';
    badge.textContent = `★ ${ratingVal}`;
    imgWrapper.appendChild(badge);
  }

  const body = document.createElement('div');
  body.className = 'card-body';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = movie.title || 'Sin título';

  const meta = document.createElement('p');
  meta.className = 'card-meta';
  meta.textContent = movie.release_year != null ? String(movie.release_year) : '—';

  const link = document.createElement('a');
  link.href = `/movies/${movie.id_movie}`;
  link.className = 'card-link';
  link.textContent = 'Detalles';

  body.appendChild(title);
  body.appendChild(meta);
  body.appendChild(link);
  card.appendChild(imgWrapper);
  card.appendChild(body);

  return card;
}
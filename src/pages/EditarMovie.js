import {
  getMovieById,
  getCategories,
  getDirectors,
  getLangs,
  updateMovie,
  uploadImage,
  resolveMediaUrl,
} from '../services/api.js';
import { navigate } from '../router.js';

export function renderEditarMovie(container, idMovie) {
  container.innerHTML = '<p class="status-msg">Cargando...</p>';

  Promise.all([
    getMovieById(idMovie),
    getCategories(),
    getDirectors(),
    getLangs(),
  ])
    .then(([movie, categories, directors, langs]) => {
      const catList = Array.isArray(categories) ? categories : [];
      const dirList = Array.isArray(directors) ? directors : [];
      const langList = Array.isArray(langs) ? langs : [];

      container.innerHTML = '';

      const page = document.createElement('div');
      page.className = 'crear-page';

      const back = document.createElement('a');
      back.href = `/movies/${idMovie}`;
      back.className = 'btn-back';
      back.textContent = '← Volver al detalle';

      const title = document.createElement('h2');
      title.textContent = 'Editar película';
      title.style.marginBottom = '8px';

      const form = document.createElement('form');
      form.className = 'form-grid';
      form.autocomplete = 'off';

      function fieldSpan(label, inputEl, hint) {
        const wrap = document.createElement('div');
        wrap.className = 'form-field form-field-span';
        const lb = document.createElement('label');
        lb.className = 'form-label';
        lb.textContent = label;
        wrap.appendChild(lb);
        wrap.appendChild(inputEl);
        if (hint) {
          const h = document.createElement('span');
          h.className = 'form-hint';
          h.textContent = hint;
          wrap.appendChild(h);
        }
        return wrap;
      }

      function fieldHalf(label, inputEl) {
        const wrap = document.createElement('div');
        wrap.className = 'form-field';
        const lb = document.createElement('label');
        lb.className = 'form-label';
        lb.textContent = label;
        wrap.appendChild(lb);
        wrap.appendChild(inputEl);
        return wrap;
      }

      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'form-input';
      titleInput.required = true;
      titleInput.value = movie.title || '';

      const sinopsisInput = document.createElement('textarea');
      sinopsisInput.className = 'form-textarea';
      sinopsisInput.value = movie.sinopsis || '';

      const yearInput = document.createElement('input');
      yearInput.type = 'number';
      yearInput.className = 'form-input';
      yearInput.min = '1888';
      yearInput.max = '2100';
      yearInput.value = movie.release_year != null ? String(movie.release_year) : '';

      const durationInput = document.createElement('input');
      durationInput.type = 'number';
      durationInput.className = 'form-input';
      durationInput.min = '1';
      durationInput.value = movie.duration != null ? String(movie.duration) : '';

      const imageUrlInput = document.createElement('input');
      imageUrlInput.type = 'text';
      imageUrlInput.className = 'form-input';
      imageUrlInput.placeholder = '...jpg';
      imageUrlInput.value = movie.image_url || '';

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      const preview = document.createElement('img');
      preview.className = 'upload-preview';
      preview.style.display = movie.image_url ? 'block' : 'none';
      if (movie.image_url) preview.src = resolveMediaUrl(movie.image_url);

      const uploadHint = document.createElement('span');
      uploadHint.className = 'form-hint';

      fileInput.addEventListener('change', () => {
        uploadHint.textContent = '';
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        uploadHint.textContent = 'Subiendo...';
        uploadImage(file)
          .then((res) => {
            imageUrlInput.value = res.image_url || '';
            preview.src = resolveMediaUrl(res.image_url) || '';
            preview.style.display = 'block';
            uploadHint.textContent = 'Subida correcta.';
          })
          .catch(() => {
            uploadHint.textContent = 'Error al subir.';
          });
      });

      function makeSelect(list, valueKey, labelFn, currentVal) {
        const sel = document.createElement('select');
        sel.className = 'filter-select';
        sel.required = true;
        list.forEach((row) => {
          const opt = document.createElement('option');
          opt.value = String(row[valueKey]);
          opt.textContent = labelFn(row);
          if (Number(row[valueKey]) === Number(currentVal)) opt.selected = true;
          sel.appendChild(opt);
        });
        return sel;
      }

      const catSel = makeSelect(catList, 'id_category', (c) => c.name, movie.id_category);
      const dirSel = makeSelect(dirList, 'id_director', (d) => [d.name, d.last_name].filter(Boolean).join(' '), movie.id_director);
      const langSel = makeSelect(langList, 'id_lang', (l) => l.name, movie.id_lang);

      form.appendChild(fieldHalf('Título *', titleInput));
      form.appendChild(fieldHalf('Año de estreno', yearInput));
      form.appendChild(fieldSpan('Sinopsis', sinopsisInput));
      form.appendChild(fieldHalf('Duración (minutos)', durationInput));
      form.appendChild(fieldHalf('Categoría *', catSel));
      form.appendChild(fieldHalf('Director *', dirSel));
      form.appendChild(fieldHalf('Idioma *', langSel));
      form.appendChild(fieldSpan('URL de la imagen', imageUrlInput, 'Puedes subir una nueva imagen o editar la URL.'));

      const uploadWrap = document.createElement('div');
      uploadWrap.className = 'form-field form-field-span';
      const ulb = document.createElement('label');
      ulb.className = 'form-label';
      ulb.textContent = 'Subir nueva imagen';
      uploadWrap.appendChild(ulb);
      uploadWrap.appendChild(fileInput);
      uploadWrap.appendChild(uploadHint);
      uploadWrap.appendChild(preview);
      form.appendChild(uploadWrap);

      const actions = document.createElement('div');
      actions.className = 'form-field form-field-span';
      actions.style.display = 'flex';
      actions.style.gap = '12px';
      actions.style.alignItems = 'center';

      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'btn-primary';
      submit.textContent = 'Guardar cambios';

      const statusMsg = document.createElement('span');
      statusMsg.className = 'form-hint';

      actions.appendChild(submit);
      actions.appendChild(statusMsg);
      form.appendChild(actions);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        statusMsg.textContent = '';
        submit.disabled = true;

        const payload = {
          title: titleInput.value.trim(),
          sinopsis: sinopsisInput.value.trim() || null,
          release_year: yearInput.value ? Number(yearInput.value) : null,
          duration: durationInput.value ? Number(durationInput.value) : null,
          image_url: imageUrlInput.value.trim() || null,
          id_category: Number(catSel.value),
          id_director: Number(dirSel.value),
          id_lang: Number(langSel.value),
        };

        updateMovie(idMovie, payload)
          .then(() => navigate(`/movies/${idMovie}`))
          .catch((err) => {
            statusMsg.textContent = err.message || 'No se pudo actualizar.';
            submit.disabled = false;
          });
      });

      page.appendChild(back);
      page.appendChild(title);
      page.appendChild(form);
      container.appendChild(page);
    })
    .catch(() => {
      container.innerHTML =
        '<p class="status-msg error">No se pudo cargar la película.</p>';
    });
}
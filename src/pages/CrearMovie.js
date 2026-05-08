import {
  createMovie,
  getCategories,
  getDirectors,
  getLangs,
  uploadImage,
  resolveMediaUrl,
} from '../services/api.js';
import { navigate } from '../router.js';

export function renderCrearMovie(container) {
  container.innerHTML = '<p class="status-msg">Cargando formulario...</p>';

  Promise.all([getCategories(), getDirectors(), getLangs()])
    .then(([categories, directors, langs]) => {
      const catList = Array.isArray(categories) ? categories : [];
      const dirList = Array.isArray(directors) ? directors : [];
      const langList = Array.isArray(langs) ? langs : [];

      if (catList.length === 0 || dirList.length === 0 || langList.length === 0) {
        container.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'crear-page';
        wrap.innerHTML = `
          <a href="/movies" class="btn-back">← Volver al catálogo</a>
          <p class="status-msg error" style="text-align:left;max-width:480px;">
            Faltan datos para crear una pelicula.
          </p>
        `;
        container.appendChild(wrap);
        return;
      }

      container.innerHTML = '';

      const page = document.createElement('div');
      page.className = 'crear-page';

      const back = document.createElement('a');
      back.href = '/movies';
      back.className = 'btn-back';
      back.textContent = '← Volver al catálogo';

      const title = document.createElement('h2');
      title.textContent = 'Agregar película';
      title.style.marginBottom = '8px';

      const intro = document.createElement('p');
      intro.className = 'home-sub';
      intro.style.maxWidth = 'none';
      intro.style.marginBottom = '24px';
      intro.textContent =
        'Publica una pelicula, sube una imagen';

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
      titleInput.name = 'title';
      titleInput.required = true;
      titleInput.className = 'form-input';

      const sinopsisInput = document.createElement('textarea');
      sinopsisInput.name = 'sinopsis';
      sinopsisInput.className = 'form-textarea';

      const yearInput = document.createElement('input');
      yearInput.type = 'number';
      yearInput.name = 'release_year';
      yearInput.className = 'form-input';
      yearInput.min = '1888';
      yearInput.max = '2100';

      const durationInput = document.createElement('input');
      durationInput.type = 'number';
      durationInput.name = 'duration';
      durationInput.className = 'form-input';
      durationInput.min = '1';

      const imageUrlInput = document.createElement('input');
      imageUrlInput.type = 'text';
      imageUrlInput.name = 'image_url';
      imageUrlInput.className = 'form-input';
      imageUrlInput.placeholder = '...jpg';

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      const preview = document.createElement('img');
      preview.className = 'upload-preview';
      preview.style.display = 'none';

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
            uploadHint.textContent = 'Subida correcta. URL guardada.';
          })
          .catch(() => {
            uploadHint.textContent = 'Error al subir.';
          });
      });

      const catSel = document.createElement('select');
      catSel.name = 'id_category';
      catSel.required = true;
      catSel.className = 'filter-select';
      catList.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = String(c.id_category);
        opt.textContent = c.name;
        catSel.appendChild(opt);
      });

      const dirSel = document.createElement('select');
      dirSel.name = 'id_director';
      dirSel.required = true;
      dirSel.className = 'filter-select';
      dirList.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = String(d.id_director);
        opt.textContent = [d.name, d.last_name].filter(Boolean).join(' ');
        dirSel.appendChild(opt);
      });

      const langSel = document.createElement('select');
      langSel.name = 'id_lang';
      langSel.required = true;
      langSel.className = 'filter-select';
      langList.forEach((l) => {
        const opt = document.createElement('option');
        opt.value = String(l.id_lang);
        opt.textContent = l.name;
        langSel.appendChild(opt);
      });

      form.appendChild(fieldHalf('Título *', titleInput));
      form.appendChild(fieldHalf('Año de estreno', yearInput));
      form.appendChild(fieldSpan('Sinopsis', sinopsisInput));
      form.appendChild(fieldHalf('Duración (minutos)', durationInput));
      form.appendChild(fieldHalf('Categoría *', catSel));
      form.appendChild(fieldHalf('Director *', dirSel));
      form.appendChild(fieldHalf('Idioma *', langSel));
      form.appendChild(
        fieldSpan(
          'URL de la imagen',
          imageUrlInput,
          'Puedes agregar la URL de la imagen o subir una imagen'
        )
      );

      const uploadWrap = document.createElement('div');
      uploadWrap.className = 'form-field form-field-span';
      const ulb = document.createElement('label');
      ulb.className = 'form-label';
      ulb.textContent = 'Subir imagen';
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
      submit.textContent = 'Guardar película';

      const status = document.createElement('span');
      status.className = 'form-hint';

      actions.appendChild(submit);
      actions.appendChild(status);
      form.appendChild(actions);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        status.textContent = '';
        submit.disabled = true;

        const payload = {
          title: titleInput.value.trim(),
          sinopsis: sinopsisInput.value.trim() || null,
          release_year: yearInput.value
            ? Number(yearInput.value)
            : null,
          duration: durationInput.value ? Number(durationInput.value) : null,
          image_url: imageUrlInput.value.trim() || null,
          id_category: Number(catSel.value),
          id_director: Number(dirSel.value),
          id_lang: Number(langSel.value),
        };

        createMovie(payload)
          .then((created) => {
            const id = created.id_movie ?? created?.id;
            if (id != null) {
              navigate(`/movies/${id}`);
              return;
            }
            status.textContent = 'Guardado.';
          })
          .catch((err) => {
            status.textContent = err.message || 'No se pudo crear la película.';
          })
          .finally(() => {
            submit.disabled = false;
          });
      });

      page.appendChild(back);
      page.appendChild(title);
      page.appendChild(intro);
      page.appendChild(form);
      container.appendChild(page);
    })
    .catch(() => {
      container.innerHTML =
        '<p class="status-msg error">No se pudieron cargar categorías, directores o idiomas.</p>';
    });
}

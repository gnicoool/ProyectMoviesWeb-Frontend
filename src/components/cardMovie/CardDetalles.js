export function createCardDetalles(props) {
  const wrapper = document.createElement('div');
  wrapper.className = 'detalle-info';

  const h2 = document.createElement('h2');
  h2.textContent = props.title;
  wrapper.appendChild(h2);

  if (props.sinopsis) {
    const syn = document.createElement('p');
    syn.className = 'detalle-sinopsis';
    syn.textContent = props.sinopsis;
    syn.style.marginBottom = '20px'; 
    wrapper.appendChild(syn);
  }

  const meta = document.createElement('div');
  meta.className = 'detalle-meta';

  const rows = [
    ['Año', props.release_year != null ? String(props.release_year) : null],
    ['Duración (min)', props.duration != null ? String(props.duration) : null],
    ['Categoría', props.categoryLabel || null],
    ['Director', props.directorLabel || null],
    ['Idioma', props.langLabel || null],
    [
      'Rating',
      props.rating != null && !Number.isNaN(Number(props.rating))
        ? Number(props.rating).toFixed(1)
        : null,
    ],
  ];

  rows.forEach(([label, value]) => {
    if (!value) return;
    const field = document.createElement('div');
    field.className = 'detalle-field';

    const lb = document.createElement('span');
    lb.className = 'detalle-label';
    lb.textContent = label;

    const val = document.createElement('span');
    val.className = 'detalle-value';
    val.textContent = value;

    field.appendChild(lb);
    field.appendChild(val);
    meta.appendChild(field);
  });

  wrapper.appendChild(meta);

  return wrapper;
}
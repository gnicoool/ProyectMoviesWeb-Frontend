const BASE_URL = window.__API_BASE__ || 'http://localhost:8001';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.headers = { ...options.headers, 'Content-Type': 'application/json' };
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error en la petición');
  }

  if (res.status === 204) return true;
  return res.json();
}

export const resolveMediaUrl = (url) => {
  if (!url || url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
};

export const getMovies = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const data = await request(`/movies/${params ? '?' + params : ''}`);
  
  return Array.isArray(data) ? data : (data.items || data.results || []);
};

export const getMovieById = (id) => request(`/movies/${id}`);

export const createMovie = (movie) => request('/movies/', { method: 'POST', body: movie });

export const updateMovie = (id, movie) => request(`/movies/${id}`, { method: 'PUT', body: movie });

export const deleteMovie = (id) => request(`/movies/${id}`, { method: 'DELETE' });

export const getCategories = () => request('/categories/');
export const getDirectors = () => request('/directors/');

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request('/upload-image', { method: 'POST', body: formData });
};
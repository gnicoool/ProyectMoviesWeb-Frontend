const BASE_URL = window.__API_BASE__ || 'https://proyectmoviesweb-backend-1.onrender.com';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.headers = { ...options.headers, 'Content-Type': 'application/json' };
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.detail || 'Error en la petición');
    error.status = res.status;
    throw error;
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

export const getMoviesCount = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const data = await request(`/movies/count${params ? '?' + params : ''}`);
  return Number(data?.total ?? 0);
};

export const getRandomMovies = async (limit = 10) => {
  const params = new URLSearchParams({ limit: String(limit) }).toString();
  const data = await request(`/movies/random?${params}`);
  return Array.isArray(data) ? data : [];
};

export const getMoviesPage = async (filters = {}, page = 1, limit = 8) => {
  const query = {
    ...filters,
    page: Number(page),
    limit: Number(limit),
  };
  const params = new URLSearchParams(query).toString();
  const data = await request(`/movies/${params ? '?' + params : ''}`);

  if (Array.isArray(data)) {
    let hasMore = false;
    try {
      const nextQuery = {
        ...filters,
        page: Number(page) + 1,
        limit: Number(limit),
      };
      const nextParams = new URLSearchParams(nextQuery).toString();
      const nextData = await request(`/movies/${nextParams ? '?' + nextParams : ''}`);
      hasMore = Array.isArray(nextData) && nextData.length > 0;
    } catch (_error) {
      hasMore = data.length === Number(limit);
    }

    return {
      items: data,
      page: Number(page),
      limit: Number(limit),
      total: null,
      total_pages: hasMore ? Number(page) + 1 : Number(page),
      has_more: hasMore,
    };
  }

  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.results)
      ? data.results
      : [];
  const total = Number(
    data?.total ??
      data?.count ??
      data?.total_count ??
      data?.totalItems ??
      items.length
  );
  const totalPagesRaw =
    data?.total_pages ??
    data?.pages ??
    data?.totalPages ??
    data?.page_count;
  const totalPages =
    totalPagesRaw != null
      ? Number(totalPagesRaw)
      : Math.max(1, Math.ceil(total / Number(limit || 1)));
  const hasMoreRaw = data?.has_more ?? data?.hasMore ?? null;
  const hasNextPageToken = data?.next_page != null || data?.nextPage != null;
  const hasMore =
    hasMoreRaw != null
      ? Boolean(hasMoreRaw)
      : hasNextPageToken || items.length === Number(limit);

  return {
    items,
    page: Number(data?.page ?? page),
    limit: Number(data?.limit ?? limit),
    total: Number.isNaN(total) ? items.length : total,
    total_pages: Number.isNaN(totalPages) ? 1 : totalPages,
    has_more: hasMore,
  };
};

export const getMovieById = (id) => request(`/movies/${id}`);

export const createMovie = (movie) => request('/movies/', { 
  method: 'POST', 
  body: movie 
});

export const updateMovie = (id, movie) => request(`/movies/${id}`, { 
  method: 'PUT', 
  body: movie 
});

export const deleteMovie = (id) => request(`/movies/${id}`, { 
  method: 'DELETE' 
});

export const getCategories = () => request('/categories/');
export const getDirectors = () => request('/directors/');
export const getLangs = () => request('/langs/');

export const getMovieRating = (id) => request(`/movies/${id}/rating`);

export const createMovieRating = (id, score) =>
  request(`/movies/${id}/rating`, {
    method: 'POST',
    body: { score },
  });

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request('/upload-image', { 
    method: 'POST', 
    body: formData 
  });
};
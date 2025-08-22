export function requireAuth() {
  if (import.meta.env.VITE_STATIC === 'true') return true;
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return false;
    }
    return true;
  } catch (e) {
    localStorage.removeItem('token');
    return false;
  }
}

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers, Authorization: token ? `Bearer ${token}` : '' };
  return fetch(url, { ...options, headers });
}

export function requireAuth() {
  return !!localStorage.getItem('token');
}

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers, Authorization: token ? `Bearer ${token}` : '' };
  return fetch(url, { ...options, headers });
}

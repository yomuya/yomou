function requireAuth(contentId) {
  if (!localStorage.getItem('token')) {
    window.location.href = '/login';
  } else if (contentId) {
    document.getElementById(contentId).style.display = '';
  }
}

function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  options.headers = options.headers || {};
  if (token) {
    options.headers['Authorization'] = 'Bearer ' + token;
  }
  return fetch(url, options);
}

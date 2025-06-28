function requireAuth(contentId) {
  if (!localStorage.getItem('token')) {
    window.location.href = '/login';
  } else if (contentId) {
    document.getElementById(contentId).style.display = '';
  }
}

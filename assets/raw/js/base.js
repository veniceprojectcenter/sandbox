function base() {
  document.getElementById('clear-cache').addEventListener('click', () => {
    localStorage.clear();
    Materialize.toast('Cache Cleared', 3000);
  });
}

export default base;

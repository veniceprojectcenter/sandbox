function base() {
  document.getElementById('clear-cache').addEventListener('click', () => {
    localStorage.clear();
  });
}

export default base;

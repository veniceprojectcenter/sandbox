class Loader {

  render() {
    const loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader-container';
    loaderContainer.id = 'loader-container';

    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.id = 'loader';
    loader.innerText = 'Loading';

    loaderContainer.appendChild(loader);

    const container = document.getElementById('column1');
    container.appendChild(loaderContainer);
  }

  remove() {
    const container = document.getElementById('column1');
    container.removeChild(document.getElementById('loader-container'));
  }
}

export default Loader;

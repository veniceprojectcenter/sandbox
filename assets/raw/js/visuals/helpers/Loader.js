class Loader {
  constructor(id) {
    this.renderID = id;
  }

  render() {
    const loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader-container';

    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerText = 'Loading';

    loaderContainer.appendChild(loader);

    const container = document.getElementById(this.renderID);
    container.innerHTML = '';
    container.appendChild(loaderContainer);
  }

  remove() {
    const container = document.getElementById(this.renderID);
    container.innerHTML = '';
  }
}

export default Loader;

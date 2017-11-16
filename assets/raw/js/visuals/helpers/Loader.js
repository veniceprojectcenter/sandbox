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

    // const wrapper = document.createElement('div');
    // wrapper.className = 'preloader-wrapper big active';
    //
    // const spinnerLayer = document.createElement('div');
    // spinnerLayer.className = 'spinner-layer spinner-blue-only';
    //
    // const leftCircleClipper = document.createElement('div');
    // leftCircleClipper.className = 'circle-clipper left';
    //
    // const leftCircle = document.createElement('div');
    // leftCircle.className = 'circle';
    //
    // const gapPatch = document.createElement('div');
    // gapPatch.className = 'gap-patch';
    //
    // const gapCircle = document.createElement('div');
    // gapCircle.className = 'circle';
    //
    // const rightCircleClipper = document.createElement('div');
    // rightCircleClipper.className = 'circle-clipper right';
    //
    // const rightCircle = document.createElement('div');
    // rightCircle.className = 'circle';
    //
    // leftCircleClipper.appendChild(leftCircle);
    // gapPatch.appendChild(gapCircle);
    // rightCircleClipper.appendChild(rightCircle);
    //
    // spinnerLayer.appendChild(leftCircleClipper);
    // spinnerLayer.appendChild(gapPatch);
    // spinnerLayer.appendChild(rightCircleClipper);
    //
    // wrapper.appendChild(spinnerLayer);
    //
    // loader.appendChild(wrapper);

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

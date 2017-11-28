import Visual from './Visual';
import Map from './Map';
import EditorGenerator from './EditorGenerator';

/* This file is to be used as a default starting point for new map visualizations
 * that feature adding divs
*/

class DefaultMap extends Visual {
  constructor(config) {
    super(config);

    this.map = new Map();
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
    });
  }

  render() {
    Visual.empty(this.renderID);

    this.map.render(this.renderID);

    this.map.registerClickAction((event) => {
      console.log(`Lat: ${event.latLng.lat()}| Lng: ${event.latLng.lng()}`);
      this.map.addCustomMarker({ lat: event.latLng.lat(), lng: event.latLng.lng() },
      'https://image.flaticon.com/icons/svg/629/629418.svg', 100);
    });
    this.map.addCustomIconZoomListener();
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Editor');
  }
}

export default DefaultMap;

import Visual from './helpers/Visual';
import DivOverlay from './helpers/DivOverlay';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';

class Bridgesnodata extends Visual {
  constructor(config) {
    super(config);

    this.map = null;
    this.locations = [];
    this.openInfoWindow = null;
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
    });
  }

  render() {
    this.map = new google.maps.Map(document.getElementById(this.renderID), {
      center: { lat: 45.435, lng: 12.335 },
      zoom: 14,
      styles: DefaultMapStyle,
    });

    const colors = ['red', 'green', 'blue', 'orange', 'yellow', 'black', 'lime', 'purple', 'fuschia', 'magenta', 'light blue'];
    let j = 0;
    for (let i = 0; i < this.data.length; i += 1) {
      const currentBridge = this.data[i];
      const currentSteps = currentBridge['Total Number of Steps'];
      if (currentSteps === '0' || currentSteps === undefined || currentSteps === '') {
        const color = colors[j];
        j += 1;
        this.addCircle({ lat: parseFloat(currentBridge.Latitude),
          lng: parseFloat(currentBridge.Longitude) }, color);
        console.log(`Lat: ${currentBridge.Latitude}, lng: ${currentBridge.Longitude}, bridge name: ${currentBridge['Bridge Name']}, color: ${color}`);
      }
    }
  }

  addCircle(point, color, opacity, r = 15) {
    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: opacity,
      map: this.map,
      center: point,
      radius: r,
    });

    this.locations.push(circle);
  }

  clearMarkers() {
    this.locations.forEach((marker) => {
      marker.setMap(null);
    });
    this.locations = [];
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

export default Bridgesnodata;

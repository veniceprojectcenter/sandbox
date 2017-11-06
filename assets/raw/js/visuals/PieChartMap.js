import Visual from '../Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';

class PieChartMap extends Visual {
  constructor(config) {
    super(config);

    this.map = null;
    this.locations = [];
    this.openInfoWindow = null;

    this.addMarker = this.addMarker.bind(this);
  }

  static determineColor(year) {
    if (year) {
      let range = parseFloat(year) - 1500;
      if (range > 255) {
        range = 255;
      }
      return `#${range.toString(16)}${(255 - range).toString(16)}FF`;
    }
    return '#FF0000';
  }

  addMarker(data, svgText, anchorx, anchory) {
    if (data.lat && data.lng) {
      const icon = {
        url: `data:image/svg+xml;utf-8, ${svgText}`,
        anchor: new google.maps.Point(anchorx, anchory),
      };

      const marker = new google.maps.Marker({
        position: {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
        },
        map: this.map,
        title: data.wiki_friendly_title,
        animation: google.maps.Animation.DROP,
        icon,
      });

      this.locations.push(
        marker,
      );
    }
  }

  render() {
    this.map = new google.maps.Map(document.getElementById(this.renderID), {
      center: { lat: 45.435, lng: 12.335 },
      zoom: 14,
      styles: DefaultMapStyle,
    });

    const svgText = '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"> ' +
        '<circle cx="10" cy ="10" r="5" stroke="blue" stroke-width="3" fill="blue" />' +
      '</svg>';
    const x = 10;
    const y = 10;

    this.data.forEach((data) => {
      this.addMarker(data, svgText, x, y);
    });
  }

  clearMarkers() {
    this.locations.forEach((marker) => {
      marker.setMap(null);
    });
    this.locations = [];
  }

  updateOverlay() {
    this.clearMarkers();
    const svgText = '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"> ' +
        '<circle cx="10" cy ="10" r="5" stroke="red" stroke-width="3" fill="red" />' +
      '</svg>';
    const x = 10;
    const y = 10;

    this.data.forEach((data) => {
      this.addMarker(data, svgText, x, y);
    });
  }

  renderControls() {
    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Editor');
    editor.createButton('updateOverlayButton', 'update overlay', () => { this.updateOverlay(); });
  }
}

export default PieChartMap;

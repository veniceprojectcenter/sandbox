import Visual from './Visual';
import DivOverlay from './DivOverlay';
import DefaultMapStyle from './DefaultMapStyle';
import EditorGenerator from './EditorGenerator';
import Donut from '../Donut';

/* This file is to be used as a default starting point for new map visualizations
 * that feature adding divs
*/

class DefaultMap extends Visual {
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

    this.registerDefaultClickAction();
  }

  registerDefaultClickAction() {
    google.maps.event.addListener(this.map, 'click', (event) => {
      console.log(`Lat: ${event.latLng.lat()}| Lng: ${event.latLng.lng()}`);
      this.addMarker(event.latLng.lat(), event.latLng.lng());
      this.addMarker(event.latLng.lat(), event.latLng.lng());

      const bounds = new google.maps.LatLngBounds(
       new google.maps.LatLng(event.latLng.lat(),
                              event.latLng.lng()),
       new google.maps.LatLng(event.latLng.lat() + 0.01,
                              event.latLng.lng() + 0.01),
      );

      const renderfunction = (id) => {
        const config = {
          dataSet: this.dataSet,
          type: 'donut',
          attributes: {},
        };

        const donutVisual = new Donut(config);
        donutVisual.loadStaticData(this.data);
        donutVisual.renderID = id;
        donutVisual.render();
      };

      if (this.currentId == null) {
        this.currentId = 1;
      } else {
        this.currentId += 1;
      }

      new DivOverlay(bounds, `overlay${this.currentId}`, this.map, renderfunction);
    });
  }

  addMarker(lat, lng) {
    if (lat && lng) {
      const icon = {
        path: 'M-20,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0',
        fillColor: 'blue',
        fillOpacity: 0.6,
        anchor: new google.maps.Point(0, 0),
        strokeWeight: 0,
        scale: 1,
      };
      const marker = new google.maps.Marker({
        position: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        map: this.map,
        title: '',
        animation: google.maps.Animation.DROP,
        icon,
      });

      this.locations.push({
        marker,
      });
    }
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

export default DefaultMap;

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
    this.n = 0;
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
    });

    const columnNames = Object.keys(this.data[0]);
    const selections = [columnNames[52]];
    const groups = Visual.groupByMultiple(selections, this.data);

    console.log(groups);
  }

  render() {
    this.map = new google.maps.Map(document.getElementById(this.renderID), {
      center: { lat: 45.435, lng: 12.335 },
      zoom: 14,
      styles: DefaultMapStyle,
    });

    this.registerDefaultClickAction();
    this.addZoomListener();
  }

  registerDefaultClickAction() {
    google.maps.event.addListener(this.map, 'click', (event) => {
      console.log(`Lat: ${event.latLng.lat()}| Lng: ${event.latLng.lng()}`);
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

      // new DivOverlay(bounds, `overlay${this.currentId}`, this.map, renderfunction);
    });
  }

  addMarker(lat, lng) {
    if (lat && lng) {
      const icon = {
        url: 'https://cdn.shopify.com/s/files/1/1061/1924/files/Emoji_Icon_-_Happy.png?11214052019865124406',
        scaledSize: new google.maps.Size(100, 100),
        anchor: new google.maps.Point(50, 50),
        zIndex: this.n,
      };
      this.n += 1;
      const marker = new google.maps.Marker({
        position: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        map: this.map,
        title: '',
        icon,
      });

      this.locations.push(marker);
    }
  }

  addZoomListener() {
    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      this.locations.forEach((marker) => {
        marker.setMap(null);
        marker.setIcon(marker.icon);
        marker.setMap(this.map);
      });
    });
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

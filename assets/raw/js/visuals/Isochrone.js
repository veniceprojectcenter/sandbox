import Visual from './helpers/Visual';
import DivOverlay from './helpers/DivOverlay';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';

class Isochrone extends Visual {
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

    for (let i = 0; i < this.data.length; i += 1) {
      const point = this.data[i];
      this.addMarker(parseFloat(point.lat), parseFloat(point.lng), 'blue');
    }

    this.registerDefaultClickAction();
  }

  registerDefaultClickAction() {
    google.maps.event.addListener(this.map, 'click', (event) => {
      console.log(`Lat: ${event.latLng.lat()}| Lng: ${event.latLng.lng()}`);
      this.addMarker(event.latLng.lat(), event.latLng.lng(), 'black');

      if (this.numTimesClicked == null) {
        this.lastLat = event.latLng.lat();
        this.lastLng = event.latLng.lng();
        this.numTimesClicked = 1;
        return;
      }

      const directions = new google.maps.DirectionsService();

      directions.route({
        origin: new google.maps.LatLng(this.lastLat,
                               this.lastLng),
        destination: new google.maps.LatLng(event.latLng.lat(),
                               event.latLng.lng()),
        travelMode: 'WALKING',
      }, (response, status) => {
        if (status === 'OK') {
          const steps = response.routes[0].legs[0].steps;
          console.log(steps);
          for (let i = 0; i < steps.length; i += 1) {
            const start = steps[i].start_point;
            const end = steps[i].end_point;
            this.addMarker(end.lat(), end.lng(), 'green');
            const points = this.getDataPointsWithinParallel(start, end);
          }
        } else {
          window.alert(`Directions request failed due to ${status}`);
        }
      });

      this.lastLat = event.latLng.lat();
      this.lastLng = event.latLng.lng();
    });
  }

  // start and end are objects with .lat() and .lng() functions
  getDataPointsWithinParallel(start, end) {
    // Find the slope between the points
    const slope = (end.lat() - start.lat()) / (end.lng() - start.lng());
  }

  addMarker(lat, lng, color) {
    if (lat && lng) {
      const icon = {
        path: 'M-20,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0',
        fillColor: color,
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

export default Isochrone;

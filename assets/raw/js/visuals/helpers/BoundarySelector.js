class BoundarySelector {
  constructor(map) {
    this.map = map;
    this.points = [];
    this.connections = [];
  }

  clickActionSelection(event) {
    if (!this.currentlySelecting) {
      return;
    }

    // We are currently selecting
    if (this.points.length === 0) {
      this.putfirstMarker(event);
    } else {
      const marker = this.addVertex(event);
      this.points.push(marker);
      const lastMarker = this.points[this.points.length - 2];
      this.addConnection(lastMarker, marker);
      marker.setMap(null);
    }
  }

  addConnection(firstMarker, secondMarker) {
    const point1 = this.constructor.getPoint(firstMarker);
    const point2 = this.constructor.getPoint(secondMarker);
    const line = this.map.addPolyline([point1, point2], 'red', 2);
    this.connections.push(line);
  }

  // Gets a lat, lng point from a google maps marker
  static getPoint(marker) {
    const center = marker.center;
    return { lat: center.lat(), lng: center.lng() };
  }

  addVertex(event) {
    const vertex = this.map.addCircle(
      { lat: event.latLng.lat(), lng: event.latLng.lng() },
      'red', 1, 6,
    );
    return vertex;
  }

  putfirstMarker(event) {
    const firstMarker = this.addVertex(event);
    firstMarker.addListener('click', () => {
      if (this.points.length > 2) {
        this.callback(this.getLatLngs());
      }
      this.clearSelection();
      this.currentlySelecting = false;
      google.maps.event.clearListeners(this.map.map, 'click');
    });
    this.points.push(firstMarker);
  }

  getLatLngs() {
    const points = [];
    this.points.forEach((point) => {
      const center = point.center;
      points.push({ lat: center.lat(), lng: center.lng() });
    });
    return points;
  }

  clearSelection() {
    this.points.forEach((marker) => {
      marker.setMap(null);
    });
    this.points = [];
    this.connections.forEach((line) => {
      line.setMap(null);
    });
    this.connections = [];
  }

  selectPoints(callback) {
    if (this.currentlySelecting === undefined || this.currentlySelecting === false) {
      this.map.registerClickAction((event) => { this.clickActionSelection(event); });
      this.currentlySelecting = true;
    }
    this.clearSelection();
    this.callback = callback;
  }
}

export default BoundarySelector;

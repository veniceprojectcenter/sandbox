class BoundarySelector {
  constructor(map) {
    this.map = map;
    this.points = [];
    this.connections = [];
  }

  static getPointsInBoundary(points, boundaryPoints) {
    const pointsWithinBoundary = [];
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      if (BoundarySelector.isPointWithinBoundary(point, boundaryPoints)) {
        pointsWithinBoundary.push(point);
      }
    }
    console.log(pointsWithinBoundary);
    return pointsWithinBoundary;
  }

  static isPointWithinBoundary(point, boundary) {
    let intersections = 0;
    for (let i = 0; i < boundary.length - 1; i += 1) {
      const p1 = boundary[i];
      const p2 = boundary[i + 1];
      if (BoundarySelector.pointIntersectsLine(point, p1, p2)) {
        intersections += 1;
      }
    }

    return intersections % 2 === 1;
  }

  static pointIntersectsLine(point, p1, p2) {
    const y1 = parseFloat(point.lat);
    const x1 = parseFloat(point.lng);

    // console.log(`Point: (${x1},${y1}) | (${p1})  (${p2})`);

    const y2 = parseFloat(point.lat);
    const x2 = x1 + 0.5; // A big fuckin' shit ton

    const y3 = p1.lat;
    const x3 = p1.lng;

    const y4 = p2.lat;
    const x4 = p2.lng;
    return BoundarySelector.lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4);
  }

  static lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    return true;
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

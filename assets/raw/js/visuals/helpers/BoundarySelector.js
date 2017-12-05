class BoundarySelector {
  constructor(map) {
    this.map = map;
    this.points = [];
    this.connections = [];
  }

  getPointsInBoundary(points, boundaryPoints) {
    const pointsWithinBoundary = [];
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      if (this.isPointWithinBoundary(point, boundaryPoints)) {
        pointsWithinBoundary.push(point);
      }
    }
    return pointsWithinBoundary;
  }

  isPointWithinBoundary(point, boundary) {
    let intersections = 0;
    for (let i = 0; i < boundary.length - 1; i += 1) {
      const p1 = boundary[i];
      const p2 = boundary[i + 1];
      if (this.pointIntersectsLine(point, p1, p2)) {
        intersections += 1;
      }
    }

    return intersections % 2 === 1;
  }

  pointIntersectsLine(point, p1, p2) {
    const y1 = parseFloat(point.lat);
    const x1 = parseFloat(point.lng);

    const y2 = p1.lat;
    const x2 = p1.lng;

    const y3 = p2.lat;
    const x3 = p2.lng;
    return this.lineIntersect(x1, y1, x2, y2, x3, y3);
  }

  lineIntersect(x1, y1, x2, y2, x3, y3) {
    const slope = (y3 - y2) / (x3 - x2);
    const x = ((y1 - y2) / slope) + x2;
    if ((x > x1) &&
        (((x > x2) && (x < x3)) ||
            ((x > x3) && (x < x2)))) {
      return true;
    }
    return false;
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

  static getCentroid(boundary) {
    let minX = boundary[0].lat;
    let minY = boundary[0].lng;
    let maxX = boundary[0].lat;
    let maxY = boundary[0].lng;
    for (let i = 0; i < boundary.length; i += 1) {
      const point = boundary[i];
      if (point.lat < minX) {
        minX = point.lat;
      }
      if (point.lat > maxX) {
        maxX = point.lat;
      }
      if (point.lng < minY) {
        minY = point.lng;
      }
      if (point.lng > maxY) {
        maxY = point.lng;
      }
    }
    const x = (minX + maxX) / 2;
    const y = (minY + maxY) / 2;
    return { lat: x, lng: y };
  }
}

export default BoundarySelector;

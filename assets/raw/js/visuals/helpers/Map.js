import DefaultMapStyle from './DefaultMapStyle';

/* This file is to be used as a default starting point for new map visualizations
 * that feature adding divs
*/

class Map {
  constructor() {
    this.map = null;
    this.circles = [];
    this.polylines = [];

    this.customs = [];
    this.n = 0; // Number of custom icons
  }

  render(containerID) {
    this.map = new google.maps.Map(document.getElementById(containerID), {
      center: { lat: 45.435, lng: 12.335 },
      zoom: 14,
      styles: DefaultMapStyle,
    });
  }

  registerClickAction(clickFunction) {
    google.maps.event.addListener(this.map, 'click', clickFunction);
  }

  addCustomMarker(point, url, size) {
    const icon = {
      url,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
      zIndex: this.n,
    };
    this.n += 1;
    const marker = new google.maps.Marker({
      position: {
        lat: point.lat,
        lng: point.lng,
      },
      map: this.map,
      title: '',
      icon,
    });

    this.customs.push(marker);
  }

  addCustomIconZoomListener() {
    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      this.customs.forEach((marker) => {
        marker.setMap(null);
        marker.setIcon(marker.icon);
        marker.setMap(this.map);
      });
    });
  }

  addTriangle(point, color, opacity, size) {
    const triangleCoords = [
      { lat: point.lat + 0.0002, lng: point.lng },
      { lat: point.lat - 0.0001, lng: point.lng + 0.0002 },
      { lat: point.lat - 0.0001, lng: point.lng - 0.0002 },
      { lat: point.lat + 0.0002, lng: point.lng },
    ];
    const shape = new google.maps.Polygon({
      paths: triangleCoords,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: opacity,
      map: this.map,
    });

    this.polylines.push(shape);
  }

  addCircle(point, color, opacity, r = 15) {
    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0,
      strokeWeight: 0,
      fillColor: color,
      fillOpacity: opacity,
      map: this.map,
      center: point,
      radius: r,
    });

    this.circles.push(circle);
  }

  clearCirclesOfColor(color) {
    for (let i = 0; i < this.circles.length; i += 1) {
      const circle = this.circles[i];
      if (circle.fillColor === color) {
        circle.setMap(null);
      }
    }
  }

  removeCircleAtPoint(center) {
    for (let i = 0; i < this.circles.length; i += 1) {
      const circle = this.circles[i];
      if (circle.center.lat() === center.lat &&
      circle.center.lng() === center.lng) {
        circle.setMap(null);
      }
    }
  }

  addPolyline(points, color, weight) {
    const polyline = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: weight,
    });

    polyline.setMap(this.map);
    this.polylines.push(polyline);
  }

  clear() {
    this.clearPolylines();
    this.clearCircles();
  }

  clearCircles() {
    Map.clear(this.circles);
  }

  clearPolylines() {
    Map.clear(this.polylines);
  }

  static clear(items) {
    items.forEach((item) => {
      item.setMap(null);
    });
    items = [];
  }
}

export default Map;

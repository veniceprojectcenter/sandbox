import DefaultMapStyle from './DefaultMapStyle';

/* This file is to be used as a default starting point for new map visualizations
 * that feature adding divs
*/

class Map {
  constructor() {
    this.map = null;
    this.circles = [];
    this.polylines = [];
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

  addPolyline(points, color, weight) {
    const polyline = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
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

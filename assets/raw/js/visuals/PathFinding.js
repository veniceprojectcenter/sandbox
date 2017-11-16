import Visual from './helpers/Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';

class PathFinding extends Visual {
  constructor(config) {
    super(config);

    this.map = null;
    this.locations = [];
    this.openInfoWindow = null;

    this.DISTANCE_THRESHOLD_PATH = 0.00007;
    this.DEBUG = false;
    this.rectangles = [];
    this.points = [];
    this.savedPoints = { lat1: 0, lng1: 0, lat2: 0, lng2: 0 };
  }

  onLoadData() {
    this.applyDefaultAttributes({
      aggregationColumn: Object.keys(this.data[0])[111],
      title: '',
    });
  }

  render() {
    const renderDiv = document.getElementById(this.renderID);
    this.map = new google.maps.Map(renderDiv, {
      center: { lat: 45.435, lng: 12.335 },
      zoom: 14,
      styles: DefaultMapStyle,
    });

    if (this.showData) this.addDataMarkers();
    // this.addZoomListener();

    this.registerDefaultClickAction();
  }

  addZoomListener() {
    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      const zoomLevel = this.map.getZoom();
      let r = 15;
      if (zoomLevel < 14) {
        this.resizeCircles(35);
        return;
      }
      switch (zoomLevel) {
        case 16:
          r = 20;
          this.resizeCircles(r);
          break;
        case 15:
          r = 25;
          this.resizeCircles(r);
          break;
        case 14:
          r = 30;
          this.resizeCircles(r);
          break;
        default:
          this.resizeCircles(r);
      }
    });
  }

  resizeCircles(r) {
    this.locations.forEach((marker) => {
      marker.setRadius(r);
    });
  }

  addDataMarkers() {
    for (let i = 0; i < this.data.length; i += 1) {
      const point = this.data[i];
      this.addCircle({ lat: parseFloat(point.Latitude), lng: parseFloat(point.Longitude) }, 'blue', 0.5);
    }
  }

  registerDefaultClickAction() {
    google.maps.event.addListener(this.map, 'click', (event) => {
      this.clickAction(event);
    });
  }

  async clickAction(event) {
    // console.log(`Lat: ${event.latLng.lat()}| Lng: ${event.latLng.lng()}`);

    if (this.numTimesClicked == null) {
      this.addCircle({ lat: event.latLng.lat(), lng: event.latLng.lng() }, 'green', 1);
      this.lastLat = event.latLng.lat();
      this.lastLng = event.latLng.lng();
      this.numTimesClicked = 1;
      return;
    } else if (this.numTimesClicked !== null) {
      this.numTimesClicked += 1;
      if (this.numTimesClicked % 2 === 1) { // If numTimesClicked is odd
        this.clearMarkers('green');
        this.clearMarkers('red');
        this.clearRectangles();
        this.lastLat = event.latLng.lat();
        this.lastLng = event.latLng.lng();
        this.addCircle({ lat: event.latLng.lat(), lng: event.latLng.lng() }, 'green', 1);
        return;
      }
      this.addCircle({ lat: event.latLng.lat(), lng: event.latLng.lng() }, 'green', 1);
    }

    this.markRoute(this.lastLat, this.lastLng, event.latLng.lat(), event.latLng.lng());
    this.savedPoints = { lat1: this.lastLat,
      lng1: this.lastLng,
      lat2: event.latLng.lat(),
      lng2: event.latLng.lng() };

    this.startPoint = { lat: this.lastLat, lng: this.lastLng };
    this.lastLat = event.latLng.lat();
    this.lastLng = event.latLng.lng();
  }

  markRoute(sourceLat, sourceLng, destinationLat, destinationLng) {
    const directions = new google.maps.DirectionsService();

    directions.route({
      origin: new google.maps.LatLng(sourceLat,
                             sourceLng),
      destination: new google.maps.LatLng(destinationLat,
                             destinationLng),
      travelMode: 'WALKING',
      avoidFerries: true,
    }, (response, status) => {
      if (status === 'OK') {
        const steps = response.routes[0].overview_path;
        const returnSteps = [];
        for (let i = 0; i < steps.length; i += 1) {
          const step = steps[i];
          returnSteps.push({ lat: step.lat(), lng: step.lng() });
        }
        this.getBridgePath(returnSteps);
      } else {
        window.alert(`Directions request failed due to ${status}`);
      }
    });
  }

  // Consumes a list of lat, lng pairs and produces a list of bridges
  // near the given path
  getBridgePath(path) {
    path.push({ lat: this.lastLat, lng: this.lastLng });
    path.unshift(this.startPoint);
    this.addPolyline(path, 'green', 6);

    let pointsOnWholePath = [];
    for (let i = 0; i < path.length - 1; i += 1) {
      const first = path[i];
      const second = path[i + 1];
      const pointsOnPath = this.getPointsOnPath(first, second);

      pointsOnWholePath = pointsOnWholePath.concat(pointsOnPath);

      pointsOnPath.forEach((point) => {
        const center = { lat: parseFloat(point.Latitude), lng: parseFloat(point.Longitude) };
        this.removeCircle(center);
        this.addCircle(center, 'red', 1, 7);
      });
    }

    this.points = pointsOnWholePath;
    this.displayPointAggregation();
  }

  // start and end are objects with .lat() and .lng() functions
  getPointsOnPath(start, end) {
    // Find the slope between the points
    const slope = (end.lat - start.lat) / (end.lng - start.lng);
    const x1 = start.lng;
    const y1 = start.lat;

    const x2 = end.lng;
    const y2 = end.lat;

    const midX = (x2 + x1) / 2;
    const midY = (y2 + y1) / 2;
    const bisectorSlope = -1 / slope;

    const pointsOnPath = [];
    for (let i = 0; i < this.data.length; i += 1) {
      const pointX = this.data[i].Longitude;
      const pointY = this.data[i].Latitude;

      const pathLineDistance = PathFinding.distanceToLine(pointX, pointY, x1, y1, slope);
      const bisectorDistance =
        PathFinding.distanceToLine(pointX, pointY, midX, midY, bisectorSlope);
      const bisectorThreshold = PathFinding.getDistanceBetweenPoints(x1, y1, x2, y2) / 2;

      if (pathLineDistance < this.DISTANCE_THRESHOLD_PATH &&
          bisectorDistance < bisectorThreshold) {
        pointsOnPath.push(this.data[i]);
      }

      const a = this.DISTANCE_THRESHOLD_PATH;
      const b = bisectorThreshold;
      this.drawRectangle(a, b, slope, midX, midY);
    }
    return pointsOnPath;
  }

  static distanceToLine(pointX, pointY, x, y, slope) {
    const a = -1 * slope;
    const b = 1;
    const c = (-y + (slope * x));

    const numerator = Math.abs((a * pointX) + (b * pointY) + c);
    const denominator = Math.sqrt((a * a) + (b * b));

    const result = numerator / denominator;
    return result;
  }

  static getDistanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(((x2 - x1) * (x2 - x1)) +
                    ((y2 - y1) * (y2 - y1)));
  }

  displayPointAggregation() {
    const points = this.points;
    const number = points.length;
    console.log(`On this path, you will encounter ${number} artifacts.`);
    const fieldToAggregate = this.attributes.aggregationColumn;

    let sum = 0;
    let count = 0;
    for (let i = 0; i < number; i += 1) {
      const point = points[i];
      const value = point[fieldToAggregate];
      if (value !== undefined && value !== null &&
        value !== '' && value !== '0' && value !== 0) {
        sum += parseFloat(point[fieldToAggregate]);
        count += 1;
        // console.log(point[fieldToAggregate]);
      }
    }
    let average = null;
    if (count > 0) {
      average = sum / count;
    }
    console.log(`Total ${fieldToAggregate}: ${sum}.`);
    console.log(`Average: ${average} per artifact.`);
  }

  // Removes all markers from the map of the given color
  clearMarkers(color) {
    for (let i = 0; i < this.locations.length; i += 1) {
      const marker = this.locations[i];
      if (marker.fillColor === color) {
        marker.setMap(null);
      }
    }
  }

  removeCircle(center) {
    for (let i = 0; i < this.locations.length; i += 1) {
      const circle = this.locations[i];
      if (circle.center.lat() === center.lat &&
      circle.center.lng() === center.lng) {
        circle.setMap(null);
      }
    }
  }

  drawRectangle(a, b, slope, px, py) {
    const h = Math.sqrt((b ** 2) + (a ** 2));
    const smallTheta = Math.atan(a / b);
    const lineTheta = Math.atan(slope);
    const theta = smallTheta + lineTheta;

    const thetaB = lineTheta - smallTheta;

    const points = [
      { lat: py + (h * Math.sin(theta)), lng: px + (h * Math.cos(theta)) },
      { lat: py + (h * Math.sin(thetaB)), lng: px + (h * Math.cos(thetaB)) },
      { lat: py - (h * Math.sin(theta)), lng: px - (h * Math.cos(theta)) },
      { lat: py - (h * Math.sin(thetaB)), lng: px - (h * Math.cos(thetaB)) },
      //{ lat: py + (h * Math.sin(theta)), lng: px + (h * Math.cos(theta)) },
    ];

    if (this.showPath) this.addPolyline(points, 'red', 2);
  }

  clearRectangles() {
    this.rectangles.forEach((rectangle) => {
      rectangle.setMap(null);
    });
    this.rectangles = [];
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

  addPolyline(points, color, weight) {
    const polyline = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: weight,
    });

    polyline.setMap(this.map);
    this.rectangles.push(polyline);
  }

  clearAllMarkers() {
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

    editor.createHeader('Controls');

    const columnSelectionID = 'columnSelection';
    const columns = Object.keys(this.data[0]);
    const options = [];
    columns.forEach((column) => {
      options.push({ value: column, text: column });
    });

    editor.createSelectBox(columnSelectionID, 'Select a column to display statistics on:',
      options, this.attributes.aggregationColumn, (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.aggregationColumn = value;
        if (this.numTimesClicked > 0 && this.numTimesClicked % 2 === 0) {
          this.displayPointAggregation();
        }
      });

    /* editor.createCheckBox('showPath', 'Show path bounds', false, (e) => {
      const value = e.currentTarget.checked;
      this.showPath = value;
      this.clearMarkers('green');
      this.clearMarkers('red');
      this.clearRectangles();
      this.markRoute(this.savedPoints.lat1, this.savedPoints.lng1,
        this.savedPoints.lat2, this.savedPoints.lng2);
    }); */

    editor.createCheckBox('showData', 'Show data on map', false, (e) => {
      const value = e.currentTarget.checked;
      this.showData = value;
      if (value) {
        this.addDataMarkers();
      } else {
        this.clearMarkers('blue');
      }
    });
  }
}

export default PathFinding;

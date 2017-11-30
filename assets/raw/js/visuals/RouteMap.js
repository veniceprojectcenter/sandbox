import Visual from './helpers/Visual';
import Map from './helpers/Map';
import EditorGenerator from './helpers/EditorGenerator';
import DefaultMapStyle from './helpers/DefaultMapStyle';

class PathFinding extends Visual {
  constructor(config) {
    super(config);

    this.map = new Map();

    this.DISTANCE_THRESHOLD_PATH = 0.00007;
    this.DEBUG = false;
    this.points = [];
    this.savedPoints = { lat1: 0, lng1: 0, lat2: 0, lng2: 0 };
  }

  onLoadData() {
    this.applyDefaultAttributes({
      aggregationColumn: Object.keys(this.data[0])[107],
      title: '',
      mapStyles: DefaultMapStyle,
    });
  }

  render() {
    const renderDiv = document.getElementById(this.renderID);
    const mapDiv = document.createElement('div');
    mapDiv.id = 'mapDiv';
    mapDiv.className = 'map-container';
    renderDiv.appendChild(mapDiv);

    this.map.render(mapDiv.id, this.attributes.mapStyles);

    const text = document.createElement('p');
    text.id = 'infoText';
    text.innerText = '';
    renderDiv.appendChild(text);


    if (this.showData) this.addDataMarkers();

    this.map.registerClickAction((event) => {
      this.clickAction(event);
    });
  }

  addDataMarkers() {
    for (let i = 0; i < this.data.length; i += 1) {
      const point = this.data[i];
      this.map.addCircle({ lat: parseFloat(point.lat), lng: parseFloat(point.lng) }, 'blue', 0.5);
    }
  }

  async clickAction(event) {
    // console.log(`Lat: ${event.latLng.lat()}| Lng: ${event.latLng.lng()}`);

    if (this.numTimesClicked == null) {
      this.map.addCircle({ lat: event.latLng.lat(), lng: event.latLng.lng() }, 'green', 1);
      this.lastLat = event.latLng.lat();
      this.lastLng = event.latLng.lng();
      this.numTimesClicked = 1;
      return;
    } else if (this.numTimesClicked !== null) {
      this.numTimesClicked += 1;
      if (this.numTimesClicked % 2 === 1) { // If numTimesClicked is odd
        this.map.clearCirclesOfColor('green');
        this.map.clearCirclesOfColor('red');
        this.map.clearPolylines();
        this.lastLat = event.latLng.lat();
        this.lastLng = event.latLng.lng();
        this.map.addCircle({ lat: event.latLng.lat(), lng: event.latLng.lng() }, 'green', 1);
        return;
      }
      this.map.addCircle({ lat: event.latLng.lat(), lng: event.latLng.lng() }, 'green', 1);
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
    this.map.addPolyline(path, 'green', 6);

    let pointsOnWholePath = [];
    for (let i = 0; i < path.length - 1; i += 1) {
      const first = path[i];
      const second = path[i + 1];
      const pointsOnPath = this.getPointsOnPath(first, second);

      pointsOnWholePath = pointsOnWholePath.concat(pointsOnPath);

      pointsOnPath.forEach((point) => {
        const center = { lat: parseFloat(point.lat), lng: parseFloat(point.lng) };
        this.map.removeCircleAtPoint(center);
        this.map.addCircle(center, 'red', 1, 7);
      });
    }

    this.points = pointsOnWholePath;
    this.displayPointAggregation();
  }

  // start and end are objects with .lat() and .lng() functions
  getPointsOnPath(start, end) {
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
      const pointX = this.data[i].lng;
      const pointY = this.data[i].lat;

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
    let infoText = `On this path, you will encounter ${number} artifacts.`;
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
      }
    }
    let average = null;
    if (count > 0) {
      average = sum / count;
    }
    average = parseFloat(Math.round(average * 100) / 100).toFixed(2);

    infoText += `<br/> Sum of ${fieldToAggregate}: ${sum}.`;
    infoText += `<br/> Average: ${average} per artifact.`;
    document.getElementById('infoText').innerHTML = infoText;
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

    if (this.showPath) this.map.addPolyline(points, 'red', 2);
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
      this.map.clearCirclesOfColor('green');
      this.map.clearCirclesOfColor('red');
      this.map.clearPolylines();
      this.markRoute(this.savedPoints.lat1, this.savedPoints.lng1,
        this.savedPoints.lat2, this.savedPoints.lng2);
    }); */

    editor.createCheckBox('showData', 'Show data on map', false, (e) => {
      const value = e.currentTarget.checked;
      this.showData = value;
      if (value) {
        this.addDataMarkers();
      } else {
        this.map.clearCirclesOfColor('blue');
      }
    });

    this.map.renderMapColorControls(editor, this.attributes, (color) => {
      this.attributes.mapStyles[0].stylers[0].color = color;
    }, (color) => {
      this.attributes.mapStyles[1].stylers[0].color = color;
    });
  }
}

export default PathFinding;

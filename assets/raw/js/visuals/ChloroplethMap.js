import Visual from './helpers/Visual';
import Map from './helpers/Map';
import EditorGenerator from './helpers/EditorGenerator';
import BoundarySelector from './helpers/BoundarySelector';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import VeniceOutline from './helpers/VeniceOutline';
import Chloropleth from './helpers/Chloropleth';

/* This file is to be used as a default starting point for new map visualizations
 * that feature adding divs
*/

class ChloroplethMap extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);

    this.map = new Map();
    this.boundarySelector = new BoundarySelector(this.map);

    this.BOUNDARY_COLOR = '#ff3333';

    this.shouldRenderCache = true; // Should localStorage polylines and
    // data markers be rendered up front?
  }

  static removeBoundaryWithPoint(point) {
    const boundaries = JSON.parse(localStorage.boundaries);
    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i];
      if (boundary !== null) {
        for (let j = 0; j < boundary.length; j += 1) {
          const boundPoint = boundary[j];
          if (boundPoint.lat === point.lat) {
            boundaries[i] = null;
          }
        }
      }
    }
    localStorage.boundaries = JSON.stringify(boundaries);
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
      mapStyles: DefaultMapStyle,
      colorBy: Object.keys(this.data[0])[0],
      minColor: '#aaffaa',
      maxColor: '#00ca00',
    });

    if (this.constructor.localStorageIsEmptyOrNulls()) {
      console.log('Local storage is empty, overwriting with venice data');
      localStorage.boundaries = JSON.stringify(VeniceOutline);
    }
  }

  static localStorageIsEmptyOrNulls() {
    let result = true;
    if ((localStorage.boundaries === '') || (localStorage.boundaries === undefined)) {
      return true;
    }
    const storage = JSON.parse(localStorage.boundaries);
    storage.forEach((path) => {
      if ((path !== null) && (path !== undefined)) {
        result = false;
      }
    });
    return result;
  }

  addDataMarkers() {
    for (let i = 0; i < this.data.length; i += 1) {
      const point = this.data[i];
      this.map.addCircle({ lat: parseFloat(point.lat), lng: parseFloat(point.lng) }, 'blue', 0.5);
    }
  }

  render() {
    Visual.empty(this.renderID);

    this.map.render(this.renderID, this.attributes.mapStyles);
    this.renderCache();
  }

  renderCache() {
    this.renderLocalPolyLines();
    this.addDataMarkers();

    if (!this.shouldRendercache) {
      this.setBoundariesMap(null);
    }

    this.drawChloropleth();
  }

  renderLocalPolyLines() {
    if (localStorage.boundaries === undefined) {
      localStorage.boundaries = JSON.stringify([]);
    }
    const lines = JSON.parse(localStorage.boundaries);
    lines.forEach((line) => {
      if (line !== null) {
        const boundary = this.map.addPolyline(line, this.BOUNDARY_COLOR, 5);
        this.addPointsWithinBoundary(this.data, line);
        boundary.addListener('click', () => {
          boundary.setMap(null);
          this.constructor.removeBoundaryWithPoint(line[0]);
        });
      }
    });
  }

  addPointsWithinBoundary(points, boundary) {
    const selector = new BoundarySelector(this.map);
    const pointsWithinBoundary = selector.getPointsInBoundary(points, boundary);
    pointsWithinBoundary.forEach((point) => {
      this.map.addCircle({ lat: parseFloat(point.lat), lng: parseFloat(point.lng) }, 'red', 1);
    });
  }

  drawAndAddBoundary(points) {
    points.push(points[0]);
    const line = this.map.addPolyline(points, this.BOUNDARY_COLOR, 5);
    if (localStorage.boundaries === undefined) {
      localStorage.boundaries = JSON.stringify([]);
    }
    const boundaries = JSON.parse(localStorage.boundaries);
    boundaries.push(points);
    localStorage.boundaries = JSON.stringify(boundaries);
    line.addListener('click', () => {
      line.setMap(null);
      this.constructor.removeBoundaryWithPoint(points[0]);
    });
  }

  setBoundariesMap(map) {
    this.map.polylines.forEach((polyline) => {
      if (polyline.strokeColor === this.BOUNDARY_COLOR) {
        polyline.setMap(map);
      }
    });
    this.map.circles.forEach((circle) => {
      circle.setMap(map);
    });
  }

  drawChloropleth() {
    console.log(`Drawing polygons by field: ${this.attributes.colorBy}`);
    if (localStorage.boundaries === undefined) {
      localStorage.boundaries = JSON.stringify([]);
    }
    const boundaries = JSON.parse(localStorage.boundaries);

    const chloropleth = new Chloropleth(this.attributes.colorBy, boundaries,
      this.data, this.attributes.minColor, this.attributes.maxColor);
    // chloropleth.draw(this.map);
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
    this.createSelectButton(editor);
    this.createHideBoundsBox(editor);
    this.createColumnSelector(editor);

    this.renderColorControls(editor);

    this.map.renderMapColorControls(editor, this.attributes, (color) => {
      this.attributes.mapStyles[0].stylers[0].color = color;
    }, (color) => {
      this.attributes.mapStyles[1].stylers[0].color = color;
    });
  }

  createHideBoundsBox(editor) {
    const id = 'hideBoundsBox';
    editor.createCheckBox(id, 'Toggle Showing Selections', false, () => {
      const checked = document.getElementById(`${id}-checkbox`).checked;
      if (!checked) {
        this.setBoundariesMap(null);
      } else {
        this.setBoundariesMap(this.map.map);
      }
    });
  }

  createColumnSelector(editor) {
    const options = [];
    Object.keys(this.data[0]).forEach((option) => {
      options.push({ text: option, value: option });
    });
    const current = this.attributes.colorBy;
    editor.createSelectBox('columnSelect', 'Select a column to color by',
    options, current, (event) => {
      this.attributes.colorBy = event.currentTarget.value;
      this.drawChloropleth();
    });
  }

  createSelectButton(editor) {
    editor.createButton('selectArea', 'Select Area', () => {
      const selector = new BoundarySelector(this.map);
      selector.selectPoints((points) => {
        this.drawAndAddBoundary(points);
        this.addPointsWithinBoundary(this.data, points);
      });
    });
  }

  renderColorControls(editor) {
    editor.createSpacer();
    editor.createSubHeader('Polygon Color Range');

    editor.createColorField('color-min', 'Minimum Color', this.attributes.minColor, (e) => {
      const value = $(e.currentTarget).val();
      this.attributes.minColor = value;
      this.drawChloropleth();
    });

    editor.createColorField('color-max', 'Maximum Color', this.attributes.maxColor, (e) => {
      const value = $(e.currentTarget).val();
      this.attributes.maxColor = value;
      this.drawChloropleth();
    });
  }
}

export default ChloroplethMap;

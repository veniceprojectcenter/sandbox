import Visual from './helpers/Visual';
import Map from './helpers/Map';
import EditorGenerator from './helpers/EditorGenerator';
import BoundarySelector from './helpers/BoundarySelector';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import VeniceOutline from './helpers/VeniceOutline';
import Choropleth from './helpers/Choropleth';

/* This file is to be used as a default starting point for new map visualizations
 * that feature adding divs
*/

class ChoroplethMap extends Visual {
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
      description: '',
      mapStyles: DefaultMapStyle,
      colorBy: Object.keys(this.data[0])[0],
      colorByCategory: null,
      minColor: '#f9fff9',
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

    const mapContainer = document.createElement('div');
    mapContainer.id = 'map-container';
    mapContainer.className = 'map-container';

    const visual = document.getElementById(this.renderID);
    visual.appendChild(mapContainer);

    this.map.render(mapContainer.id, this.attributes.mapStyles);
    this.renderCache();
    this.renderBasics();
  }

  renderCache() {
    this.renderLocalPolyLines();
    this.addDataMarkers();

    if (!this.shouldRendercache) {
      this.setBoundariesMap(null);
    }

    this.drawChoropleth();
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

  drawChoropleth() {
    // console.log(`Drawing polygons by field: ${this.attributes.colorBy}`);
    if (localStorage.boundaries === undefined) {
      localStorage.boundaries = JSON.stringify([]);
    }
    const boundaries = JSON.parse(localStorage.boundaries);

    Map.clear(this.map.polygons);
    const choropleth = new Choropleth(this.attributes.colorBy,
      this.attributes.colorByCategory, boundaries,
      this.data, this.attributes.minColor, this.attributes.maxColor);
    choropleth.draw(this.map);
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

    this.renderBasicControls(editor);

    editor.createSpacer();
    editor.createSubHeader('Polygon Creation');
    this.createSelectButton(editor);
    this.createHideBoundsBox(editor);
    editor.createSpacer();

    editor.createSubHeader('Polygon Coloring');
    this.createColumnSelector(editor);
    // this.createCategoricalValueSelector(editor);

    const categorySelectContainer = document.createElement('div');
    categorySelectContainer.id = 'categorySelectContainer';
    controlsContainer.appendChild(categorySelectContainer);

    this.createShowCategoryBox(editor);
    editor.createSpacer();

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
      const categoryBoxChecked = document.getElementById('showCategoriesBox-checkbox').checked;
      if (!categoryBoxChecked) {
        this.drawChoropleth();
      } else {
        $('#categorySelect').remove();
        this.attributes.colorByCategory = null;
        this.addCategorySelector();
      }
    });
  }

  createShowCategoryBox(editor) {
    const id = 'showCategoriesBox';
    editor.createCheckBox(id, 'Color by percent in category', false, () => {
      const checked = document.getElementById(`${id}-checkbox`).checked;
      if (!checked) {
        $('#categorySelect').remove();
        this.attributes.colorByCategory = null;
      } else {
        this.addCategorySelector();
      }
    });
  }

  addCategorySelector() {
    const categorySelectEditor =
      new EditorGenerator(document.getElementById('categorySelectContainer'));
    this.createCategoricalValueSelector(categorySelectEditor);
  }

  // Gets a list of unique values in objects in this.data
  // with the given attribute as a key
  getCategories(attribute) {
    const uniqueValues = [];
    this.data.forEach((point) => {
      const value = point[attribute];
      if (!uniqueValues.includes(value)) {
        uniqueValues.push(value);
      }
    });
    return uniqueValues;
  }

  createCategoricalValueSelector(editor) {
    const selectedAttribute = document.getElementById('columnSelect-select').value;
    const categories = this.getCategories(selectedAttribute);
    const options = this.constructor.getOptions(categories);

    const id = 'categorySelect';
    editor.createSelectBox(id, 'Select a category to color by',
    options, null, (event) => {
      const value = event.currentTarget.value;
      this.attributes.colorByCategory = value;
      this.drawChoropleth();
    });
  }

  static getOptions(strings) {
    const options = [];
    strings.forEach((string) => {
      options.push({ text: string, value: string });
    });
    return options;
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
      this.drawChoropleth();
    });

    editor.createColorField('color-max', 'Maximum Color', this.attributes.maxColor, (e) => {
      const value = $(e.currentTarget).val();
      this.attributes.maxColor = value;
      this.drawChoropleth();
    });
  }
}

export default ChoroplethMap;

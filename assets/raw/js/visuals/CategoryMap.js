import Visual from './Visual';
import EditorGenerator from './helpers/EditorGenerator';
import Map from './helpers/Map';
import DefaultMapStyle from './helpers/DefaultMapStyle';

class CategoryMap extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);

    this.map = new Map();
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
      description: '',
      color_by: Object.keys(this.data[0])[0],
      mapStyles: DefaultMapStyle,
    });
  }

  static getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i += 1) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getNthColor(n, label) {
    if (n === 0) {
      return 'hsl(360, 100%, 50%)';
    } else if (n === 1) {
      return 'hsl(235, 100%, 50%)';
    }
    const colors = [];

    for (let i = 1; i < n; i += 1) {
      const d = 2 ** i;
      for (let j = 1; j < d; j += 2) {
        const hue = (j / d) * 360;
        colors.push(hue);
      }
    }

    const value = colors[n - 2];
    return `hsl(${value}, 100%, 50%)`;
  }

  drawMarkers() {
    const groups = Visual.groupBy(this.attributes.color_by, this.data);
    const labels = Object.keys(groups);
    for (let i = 0; i < labels.length; i += 1) {
      const label = labels[i];
      const group = groups[label];
      const color = this.getNthColor(i, label);
      group.forEach((point) => {
        const lat = parseFloat(point.lat);
        const lng = parseFloat(point.lng);
        this.map.addCircle({ lat, lng }, color, 0.5, 25);
      });
    }
  }

  render() {
    const mapContainer = document.createElement('div');
    mapContainer.id = `map-container${this.renderID}`;
    mapContainer.className = 'map-container';

    const visual = document.getElementById(this.renderID);
    visual.appendChild(mapContainer);

    this.map.render(mapContainer.id, this.attributes.mapStyles);
    this.drawMarkers();

    this.renderBasics();
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    this.constructor.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);
    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Configure Map');

    this.renderBasicControls(editor);

    // const columns = Object.keys(this.data[0]);
    const columns = Object.keys(this.getCategoricalData()[0]);
    const categories = [];
    for (let i = 0; i < columns.length; i += 1) {
      categories.push({
        value: columns[i],
        text: columns[i],
      });
    }

    editor.createSelectBox('map-color-col', 'Select column to color by', categories, this.attributes.color_by, (event) => {
      const value = $(event.currentTarget).val();
      this.attributes.color_by = value;
      this.map.clearCircles();
      this.drawMarkers();
    });

    this.map.renderMapColorControls(editor, this.attributes, (color) => {
      this.attributes.mapStyles[0].stylers[0].color = color;
    }, (color) => {
      this.attributes.mapStyles[1].stylers[0].color = color;
    });
  }
}

export default CategoryMap;

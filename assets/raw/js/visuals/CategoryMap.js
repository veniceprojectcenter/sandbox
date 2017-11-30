import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';
import Map from './helpers/Map';
import DefaultMapStyle from './helpers/DefaultMapStyle';

class CategoryMap extends Visual {
  constructor(config) {
    super(config);

    this.map = new Map();
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
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

  drawMarkers() {
    const groups = Visual.groupBy(this.attributes.color_by, this.data);
    const labels = Object.keys(groups);
    for (let i = 0; i < labels.length; i += 1) {
      const label = labels[i];
      const group = groups[label];
      const color = this.constructor.getRandomColor();
      group.forEach((point) => {
        const lat = parseFloat(point.lat);
        const lng = parseFloat(point.lng);
        this.map.addCircle({ lat, lng }, color, 0.5, 25);
      });
    }
  }

  render() {
    const title = document.createElement('h3');
    title.id = 'map-title';
    title.innerText = this.attributes.title;

    const mapContainer = document.createElement('div');
    mapContainer.id = 'map-container';
    mapContainer.className = 'map-container';

    const visual = document.getElementById(this.renderID);
    visual.appendChild(title);
    visual.appendChild(mapContainer);

    this.map.render(mapContainer.id, this.attributes.mapStyles);
    this.drawMarkers();
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

    editor.createTextField('map-title-field', 'Map Title', (e) => {
      this.attributes.title = $(e.currentTarget).val();
      document.getElementById('map-title').innerText = this.attributes.title;
    });

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

    editor.createColorField('map-land-color', 'Map Land Color', this.attributes.mapStyles[0].stylers[0].color, (e) => {
      const value = $(e.currentTarget).val();
      this.attributes.mapStyles[0].stylers[0].color = value;
      this.map.setLandColor(value);
    });

    editor.createColorField('map-water-color', 'Map Water Color', this.attributes.mapStyles[1].stylers[0].color, (e) => {
      const value = $(e.currentTarget).val();
      this.attributes.mapStyles[1].stylers[0].color = value;
      this.map.setWaterColor(value);
    });
  }
}

export default CategoryMap;

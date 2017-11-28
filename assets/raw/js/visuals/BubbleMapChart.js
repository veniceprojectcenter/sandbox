import Visual from './helpers/Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';
import Map from './helpers/Map';

class BubbleMapChart extends Visual {
  constructor(config) {
    super(config);

    this.map = new Map();
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
      size_by: Object.keys(this.getNumericData()[0])[0],
      color_by: Object.keys(this.getNumericData()[0])[0],
      bubble_size: {
        range: [1, 100],
      },
      color: {
        mode: 'interpolate',
        colorspace: 'hcl',
        range: [0, 359],
      },
    });
  }

  // filters out non number values from an array
  static filterNaN(arr) {
    const temp = [];
    for (let i = 0; i < arr.length; i += 1) {
      if (!isNaN(arr[i]) && arr[i] !== '') {
        temp.push(arr[i]);
      }
    }
    return temp;
  }

  drawMarkers() {
    // console.log(this.getNumericData());
    const groups = Visual.groupBy(this.attributes.size_by, this.getNumericData());
    let values = Object.keys(groups);
    values = this.constructor.filterNaN(values);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    // console.log(minVal, maxVal);
    for (let i = 0; i < values.length; i += 1) {
      const val = values[i];
      const group = groups[val];
      const color = '#4286f4';
      // const crange = this.attributes.color.range;
      // const color = d3.scaleLinear().domain([0, labels.length]).range([crange[0], crange[1]]);
      const srange = this.attributes.bubble_size.range;
      const getR = d3.scaleLinear().domain([minVal, maxVal]).range([srange[0], srange[1]]);
      const radius = getR(val);
      group.forEach((point) => {
        const lat = parseFloat(point.lat);
        const lng = parseFloat(point.lng);
        this.map.addCircle({ lat, lng }, color, 0.5, parseFloat(radius));
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

    this.map.render(mapContainer.id);
    this.drawMarkers();
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Configure Map');

    editor.createTextField('map-title-field', 'Map Title', (e) => {
      this.attributes.title = $(e.currentTarget).val();
      document.getElementById('map-title').innerText = this.attributes.title;
    });

    // const columns = Object.keys(this.data[0]);
    const columns = (Object.keys(this.getNumericData()[0]));
    const categories = [];
    for (let i = 0; i < columns.length; i += 1) {
      categories.push({
        value: columns[i],
        text: columns[i],
      });
    }

    editor.createSelectBox('bubble-size-col',
    'Select column to size by', categories, this.attributes.size_by,
     (event) => {
       const value = $(event.currentTarget).val();
       this.attributes.size_by = value;
       this.map.clearCircles();
       this.drawMarkers();
     });

    // editor.createSelectBox('bubble-color-col',
    //  'Select column to color by', categories, this.attributes.color_by,
    //   (event) => {
    //     const value = $(event.currentTarget).val();
    //     this.attributes.color_by = value;
    //     this.map.clearCircles();
    //     this.drawMarkers();
    //   });

    editor.createNumberSlider('min-bubble-size',
      'Minimum Bubble Size',
       this.attributes.bubble_size.range[0],
        1, 50,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.bubble_size.range[0] = `${value}`;
        // this.render();
        this.map.clearCircles();
        this.drawMarkers();
      }, 'mouseup');

    editor.createNumberSlider('max-bubble-size',
       'Maximum Bubble Size',
         this.attributes.bubble_size.range[1],
         51, 100,
       (e) => {
         const value = $(e.currentTarget).val();
         this.attributes.bubble_size.range[1] = `${value}`;
         // this.render();
         this.map.clearCircles();
         this.drawMarkers();
       }, 'mouseup');
  }
}

export default BubbleMapChart;

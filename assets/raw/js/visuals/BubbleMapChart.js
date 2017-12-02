import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';
import Map from './helpers/Map';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import DivOverlay from './helpers/DivOverlay';

class BubbleMapChart extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);

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
        range: ['#000080', '#CD0000'],
      },
      mapStyles: DefaultMapStyle,
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
    const sgroups = Visual.groupBy(this.attributes.size_by, this.getNumericData());
    const cgroups = Visual.groupBy(this.attributes.color_by, this.getNumericData());
    let values = Object.keys(sgroups);
    values = this.constructor.filterNaN(values);
    let cvalues = Object.keys(cgroups);
    cvalues = this.constructor.filterNaN(cvalues);
    const sMin = Math.min(...values);
    const sMax = Math.max(...values);
    const cMin = Math.min(...cvalues);
    const cMax = Math.max(...cvalues);
    for (let i = 0; i < values.length; i += 1) {
      const cval = cvalues[i];
      const crange = this.attributes.color.range;
      const getC = d3.scaleLinear().domain([cMin, cMax]).range([crange[0], crange[1]]);
      const color = getC(cval);
      // console.log(color, cval);
      const sval = values[i];
      const group = sgroups[sval];
      const srange = this.attributes.bubble_size.range;
      const getR = d3.scaleLinear().domain([sMin, sMax]).range([srange[0], srange[1]]);
      const radius = getR(sval);
      group.forEach((point) => {
        const lat = parseFloat(point.lat);
        const lng = parseFloat(point.lng);
        const content = `${'<div id="content">' +
              '<p>'}${this.attributes.size_by}: ${sval}</p>` +
              `<p>${this.attributes.color_by}: ${cval}</p>` +
              '</div>';
        const circle = this.map.addCircle({ lat, lng }, color, 0.5, parseFloat(radius));
        // this.map.addInfoBox(content, circle, { lat, lng });
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
    // visual.appendChild(svg);

    this.map.render(mapContainer.id, this.attributes.mapStyles);
    this.drawMarkers();
  }

  renderControls() {
    if (this.getNumericData().length === 0) {
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

    editor.createNumberSlider('min-bubble-size',
      'Minimum Bubble Size',
       this.attributes.bubble_size.range[0],
        1, 50,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.bubble_size.range[0] = `${value}`;
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
         this.map.clearCircles();
         this.drawMarkers();
       }, 'mouseup');

    editor.createSelectBox('bubble-color-col',
        'Select column to color bubbles by', categories, this.attributes.color_by,
         (event) => {
           const value = $(event.currentTarget).val();
           this.attributes.color_by = value;
           this.map.clearCircles();
           this.drawMarkers();
         });

    editor.createColorField('bubble-color-start', 'Color Range Start', this.attributes.color.range[0],
           (e) => {
             this.attributes.color.range[0] = $(e.currentTarget).val();
             this.map.clearCircles();
             this.drawMarkers();
           });

    editor.createColorField('bubble-color-end', 'Color Range End', this.attributes.color.range[1],
          (e) => {
            this.attributes.color.range[1] = $(e.currentTarget).val();
            this.map.clearCircles();
            this.drawMarkers();
          });

    this.map.renderMapColorControls(editor, this.attributes, (color) => {
      this.attributes.mapStyles[0].stylers[0].color = color;
    }, (color) => {
      this.attributes.mapStyles[1].stylers[0].color = color;
    });

  //   editor.createNumberSlider('bubble-color-start',
  // 'Color range start',
  //  this.attributes.color.range[0],
  //   1, 359,
  // (e) => {
  //   const value = $(e.currentTarget).val();
  //   this.attributes.color.range[0] = `${value}`;
  //   this.map.clearCircles();
  //   this.drawMarkers();
  // });
  //
  //   editor.createNumberSlider('bubble-color-end',
  //   'Color range end',
  //    this.attributes.color.range[1],
  //     1, 359,
  //   (e) => {
  //     const value = $(e.currentTarget).val();
  //     this.attributes.color.range[1] = `${value}`;
  //     this.map.clearCircles();
  //     this.drawMarkers();
  //   });
  }
}

export default BubbleMapChart;

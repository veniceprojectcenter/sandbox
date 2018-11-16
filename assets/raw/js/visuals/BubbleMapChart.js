import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';
import Map from './helpers/Map';
import DefaultMapStyle from './helpers/DefaultMapStyle';
// import DivOverlay from './helpers/DivOverlay';

/**
 * Class that is used for creating Bubble Map Charts
 */
class BubbleMapChart extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);

    this.map = new Map();
  }

  /**
   * Sets default attributes after data is loaded
   */
  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
      infoCols: [], // selected columns for infowindow
      bubble_size: {
        range: [1, 100],
      },
      color: {
        mode: 'interpolate',
        colorspace: 'hcl',
        range: ['#008000', '#FFFF00', '#FF0000'],
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

  // returns all values within a column of an array
  static getVals(arr, col) {
    const temp = [];
    arr.forEach((x) => {
      if (!isNaN(x[col]) && x[col] !== '') {
        temp.push(x[col]);
      }
    });
    return temp;
  }

  drawMarkers() {
    const numData = this.getNumericData();
    const svalues = this.constructor.getVals(numData, this.attributes.size_by);
    const cvalues = this.constructor.getVals(numData, this.attributes.color_by);
    const sMin = Math.min(...svalues);
    const sMax = Math.max(...svalues);
    const cMin = Math.min(...cvalues);
    const cMax = Math.max(...cvalues);
    const cMid = (cMax + cMin) / 2;
    const crange = this.attributes.color.range;
    const getC = d3.scaleLinear()
      .domain([cMin, cMid, cMax])
      .range([crange[0], crange[1], crange[2]]);
    const srange = this.attributes.bubble_size.range;
    const getR = d3.scaleLinear().domain([sMin, sMax]).range([srange[0], srange[1]]);
    for (let i = 0; i < numData.length; i += 1) {
      const sval = numData[i][this.attributes.size_by];
      if (!isNaN(sval) && sval !== '') {
        const radius = getR(sval);
        const cval = numData[i][this.attributes.color_by];
        const color = getC(cval);
        const lat = parseFloat(numData[i].lat);
        const lng = parseFloat(numData[i].lng);
        // const content = `${'<div id="content">' +
        //               '<p>'}${this.attributes.size_by}: ${sval}</p>` +
        //               `<p>${this.attributes.color_by}: ${cval}</p>` +
        //               '</div>';
        const circle = this.map.addCircle({ lat, lng }, color, 0.5, parseFloat(radius));
        // this.map.addInfoBox(content, circle, { lat, lng });
      }
    }
  }

  /**
   * Renders visuals for BubbleMapChart chart
   */
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

  /**
   * Creates menu options
   */
  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    this.renderBasicControls(editor);

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
        1, 49, 1,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.bubble_size.range[0] = `${value}`;
        this.map.clearCircles();
        this.drawMarkers();
      }, 'mouseup');

    editor.createNumberSlider('max-bubble-size',
       'Maximum Bubble Size',
         this.attributes.bubble_size.range[1],
         50, 100, 1,
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

    editor.createColorField('bubble-color-mid', 'Color Range Middle', this.attributes.color.range[1],
          (e) => {
            this.attributes.color.range[1] = $(e.currentTarget).val();
            this.map.clearCircles();
            this.drawMarkers();
          });

    editor.createColorField('bubble-color-end', 'Color Range End', this.attributes.color.range[2],
          (e) => {
            this.attributes.color.range[2] = $(e.currentTarget).val();
            this.map.clearCircles();
            this.drawMarkers();
          });

    // editor.createMultipleSelectBox('infowindow-display',
    //       'Select column(s) to display in Infobox', categories, 'na', (e) => {
    //         this.attributes.infoCols = $(e.currentTarget).val();
    //         this.map.clearCircles();
    //         this.drawMarkers();
    //       });

    this.map.renderMapColorControls(editor, this.attributes, (color) => {
      this.attributes.mapStyles[0].stylers[0].color = color;
    }, (color) => {
      this.attributes.mapStyles[1].stylers[0].color = color;
    });
  }
}

export default BubbleMapChart;

import Visual from './helpers/Visual';
import Map from './helpers/Map';
import EditorGenerator from './helpers/EditorGenerator';
import Filter from './helpers/Filter';

class FilterMap extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);
    this.columnOptions = null;
    this.map = new Map();
    this.attributes.filters = [];
    this.filter = new Filter(this);
    this.attributes.colors = [];
    this.attributes.shapes = [];
    this.attributes.images = [];
  }


  addMarker(lat, lng, color = 'blue', shapeType = 'triangle', image, opacity = 0.5, r = 15) {
    if (shapeType === 'circle') {
      this.map.addCircle({ lat: parseFloat(lat), lng: parseFloat(lng) }, color, opacity, r);
    } else if (shapeType === 'triangle') {
      this.map.addTriangle({ lat: parseFloat(lat), lng: parseFloat(lng) }, color, opacity, r);
    } else if (shapeType === 'custom') {
      if (image === undefined) {
        return;
      }
      this.map.addCustomMarker({ lat: parseFloat(lat), lng: parseFloat(lng) }, image, 20);
    }
  }

  // render the data points on the map
  renderPoints(renderData, color, shape, image) {
    for (let i = 0; i < renderData.length; i += 1) {
      if (renderData[i] !== null && renderData[i] !== undefined) {
        this.addMarker(renderData[i].lat, renderData[i].lng, color, shape, image);
      }
    }
  }

  // render the map
  render() {
    const filters = this.attributes.filters;
    const renderData = this.filter.getFilteredData(filters);
    this.map.render(this.renderID);
    for (let i = 0; i < filters.length; i += 1) {
      if (filters[i] !== undefined && filters[i].categorical !== undefined
        && filters[i].numeric !== undefined) {
        this.renderPoints(renderData[i], this.attributes.colors[i], this.attributes.shapes[i],
          this.attributes.images[i]);
      }
    }
  }

  renderControls() {
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    this.renderControlsDiv.innerHTML = '<h4 style = "text-align: center">Controls</h4> <br>';
    this.filter.makeFilterSeries(
      (headEditor, index) => { this.filterMapHeader(headEditor, index); },
      (filters) => { this.getColorShape(filters); },
    );

    this.render();
  }

  filterMapHeader(headEditor, index) {
    const shapes = [{ value: 'circle', text: 'Circle' }, { value: 'triangle', text: 'Triangle' }, { value: 'custom', text: 'Custom Image' }];
    headEditor.createSelectBox(`shape${index}`, 'Shape', shapes, 'na', (e) => {
      e.currentTarget.parentNode.parentNode.parentNode.children[1].remove();
      if (e.currentTarget.parentNode.parentNode.parentNode.children[1]) {
        e.currentTarget.parentNode.parentNode.parentNode.children[1].remove();
      }
      if ($(e.currentTarget).val() === 'custom') {
        headEditor.createFileUpload(`upload${index}`, 'Upload', () => {
        });
      } else {
        headEditor.createColorField(`color${index}`, `Series ${index}`, '#ff0000', () => {});
      }
      headEditor.createRemoveButton(`remove${index}`, (e2) => {
        this.filter.removeSeries(e2.currentTarget);
      });
    });
    headEditor.createRemoveButton(`remove${index}`, (e2) => {
      this.filter.removeSeries(e2.currentTarget);
    });
  }
  getColorShape(filters) {
    for (let i = 0; i < filters.length; i += 1) {
      if (filters[i] !== undefined) {
        const theColor = $(document.getElementById(`color${i}-field`));
        const theShape = $(document.getElementById(`shape${i}-select`));
        this.attributes.colors[i] = theColor.val();
        this.attributes.shapes[i] = theShape.val();
        if (theShape.val() === 'custom') {
          const url = this.constructor.getSelectedURL(`upload${i}`);
          this.attributes.images[i] = url;
        }
      }
    }
  }

  static getSelectedURL(id) {
    const file = document.getElementById(id).childNodes[1].childNodes[3].files[0];
    if (file !== undefined) {
      const url = window.URL.createObjectURL(file);
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        console.log(fileReader.result);
      };
      fileReader.readAsDataURL(file);
      return url;
    }
    return undefined;
  }

}
export default FilterMap;

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
  }


  addMarker(lat, lng, color = 'blue', shapeType = 'triangle', opacity = 0.5, r = 15) {
    if (shapeType === 'circle') {
      this.map.addCircle({ lat: parseFloat(lat), lng: parseFloat(lng) }, color, opacity, r);
    } else if (shapeType === 'triangle') {
      this.map.addTriangle({ lat: parseFloat(lat), lng: parseFloat(lng) }, color, opacity, r);
    } else if (shapeType === 'custom') {

    }
  }

  // render the data points on the map
  renderPoints(renderData, color, shape) {
    for (let i = 0; i < renderData.length; i += 1) {
      if (renderData[i] !== null && renderData[i] !== undefined) {
        this.addMarker(renderData[i].lat, renderData[i].lng, color, shape);
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
        this.renderPoints(renderData[i], this.attributes.colors[i], this.attributes.shapes[i]);
      }
    }
  }

  renderControls() {
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    this.renderControlsDiv.innerHTML = '<h4 style = "text-align: center">Controls</h4> <br>';
    this.filter.makeFilterSeries(this.filterMapHeader,
      (filters) => { this.getColorShape(filters); });

    this.render();
  }

  filterMapHeader(headEditor, index) {
    const shapes = [{ value: 'circle', text: 'Circle' }, { value: 'triangle', text: 'Triangle' }, { value: 'custom', text: 'Custom Image' }];
    headEditor.createSelectBox(`shape${index}`, 'Shape', shapes, 'na', (e) => {
      if (e.currentTarget.parentNode.parentNode.parentNode.children[1]) {
        e.currentTarget.parentNode.parentNode.parentNode.children[1].remove();
      }
      if ($(e.currentTarget).val() === 'custom') {
        headEditor.createFileUpload(`upload${index}`, 'Upload', () => {});
      } else {
        headEditor.createColorField(`color${index}`, `Series ${index}`, '#ff0000', () => {});
      }
    });
  }
  getColorShape(filters) {
    for (let i = 0; i < filters.length; i += 1) {
      const theColor = $(document.getElementById(`color${i}-field`));
      const theShape = $(document.getElementById(`shape${i}-select`));
      this.attributes.colors[i] = theColor.val();
      this.attributes.shapes[i] = theShape.val();
    }
  }

}
export default FilterMap;

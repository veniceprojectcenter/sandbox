import Visual from './helpers/Visual';
import Map from './helpers/Map';
import ImageHelper from './helpers/ImageHelper';
import Filter from './helpers/Filter';
import Data from './helpers/Data';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';
import Loader from './helpers/Loader';
import EditorGenerator from './helpers/EditorGenerator';

class FilterMap extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);
    this.columnOptions = null;
    this.map = new Map();
    this.attributes.filters = [];
    this.filter = new Filter(this);
    this.renderData = [];
    this.dataSets = [];
    Data.fetchDataSets((e) => { this.getAllDataSets(e); });
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
      mapStyles: DefaultMapStyle,
    });
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
    this.map = new Map();
    this.map.render(this.renderID, this.attributes.mapStyles);
    this.applyFiltersAndRender();
  }

  applyFiltersAndRender() {
    console.log(this.attributes.filters);
    const filters = this.attributes.filters;
    const dataSets = [];
    this.renderData = [];
    for (let i = 0; i < filters.length; i += 1) {
      const filter = filters[i];
      if (filter !== undefined && filter.categorical !== undefined
        && filter.numeric !== undefined) {
        dataSets[i] = Data.fetchData(filter.dataSet,
          (dataSet) => {
            this.filter.getFilteredDatum(i, filter, dataSet);
            this.renderPoints(this.renderData[i],
              this.attributes.colors[i], this.attributes.shapes[i],
            this.attributes.images[i]);
          });
      }
    }
  }

  renderControls() {
    this.attributes.colors = [];
    this.attributes.shapes = [];
    this.attributes.images = [];
    this.attributes.areaSelections = [];
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    const editor = new EditorGenerator(this.renderControlsDiv);
    editor.createHeader('Controls');
    this.filter.makeFilterSeries(
      (headEditor, index) => { this.filterMapHeader(headEditor, index); },
      (filters) => { this.getColorShape(filters); },
    );

    this.map.renderMapColorControls(editor, this.attributes, (color) => {
      this.attributes.mapStyles[0].stylers[0].color = color;
    }, (color) => {
      this.attributes.mapStyles[1].stylers[0].color = color;
    });
  }

  filterMapHeader(headEditor, index) {
    const shapes = [{ value: 'circle', text: 'Circle' }, { value: 'triangle', text: 'Triangle' }, { value: 'custom', text: 'Custom Image' }];
    headEditor.createSelectBox(`dataSet${index}`, 'Data Set', this.allSets, 'na', (e) => { this.replaceFilter(e.currentTarget); });
    headEditor.createSelectBox(`shape${index}`, 'Shape', shapes, 'na', (e) => {
      e.currentTarget.parentNode.parentNode.parentNode.children[2].remove();
      if (e.currentTarget.parentNode.parentNode.parentNode.children[2]) {
        e.currentTarget.parentNode.parentNode.parentNode.children[2].remove();
      }
      if ($(e.currentTarget).val() === 'custom') {
        headEditor.createFileUpload(`upload${index}`, 'Upload', async () => {
          const image = await this.constructor.getSelectedImage(`upload${index}`);
          this.attributes.images[index] = image;
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
  async getColorShape(filters) {
    for (let i = 0; i < filters.length; i += 1) {
      if (filters[i] !== undefined) {
        const theColor = $(document.getElementById(`color${i}-field`));
        const theShape = $(document.getElementById(`shape${i}-select`));
        this.attributes.colors[i] = theColor.val();
        this.attributes.shapes[i] = theShape.val();
      }
    }
  }

  static async getSelectedImage(id) {
    const file = document.getElementById(id).childNodes[1].childNodes[3].files[0];
    if (file !== undefined) {
      const url = window.URL.createObjectURL(file);
      return ImageHelper.urlToBase64(url);
    }
    return undefined;
  }
  getAllDataSets(allSets) {
    const selectSet = [];
    for (let i = 0; i < allSets.length; i += 1) {
      selectSet.push({ value: allSets[i].id, text: allSets[i].name });
    }
    this.allSets = selectSet;
  }
  async replaceFilter(target) {
    if (target === undefined) {
      return;
    }
    this.renderControlsDiv.style.disabled = 'true';
    const set = $(target).val();
    $(`#${this.renderControlsID} *`).prop('disabled', true);
    const tempDiv = target.parentNode.parentNode.parentNode.parentNode.children[1];
    tempDiv.innerHTML = ' ';
    tempDiv.id = 'someID';
    const loader = new Loader(this.renderID);
    loader.render();
    await Data.fetchData(set, (e) => {
      $(`#${this.renderControlsID} *`).prop('disabled', false);
      loader.remove();
      this.filter.renderFilter(tempDiv, e);
      this.dataSets[$(target).val()] = e;
      this.map.render(this.renderID, this.attributes.mapStyles);
    });
  }
}
export default FilterMap;

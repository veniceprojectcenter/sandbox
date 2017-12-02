import Visual from './helpers/Visual';
import Map from './helpers/Map';
import ImageHelper from './helpers/ImageHelper';
import Filter from './helpers/Filter';
import Data from './helpers/Data';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';
import Loader from './helpers/Loader';

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
    this.attributes.sliders = {};
    this.generateMapEvent = document.createEvent('Event');
    this.generateMapEvent.initEvent('generateMap', true, true);
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
    const filters = this.attributes.filters;
    this.map.render(this.renderID);
    document.getElementById(this.renderID).firstChild.style.height = '85%';
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
    const div = document.createElement('div');
    const visual = document.getElementById('visual');
    visual.insertBefore(div, null);
    div.style = 'position: relative; height: 12%; top: 85%; z-index: 2';

    const editor = new EditorGenerator(div);
    Object.keys(this.attributes.sliders).forEach((outerElem, outerIndex) => {
      Object.keys(this.attributes.sliders[outerElem].attributes).forEach((innerElem, innerIndex) => {
        editor.createNumberSlider(`slider-${outerIndex}-${innerIndex}`,
          `${this.attributes.sliders[outerElem].name} ${innerElem}`, this.attributes.sliders[outerElem].attributes[innerElem],
          1, 10, 1,
          (t) => {
            const value = $(t.currentTarget).val();
            this.attributes.sliders[outerElem].attributes[innerElem] = `${value}`;
            // this.render();
          });
      });
    });
  }

  renderControls() {
    this.attributes.colors = [];
    this.attributes.shapes = [];
    this.attributes.images = [];
    this.attributes.areaSelections = [];
    this.renderControlsDiv = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(this.renderControlsDiv);
    editor.createHeader('Controls');

    this.renderControlsDiv.addEventListener('newNumericFilter', (e) => {
      this.addCheckboxToFilterRow(e.target);
    }, false);

    this.renderControlsDiv.addEventListener('generateMap', () => {
      const sliders = {};
      $(this.filter.ul).children('li').each(function (datasetIndex) {
        const dataset = $(this).find('div.collapsible-header div[id^=dataSet]').find('li.selected span')[0].innerText;
        sliders[datasetIndex] = {
          name: dataset,
          attributes: {},
        };
        $(this).find('div[id$=numFilterList] div.row').each(function () {
          const column = $(this).find('div[id$=1]').find('li.selected span')[0].innerText;
          if ($(this).find('div[id$=4] :checkbox:checked').length !== 0) {
            sliders[datasetIndex].attributes[column] = 0;
          }
        });
      });
      this.attributes.sliders = sliders;
    }, false);

    this.filter.makeFilterSeries(
      (headEditor, index) => { this.filterMapHeader(headEditor, index); },
      (filters) => {
        this.getColorShape(filters);
        this.filter.ul.dispatchEvent(this.generateMapEvent);
      },
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
    $(`ul#collapseUl li div.collapsible-header div#dataSet${index}`).change((evt) => {
      $(evt.target).closest('li').find('div[id$=numFilterList] div.row')[0].dispatchEvent(this.filter.newNumericFilterEvent);
    });
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

  addCheckboxToFilterRow(filterRow) {
    const valueCol = filterRow.querySelector('div[id$="3"]');
    valueCol.classList.replace('col-md-5', 'col-md-4');

    const closeButn = filterRow.querySelector('div[id$="4"]');
    const closeButnId = closeButn.getAttribute('id');
    const groupId = closeButnId.split('-').slice(0, 2);
    const seriesNum = groupId[0];
    const filterNum = groupId[1];
    closeButn.id = `numFilter${seriesNum}-${filterNum}-6`;

    const checkboxNode = document.createElement('div');
    checkboxNode.classList.add('col-md-1');
    checkboxNode.id = `numFilter${seriesNum}-${filterNum}-5`;
    const groupIdJoin = groupId.join('-');
    checkboxNode.innerHTML = `
      <input type="checkbox" id="${groupIdJoin}-toVisual" />
      <label for="${groupIdJoin}-toVisual" style="margin-top:25px"/>
    `;
    filterRow.insertBefore(checkboxNode, valueCol.nextSibling);

    checkboxNode.onchange = (evt) => {
      if (evt.target.checked) {
        const valueBoxNode = filterRow.querySelector('[id$="3"]');
        filterRow.removeChild(valueBoxNode);
        const upperBoundNode = document.createElement('div');
        upperBoundNode.classList.add('input-field', 'col-md-2');
        upperBoundNode.id = `numFilter${seriesNum}-${filterNum}-4`;
        upperBoundNode.innerHTML = `
          <input type="number" id="numFilter{seriesNum}-{filterNum}-bound2">
          <label for="numFilter{seriesNum}-{filterNum}-upperBound">Upper Bound</label>
        `;
        filterRow.insertBefore(upperBoundNode, checkboxNode);
        const lowerBoundNode = document.createElement('div');
        lowerBoundNode.classList.add('input-field', 'col-md-2');
        lowerBoundNode.id = `${seriesNum}-${filterNum}-3`;
        lowerBoundNode.innerHTML = `
          <input type="number" id="${seriesNum}-${filterNum}-bound1">
          <label for="${seriesNum}-${filterNum}-lowerBound">Lower Bound</label>
        `;
        filterRow.insertBefore(lowerBoundNode, upperBoundNode);
      } else {
        const lowerBoundNode = filterRow.querySelector('[id$="3"]');
        const upperBoundNode = filterRow.querySelector('[id$="4"]');
        filterRow.removeChild(lowerBoundNode);
        filterRow.removeChild(upperBoundNode);
        const valueBoxNode = document.createElement('div');
        valueBoxNode.classList.add('input-field', 'col-md-4');
        valueBoxNode.id = `${seriesNum}-${filterNum}-3`;
        valueBoxNode.innerHTML = `
          <input type="number" id="${seriesNum}-${filterNum}-field">
          <label for="${seriesNum}-${filterNum}-number">Value</label>
        `;
        filterRow.insertBefore(valueBoxNode, checkboxNode);
      }
    };
  }
}

export default FilterMap;

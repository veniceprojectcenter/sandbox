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
    this.attributes.sliders = { a: 1, b: 2 };
  }

<<<<<<< HEAD
=======
  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
      mapStyles: DefaultMapStyle,
    });
  }

>>>>>>> c6c50d19bc5b6416fe34b6551c2199768c0c023d
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
<<<<<<< HEAD
    const filters = this.attributes.filters;
    this.map.render(this.renderID);
=======
    this.map = new Map();
    this.map.render(this.renderID, this.attributes.mapStyles);
    this.applyFiltersAndRender();
  }

  applyFiltersAndRender() {
    console.log(this.attributes.filters);
    const filters = this.attributes.filters;
>>>>>>> c6c50d19bc5b6416fe34b6551c2199768c0c023d
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
    visual.insertBefore(div, visual.firstChild);

    const editor = new EditorGenerator(div);
    Object.keys(this.attributes.sliders).forEach((e, i) => {
      editor.createNumberSlider(`slider-${i}`,
        `${e}`, this.attributes.sliders[e], 1, 10,
        (t) => {
          const value = $(t.currentTarget).val();
          this.attributes.sliders[e] = `${value}`;
          this.render();
        });
    });
  }

  renderControls() {
    this.attributes.colors = [];
    this.attributes.shapes = [];
    this.attributes.images = [];
    this.attributes.areaSelections = [];
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
<<<<<<< HEAD
    this.renderControlsDiv.innerHTML = '';
    this.renderControlsDiv.innerHTML = '<h4 style = "text-align: center">Controls</h4> <br>';
    this.renderControlsDiv.addEventListener('addCheckbox', (e) => {
      this.addCheckboxToFilterRow(e.target);
    }, false);
=======
    const editor = new EditorGenerator(this.renderControlsDiv);
    editor.createHeader('Controls');
>>>>>>> c6c50d19bc5b6416fe34b6551c2199768c0c023d
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
    $(`ul#collapseUl li div.collapsible-header div#dataSet${index}`).change((evt) => {
      $(evt.target).closest('li').find('div[id$=numFilterList] div.row')[0].dispatchEvent(this.filter.addCheckboxEvent);
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
<<<<<<< HEAD

  replaceFilter(target) {
=======
  async replaceFilter(target) {
>>>>>>> c6c50d19bc5b6416fe34b6551c2199768c0c023d
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
    const newCloseButnIndex = parseInt(closeButnId.split('-')[2], 10);
    const newCloseButnIdGroup = groupId.slice(0);
    newCloseButnIdGroup.push(String(newCloseButnIndex + 1));
    closeButn.id = newCloseButnIdGroup.join('-');

    const checkboxNode = document.createElement('div');
    checkboxNode.classList.add('col-md-1');
    checkboxNode.id = closeButnId;
    const groupIdJoin = groupId.join('-');
    checkboxNode.innerHTML = `
      <input type="checkbox" id="${groupIdJoin}-toVisual" />
      <label for="${groupIdJoin}-toVisual" style="margin-top:25px"/>
    `;
    checkboxNode.onchange = (evt) => {
      if ($(`select[id=${groupIdJoin}-columnSelect]`).val() !== null) {
        if (evt.target.checked) {
          console.log('box was checked');
        } else {
          console.log('box was unchecked');
        }
      } else {
        console.log('select was null');
      }
    };
    filterRow.insertBefore(checkboxNode, valueCol.nextSibling);
  }
}

export default FilterMap;

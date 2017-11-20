import Visual from './helpers/Visual';
import Map from './helpers/Map';
import EditorGenerator from './helpers/EditorGenerator';

class FilterMap extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);
    this.columnOptions = null;
    this.map = new Map();
    this.attributes.filters = [];
    this.shapes = [{ value: 'circle', text: 'circle' }, { value: 'triangle', text: 'triangle' }];
  }

  addMarker(lat, lng, color = 'blue', shapeType = 'triangle', opacity = 0.5, r = 15) {
    let shape = null;
    if (shapeType === 'circle') {
      this.map.addCircle({ lat: parseFloat(lat), lng: parseFloat(lng) }, color, opacity, r);
    }
    if (shapeType === 'triangle') {
      const myLat = parseFloat(lat);
      const myLng = parseFloat(lng);
      const triangleCoords = [
    { lat: myLat + 0.0002, lng: myLng },
    { lat: myLat - 0.0001, lng: myLng + 0.0002 },
    { lat: myLat - 0.0001, lng: myLng - 0.0002 },
    { lat: myLat + 0.0002, lng: myLng },
      ];
      shape = new google.maps.Polygon({
        paths: triangleCoords,
        strokeColor: color,
        strokeOpacity: opacity,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: opacity,
        map: this.map.map,
      });
      this.map.polylines.push(shape);
    }
  }

  // render the data points on the map
  renderPoints(renderData, color, shape) {
    for (let i = 0; i < renderData.length; i += 1) {
      if (renderData[i] !== null && renderData[i] !== undefined) {
        this.addMarker(renderData[i].Latitude, renderData[i].Longitude, color, shape);
      }
    }
  }

  // render the map
  render() {
    const filters = this.attributes.filters;
    const renderData = [];

    this.map.render(this.renderID);

    for (let i = 0; i < filters.length; i += 1) {
      if (filters[i] !== undefined && filters[i].categorical !== undefined
        && filters[i].numeric !== undefined) {
        renderData[i] = this.filterCategorical(filters[i].categorical, this.data);
        renderData[i] = this.filterNumerical(filters[i].numeric, renderData[i]);
        this.renderPoints(renderData[i], filters[i].color, filters[i].shape);
      }
    }
  }
  renderControls() {
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    const editor = new EditorGenerator(this.renderControlsDiv);
    this.renderControlsDiv.innerHTML = `<h4 style = "text-align: center">Controls</h4> <br>
    <ul id='collapseUl'class="collapsible" data-collapsible="accordion">`;

    const ul = document.getElementById('collapseUl');
    this.renderControlsDiv.appendChild(ul);

    let seriesNumber = 0;
    let li = document.createElement('li');
    ul.appendChild(li);
    let filterHead = document.createElement('div');
    filterHead.classList.add('collapsible-header');
    let headEditor = new EditorGenerator(filterHead);
    li.appendChild(filterHead);
    headEditor.createColorField('color0', 'Series 1', '#ff0000', () => {
    });
    headEditor.createSelectBox('shape0', 'Shape', this.shapes, 'na', () => {});

    let filterDiv = document.createElement('div');
    filterDiv.classList.add('collapsible-body');
    li.appendChild(filterDiv);
    this.renderFilter(filterDiv, seriesNumber);

    editor.createButton('addSeries', 'Add a Data Series', () => {
      li = document.createElement('li');
      ul.appendChild(li);
      filterHead = document.createElement('div');
      filterHead.classList.add('collapsible-header');
      headEditor = new EditorGenerator(filterHead);
      seriesNumber += 1;
      li.appendChild(filterHead);
      headEditor.createColorField(`color${seriesNumber}`, `Series ${seriesNumber + 1}`, '#ff0000', () => {

      });
      headEditor.createSelectBox(`shape${seriesNumber}`, 'Shape', this.shapes, `na${seriesNumber}`, () => {});

      filterDiv = document.createElement('div');
      filterDiv.classList.add('collapsible-body');
      li.appendChild(filterDiv);

      this.renderFilter(filterDiv, seriesNumber);
    });
    editor.createButton('submit', 'Generate Map', () => {
      for (let k = 0; k <= seriesNumber; k += 1) {
        const dataFilters = [];
        const numericFilters = [];
        const catFilters = document.getElementsByClassName(`dataFilter${k}`);
        const numFilters = document.getElementsByClassName(`numFilter${k}`);
        for (let i = 0; i < catFilters.length; i += 1) {
          const filter = catFilters[i];
          const columnVal = $(filter.children[0].children[0].children[3]).val();
          let catVal = $(filter.children[2].children[0].children[3]).val();
          const b = $(filter.children[1].children[0].children[3]).val();
          if (b === '0') {
            const categories = this.getGroupedList(columnVal);
            for (let j = 0; j < categories.length; j += 1) {
              categories[j] = categories[j].key;
              if (catVal.includes(categories[j])) {
                categories.splice(j, 1);
              }
            }
            catVal = categories;
          }
          dataFilters.push({ column: columnVal, categories: catVal });
        }
        for (let i = 0; i < numFilters.length; i += 1) {
          const filter = numFilters[i];
          const columnVal = $(filter.children[0].children[0].children[3]).val();
          const opVal = $(filter.children[1].children[0].children[3]).val();
          const val = $(filter.children[2].children[0]).val();
          numericFilters.push({ column: columnVal, operation: opVal, value: val });
        }

        const theColor = $(document.getElementById(`color${k}-field`));
        const theShape = $(document.getElementById(`shape${k}-select`));
        this.attributes.filters[k] = {
          color: theColor.val(),
          shape: theShape.val(),
          numeric: numericFilters,
          categorical: dataFilters };
      }
      this.render();
    });
    this.render();
  }
  renderFilter(myDiv, seriesNumber) {
    const editor = new EditorGenerator(myDiv);
    this.columnOptions = Object.keys(this.data[0]);
    const catFilterDiv = document.createElement('div');
    const numFilterDiv = document.createElement('div');
    catFilterDiv.id = 'catFilterDiv';
    numFilterDiv.id = 'numFilterDiv';


    const catEditor = new EditorGenerator(catFilterDiv);
    const numEditor = new EditorGenerator(numFilterDiv);

    const ccats = [];
    const ncats = [];
    // let rawCats = Object.keys(this.getCategoricalData()[0]);
    // rawCats = rawCats.concat(Object.keys(this.getNumericData()[0]));
    const catData = Object.keys(this.getCategoricalData()[0]);
    const numData = Object.keys(this.getNumericData(2)[0]);
    let num = 0;
    for (let i = 0; i < catData.length; i += 1) {
      ccats.push({ value: catData[i], text: catData[i] });
    }
    for (let i = 0; i < numData.length; i += 1) {
      ncats.push({ value: numData[i], text: numData[i] });
    }

    // this.renderControlsDiv.append(document.createElement('br'));
    const filterLabel = document.createElement('h5');
    filterLabel.innerHTML = 'Categorical Filters';
    filterLabel.style.textAlign = 'center';
    myDiv.appendChild(filterLabel);
    myDiv.appendChild(catFilterDiv);
    editor.createButton(`addCat-${seriesNumber}`, 'Add Categorical Filter', () => {
      num += 1;
      catEditor.createDataFilter(`Filter${num}-${seriesNumber}`, ccats, `dataFilter${seriesNumber}`, (e) => {
        const column = $(e.currentTarget).val();
        const categories = this.getGroupedList(column);
        const catSelect = e.currentTarget.parentNode.parentNode.nextSibling.nextSibling
        .nextSibling.nextSibling.children[0].children[3];
        $(catSelect).empty().html(' ');
        $(catSelect).append(
        $('<option disabled=true></option>')
          .attr('Select', '-Select-')
          .text('-Select-'));
        for (let i = 0; i < categories.length; i += 1) {
          const value = categories[i].key;
          $(catSelect).append(
            $('<option></option>')
            .attr('value', value)
            .text(value),
          );
        }
        $(catSelect).material_select();
      }, (e) => { this.removeFilter(e.currentTarget); });
    });
    myDiv.appendChild(document.createElement('br'));
    myDiv.appendChild(document.createElement('br'));
    const filterLabel2 = document.createElement('h5');
    filterLabel2.innerHTML = 'Numeric Filters';
    filterLabel2.style.textAlign = 'center';
    myDiv.appendChild(filterLabel2);
    myDiv.appendChild(numFilterDiv);
    catEditor.createDataFilter(`Filter${seriesNumber}`, ccats, `dataFilter${seriesNumber}`, (e) => {
      const column = $(e.currentTarget).val();
      const categories = this.getGroupedList(column);
      const catSelect = e.currentTarget.parentNode.parentNode.nextSibling.nextSibling
      .nextSibling.nextSibling.children[0].children[3];
      $(catSelect).empty().html(' ');
      $(catSelect).append(
        $('<option disabled=true></option>')
        .attr('Select', '-Select-')
        .text('-Select-'));
      for (let i = 0; i < categories.length; i += 1) {
        const value = categories[i].key;
        $(catSelect).append(
          $('<option></option>')
          .attr('value', value)
          .text(value),
        );
      }
      $(catSelect).material_select();
    }, (e) => { this.removeFilter(e.currentTarget); });

    numEditor.createNumericFilter(`NumFilter-${seriesNumber}`, ncats, `numFilter${seriesNumber}`, (e) => {
      this.removeFilter(e.currentTarget);
    });


    editor.createButton('addNum', 'Add Numeric Filter', () => {
      num += 1;
      numEditor.createNumericFilter(`NumFilter${num}-${seriesNumber}`, ncats, `numFilter${seriesNumber}`, (e) => { this.removeFilter(e.currentTarget); });
    });

    myDiv.appendChild(document.createElement('br'));
    myDiv.appendChild(document.createElement('br'));
  }

  removeFilter(buttonID) {
    buttonID.parentNode.parentNode.remove();
  }


}
export default FilterMap;

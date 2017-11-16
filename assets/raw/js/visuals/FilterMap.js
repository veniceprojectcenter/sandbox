import Visual from './helpers/Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';

class FilterMap extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);
    this.columnOptions = null;
    this.renderData = [];
    this.map = null;
    this.locations = [];
    this.openInfoWindow = null;
  }

  addMarker(lat, lng, color = 'blue', opacity = 0.5, r = 15) {
    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: opacity,
      map: this.map,
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius: r,
    });

    this.locations.push(circle);
  }

  // render the data points on the map
  renderPoints() {
    for (let i = 0; i < this.renderData.length; i += 1) {
      if (this.renderData[i] !== null && this.renderData[i] !== undefined) {
        this.addMarker(this.renderData[i].Latitude, this.renderData[i].Longitude);
      }
    }
  }

  // render the map
  render() {
    if (this.attributes.dataFilters !== undefined && this.attributes.numericFilters !== undefined) {
      this.renderData = this.filterCategorical(this.attributes.dataFilters, this.renderData);
      this.renderData = this.filterNumerical(this.attributes.numericFilters, this.renderData);
    } else {
      this.renderData = this.data;
    }
    this.map = new google.maps.Map(document.getElementById(this.renderID), {
      center: new google.maps.LatLng(45.435, 12.335),
      zoom: 14,
      styles: DefaultMapStyle,
    });
    this.renderPoints();
  }

  renderControls() {
    this.attributes.dataFilters = [];
    this.attributes.numericFilters = [];
    this.renderData = JSON.parse(JSON.stringify(this.data));
    this.columnOptions = Object.keys(this.data[0]);
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    const catFilterDiv = document.createElement('div');
    const numFilterDiv = document.createElement('div');
    catFilterDiv.id = 'catFilterDiv';
    numFilterDiv.id = 'numFilterDiv';
    this.renderControlsDiv.innerHTML = '<h4 style = "text-align: center">Controls</h4> <br>';

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
    const editor = new EditorGenerator(this.renderControlsDiv);
    // this.renderControlsDiv.append(document.createElement('br'));
    const filterLabel = document.createElement('h5');
    filterLabel.innerHTML = 'Categorical Filters';
    filterLabel.style.textAlign = 'center';
    this.renderControlsDiv.appendChild(filterLabel);
    this.renderControlsDiv.appendChild(catFilterDiv);
    editor.createButton('addCat', 'Add Categorical Filter', () => {
      num += 1;
      catEditor.createDataFilter(`Filter${num}`, ccats, (e) => {
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
    this.renderControlsDiv.appendChild(document.createElement('br'));
    this.renderControlsDiv.appendChild(document.createElement('br'));
    const filterLabel2 = document.createElement('h5');
    filterLabel2.innerHTML = 'Numeric Filters';
    filterLabel2.style.textAlign = 'center';
    this.renderControlsDiv.appendChild(filterLabel2);
    this.renderControlsDiv.appendChild(numFilterDiv);
    catEditor.createDataFilter('Filter', ccats, (e) => {
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

    numEditor.createNumericFilter('NumFilter', ncats, (e) => {
      this.removeFilter(e.currentTarget);
    });


    editor.createButton('addNum', 'Add Numeric Filter', () => {
      num += 1;
      numEditor.createNumericFilter(`NumFilter${num}`, ncats, (e) => { this.removeFilter(e.currentTarget); });
    });

    this.renderControlsDiv.appendChild(document.createElement('br'));
    this.renderControlsDiv.appendChild(document.createElement('br'));
    editor.createButton('submit', 'Generate Map', () => {
      this.attributes.dataFilters = [];
      this.attributes.numericFilters = [];
      const catFilters = document.getElementsByClassName('dataFilter');
      const numFilters = document.getElementsByClassName('numFilter');
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
        this.attributes.dataFilters.push({ column: columnVal, categories: catVal });
      }
      for (let i = 0; i < numFilters.length; i += 1) {
        const filter = numFilters[i];
        const columnVal = $(filter.children[0].children[0].children[3]).val();
        const opVal = $(filter.children[1].children[0].children[3]).val();
        const val = $(filter.children[2].children[0]).val();
        this.attributes.numericFilters.push({ column: columnVal, operation: opVal, value: val });
      }
      this.renderData = this.data;
      this.renderData = this.filterCategorical(this.attributes.dataFilters, this.renderData);
      this.renderData = this.filterNumerical(this.attributes.numericFilters, this.renderData);
      this.render();
    });
  }

  removeFilter(buttonID) {
    buttonID.parentNode.parentNode.remove();
  }


}
export default FilterMap;

import Visual from './helpers/Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';

class FilterMap extends Visual {
  constructor(config) {
    super(config);

    this.attributes.columnOptions = null;
    this.attributes.displayColumns = [];
    this.renderData = [];

    this.map = null;
    this.locations = [];
    this.openInfoWindow = null;
  }

  onLoadData() {
    const columnNames = Object.keys(this.data[0]);
    this.applyDefaultAttributes({
      chart_size: 0.005, // In degrees latitude/longitude
      group_column: columnNames[52],
      chart_column: columnNames[76],
    });
  }

  addMarker(lat, lng) {
    if (lat && lng) {
      const icon = {
        path: 'M-20,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0',
        fillColor: 'blue',
        fillOpacity: 0.6,
        anchor: new google.maps.Point(0, 0),
        strokeWeight: 0,
        scale: 1,
      };
      const marker = new google.maps.Marker({
        position: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        map: this.map,
        title: '',
        animation: google.maps.Animation.DROP,
        icon,
      });

      this.locations.push({
        marker,
      });
    }
  }

  // render the map
  render() {
    this.map = new google.maps.Map(document.getElementById(this.renderID), {
      center: { lat: 45.435, lng: 12.335 },
      zoom: 14,
      styles: DefaultMapStyle,
    });
  }

  // render the data points on the map
  renderPoints() {
    for (let i = 0; i < this.data.length; i += 1) {
      this.addMarker(this.data[i].lat, this.data[i].lng);
    }
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }
    Visual.empty(this.renderControlsID);

    this.attributes.dataFilters = [];
    this.attributes.numericFilters = [];
    this.renderData = JSON.parse(JSON.stringify(this.data));
    this.attributes.columnOptions = Object.keys(this.data[0]);
    this.renderControlsDiv = document.getElementById(this.renderControlsID);

    const ccats = [];
    const ncats = [];
    const catData = Object.keys(this.getCategoricalData()[0]);
    const numData = Object.keys(this.getNumericData(2)[0]);
    for (let i = 0; i < catData.length; i += 1) {
      ccats.push({ value: catData[i], text: catData[i] });
    }
    for (let i = 0; i < numData.length; i += 1) {
      ncats.push({ value: numData[i], text: numData[i] });
    }
    this.binDiv = document.createElement('div');
    const editor = new EditorGenerator(this.renderControlsDiv);
    this.renderControlsDiv.innerHTML = '<h4 style = "text-align: center">Filter Map by</h4> <br>';
    editor.createDataFilter('Filter', ccats, (e) => {
      const column = $(e.currentTarget).val();
      const categories = this.getGroupedList(column);
      const catSelect = e.currentTarget.parentNode.parentNode.nextSibling.nextSibling
      .nextSibling.nextSibling.children[0].children[3];
      $(catSelect).empty().html(' ');
      for (let i = 0; i < categories.length; i += 1) {
        const value = categories[i].key;
        $(catSelect).append(
  $('<option></option>')
    .attr('value', value)
    .text(value),
);
      }
      $(catSelect).material_select();
    });
    editor.createNumericFilter('NumFilter', ncats, () => {
      this.render();
    });
    this.renderControlsDiv.appendChild(this.binDiv);
    const filterCats = [];
    for (let i = 0; i < this.attributes.columnOptions.length; i += 1) {
      filterCats.push({ value: this.attributes.columnOptions[i],
        text: this.attributes.columnOptions[i] });
    }
    editor.createButton('submit', 'Generate Map', () => {
      this.attributes.dataFilters = [];
      this.attributes.numericFilters = [];
      const catFilters = document.getElementsByClassName('dataFilter');
      const numFilters = document.getElementsByClassName('numFilter');
      for (let i = 0; i < catFilters.length; i += 1) {
        const filter = catFilters[i];
        const columnVal = $(filter.children[0].children[0].children[3]).val();
        const catVal = $(filter.children[2].children[0].children[3]).val();
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
      this.renderPoints();
    });
  }
}

export default FilterMap;

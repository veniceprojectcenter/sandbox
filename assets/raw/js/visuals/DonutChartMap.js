import Visual from './Visual';
import Map from './helpers/Map';
import EditorGenerator from './helpers/EditorGenerator';
import DivOverlay from './helpers/DivOverlay';
import Donut from './Donut';
import DefaultMapStyle from './helpers/DefaultMapStyle';

class DonutChartMap extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);

    this.map = new Map();
  }

  onLoadData() {
    const columnNames = Object.keys(this.data[0]);
    this.applyDefaultAttributes({
      chart_size: 0.005, // In degrees lat/lng
      group_column: columnNames[52],
      chart_column: columnNames[76],
      mapStyles: DefaultMapStyle,
      title: '',
      description: '',
    });
  }

  render() {
    const mapContainer = document.createElement('div');
    mapContainer.id = `map-container${this.renderID}`;
    mapContainer.className = 'map-container';

    const visual = document.getElementById(this.renderID);
    visual.appendChild(mapContainer);

    this.map.render(mapContainer.id, this.attributes.mapStyles);

    const groupColumn = this.attributes.group_column;
    const chartColumn = this.attributes.chart_column;

    let groups = this.getGroupsByColumn(groupColumn);
    groups = this.constructor.calculatePositions(groups);


    const length = Object.keys(groups).length;
    for (let i = 0; i < length; i += 1) {
      const groupName = Object.keys(groups)[i];
      const group = groups[groupName];
      this.renderChart(groupName, group, chartColumn);
    }

    this.renderBasics();
  }

  renderChart(groupName, group, chartColumn) {
    const chartSize = this.attributes.chart_size;
    if (group.lat === undefined) {
      return;
    }
    // this.map.addCircle({ lat: group.lat, lng: group.lng }, 'blue', 1);
    // this.map.addCircle({ lat: group.lat + (chartSize / 1.5), lng: group.lng + chartSize }, 'blue', 1);


    const bounds = new google.maps.LatLngBounds(
       new google.maps.LatLng(group.lat,
                              group.lng),
       new google.maps.LatLng(group.lat + (chartSize / 1.5),
                              group.lng + chartSize),
      );

    const renderfunction = (id) => {
      const config = {
        dataSet: this.dataSet,
        type: 'donut',
        attributes: {
          title: '',
          group_by: chartColumn,
          dontDefineDimensions: true,
          font_size: 60,
          show_legend: false,
        },
      };

      const donutVisual = new Donut(config);
      donutVisual.loadStaticData(group.data);
      donutVisual.renderID = id;
      donutVisual.render();
    };

    if (this.currentId == null) {
      this.currentId = 1;
    } else {
      this.currentId += 1;
    }

    new DivOverlay(bounds, `donut${this.currentId}`, this.map.map, renderfunction);
  }

  static calculatePositions(groups) {
    // Calculate the average lat and lng
    const length = Object.keys(groups).length;
    for (let i = 0; i < length; i += 1) {
      const groupName = Object.keys(groups)[i];
      const group = groups[groupName];
      let lat = 0;
      let lng = 0;
      let count = 0;
      for (let j = 0; j < group.data.length; j += 1) {
        const currLat = parseFloat(group.data[j].lat);
        const currLng = parseFloat(group.data[j].lng);
        if (currLat !== 0 && currLng !== 0) {
          lat += currLat;
          lng += currLng;
          count += 1;
        }
      }
      if (count > 0) {
        lat /= count;
        lng /= count;
      }
      group.lat = lat;
      group.lng = lng;
    }

    return groups;
  }

  getGroupsByColumn(groupColumn) {
    const groups = {};
    for (let i = 0; i < this.data.length; i += 1) {
      const currentItem = this.data[i];
      const groupName = currentItem[groupColumn];
      if (!Object.keys(groups).includes(groupName)) {
        groups[groupName] = { data: [] };
      }
      groups[groupName].data.push(currentItem);
    }

    return groups;
  }

  getCategoryNameObjects() {
    const columnNames = Object.keys(this.data[0]);
    const categories = [];
    for (let i = 0; i < columnNames.length; i += 1) {
      categories.push({ value: columnNames[i], text: columnNames[i] });
    }
    return categories;
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    const categories = this.getCategoryNameObjects();

    editor.createHeader('Editor');
    this.renderBasicControls(editor);

    editor.createSelectBox('group-column', 'Select column to group by',
      categories, this.attributes.group_column, (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.group_column = value;
        this.render();
      });
    editor.createSelectBox('piechart-column', 'Select column to display in pie chart',
      categories, this.attributes.chart_column, (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.chart_column = value;
        this.render();
      });
    this.map.renderMapColorControls(editor, this.attributes, (color) => {
      this.attributes.mapStyles[0].stylers[0].color = color;
    }, (color) => {
      this.attributes.mapStyles[1].stylers[0].color = color;
    });
  }
}

export default DonutChartMap;

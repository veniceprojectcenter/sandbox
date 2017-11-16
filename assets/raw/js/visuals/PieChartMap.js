import Visual from './helpers/Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';
import DivOverlay from './helpers/DivOverlay';
import Donut from './Donut';
import Bar from './Bar';

class PieChartMap extends Visual {
  constructor(config) {
    super(config);

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

  render() {
    this.map = new google.maps.Map(document.getElementById(this.renderID), {
      center: { lat: 45.435, lng: 12.335 },
      zoom: 14,
      styles: DefaultMapStyle,
    });

    const groupColumn = this.attributes.group_column;
    const chartColumn = this.attributes.chart_column;

    let groups = this.getGroupsByColumn(groupColumn);
    groups = PieChartMap.calculatePositions2(groups);


    const length = Object.keys(groups).length;
    for (let i = 0; i < length; i += 1) {
      const groupName = Object.keys(groups)[i];
      const group = groups[groupName];
      this.renderChart(groupName, group, chartColumn);
    }

    // this.putBarChart();
  }

  putBarChart() {
    const bounds = new google.maps.LatLngBounds(
       new google.maps.LatLng(45.453,
                              12.335),
       new google.maps.LatLng(45.453 + 0.01,
                              12.335 + 0.01),
      );

    const renderfunction = (id) => {
      const config = {
        dataSet: this.dataSet,
        type: 'bar',
        attributes: {
          width: 600,
          height: 400,
          font_size: '8',
          x_font_rotation: 45,
          x_font_x_offset: 0,
          x_font_y_offset: 0,
          colors: {
            mode: 'list',
            colorspace: 'hcl',
            list: [0],
          },
          hide_empty: '',
          category_order: '',
          group_by_main: this.attributes.groupColumn,
          group_by_stack: this.attributes.chartColumn,
        },
      };

      const donutVisual = new Bar(config);
      donutVisual.renderID = id;
      donutVisual.render();
    };

    new DivOverlay(bounds, 'barchart', this.map, renderfunction);
  }

  renderChart(groupName, group, chartColumn) {
    const chartSize = this.attributes.chart_size;
    if (group.Latitude === undefined) {
      return;
    }

    group.Latitude -= 0.0032; // These values are used to center the chart divs
    group.Longitude -= 0.0037; // to where they look like they should actually be.

    const bounds = new google.maps.LatLngBounds(
       new google.maps.LatLng(group.Latitude,
                              group.Longitude),
       new google.maps.LatLng(group.Latitude + chartSize,
                              group.Longitude + chartSize),
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

    new DivOverlay(bounds, `donut${this.currentId}`, this.map, renderfunction);

    // this.addMarker(group.lat, group.lng);
  }

  static calculatePositions(groups) {
    const length = Object.keys(groups).length;
    for (let i = 0; i < length; i += 1) {
      const groupName = Object.keys(groups)[i];
      const group = groups[groupName];

      for (let j = 0; j < group.data.length; j += 1) {
        const currLat = parseFloat(group.data[j].Latitude);
        const currLng = parseFloat(group.data[j].Longitude);
        if (currLat !== 0 && currLng !== 0 &&
            currLat !== undefined && currLng !== undefined) {
          group.Latitude = currLat;
          group.Longitude = currLng;
          break;
        }
      }
    }

    return groups;
  }

  static calculatePositions2(groups) {
    // Calculate the average latitude and longitude
    const length = Object.keys(groups).length;
    for (let i = 0; i < length; i += 1) {
      const groupName = Object.keys(groups)[i];
      const group = groups[groupName];
      let lat = 0;
      let lng = 0;
      let count = 0;
      for (let j = 0; j < group.data.length; j += 1) {
        const currLat = parseFloat(group.data[j].Latitude);
        const currLng = parseFloat(group.data[j].Longitude);
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
      group.Latitude = lat;
      group.Longitude = lng;
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
        title: 'tesfsdgds',
        animation: google.maps.Animation.DROP,
        icon,
      });

      this.locations.push({
        marker,
      });
    }
  }

  clearMarkers() {
    this.locations.forEach((marker) => {
      marker.setMap(null);
    });
    this.locations = [];
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
  }
}

export default PieChartMap;

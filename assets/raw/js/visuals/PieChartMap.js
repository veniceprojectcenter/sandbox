import Visual from '../Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';
import Donut from './Donut';

class DivOverlay extends google.maps.OverlayView {
  constructor(bounds, divId, map, renderfunction) {
    super();

    this.bounds_overlay = bounds;
    this.divId_overlay = divId;
    this.map_overlay = map;
    this.div_overlay = null;
    this.renderfunction = renderfunction;

    this.setMap(map);
  }

  onAdd() {
    const div = document.createElement('div');
    div.id = this.divId_overlay;

    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    this.div_overlay = div;

    // Add the element to the "overlayLayer" pane.
    const panes = this.getPanes();
    // panes.overlayLayer.appendChild(div);
    panes.overlayMouseTarget.appendChild(div);

    this.renderfunction(this.divId_overlay);
  }

  draw() {
    const overlayProjection = this.getProjection();

    const sw = overlayProjection.fromLatLngToDivPixel(this.bounds_overlay.getSouthWest());
    const ne = overlayProjection.fromLatLngToDivPixel(this.bounds_overlay.getNorthEast());

    const div = this.div_overlay;
    div.style.left = `${sw.x}px`;
    div.style.top = `${ne.y}px`;
    div.style.width = `${ne.x - sw.x}px`;
    div.style.height = `${sw.y - ne.y}px`;
  }

}

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
    groups = PieChartMap.calculatePositions(groups);

    console.log(groups);

    const length = Object.keys(groups).length;
    for (let i = 0; i < length; i += 1) {
      const groupName = Object.keys(groups)[i];
      const group = groups[groupName];
      this.renderChart(groupName, group, chartColumn);
    }
  }

  renderChart(groupName, group, chartColumn) {
    const chartSize = this.attributes.chart_size;
    console.log(`Adding chart: ${group.lat}, ${group.lng}`);
    if (group.lat === undefined) {
      return;
    }

    const bounds = new google.maps.LatLngBounds(
       new google.maps.LatLng(group.lat,
                              group.lng),
       new google.maps.LatLng(group.lat + chartSize,
                              group.lng + chartSize),
      );

    const renderfunction = (id) => {
      const config = {
        dataSet: this.dataSet,
        type: 'donut',
        attributes: {
          title: '',
          group_by: chartColumn,
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
    const overlay = new DivOverlay(bounds, `donut${this.currentId}`, this.map, renderfunction);

    this.addMarker(group.lat, group.lng);
  }

  static calculatePositions(groups) {
    const length = Object.keys(groups).length;
    for (let i = 0; i < length; i += 1) {
      const groupName = Object.keys(groups)[i];
      const group = groups[groupName];

      for (let j = 0; j < group.data.length; j += 1) {
        const currLat = parseFloat(group.data[j].lat);
        const currLng = parseFloat(group.data[j].lng);
        if (currLat !== 0 && currLng !== 0 &&
            currLat !== undefined && currLng !== undefined) {
          group.lat = currLat;
          group.lng = currLng;
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

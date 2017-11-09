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

    this.addMarker = this.addMarker.bind(this);
  }

  onLoadData() {
    const columnNames = Object.keys(this.data[0]);
    this.applyDefaultAttributes({
      group_column: columnNames[0],
      chart_column: columnNames[1],
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

    const groups = this.getGroupsByColumn(groupColumn);
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

  clearMarkers() {
    this.locations.forEach((marker) => {
      marker.setMap(null);
    });
    this.locations = [];
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    const columnNames = Object.keys(this.data[0]);
    const categories = [];
    for (let i = 0; i < columnNames.length; i += 1) {
      categories.push({ value: columnNames[i], text: columnNames[i] });
    }

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

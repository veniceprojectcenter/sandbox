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

  addMarker(data, svgText, anchorx, anchory) {
    if (data.lat && data.lng) {
      const icon = {
        url: `data:image/svg+xml;utf-8, ${svgText}`,
        anchor: new google.maps.Point(anchorx, anchory),
      };

      const marker = new google.maps.Marker({
        position: {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
        },
        map: this.map,
        title: data.wiki_friendly_title,
        animation: google.maps.Animation.DROP,
        icon,
      });

      this.locations.push(
        marker,
      );
    }
  }

  render() {
    this.map = new google.maps.Map(document.getElementById(this.renderID), {
      center: { lat: 45.435, lng: 12.335 },
      zoom: 14,
      styles: DefaultMapStyle,
    });

    const groupColumn = this.attributes.group_column;
    const chartColumn = this.attributes.chart_column;

    const groups = {};
    for (let i = 0; i < this.data.length; i += 1) {
      const currentItem = this.data[i];
      const groupName = currentItem[groupColumn];
      if (!Object.keys(groups).includes(groupName)) {
        groups[groupName] = [];
      }
    }

    const svgText = '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"> ' +
        '<circle cx="10" cy ="10" r="5" stroke="blue" stroke-width="3" fill="blue" />' +
      '</svg>';

    /* google.maps.event.addListener(this.map, 'click', (event) => {
      console.log(`Lat: ${event.latLng.lat()}| Lng: ${event.latLng.lng()}`);
      // this.addMarker({ lat: event.latLng.lat(), lng: event.latLng.lng() }, svgText, 10, 10);
      // this.addMarker({ lat: event.latLng.lat() + 0.01, lng: event.latLng.lng() + 0.01 }, svgText, 10, 10);

      const bounds = new google.maps.LatLngBounds(
       new google.maps.LatLng(event.latLng.lat(),
                              event.latLng.lng()),
       new google.maps.LatLng(event.latLng.lat() + 0.01,
                              event.latLng.lng() + 0.01),
      );

      const renderfunction = (id) => {
        const config = {
          dataSet: this.dataSet,
          type: 'donut',
          attributes: {},
        };

        const donutVisual = new Donut(config);
        donutVisual.loadStaticData(this.data);
        donutVisual.renderID = id;
        donutVisual.render();
      };

      if (this.currentId == null) {
        this.currentId = 1;
      } else {
        this.currentId += 1;
      }

      const overlay = new DivOverlay(bounds, `donut${this.currentId}`, this.map, renderfunction);
    }); */
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
      });
    editor.createSelectBox('piechart-column', 'Select column to display in pie chart',
      categories, this.attributes.chart_column, (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.chart_column = value;
      });
  }
}

export default PieChartMap;

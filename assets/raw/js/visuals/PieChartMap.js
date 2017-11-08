import Visual from '../Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';
import Donut from './Donut';

class MapOverlay extends google.maps.OverlayView {
  constructor(bounds, divId, map) {
    super();

    this.bounds_overlay = bounds;
    this.divId_overlay = divId;
    this.map_overlay = map;
    this.div_overlay = null;

    this.setMap(map);
  }

  onAdd() {
    const div = document.createElement('div');
    const h = document.createElement('h1');
    h.innerHTML = 'hello';
    div.appendChild(h);

    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    this.div_overlay = div;

    // Add the element to the "overlayLayer" pane.
    const panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
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

  static determineColor(year) {
    if (year) {
      let range = parseFloat(year) - 1500;
      if (range > 255) {
        range = 255;
      }
      return `#${range.toString(16)}${(255 - range).toString(16)}FF`;
    }
    return '#FF0000';
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

    const svgText = '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"> ' +
        '<circle cx="10" cy ="10" r="5" stroke="blue" stroke-width="3" fill="blue" />' +
      '</svg>';
    const x = 10;
    const y = 10;

    this.data.forEach((data) => {
      this.addMarker(data, svgText, x, y);
    });
  }

  clearMarkers() {
    this.locations.forEach((marker) => {
      marker.setMap(null);
    });
    this.locations = [];
  }

  updateOverlay() {
    google.maps.event.addListener(this.map, 'click', (event) => {
      console.log(`Lat: ${event.latLng.lat()}| Lng: ${event.latLng.lng()}`);
    });


    this.clearMarkers();
    const svgText = '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"> ' +
        '<circle cx="10" cy ="10" r="5" stroke="red" stroke-width="3" fill="red" />' +
      '</svg>';
    const x = 10;
    const y = 10;

    /* this.data.forEach((data) => {
      this.addMarker(data, svgText, x, y);
    }); */

    this.addMarker(this.data[0], svgText, x, y);


    // Render donutcharts
    const chartDiv = document.createElement('div');
    chartDiv.id = 'donutchartdiv';
    document.getElementById('page').appendChild(chartDiv);

    const config = {
      dataSet: this.dataSet,
      type: 'donut',
      attributes: {},
    };

    const donutVisual = new Donut(config);
    donutVisual.loadStaticData(this.data);
    donutVisual.renderID = chartDiv.id;
    donutVisual.render();

    const donutText = chartDiv.innerHTML;
    // console.log(donutText);
    this.addMarker(this.data[0], donutText, 0, 0);
    console.log(`${this.data[0].lat} ${this.data[0].lng}`);

    const bounds = new google.maps.LatLngBounds(
     new google.maps.LatLng(45.438,
                            12.327),
     new google.maps.LatLng(45.438,
                            12.327));

    const overlay = new MapOverlay(bounds, 'test', this.map);
  }

  renderControls() {
    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Editor');
    editor.createButton('updateOverlayButton', 'update overlay', () => { this.updateOverlay(); });
  }
}

export default PieChartMap;

import Visual from './helpers/Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';
import EditorGenerator from './helpers/EditorGenerator';

class Map extends Visual {
  constructor(config) {
    super(config);

    this.map = null;
    this.locations = [];
    this.openInfoWindow = null;

    this.addMarker = this.addMarker.bind(this);
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
      center: { lat: 45.43, lng: 12.33 },
      zoom: 13,
      styles: DefaultMapStyle,
      color: {
        by: 'id',
        range: [0, 359],
        type: 'hue',
      },
    });
  }

  determineColor(value) {
    const data = this.getGroupedListCounts(this.attributes.color.by);
    console.log(data);
    const crange = this.attributes.color.range;
    const color = d3.scaleLinear().domain([0, data.length]).range([crange[0], crange[1]]);


    return d3.hcl(color(value), 100, 75).toString();
  }

  addMarker(data) {
    if (data.Latitude && data.Longitude) {
      const icon = {
        path: 'M-20,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0',
        fillColor: this.determineColor(data[this.attributes.color.by]),
        fillOpacity: 0.6,
        anchor: new google.maps.Point(0, 0),
        strokeWeight: 0,
        scale: 1,
      };
      const marker = new google.maps.Marker({
        position: {
          lat: parseFloat(data.Latitude),
          lng: parseFloat(data.Longitude),
        },
        map: this.map,
        title: data.wiki_friendly_title,
        animation: google.maps.Animation.DROP,
        icon,
      });

      let contentString = `${'<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h1 id="firstHeading" class="firstHeading">'}${data.wiki_friendly_title}</h1>` +
            '<div id="bodyContent">';

      if (data.description_italian) {
        contentString += `<p><b>Description: </b>${data.description_italian}</p>`;
      }

      if (data.approximate_year) {
        contentString += `<p><b>Approximate Year: </b>${data.approximate_year}</p>`;
      }

      if (data.risk_factor_metal_description) {
        contentString += `<p><b>Risk Factor: </b> ${data.risk_factor_metal_description}</p>`;
      }

      contentString += '</div></div>';

      const infowindow = new google.maps.InfoWindow({
        content: contentString,
      });

      marker.addListener('click', () => {
        if (this.openInfoWindow) {
          this.openInfoWindow.close();
        }
        infowindow.open(this.map, marker);
        this.openInfoWindow = infowindow;
      });

      this.locations.push({
        marker,
        infowindow,
      });
    }
  }

  render() {
    const title = document.createElement('h3');
    title.id = 'map-title';
    title.innerText = this.attributes.title;

    const mapContainer = document.createElement('div');
    mapContainer.id = 'map-container';
    mapContainer.className = 'map-container';

    const visual = document.getElementById(this.renderID);
    visual.appendChild(title);
    visual.appendChild(mapContainer);

    this.map = new google.maps.Map(mapContainer, {
      center: this.attributes.center,
      zoom: this.attributes.zoom,
      styles: this.attributes.styles,
    });

    this.data.forEach(this.addMarker);
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Configure Map');

    editor.createTextField('map-title-field', 'Map Title', (e) => {
      this.attributes.title = $(e.currentTarget).val();
      document.getElementById('map-title').innerText = this.attributes.title;
    });

    const columns = this.getColumns();
    const categories = [];
    for (let i = 0; i < columns.length; i += 1) {
      categories.push({
        value: columns[i],
        text: columns[i],
      });
    }

    editor.createSelectBox('map-color-col', 'Select column to color by', categories, this.attributes.color_by,
     (e) => {
      //  const value = $(e.currentTarget).val();
      //  this.attributes.group_by = value;
      //  this.render();
     });
  }
}

export default Map;

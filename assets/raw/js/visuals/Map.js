import Visual from '../Visual';
import DefaultMapStyle from './helpers/DefaultMapStyle';

class Map extends Visual {
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

  addMarker(data) {
    if (data.lat && data.lng) {
      const icon = {
        path: 'M-20,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0',
        fillColor: Map.determineColor(data.year),
        fillOpacity: 0.6,
        anchor: new google.maps.Point(0, 0),
        strokeWeight: 0,
        scale: 1,
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
    this.map = new google.maps.Map(document.getElementById(this.renderID), {
      center: { lat: 45.43, lng: 12.33 },
      zoom: 13,
      styles: DefaultMapStyle,
    });

    this.data.forEach(this.addMarker);
  }

  renderControls() {
    // Render some controls
  }
}

export default Map;

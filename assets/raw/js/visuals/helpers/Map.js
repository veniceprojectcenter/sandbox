import DefaultMapStyle from './DefaultMapStyle';
import ImageHelper from './ImageHelper';

/* This file is to be used as a default starting point for new map visualizations
 * that feature adding divs
*/

class Map {
  constructor() {
    this.map = null;
    this.circles = [];
    this.polylines = [];
    this.customs = [];
    this.n = 0; // Number of custom icons
    this.styles = [];
  }

  render(containerID, styles = DefaultMapStyle) {
    const renderDiv = document.getElementById(containerID);
    this.styles = styles;
    renderDiv.classList.add('map');
    this.map = new google.maps.Map(renderDiv, {
      center: { lat: 45.435, lng: 12.335 },
      zoom: 14,
      styles,
    });
  }

  registerClickAction(clickFunction) {
    google.maps.event.addListener(this.map, 'click', clickFunction);
  }

  setLandColor(color) {
    this.styles[0].stylers[0].color = color;
    this.map.setOptions({
      styles: this.styles,
    });
  }

  setWaterColor(color) {
    this.styles[1].stylers[0].color = color;
    this.map.setOptions({
      styles: this.styles,
    });
  }

  addCustomMarker(point, url, size) {
    const icon = {
      url,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
      zIndex: this.n,
    };
    this.n += 1;
    const marker = new google.maps.Marker({
      position: {
        lat: point.lat,
        lng: point.lng,
      },
      map: this.map,
      title: '',
      icon,
    });

    this.customs.push(marker);
  }

  addCustomIconZoomListener() {
    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      this.customs.forEach((marker) => {
        marker.setMap(null);
        marker.setIcon(marker.icon);
        marker.setMap(this.map);
      });
    });
  }

  addTriangle(point, color, opacity) {
    const triangleCoords = [
      { lat: point.lat + 0.0002, lng: point.lng },
      { lat: point.lat - 0.0001, lng: point.lng + 0.0002 },
      { lat: point.lat - 0.0001, lng: point.lng - 0.0002 },
      { lat: point.lat + 0.0002, lng: point.lng },
    ];
    const shape = new google.maps.Polygon({
      paths: triangleCoords,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: opacity,
      map: this.map,
    });

    this.polylines.push(shape);
  }

  addCircle(point, color, opacity, r = 15) {
    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0,
      strokeWeight: 0,
      fillColor: color,
      fillOpacity: opacity,
      map: this.map,
      center: point,
      radius: r,
    });

    this.circles.push(circle);
    return circle;
  }

  addInfoBox(contentString, marker, point) {
    marker.addListener('click', () => {
      const infowindow = new google.maps.InfoWindow({
        map: this.map,
        position: point,
        content: contentString,
      });
      infowindow.open(this.map, marker);
    });
  }

  clearCirclesOfColor(color) {
    for (let i = 0; i < this.circles.length; i += 1) {
      const circle = this.circles[i];
      if (circle.fillColor === color) {
        circle.setMap(null);
      }
    }
  }

  removeCircleAtPoint(center) {
    for (let i = 0; i < this.circles.length; i += 1) {
      const circle = this.circles[i];
      if (circle.center.lat() === center.lat &&
      circle.center.lng() === center.lng) {
        circle.setMap(null);
      }
    }
  }

  addPolyline(points, color, weight) {
    const polyline = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: weight,
    });

    polyline.setMap(this.map);
    this.polylines.push(polyline);
    return polyline;
  }

  clear() {
    this.clearPolylines();
    this.clearCircles();
  }

  clearCircles() {
    Map.clear(this.circles);
  }

  clearPolylines() {
    Map.clear(this.polylines);
  }

  static clear(initialItems) {
    let items = initialItems;

    items.forEach((item) => {
      item.setMap(null);
    });

    items = [];
  }

  getStaticMap() {
    const centerString = `center=${this.map.getCenter().lat()},${this.map.getCenter().lng()}`;
    const zoomString = `zoom=${this.map.getZoom()}`;
    const width = this.map.getDiv().offsetWidth;
    const height = this.map.getDiv().offsetHeight;
    const sizeString = `size=${width}x${height}`;
    let styleString = '';
    for (let i = 0; i < DefaultMapStyle.length; i += 1) {
      const feature = DefaultMapStyle[i].featureType || 'all';
      const element = DefaultMapStyle[i].elementType || 'all';
      const rule = Object.keys(DefaultMapStyle[i].stylers[0])[0];
      const argument = DefaultMapStyle[i].stylers[0][rule].replace('#', '0x');
      const style = `style=feature:${feature}|element:${element}|${rule}:${argument}`;
      if (i !== 0) {
        styleString += '&';
      }
      styleString += style;
    }
    const optionsString = `${centerString}&${zoomString}&${sizeString}&${styleString}`;
    const mapURL = `https://maps.googleapis.com/maps/api/staticmap?${optionsString}&key=AIzaSyCkT74d_hmbDXczCSmtMBdgNSWEDHovxN0`;

    return {
      url: mapURL,
      width,
      height,
    };
  }

  latLngToPixel(latLng) {
    const projection = this.map.getProjection();
    const bounds = this.map.getBounds();
    const topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
    const bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
    const scale = 2 ** this.map.getZoom();
    const worldPoint = projection.fromLatLngToPoint(latLng);
    const metersPerPixel = (156543.03392 * Math.cos((latLng.lat() * Math.PI) / 180)) / scale;
    const coords = {
      x: Math.floor((worldPoint.x - bottomLeft.x) * scale),
      y: Math.floor((worldPoint.y - topRight.y) * scale),
      metersPerPixel,
    };

    return coords;
  }

  getCirclesAsSVG() {
    const map = this.getStaticMap();
    let circlesString = '';

    for (let i = 0; i < this.circles.length; i += 1) {
      const latLng = this.circles[i].getCenter();
      const coords = this.latLngToPixel(latLng);
      if (coords.x >= 0 && coords.x <= map.width && coords.y >= 0 && coords.y <= map.height) {
        const radius = this.circles[i].radius / coords.metersPerPixel;
        const strokeColor = this.circles[i].strokeColor;
        const fillColor = this.circles[i].fillColor;
        const fillOpacity = this.circles[i].fillOpacity;

        const circle = `<circle cx="${coords.x}" cy="${coords.y}" r="${radius}" stroke="${strokeColor}" stroke-width="0" fill="${fillColor}" fill-opacity="${fillOpacity}" />`;
        circlesString += circle;
      }
    }

    return circlesString;
  }

  getPolylinesAsSVG() {
    const map = this.getStaticMap();
    let polylinesString = '';

    for (let i = 0; i < this.polylines.length; i += 1) {
      const path = this.polylines[i].getPath();
      let pointsString = '';
      let isInside = false;
      path.forEach((point) => {
        const coords = this.latLngToPixel(point);
        pointsString += `${coords.x},${coords.y} `;
        if (coords.x >= 0 && coords.x <= map.width && coords.y >= 0 && coords.y <= map.height) {
          isInside = true;
        }
      });

      if (isInside) {
        const strokeColor = this.polylines[i].strokeColor;
        const strokeOpacity = this.polylines[i].strokeOpacity;
        const strokeWeight = this.polylines[i].strokeWeight;

        const style = `fill:${strokeColor};fill-opacity:0.5;stroke:${strokeColor};stroke-width:${strokeWeight};stroke-opacity:${strokeOpacity}`;
        const polyline = `<polyline points="${pointsString}" style="${style}" />`;
        polylinesString += polyline;
      }
    }

    return polylinesString;
  }

  getCustomImagesAsSVG() {
    const map = this.getStaticMap();
    let customImagesString = '';

    for (let i = 0; i < this.customs.length; i += 1) {
      const latLng = this.customs[i].getPosition();
      const coords = this.latLngToPixel(latLng);
      if (coords.x >= 0 && coords.x <= map.width && coords.y >= 0 && coords.y <= map.height) {
        const icon = this.customs[i].getIcon();
        const customImage = `<image x="${coords.x}" y="${coords.y}" width="${icon.scaledSize.width}" height="${icon.scaledSize.height}" transform="translate(-${icon.anchor.x}, -${icon.anchor.y})" xlink:href="${icon.url}" preserveAspectRatio="none" />`;
        customImagesString += customImage;
      }
    }

    return customImagesString;
  }

  async export() {
    const map = this.getStaticMap();
    const encodedURL = await ImageHelper.urlToBase64(map.url);
    const circlesString = this.getCirclesAsSVG();
    const polylinesString = this.getPolylinesAsSVG();
    const customImagesString = this.getCustomImagesAsSVG();

    const svg = `
      <svg width="${map.width}" height="${map.height}" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" xml:space="preserve">
        <image width="${map.width}" height="${map.height}" xlink:href="${encodedURL}" />
        ${circlesString}
        ${polylinesString}
        ${customImagesString}
      </svg>
    `;

    return svg;
  }
}

export default Map;

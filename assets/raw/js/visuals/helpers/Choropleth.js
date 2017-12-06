import BoundarySelector from './BoundarySelector';

class Choropleth {
  constructor(colorBy, colorByCategory, boundaries, dataPoints, minColor, maxColor) {
    this.colorBy = colorBy;
    this.colorByCategory = colorByCategory;
    this.boundaries = boundaries;
    this.dataPoints = dataPoints;
    this.minColor = minColor;
    this.maxColor = maxColor;

    this.boundaryObjects = this.computeChoroplethColors();
    this.polygons = [];
  }

  draw(map) {
    this.boundaryObjects.forEach((boundary) => {
      const points = boundary.boundary;
      let color = boundary.color;
      let opacity = 1;
      color = (color === null) ?
        (() => { opacity = 0.1; return this.minColor; })() : color;

      const polygon = map.addPolygon(points, color, opacity);
      this.addPolygonHoverListener(map, polygon, boundary);
      this.polygons.push(polygon);
    });
  }

  addPolygonHoverListener(map, polygon, info) {
    let average = info.average;
    const boundary = info.boundary;

    let contentString = `${this.colorBy}: ${average}`;
    if (this.colorByCategory !== null) {
      average *= 100;
      average = (`${average}`).slice(0, 4);
      contentString = `Percentage with ${this.colorBy} as ${this.colorByCategory}: ${average}%`;
    }
    const position = BoundarySelector.getCentroid(boundary);
    position.lat += 0.001;

    const infowindow = new google.maps.InfoWindow({
      map: map.map,
      position,
      content: contentString,
    });
    infowindow.close();
    google.maps.event.addListener(polygon, 'mouseover', () => {
      infowindow.open(map.map);
    });
    google.maps.event.addListener(polygon, 'mouseout', () => {
      infowindow.close();
    });
  }

  computeChoroplethColors() {
    let boundaryInfoObjects = [];
    this.boundaries.forEach((boundary) => {
      const info = this.getBoundaryInfo(boundary);
      boundaryInfoObjects = boundaryInfoObjects.concat(info);
    });

    const minMax = this.constructor.getBoundaryAveragesMinMax(boundaryInfoObjects);

    boundaryInfoObjects = this.computeBoundaryColors(
      minMax, boundaryInfoObjects);

    return boundaryInfoObjects;
  }

  // Returns an array with an object with the average of a given category
  // And the given boundary as attributes.
  getBoundaryInfo(boundary) {
    if (boundary === null) {
      return [];
    }

    const info = { boundary };
    const selector = new BoundarySelector(null);
    const pointsWithinBoundary = selector.getPointsInBoundary(this.dataPoints, boundary);
    info.points = pointsWithinBoundary;

    let result = {};
    if (this.colorByCategory === null) {
      result = this.constructor.getAverageOfField(pointsWithinBoundary,
        this.colorBy);
    } else {
      result = this.constructor.getCategoryPercentage(pointsWithinBoundary,
        this.colorBy, this.colorByCategory);
    }

    info.average = result.average;
    info.values = result.values;
    return [info];
  }

  static getCategoryPercentage(points, field, category) {
    let numInCategory = 0;
    let total = 0;
    const values = [];
    points.forEach((point) => {
      const value = point[field];
      if (value === category) {
        numInCategory += 1;
      }
      if (value !== undefined && value !== null) {
        total += 1;
        values.push(value);
      }
    });

    if (total === 0) {
      return { average: null, values };
    }

    const percent = numInCategory / total;
    return { average: percent, values };
  }

  static getAverageOfField(points, field) {
    let sum = 0;
    let num = 0;
    const values = [];
    points.forEach((point) => {
      const value = parseFloat(point[field]);
      if (value !== null && !isNaN(value)) {
        sum += value;
        num += 1;
      }
      values.push(value);
    });

    const average = (num === 0) ? null : sum / num;
    return { average, values };
  }

  static getBoundaryAveragesMinMax(infoObjects) {
    if (infoObjects.length === 0) {
      return { min: null, max: null }; // Edge case
    }

    let min = infoObjects[0].average;
    let max = min;
    for (let i = 0; i < infoObjects.length; i += 1) {
      const value = infoObjects[i].average;
      if (value !== null) {
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      }
    }

    return { min, max };
  }

  computeBoundaryColors(minMax, boundaryObjects) {
    const getColor = d3.scaleLinear()
      .domain([minMax.min, minMax.max])
      .range([this.minColor, this.maxColor]);

    const newBoundaryObjects = [];
    for (let i = 0; i < boundaryObjects.length; i += 1) {
      const boundaryObject = boundaryObjects[i];
      const value = boundaryObject.average;
      if (value !== null) {
        boundaryObject.color = getColor(boundaryObject.average);
      } else {
        boundaryObject.color = null;
      }
      newBoundaryObjects.push(boundaryObject);
    }
    return newBoundaryObjects;
  }
}
export default Choropleth;

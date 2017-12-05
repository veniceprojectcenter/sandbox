import BoundarySelector from './BoundarySelector';

class Chloropleth {
  constructor(colorBy, boundaries, dataPoints, minColor, maxColor) {
    this.colorBy = colorBy;
    this.boundaries = boundaries;
    this.dataPoints = dataPoints;
    this.minColor = minColor;
    this.maxColor = maxColor;

    this.boundaryObjects = this.computeChloroplethColors();
    console.log(this.boundaryObjects);
  }

  computeChloroplethColors() {
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

    const average = this.constructor.getAverageOfField(pointsWithinBoundary,
        this.colorBy);
    info.average = average;
    return [info];
  }

  static getAverageOfField(points, field) {
    let sum = 0;
    let num = 0;
    points.forEach((point) => {
      const value = parseFloat(point[field]);
      if (value !== null && !isNaN(value)) {
        sum += value;
        num += 1;
      }
    });

    const average = (num === 0) ? null : sum / num;
    return average;
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

    console.log(`${this.minColor} | ${this.maxColor}`);

    const newBoundaryObjects = [];
    for (let i = 0; i < boundaryObjects.length; i += 1) {
      const boundaryObject = boundaryObjects[i];
      const value = boundaryObject.average;
      if (value !== null) {
        boundaryObject.color = getColor(boundaryObject.average);
        console.log(boundaryObject.color);
      } else {
        boundaryObject.color = null;
      }
      newBoundaryObjects.push(boundaryObject);
    }
    return newBoundaryObjects;
  }
}
export default Chloropleth;

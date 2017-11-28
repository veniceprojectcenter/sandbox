import Visual from './helpers/Visual';
import Map from './helpers/Map';
import EditorGenerator from './helpers/EditorGenerator';
import BoundarySelector from './helpers/BoundarySelector';

/* This file is to be used as a default starting point for new map visualizations
 * that feature adding divs
*/

class ChloroplethMap extends Visual {
  constructor(config) {
    super(config);

    this.map = new Map();
    this.boundarySelector = new BoundarySelector(this.map);
  }

  onLoadData() {
    this.applyDefaultAttributes({
      title: '',
    });
  }

  render() {
    Visual.empty(this.renderID);

    this.map.render(this.renderID);
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Editor');
    editor.createButton('selectArea', 'Select Area', () => {
      const selector = new BoundarySelector(this.map);
      selector.selectPoints((points) => {
        console.log(points);
        points.push(points[0]);
        this.map.addPolyline(points, 'red', 2);
      });
    });
  }
}

export default ChloroplethMap;

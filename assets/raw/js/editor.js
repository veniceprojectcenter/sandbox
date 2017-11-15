import updateBreadcrumbs from './utils';
import Visual from './visuals/helpers/Visual';
import Map from './visuals/Map';
import Donut from './visuals/Donut';
import Bar from './visuals/Bar';
import Counter from './visuals/Counter';
import DefaultMap from './visuals/helpers/DefaultMap';
import PieChartMap from './visuals/PieChartMap';
import BubbleTimeline from './visuals/BubbleTimeline';
import Pathfinding from './visuals/Pathfinding';
import Bridgesnodata from './visuals/Bridgesnodata';
import BubbleChart from './visuals/BubbleChart';
import FilterMap from './visuals/FilterMap';

function renderEditor(route) {
  updateBreadcrumbs(route);

  const rowContainer = document.createElement('div');
  rowContainer.className = 'row';

  const visualContainer = document.createElement('div');
  visualContainer.className = 'visual col-md-6';
  visualContainer.id = Visual.DEFAULT_RENDER_ID;

  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls col-md-6';
  controlsContainer.id = Visual.DEFAULT_RENDER_CONTROLS_ID;

  const downloadContainer = document.createElement('div');
  downloadContainer.className = 'download';
  downloadContainer.id = 'download';

  const page = document.getElementById('page');
  page.classList.remove('container');
  page.classList.add('container-fluid');

  rowContainer.appendChild(visualContainer);
  rowContainer.appendChild(controlsContainer);
  page.appendChild(rowContainer);
  page.appendChild(downloadContainer);

  if (route.length === 2) {
    let visual = null;
    const config = {
      dataSet: route[0],
      type: route[1],
      attributes: {},
    };

    switch (route[1]) {
      case 'Map':
        visual = new Map(config);
        break;
      case 'Donut-Chart':
        visual = new Donut(config);
        break;
      case 'Bar-Chart':
        visual = new Bar(config);
        break;
      case 'Counter':
        visual = new Counter(config);
        break;
      case 'Pie-Chart-Map':
        visual = new PieChartMap(config);
        break;
      case 'Bubble-Timeline':
        visual = new BubbleTimeline(config);
        break;
      case 'Default-Map':
        visual = new DefaultMap(config);
        break;
      case 'Path-Finding':
        visual = new Pathfinding(config);
        break;
      case 'Bridges-Without-Data':
        visual = new Bridgesnodata(config);
        break;
      case 'Bubble-Chart':
        visual = new BubbleChart(config);
        break;
      case 'Filter-Map':
        visual = new FilterMap(config);
        break;
      default:
        visualContainer.innerHTML = `<p>Error: could not find visualization: ${route[1]}.`;
    }

    if (visual !== null) {
      visual.fetchAndRenderWithControls();
    }
  } else {
    visualContainer.innerHTML = '<p>An error occured.';
  }
}

export default renderEditor;

import updateBreadcrumbs from './utils';
import Visual from './Visual';
import Map from './visuals/Map';
import Donut from './visuals/Donut';
import Bar from './visuals/Bar';
import Counter from './visuals/Counter';
import PieChartMap from './visuals/PieChartMap';

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
      case 'map':
        visual = new Map(config);
        break;
      case 'donut':
        visual = new Donut(config);
        break;
      case 'bar':
        visual = new Bar(config);
        break;
      case 'counter':
        visual = new Counter(config);
        break;
      case 'piechartmap':
        visual = new PieChartMap(config);
        break;
      default:
        visualContainer.innerHTML = `<p>Error: could not find visualization: ${route[1]}.`;
    }

    if (visual !== null) {
      visual.render();
      visual.renderControls();
      visual.generateConfigButton();
    }
  } else {
    visualContainer.innerHTML = '<p>An error occured.';
  }
}

export default renderEditor;

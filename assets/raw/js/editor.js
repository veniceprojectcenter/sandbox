import updateBreadcrumbs from './utils';
import Visual from './Visual';
import Map from './visuals/Map';
import Donut from './visuals/Donut';

function renderEditor(route) {
  updateBreadcrumbs(route);

  const visualContainer = document.createElement('div');
  visualContainer.className = 'visual';
  visualContainer.id = Visual.DEFAULT_RENDER_ID;

  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls';

  const downloadContainer = document.createElement('div');
  downloadContainer.className = 'download';

  const page = document.getElementById('page');
  page.appendChild(visualContainer);
  page.appendChild(controlsContainer);
  page.appendChild(downloadContainer);

  if (route.length === 2) {
    let visual = null;
    const config = {
      dataSet: route[0],
      attributes: {},
    };

    switch (route[1]) {
      case 'map':
        visual = new Map(config);
        break;
      case 'donut':
        visual = new Donut(config);
        break;
      default:
        visualContainer.innerHTML = '<p>An error occured.';
    }

    if (visual !== null) {
      visual.render(Visual.DEFAULT_RENDER_ID);
    }
  } else {
    visualContainer.innerHTML = '<p>An error occured.';
  }
}

export default renderEditor;

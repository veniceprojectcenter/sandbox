import Visual from './visuals/helpers/Visual';
import Firebase from './Firebase';
import Data from './visuals/helpers/Data';
import CategoryMap from './visuals/CategoryMap';
import Donut from './visuals/Donut';
import Bar from './visuals/Bar';
import Counter from './visuals/Counter';
import PieChartMap from './visuals/PieChartMap';
import BubbleChart from './visuals/BubbleChart';
import BubbleMapChart from './visuals/BubbleMapChart';
import BubbleTimeline from './visuals/BubbleTimeline';
import RouteMap from './visuals/RouteMap';
import FilterMap from './visuals/FilterMap';

function renderVisualFromConfig(defaultConfig, containerID) {
  let config = defaultConfig;
  if (typeof config === 'string') {
    config = JSON.parse(config);
  }
  let visual = null;
  switch (config.type) {
    case 'Category-Map':
      visual = new CategoryMap(config, containerID);
      break;
    case 'Donut-Chart':
      visual = new Donut(config, containerID);
      break;
    case 'Bar-Chart':
      visual = new Bar(config, containerID);
      break;
    case 'Counter':
      visual = new Counter(config, containerID);
      break;
    case 'Pie-Chart-Map':
      visual = new PieChartMap(config, containerID);
      break;
    case 'Bubble-Timeline':
      visual = new BubbleTimeline(config, containerID);
      break;
    case 'Bubble-Chart':
      visual = new BubbleChart(config, containerID);
      break;
    case 'Bubble-Map-Chart':
      visual = new BubbleMapChart(config, containerID);
      break;
    case 'Filter-Map':
      visual = new FilterMap(config, containerID);
      break;
    case 'Route-Map':
      visual = new RouteMap(config, containerID);
      break;
    default:
      document.getElementById(containerID).innerHTML = `<p>Error: could not find visualization: ${config.type}.`;
  }

  if (visual !== null) {
    visual.fetchAndRender();
  }
}

async function getDataSetList() {
  let list = [];
  await Data.fetchDataSets((dataSets) => {
    list = dataSets;
  });

  return list;
}

window.visualize = {};
window.visualize.renderVisualFromConfig = renderVisualFromConfig;
window.visualize.Visual = Visual;
window.visualize.Firebase = Firebase;
window.visualize.getDataSetList = getDataSetList;

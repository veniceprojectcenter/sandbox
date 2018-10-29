import Visual from './visuals/helpers/Visual';
import Firebase from './Firebase';
import Data from './visuals/helpers/Data';
import CategoryMap from './visuals/CategoryMap';
import Donut from './visuals/Donut';
import Bar from './visuals/Bar';
import ScaledUpNumber from './visuals/ScaledUpNumber';
import DonutChartMap from './visuals/DonutChartMap';
import BubbleChart from './visuals/BubbleChart';
import BubbleMapChart from './visuals/BubbleMapChart';
import RouteMap from './visuals/RouteMap';
import FilterMap from './visuals/FilterMap';
import DataView from './visuals/DataView';

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
    case 'Scaled-Up-Number':
      visual = new ScaledUpNumber(config, containerID);
      break;
    case 'Data-View':
      visual = new DataView(config, containerID);
      break;
    case 'Donut-Chart-Map':
      visual = new DonutChartMap(config, containerID);
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
window.visualize.Data = Data;

import Visual from './visuals/Visual';
import Firebase from './Firebase';
import Data from './dataRetrieval/Data';
import Donut from './visuals/Donut';
import BubbleChart from './visuals/BubbleChart';
import BubbleMapChart from './visuals/BubbleMapChart';

function renderVisualFromConfig(defaultConfig, containerID) {
  let config = defaultConfig;
  if (typeof config === 'string') {
    config = JSON.parse(config);
  }
  let visual = null;
  switch (config.type) {
    case 'Donut-Chart':
      visual = new Donut(config, containerID);
      break;
    case 'Bubble-Chart':
      visual = new BubbleChart(config, containerID);
      break;
    case 'Bubble-Map-Chart':
      visual = new BubbleMapChart(config, containerID);
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

import Visual from './visuals/helpers/Visual';
import Firebase from './Firebase';
import Map from './visuals/Map';
import Donut from './visuals/Donut';
import Bar from './visuals/Bar';
import Counter from './visuals/Counter';
import PieChartMap from './visuals/PieChartMap';
import BubbleChart from './visuals/BubbleChart';
import BubbleTimeline from './visuals/BubbleTimeline';
import PathFinding from './visuals/PathFinding';

function renderVisualFromConfig(defaultConfig, containerID) {
  let config = defaultConfig;
  if (typeof config === 'string') {
    config = JSON.parse(config);
  }
  let visual = null;
  switch (config.type) {
    case 'Map':
      visual = new Map(config, containerID);
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
    case 'Path-Finding':
      visual = new PathFinding(config, containerID);
      break;
    default:
      document.getElementById(containerID).innerHTML = `<p>Error: could not find visualization: ${config.type}.`;
  }

  if (visual !== null) {
    visual.fetchAndRender();
  }
}

window.visualize = {};
window.visualize.renderVisualFromConfig = renderVisualFromConfig;
window.visualize.Visual = Visual;
window.visualize.Firebase = Firebase;


class Main {
  constructor() {

  }

  static renderVisualFromConfig(config, containerID) {
    if (typeof config === 'string') {
      config = JSON.parse(config);
    }
    let visual = null;
    switch (config.type) {
      case 'map':
        visual = new window.visualize.Map(config, containerID);
        break;
      case 'donut':
        visual = new window.visualize.Donut(config, containerID);
        break;
      case 'bar':
        visual = new window.visualize.Bar(config, containerID);
        break;
      case 'counter':
        visual = new window.visualize.Counter(config, containerID);
        break;
      case 'piechartmap':
        visual = new window.visualize.PieChartMap(config, containerID);
        break;
      case 'bubble-timeline':
        visual = new window.visualize.BubbleTimeline(config, containerID);
        break;
      default:
        const container = document.getElementById(containerID);
        container.innerHTML = `<p>Error: could not find visualization: ${route[1]}.`;
    }

    if (visual !== null) {
      visual.fetchAndRender();
    }
  }
}

export default Main;

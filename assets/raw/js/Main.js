
class Main {
  constructor() {

  }

  static renderVisualFromConfig(config, containerID) {
    if (typeof config === 'string') {
      config = JSON.parse(config);
    }

    switch (config.type) {
      case 'map':
        visual = new Map(config, containerID);
        break;
      case 'donut':
        visual = new Donut(config, containerID);
        break;
      case 'bar':
        visual = new Bar(config, containerID);
        break;
      case 'counter':
        visual = new Counter(config, containerID);
        break;
      case 'piechartmap':
        visual = new PieChartMap(config, containerID);
        break;
      case 'bubble-timeline':
        visual = new BubbleTimeline(config, containerID);
        break;
      default:
        const container = document.getElementById(containerID);
        container.innerHTML = `<p>Error: could not find visualization: ${route[1]}.`;
    }

    if (visual !== null) {
      visual.fetchData();
      visual.render();
    }
  }
}

export default Main;

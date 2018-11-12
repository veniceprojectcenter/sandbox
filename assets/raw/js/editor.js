import Visual from './visuals/helpers/Visual';
import Donut from './visuals/Donut';
import BubbleChart from './visuals/BubbleChart';
import BubbleMapChart from './visuals/BubbleMapChart';
import EditorGenerator from './visuals/helpers/EditorGenerator';
import Data from './visuals/helpers/Data';
import Loader from './visuals/helpers/Loader';

// List of all graph types that are available for use
const graphsAvailable = ['Donut-Chart', 'Bubble-Chart', 'Bubble-Map-Chart'];

/**
 * Calls the render function of the appropriate graph
 *
 * @param dataSet Name of the data set to render
 * @param graphType Name of the graph type to use
 */
function createGraphic(dataSet, graphType) {
  if (dataSet === null || dataSet === undefined ||
    graphType === null || graphType === undefined) {
    return;
  }

  const config = {
    dataSet,
    type: graphType,
    attributes: {},
  };

  let visual = null;
  switch (graphType) {
    case 'Donut-Chart':
      visual = new Donut(config);
      break;
    case 'Bubble-Chart':
      visual = new BubbleChart(config);
      break;
    case 'Bubble-Map-Chart':
      visual = new BubbleMapChart(config);
      break;
    default:
      console.error('Error when selecting graph type');
  }

  if (visual !== null) {
    visual.fetchAndRenderWithControls();
  }
}

/**
 * Renders the editor page using the information given in the URL
 */
function renderEditor() {
  // Basic page setup prep
  const rowContainer = document.createElement('div');
  rowContainer.className = 'row';
  const columnContainer = document.createElement('div');
  columnContainer.className = 'column';

  // Used to render the Graph
  const visualContainer = document.createElement('div');
  visualContainer.className = 'visual col-md-7';
  visualContainer.id = Visual.DEFAULT_RENDER_ID;

  // Used to hold the permanent selections for graph type and data set
  const majorSelectContainer = document.createElement('div');
  majorSelectContainer.className = 'majorSelect col';
  majorSelectContainer.id = 'majorSelect';

  // Used to render the graph options
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls col';
  controlsContainer.id = Visual.DEFAULT_RENDER_CONTROLS_ID;

  // Used to render the other buttons like downloads and exports
  const downloadContainer = document.createElement('div');
  downloadContainer.className = 'download';
  downloadContainer.id = 'download';

  // Page holds everything
  const page = document.getElementById('page');
  page.classList.remove('container');
  page.classList.add('container-fluid');

  const controlsEditor = new EditorGenerator(majorSelectContainer);
  // Prep list of Data Sets and Graphs
  let dataSets = [];
  const loader = new Loader('page');
  const container = document.getElementById('page');
  if (container) {
    loader.render();
  }

  Data.fetchDataSets((sets) => {
    dataSets = sets;
    const dsCats = dataSets.map(x => ({ value: x.id, text: x.name }));
    // Prep list of Graph types
    const graphCats = graphsAvailable.map(graph => ({ value: graph, text: graph }));

    let currDataSet = dataSets[0];
    let currGraphType;

    if (container) {
      loader.remove();
    }

    // Create Page Structure
    rowContainer.appendChild(columnContainer);
    rowContainer.appendChild(visualContainer);

    columnContainer.appendChild(majorSelectContainer);
    columnContainer.appendChild(controlsContainer);

    page.appendChild(rowContainer);
    page.appendChild(downloadContainer);

    // Select Data Set
    controlsEditor.createSelectBox('dataSelector', 'Data Set', dsCats, 'Select a Data Set',
      (e) => {
        currDataSet = $(e.currentTarget).val();
        createGraphic(currDataSet, currGraphType);
      });
    // Select GraphType
    controlsEditor.createSelectBox('graphSelector', 'Select GraphType', graphCats, null,
      (e) => {
        currGraphType = $(e.currentTarget).val();
        createGraphic(currDataSet, currGraphType);
      });
  });
}

export default renderEditor;

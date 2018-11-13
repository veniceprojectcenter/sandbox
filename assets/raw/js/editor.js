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
  if (dataSet === null || dataSet === undefined) {
    return;
  } else if (graphType === null || graphType === undefined) {
    Data.fetchData(dataSet, null);
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

  // Intro blurb which will be overwritten when the graphs are rendered
  visualContainer.innerHTML = '<p class="intro"> Welcome to the Venice Project Center Sandbox ' +
    'Application! This site is designed so anyone can make useful visualizations from the vast ' +
    'expanse of data that the VPC has collected since its founding in 1988. Select a data set ' +
    'and graph type to begin! ' +
    '<p class="intro">Created by the Knowing Venice and Open teams in 2017, and further ' +
    'improved by the 30th Anniversary Team in 2018.';

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

  // Create Page Structure
  rowContainer.appendChild(columnContainer);
  rowContainer.appendChild(visualContainer);

  columnContainer.appendChild(majorSelectContainer);
  columnContainer.appendChild(controlsContainer);

  // Setup page to render later
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

    page.appendChild(rowContainer);
    page.appendChild(downloadContainer);

    // Select Data Set
    controlsEditor.createSelectBox('dataSelector', 'Data Set', dsCats, null,
      (e) => {
        currDataSet = $(e.currentTarget).val();
        createGraphic(currDataSet, currGraphType);
      },
      null, 'Select a Data Set');
    // Select GraphType
    controlsEditor.createSelectBox('graphSelector', 'Graph Type', graphCats, null,
      (e) => {
        currGraphType = $(e.currentTarget).val();
        createGraphic(currDataSet, currGraphType);
      },
      null, 'Select a Graph Type');
  });
}

export default renderEditor;

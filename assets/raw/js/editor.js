import Visual from './visuals/helpers/Visual';
import Donut from './visuals/Donut';
import BubbleChart from './visuals/BubbleChart';
import BubbleMapChart from './visuals/BubbleMapChart';
import EditorGenerator from './visuals/helpers/EditorGenerator';
import Data from './visuals/helpers/Data';


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

  console.log(`rendering ${dataSet} data using a ${graphType}`);

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
 *
 * @param {String[]} route Array of URL extensions
 */
function renderEditor() {
  const rowContainer = document.createElement('div');
  rowContainer.className = 'row';

  const visualContainer = document.createElement('div');
  visualContainer.className = 'visual col-md-7';
  visualContainer.id = Visual.DEFAULT_RENDER_ID;

  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls col-md-5';
  controlsContainer.id = Visual.DEFAULT_RENDER_CONTROLS_ID;

  const downloadContainer = document.createElement('div');
  downloadContainer.className = 'download';
  downloadContainer.id = 'download';

  const page = document.getElementById('page');
  page.classList.remove('container');
  page.classList.add('container-fluid');

  rowContainer.appendChild(controlsContainer);
  rowContainer.appendChild(visualContainer);
  page.appendChild(rowContainer);
  page.appendChild(downloadContainer);

  const controlsEditor = new EditorGenerator(controlsContainer);
  // Prep list of Data Sets
  let dataSets = [];
  Data.fetchDataSets((sets) => {
    dataSets = sets;
  });
  const dsCats = dataSets.map((x) => {
    return { value: x.id, text: x.name };
  });
  // Prep list of Graph types
  const graphCats = graphsAvailable.map((graph) => {
    return { value: graph, text: graph };
  });

  let currDataSet = dataSets[0];
  let currGraphType;

  // Select Dataset
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
}

export default renderEditor;

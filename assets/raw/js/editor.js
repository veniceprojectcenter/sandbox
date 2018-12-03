import Visual from './visuals/helpers/Visual';
import Donut from './visuals/Donut';
import BubbleChart from './visuals/BubbleChart';
import BubbleMapChart from './visuals/BubbleMapChart';
import BarChart from './visuals/Bar';
import EditorGenerator from './visuals/helpers/EditorGenerator';
import Data from './visuals/helpers/Data';
import Loader from './visuals/helpers/Loader';
import LoginModal from './visuals/helpers/LoginModal';

// List of all graph types that are available for use
const graphsAvailable = ['Donut-Chart', 'Bubble-Chart', 'Bubble-Map-Chart', 'Bar-Chart'];

let activeVisual;

/**
 * Publishes the state of the current graph to Firebase for later use
 *
 * @returns {Promise<void>}
 */
async function publishConfig() {
  const publishButton = document.getElementById('publish-button');
  publishButton.classList.add('disabled');
  const config = {
    type: activeVisual.type,
    dataSet: activeVisual.dataSet,
    attributes: activeVisual.attributes,
  };

  const db = firebase.database();
  await db.ref(`/viz/configs/${config.dataSet}`).push({
    type: config.type,
    dataSet: config.dataSet,
    attributes: JSON.stringify(config.attributes),
  }).then(async (snapshot) => {
    await db.ref('/viz/info').push({
      type: config.type,
      id: snapshot.key,
      dataSet: config.dataSet,
    })
    .then(() => {
      Materialize.toast('Visual Published', 3000);
      publishButton.classList.remove('disabled');
    })
    .catch((error) => {
      Materialize.toast('Error Publishing Visual', 3000);
      publishButton.classList.remove('disabled');
      console.error(error);
    });
  })
  .catch((error) => {
    Materialize.toast('Error Publishing Visual', 3000);
    publishButton.classList.remove('disabled');
    console.error(error);
  });
}

/**
 * Creates the publish button, which publishes the active graph
 *
 * @param {LoginModal} loginModal Used for authentication and publishing
 *
 * @returns {HTMLButtonElement}
 */
function createPublishButton(loginModal) {
  const publishButton = document.createElement('button');
  publishButton.innerText = 'Publish Visual';
  publishButton.id = 'publish-button';
  publishButton.addEventListener('click', async () => {
    if (activeVisual.attributes.title) {
      loginModal.authenticate('Login and Publish').then(() => {
        publishConfig();
      });
    } else {
      Materialize.toast('A title is required to publish a visual', 3000);
    }
  });

  return publishButton;
}

/**
 * Creates the saveSVG button, which downloads an SVG of the current graph
 *
 * @returns {HTMLButtonElement}
 */
function createSVGButton() {
  const saveSVGButton = document.createElement('button');
  saveSVGButton.innerText = 'Export for Illustrator';
  saveSVGButton.addEventListener('click', async () => {
    let svgData = '';
    const svg = $(`#${activeVisual.renderID} svg`);
    const map = document.querySelector(`#${activeVisual.renderID} .map`) || document.querySelector(`#${activeVisual.renderID}.map`);
    if (svg.length === 1) {
      activeVisual.editmode = false;
      activeVisual.render();
      svg.attr('version', '1.1')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xml:space', 'preserve');

      svgData = svg[0].outerHTML;
    } else if (map) {
      if (activeVisual.map) {
        svgData = await activeVisual.map.export();
      } else {
        Materialize.toast('Error exporting map', 3000);
      }
    } else {
      Materialize.toast('This chart type is not supported for Illustrator!', 3000);
    }

    if (svgData) {
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      if (activeVisual.attributes.title && activeVisual.attributes.title !== '') {
        downloadLink.download = `${activeVisual.attributes.title}.svg`;
      } else {
        downloadLink.download = `${activeVisual.dataSet}-${activeVisual.type}.svg`;
      }
      downloadLink.click();
    }
    if (svg.length === 1 && !activeVisual.editmode) {
      activeVisual.editmode = true;
      activeVisual.render();
    }
  });

  return saveSVGButton;
}

/**
 * Creates the download button, which downloads a json of the active dataSet when pressed
 *
 * @returns {HTMLButtonElement}
 */
function createDownloadConfig() {
  const downloadButton = document.createElement('button');
  downloadButton.innerText = 'Create Save File';
  downloadButton.addEventListener('click', () => {
    const config = {
      type: activeVisual.type,
      dataSet: activeVisual.dataSet,
      attributes: activeVisual.attributes,
    };

    // This looks really dumb but you need to on the fly determine href which requires a new obj
    const tempButton = document.createElement('a');
    tempButton.className = 'button';
    tempButton.innerText = 'Download Config';
    tempButton.href = `data:text/json;charset=utf-8,${JSON.stringify(config)}`;
    tempButton.download = `${activeVisual.dataSet}-${activeVisual.type}-config.json`;
    tempButton.click();
  });

  return downloadButton;
}

/**
 * Renders the publish and export buttons in the container specified
 *
 * @param {String} id ID of container to use
 */
function generateDownloadButtons(id = 'download') {
  const loginModal = new LoginModal();
  // const publishButton = createPublishButton(loginModal);
  const downloadButton = createDownloadConfig();
  const saveSVGButton = createSVGButton();

  const uploadButton = document.createElement('input');
  uploadButton.type = 'file';
  uploadButton.id = 'file';
  uploadButton.onchange = () => {
    const file = document.getElementById('file').files[0];
    if (!file) {
      return;
    }
    const fr = new FileReader();
    fr.onload = (e) => {
      const result = JSON.parse(e.target.result);

      renderEditor(result.dataSet, result.type);
      createGraphic(result.dataSet, result.type, result.attributes);
    };
    fr.readAsText(file);
  };
  const uploadLabel = document.createElement('label');
  uploadLabel.className = 'fileInputLabel';
  uploadLabel.textContent = 'Upload Saved Graph';
  uploadLabel.setAttribute('for', 'file');

  const downloadContainer = document.getElementById(id);
  downloadContainer.innerHTML = '';
  // downloadContainer.appendChild(publishButton);
  downloadContainer.appendChild(downloadButton);
  downloadContainer.appendChild(saveSVGButton);
  downloadContainer.appendChild(uploadButton);
  downloadContainer.appendChild(uploadLabel);
  downloadContainer.appendChild(loginModal.generate());
  loginModal.bind();
}

/**
 * Calls the render function of the appropriate graph
 *
 * @param {String} dataSet Name of the data set to render
 * @param {String} graphType Name of the graph type to use
 * @param {Object} attr = null Attributes to use for graph construction
 */
function createGraphic(dataSet, graphType, attr = null) {
  if (dataSet === null || dataSet === undefined) {
    return;
  } else if (graphType === null || graphType === undefined) {
    Data.fetchData(dataSet, null);
    return;
  }
  document.getElementById('column2').style.height = '91%';
  document.getElementById('column1').style.height = '93%';
  let attributes = attr;
  if (attributes === null) {
    if (activeVisual && activeVisual.attributes) {
      attributes = activeVisual.attributes;
    } else {
      attributes = {};
    }
  }

  const config = {
    dataSet,
    type: graphType,
    attributes,
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
    case 'Bar-Chart':
      visual = new BarChart(config);
      break;
    default:
      console.error('Error when selecting graph type');
  }

  if (visual !== null) {
    activeVisual = visual;
    activeVisual.fetchAndRenderWithControls();
    generateDownloadButtons();
    window.addEventListener('resize', () => {
      activeVisual.render();
    });
  }
}

/**
 * Renders the editor page using the information given in the URL
 *
 * @param {String} defaultDS Name of the default dataSet to use
 * @param {String} defaultGT Name of the default graphType to use
 */
function renderEditor(defaultDS = null, defaultGT = null) {
  // Basic page setup prep
  const rowContainer = document.createElement('div');
  rowContainer.className = 'row';
  rowContainer.id = 'row';

  const column1Container = document.createElement('div');
  column1Container.className = 'column1';
  column1Container.id = 'column1';

  const column2Container = document.createElement('div');
  column2Container.className = 'column2';
  column2Container.id = 'column2';

  const visualColumn = document.createElement('div');
  visualColumn.className = 'visualColumn';
  visualColumn.id = 'visualColumn';

  // Used to render the Graph
  const visualContainer = document.createElement('div');
  visualContainer.className = 'visual';
  visualContainer.id = Visual.DEFAULT_RENDER_ID;

  // Intro blurb which will be overwritten when the graphs are rendered
  visualContainer.innerHTML = '<p class="intro"> Welcome to the Venice Project Center Sandbox ' +
    'Application! This site is designed so anyone can make useful visualizations from the vast ' +
    'expanse of data that the VPC has collected since its founding in 1988. Select a data set ' +
    'and graph type to begin!';

  // Used to hold the permanent selections for graph type and data set
  const majorSelectContainer = document.createElement('div');
  majorSelectContainer.className = 'majorSelect';
  majorSelectContainer.id = 'majorSelect';

  const graphSettingsTitle = document.createElement('div');
  graphSettingsTitle.className = 'graphTitle';
  graphSettingsTitle.id = 'graphTitle';
  graphSettingsTitle.innerHTML = '<h3 style = \'margin-top: 0;\'>Graph Settings</h3>';

  // Used to render the graph options
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls';
  controlsContainer.id = Visual.DEFAULT_RENDER_CONTROLS_ID;

  // Used to render the other buttons like downloads and exports
  const downloadContainer = document.createElement('div');
  downloadContainer.className = 'download';
  downloadContainer.id = 'download';

  const keyContainer = document.createElement('div');
  keyContainer.className = 'key';
  keyContainer.id = 'key';

  // Create Page Structure
  rowContainer.appendChild(column1Container);
  rowContainer.appendChild(column2Container);

  column1Container.appendChild(majorSelectContainer);
  column1Container.appendChild(graphSettingsTitle);
  column1Container.appendChild(controlsContainer);
  visualColumn.appendChild(visualContainer);
  visualColumn.appendChild(keyContainer);
  column2Container.appendChild(visualColumn);

  // Setup page to render later
  const page = document.getElementById('page');
  page.classList.remove('container');
  page.classList.add('container-fluid');
  page.innerHTML = ''; // Clear the page


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
    let defaultDSName = defaultDS;
    if (defaultDSName !== null) {
      dsCats.forEach((element) => {
        if (element.id === defaultDS) {
          defaultDSName = element.name;
        }
      });
    }
    // Prep list of Graph types
    const graphCats = graphsAvailable.map(graph => ({ value: graph, text: graph }));

    let currDataSet = defaultDS;
    let currGraphType = defaultGT;

    if (container) {
      loader.remove();
    }

    page.appendChild(rowContainer);
    page.appendChild(downloadContainer);

    // Select Data Set
    controlsEditor.createSelectBox('dataSelector', 'Data Set', dsCats, defaultDSName,
      (e) => {
        currDataSet = $(e.currentTarget).val();
        if (activeVisual) {
          activeVisual.dataSet = currGraphType;
        }
        createGraphic(currDataSet, currGraphType);
      },
      null, 'Select a Data Set');
    // Select GraphType
    controlsEditor.createSelectBox('graphSelector', 'Graph Type', graphCats, defaultGT,
      (e) => {
        currGraphType = $(e.currentTarget).val();
        if (activeVisual) {
          activeVisual.type = currGraphType;
        }
        createGraphic(currDataSet, currGraphType);
      },
      null, 'Select a Graph Type');
  });
}

export default renderEditor;

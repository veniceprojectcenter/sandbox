import Visual from './visuals/helpers/Visual';
import Donut from './visuals/Donut';
import BubbleChart from './visuals/BubbleChart';
import BubbleMapChart from './visuals/BubbleMapChart';
import EditorGenerator from './visuals/helpers/EditorGenerator';
import Data from './visuals/helpers/Data';
import Loader from './visuals/helpers/Loader';
import LoginModal from './visuals/helpers/LoginModal';

// List of all graph types that are available for use
const graphsAvailable = ['Donut-Chart', 'Bubble-Chart', 'Bubble-Map-Chart'];

let activeVisual;

/**
 * Publishes the state of the current graph to Firebase for later use
 *
 * @returns {Promise<void>}
 */
async function publishConfig() { // TODO REMOVE ALL THIS OBJS
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
  publishButton.className = 'btn waves-effectr';
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
  saveSVGButton.className = 'btn waves-effect';
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
  downloadButton.className = 'btn waves-effect';
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

      // TODO: reset the majorSelectors to show new values (currently very not working)
      const ds = document.getElementById('dataSelector');
      const list = ds.getElementsByTagName('select')[0].getElementsByTagName('option');
      let index = -1;
      for (let i = 0; i < list.length; i += 1) {
        const element = list[i];
        if (element.value === result.dataSet) {
          index = i;
          break;
        }
      }

      console.log(index);
      if (index > 0) {
        const list2 = ds.getElementsByTagName('ul')[0].getElementsByTagName('li');
        console.log(list2);
        for (let i = 0; i < list2.length; i += 1) {
          if (index === i) {
            list2[i].setAttribute('class', 'active selected');
          } else if (list2[i].getAttribute('class') === 'active selected') {
            list2[i].setAttribute('class', '');
          }
        }
      }
      // ds.getElementsByTagName('input')[0].value = this.attributes.title;
      // title.getElementsByTagName('label')[0].setAttribute('class', 'active');

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
 * @param dataSet Name of the data set to render
 * @param graphType Name of the graph type to use
 * @param attributes Attributes to use for graph construction
 */
function createGraphic(dataSet, graphType, attributes = {}) {
  if (dataSet === null || dataSet === undefined) {
    return;
  } else if (graphType === null || graphType === undefined) {
    Data.fetchData(dataSet, null);
    return;
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
 */
function renderEditor() {
  // Basic page setup prep
  const rowContainer = document.createElement('div');
  rowContainer.className = 'row';
  const columnContainer = document.createElement('div');
  columnContainer.className = 'column';

  // Used to render the Graph
  const visualContainer = document.createElement('div');
  visualContainer.className = 'visual col-md-9';
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

  const keyContainer = document.createElement('div');
  keyContainer.className = 'key col-md-9';
  keyContainer.id = 'key';

  // Create Page Structure
  rowContainer.appendChild(columnContainer);
  rowContainer.appendChild(visualContainer);
  rowContainer.appendChild(keyContainer);

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

    let currDataSet;
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

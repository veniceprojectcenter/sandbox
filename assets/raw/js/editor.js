import html2canvas from 'html2canvas';

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
const graphsAvailable = ['Donut Chart', 'Bubble Chart', 'Bar Chart'];

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
function createPNGButton() {
  const savePNGButton = document.createElement('button');
  savePNGButton.innerText = 'Save as PNG';

  savePNGButton.addEventListener('click', async () => {
    const graph = document.getElementById('column2');
    const svg = $('#column2')[0];

    // Force dimensions (and font) onto svg elements
    const svgElem = svg.getElementsByTagName('svg');
    for (const node of svgElem) {
      node.style['font-family'] = 'Arial';
      if (!node.hasAttribute('height') || !node.hasAttribute('width')) {
        const height = window.getComputedStyle(node, null).height;
        const width = window.getComputedStyle(node, null).width;
        node.setAttribute('width', width);
        node.setAttribute('height', height);
        node.replaceWith(node);
      }
    }

    // Make key visible
    /*
    const key = document.getElementById('key');

    let overflowX, overflowY;
    if (key) {
      overflowX = key.style['overflow-x'];
      key.style['overflow-x'] = 'visible';
      overflowY = key.style['overflow-y'];
      key.style['overflow-y'] = 'visible';
    }
    */

    // Force uniform font onto the graphics
    const children = svg.childNodes;
    for (let i = 0; i < children.length; i += 1) {
      children[i].style['font-family'] = 'Arial';
    }

    await html2canvas(graph, {
      backgroundColor: null,
      logging: false,
      allowTaint: true,
    }).then((canvas) => {
      const img = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.href = img;
      if (activeVisual.attributes.title && activeVisual.attributes.title !== '') {
        downloadLink.download = `${activeVisual.attributes.title}.png`;
      } else {
        downloadLink.download = `${activeVisual.dataSet}-${activeVisual.type}.png`;
      }
      downloadLink.click();
    });

    // Removed forced fonts
    for (let i = 0; i < children.length; i += 1) {
      children[i].style['font-family'] = null;
    }

    for (const node of svgElem) {
      node.style['font-family'] = null;
    }
  });
  return savePNGButton;
}

/**
 * Creates the download button, which downloads a json of the active dataSet when pressed
 *
 * @returns {HTMLButtonElement}
 */
function createDownloadConfig() {
  const downloadButton = document.createElement('button');
  downloadButton.innerText = 'Save Config File';
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
    tempButton.download = `${activeVisual.dataSet}-${activeVisual.type}-config.sndbx`;
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
  const saveSVGButton = createPNGButton();

  const uploadButton = document.createElement('input');
  uploadButton.type = 'file';
  uploadButton.id = 'file';
  uploadButton.accept = '.sndbx';
  uploadButton.onchange = () => {
    const file = document.getElementById('file').files[0];
    if (!file) {
      return;
    }
    const name = file.name;
    const index = name.lastIndexOf('.');
    if (!index || name.substring(index + 1, name.length) !== 'sndbx') {
      Materialize.toast('Invalid File Type', 3000);
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
  document.getElementById('column1').style.height = '91%';
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
    case 'Donut Chart':
      visual = new Donut(config);
      break;
    case 'Bubble Chart':
      visual = new BubbleChart(config);
      break;
    case 'Bubble-Map-Chart':
      visual = new BubbleMapChart(config);
      break;
    case 'Bar Chart':
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
      activeVisual.renderKey();
      activeVisual.render();
      activeVisual.renderBasics();
    });
  }
  document.getElementById('controls').style.height = `calc(100% - 
    ${document.getElementById('majorSelect').clientHeight + document.getElementById('graphTitle').clientHeight
  + document.getElementById('graphTitle').style.marginTop})`;
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

  const blurbContainer = document.createElement('div');
  blurbContainer.className = 'blurb';
  blurbContainer.id = 'blurb';

  // Intro blurb which will be overwritten when the graphs are rendered
  const introTitle = document.createElement('h2');
  introTitle.className = 'introTitle';
  introTitle.id = 'introTitle';
  introTitle.innerText = 'Welcome to the Venice Project Center Sandbox Application!';

  const intro = document.createElement('div');
  intro.className = 'intro';
  intro.id = 'intro';
  intro.innerHTML = '<p>This site is designed so anyone can make visualizations from the vast ' +
  'expanse of data that the Venice Project Center has collected since its founding in 1988. In the 30+ years since then, ' +
  'the project center has collected over a 1,000,000 individual data points on a wide variety of topics all across Venice. </p>' +
  '<p>This data is available for anyone to use under Creative Commons Attribution-ShareAlike 4.0 International. However, ' +
  'the Venice Project Center is not liable for any data inaccuracies present in the data or damages that may result from innacurate data usage.</p>';

  const guideTitle1 = document.createElement('h2');
  guideTitle1.className = 'guideTitle';
  guideTitle1.id = 'guideTitle1';
  guideTitle1.innerText = 'How to Create a Sandbox Graphic';

  const guidePart1 = document.createElement('div');
  guidePart1.className = 'guide';
  guidePart1.id = 'guidePart1';
  guidePart1.innerHTML = '<ol type="1"><li class="upperList">Select a Graph Type<ol type="a">' +
    '<li class="lowerList">Donut Chart: a circular chart with empty space in the middle that is useful for directly comparing the relative percentages of groups</li>' +
    '<li class="lowerList">Bubble Chart: a chart that creates circles with sizes based on the percentage of the data each element encompasses</li>' +
    '<li class="lowerList">Bar Chart: a vertical chart that compares the raw values of data columns against each other with x and y labels for each axis</li></ol></li>' +
    '<li class="upperList">Select a Data Set<ul><li class="tabbed">The data sets pull from the Venice Project Center\'s databases in order to get the most recent data for any particular topic. Currently, the ' +
    'topics available are Bells, Bridges, and Stores. This data has been collected by students from Worcester Polytechnic Institute since 1988, ' +
    'and the Venice Project Center is currently working to bring more accurate and comprehensive data.</li></ul></li>' +
    '<li class="upperList">Select a Data Column<ul><li class="tabbed">The data column is the specific data from the data set that will be visualized. The column names are based off of the raw data, so the names ' +
    'could be very technical.</li></ul></li>' +
    '<li class="upperList">(Bar Graph) Select a Stacked Data Column<ul><li class="tabbed">The stacked data column is exclusive to the bar graph, and will sort the stacked items based on the values set in the data column. This is ' +
    'useful for categorizing different elements of the data sets.</li></ul></li></ol>';

  const guideTitle2 = document.createElement('h2');
  guideTitle2.className = 'guideTitle';
  guideTitle2.id = 'guideTitle2';
  guideTitle2.innerText = 'Editing Graph Settings';

  const guidePart2 = document.createElement('div');
  guidePart2.className = 'guide';
  guidePart2.id = 'guidePart2';
  guidePart2.innerHTML = '<ol type="1"><li class="upperList">General Settings<ol type="a"><li class="lowerList">Title: The title for the graph</li>' +
    '<li class="lowerList">Description: The description for the graph</li><li class="lowerList">Font Size: The font size of all elements in the graph.<ul><li class="lowerList">Note: the title is always 2 times the font size</li></ul></li>' +
    '<li class="lowerList">Show Legend: Changes the location of the legend (key) on the page. None will hide the key.<ul><li class="lowerList">Note: (Bar Graph) The key will show the stacked element</li></ul></li>' +
    '<li class="lowerList">Hide Outlier Data: Hides Data Sets from the Data Set Selector that have data inappropriate for the currently selected Graph Type</li>' +
    '<li class="lowerList">Hide Empty Data: Hides empty values from the current visual.<ul><li class="lowerList">Note: Empty Values are undefined, \' \', null, and \'N/A\'</li></ul></li></ol></li>' +
    '<li class="upperList">Color Settings<ol type="a"><li class="lowerList">Font Color: The color for all font in the visual</li><li class="lowerList">Coloring Mode<ol type="i">' +
    '<li class="lowerList">Palette Mode: Chooses 2 Colors and sets each element to a gradient between the 2 colors</li>' +
    '<li class="lowerList">Single Mode: Chooses 1 Colors and sets each element to that color</li>' +
    '<li class="lowerList">Manual Mode: Allows the user to select a section of the graph and choose a particular color</li></ol></li></ol></li>' +
    '<li class="upperList">Other Settings: These are reserved for Graph Type particular settings</li></ol>';

  blurbContainer.appendChild(introTitle);
  blurbContainer.appendChild(intro);
  blurbContainer.appendChild(guideTitle1);
  blurbContainer.appendChild(guidePart1);
  blurbContainer.appendChild(guideTitle2);
  blurbContainer.appendChild(guidePart2);

  // Used to hold the permanent selections for graph type and data set
  const majorSelectContainer = document.createElement('div');
  majorSelectContainer.className = 'majorSelect';
  majorSelectContainer.id = 'majorSelect';

  const graphSettingsTitle = document.createElement('div');
  graphSettingsTitle.className = 'graphTitle';
  graphSettingsTitle.id = 'graphTitle';
  graphSettingsTitle.innerHTML = '<h3>Graph Settings</h3>';

  // Used to render the graph options
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls';
  controlsContainer.id = Visual.DEFAULT_RENDER_CONTROLS_ID;

  // Used to render the other buttons like downloads and exports
  const downloadContainer = document.createElement('div');
  downloadContainer.className = 'download';
  downloadContainer.id = 'download';

  const keyContainer = document.createElement('div');
  keyContainer.className = 'keyContainer';
  keyContainer.id = 'keyContainer';

  const keyTitle = document.createElement('h3');
  keyTitle.id = 'keyTitle';
  keyTitle.innerText = 'Legend';

  const key = document.createElement('div');
  key.className = 'key';
  key.id = 'key';


  keyContainer.appendChild(keyTitle);
  keyContainer.appendChild(key);

  // Create Page Structure
  rowContainer.appendChild(column1Container);
  rowContainer.appendChild(column2Container);

  column1Container.appendChild(majorSelectContainer);
  column1Container.appendChild(graphSettingsTitle);
  column1Container.appendChild(controlsContainer);
  visualColumn.appendChild(visualContainer);
  visualColumn.appendChild(keyContainer);
  column2Container.appendChild(blurbContainer);
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
  });
}

export default renderEditor;

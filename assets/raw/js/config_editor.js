import Loader from './visuals/helpers/Loader';
import Data from './visuals/helpers/Data';
import LoginModal from './visuals/helpers/LoginModal';

let list = null;
let configsList = null;
let loader = null;
let modal = null;

/**
 * Renders the list of configs within the editor page
 *
 * @param {Object[]} configs Array of all configs to render
 */
function renderList(configs) {
  configs.forEach((config, index) => {
    const row = document.createElement('div');
    row.className = 'list-row';

    const title = document.createElement('p');
    title.className = 'title';
    title.innerText = config.attributes.title;

    const dataSet = document.createElement('p');
    dataSet.className = 'data-set';
    dataSet.innerText = config.dataSetName;

    const type = document.createElement('p');
    type.className = 'type';
    type.innerText = config.type.replace(/-/g, ' ');


    const removeButton = document.createElement('button');
    removeButton.innerText = 'Delete Config';
    removeButton.addEventListener('click', () => {
      deleteConfig(index);
    });

    row.appendChild(title);
    row.appendChild(dataSet);
    row.appendChild(type);
    row.appendChild(removeButton);

    list.appendChild(row);
  });
}

/**
 * Deletes the chosen config based on its list position in configsList
 *
 * @param {int} index Index of the chosen config
 */
function deleteConfig(index) {
  const shouldRemove = confirm('Are you sure you want to delete this config?\nIt cannot be recovered.');
  if (shouldRemove) {
    modal.authenticate('Login and Delete').then(() => {
      loader.render();
      Data.removeConfig(configsList[index], () => {
        configsList.splice(index, 1);
        loader.remove();
        renderList(configsList);
        Materialize.toast('Visual Deleted', 3000);
      });
    });
  }
}

/**
 * Returns the name of a data set based on its id
 *
 * @param dataSets List of all data sets
 * @param id ID of selected data set
 * @returns {string} Name of selected data set
 */
function getDataSetName(dataSets, id) {
  for (let i = 0; i < dataSets.length; i += 1) {
    if (dataSets[i].id === id) {
      return dataSets[i].name;
    }
  }

  return '';
}

/**
 * Renders the config editor page and fetches data
 */
function renderConfigEditor() {
  const page = document.getElementById('page');
  page.classList.remove('container-fluid');
  page.classList.add('container');

  const removalHeader = document.createElement('h2');
  removalHeader.innerHTML = 'Click on a config to delete it:';
  page.appendChild(removalHeader);

  list = document.createElement('div');
  list.id = 'configs-list';
  list.className = 'list';
  page.appendChild(list);

  modal = new LoginModal();
  page.appendChild(modal.generate());
  modal.bind();

  loader = new Loader(list.id);
  loader.render();


  Data.fetchConfigs((configs) => {
    configsList = configs.reverse();
    Data.fetchDataSets((dataSets) => {
      for (let i = 0; i < configsList.length; i += 1) {
        configsList[i].dataSetName = getDataSetName(dataSets, configsList[i].dataSet);
      }
      loader.remove();
      renderList(configsList);
    });
  });
}

export default renderConfigEditor;

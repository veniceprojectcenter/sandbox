import Loader from './visuals/helpers/Loader';
import Data from './visuals/helpers/Data';
import LoginModal from './visuals/helpers/LoginModal';

let list = null;
let configsList = null;
let loader = null;
let modal = null;

function renderList(configs) {
  configs.forEach((config, index) => {
    const row = document.createElement('div');
    row.className = 'list-row';

    const title = document.createElement('p');
    title.className = 'title';
    title.innerText = 'A title';

    const dataSet = document.createElement('p');
    dataSet.className = 'data-set';
    dataSet.innerText = config.dataSet;

    const type = document.createElement('p');
    type.className = 'type';
    type.innerText = config.type.replace(/-/g, ' ');


    const removeButton = document.createElement('button');
    removeButton.innerText = 'Delete Config';
    removeButton.addEventListener('click', () => {
      deleteConfig(index);
    });

    row.appendChild(dataSet);
    row.appendChild(type);
    row.appendChild(title);
    row.appendChild(removeButton);

    list.appendChild(row);
  });
}

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
    loader.remove();
    renderList(configsList);
  });
}

export default renderConfigEditor;

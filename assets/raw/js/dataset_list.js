import Loader from './visuals/helpers/Loader';
import Data from './visuals/helpers/Data';

function render(dataSets) {
  const page = document.getElementById('page');
  page.classList.remove('container-fluid');
  page.classList.add('container');

  const datarows = document.createElement('div');
  datarows.className = 'data-row';

  const selectionHeader = document.createElement('h2');
  selectionHeader.innerHTML = 'Please select a dataset:';
  datarows.appendChild(selectionHeader);

  for (let i = 0; i < dataSets.length; i += 1) {
    const row = document.createElement('div');
    const link = document.createElement('a');
    link.href = `/${dataSets[i].id}/`;

    row.className = 'data-row';
    const name = document.createElement('div');
    name.className = 'name';
    name.innerHTML = dataSets[i].name;

    const description = document.createElement('div');
    description.className = 'description';
    description.innerHTML = dataSets[i].description;

    link.appendChild(name);
    link.appendChild(description);
    row.appendChild(link);

    datarows.appendChild(row);
  }

  page.appendChild(datarows);
}

async function renderDatasetList() {
  const loader = new Loader('page');
  loader.render();
  Data.fetchDataSets((dataSets) => {
    loader.remove();
    render(dataSets);
  });
}

export default renderDatasetList;

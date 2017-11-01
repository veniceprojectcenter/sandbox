const datasets = [
  { name: 'Ponti', description: 'Bridge Data', link: '/ponti/' },
  { name: 'Rive', description: 'Docks Data', link: '/rive/' },
];

function renderDatasetList(route) {
  const page = document.getElementById('page');
  page.classList.remove('container-fluid');
  page.classList.add('container');

  const datarows = document.createElement('div');
  datarows.className = 'data-row';

  const selectionHeader = document.createElement('h2');
  selectionHeader.innerHTML = 'Please select a dataset:';
  datarows.appendChild(selectionHeader);

  for (let i = 0; i < datasets.length; i += 1) {
    const row = document.createElement('div');
    const link = document.createElement('a');
    link.href = datasets[i].link;

    row.className = 'data-row';
    const name = document.createElement('div');
    name.className = 'name';
    name.innerHTML = datasets[i].name;

    const description = document.createElement('div');
    description.className = 'description';
    description.innerHTML = datasets[i].description;

    link.appendChild(name);
    link.appendChild(description);
    row.appendChild(link);

    datarows.appendChild(row);
  }

  page.appendChild(datarows);
}

export default renderDatasetList;

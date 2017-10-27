const datasets = [
  { name: 'Ponti', description: 'Blah Blah Blah', link: '/ponti' },
  { name: 'Rive', description: 'Blah Blah Blah', link: '/rive' },
];

function selectDataset(datasetLink) {
  const rows = document.querySelector('.data-rows');
  rows.style.display = 'none';
  const grid = document.querySelector('.visual-grid');
  grid.style.display = 'block';
  window.history.pushState(datasetLink.name, datasetLink.name, datasetLink.link);

  const breadcrumbs = document.getElementById('breadcrumbs');
  breadcrumbs.innerHTML = "&nbsp>&nbsp" + datasetLink.name;
}

function render_dataset_list(route){

  for (let i = 0; i < datasets.length; i += 1) {
    const row = document.createElement('div');
    row.className = 'data-row';
    const name = document.createElement('div');
    name.className = 'name';
    name.innerHTML = datasets[i].name;
    const description = document.createElement('div');
    description.className = 'description';
    description.innerHTML = datasets[i].description;
    row.appendChild(name);
    row.appendChild(description);

    // Add row hiding code:
    row.addEventListener('click', () => {
      selectDataset(datasets[i]);
    });

    document.querySelector('.data-rows').appendChild(row);
  }
}

export default render_dataset_list;

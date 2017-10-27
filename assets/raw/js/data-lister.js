const datasets = [
  { name: 'Ponti', description: 'Blah Blah Blah', link: '#ponti' },
  { name: 'Rive', description: 'Blah Blah Blah', link: '#rive' },
];

const visuals = [
  { name: 'Bar Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Pie Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Histogram', image: 'http://via.placeholder.com/300x300' },
];

function selectDataset(datasetLink) {
  const rows = document.querySelector('.data-rows');
  rows.style.display = 'none';
  const grid = document.querySelector('.visual-grid');
  grid.style.display = 'block';
  window.history.pushState(datasetLink.name, datasetLink.name, datasetLink.link);
}

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

for (let i = 0; i < visuals.length; i += 1) {
  const block = document.createElement('div');
  block.className = 'col-12 col-sm-6 col-md-4 col-lg-3 block';
  const name = document.createElement('div');
  name.className = 'name';
  name.innerHTML = visuals[i].name;
  const image = document.createElement('img');
  image.src = visuals[i].image;
  block.appendChild(image);
  block.appendChild(name);

  document.querySelector('.visual-grid .row').appendChild(block);
}

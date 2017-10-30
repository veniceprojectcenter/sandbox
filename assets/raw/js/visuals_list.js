import updateBreadcrumbs from './utils';

const visuals = [
  { name: 'Bar Chart', image: 'http://via.placeholder.com/300x300', link: 'barchart' },
  { name: 'Donut Chart', image: 'http://via.placeholder.com/300x300', link: 'donut' },
  { name: 'Histogram', image: 'http://via.placeholder.com/300x300', link: 'histogram' },
  { name: 'Map', image: 'http://via.placeholder.com/300x300', link: 'map' },
  { name: 'Bar Chart', image: 'http://via.placeholder.com/300x300', link: 'barchart' },
  { name: 'Pie Chart', image: 'http://via.placeholder.com/300x300', link: 'piechart' },
  { name: 'Histogram', image: 'http://via.placeholder.com/300x300', link: 'histogram' },
  { name: 'Map', image: 'http://via.placeholder.com/300x300', link: 'map' },
  { name: 'Bar Chart', image: 'http://via.placeholder.com/300x300', link: 'barchart' },
  { name: 'Pie Chart', image: 'http://via.placeholder.com/300x300', link: 'piechart' },
  { name: 'Histogram', image: 'http://via.placeholder.com/300x300', link: 'histogram' },
  { name: 'Map', image: 'http://via.placeholder.com/300x300', link: 'map' },
  { name: 'Bar Chart', image: 'http://via.placeholder.com/300x300', link: 'barchart' },
  { name: 'Pie Chart', image: 'http://via.placeholder.com/300x300', link: 'piechart' },
  { name: 'Histogram', image: 'http://via.placeholder.com/300x300', link: 'histogram' },
  { name: 'Map', image: 'http://via.placeholder.com/300x300', link: 'map' },
];


function renderVisualsList(route) {
  updateBreadcrumbs(route);

  const page = document.getElementById('page');
  const visualBlocks = document.createElement('div');
  visualBlocks.className = 'visual-grid';

  const gridRow = document.createElement('div');
  gridRow.className = 'row';

  const selectionHeader = document.createElement('h2');
  selectionHeader.innerHTML = 'Please select a visual:';
  visualBlocks.appendChild(selectionHeader);

  visualBlocks.appendChild(gridRow);

  for (let i = 0; i < visuals.length; i += 1) {
    const block = document.createElement('div');
    block.className = 'col-12 col-sm-6 col-md-4 col-lg-3 block';

    const link = document.createElement('a');
    link.href = visuals[i].link;

    const name = document.createElement('div');
    name.className = 'name';
    name.innerHTML = visuals[i].name;
    const image = document.createElement('img');
    image.src = visuals[i].image;
    link.appendChild(image);
    link.appendChild(name);
    block.appendChild(link);

    gridRow.appendChild(block);
  }
  page.appendChild(visualBlocks);
}

export default renderVisualsList;

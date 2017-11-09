import updateBreadcrumbs from './utils';

const visuals = [
  { name: 'Bar Chart', image: 'http://datavizproject.com/wp-content/uploads/2015/10/4-Bar-Chart-300x300.png', link: 'bar' },
  { name: 'Donut Chart', image: 'http://datavizproject.com/wp-content/uploads/2015/10/3-Donut-Chart-300x300.png', link: 'donut' },
  { name: 'Counter', image: 'http://datavizproject.com/wp-content/uploads/2016/01/DVP_101_200-17-300x300.png', link: 'counter' },
  { name: 'Map', image: 'http://datavizproject.com/wp-content/uploads/2017/08/DVP_101_200-56-300x300.png', link: 'map' },
  { name: 'Isochrone Map', image: 'http://datavizproject.com/wp-content/uploads/2015/10/DVP-88-300x300.png', link: 'isochrone' },
  { name: 'Pie Chart Map', image: 'http://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-43-300x300.png', link: 'piechartmap' },
  { name: 'Bubble Timeline', image: 'http://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-36.png', link: 'bubble-timeline' },
  { name: 'Map', image: 'http://datavizproject.com/wp-content/uploads/2017/08/DVP_101_200-56-300x300.png', link: 'map' },
  { name: 'Bar Chart', image: 'http://datavizproject.com/wp-content/uploads/2015/10/4-Bar-Chart-300x300.png', link: 'barchart' },
  { name: 'Pie Chart', image: 'http://datavizproject.com/wp-content/uploads/2015/10/11-Pie-Chart-300x300.png', link: 'piechart' },
  { name: 'Histogram', image: 'http://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-16-300x300.png', link: 'histogram' },
  { name: 'Map', image: 'http://datavizproject.com/wp-content/uploads/2017/08/DVP_101_200-56-300x300.png', link: 'map' },
  { name: 'Bar Chart', image: 'http://datavizproject.com/wp-content/uploads/2015/10/4-Bar-Chart-300x300.png', link: 'barchart' },
  { name: 'Pie Chart', image: 'http://datavizproject.com/wp-content/uploads/2015/10/11-Pie-Chart-300x300.png', link: 'piechart' },
  { name: 'Histogram', image: 'http://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-16-300x300.png', link: 'histogram' },
  { name: 'Map', image: 'http://datavizproject.com/wp-content/uploads/2017/08/DVP_101_200-56-300x300.png', link: 'map' },
];


function renderVisualsList(route) {
  updateBreadcrumbs(route);

  const page = document.getElementById('page');
  page.classList.remove('container-fluid');
  page.classList.add('container');

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

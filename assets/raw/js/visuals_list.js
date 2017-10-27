const visuals = [
  { name: 'Bar Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Pie Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Histogram', image: 'http://via.placeholder.com/300x300' },
  { name: 'Map', image: 'http://via.placeholder.com/300x300' },
  { name: 'Bar Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Pie Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Histogram', image: 'http://via.placeholder.com/300x300' },
  { name: 'Map', image: 'http://via.placeholder.com/300x300' },
  { name: 'Bar Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Pie Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Histogram', image: 'http://via.placeholder.com/300x300' },
  { name: 'Map', image: 'http://via.placeholder.com/300x300' },
  { name: 'Bar Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Pie Chart', image: 'http://via.placeholder.com/300x300' },
  { name: 'Histogram', image: 'http://via.placeholder.com/300x300' },
  { name: 'Map', image: 'http://via.placeholder.com/300x300' },
];

function render_visuals_list(route){
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
}

export default render_visuals_list;

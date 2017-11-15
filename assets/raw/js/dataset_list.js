import Loader from './visuals/helpers/Loader';

function generateID(name) {
  return name.replace(/[ ]/g, '-');
}

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
  if (localStorage.dataSets && localStorage.dataSetsDate &&
    Math.floor(new Date() - Date.parse(localStorage.dataSetsDate)) < (1000 * 60 * 60 * 24)) {
    const dataSets = JSON.parse(localStorage.dataSets);
    loader.remove();
    render(dataSets);
  } else {
    const dataSets = [];
    const db = firebase.database();
    await db.ref('/groups').once('value').then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // const data = doc.val();
        const entry = {};
        entry.id = generateID(doc.key);
        entry.name = doc.key;
        entry.description = 'A data set';
        dataSets.push(entry);
      });

      localStorage.dataSetsDate = new Date().toString();
      localStorage.dataSets = JSON.stringify(dataSets);
      loader.remove();
      render(dataSets);
    })
    .catch((error) => {
      console.error(error);
    });
  }
}

export default renderDatasetList;

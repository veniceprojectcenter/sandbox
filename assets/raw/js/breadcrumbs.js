import Data from './visuals/helpers/Data';

function getDataSetName(dataSets, id) {
  for (let i = 0; i < dataSets.length; i += 1) {
    if (dataSets[i].id === id) {
      return dataSets[i].name;
    }
  }

  return '';
}

function updateBreadcrumbs(route) {
  if (route.length >= 1) {
    Data.fetchDataSets((dataSets) => {
      const breadcrumbs = document.getElementById('breadcrumbs');
      let breadcrumbString = '';
      const name = getDataSetName(dataSets, route[0]);
      breadcrumbString += `<span class="crumb"><a href="/${route[0]}/">${name}</a></span>`;

      if (route.length >= 2) {
        breadcrumbString += `<span class="crumbcaret">&gt;</span><span class="crumb">${route[1].replace(/-/g, ' ')}<span>`;
      }

      breadcrumbs.innerHTML = breadcrumbString;
    });
  }
}

export default updateBreadcrumbs;

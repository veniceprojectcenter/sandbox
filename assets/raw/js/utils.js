function updateBreadcrumbs(route) {
  const breadcrumbs = document.getElementById('breadcrumbs');
  let breadcrumbString = '';
  for (let i = 0; i < route.length; i += 1) {
    if (i !== 0) {
      breadcrumbString += `&nbsp>&nbsp${route[i]}`;
    } else {
      breadcrumbString += `&nbsp>&nbsp<a href="/${route[i]}/">${route[i]}</a>`;
    }
  }

  breadcrumbs.innerHTML = breadcrumbString;
}

export default updateBreadcrumbs;

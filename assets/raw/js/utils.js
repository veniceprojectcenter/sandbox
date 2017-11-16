function updateBreadcrumbs(route) {
  const breadcrumbs = document.getElementById('breadcrumbs');
  let breadcrumbString = '';
  for (let i = 0; i < route.length; i += 1) {
    const name = route[i].replace(/-/g, ' '); // De-IDify it
    if (i !== 0) {
      breadcrumbString += `&nbsp>&nbsp${name}`;
    } else {
      breadcrumbString += `&nbsp>&nbsp<a href="/${route[i]}/">${name}</a>`;
    }
  }

  breadcrumbs.innerHTML = breadcrumbString;
}

export default updateBreadcrumbs;

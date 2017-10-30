function updateBreadcrumbs(route) {
  const breadcrumbs = document.getElementById('breadcrumbs');
  let breadcrumbString = '';
  for (let i = 0; i < route.length; i += 1) {
    breadcrumbString += `&nbsp>&nbsp${route[i]}`;
  }
  breadcrumbs.innerHTML = breadcrumbString;
}

export default updateBreadcrumbs;

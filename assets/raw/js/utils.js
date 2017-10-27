function update_breadcrumbs(route){
  const breadcrumbs = document.getElementById('breadcrumbs');
  let breadcrumbString = "";
  for(let i = 0; i < route.length; i++){
    breadcrumbString += "&nbsp>&nbsp" + route[i];
  }
  breadcrumbs.innerHTML = breadcrumbString;
}


export default update_breadcrumbs;

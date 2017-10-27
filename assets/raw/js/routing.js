import render_dataset_list from './dataset_list';
import render_visuals_list from './visuals_list';
import render_editor from './editor.js';


function routing(){
  const path = window.location.pathname;
  const split = path.split("/");
  // Remove empty strings
  let route = [];
  for(let i = 0; i < split.length; i++){
    if(split[i] != ""){
      route.push(split[i]);
    }
  }

  console.log(route.length);
  switch(route.length){
    case 0:
      render_dataset_list(route);
      break;
    case 1:
      render_visuals_list(route);
      break;
    default:
      render_editor(route);
  }
}

routing();

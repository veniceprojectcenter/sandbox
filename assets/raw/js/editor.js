import update_breadcrumbs from './utils';

function render_editor(route){
  update_breadcrumbs(route);

  const visual = document.createElement('div');
  visual.className = 'visual';

  const page = document.getElementById('page');
  page.appendChild(visual);
}

export default render_editor;

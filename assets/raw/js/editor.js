import updateBreadcrumbs from './utils';

function renderEditor(route) {
  updateBreadcrumbs(route);

  const visual = document.createElement('div');
  visual.className = 'visual';

  const page = document.getElementById('page');
  page.appendChild(visual);
}

export default renderEditor;

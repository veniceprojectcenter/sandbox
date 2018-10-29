import base from './base';
import updateBreadcrumbs from './breadcrumbs';
import renderDatasetList from './dataset_list';
import renderVisualsList from './visuals_list';
import renderEditor from './editor';
import renderConfigEditor from './config_editor';
import Firebase from './Firebase';

function routing() {
  const path = window.location.pathname;
  const split = path.split('/');
  // Remove empty strings
  const route = [];
  for (let i = 0; i < split.length; i += 1) {
    if (split[i] !== '') {
      route.push(split[i]);
    }
  }
  if (route.length > 0 && route[0] === 'config-editor') {
    renderConfigEditor();
  } else {
    updateBreadcrumbs(route);

    switch (route.length) {
      case 0:
        renderDatasetList(route);
        break;
      case 1:
        renderVisualsList(route);
        break;
      default:
        renderEditor(route);
    }
  }
}

base();
Firebase.initFirebase();
routing();

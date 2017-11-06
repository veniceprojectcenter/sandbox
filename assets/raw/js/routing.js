import renderDatasetList from './dataset_list';
import renderVisualsList from './visuals_list';
import renderEditor from './editor';


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


// Initialize Firebase - might want to move to a different place eventually
const config = {
  apiKey: 'AIzaSyBqpAQE7wrvXnitoSwso-QTDa_5U8fHvgM',
  authDomain: 'vpc-sandbox-test.firebaseapp.com',
  databaseURL: 'https://vpc-sandbox-test.firebaseio.com',
  projectId: 'vpc-sandbox-test',
  storageBucket: 'vpc-sandbox-test.appspot.com',
  messagingSenderId: '962614899759',
};
firebase.initializeApp(config);

routing();

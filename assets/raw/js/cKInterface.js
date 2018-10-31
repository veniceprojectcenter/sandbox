import Visual from './visuals/helpers/Visual';

let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

/**
 * File to put all functions for querying the CK Database
*/
class ckData {
  static fetchData(dataset, callback) {
      page.innerHTML = '<p> good shit boi';

    const http = new XMLHttpRequest();
    const url = 'http://ckdata2.herokuapp.com/api/v1/dataset.json?group_name=Accolades';
    http.open('GET', url, false);
    http.onload = () => {
      page.html = http.responseText;
    };
    page.innerHTML = '<p> gerp';
    http.send();
    // if (http.responseText) {
    //     console.log(http.responseText);
    //     page.innerHTML = http.responseText;
    // }
    // else {
    //     console.log('ded');
    //     page.innerHTML = '<p> didn\'t find dat shit';
    // }
  }
}

export default ckData;

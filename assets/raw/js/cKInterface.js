/**
 * File to put all functions for querying the CK Database
*/
class ckData {
  static fetchData(dataset, callback) {
    page.innerHTML = '<p> good shit boi';

    fetch('http://ckdata2.herokuapp.com/api/v1/data.json?ck_id=01775c93-aaf5-d6bc-85d4-3d3568cfe4d3',
      { method: 'GET',
        mode: 'cors',
      })
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .catch(() => {
      console.log('error');
    });
  }
}

export default ckData;

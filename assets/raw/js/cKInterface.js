/**
 * File to put all functions for querying the CK Database
*/
class ckData {
  static fetchData(dataset, callback) {
    page.innerHTML = '<p> good shit boi';

    fetch('http://ckdata2.herokuapp.com/api/v1/dataset.json?group_name=Accolades',
      { method: 'GET',
        mode: 'cors',
      })
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((response) => {
      console.log(response); // One element
      console.log(response[2].ck_id); //takes the ck_id of the 3rd list element
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
  }
}

export default ckData;

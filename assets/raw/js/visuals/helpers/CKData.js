class CKData {
  /**
   * Retrieves a single data set from the ckDatabase
   *
   * @param dataSet Name of data set to retrieve
   * @returns {Promise<Array>} Array of data points
   */
  static async fetchData(dataSet) {
    const url = `http://ckdata2.herokuapp.com/api/v1/dataset.json?group_name=${dataSet}`;
    let data = [];
    await fetch(url, { method: 'GET', mode: 'cors' })
    .then(response => response.json())
    .then((response) => {
      // JSON data is retrieved HERE, where response is an array of elements of the dataset
      data = response;
    })
    .catch((error) => {
      page.innerHTML = '<p> An error occurred when fetching the data.';
      console.error(error);
    });

    return data;
  }
}

export default CKData;

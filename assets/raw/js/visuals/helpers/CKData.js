/**
 * Helper class that retrieves data from the CK Database
 */
class CKData {
  /**
   * Retrieves a single data set from the ckDatabase
   *
   * @param dataSet Name of data set to retrieve
   * @returns {Promise<Array>} Array of data points
   */
  static async fetchData(dataSet) { // TODO: address the content object in the return here?
    const url = `http://ckdata2.herokuapp.com/api/v1/dataset.json?group_name=${dataSet}`;
    let data = [];
    await fetch(url, { method: 'GET', mode: 'cors' })
    .then(response => response.json())
    .then((response) => {
      // JSON data is retrieved HERE, where response is an array of elements of the dataset
      data = response.map(item => item.content);
    })
    .catch((error) => {
      page.innerHTML = '<p> An error occurred when fetching the data.';
      console.error(error);
    });

    return data;
  }

  /**
   * Returns the names of all usable data sets in the CK Database
   *
   * @returns {Promise<Array>} Array of all data sets
   */
  static async fetchDataSets() {
    let usableSets = [{ name: 'Bridges', id: 'Merge Ponti' },
      { name: 'Bells', id: 'Bell Data' },
      { name: 'Stores', id: 'store locations' }];

    usableSets = usableSets.map((set) => {
      const o = Object.assign({}, set);
      o.description = `A data set containing information on ${o.name}`;
      return o;
    });

    /* This fetches full content of all data sets which is cool I guess
    await Promise.all(usableSets.map(async (set) => {
      await CKData.fetchData(set.id)
      .then((response) => {
        dataSets.push(response);
      });
    }));
    */

    return usableSets; // TODO: make this dynamic? Or add more data sets
  }
}

export default CKData;

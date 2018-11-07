import FirebaseData from './FirebaseData';
import CKData from './CKData';

const useFirebase = true; // Uses either the ckDatabase or Firebase based on this variable

/**
 * Class for retrieving information from the databases
 */
class Data {
  /**
   * Retrieves a data set from the chosen database and uses it in the callback method
   *
   * @param {string} dataSet Name of data set to retrieve
   * @param {function} callback Function that takes one argument, Object[], and will be called with
   *                            the retrieved data
   * @returns {Promise<void>}
   */
  static async fetchData(dataSet, callback) {
    if (localStorage[dataSet] && localStorage[`${dataSet}-date`] &&
      Math.floor(new Date() - Date.parse(localStorage[`${dataSet}-date`])) < (1000 * 60 * 60 * 24)) {
      const data = JSON.parse(localStorage[dataSet]);
      callback(data);
    } else {
      let data = [];

      if (useFirebase) {
        await FirebaseData.fetchData(dataSet)
        .then((response) => {
          data = response;
        });
      } else {
        await CKData.fetchData(dataSet)
        .then((response) => {
          data = response;
        });
      }

      try {
        localStorage[`${dataSet}-date`] = new Date().toString();
        localStorage[dataSet] = JSON.stringify(data);
      } catch (e) {
        console.error(e, 'Clearing local storage and trying again');
        localStorage.clear(); // Really should find a better solution
        localStorage[`${dataSet}-date`] = new Date().toString();
        localStorage[dataSet] = JSON.stringify(data);
      }
      if (callback) {
        callback(data);
      }
    }
  }

  /**
   * Retrieves the names of all data sets from the chosen database and uses them to call callback
   *
   * @param {function} callback Function that takes one argument, Object[], and will be called with
   *                            the retrieved data set list
   * @returns {Promise<void>}
   */
  static async fetchDataSets(callback) {
    if (localStorage.dataSets && localStorage.dataSetsDate &&
      Math.floor(new Date() - Date.parse(localStorage.dataSetsDate)) < (1000 * 60 * 60 * 24)) {
      const dataSets = JSON.parse(localStorage.dataSets);
      if (callback) {
        callback(dataSets);
      }
    } else {
      let dataSets = [];
      if (useFirebase) {
        await FirebaseData.fetchDataSets().then((response) => {
          dataSets = response;
        });
      } else {
        await FirebaseData.fetchDataSets().then((response) => {
          dataSets = response;
        }); // TODO: replace this with CKData
      }


      localStorage.dataSetsDate = new Date().toString();
      try {
        localStorage.dataSets = JSON.stringify(dataSets);
      } catch (e) {
        console.error(e, 'Clearing local storage and trying again');
        localStorage.clear(); // Really should find a better solution
        localStorage.dataSets = JSON.stringify(dataSets);
      }

      if (callback) {
        callback(dataSets);
      }
    }
  }

  /**
   * Retrieves all configs in the chosen database
   *
   * @param {function} callback Function that takes Object[] and uses the found configs to call it
   * @returns {Promise<void>}
   */
  static async fetchConfigs(callback) {
    let configs = [];
    if (useFirebase) {
      await FirebaseData.fetchConfigs().then((response) => {
        configs = response;
      });
    } else {
      // TODO: configs for CK?
    }

    if (callback) {
      callback(configs);
    }
  }

  /**
   * Deletes selected config from the chosen database
   *
   * @param {Object} config Config to delete
   * @param callback Function that takes no parameters and is called after the config is deleted
   * @returns {Promise<void>}
   */
  static async removeConfig(config, callback) {
    if (useFirebase) {
      await FirebaseData.removeConfig(config);
    } else {
      // TODO: configs for CK?
    }


    if (callback) {
      callback();
    }
  }
}

export default Data;
exports.useFirebase = useFirebase;

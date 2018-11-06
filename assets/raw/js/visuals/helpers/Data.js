import FirebaseData from './FirebaseData';
import CKData from './CKData';

const useFirebase = false; // Uses either the ckDatabase or Firebase based on this variable

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
    // TODO : put caching back in
    if (false && localStorage[dataSet] && localStorage[`${dataSet}-date`] &&
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

  static async fetchDataSets(callback) {
    if (localStorage.dataSets && localStorage.dataSetsDate &&
      Math.floor(new Date() - Date.parse(localStorage.dataSetsDate)) < (1000 * 60 * 60 * 24)) {
      const dataSets = JSON.parse(localStorage.dataSets);
      if (callback) {
        callback(dataSets);
      }
    } else {
      const dataSets = [];
      const db = firebase.database();
      await db.ref('/groups').once('value').then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const entry = {};
          const value = doc.val();
          entry.id = doc.key.replace(/[ ]+/g, '-');
          entry.name = value.name || doc.key;
          entry.description = value.description || `A data set containing information on ${entry.name}`;
          dataSets.push(entry);
        });

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
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }

  static async fetchConfigs(callback) {
    const configs = [];
    const db = firebase.database();
    const promises = [];
    await db.ref('/viz/info').once('value').then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const entry = {};
        const value = doc.val();
        entry.key = doc.key;
        entry.dataSet = value.dataSet;
        entry.type = value.type;
        entry.id = value.id;
        promises.push(db.ref(`/viz/configs/${entry.dataSet}/${entry.id}`).once('value').then((result) => {
          const config = result.val();
          entry.attributes = JSON.parse(config.attributes);
          configs.push(entry);
        }));
      });
    });

    await Promise.all(promises);

    if (callback) {
      callback(configs);
    }
  }

  static async removeConfig(config, callback) {
    const db = firebase.database();
    await db.ref(`/viz/info/${config.key}`).remove();
    await db.ref(`/viz/configs/${config.dataSet}/${config.id}`).remove();

    if (callback) {
      callback();
    }
  }
}

export default Data;
exports.useFirebase = useFirebase;

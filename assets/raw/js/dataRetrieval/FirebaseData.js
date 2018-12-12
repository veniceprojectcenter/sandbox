/**
 * Helper class that retrieves data from the Firebase
 */
class FirebaseData {
  /**
   * Retrieves a single data set from Firebase
   *
   * @param dataSet Name of data set to retrieve
   * @returns {Promise<Array>} Array of data points
   */
  static async fetchData(dataSet) {
    const data = [];
    const db = firebase.database();
    let dataIDs = [];

    await db.ref(`/groups/${dataSet.replace(/-/g, ' ')}`).once('value').then((results) => {
      const group = results.val();
      dataIDs = group.member_list.split(',');
    })
    .catch((error) => {
      // Materialize.toast('Error Fetching Data', 3000);
      console.error(error);
    });

    const promises = [];
    for (let i = 0; i < dataIDs.length; i += 1) {
      promises.push(db.ref(`/data/${dataIDs[i]}`).once('value').then((result) => {
        const entry = result.val();
        if (entry !== null) {
          const entryData = entry.data;
          const birthID = entry.birth_certificate;
          entryData.id = result.key;
          if (entryData.id !== 'undefined') {
            if (birthID.lat && !entryData.lat) {
              entryData.lat = birthID.lat;
            }

            if (birthID.lon && !entryData.lng) {
              entryData.lng = birthID.lon;
            }

            const keys = Object.keys(entryData);
            for (let j = 0; j < keys.length; j += 1) {
              if (keys[j].toLowerCase().includes('photo')) {
                delete entryData[keys[j]];
              }
            }

            data.push(entryData);
          }
        }
      }));
    }

    await Promise.all(promises);
    return data;
  }

  /**
   * Returns the names of all data sets in Firebase
   *
   * @returns {Promise<Array>} Array of all data sets
   */
  static async fetchDataSets() {
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
    })
    .catch((error) => {
      console.error(error);
    });

    return dataSets;
  }

  /**
   * Gets all configs from the Firebase
   *
   * @returns {Promise<Array>} All configs
   */
  static async fetchConfigs() {
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
    return configs;
  }

  /**
   * Deletes chosen config
   *
   * @param {Object} config Config to delete
   * @returns {Promise<void>}
   */
  static async removeConfig(config) {
    const db = firebase.database();
    await db.ref(`/viz/info/${config.key}`).remove();
    await db.ref(`/viz/configs/${config.dataSet}/${config.id}`).remove();
  }
}

export default FirebaseData;

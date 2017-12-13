class Data {
  static async fetchData(dataSet, callback) {
    if (localStorage[dataSet] && localStorage[`${dataSet}-date`] &&
      Math.floor(new Date() - Date.parse(localStorage[`${dataSet}-date`])) < (1000 * 60 * 60 * 24)) {
      const data = JSON.parse(localStorage[dataSet]);
      callback(data);
    } else {
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
    await db.ref('/viz/info').once('value').then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const entry = {};
        const value = doc.val();
        entry.key = doc.key;
        entry.dataSet = value.dataSet;
        entry.type = value.type;
        entry.id = value.id;
        configs.push(entry);
      });
    });

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

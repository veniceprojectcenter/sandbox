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

            console.log(birthID);
            data.push(entryData);
          }
        }));
      }

      await Promise.all(promises);
      localStorage[`${dataSet}-date`] = new Date().toString();
      localStorage[dataSet] = JSON.stringify(data);
      callback(data);
    }
  }
}

export default Data;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["render", "renderControls"] }] */

class Visual {
  constructor(config, renderID = Visual.DEFAULT_RENDER_ID,
    renderControlsID = Visual.DEFAULT_RENDER_CONTROLS_ID) {
    this.renderID = renderID;
    this.renderControlsID = renderControlsID;
    this.dataSet = config.dataSet;
    this.data = [];
    this.attributes = config.attributes;
    this.type = config.type;
  }

  loadStaticData(data) {
    this.data = data;
    this.onLoadData();
  }

  async fetchData() {
    if (sessionStorage[this.dataSet]) {
      this.data = JSON.parse(sessionStorage[this.dataSet]);
      this.onLoadData();
    } else {
      const db = firebase.firestore();
      const data = [];
      await db.collection(`datasets/${this.dataSet}/entries`).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const entry = doc.data();
          entry.id = doc.id;
          data.push(entry);
        });
        this.data = data;
        sessionStorage[this.dataSet] = JSON.stringify(this.data);
        this.onLoadData();
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }

  generateConfigButton(id = 'download') {
    const generateButton = document.createElement('button');
    generateButton.className = 'button';
    generateButton.innerText = 'Download Config';
    generateButton.addEventListener('click', () => this.generateConfig());

    const downloadContainer = document.getElementById(id);
    downloadContainer.appendChild(generateButton);
  }

  generateConfig() {
    const config = {
      type: this.type,
      dataSet: this.dataSet,
      attributes: this.attributes,
    };
    const downloadButton = document.createElement('a');
    downloadButton.className = 'button';
    downloadButton.innerText = 'Download Config';
    downloadButton.href = `data:text/json;charset=utf-8,${JSON.stringify(config)}`;
    downloadButton.download = 'config.json';
    downloadButton.click();
  }

  static empty(id) {
    document.getElementById(id).innerHTML = '';
  }

  applyDefaultAttributes(defaults) {
    const keys = Object.keys(defaults);
    for (let i = 0; i < keys.length; i += 1) {
      if (Object.prototype.hasOwnProperty.call(defaults, keys[i])) {
        if (!Object.prototype.hasOwnProperty.call(this.attributes, keys[i])) {
          this.attributes[keys[i]] = defaults[keys[i]];
        }
      }
    }
  }

  async fetchAndRender() {
    await this.fetchData();

    this.render();
    this.renderControls();
    this.generateConfigButton();
  }

  onLoadData() {} //eslint-disable-line

  renderControls() {
    throw new Error('You must implement this method');
  }

  render() {
    throw new Error('You must implement this method');
  }

  // DATA HELPER FUNCTIONS

  getColumns() {
    const cols = [];
    if (this.data.length > 0) {
      const keys = Object.keys(this.data[0]);
      for (let i = 0; i < keys.length; i += 1) {
        cols.push(keys[i]);
      }
    }

    return cols;
  }

  getGroupedList(columnName, inputData = this.data) {
    const results = [];
    for (let i = 0; i < inputData.length; i += 1) {
      const categoryVal = inputData[i][columnName];

      let found = false;
      for (let p = 0; p < results.length; p += 1) {
        if (results[p].key === categoryVal) {
          results[p].value.push(inputData[i]);
          found = true;
          break;
        }
      }

      if (!found) {
        results.push({ key: categoryVal, value: [this.data[i]] });
      }
    }

    return results;
  }

  getGroupedListCounts(columnName, inputData = this.data) {
    const data = this.getGroupedList(columnName, inputData);
    const results = [];
    for (let i = 0; i < data.length; i += 1) {
      results.push({ key: data[i].key, value: data[i].value.length });
    }
    return results;
  }

  /**
  *Filters This.data and returns only numeric data columns
  *Any data with more than maxCategories categories and is numeric is diplayed
  **Data returned is in same format as this.data
  */
  getNumericData(maxCategories = 25) {
    const dataKeys = Object.keys(this.data[0]);
    const numericData = JSON.parse(JSON.stringify(this.data));
    for (let i = 0; i < dataKeys.length; i += 1) {
      const groupedList = this.getGroupedList(dataKeys[i]);
      if (groupedList.length < maxCategories
       || isNaN(this.data[0][dataKeys[i]])) {
        for (let j = 0; j < this.data.length; j += 1) {
          delete numericData[j][dataKeys[i]];
        }
      }
    }
    return numericData;
  }
  /**
  */
  isNumeric(columnName, maxCategories = 25) {
    const groupedList = this.getGroupedList(columnName);
    return (groupedList.length >= maxCategories
     && !isNaN(this.data[0][columnName]));
  }
  /**
  *Filters This.data and returns only categorical data columns
  *Any data attribute with less than  or equal to maxCategories categories are displayed
  *Data returned is in same format as this.data
  */
  getCategoricalData(maxCategories = 25) {
    const dataKeys = Object.keys(this.data[0]);
    const categoricalData = JSON.parse(JSON.stringify(this.data));
    for (let i = 0; i < dataKeys.length; i += 1) {
      const groupedList = this.getGroupedList(dataKeys[i]);
      if (groupedList.length >= maxCategories) {
        for (let j = 0; j < this.data.length; j += 1) {
          delete categoricalData[j][dataKeys[i]];
        }
      }
    }
    return categoricalData;
  }

  /**
  *Filters This.data and returns only identifying data columns
  *Any data with more than maxCategories categories and is not numeric are displayed
  *Data returned is in same format as this.data
  */
  getIdData(maxCategories = 25) {
    const dataKeys = Object.keys(this.data[0]);
    const categoricalData = JSON.parse(JSON.stringify(this.data));
    for (let i = 0; i < dataKeys.length; i += 1) {
      const groupedList = this.getGroupedList(dataKeys[i]);
      if (groupedList.length < maxCategories
      || !isNaN(this.data[0][dataKeys[i]])) {
        for (let j = 0; j < this.data.length; j += 1) {
          delete categoricalData[j][dataKeys[i]];
        }
      }
    }
    return categoricalData;
  }

  /**
  *Takes a columnName, binSize, and start of first bin and
  *returns a copy of data with the volume
  */
  makeBin(columnName, binSize, start = 0, theData = this.data, maxBins = 25) {
    const binData = JSON.parse(JSON.stringify(theData));
    const binArray = [];
    for (let i = start; i <= maxBins; i += 1) {
      binArray[i] = `${start + (i * binSize)}-${start + ((i + 1) * binSize)}`;
    }
    for (let j = 0; j < theData.length; j += 1) {
      binData[j][columnName] = binArray[Math.floor(this.data[j][columnName] / binSize) - start];
    }
    return binData;
  }
}

Visual.DEFAULT_RENDER_ID = 'visual';
Visual.DEFAULT_RENDER_CONTROLS_ID = 'controls';

export default Visual;

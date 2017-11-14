/* eslint class-methods-use-this: ["error", { "exceptMethods": ["render", "renderControls"] }] */
import Firebase from '../../Firebase';


class Visual {
  constructor(config, renderID = Visual.DEFAULT_RENDER_ID,
    renderControlsID = Visual.DEFAULT_RENDER_CONTROLS_ID) {
    this.renderID = renderID;
    this.renderControlsID = renderControlsID;
    this.dataSet = config.dataSet;
    this.data = [];
    this.attributes = config.attributes;
    this.type = config.type;

    this.useTransitions = true;
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
        Materialize.toast('Error Fetching Data', 3000);
        console.error(error);
      });
    }
  }

  generateConfigButton(id = 'download') {
    const modal = document.createElement('div');
    modal.className = 'modal modal-fixed-footer';
    modal.id = 'login-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const headerRow = document.createElement('div');
    headerRow.className = 'row';
    const headerContainer = document.createElement('div');
    headerContainer.className = 'col';
    const modalHeader = document.createElement('h4');
    modalHeader.innerText = 'Log In';

    const emailRow = document.createElement('div');
    emailRow.className = 'row';
    const emailContainer = document.createElement('div');
    emailContainer.className = 'input-field col';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.className = 'validate';
    emailInput.id = 'email';
    const emailLabel = document.createElement('label');
    emailLabel.setAttribute('for', 'email');
    emailLabel.innerText = 'Email';

    const passwordRow = document.createElement('div');
    passwordRow.className = 'row';
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'input-field col';
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.className = 'validate';
    passwordInput.id = 'password';
    const passwordLabel = document.createElement('label');
    passwordLabel.setAttribute('for', 'password');
    passwordLabel.innerText = 'Password';

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';

    const loginButton = document.createElement('button');
    loginButton.className = 'waves-effect btn-flat';
    loginButton.innerText = 'Login And Publish';
    loginButton.addEventListener('click', () => {
      loginButton.classList.add('disabled');
      const email = emailInput.value;
      const password = passwordInput.value;
      Firebase.login(email, password, () => {
        this.publishConfig();
        $('#login-modal').modal('close');
        console.log('Successful login');
      }, () => {
        loginButton.classList.remove('disabled');
        console.log('Unable to login');
      });
    });

    const cancelButton = document.createElement('button');
    cancelButton.className = 'modal-action modal-close waves-effect btn-flat';
    cancelButton.innerText = 'Cancel';


    headerRow.appendChild(headerContainer);
    headerContainer.appendChild(modalHeader);

    emailContainer.appendChild(emailInput);
    emailContainer.appendChild(emailLabel);
    emailRow.appendChild(emailContainer);

    passwordContainer.appendChild(passwordInput);
    passwordContainer.appendChild(passwordLabel);
    passwordRow.appendChild(passwordContainer);

    modalContent.appendChild(headerRow);
    modalContent.appendChild(emailRow);
    modalContent.appendChild(passwordRow);
    modal.appendChild(modalContent);

    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(loginButton);
    modal.appendChild(modalFooter);


    const publishButton = document.createElement('button');
    publishButton.className = 'btn waves-effectr';
    publishButton.innerText = 'Publish Visual';
    publishButton.addEventListener('click', () => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.publishConfig();
          $('#login-modal').modal('close');
          console.log('Already logged in');
        } else {
          $('#login-modal').modal('open');
        }
      });
    });

    const downloadButton = document.createElement('button');
    downloadButton.className = 'btn waves-effect';
    downloadButton.innerText = 'Download Config';
    downloadButton.addEventListener('click', () => this.downloadConfig());

    const downloadContainer = document.getElementById(id);
    downloadContainer.appendChild(publishButton);
    downloadContainer.appendChild(downloadButton);
    downloadContainer.appendChild(modal);

    $('.modal').modal();
  }

  async publishConfig() {
    const config = {
      type: this.type,
      dataSet: this.dataSet,
      attributes: this.attributes,
    };

    const db = firebase.firestore();
    await db.collection('configs').add({
      type: config.type,
      dataSet: config.dataSet,
      attributes: JSON.stringify(config.attributes),
    }).then(() => {
      Materialize.toast('Visual Published', 3000);
    })
    .catch((error) => {
      Materialize.toast('Error Publishing Visual', 3000);
      console.error(error);
    });
  }

  downloadConfig() {
    const config = {
      type: this.type,
      dataSet: this.dataSet,
      attributes: this.attributes,
    };

    const downloadButton = document.createElement('a');
    downloadButton.className = 'button';
    downloadButton.innerText = 'Download Config';
    downloadButton.href = `data:text/json;charset=utf-8,${JSON.stringify(config)}`;
    downloadButton.download = `${this.dataSet}-${this.type}-config.json`;
    downloadButton.click();
  }

  disableTransitions() {
    this.useTransitions = false;
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

  async fetchAndRenderWithControls() {
    await this.fetchData();

    this.render();
    this.renderControls();
    this.generateConfigButton();
  }

  async fetchAndRender() {
    await this.fetchData();

    this.render();
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
  *Filters categorical data with the criteria given and returns only data columns which
  *match the given criteria
  */
  filterCategorical(filters, data = this.data) {
    const categoricalData = JSON.parse(JSON.stringify(data));
    for (let i = 0; i < filters.length; i += 1) {
      for (let j = 0; j < categoricalData.length; j += 1) {
        const filterColumn = filters[i].column;
        if (categoricalData[j] !== null && !filters[i].categories.includes(data[j][filterColumn])) {
          delete categoricalData[j];
        }
      }
    }
    return categoricalData;
  }

  /**
  *Filters numerical data with the criteria given and returns only data columns which
  *match the given criteria
  */
  filterNumerical(filters, data = this.data) {
    const numericalData = JSON.parse(JSON.stringify(data));

    for (let i = 0; i < filters.length; i += 1) {
      for (let j = 0; j < this.data.length; j += 1) {
        const filterColumn = filters[i].column;
        const x = this.data[j][filterColumn];
        switch (true) {
          case (filters[i].operation === '='):
            if (numericalData[j] !== null && x !== filters[i].value) {
              delete numericalData[j];
            }
            break;
          case (filters[i].operation === '!='):
            if (numericalData[j] !== null && x === filters[i].value) {
              delete numericalData[j];
            }
            break;
          case (filters[i].operation === '<'):
            if (numericalData[j] !== null && x >= filters[i].value) {
              delete numericalData[j];
            }
            break;
          case (filters[i].operation === '<='):
            if (numericalData[j] !== null && x > filters[i].value) {
              delete numericalData[j];
            }
            break;
          case (filters[i].operation === '>'):
            if (numericalData[j] !== null && x <= filters[i].value) {
              delete numericalData[j];
            }
            break;
          case (filters[i].operation === '>='):
            if (numericalData[j] !== null && x < filters[i].value) {
              delete numericalData[j];
            }
            break;
          default:
            break;
        }
      }
    }
    return numericalData;
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
  makeBin(columnName, binSize, start = 0, theData = this.data, maxBins = 100) {
    const binData = JSON.parse(JSON.stringify(theData));
    const binArray = [];
    for (let i = 0; i <= maxBins; i += 1) {
      const first = Math.round((start + (i * binSize)) * 100) / 100;
      const second = Math.round((start + ((i + 1) * binSize)) * 100) / 100;
      binArray[i] = `${first}-${second}`;
    }
    for (let j = 0; j < theData.length; j += 1) {
      const binVal = Math.floor((this.data[j][columnName] / binSize) - start);
      binData[j][columnName] = binArray[binVal];
    }
    return binData;
  }
  /**
  *Takes a colmnName and returns the lowest value in it numerically
  */
  getMin(columnName) {
    let minVal = this.data[0][columnName];
    for (let i = 1; i < this.data.length; i += 1) {
      if (this.data[i][columnName] !== '' && minVal > this.data[i][columnName]) {
        minVal = this.data[i][columnName];
      }
    }
    return minVal;
  }

  /* Input: A list of selections (columns to group by), and the data objects (rows)
   * Output: A nested list of lists (n levels deep where n is the number of
   * selection columns in the input)
   */
  static groupByMultiple(selections, data) {
    const groups = Visual.groupBy(selections.shift(), data);
    return Visual.groupByMultipleHelper(selections, groups);
  }

  static groupByMultipleHelper(selections, groups) {
    if (selections.length === 0) {
      return groups;
    }
    const selection = selections.shift();
    const groupNames = Object.keys(groups);
    for (let i = 0; i < groupNames.length; i += 1) {
      const currentGroupName = groupNames[i];
      const currentGroup = groups[currentGroupName];
      groups[currentGroupName] = Visual.groupBy(selection, currentGroup);
      if (selections.length > 0) {
        groups[currentGroupName] =
          Visual.groupByMultipleHelper(selections.slice(), groups[currentGroupName]);
      }
    }
    return groups;
  }

  static groupBy(selection, data = this.data) {
    const groups = {};
    for (let i = 0; i < data.length; i += 1) {
      const groupNames = Object.keys(groups);
      const currentData = data[i];
      const currentDataGroup = currentData[selection];
      if (!groupNames.includes(currentDataGroup)) {
        groups[currentDataGroup] = [];
      }
      groups[currentDataGroup].push(currentData);
    }
    return groups;
  }


}

Visual.DEFAULT_RENDER_ID = 'visual';
Visual.DEFAULT_RENDER_CONTROLS_ID = 'controls';

export default Visual;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["render", "renderControls"] }] */
import Loader from './Loader';
import Data from './Data';

/**
 * Abstract class that all other Charts will inherit from
 */
class Visual {
  constructor(config, renderID = Visual.DEFAULT_RENDER_ID,
    renderControlsID = Visual.DEFAULT_RENDER_CONTROLS_ID) {
    if (new.target === Visual) { // Ensures that this class is Abstract
      throw new TypeError('Cannot construct Visual instances directly');
    }

    this.renderID = renderID;
    this.renderControlsID = renderControlsID;
    this.dataSet = config.dataSet;
    this.data = [];
    this.attributes = config.attributes;
    this.type = config.type;
    this.editmode = false;

    this.useTransitions = true;
  }

  /**
   * Sets the Visual's data using the given data, then calls onLoadData()
   *
   * @param data
   */
  loadStaticData(data) {
    this.data = data;
    this.onLoadData();
  }

  /**
   * Loads data set indicated by this.dataSet, displays Loader while waiting in the container
   * specified by this.renderID
   *
   * @returns {Promise<void>}
   */
  async fetchData() {
    let loader = null;
    let container = null;
    if (this.renderID) {
      loader = new Loader(this.renderID);
      container = document.getElementById(this.renderID);
      if (container) {
        loader.render();
      }
    }
    await Data.fetchData(this.dataSet, (data) => {
      this.data = data;
      if (container) {
        loader.remove();
      }
      this.onLoadData();
    });
  }

  /**
   * Sets useTransitions attribute to false
   */
  disableTransitions() {
    this.useTransitions = false;
  }

  /**
   * Empties the indicated page element
   *
   * @param id ID of the container to clear
   */
  static empty(id) {
    document.getElementById(id).innerHTML = '';
  }

  /**
   * Adds all items from defaults to this.attributes, unless a value is already there. It also
   * checks for sub-objects and their keys as well
   *
   * @param {Object} defaults Contains default attributes
   */
  applyDefaultAttributes(defaults) {
    const keys = Object.keys(defaults);
    for (let i = 0; i < keys.length; i += 1) {
      if (Object.prototype.hasOwnProperty.call(defaults, keys[i])) {
        if (defaults[keys[i]] === Object(defaults[keys[i]])) {
          const subKeys = Object.keys(defaults[keys[i]]);
          if (!this.attributes[keys[i]]) {
            this.attributes[keys[i]] = defaults[keys[i]];
          } else {
            for (let j = 0; j < subKeys.length; j += 1) {
              if (!Object.prototype.hasOwnProperty.call(this.attributes[keys[i]], subKeys[j])) {
                this.attributes[keys[i]][subKeys[j]] = defaults[keys[i]][subKeys[j]];
              }
            }
          }
        } else if (!Object.prototype.hasOwnProperty.call(this.attributes, keys[i])) {
          this.attributes[keys[i]] = defaults[keys[i]];
        }
      }
    }
  }

  /**
   * Fetches data, then calls render() and renderControls()
   *
   * @returns {Promise<void>}
   */
  async fetchAndRenderWithControls() {
    await this.fetchData();

    this.render();
    this.renderControls();
  }

  /**
   * Fetches data, then calls render()
   *
   * @returns {Promise<void>}
   */
  async fetchAndRender() {
    await this.fetchData();

    this.render();
  }

  /**
   * Filters data with null, undefined, and blank key attributes
   *
   * @param data Data to filter
   */
  static hideEmpty(data) {
    return data.filter(d => d.key !== null &&
      d.key !== undefined &&
      d.key !== '' &&
      (!String(d.key) ||
        (String(d.key).toLowerCase() !== 'null' &&
          String(d.key).toLowerCase() !== 'undefined')));
  }

  /**
   * Abstract method
   */
  onLoadData() {
    if (this.constructor === Visual) {
      throw new Error('Visual is an abstract class and cannot be instantiated');
    }
  }

  /**
   * Abstract method for rendering controls for the desired visual
   */
  renderControls() {
    if (this.constructor === Visual) {
      throw new Error('Visual is an abstract class and cannot be instantiated');
    }
  }

  /**
   * Abstract method for rendering the desired visual
   */
  render() {
    if (this.constructor === Visual) {
      throw new Error('Visual is an abstract class and cannot be instantiated');
    }
  }

  // DATA HELPER FUNCTIONS

  /**
   * Checks the columns of this.data and returns them in an array
   *
   * @returns {String[]} Array of all keys, or empty array if there is no data
   */
  getColumns() {
    if (this.data.length > 0) {
      return Object.keys(this.data[0]);
    }
    return [];
  }

  /**
   * Groups the input data based on the given column name
   *
   * @param {string} columnName name of column to check
   * @param {Object[]} inputData Full list of data
   * @returns {Array} Array of Objects that each contain 'key', which is the value in the designated
   *                  column, and 'value', which is an Object[] that contains all data with that key
   */
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

  /**
   * Counts the input data based on the given column name
   *
   * @param {string} columnName name of column to check
   * @param {Object[]} inputData Full list of data
   * @returns {Array} Array of Objects that contain a key (which is the value in the designated
   *                  column, and a value, which is an number of data that fit the category
   */
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
  getNumericData(maxCategories = 25, data = this.data) {
    const dataKeys = Object.keys(data[0]);
    const numericData = JSON.parse(JSON.stringify(data));
    for (let i = 0; i < dataKeys.length; i += 1) {
      const groupedList = this.getGroupedList(dataKeys[i], data);
      if (groupedList.length < maxCategories
       || isNaN(data[0][dataKeys[i]])) {
        for (let j = 0; j < data.length; j += 1) {
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
  getCategoricalData(maxCategories = 25, data = this.data) {
    const dataKeys = Object.keys(data[0]);
    const categoricalData = JSON.parse(JSON.stringify(data));
    for (let i = 0; i < dataKeys.length; i += 1) {
      const groupedList = this.getGroupedList(dataKeys[i], data);
      if (groupedList.length >= maxCategories) {
        for (let j = 0; j < data.length; j += 1) {
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
      if (filters[i].categories.length !== 0) {
        for (let j = 0; j < categoricalData.length; j += 1) {
          const filterColumn = filters[i].column;
          if (categoricalData[j] !== null &&
            !filters[i].categories.includes(data[j][filterColumn])) {
            delete categoricalData[j];
          }
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
      for (let j = 0; j < data.length; j += 1) {
        const filterColumn = filters[i].column;
        if (data[j] !== null && data[j] !== undefined
          && filterColumn !== null && filterColumn !== undefined) {
          const x = Number(data[j][filterColumn]);
          const y = Number(filters[i].value);
          switch (true) {
            case (filters[i].operation === '='):
              if (numericalData[j] !== null && x !== y) {
                delete numericalData[j];
              }
              break;
            case (filters[i].operation === '!='):
              if (numericalData[j] !== null && x === y) {
                delete numericalData[j];
              }
              break;
            case (filters[i].operation === '<'):
              if (numericalData[j] !== null && x >= y) {
                delete numericalData[j];
              }
              break;
            case (filters[i].operation === '<='):
              if (numericalData[j] !== null && x > y) {
                delete numericalData[j];
              }
              break;
            case (filters[i].operation === '>'):
              if (numericalData[j] !== null && x <= y) {
                delete numericalData[j];
              }
              break;
            case (filters[i].operation === '>='):
              if (numericalData[j] !== null && x < y) {
                delete numericalData[j];
              }
              break;
            default:
              break;
          }
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

  static groupByMultipleHelper(selections, groupsCollection) {
    const groups = groupsCollection;
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

  static groupBy(selection, data) {
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

  renderBasicControls(editor) {
    editor.createTextField('title-input', 'Title', (e) => {
      this.attributes.title = e.currentTarget.value;
      this.renderBasics();
    }, this.attributes.title);

    editor.createTextField('description-input', 'Description', (e) => {
      this.attributes.description = e.currentTarget.value;
      this.renderBasics();
    }, this.attributes.description);
  }

  renderBasics() {
    const visual = document.getElementById(this.renderID);

    let title = document.querySelector(`#${this.renderID} .visual-title`);
    if (title && this.attributes.title) {
      title.innerText = this.attributes.title;
    } else if (!title && this.attributes.title) {
      title = document.createElement('h3');
      title.className = 'visual-title';
      title.innerText = this.attributes.title;
      visual.insertBefore(title, visual.childNodes[0]);
    } else if (title) {
      visual.removeChild(title);
    }

    let description = document.querySelector(`#${this.renderID} .visual-description`);
    if (description && this.attributes.description) {
      description.innerText = this.attributes.description;
    } else if (!description && this.attributes.description) {
      description = document.createElement('p');
      description.className = 'visual-description';
      description.innerText = this.attributes.description;
      visual.appendChild(description);
    } else if (description) {
      visual.removeChild(description);
    }
  }
  renderKey(data, on) {
    if (on === 1) {
      const fiveArray = [0, 0, 0, 0, 0];
      const longBoi = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let yInt = 0;
      let colNum = 0;

      d3.select('#key')
        .append('svg')
        .attr('class', 'keySVG')
        .attr('id', 'keySVG')
        .attr('width', `${document.getElementById('key').clientWidth}`)
        .attr('height', `${document.getElementById('key').clientHeight}`);

      const legend = d3.select('#key > svg')
        .append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .style('fill', '#FFFFFF')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', (d) => {
          const y = (yInt * 25);
          const x = (longBoi.reduce((a, b) => a + b) * 30);
          fiveArray[yInt] = d.data.key;

          if (yInt === 4) {
            for (let j = 0; j < 5; j += 1) {
              if (fiveArray[j].length >= longBoi[colNum]) {
                longBoi[colNum] = fiveArray[j].length;
              }
              fiveArray[j] = 0;
            }
            colNum += 1;
          }
          yInt += 1;
          if (yInt === 5) {
            yInt = 0;
          }

          return `translate(${x},${y})`;
        });

      legend.append('rect')
        .attr('x', 20)
        .attr('y', 15)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', d => this.attributes.items[d.data.key].color);

      legend.append('text')
        .attr('x', 50)
        .attr('y', 25)
        .attr('dy', '0.32em')
        .style('font-size', '18px')
        .text(d => (d === '' ? 'NULL' : d.data.key));

      document.getElementById('key').style.outline = '4px solid #FFFFFF';
    } else {
      document.getElementById('key').style.outline = '';
    }
  }
}

Visual.DEFAULT_RENDER_ID = 'visual';
Visual.DEFAULT_RENDER_CONTROLS_ID = 'controls';

export default Visual;

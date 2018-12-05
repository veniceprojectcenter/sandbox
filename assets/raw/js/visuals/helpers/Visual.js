/* eslint class-methods-use-this: ["error", { "exceptMethods": ["render", "renderControls"] }] */
import Loader from './Loader';
import Data from './Data';
import EditorGenerator from './EditorGenerator';
import ColorHelper from './ColorHelper';

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
    this.renderBasics();
    this.renderKey();
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
   * @param {Object[]} data Data to filter
   * @return {Object[]} Filtered data
   */
  static hideEmpty(data) {
    const emptyFilter = d => d.key !== null &&
      d.key !== undefined &&
      d.key !== '' &&
      (!String(d.key) ||
        (String(d.key).toLowerCase() !== 'null' &&
          String(d.key).toLowerCase() !== 'undefined'));

    const newData = data.slice();
    return newData.filter(emptyFilter).map((item) => {
      if (!item.subitems) {
        return item;
      }
      const newItem = item;
      newItem.subitems = newItem.subitems.filter(emptyFilter);
      return newItem;
    });
  }


  hideEmptyItems() {
    const items = this.attributes.items;
    const keys = Object.keys(this.attributes.items);

    const emptyFilter = d => d !== null &&
      d !== undefined &&
      d !== '' &&
      (!String(d) ||
        (String(d).toLowerCase() !== 'null' &&
          String(d).toLowerCase() !== 'undefined'));

    for (let i = 0; i < keys.length; i += 1) {
      if (!emptyFilter(keys[i])) {
        delete this.attributes.items[keys[i]];
      } else if (items[keys[i]].subitems !== undefined) {
        const subKeys = Object.keys(items[keys[i]].subitems);
        for (let j = 0; j < subKeys.length; j += 1) {
          if (!emptyFilter(subKeys[j])) {
            delete this.attributes.items[keys[i]].subitems[subKeys[j]];
          }
        }
      }
    }
  }

  /**
   * Sorts the data based on weight values if there are any, or ascending order otherwise
   *
   * @param {Object[]} data Sorts the data objects
   * @returns {Object[]} Array of sorted data
   */
  sortData(data) {
    let sortedData = data;
    if (!sortedData || sortedData.length === 0) {
      return [];
    }
    if (sortedData[0].weight) { // Already in order
      sortedData = data.sort((a, b) => {
        if (b.weight === undefined) {
          return 1;
        } else if (a.weight === undefined) {
          return -1;
        }
        return a.weight - b.weight;
      });
    } else { // Fresh sort
      sortedData = data.sort((a, b) => {
        if (a.key < b.key) {
          return -1;
        }
        return 1;
      });
    }
    return sortedData;
  }

  /**
   * Abstract method that applies default attrbibutes and structures data in attributes.items
   */
  onLoadData() {
    if (this.constructor === Visual) {
      throw new Error('Visual is an abstract class and cannot be instantiated');
    }
    this.applyDefaultAttributes({
      width: document.getElementById(Visual.DEFAULT_RENDER_ID).clientWidth,
      height: document.getElementById(Visual.DEFAULT_RENDER_ID).clientWidth,
      dontDefineDimensions: true,
      font_size: 25,
      hide_empty: true,
      legend_mode: 'none',
      color: {
        mode: 'palette',
        colors: [],
        single_color: '#808080',
        start_color: '#CC6633',
        end_color: '#333333',
      },
      font_color: '#FFFFFF',
      items: {}, // Contains objects that specify: key: {weight, color} where
                 // a weight of 0 means first on the donut chart
      label_mode: 'hover',
      title: '',
      description: '',
      x_label: '',
      y_label: '',
      category_order: '',
      aspect_ratio: 1.5,
      group_by: null,
      group_by_stack: 'No Column',
      can_stack: false,
      packed_graph: false,
      x_font_rotation: 45,
      x_font_x_offset: 0,
      x_font_y_offset: 0,
    });
    this.attributes.packed_graph = false;

    /** *** Set items **** */
    // Group the data
    this.structureData();
  }

  /**
   * Uses defined attributes and this.data to populate this.attributes.items with relevant stats
   */
  structureData() {
    let dataRaw = {};
    this.attributes.items = {};
    if (this.attributes.group_by) {
      if (!this.attributes.can_stack || !this.attributes.group_by_stack ||
        this.attributes.group_by_stack === 'No Column') {
        // Single grouping
        dataRaw = Visual.groupBy(this.attributes.group_by, this.data);
      } else {
        // Multiple grouping
        dataRaw = Visual.groupByMultiple([this.attributes.group_by, this.attributes.group_by_stack],
          this.data);
      }
    }

    // Organize the data into {item: {weight, value, color, subitems: {weight, color, value}}
    const cats = Object.keys(dataRaw);
    if (this.attributes.can_stack && this.attributes.group_by_stack &&
      this.attributes.group_by_stack !== 'No Column') {
      let innerCats = [];
      let count = 0;
      for (let i = 0; i < cats.length; i += 1) {
        this.attributes.items[cats[i]] = {};
        this.attributes.items[cats[i]].subitems = {};
        innerCats = Object.keys(dataRaw[cats[i]]);
        for (let j = 0; j < innerCats.length; j += 1) {
          count += dataRaw[cats[i]][innerCats[j]].length;
          this.attributes.items[cats[i]].subitems[innerCats[j]] = {
            value: dataRaw[cats[i]][innerCats[j]].length,
          };
        }
        this.attributes.items[cats[i]].value = count;
      }
    } else {
      for (let i = 0; i < cats.length; i += 1) {
        this.attributes.items[cats[i]] = {
          value: dataRaw[cats[i]].length,
          subitems: undefined,
        };
      }
    }

    // Filter empty
    if (this.attributes.hide_empty) {
      this.hideEmptyItems();
    }

    // Sort data
    this.sortItems();

    // Add color properties
    this.colorItemsByPalette();
  }

  /**
   * Uses start_color and end_color to add colors to this.attributes.items based on the assigned
   * weight attribute. If there are subitems, gives them colors as well.
   * (NOTE: If there are subitems, the outer item colors are invali and should be ignored)
   */
  colorItemsByPalette() {
    const keys = Object.keys(this.attributes.items);
    const subKeys = this.getSubkeys();
    for (let i = 0; i < keys.length; i += 1) {
      if (this.attributes.items[keys[i]].subitems) {
        for (let j = 0; j < subKeys.length; j += 1) {
          if (this.attributes.items[keys[i]].subitems[subKeys[j]]) {
            this.attributes.items[keys[i]].subitems[subKeys[j]].color = ColorHelper.gradientValue(
              this.attributes.items[keys[i]].subitems[subKeys[j]].weight / (subKeys.length - 1),
              this.attributes.color.start_color,
              this.attributes.color.end_color);
          }
        }
      }
      this.attributes.items[keys[i]].color = ColorHelper.gradientValue(
        this.attributes.items[keys[i]].weight / (keys.length - 1),
        this.attributes.color.start_color, this.attributes.color.end_color);
    }
  }

  /**
   * Gives weight attributes to the objects in this.attriutes.items, as well as to the subitems
   */
  sortItems() {
    const sortFunction = (a, b) => d3.ascending(a, b);

    const keys = Object.keys(this.attributes.items);
    const sortedKeys = keys.sort(sortFunction);
    const subKeys = this.getSubkeys();
    const sortedsubKeys = subKeys.sort(sortFunction);

    for (let i = 0; i < sortedKeys.length; i += 1) {
      if (this.attributes.items[sortedKeys[i]].subitems) {
        for (let j = 0; j < sortedsubKeys.length; j += 1) {
          if (this.attributes.items[sortedKeys[i]].subitems &&
              this.attributes.items[sortedKeys[i]].subitems[sortedsubKeys[j]]) {
            this.attributes.items[sortedKeys[i]].subitems[sortedsubKeys[j]].weight = j;
          }
        }
      }
      this.attributes.items[sortedKeys[i]].weight = i;
    }
  }

  /**
   * Returns an array of data objects with value (amount of items in it), weight (sort order), and
   * color based on this.attributes.items
   *
   * @returns {Object[]}
   */
  flattenItems() {
    const keys = Object.keys(this.attributes.items);
    if (!keys || keys.length === 0) {
      return [];
    }
    // I'm sorry to whoever has to figure this out lol
    return this.sortData(keys.map(item => ({ key: item,
      value: this.attributes.items[item].value,
      weight: this.attributes.items[item].weight,
      color: this.attributes.items[item].color,
      subitems: this.attributes.items[item].subitems,
    })));
  }

  /**
   * Gets a list of all of the keys in the subitems of this.attributes.items
   *
   * @returns {string[]} All keys in all subitems
   */
  getSubkeys() {
    const subSet = new Set();
    const keys = Object.keys(this.attributes.items);
    for (let i = 0; i < keys.length; i += 1) {
      if (this.attributes.items[keys[i]].subitems) {
        const subKeys = Object.keys(this.attributes.items[keys[i]].subitems);
        for (let j = 0; j < subKeys.length; j += 1) {
          subSet.add(subKeys[j]);
        }
      }
    }
    const temp = Array.from(subSet);
    return this.sortData(temp.map(a => ({ key: a }))).map(a => a.key);
  }


  /**
   * Abstract method for rendering controls for the desired visuals, used to render the accordion
   */
  renderControls() {
    if (this.constructor === Visual) {
      throw new Error('Visual is an abstract class and cannot be instantiated');
    }

    if (document.getElementById('general-accordion-button')) {
      Visual.empty('general-accordion-body');
      Visual.empty('color-accordion-body');
      Visual.empty('misc-accordion-body');
      this.renderBasicControls();
      return; // Will not recreate this objs, just rerender the interiors
    }

    const controlsContainer = document.getElementById(Visual.DEFAULT_RENDER_CONTROLS_ID);

    const accordion1 = document.createElement('button');
    accordion1.className = 'accordion-button';
    accordion1.textContent = 'General Settings';
    accordion1.id = 'general-accordion-button';
    accordion1.addEventListener('click', (e) => {
      const target = $(e.currentTarget)[0];
      target.removeChild(target.getElementsByTagName('span')[0]);
      const body = document.getElementById('general-accordion-body');
      if (body.style.display === 'block') {
        const caret = document.createElement('span');
        caret.className = 'up-caret';
        caret.innerText = '▼';
        target.appendChild(caret);
        body.style.display = 'none';
      } else {
        const caret = document.createElement('span');
        caret.className = 'up-caret';
        caret.innerText = '▲';
        target.appendChild(caret);
        body.style.display = 'block';
      }
    });
    const caret1 = document.createElement('span');
    caret1.className = 'up-caret';
    caret1.innerText = '▲';
    accordion1.appendChild(caret1);

    const accordionBody1 = document.createElement('div');
    accordionBody1.className = 'accordion-body';
    accordionBody1.id = 'general-accordion-body';
    accordionBody1.style.display = 'block';

    const accordion2 = document.createElement('button');
    accordion2.className = 'accordion-button';
    accordion2.textContent = 'Color Settings';
    accordion2.id = 'color-accordion-button';
    accordion2.addEventListener('click', (e) => {
      const target = $(e.currentTarget)[0];
      target.removeChild(target.getElementsByTagName('span')[0]);
      const body = document.getElementById('color-accordion-body');
      if (body.style.display === 'block') {
        const caret = document.createElement('span');
        caret.className = 'up-caret';
        caret.innerText = '▼';
        target.appendChild(caret);
        body.style.display = 'none';
      } else {
        const caret = document.createElement('span');
        caret.className = 'up-caret';
        caret.innerText = '▲';
        target.appendChild(caret);
        body.style.display = 'block';
      }
    });
    const caret2 = document.createElement('span');
    caret2.className = 'down-caret';
    caret2.innerText = '▼';
    accordion2.appendChild(caret2);

    const accordionBody2 = document.createElement('div');
    accordionBody2.className = 'accordion-body';
    accordionBody2.id = 'color-accordion-body';
    accordionBody2.style.display = 'none';

    const accordion3 = document.createElement('button');
    accordion3.className = 'accordion-button';
    accordion3.textContent = 'Other Settings';
    accordion3.id = 'misc-accordion-button';
    accordion3.addEventListener('click', (e) => {
      const target = $(e.currentTarget)[0];
      target.removeChild(target.getElementsByTagName('span')[0]);
      const body = document.getElementById('misc-accordion-body');
      if (body.style.display === 'block') {
        const caret = document.createElement('span');
        caret.className = 'up-caret';
        caret.innerText = '▼';
        target.appendChild(caret);
        body.style.display = 'none';
      } else {
        const caret = document.createElement('span');
        caret.className = 'up-caret';
        caret.innerText = '▲';
        target.appendChild(caret);
        body.style.display = 'block';
      }
    });
    const caret3 = document.createElement('span');
    caret3.className = 'down-caret';
    caret3.innerText = '▼';
    accordion3.appendChild(caret3);

    const accordionBody3 = document.createElement('div');
    accordionBody3.className = 'accordion-body';
    accordionBody3.id = 'misc-accordion-body';
    accordionBody3.style.display = 'none';

    document.getElementById('graphTitle').style.visibility = 'visible';
    controlsContainer.appendChild(accordion1);
    controlsContainer.appendChild(accordionBody1);
    controlsContainer.appendChild(accordion2);
    controlsContainer.appendChild(accordionBody2);
    controlsContainer.appendChild(accordion3);
    controlsContainer.appendChild(accordionBody3);

    this.renderBasicControls();
  }

  /**
   * Abstract method for rendering the desired visual, returns false if there is nothing to render
   *
   * @return {boolean} False if there is no data to render, true otherwise
   */
  render() {
    if (this.constructor === Visual) {
      throw new Error('Visual is an abstract class and cannot be instantiated');
    }

    if (!this.attributes.group_by || !this.data ||
      !Object.keys(this.data[0]).includes(this.attributes.group_by)) {
      this.attributes.group_by = null;
      return false;
    }

    Visual.empty(this.renderID);

    return true;
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

  renderBasicControls() {
    const generalEditor = new EditorGenerator(document.getElementById('general-accordion-body'));
    const colorEditor = new EditorGenerator(document.getElementById('color-accordion-body'));

    // Populate General Settings
    generalEditor.createTextField('title-input', 'Title', (e) => {
      this.attributes.title = e.currentTarget.value;
      this.renderBasics();
      if (this.type === 'Bubble Chart') {
        this.render();
      }
    }, this.attributes.title);

    generalEditor.createTextField('description-input', 'Description', (e) => {
      this.attributes.description = e.currentTarget.value;
      this.renderBasics();
      if (this.type === 'Bubble Chart') {
        this.render();
      }
    }, this.attributes.description);

    const dataCats = [];
    const dataCatsRaw = Object.keys(this.data[0]); // TODO: better filtering??????????????????????????
    for (let i = 0; i < dataCatsRaw.length; i += 1) {
      dataCats.push({ value: dataCatsRaw[i], text: dataCatsRaw[i] });
    }
    generalEditor.createSelectBox('column-select', 'Select data to display', dataCats, this.attributes.group_by,
      (e) => {
        this.attributes.group_by = $(e.currentTarget).val();
        this.structureData();
        this.renderKey();
        this.render();
      });

    generalEditor.createNumberField('font-size', 'Font Size',
      (e) => {
        let value = $(e.currentTarget).val();
        if (value === '') {
          value = 10;
        } else if (Number(value) < 1) {
          e.currentTarget.value = '1';
          value = 1;
        } else if (Number(value) > 100) {
          e.currentTarget.value = '100';
          value = 100;
        }
        this.attributes.font_size = `${value}`;
        this.renderKey();
        this.render();
      }, this.attributes.font_size);

    generalEditor.createCheckBox('hide-empty', 'Hide Empty Category', this.attributes.hide_empty,
      (e) => {
        this.attributes.hide_empty = e.currentTarget.checked;
        this.structureData();
        this.renderKey();
        this.render();
      });

    const dogs = [
      { value: 'below', text: 'Below' },
      { value: 'above', text: 'Above' },
      { value: 'left', text: 'Left' },
      { value: 'right', text: 'Right' },
      { value: 'none', text: 'None' }];
    generalEditor.createSelectBox('drop-showlegend', 'Show Legend', dogs, this.attributes.legend_mode, (e) => {
      this.attributes.legend_mode = $(e.currentTarget).val();
      this.renderKey();
      this.render();
    });

    if (this.attributes.can_stack && (this.attributes.group_by_stack === 'No Column')) {
      this.attributes.legend_mode = 'none';
      document.getElementById('drop-showlegend').style.display = 'none';
    } else {
      document.getElementById('drop-showlegend').style.display = 'block';
    }

    // Populate Color Settings
    colorEditor.createColorField('font-color', 'Font Color', this.attributes.font_color,
      (e) => {
        this.attributes.font_color = $(e.currentTarget).val();
        this.render();
      });

    const colorCats = [];
    switch (this.type) {
      case 'Donut Chart':
        colorCats.push({ value: 'palette', text: 'Palette Mode' });
        colorCats.push({ value: 'manual', text: 'Manual Mode' });
        break;
      case 'Bubble Chart':
        colorCats.push({ value: 'palette', text: 'Palette Mode' });
        colorCats.push({ value: 'manual', text: 'Manual Mode' });
        colorCats.push({ value: 'single', text: 'Single Color' });
        break;
      case 'Bar Chart':
        colorCats.push({ value: 'palette', text: 'Palette Mode' });
        break;
      default:
        break;
    }

    colorEditor.createSelectBox('color-select', 'Select Coloring Mode', colorCats, this.attributes.color.mode,
      (e) => {
        this.attributes.color.mode = $(e.currentTarget).val();
        this.renderControls();
        this.render();
      });

    if (this.attributes.color.mode === 'palette') {
      colorEditor.createColorField('grad-start', 'Select Palette Start', this.attributes.color.start_color,
        (e) => {
          this.attributes.color.start_color = $(e.currentTarget)
          .val();
          this.render();
        });

      colorEditor.createColorField('grad-end', 'Select Palette End', this.attributes.color.end_color,
        (e) => {
          this.attributes.color.end_color = $(e.currentTarget)
          .val();
          this.render();
        });
    } else if (this.attributes.color.mode === 'single') {
      colorEditor.createColorField('single-color-picker', 'Select Color',
        this.attributes.color.single_color, (e) => {
          this.attributes.color.single_color = $(e.currentTarget)
          .val();
          this.render();
        });
    }
  }

  /**
   * Renders the title and description
   */
  renderBasics() {
    const column = document.getElementById('column2');

    if (this.attributes.title) {
      if (!(document.getElementById('visual-title'))) {
        const title = document.createElement('p');
        title.className = 'visual-title';
        title.id = 'visual-title';
        title.style.fontSize = `${(this.attributes.font_size * 2)}pt`;
        title.style.fill = `${this.attributes.font_color}`;
        title.style.color = `${this.attributes.font_color}`;
        title.innerText = this.attributes.title;
        column.insertBefore(title, column.childNodes[0]);
      } else if (document.getElementById('visual-title')) {
        const title = document.getElementById('visual-title');
        title.style.fontSize = `${(this.attributes.font_size * 2)}pt`;
        title.style.fill = `${this.attributes.font_color}`;
        title.style.color = `${this.attributes.font_color}`;
        title.innerText = this.attributes.title;
      }
    } else if (document.getElementById('visual-title')) {
      column.removeChild(document.getElementById('visual-title'));
    }

    if (this.attributes.description) {
      if (!(document.getElementById('visual-description'))) {
        const description = document.createElement('p');
        description.className = 'visual-description';
        description.id = 'visual-description';
        description.style.fontSize = `${this.attributes.font_size}pt`;
        description.style.fill = `${this.attributes.font_color}`;
        description.style.color = `${this.attributes.font_color}`;
        description.innerText = this.attributes.description;
        column.appendChild(description);
      } else if (document.getElementById('visual-description')) {
        const description = document.getElementById('visual-description');
        description.style.fontSize = `${this.attributes.font_size}pt`;
        description.style.fill = `${this.attributes.font_color}`;
        description.style.color = `${this.attributes.font_color}`;
        description.innerText = this.attributes.description;
      }
    } else if (document.getElementById('visual-description')) {
      column.removeChild(document.getElementById('visual-description'));
    }
  }

  hoverTextHelper(input) {
    const tempString3ReturnoftheArray = [];
    if (this.lengthinPX(input)[0] >= (document.getElementById('visual').clientWidth * 0.4)) {
      const tempString = input.split(' ');
      let tempString2ElectricBoogaloo = `${tempString[0]} `;
      for (let j = 1; j < tempString.length; j += 1) {
        if (((this.lengthinPX((tempString2ElectricBoogaloo + tempString[j]))[0]) + 10)
            >= (document.getElementById('visual').clientWidth * 0.4)) {
          tempString3ReturnoftheArray.push(tempString2ElectricBoogaloo);
          tempString2ElectricBoogaloo = `${tempString[j]} `;
        } else {
          tempString2ElectricBoogaloo += `${tempString[j]} `;
        }
      }
      if (tempString3ReturnoftheArray[tempString3ReturnoftheArray.length - 1]
        !== tempString2ElectricBoogaloo) {
        tempString3ReturnoftheArray.push(tempString2ElectricBoogaloo);
      }
    } else {
      tempString3ReturnoftheArray[0] = input;
    }
    return tempString3ReturnoftheArray;
  }

  hoverTextDisplay(svg, section, translateArray) {
    const bigThis = this;
    const mouseOver = function (d) {
      const boundBox = document.getElementById('svgBox').getBoundingClientRect();
      const coords = [d3.event.pageX - boundBox.x, d3.event.pageY - boundBox.y];

      let outline = '#FFFFFF';
      if (ColorHelper.isLight(bigThis.attributes.font_color)) {
        outline = '#000000';
      }

      d3.select('#tooltip')
          .remove();

      d3.select(this)
          .attr('fill-opacity', '0.8');

      const textBox = svg.append('text')
          .attr('id', 'tooltip')
          .attr('class', 'hovertext')
          .each(function () {
            const textArray = bigThis.hoverTextHelper(d.data.key);
            const text = d3.select(this)
              .attr('dy', '0em')
              .style('font-size', `${bigThis.attributes.font_size}pt`)
              .style('fill', `${bigThis.attributes.font_color}`)
              .style('color', `${bigThis.attributes.font_color}`)
              .style('stroke', `${outline}`)
              .style('stroke-width', '0.025em')
              .style('stroke-linejoin', 'round')
              .text(textArray[0]);
            for (let i = 1; i < textArray.length; i += 1) {
              text.append('tspan')
                .attr('x', '0')
                .attr('dy', '1em')
                .style('font-size', `${bigThis.attributes.font_size}pt`)
                .style('fill', `${bigThis.attributes.font_color}`)
                .style('color', `${bigThis.attributes.font_color}`)
                .style('stroke', `${outline}`)
                .style('stroke-width', '0.025em')
                .style('stroke-linejoin', 'round')
                .text(textArray[i]);
            }
          });

      if (coords[0] > boundBox.width / 2) {
        textBox.attr('transform', `translate(${(coords[0] - 5) - translateArray[0]} ${coords[1] - translateArray[1]})`)
            .attr('text-anchor', 'end');
      } else {
        textBox.attr('transform', `translate(${(coords[0] + 5) - translateArray[0]} ${coords[1] - translateArray[1]})`)
            .attr('text-anchor', 'start');
      }
    };

    const mouseOut = function () {
      d3.select(this)
          .attr('fill-opacity', 1);

      d3.select('#tooltip')
          .remove();
    };

    section.on('mousemove', mouseOver)
        .on('mouseout', mouseOut);
  }

  /**
   * gets the length of any string in pixels
   * @param string inputed string
   * @returns {number[]} length
   */
  lengthinPX(string) {
    const ruler = document.createElement('span');
    ruler.style.display = 'inline-block';
    ruler.style.whiteSpace = 'nowrap';
    ruler.innerHTML = `<p style = 'display: flex; margin: 0 0 0 0; font-size: ${this.attributes.font_size}pt'>${string}</p>`;
    document.getElementById('visual').appendChild(ruler);
    const final = [ruler.clientWidth, ruler.clientHeight];
    document.getElementById('visual').removeChild(ruler);
    return final;
  }

  /** helps the key convert the data into an array
   *
   * @param data the data
   * @returns {Array}
   */
  keyDataHelper(data) {
    const textArray = [];
    const heightofTXT = this.lengthinPX('W')[1];
    for (let i = 0; i < data.length; i += 1) {
      if ((this.lengthinPX(data[i])[0] + (heightofTXT * 1.35)) >= document.getElementById('key').clientWidth) {
        const tempString = data[i].split(' ');
        let tempString2ElectricBoogaloo = `${tempString[0]} `;
        const tempString3ReturnoftheArray = [];
        for (let j = 1; j < tempString.length; j += 1) {
          if (((this.lengthinPX((tempString2ElectricBoogaloo + tempString[j]))[0])
            + (heightofTXT * 1.35) + 10) >= document.getElementById('key').clientWidth) {
            tempString3ReturnoftheArray.push(tempString2ElectricBoogaloo);
            tempString2ElectricBoogaloo = `${tempString[j]} `;
          } else {
            tempString2ElectricBoogaloo += `${tempString[j]} `;
          }
        }
        if (tempString3ReturnoftheArray[tempString3ReturnoftheArray.length - 1]
          !== tempString2ElectricBoogaloo) {
          tempString3ReturnoftheArray.push(tempString2ElectricBoogaloo);
        }
        for (let j = 0; j < tempString3ReturnoftheArray.length; j += 1) {
          textArray.push(tempString3ReturnoftheArray[j]);
        }
      } else {
        textArray.push(data[i]);
      }
    }
    return textArray;
  }

  removeDuplicates(inputArray) {
    const seenObj = {};
    const finalArray = [];
    let iter = 0;
    for (let i = 0; i < inputArray.length; i += 1) {
      if (seenObj[inputArray[i]] !== 1) {
        seenObj[inputArray[i]] = 1;
        finalArray[iter] = inputArray[i];
        iter += 1;
      }
    }
    return finalArray;
  }
  /**
   * renders the key
   */
  renderKey() {
    if (this.attributes.legend_mode === 'below') {
      document.getElementById('key').style.display = 'block';
      document.getElementById('key').innerHTML = '';
      document.getElementById('key').style.width = '100%';
      document.getElementById('key').style.height = '15%';
      document.getElementById('visualColumn').style.flexDirection = 'column';

      document.getElementById('visual').style.margin = '1% 1% 2% 1%';
      document.getElementById('visual').style.width = '100%';
      document.getElementById('visual').style.height = '85%';
    } else if (this.attributes.legend_mode === 'above') {
      document.getElementById('key').style.display = 'block';
      document.getElementById('key').innerHTML = '';
      document.getElementById('key').style.width = '100%';
      document.getElementById('key').style.height = '15%';
      document.getElementById('visualColumn').style.flexDirection = 'column-reverse';

      document.getElementById('visual').style.margin = '2% 1% 1% 1%';
      document.getElementById('visual').style.width = '96%';
      document.getElementById('visual').style.height = '85%';
    } else if (this.attributes.legend_mode === 'left') {
      document.getElementById('key').style.display = 'block';
      document.getElementById('key').innerHTML = '';
      document.getElementById('key').style.width = '25%';
      document.getElementById('key').style.height = '95%';
      document.getElementById('visualColumn').style.flexDirection = 'row-reverse';

      document.getElementById('visual').style.margin = '1% 1% 2% 1%';
      document.getElementById('visual').style.width = '71%';
      document.getElementById('visual').style.height = '100%';
    } else if (this.attributes.legend_mode === 'right') {
      document.getElementById('key').style.display = 'block';
      document.getElementById('key').innerHTML = '';
      document.getElementById('key').style.width = '25%';
      document.getElementById('key').style.height = '95%';
      document.getElementById('visualColumn').style.flexDirection = 'row';

      document.getElementById('visual').style.margin = '1% 1% 2% 1%';
      document.getElementById('visual').style.width = '71%';
      document.getElementById('visual').style.height = '100%';
    } else {
      document.getElementById('key').style.display = 'none';
      document.getElementById('visual').style.width = '96%';
      document.getElementById('visual').style.height = '96%';
      document.getElementById('key').style.outline = '';
      document.getElementById('key').innerHTML = '';
      return;
    }
    const heightofTXT = this.lengthinPX('W')[1];
    let keyArray = this.flattenItems().map(a => a.key);
    let itemObj = this.attributes.items;
    let textArray = this.keyDataHelper(keyArray);
    let colNum = 0;
    let rowTotal = 0;
    let textIterator = -1;
    let colorIter1 = 0;
    let colorIter2 = 0;

    if (!this.attributes.group_by || (this.attributes.group_by_stack === 'No Column' && this.attributes.can_stack)) {
      document.getElementById('key').style.display = 'none';
      document.getElementById('visual').style.width = '96%';
      document.getElementById('visual').style.height = '96%';
      document.getElementById('key').style.outline = '';
      document.getElementById('key').innerHTML = '';
      return;
    }

    if (this.attributes.group_by_stack !== 'No Column' && this.attributes.can_stack) {
      const tempArray = [];
      const tempObj = {};
      for (let i = 0; i < keyArray.length; i += 1) {
        if (this.attributes.items[keyArray[i]].subitems !== undefined) {
          const subKeys = Object.keys(this.attributes.items[keyArray[i]].subitems);
          for (let j = 0; j < subKeys.length; j += 1) {
            tempArray.push(subKeys[j]);
            tempObj[subKeys[j]] = this.attributes.items[keyArray[i]].subitems[subKeys[j]];
          }
        }
      }
      itemObj = tempObj;
      keyArray = this.sortData(this.removeDuplicates(tempArray));
      textArray = this.keyDataHelper(keyArray);
    }

    const svgBox = d3.select('#key')
      .append('svg')
      .attr('class', 'keySVG')
      .attr('id', 'keySVG')
      .attr('width', `${document.getElementById('key').clientWidth}`);

    const legend = d3.select('#key > svg')
      .append('g')
      .selectAll('g')
      .data(textArray)
      .enter()
      .append('g')
      .attr('transform', () => {
        let x = 0;
        let y = 0;
        textIterator += 1;
        if (((rowTotal + this.lengthinPX(textArray[textIterator])[0] + (heightofTXT * 1.35)) + 10) >= document.getElementById('key').clientWidth) {
          if (textIterator > 0) {
            colNum += 1;
          }
          y = (colNum * (heightofTXT + 7));
          x = 0;
          rowTotal = this.lengthinPX(textArray[textIterator])[0] + (heightofTXT * 1.35);
        } else {
          y = (colNum * (heightofTXT + 7));
          x = rowTotal;
          rowTotal += this.lengthinPX(textArray[textIterator])[0] + (heightofTXT * 1.35);
        }
        return `translate(${x},${y})`;
      });
      /*
      .on('click', function() {
        const tempKeys = Object.keys(bigThis.attributes.items);
        for (let i = 0; i < tempKeys.length; i += 1) {
          if ((tempKeys[i].replace(/^\s+|\s+$/g, '')).startsWith(this.textContent.replace(/^\s+|\s+$/g, ''))) {
            bigThis.attributes.current_edit = tempKeys[i];
          }
        }
        this.style.outline = '2px solid #FFFFFF';
        //console.log(this.textContent);
      });
      */

    textIterator = -1;
    svgBox.attr('height', `${((colNum + 1) * (heightofTXT + 7)) + (heightofTXT * 0.3)}`);

    legend.append('rect')
      .attr('x', (heightofTXT / 2))
      .attr('y', (heightofTXT / 4))
      .attr('width', (heightofTXT / 1.6))
      .attr('height', (heightofTXT / 1.6))
      .attr('fill', () => {
        let tempString = '';
        textIterator += 1;
        if (textArray.length !== keyArray.length) {
          if (keyArray[colorIter2] === undefined) {
            colorIter1 += 1;
            return '#000000';
          }
          if (textArray[colorIter1] !== keyArray[colorIter2]) {
            if ((keyArray[colorIter2].replace(/^\s+|\s+$/g, '')).startsWith((textArray[colorIter1]).replace(/^\s+|\s+$/g, ''))) {
              tempString = keyArray[colorIter2];
              colorIter1 += 1;
              colorIter2 += 1;
              return itemObj[tempString].color;
            }
            colorIter1 += 1;
            return '#000000';
          }
          tempString = textArray[colorIter1];
          colorIter1 += 1;
          colorIter2 += 1;
          return itemObj[tempString].color;
        }
        return itemObj[(textArray[textIterator]).trim()].color;
      });

    textIterator = -1;

    legend.append('text')
      .attr('x', (heightofTXT * 1.32))
      .attr('y', (heightofTXT * 0.60))
      .attr('dy', '0.32em')
      .style('font-size', `${this.attributes.font_size}pt`)
      .style('fill', `${this.attributes.font_color}`)
      .style('color', `${this.attributes.font_color}`)
      .text(() => {
        textIterator += 1;
        return textArray[textIterator];
      });

    document.getElementById('key').style.outline = '4px solid #FFFFFF';
  }
}

Visual.DEFAULT_RENDER_ID = 'visual';
Visual.DEFAULT_RENDER_CONTROLS_ID = 'controls';

export default Visual;

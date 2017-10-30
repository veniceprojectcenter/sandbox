/* eslint class-methods-use-this: ["error", { "exceptMethods": ["render"] }] */

class Visual {

  constructor(config) {
    this.data = Visual.fetchData(config.data);
    this.attributes = config.attributes;
  }

  static fetchData(dataName) {
    return [{ id: 1, color: 'pink' },
            { id: 2, color: 'pink' },
            { id: 3, color: 'green' },
            { id: 4, color: 'green' },
            { id: 5, color: 'red' },
            { id: 6, color: 'red' },
            { id: 7, color: 'red' },
            { id: 8, color: 'red' },
            { id: 9, color: 'blue' },
            { id: 10, color: 'blue' },
            { id: 11, color: 'blue' },
            { id: 12, color: 'blue' },
            { id: 13, color: 'blue' },
            { id: 14, color: 'blue' },
            { id: 15, color: 'blue' }];
  }

  generateCategoryCountArray(columnName) {
    const results = [];
    for (let i = 0; i < this.data.length; i += 1) {
      const categoryVal = this.data[i][columnName];

      let found = false;
      for (let p = 0; p < results.length; p += 1) {
        if (results[p].key === categoryVal) {
          results[p].value += 1;
          found = true;
          break;
        }
      }

      if (!found) {
        results.push({ key: categoryVal, value: 1 });
      }
    }

    return results;
  }

  renderControls() {
    throw new Error('You must implement this method');
  }

  render() {
    throw new Error('You must implement this method');
  }
}

Visual.RENDER_ID = 'visual';

export default Visual;

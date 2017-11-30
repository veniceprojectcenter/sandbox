
import EditorGenerator from './helpers/EditorGenerator';
import Visual from './helpers/Visual';
import Filter from './helpers/Filter';

class Counter extends Visual {
  constructor(config) {
    super(config);
    this.attributes.columnOptions = null;
    this.attributes.displayColumns = [];
    this.renderData = [];
    this.attributes.filters = [];
    this.filter = new Filter(this);
    this.attributes.aggs = [];
    this.num = 0;
    this.applyDefaultAttributes({
      width: 500,
      height: 500,
      font_size: '2em',
      colors: [],
      category_order: '',
    });
  }
  /** ************************************************************************
    Render Methods
  *************************************************************************** */
  /** Renders Controls
  *
  */
  renderControls() {
    this.attributes.dataFilters = [];
    this.attributes.numericFilters = [];
    this.renderData = JSON.parse(JSON.stringify(this.data));
    this.attributes.columnOptions = Object.keys(this.data[0]);
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    this.renderControlsDiv.innerHTML = '<h4 style = "text-align: center">Controls</h4> <br>';
    this.cats = [];
    const numericCols = Object.keys(this.getNumericData()[0]);
    for (let i = 0; i < numericCols.length; i += 1) {
      this.cats.push({ value: numericCols[i], text: numericCols[i] });
    }
    const aggDiv = document.createElement('div');
    this.renderControlsDiv.appendChild(aggDiv);
    Counter.createAggregationRow(aggDiv, this.cats, 0);
    const myDiv = document.createElement('div');
    this.createAddAggregation(this.renderControlsDiv, aggDiv);
    this.renderControlsDiv.appendChild(myDiv);
    this.filter.makeFilterSeries((a, b) => { this.counterHeader(a, b); }, () => { this.updateRender(); }, 'Generate Numbers', myDiv);
  }

  /** Renders the App section
  *
  */
  render() {
    this.filter.getFilteredData(this.attributes.filters);
    if (this.renderData.length > 0) {
      this.renderData = this.renderData[0];
    }
    this.renderDiv = document.getElementById(this.renderID);
    this.renderDiv.innerHTML = '';
    const svg = document.createElement('svg');
    this.renderDiv.appendChild(svg);
    svg.viewBox = '0 0 500 500';
    if (this.attributes.columnOptions === null) {
      this.columnOptions = [];
    }
    this.displayCount(svg);
  }

  /** Updates app display when actions are taken in controls
  *
  */
  /** Displayes the data table on selected Categories
  *
  */
  displayCount(svg) {
    const renderData = this.renderData;
    let count = 0;
    let sum = 0;
    let text = '';
    for (let i = 0; i < renderData.length; i += 1) {
      if (renderData[i] !== null && renderData[i] !== undefined) {
        count += 1;
      }
    }

    for (let j = 0; j < this.attributes.aggs.length; j += 1) {
      const agg = this.attributes.aggs[j];
      for (let i = 0; i < renderData.length; i += 1) {
        if (renderData[i] !== null && renderData[i] !== undefined
          && !isNaN(renderData[i][agg.column])) {
          sum += Number(renderData[i][agg.column]);
        }
      }
      if (agg.operation === 'Sum') {
        text = document.createElement('text');
        svg.appendChild(text);
        text.innerHTML += (`${agg.title} ${Math.round(sum * 100) / 100} <br/>`);
      } else {
        text = document.createElement('text');
        svg.appendChild(text);
        text.innerHTML += (`${agg.title} ${Math.round((sum / count) * 100) / 100} <br/>`);
      }
    }
    text = document.createElement('text');
    svg.appendChild(text);
    text.innerHTML += `Count: ${count}`;
  }

  static removeFilter(buttonID) {
    buttonID.parentNode.parentNode.remove();
  }


  counterHeader(headEditor, index) {
    headEditor.createRemoveButton(`remove${index}`, (e2) => {
      this.filter.removeSeries(e2.currentTarget);
    });
  }
  static createAggregationRow(myDiv, cats, num) {
    const editor = new EditorGenerator(myDiv);
    editor.createAggregationRow(num, 'TEXT', cats, 'aggs', (e) => { Counter.removeFilter(e.currentTarget); });
  }

  createAddAggregation(myDiv, aggDiv) {
    const editor = new EditorGenerator(myDiv);
    editor.createButton('addAgg', 'New Sum or Average', () => {
      this.num += 1;
      Counter.createAggregationRow(aggDiv, this.cats, this.num);
    });
  }
  updateRender() {
    const aggRows = document.getElementsByClassName('aggs');
    for (let i = 0; i < aggRows.length; i += 1) {
      this.attributes.aggs[i] = {};
      this.attributes.aggs[i].operation = $(aggRows[i].childNodes[1].children[0].children[3]).val();
      this.attributes.aggs[i].column = $(aggRows[i].childNodes[3].children[0].children[3]).val();
      this.attributes.aggs[i].title = $(aggRows[i].childNodes[5].children[0]).val();
    }
  }

}
export default Counter;

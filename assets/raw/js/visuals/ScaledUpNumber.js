
import EditorGenerator from './helpers/EditorGenerator';
import Visual from './helpers/Visual';
import Filter from './helpers/Filter';


class ScaledUpNumber extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);
    this.renderData = [];
    this.filter = new Filter(this);
    this.num = 0;
    this.applyDefaultAttributes({
      filters: [],
      columnOptions: null,
      color: '#000000',
      fontSize: 32,
      aggs: {},
    });
  }
  /** ************************************************************************
    Render Methods
  *************************************************************************** */
  /** Renders Controls
  *
  */
  renderControls() {
    this.renderData = JSON.parse(JSON.stringify(this.data));
    this.attributes.columnOptions = Object.keys(this.data[0]);
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    this.renderControlsDiv.innerHTML = '<h4 style = "text-align: center">Controls</h4> <br>';
    this.cats = [];
    const numericCols = Object.keys(this.getNumericData()[0]);
    for (let i = 0; i < numericCols.length; i += 1) {
      this.cats.push({ value: numericCols[i], text: numericCols[i] });
    }
    const editor = new EditorGenerator(this.renderControlsDiv);
    const aggDiv = document.createElement('div');
    this.renderControlsDiv.appendChild(aggDiv);
    ScaledUpNumber.createAggregationRow(aggDiv, this.cats);
    const br = document.createElement('br');
    this.renderControlsDiv.appendChild(br);
    br.style.margin = '10px';
    editor.createNumberSlider('fontSlider', 'Font Size', this.attributes.fontSize, 1, 128, 1, (e) => {
      this.attributes.fontSize = $(e.currentTarget).val();
      this.render();
    });
    editor.createColorField('color', 'Color', '#000000', (e) => {
      this.attributes.color = $(e.currentTarget).val();
      this.render();
    });
    const myDiv = document.createElement('div');
    this.renderControlsDiv.appendChild(myDiv);
    this.filter.makeFilterSeries((a, b) => { this.ScaledUpNumberHeader(a, b); }, () => { this.updateRender(); }, 'Generate Number', myDiv);
    document.getElementById('addSeries').remove();
  }

  /** Renders the App section
  *
  */
  render() {
    if (this.attributes.filters !== undefined) {
      this.filter.getFilteredData(this.attributes.filters);
      if (this.renderData.length > 0) {
        this.renderData = this.renderData[0];
      }
      this.renderDiv = document.getElementById(this.renderID);
      this.renderDiv.innerHTML = '';
      const svg = document.createElement('svg');
      this.renderDiv.appendChild(svg);
      const g = document.createElement('g');

    // svg.viewBox = '0 0 500 500';
      const text = document.createElement('text');
      text.dominantbaseline = 'text-before-edge';
      svg.appendChild(g);
      g.appendChild(text);
      $(text).attr('x', 10);
      $(text).attr('y', 10);
      text.style.fontSize = this.attributes.fontSize;
      text.style.fill = this.attributes.color;
      if (this.attributes.columnOptions === null) {
        this.columnOptions = [];
      }
      if (this.attributes.aggs !== undefined) {
        this.displayCount(text);
      }
    }
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

    if (this.attributes.aggs !== undefined) {
      const agg = this.attributes.aggs;
      for (let i = 0; i < renderData.length; i += 1) {
        if (renderData[i] !== null && renderData[i] !== undefined
          && !isNaN(renderData[i][agg.column])) {
          sum += Number(renderData[i][agg.column]);
        }
      }
      if (agg.operation === 'Sum') {
        text = ScaledUpNumber.createTSpan(svg);
        text.innerHTML += (`${agg.title} ${Math.round(sum * 100) / 100}`);
      }
      if (agg.operation === 'Average') {
        text = ScaledUpNumber.createTSpan(svg);
        text.innerHTML += (`${agg.title} ${Math.round((sum / count) * 100) / 100}`);
      }
      if (agg.operation === 'Count') {
        text = ScaledUpNumber.createTSpan(svg);
        text.innerHTML += `${agg.title} ${count}`;
      }
    }
  }

  static removeFilter(buttonID) {
    buttonID.parentNode.parentNode.remove();
  }


  ScaledUpNumberHeader(headEditor, index) {
    headEditor.createHeader('Filters');
  }

  static createAggregationRow(myDiv, cats) {
    const editor = new EditorGenerator(myDiv);
    editor.createAggregationRow('aggid', 'tspan', cats, 'aggs');
  }


  updateRender() {
    const aggRow = document.getElementById('aggid');
    this.attributes.aggs = {};
    this.attributes.aggs.operation = $(aggRow.childNodes[1].children[0].children[3]).val();
    this.attributes.aggs.column = $(aggRow.childNodes[3].children[0].children[3]).val();
    this.attributes.aggs.title = $(aggRow.childNodes[5].children[0]).val();
  }

  static createTSpan(svg) {
    const text = document.createElement('tspan');
    svg.appendChild(text);
    $(text)
    .attr('x', '0em')
    .attr('dy', '1.2em');
    text.style.width = '100%';
    text.style.display = 'block';
    // text.style.top = '1.2em';
    // text.style.left = '1em';
    return text;
  }
}
export default ScaledUpNumber;

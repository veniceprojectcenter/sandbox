import EditorGenerator from './helpers/EditorGenerator';
import Visual from './helpers/Visual';
import Filter from './helpers/Filter';

class DataView extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);
    this.attributes.columnOptions = null;
    this.attributes.displayColumns = [];
    this.renderData = [];
    this.attributes.filters = [];
    this.filter = new Filter(this);
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

    const cats = [];
    const allDataCols = Object.keys(this.data[0]);
    for (let i = 0; i < allDataCols.length; i += 1) {
      cats.push({ value: allDataCols[i], text: allDataCols[i] });
    }
    const editor = new EditorGenerator(this.renderControlsDiv);

    editor.createMultipleSelectBox('check2', 'Show Data', cats, 'na', (e) => {
      this.attributes.displayColumns = $(e.currentTarget).val();
    });
    const myDiv = document.createElement('div');
    this.renderControlsDiv.appendChild(myDiv);
    this.filter.makeFilterSeries((a, b) => { this.counterHeader(a, b); }, () => { this.render(); }, 'Create Table', myDiv);
  }
  /** Renders the App section
  *
  */
  render() {
    this.filter.getFilteredData(this.attributes.filters);
    this.renderDiv = document.getElementById(this.renderID);
    this.renderDiv.innerHTML = 'Data Table:';
    this.tableDiv = document.createElement('div');
    this.renderDiv.appendChild(this.tableDiv);
    this.tableDiv.id = 'tableDiv';
    if (this.attributes.columnOptions === null) {
      this.columnOptions = [];
    }
    this.displayTable();
  }


  /** Updates app display when actions are taken in controls
  *
  */
  /** Displayes the data table on selected Categories
  *
  */
  displayTable() {
    const renderData = this.renderData;
    let txt = '';
    txt += "<table border='1'> <tr>";
    for (let j = 0; j < this.attributes.displayColumns.length; j += 1) {
      txt += `<td>${this.attributes.displayColumns[j]}</td>`;
    }
    txt += '</tr>';
    for (let i = 0; i < renderData.length; i += 1) {
      txt += '<tr>';
      if (renderData[i] != null) {
        for (let j = 0; j < this.attributes.displayColumns.length; j += 1) {
          txt += `<td>${renderData[i][this.attributes.displayColumns[j]]}</td>`;
        }
        txt += '</tr>';
      }
    }
    txt += '</table>';
    document.getElementById('tableDiv').innerHTML = `${txt}`;
  }
  static removeFilter(buttonID) {
    buttonID.parentNode.parentNode.remove();
  }


  counterHeader(headEditor, index) {
    headEditor.createRemoveButton(`remove${index}`, (e2) => {
      this.filter.removeSeries(e2.currentTarget);
    });
  }
}
export default DataView;

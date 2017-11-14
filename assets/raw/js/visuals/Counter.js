
import EditorGenerator from './helpers/EditorGenerator';
import Visual from './helpers/Visual';

class Counter extends Visual {
  constructor(config) {
    super(config);
    this.attributes.columnOptions = null;
    this.attributes.displayColumns = [];
    this.renderData = [];
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
    const ccats = [];
    const ncats = [];
    const cats = [];
    // let rawCats = Object.keys(this.getCategoricalData()[0]);
    // rawCats = rawCats.concat(Object.keys(this.getNumericData()[0]));
    const catData = Object.keys(this.getCategoricalData()[0]);
    const numData = Object.keys(this.getNumericData(2)[0]);
    const allDataCols = Object.keys(this.data[0]);
    for (let i = 0; i < allDataCols.length; i += 1) {
      cats.push({ value: allDataCols[i], text: allDataCols[i] });
    }
    for (let i = 0; i < catData.length; i += 1) {
      ccats.push({ value: catData[i], text: catData[i] });
    }
    for (let i = 0; i < numData.length; i += 1) {
      ncats.push({ value: numData[i], text: numData[i] });
    }
    this.binDiv = document.createElement('div');
    const editor = new EditorGenerator(this.renderControlsDiv);
    this.renderControlsDiv.innerHTML = '<h4 style = "text-align: center">Controls</h4> <br>';
    editor.createMultipleSelectBox('check2', 'Show Data', cats, 'durg', (e) => {
      this.attributes.displayColumns = $(e.currentTarget).val();
    });
    editor.createDataFilter('Filter', ccats, (e) => {
      const column = $(e.currentTarget).val();
      const categories = this.getGroupedList(column);
      const catSelect = e.currentTarget.parentNode.parentNode.nextSibling.nextSibling
      .nextSibling.nextSibling.children[0].children[3];
      $(catSelect).empty().html(' ');
      for (let i = 0; i < categories.length; i += 1) {
        const value = categories[i].key;
        $(catSelect).append(
  $('<option></option>')
    .attr('value', value)
    .text(value),
);
      }
      $(catSelect).material_select();
    });
    editor.createNumericFilter('NumFilter', ncats, () => {
      this.render();
    });
    this.renderControlsDiv.appendChild(this.binDiv);
    const filterCats = [];
    for (let i = 0; i < this.attributes.columnOptions.length; i += 1) {
      filterCats.push({ value: this.attributes.columnOptions[i],
        text: this.attributes.columnOptions[i] });
    }

    editor.createButton('submit', 'Generate Table', () => {
      this.attributes.dataFilters = [];
      this.attributes.numericFilters = [];
      const catFilters = document.getElementsByClassName('dataFilter');
      const numFilters = document.getElementsByClassName('numFilter');
      for (let i = 0; i < catFilters.length; i += 1) {
        const filter = catFilters[i];
        const columnVal = $(filter.children[0].children[0].children[3]).val();
        const catVal = $(filter.children[2].children[0].children[3]).val();
        this.attributes.dataFilters.push({ column: columnVal, categories: catVal });
      }
      for (let i = 0; i < numFilters.length; i += 1) {
        const filter = numFilters[i];
        const columnVal = $(filter.children[0].children[0].children[3]).val();
        const opVal = $(filter.children[1].children[0].children[3]).val();
        const val = $(filter.children[2].children[0]).val();
        this.attributes.numericFilters.push({ column: columnVal, operation: opVal, value: val });
      }
      this.renderData = this.data;
      this.renderData = this.filterCategorical(this.attributes.dataFilters, this.renderData);
      this.renderData = this.filterNumerical(this.attributes.numericFilters, this.renderData);
      this.render();
    });
  }
  /** Renders the App section
  *
  */
  render() {
    this.renderDiv = document.getElementById(this.renderID);
    this.renderDiv.innerHTML = 'Data Table:';
    this.tableDiv = document.createElement('div');
    this.renderDiv.appendChild(this.tableDiv);
    this.tableDiv.id = 'tableDiv';
    if (this.attributes.columnOptions === null) {
      this.attributes.columnOptions = [];
    }
    this.displayTable();
        /**
    for (let i = 0; i < columnOptions.length; i += 1) {
      if (this.isNumeric(columnOptions[i])) {
        renderData = this.makeBin(columnOptions[i], this.attributes.binSizes[columnOptions[i]],
        this.attributes.binStarts[columnOptions[i]]);
      }
    }

    const defaultOption = document.createElement('option');
    defaultOption.innerHTML = '--Select--';
    this.aSelect.appendChild(defaultOption);
    for (let i = 0; i < this.attributes.columnOptions.length; i += 1) {
      const op = document.createElement('option');
      op.value = this.attributes.columnOptions[i];
      op.text = this.attributes.columnOptions[i];
      this.aSelect.appendChild(op);
    }
    */
  }
  /** Displays the checkboxes for sorting

  displayAttributes(renderData) {
    this.checkboxDiv.innerHTML = '';
    if (this.aSelect.selectedIndex < 1) {
      return;
    }
    const selectedAttribute = this.aSelect.options[this.aSelect.selectedIndex].text;
    const checkboxes = [];
    for (let i = 0; i < renderData.length; i += 1) {
      if (renderData[i][selectedAttribute] !== '' && !(checkboxes.includes(renderData[i][selectedAttribute]))) {
        const tempInput = document.createElement('input');
        tempInput.value = renderData[i][selectedAttribute];
        tempInput.type = 'checkbox';
        tempInput.id = `check${i}`;
        tempInput.classList.add('CheckChoice');
        tempInput.addEventListener('change', () => { this.displayTable(renderData); });
        const newlabel = document.createElement('Label');
        newlabel.setAttribute('for', tempInput.id);
        newlabel.innerHTML = renderData[i][selectedAttribute];
        this.checkboxDiv.append(tempInput);
        this.checkboxDiv.append(newlabel);
        this.checkboxDiv.append(document.createElement('br'));
        checkboxes[checkboxes.length] = renderData[i][selectedAttribute];
      }
    }
  }
  */
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
    let count = 0;
    for (let i = 0; i < renderData.length; i += 1) {
      txt += '<tr>';
      if (renderData[i] != null) {
        for (let j = 0; j < this.attributes.displayColumns.length; j += 1) {
          txt += `<td>${renderData[i][this.attributes.displayColumns[j]]}</td>`;
        }
        count += 1;
        txt += '</tr>';
      }
    }
    txt += '</table>';
    document.getElementById('tableDiv').innerHTML = `${txt}Count: ${count}`;
  }

  /** ************************************************************************
    CheckBox Helper Methods
  *************************************************************************** */
  /** Function for creating a list of checkboxes for attributes
  *
  */
  createCheckBoxList(checkDiv, theData, checkClass) {
    const keys = Object.keys(theData[0]);
    const select = document.createElement('select');
    // select.attributes.push('multiple');
    checkDiv.appendChild(select);
    for (let i = 0; i < keys.length; i += 1) {
      if (keys[i] !== '') {
        const tempInput = document.createElement('option');
        tempInput.value = keys[i];
        tempInput.innerHTML = keys[i];
    /**    tempInput.id = `${checkClass}${i}`;
        tempInput.classList.add(checkClass);

        tempInput.addEventListener('change', () => { this.updateRender(); });
        const newlabel = document.createElement('Label');
        newlabel.setAttribute('for', tempInput.id);
        newlabel.innerHTML = keys[i];
        newlabel.style.marginBottom = '20px';

        checkDiv.append(newlabel);
        checkDiv.append(document.createElement('br'));
        */
        select.appendChild(tempInput);
      }
    }
  }
  /** Function for creating a list of checkboxes for bin attributes
  *
  */
  createBinCheckBoxList(checkDiv, theData, checkClass) {
    const keys = Object.keys(theData[0]);
    for (let i = 0; i < keys.length; i += 1) {
      if (keys[i] !== '') {
        const tempInput = document.createElement('input');
        tempInput.value = keys[i];
        tempInput.type = 'checkbox';
        tempInput.id = `${checkClass}bin${i}`;
        tempInput.classList.add(checkClass);
        tempInput.addEventListener('change', () => { this.updateRender(); });
        const newlabel = document.createElement('Label');
        newlabel.setAttribute('for', tempInput.id);
        newlabel.innerHTML = keys[i];
        const binStart = document.createElement('input');
        binStart.classList.add('binStart');
        binStart.type = 'number';
        binStart.style.margin = '0';
        binStart.style.width = '50';
        binStart.style.height = '18';
        binStart.id = `${checkClass}binStart${i}`;
        binStart.addEventListener('change', () => { this.updateRender(); });
        const binStartLabel = document.createElement('Label');
        binStartLabel.setAttribute('for', binStart.id);
        binStartLabel.innerHTML = 'Bin Start:';
        binStartLabel.style.padding = '10px';

        const binSize = document.createElement('input');
        binSize.classList.add('binSize');
        binSize.type = 'number';
        binSize.style.width = '50';
        binSize.id = `${checkClass}binSize${i}`;
        binSize.style.height = '18';
        binSize.style.margin = '0';
        binSize.addEventListener('change', () => { this.updateRender(); });
        const binSizeLabel = document.createElement('Label');
        binSizeLabel.setAttribute('for', binSize.id);
        binSizeLabel.innerHTML = 'Bin Size:';
        binSizeLabel.style.padding = '10px';
        checkDiv.append(tempInput);
        checkDiv.append(newlabel);
        checkDiv.append(binStartLabel);
        checkDiv.append(binStart);
        checkDiv.append(binSizeLabel);
        checkDiv.append(binSize);
        checkDiv.append(document.createElement('br'));
      }
    }
  }
}

export default Counter;

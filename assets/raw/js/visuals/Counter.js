
import EditorGenerator from './helpers/EditorGenerator';
import Visual from './helpers/Visual';

class Counter extends Visual {
  constructor(config) {
    super(config);
    this.attributes.columnOptions = null;
    this.attributes.binSizes = [];
    this.attributes.binStarts = [];
    this.attributes.displayColumns = [];
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
    this.attributes.columnOptions = Object.keys(this.data[0]);
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    let cats = [];
    let rawCats = Object.keys(this.getCategoricalData()[0]);
    rawCats = rawCats.concat(Object.keys(this.getNumericData()[0]));
    for (let i = 0; i < rawCats.length; i += 1) {
      cats.push({ value: rawCats[i], text: rawCats[i] });
    }
    this.binDiv = document.createElement('div');
    const editor = new EditorGenerator(this.renderControlsDiv);
    this.renderControlsDiv.innerHTML = '<h4 style = "text-align: center">Controls</h4> <br>';
    editor.createMultipleSelectBox('check1', 'Group By Options', cats, 'durg1', (e) => {
      this.attributes.columnOptions = $(e.currentTarget).val();
      this.binDiv.innerHTML = '';
      for (let i = 0; i < this.attributes.columnOptions.length; i += 1) {
        if (this.isNumeric(this.attributes.columnOptions[i])) {
          const tempDiv = document.createElement('div');
          this.binDiv.appendChild(tempDiv);
          tempDiv.innerHTML = this.attributes.columnOptions[i];
          const binEditor = new EditorGenerator(tempDiv);
          binEditor.createTextField(`${i}start`, 'Enter Start of First Bin }', null);
          binEditor.createTextField(`${i}size`, 'Enter Size of Bins }', null);
        }
      }
      this.render();
    });
    this.renderControlsDiv.appendChild(this.binDiv);
    cats = [];
    for (let i = 0; i < this.attributes.columnOptions.length; i += 1) {
      cats.push({ value: this.attributes.columnOptions[i],
        text: this.attributes.columnOptions[i] });
    }
    editor.createMultipleSelectBox('check2', 'Show Data', cats, 'durg', (e) => {
      this.attributes.displayColumns = $(e.currentTarget).val();
      this.render();
    });
  }
  /** Renders the App section
  *
  */
  render() {
    let renderData = JSON.parse(JSON.stringify(this.data));
    this.renderDiv = document.getElementById(this.renderID);
    this.renderDiv.innerHTML = 'Select a Propertiy to Group Data by:';
    this.tableDiv = document.createElement('div');
    this.aSelect = document.createElement('select');
    this.checkboxDiv = document.createElement('div');
    this.renderDiv.appendChild(this.aSelect);
    this.renderDiv.appendChild(this.checkboxDiv);
    this.renderDiv.appendChild(this.tableDiv);
    this.aSelect.addEventListener('change', () => { this.displayAttributes(renderData); });
    this.aSelect.classList.add('browser-default');
    this.aSelect.id = 'AttributeSelect';
    this.tableDiv.id = 'tableDiv';
    if (this.attributes.columnOptions === null) {
      this.attributes.columnOptions = [];
    }
    const columnOptions = this.attributes.columnOptions;
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
  }
  /** Displays the checkboxes for sorting
  *
  */
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
  /** Updates app display when actions are taken in controls
  *
  */
  /** Displayes the data table on selected Categories
  *
  */
  displayTable(renderData) {
    let txt = '';
    if (this.aSelect.selectedIndex < 0) {
      return;
    }
    const selectedAttribute = this.aSelect.options[this.aSelect.selectedIndex].text;
    const yourSelect = document.getElementsByClassName('CheckChoice');
    let choiceValue = [];
    for (let i = 0; i < yourSelect.length; i += 1) {
      if (yourSelect[i].checked) {
        choiceValue += yourSelect[i].value;
      }
    }
    txt += "<table border='1'> <tr>";
    for (let j = 0; j < this.attributes.displayColumns.length; j += 1) {
      txt += `<td>${this.attributes.displayColumns[j]}</td>`;
    }
    txt += '</tr>';
    let count = 0;
    for (let i = 0; i < renderData.length; i += 1) {
      if (choiceValue.includes(renderData[i][selectedAttribute]) && renderData[i][selectedAttribute] !== '') {
        txt += '<tr>';
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
/** Updates what will be rendered and config file when something changes
*
*/
  updateRender() {
    const displayBinOptions = document.getElementsByClassName('selectBinOptionsCheck');
    for (let i = 0; i < displayBinOptions.length; i += 1) {
      if (displayBinOptions[i].checked) {
        const binSize = Number(document.getElementsByClassName('binSize')[i].value);
        const start = Number(document.getElementsByClassName('binStart')[i].value);
        if (!isNaN(start) && !isNaN(binSize)) {
          const columnName = displayBinOptions[i].value;
          this.attributes.binSizes[columnName] = binSize;
          this.attributes.binStarts[columnName] = start;
          this.attributes.columnOptions[this.attributes.columnOptions.length] =
           displayBinOptions[i].value;
        }
      }
    }
    this.attributes.displayColumns = [];
    const displayOptions = document.getElementsByClassName('displayCheck');
    for (let i = 0; i < displayOptions.length; i += 1) {
      if (displayOptions[i].checked) {
        this.attributes.displayColumns[this.attributes.displayColumns.length] =
         displayOptions[i].value;
      }
    }
    this.render();
  }

  generateConfig() {
    super.generateConfig();
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

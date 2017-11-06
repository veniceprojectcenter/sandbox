import Visual from '../Visual';

class Counter extends Visual {
  constructor(config) {
    super(config);
    this.keys = null;
    this.applyDefaultAttributes({
      width: 500,
      height: 500,
      font_size: '2em',
      colors: [],
      category_order: '',
    });
  }
  /** Renders Controls
  *
  */
  renderControls() {
    this.keys = Object.keys(this.data[0]);
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    this.renderControlsDiv.innerHTML = 'Controls';
    const brake = document.createElement('br');
    this.renderControlsDiv.appendChild(brake);
    this.renderControlsDiv.innerHTML += 'Attributes to group by';
    this.controlCheckboxDiv = document.createElement('div');
    this.controlCheckboxDiv2 = document.createElement('div');
    this.renderControlsDiv.appendChild(this.controlCheckboxDiv);
    this.renderControlsDiv.appendChild(this.controlCheckboxDiv2);
    this.createCheckBoxList(this.controlCheckboxDiv, this.getCategoricalData(), 'selectOptionsCheck');
    this.createBinCheckBoxList(this.controlCheckboxDiv, this.getNumericData(), 'selectBinOptionsCheck');
    this.controlCheckboxDiv2.innerHTML = 'Attributes to Display';
    this.controlCheckboxDiv2.appendChild(document.createElement('br'));
    this.createCheckBoxList(this.controlCheckboxDiv2, this.data, 'displayCheck');
  }
  /** Renders the App section
  *
  */
  render() {
    this.renderDiv = document.getElementById(this.renderID);
    this.renderDiv.innerHTML = 'Select an Attribute to Group By:';
    this.tableDiv = document.createElement('div');
    this.aSelect = document.createElement('select');
    this.checkboxDiv = document.createElement('div');
    this.renderDiv.appendChild(this.aSelect);
    this.renderDiv.appendChild(this.checkboxDiv);
    this.renderDiv.appendChild(this.tableDiv);
    this.aSelect.addEventListener('change', () => { this.displayAttributes(); });
    this.aSelect.classList.add('browser-default');
    this.aSelect.id = 'AttributeSelect';
    this.tableDiv.id = 'tableDiv';
  //  this.aSelect.type = 'select';
    if (this.keys === null) {
      this.keys = [];
      this.renderData = JSON.parse(JSON.stringify(this.data));
    }
    const defaultOption = document.createElement('option');
    defaultOption.innerHTML = '--Select--';
    this.aSelect.appendChild(defaultOption);
    for (let i = 0; i < this.keys.length; i += 1) {
      const op = document.createElement('option');
      op.value = this.keys[i];
      op.text = this.keys[i];
      this.aSelect.appendChild(op);
    }
  }
  /** Displayes the data table on selected Categories
  *
  */
  displayTable() {
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
    for (let j = 0; j < this.attributesList.length; j += 1) {
      txt += `<td>${this.attributesList[j]}</td>`;
    }
    txt += '</tr>';
    let count = 0;
    for (let i = 0; i < this.renderData.length; i += 1) {
      if (choiceValue.includes(this.renderData[i][selectedAttribute]) && this.renderData[i][selectedAttribute] !== '') {
        txt += '<tr>';
        for (let j = 0; j < this.attributesList.length; j += 1) {
          txt += `<td>${this.renderData[i][this.attributesList[j]]}</td>`;
        }
        count += 1;
        txt += '</tr>';
      }
    }
    txt += '</table>';
    document.getElementById('tableDiv').innerHTML = `${txt}Count: ${count}`;
  }
  /** Displays the checkboxes for sorting
  *
  */
  displayAttributes() {
    this.checkboxDiv.innerHTML = '';
    if (this.aSelect.selectedIndex < 1) {
      return;
    }
    const selectedAttribute = this.aSelect.options[this.aSelect.selectedIndex].text;
    const checkboxes = [];
    for (let i = 0; i < this.renderData.length; i += 1) {
      if (this.renderData[i][selectedAttribute] !== '' && !(checkboxes.includes(this.renderData[i][selectedAttribute]))) {
        const tempInput = document.createElement('input');
        tempInput.value = this.renderData[i][selectedAttribute];
        tempInput.type = 'checkbox';
        tempInput.id = `check${i}`;
        tempInput.classList.add('CheckChoice');
        tempInput.addEventListener('change', () => { this.displayTable(); });
        const newlabel = document.createElement('Label');
        newlabel.setAttribute('for', tempInput.id);
        newlabel.innerHTML = this.renderData[i][selectedAttribute];
        this.checkboxDiv.append(tempInput);
        this.checkboxDiv.append(newlabel);
        this.checkboxDiv.append(document.createElement('br'));
        checkboxes[checkboxes.length] = this.renderData[i][selectedAttribute];
      }
    }
  }
  /** Updates app display when actions are taken in controls
  *
  */
  updateRender() {
    const selectOptions = document.getElementsByClassName('selectOptionsCheck');
    this.keys = [];
    for (let i = 0; i < selectOptions.length; i += 1) {
      if (selectOptions[i].checked) {
        this.keys[this.keys.length] = selectOptions[i].value;
      }
    }
    const displayBinOptions = document.getElementsByClassName('selectBinOptionsCheck');
    for (let i = 0; i < displayBinOptions.length; i += 1) {
      if (displayBinOptions[i].checked) {
        const binSize = document.getElementsByClassName('binSize')[i].value;
        const start = document.getElementsByClassName('binStart')[i].value;
        if (!isNaN(start) && !isNaN(binSize)) {
          this.renderData = this.makeBin(displayBinOptions[i].value, Number(binSize),
             Number(start), this.renderData);
          this.keys[this.keys.length] = displayBinOptions[i].value;
        }
      }
    }
    this.attributesList = [];
    const displayOptions = document.getElementsByClassName('displayCheck');
    for (let i = 0; i < displayOptions.length; i += 1) {
      if (displayOptions[i].checked) {
        this.attributesList[this.attributesList.length] = displayOptions[i].value;
      }
    }

    this.render();
  }
  /** Function for creating a list of checkboxes for attributes
  *
  */
  createCheckBoxList(checkDiv, theData, checkClass) {
    const keys = Object.keys(theData[0]);
    for (let i = 0; i < keys.length; i += 1) {
      if (keys[i] !== '') {
        const tempInput = document.createElement('input');
        tempInput.value = keys[i];
        tempInput.type = 'checkbox';
        tempInput.id = `${checkClass}${i}`;
        tempInput.classList.add(checkClass);
        tempInput.addEventListener('change', () => { this.updateRender(); });
        const newlabel = document.createElement('Label');
        newlabel.setAttribute('for', tempInput.id);
        newlabel.innerHTML = keys[i];
        checkDiv.append(tempInput);
        checkDiv.append(newlabel);
        checkDiv.append(document.createElement('br'));
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
        binStart.id = `${checkClass}binStart${i}`;
        binStart.addEventListener('change', () => { this.updateRender(); });
        const binStartLabel = document.createElement('Label');
        binStartLabel.setAttribute('for', binStart.id);
        binStartLabel.innerHTML = 'Bin Start:';
        const binSize = document.createElement('input');
        binSize.classList.add('binSize');
        binSize.type = 'number';
        binSize.id = `${checkClass}binSize${i}`;
        binSize.addEventListener('change', () => { this.updateRender(); });
        const binSizeLabel = document.createElement('Label');
        binSizeLabel.setAttribute('for', binSize.id);
        binSizeLabel.innerHTML = 'Bin Size:';
        checkDiv.append(tempInput);
        checkDiv.append(newlabel);
        checkDiv.append(document.createElement('br'));
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

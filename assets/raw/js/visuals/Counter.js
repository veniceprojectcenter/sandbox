import Visual from '../Visual';

class Counter extends Visual {
  constructor(config) {
    super(config);
    this.keys = null;
    this.applyDefaultAttributes({
      width: 500,
      height: 500,
      font_size: '1em',
      colors: [],
      category_order: '',
    });
  }

  renderControls() {
    this.renderControlsDiv = document.getElementById(this.renderControlsID);
    this.renderControlsDiv.innerHTML = 'Controls';
    const brake = document.createElement('br');
    this.renderControlsDiv.appendChild(brake);
    this.renderControlsDiv.innerHTML += 'Attributes to group by';
    this.controlCheckboxDiv = document.createElement('div');
    this.controlCheckboxDiv2 = document.createElement('div');
    this.renderControlsDiv.appendChild(this.controlCheckboxDiv);
    this.renderControlsDiv.appendChild(this.controlCheckboxDiv2);
    for (let i = 0; i < this.keys.length; i += 1) {
      const checkInput = document.createElement('input');
      checkInput.value = this.keys[i];
      checkInput.type = 'checkbox';
      checkInput.id = `controlCheck${i}`;
      checkInput.classList.add('selectOptionsCheck');
      checkInput.addEventListener('change', () => { this.updateRender(); });
      const newlabel = document.createElement('Label');
      newlabel.setAttribute('for', checkInput.id);
      newlabel.innerHTML = this.keys[i];
      this.controlCheckboxDiv.append(checkInput);
      this.controlCheckboxDiv.append(newlabel);
      this.controlCheckboxDiv.append(document.createElement('br'));
    }
    this.controlCheckboxDiv2.innerHTML = 'Attributes to Display';
    this.controlCheckboxDiv2.appendChild(document.createElement('br'));
    for (let i = 0; i < this.keys.length; i += 1) {
      const tempInput = document.createElement('input');
      tempInput.value = this.keys[i];
      tempInput.type = 'checkbox';
      tempInput.id = `displayCheck${i}`;
      tempInput.classList.add('displayCheck');
      tempInput.addEventListener('change', () => { this.updateRender(); });
      const newlabel = document.createElement('Label');
      newlabel.setAttribute('for', tempInput.id);
      newlabel.innerHTML = this.keys[i];
      this.controlCheckboxDiv2.append(tempInput);
      this.controlCheckboxDiv2.append(newlabel);
      this.controlCheckboxDiv2.append(document.createElement('br'));
    }
  }
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
      this.keys = Object.keys(this.data[0]);
    }
    this.aSelect.appendChild(document.createElement('option'));
    for (let i = 0; i < this.keys.length; i += 1) {
      const op = document.createElement('option');
      op.value = this.keys[i];
      op.text = this.keys[i];
      this.aSelect.appendChild(op);
    }
  }
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
    txt += "<table border='1'>";
    let count = 0;
    for (let i = 0; i < this.data.length; i += 1) {
      if (choiceValue.includes(this.data[i][selectedAttribute]) && this.data[i][selectedAttribute] !== '') {
        txt += '<tr>';
        for (let j = 0; j < this.attributesList.length; j += 1) {
          txt += `<td>${this.data[i][this.attributesList[j]]}</td>`;
        }
        count += 1;
        txt += '</tr>';
      }
    }
    txt += '</table>';
    document.getElementById('tableDiv').innerHTML = `${txt}Count: ${count}`;
  }

  displayAttributes() {
    this.checkboxDiv.innerHTML = '';
    if (this.aSelect.selectedIndex < 1) {
      return;
    }
    const selectedAttribute = this.aSelect.options[this.aSelect.selectedIndex].text;
    const checkboxes = [];
    for (let i = 0; i < this.data.length; i += 1) {
      if (this.data[i][selectedAttribute] !== '' && !(checkboxes.includes(this.data[i][selectedAttribute]))) {
        const tempInput = document.createElement('input');
        tempInput.value = this.data[i][selectedAttribute];
        tempInput.type = 'checkbox';
        tempInput.id = `check${i}`;
        tempInput.classList.add('CheckChoice');
        tempInput.addEventListener('change', () => { this.displayTable(); });
        const newlabel = document.createElement('Label');
        newlabel.setAttribute('for', tempInput.id);
        newlabel.innerHTML = this.data[i][selectedAttribute];
        this.checkboxDiv.append(tempInput);
        this.checkboxDiv.append(newlabel);
        this.checkboxDiv.append(document.createElement('br'));
        checkboxes[checkboxes.length] = this.data[i][selectedAttribute];
      }
    }
  }
  updateRender() {
    const selectOptions = document.getElementsByClassName('selectOptionsCheck');
    this.keys = [];
    for (let i = 0; i < selectOptions.length; i += 1) {
      if (selectOptions[i].checked) {
        this.keys[this.keys.length] = selectOptions[i].value;
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
}

export default Counter;

import Visual from '../Visual';

class Counter extends Visual {
  constructor(config) {
    super(config);
    this.applyDefaultAttributes({
      width: 500,
      height: 500,
      font_size: '1em',
      colors: [],
      category_order: '',
    });
  }
  renderControls() {
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
    this.aSelect.addEventListener('change', () => {this.displayAttributes()});
    this.aSelect.classList.add("browser-default");
    this.aSelect.id = 'AttributeSelect';
    this.tableDiv.id = 'tableDiv';
  //  this.aSelect.type = 'select';
    const keys = Object.keys(this.data[0]);
    for (let i = 0; i < keys.length; i += 1) {
      const op = document.createElement('option');
      op.value = keys[i];
      op.text = keys[i];
      this.aSelect.appendChild(op);
    }
  }
  displayBridges() {
    if (this.aSelect.selectedIndex == -1){
      return;
    }
    let txt = '';
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
    for (let i=0; i < this.data.length; i += 1) {
      if (choiceValue.includes(this.data[i][selectedAttribute]) && this.data[i][selectedAttribute] !== '') {
        txt += `<tr><td>${this.data[i]['ck_id']}</td></tr>`;
        count += 1;
      }
    }
    txt += '</table>';
    document.getElementById('tableDiv').innerHTML = `${txt}Count: ${count}`;
  }

  displayAttributes() {
    if (this.aSelect.selectedIndex == -1){
      return;
    }
  this.checkboxDiv.innerHTML = '';
    const selectedAttribute = this.aSelect.options[this.aSelect.selectedIndex].text;
    const checkboxes = [];
    for (let i=0; i < this.data.length; i += 1) {
      if (this.data[i][selectedAttribute] !== '' && !(checkboxes.includes(this.data[i][selectedAttribute]))) {
        const tempInput = document.createElement('input');
        tempInput.value = this.data[i][selectedAttribute];
        tempInput.type = 'checkbox';
        tempInput.id= 'check'+i;
        tempInput.classList.add('CheckChoice');
        tempInput.addEventListener('change', () => {this.displayBridges()});
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
}

export default Counter;

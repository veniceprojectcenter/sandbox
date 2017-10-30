import Visual from '../Visual';

class Counter extends Visual {
  constructor(config) {
    super(config);
  }
  render() {
    const renderDiv = document.getElementById(Visual.RENDER_ID);
    renderDiv.innerHTML = '';
    this.aSelect = document.createElement('select');
    this.aSelect.innerHTML = '';
    this.aSelect.addEventListener('change', this.displayAttributes);
    const keys = Object.keys(this.data[0]);
    for (let i = 0; i < keys.length; i += 1) {
      const op = document.createElement('option');
      op.value = keys[i];
      op.text = keys[i];
      this.aSelect.append(op);
    }
  }
  displayBridges() {
    let txt = '';
    const selectedAttribute = this.aSelect.options[this.aSelect.selectedIndex].text;
    const yourSelect = document.getElementsByClassName('Sestiere');
    let choiceValue = [];
    for (let i = 0; i < yourSelect.length; i += 1) {
      if (yourSelect[yourSelect[i]].checked) {
        choiceValue += yourSelect[i].value;
      }
    }
    txt += "<table border='1'>";
    let count = 0;
    for (let i; i < this.data.length; i += 1) {
      if (choiceValue.includes(this.data[i][selectedAttribute]) && this.data[i][selectedAttribute] !== '') {
        txt += `<tr><td>${this.data[i]['Bridge Name']}</td></tr>`;
        count += 1;
      }
    }
    txt += '</table>';
    document.getElementById('demo').innerHTML = `${txt}Count: ${count}`;
  }

  displayAttributes() {
    document.getElementById('demoBox').innerHTML = '';
    const selectedAttribute = this.aSelect.options[this.aSelect.selectedIndex].text;
    const checkboxes = [];
    for (let i; i < this.data.length; i += 1) {
      if (this.data[i][selectedAttribute] !== '' && !(checkboxes.includes(this.data[i][selectedAttribute]))) {
        const tempInput = document.createElement('input');
        tempInput.value = this.data[i][selectedAttribute];
        tempInput.type = 'checkbox';
        tempInput.addEventListener('click', this.displayBridges);
        tempInput.classList.add('Sestiere');
        const newlabel = document.createElement('Label');
        newlabel.setAttribute('for', tempInput.ID);
        newlabel.innerHTML = this.data[i][selectedAttribute];
        document.getElementById('demoBox').append(tempInput);
        document.getElementById('demoBox').append(newlabel);
        document.getElementById('demoBox').append(document.createElement('br'));
        checkboxes[checkboxes.length] = this.data[i][selectedAttribute];
      }
    }
  }
}


import EditorGenerator from './EditorGenerator';

class Filter {
  constructor(avisual) {
    this.visual = avisual;
  }
  /**
  *Returns array of data where each represents the data for a single series.
  */
  getFilteredData(filters) {
    const renderData = [];
    for (let i = 0; i < filters.length; i += 1) {
      if (filters[i] !== undefined && filters[i].categorical !== undefined
      && filters[i].numeric !== undefined) {
        renderData[i] = this.visual.filterCategorical(filters[i].categorical, this.visual.data);
        renderData[i] = this.visual.filterNumerical(filters[i].numeric, renderData[i]);
      }
    }
    return renderData;
  }
/**
*Generates a filter series
*@param makeHeader, Function that is called to design header of drop down
*@param onButton, Function to be called when the render button is pressed
*@param buttonText, Text for Render/Submit button
*/
  makeFilterSeries(makeHeader, onButton, buttonText = 'Generate Map') {
    const editor = new EditorGenerator(this.visual.renderControlsDiv);
    this.visual.renderControlsDiv.innerHTML += '<ul id=\'collapseUl\'class="collapsible" data-collapsible="accordion">';
    this.ul = document.getElementById('collapseUl');
    this.visual.renderControlsDiv.appendChild(this.ul);

    this.seriesNumber = 0;
    this.li = document.createElement('li');
    this.ul.appendChild(this.li);
    this.filterHead = document.createElement('div');
    this.filterHead.classList.add('collapsible-header');
    this.headEditor = new EditorGenerator(this.filterHead);
    this.li.appendChild(this.filterHead);
    makeHeader(this.headEditor, this.seriesNumber);
    const filterDiv = document.createElement('div');
    filterDiv.classList.add('collapsible-body');
    this.li.appendChild(filterDiv);
    this.renderFilter(filterDiv, this.seriesNumber);
    this.addSeriesButton(editor, makeHeader);
    this.addSubmitButton(editor, buttonText, onButton);
  }
/** Renders individual filter series
*
*/
  renderFilter(myDiv) {
    const editor = new EditorGenerator(myDiv);
    this.visual.columnOptions = Object.keys(this.visual.data[0]);
    const catFilterDiv = document.createElement('div');
    const numFilterDiv = document.createElement('div');
    catFilterDiv.id = 'catFilterDiv';
    numFilterDiv.id = 'numFilterDiv';
    const catEditor = new EditorGenerator(catFilterDiv);
    const numEditor = new EditorGenerator(numFilterDiv);
    const ccats = [];
    const ncats = [];
    const catData = Object.keys(this.visual.getCategoricalData()[0]);
    const numData = Object.keys(this.visual.getNumericData(2)[0]);
    let num = 0;
    for (let i = 0; i < catData.length; i += 1) {
      ccats.push({ value: catData[i], text: catData[i] });
    }
    for (let i = 0; i < numData.length; i += 1) {
      ncats.push({ value: numData[i], text: numData[i] });
    }

  //  renderControlsDiv.append(document.createElement('br'));
    const filterLabel = document.createElement('h5');
    filterLabel.innerHTML = 'Categorical Filters';
    filterLabel.style.textAlign = 'center';
    myDiv.appendChild(filterLabel);
    myDiv.appendChild(catFilterDiv);
    this.createAddCategoryButton(editor, catEditor, ccats, num);
    myDiv.appendChild(document.createElement('br'));
    myDiv.appendChild(document.createElement('br'));
    const filterLabel2 = document.createElement('h5');
    filterLabel2.innerHTML = 'Numeric Filters';
    filterLabel2.style.textAlign = 'center';
    myDiv.appendChild(filterLabel2);
    myDiv.appendChild(numFilterDiv);
    this.createCategoryFilter(catEditor, ccats);
    numEditor.createNumericFilter(`NumFilter-${this.seriesNumber}`, ncats, `numFilter${this.seriesNumber}`, (e) => {
      this.removeFilter(e.currentTarget);
    });
    editor.createButton('addNum', 'Add Numeric Filter', () => {
      num += 1;
      numEditor.createNumericFilter(`NumFilter${num}-${this.seriesNumber}`, ncats, `numFilter${this.seriesNumber}`, (e) => { this.removeFilter(e.currentTarget); });
    });

    myDiv.appendChild(document.createElement('br'));
    myDiv.appendChild(document.createElement('br'));
  }


  addSeriesButton(editor, makeHeader) {
    editor.createButton('addSeries', 'Add a Data Series', () => {
      this.li = document.createElement('li');
      this.ul.appendChild(this.li);
      this.filterHead = document.createElement('div');
      this.filterHead.classList.add('collapsible-header');
      const headEditor2 = new EditorGenerator(this.filterHead);
      this.seriesNumber += 1;
      this.li.appendChild(this.filterHead);
      makeHeader(headEditor2, this.seriesNumber);
      this.filterDiv = document.createElement('div');
      this.filterDiv.classList.add('collapsible-body');
      this.li.appendChild(this.filterDiv);

      this.renderFilter(this.filterDiv, this.seriesNumber);
    });
  }
  addSubmitButton(editor, buttonText, onButton) {
    editor.createButton('submit', buttonText, () => {
      for (let k = 0; k <= this.seriesNumber; k += 1) {
        const dataFilters = [];
        const numericFilters = [];
        const catFilters = document.getElementsByClassName(`dataFilter${k}`);
        const numFilters = document.getElementsByClassName(`numFilter${k}`);
        for (let i = 0; i < catFilters.length; i += 1) {
          const filter = catFilters[i];
          const columnval = $(filter.children[0].children[0].children[3]).val();
          let catval = $(filter.children[2].children[0].children[3]).val();
          const b = $(filter.children[1].children[0].children[3]).val();
          if (b === '0') {
            const categories = this.visual.getGroupedList(columnval);
            for (let j = 0; j < categories.length; j += 1) {
              categories[j] = categories[j].key;
              if (catval.includes(categories[j])) {
                categories.splice(j, 1);
              }
            }
            catval = categories;
          }
          dataFilters.push({ column: columnval, categories: catval });
        }
        for (let i = 0; i < numFilters.length; i += 1) {
          const filter = numFilters[i];
          const columnval = $(filter.children[0].children[0].children[3]).val();
          const opval = $(filter.children[1].children[0].children[3]).val();
          const val = $(filter.children[2].children[0]).val();
          numericFilters.push({ column: columnval, operation: opval, value: val });
        }

        this.visual.attributes.filters[k] = {
          numeric: numericFilters,
          categorical: dataFilters };
      }
      onButton(this.visual.attributes.filters);
      this.visual.render();
    });
  }
  createAddCategoryButton(editor, catEditor, ccats, num) {
    editor.createButton(`addCat-${this.seriesNumber}`, 'Add Categorical Filter', () => {
      num += 1;
      catEditor.createDataFilter(`Filter${num}-${this.seriesNumber}`, ccats, `dataFilter${this.seriesNumber}`, (e) => {
        const column = $(e.currentTarget).val();
        const categories = this.visual.getGroupedList(column);
        const catSelect = e.currentTarget.parentNode.parentNode.nextSibling.nextSibling
    .nextSibling.nextSibling.children[0].children[3];
        $(catSelect).empty().html(' ');
        $(catSelect).append(
    $('<option disabled=true></option>')
      .attr('Select', '-Select-')
      .text('-Select-'));
        for (let i = 0; i < categories.length; i += 1) {
          const value = categories[i].key;
          $(catSelect).append(
        $('<option></option>')
        .attr('value', value)
        .text(value),
      );
        }
        $(catSelect).material_select();
      }, (e) => { this.removeFilter(e.currentTarget); });
    });
  }
  createCategoryFilter(catEditor, ccats) {
    catEditor.createDataFilter(`Filter${this.seriesNumber}`, ccats, `dataFilter${this.seriesNumber}`, (e) => {
      const column = $(e.currentTarget).val();
      const categories = this.visual.getGroupedList(column);
      const catSelect = e.currentTarget.parentNode.parentNode.nextSibling.nextSibling
  .nextSibling.nextSibling.children[0].children[3];
      $(catSelect).empty().html(' ');
      $(catSelect).append(
    $('<option disabled=true></option>')
    .attr('Select', '-Select-')
    .text('-Select-'));
      for (let i = 0; i < categories.length; i += 1) {
        const value = categories[i].key;
        $(catSelect).append(
      $('<option></option>')
      .attr('value', value)
      .text(value),
    );
      }
      $(catSelect).material_select();
    }, (e) => { this.removeFilter(e.currentTarget); });
  }
  removeSeries(target) {
    target.parentNode.parentNode.remove();
  }
  removeFilter(buttonID) {
    buttonID.parentNode.parentNode.remove();
  }
}
export default Filter;

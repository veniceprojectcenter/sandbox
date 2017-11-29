
import EditorGenerator from './EditorGenerator';

class Filter {
  constructor(avisual) {
    this.visual = avisual;
    this.event = document.createEvent('Event');
    this.event.initEvent('addSeries', true, true);
  }
  /**
  *Returns array of data where each represents the data for a single series.
  */
  getFilteredData(filters) {
    for (let i = 0; i < filters.length; i += 1) {
      this.getFilteredDatum(i, filters[i]);
    }
    return this.visual.renderData;
  }
  getFilteredDatum(i, filter, dataSet = null) {
    if (filter !== undefined && filter.categorical !== undefined
    && filter.numeric !== undefined) {
      if (dataSet === null) {
        this.visual.renderData[i] = this.visual.filterCategorical(filter.categorical,
          this.visual.data);
      } else {
        this.visual.renderData[i] = this.visual.filterCategorical(filter.categorical,
           dataSet);
      }
      this.visual.renderData[i] = this.visual.filterNumerical(filter.numeric,
        this.visual.renderData[i]);
    }
  }

/**
*Generates a filter series
*@param makeHeader, Function that is called to design header of drop down
*@param onButton, Function to be called when the render button is pressed
*@param buttonText, Text for Render/Submit button
*/
  makeFilterSeries(makeHeader, onButton, buttonText = 'Generate Map', myDiv = this.visual.renderControlsDiv) {
    const editor = new EditorGenerator(myDiv);
    myDiv.innerHTML += '<ul id=\'collapseUl\'class="collapsible" data-collapsible="accordion">';
    this.ul = document.getElementById('collapseUl');
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
    this.renderFilter(filterDiv);
    filterDiv.dispatchEvent(this.event);

    this.addSeriesButton(editor, makeHeader);
    this.addSubmitButton(editor, buttonText, onButton);
  }
/** Renders individual filter series
*
*/
  renderFilter(myDiv, data = this.visual.data) {
    const editor = new EditorGenerator(myDiv);
    const catFilterDiv = document.createElement('div');
    const numFilterDiv = document.createElement('div');
    catFilterDiv.id = 'catFilterDiv';
    numFilterDiv.id = 'numFilterDiv';
    const catEditor = new EditorGenerator(catFilterDiv);
    const numEditor = new EditorGenerator(numFilterDiv);
    const ccats = [];
    const ncats = [];
    const catData = Object.keys(this.visual.getCategoricalData(25, data)[0]);
    const numData = Object.keys(this.visual.getNumericData(2, data)[0]);
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
    this.createAddCategoryButton(editor, catEditor, ccats, num, data);
    myDiv.appendChild(document.createElement('br'));
    myDiv.appendChild(document.createElement('br'));
    const filterLabel2 = document.createElement('h5');
    filterLabel2.innerHTML = 'Numeric Filters';
    filterLabel2.style.textAlign = 'center';
    myDiv.appendChild(filterLabel2);
    myDiv.appendChild(numFilterDiv);
    this.createCategoryFilter(catEditor, ccats, data);
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

      this.renderFilter(this.filterDiv);
      this.filterDiv.dispatchEvent(this.event);
    });
  }
  addSubmitButton(editor, buttonText, onButton) {
    editor.createButton('submit', buttonText, () => {
      for (let k = 0; k <= this.seriesNumber; k += 1) {
        const set = $(document.getElementById(`dataSet${k}-select`)).val();
        const dataFilters = [];
        const numericFilters = [];
        const catFilters = document.getElementsByClassName(`dataFilter${k}`);
        const numFilters = document.getElementsByClassName(`numFilter${k}`);
        if (catFilters.length === 0 && numFilters.length === 0) {
          this.visual.attributes.filters[k] = undefined;
        } else {
          for (let i = 0; i < catFilters.length; i += 1) {
            const filter = catFilters[i];
            const columnval = $(filter.children[0].children[0].children[3]).val();
            let catval = $(filter.children[2].children[0].children[3]).val();
            const b = $(filter.children[1].children[0].children[3]).val();
            if (b === '0') {
              let categories = null;
              if (set === undefined) {
                categories = this.visual.getGroupedList(columnval);
              } else {
                categories = this.visual.getGroupedList(columnval, this.visual.dataSets[set]);
              }
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
            dataSet: set,
            numeric: numericFilters,
            categorical: dataFilters };
        }
      }
      onButton(this.visual.attributes.filters);
      this.visual.render();
    });
  }
  createAddCategoryButton(editor, catEditor, ccats, num, data) {
    editor.createButton(`addCat-${this.seriesNumber}`, 'Add Categorical Filter', () => {
      num += 1;
      catEditor.createDataFilter(`Filter${num}-${this.seriesNumber}`, ccats, `dataFilter${this.seriesNumber}`, (e) => {
        const column = $(e.currentTarget).val();
        const categories = this.visual.getGroupedList(column, data);
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
  createCategoryFilter(catEditor, ccats, data) {
    catEditor.createDataFilter(`Filter${this.seriesNumber}`, ccats, `dataFilter${this.seriesNumber}`, (e) => {
      const column = $(e.currentTarget).val();
      const categories = this.visual.getGroupedList(column, data);
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
  reverseColumns() {

  }
}
export default Filter;

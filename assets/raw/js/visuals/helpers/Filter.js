import BoundarySelector from './BoundarySelector';
import EditorGenerator from './EditorGenerator';

class Filter {
  constructor(avisual) {
    this.visual = avisual;
    this.newNumericFilterEvent = document.createEvent('Event');
    this.newNumericFilterEvent.initEvent('newNumericFilter', true, true);
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
    if (filter.area !== undefined &&
      this.visual.map !== undefined) { // this.visual.map will be defined if true
      const selector = new BoundarySelector(this.visual.map);
      const points = this.visual.renderData[i];
      this.visual.renderData[i] = selector.getPointsInBoundary(points, filter.area);
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
    const li = document.createElement('li');
    this.ul.appendChild(li);
    this.filterHead = document.createElement('div');
    this.filterHead.classList.add('collapsible-header');
    this.headEditor = new EditorGenerator(this.filterHead);
    li.appendChild(this.filterHead);
    makeHeader(this.headEditor, 0);
    const filterDiv = document.createElement('div');
    filterDiv.classList.add('collapsible-body');
    li.appendChild(filterDiv);
    this.renderFilter(filterDiv);
    filterDiv.querySelector('div[id$=numFilterList] div.row').dispatchEvent(this.newNumericFilterEvent);

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
    const areaSelectorDiv = document.createElement('div');

    const newSeriesNum = this.ul.children.length - 1;
    catFilterDiv.class = 'catFilterDiv';
    catFilterDiv.id = `series${newSeriesNum}-catFilterList`;
    numFilterDiv.class = 'numFilterDiv';
    numFilterDiv.id = `series${newSeriesNum}-numFilterList`;
    areaSelectorDiv.id = 'areaSelectorDiv';

    const catEditor = new EditorGenerator(catFilterDiv);
    const numEditor = new EditorGenerator(numFilterDiv);
    const areaSelectorEditor = new EditorGenerator(areaSelectorDiv);

    const ccats = [];
    const ncats = [];
    const catData = Object.keys(this.visual.getCategoricalData(25, data)[0]);
    const numData = Object.keys(this.visual.getNumericData(2, data)[0]);

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
    editor.createButton(`addCat-${newSeriesNum}`, 'Add Categorical Filter', () => {
      const filterNum = $(myDiv).find('[id$=catFilterList]')[0].children.length;
      catEditor.createDataFilter(`Filter${newSeriesNum}-${filterNum}`, ccats, `series${seriesNum} catFilterRow`, (e) => {
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
    //this.createAddCategoryButton(editor, catEditor, ccats, data);
    myDiv.appendChild(document.createElement('br'));
    myDiv.appendChild(document.createElement('br'));
    const filterLabel2 = document.createElement('h5');
    filterLabel2.innerHTML = 'Numeric Filters';
    filterLabel2.style.textAlign = 'center';
    myDiv.appendChild(filterLabel2);
    myDiv.appendChild(numFilterDiv);
    this.createCategoryFilter(catEditor, ccats, data);
    numEditor.createNumericFilter(newSeriesNum, 0, ncats, (e) => {
      this.removeFilter(e.currentTarget);
    });
    editor.createButton(`addNum${newSeriesNum}`, 'Add Numeric Filter', () => {
      const list = myDiv.querySelector('div[id$=numFilterList]');
      const seriesNum = /series(\d+)/.exec(list.id.split('-')[0])[1];
      const numChildren = list.children.length;
      numEditor.createNumericFilter(seriesNum, numChildren, ncats, (e) => {
        this.removeFilter(e.currentTarget);
      });
      document.querySelector(`div#numFilter${seriesNum}-${numChildren}`).dispatchEvent(this.newNumericFilterEvent);
    });

    this.addAreaSelectorButton(editor, myDiv);

    myDiv.appendChild(document.createElement('br'));
    myDiv.appendChild(document.createElement('br'));
  }

  addAreaSelectorButton(editor, myDiv) {
    if ((this.visual.map === undefined) || (this.visual.map === null)) {
      return; // Don't add the area selector button if there's no map in the visual
    }
    const areaSelectorDiv = document.createElement('div');
    areaSelectorDiv.id = 'areaSelectorDiv';
    myDiv.appendChild(document.createElement('br'));
    myDiv.appendChild(document.createElement('br'));
    const filterLabel3 = document.createElement('h5');
    filterLabel3.innerHTML = 'Area Selection Filter';
    filterLabel3.style.textAlign = 'center';
    myDiv.appendChild(filterLabel3);
    myDiv.appendChild(areaSelectorDiv);
    const seriesNum = /series(\d+)-catFilterList/.exec($(myDiv).find('[id$=catFilterList]').attr('id'))[1];
    editor.createButton(`selectArea-${seriesNum}`, 'Select an Area', () => {
      const selector = new BoundarySelector(this.visual.map);
      selector.selectPoints((points) => {
        this.visual.attributes.areaSelections[seriesNum] = points;
        // console.log(this.visual.attributes.areaSelections);
      });
    });
  }

  addSeriesButton(editor, makeHeader) {
    editor.createButton('addSeries', 'Add a Data Series', () => {
      const li = document.createElement('li');
      const seriesNum = this.ul.children.length;
      this.ul.appendChild(li);
      this.filterHead = document.createElement('div');
      this.filterHead.classList.add('collapsible-header');
      const headEditor2 = new EditorGenerator(this.filterHead);
      li.appendChild(this.filterHead);
      makeHeader(headEditor2, seriesNum);
      const filterDiv = document.createElement('div');
      filterDiv.classList.add('collapsible-body');
      li.appendChild(filterDiv);

      this.renderFilter(filterDiv);
      filterDiv.querySelector('div[id$=numFilterList] div.row').dispatchEvent(this.newNumericFilterEvent);
    });
  }

  addSubmitButton(editor, buttonText, onButton) {
    editor.createButton('submit', buttonText, () => {
      for (let k = 0; k <= this.ul.childNodes.length; k += 1) {
        const set = $(document.getElementById(`dataSet${k}-select`)).val();
        const dataFilters = [];
        const numericFilters = [];
        const catFilters = document.getElementsByClassName(`series${k} catFilterRow`);
        const numFilters = document.getElementsByClassName(`series${k} numFilterRow`);
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
          let area = null;
          if (this.visual.attributes.areaSelections !== undefined) {
            area = this.visual.attributes.areaSelections[k];
            if ((area !== undefined) && (area !== null)) {
              area.push(area[0]);
            }
          }
          this.visual.attributes.filters[k] = {
            dataSet: set,
            numeric: numericFilters,
            categorical: dataFilters,
            area,
          };
        }
      }
      onButton(this.visual.attributes.filters);
      this.visual.render();
    });
  }

  createCategoryFilter(catEditor, ccats, data) {
    const seriesNum = this.ul.childNodes.length - 1;
    catEditor.createDataFilter(`Filter${seriesNum}-0`, ccats, `series${seriesNum} catFilterRow`, (e) => {
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
          .text(value));
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

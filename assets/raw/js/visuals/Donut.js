import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';
import ColorHelper from './helpers/ColorHelper';

/**
 * Class that is used for creating Donut charts
 */
class Donut extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);
    this.currentEditKey = null;
    this.useTransitions = true;
  }

  /**
   * Sets default attributes after data is loaded
   */
  onLoadData() {
    this.orderedGroups = null;
    this.changedBins = false;
    super.onLoadData();
  }

  /**
   * Creates menu options
   */
  renderControls() {
    super.renderControls();

    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    if (this.editmode === false) {
      this.editmode = true;
      this.render();
    }

    this.disableTransitions();

    const generalEditor = new EditorGenerator(document.getElementById('general-accordion-body'));
    const colorEditor = new EditorGenerator(document.getElementById('color-accordion-body'));
    const miscEditor = new EditorGenerator(document.getElementById('misc-accordion-body'));

    this.renderBasicControls();

    /*
    const cats = [];
    let catsRaw = Object.keys(this.getCategoricalData(50)[0]);
    catsRaw = catsRaw.concat(Object.keys(this.getNumericData(2)[0]));
    for (let i = 0; i < catsRaw.length; i += 1) {
      cats.push({ value: catsRaw[i], text: catsRaw[i] });
    }
    editor.createSelectBox('donut-column', 'Select column to display', cats,
     this.attributes.group_by, (e) => {
       const value = $(e.currentTarget).val();
       this.attributes.group_by = value;
       this.attributes.items = {};
       this.changedBins = true;
       if (this.isNumeric(this.attributes.group_by)) {
         document.getElementById('bin-start').style.display = 'inherit';
         document.getElementById('bin-size').style.display = 'inherit';
         $(document.getElementById('bin-size-field')).val(1);
         this.attributes.binSize = 1;
         $(document.getElementById('bin-start-field')).val(this.getMin(value));
         this.attributes.binStart = this.getMin(value);
         document.getElementById('bin-start-field').click();
         document.getElementById('bin-size-field').click();
         Materialize.updateTextFields();
       } else {
         document.getElementById('bin-start').style.display = 'none';
         document.getElementById('bin-size').style.display = 'none';
       }
       this.attributes.order = [];
       this.render();
       this.changedBins = false;
     });
     */

    miscEditor.createTextField('bin-start', 'Start Value of first Group', (e) => {
      this.attributes.binStart = $(e.currentTarget).val();
      this.changedBins = true;
      this.render();
      this.changedBins = false;
    });
    miscEditor.createTextField('bin-size', 'Group Size', (e) => {
      this.attributes.binSize = $(e.currentTarget).val();
      this.changedBins = true;
      this.render();
      this.changedBins = false;
    });
    const start = document.getElementById('bin-start');
    const size = document.getElementById('bin-size');
    start.style.display = 'none';
    size.style.display = 'none';

    if (this.currentEditKey !== null && this.attributes.color.mode === 'manual') { // TODO: make pieces movable in non-manual mode
      miscEditor.createColorField('donut-piececolor',
       `${this.currentEditKey} Color`,
       this.attributes.items[this.currentEditKey].color, (e) => {
         this.attributes.items[this.currentEditKey].color = $(e.currentTarget).val();
         this.render();
       },
      );
      miscEditor.createLeftRightButtons('donut-order', 'Change Piece Position',
        (e) => {
          const currentWeight = this.attributes.items[this.currentEditKey].weight;
          const keys = Object.keys(this.attributes.items);
          for (let i = 0; i < keys.length; i += 1) {
            if (this.attributes.items.hasOwnProperty(keys[i])) {
              if (this.attributes.items[keys[i]].weight === currentWeight - 1) {
                this.attributes.items[keys[i]].weight += 1;
                this.attributes.items[this.currentEditKey].weight -= 1;
                this.render();
                break;
              }
            }
          }
        },
        (e) => {
          const currentWeight = this.attributes.items[this.currentEditKey].weight;
          const keys = Object.keys(this.attributes.items);
          for (let i = 0; i < keys.length; i += 1) {
            if (this.attributes.items.hasOwnProperty(keys[i])) {
              if (this.attributes.items[keys[i]].weight === currentWeight + 1) {
                this.attributes.items[keys[i]].weight -= 1;
                this.attributes.items[this.currentEditKey].weight += 1;
                this.render();
                break;
              }
            }
          }
        });
    }

    const displayModes = [
      { value: 'hover', text: 'On Hover' },
      { value: 'always', text: 'Always Visible' },
      { value: 'hidden', text: 'Hidden' }];
    generalEditor.createSelectBox('donut-labelmode', 'Label Display', displayModes, this.attributes.label_mode,
      (e) => {
        this.attributes.label_mode = $(e.currentTarget).val();
        this.render();
      });

    generalEditor.createCheckBox('bubble-hideempty', 'Hide Empty Category', this.attributes.hide_empty, (e) => {
      this.attributes.hide_empty = e.currentTarget.checked;
      this.render();
    });

    const dogs = [
      { value: 'below', text: 'Below' },
      { value: 'above', text: 'Above' },
      { value: 'left', text: 'Left' },
      { value: 'right', text: 'Right' },
      { value: 'none', text: 'None' }];
    generalEditor.createSelectBox('drop-showlegend', 'Show Legend', dogs, this.attributes.show_legend, (e) => {
      this.attributes.show_legend = $(e.currentTarget).val();
      this.render();
    });
  }

  /**
   * Renders visuals for Donut chart
   */
  render() {
    if (!this.attributes.group_by) {
      return;
    }
    // Empty the container, then place the SVG in there
    Visual.empty(this.renderID);
    document.getElementById('visual').style.height = `${document.getElementById('visual').clientWidth}`;

    let data = null;
    this.renderData = JSON.parse(JSON.stringify(this.data));

    if (this.isNumeric(this.attributes.group_by)) {
      this.renderData = this.makeBin(this.attributes.group_by, Number(this.attributes.binSize),
      Number(this.attributes.binStart));
    }

    if (this.changedBins || this.orderedGroups == null) {
      data = this.getGroupedListCounts(this.attributes.group_by, this.renderData);
    } else {
      data = [];
      for (let i = 0; i < this.orderedGroups.length; i += 1) {
        data.push({ key: this.orderedGroups[i].key, value: this.orderedGroups[i].value.length });
      }
    }

    if (this.attributes.hide_empty) {
      data = Visual.hideEmpty(data);
    }
    const width = document.getElementById('visual').clientWidth;
    const height = width;
    const radius = width / 2;

    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius((radius - 10) * 0.6);

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('class', 'donut')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .style('width', '100%')
      .style('height', '100%');

    data = this.sortData(data);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    const tweenPie = (b) => {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
      return t => arc(i(t));
    };

    const g = svg.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc ');

    const path = g.append('path')
      .style('fill', (d, i) => {
        if (this.attributes.color.mode === 'palette' || this.attributes.items[d.data.key] === undefined) {
          this.attributes.items[d.data.key] = {
            weight: i,
            color: ColorHelper.gradientValue(d.index / (data.length - 1),
              this.attributes.color.start_color, this.attributes.color.end_color),
          };
        }
        return this.attributes.items[d.data.key].color;
      });

    if (this.useTransitions) {
      path.transition()
        .delay(500)
        .duration(700)
        .attrTween('d', tweenPie);
    } else {
      path.attr('d', arc);
    }

    this.renderKey(pie(data), this.attributes.show_legend);

    if (this.attributes.label_mode === 'hover') {
      const donut = this;
      const handleMouseOver = function (d) {
        const coordinates = d3.mouse(this);

        d3.select('#donut-tooltip').remove();

        d3.select(this)
          .attr('fill-opacity', '0.5');

        const text = svg.append('text')
          .attr('id', 'donut-tooltip')
          .attr('class', 'hovertext')
          .style('font-size', `${donut.attributes.font_size}pt`)
          .text(d.data.key);
        if (coordinates[0] > 0) {
          text.attr('transform', `translate(${coordinates[0] - 5} ${coordinates[1]})`)
          .attr('text-anchor', 'end');
        } else {
          text.attr('transform', `translate(${coordinates[0] + 5} ${coordinates[1]})`)
          .attr('text-anchor', 'start');
        }
      };

      const handleMouseOut = function () {
        d3.select(this)
          .attr('fill-opacity', 1);
        d3.select('#donut-tooltip').remove();
      };

      path.on('mousemove', handleMouseOver)
          .on('mouseout', handleMouseOut);
    } else if (this.attributes.label_mode === 'always') {
      g.append('text')
        .attr('class', 'alwaystext')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '.35em')
        .attr('style', `font-size:${this.attributes.font_size}pt`)
        .attr('id', d => `label-${d.data.key}`)
        .text(d => d.data.key);
    }

    if (this.editmode) {
      path.on('click', (d) => {
        this.currentEditKey = d.data.key;
        this.renderControls();
        this.render();
      });
      const editKey = this.currentEditKey;
      if (editKey !== null) {
        path.attr('stroke-width', (d) => {
          if (d.data.key === editKey) { return '1px'; }
          return '0';
        })
        .attr('stroke', 'black');
      }
    }

    this.renderBasics();
  }
}
export default Donut;

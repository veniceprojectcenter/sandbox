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
    this.attributes.can_stack = false;
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
  }

  /**
   * Renders visuals for Donut chart
   */
  render() {
    if (!super.render()) {
      return;
    }

    // Empty the container, then place the SVG in there

    /*
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
    */

    const width = document.getElementById('visual').clientWidth;
    const height = document.getElementById('visual').clientHeight;
    let radius = 0;
    if (width < height) {
      radius = width / 2;
    } else {
      radius = height / 2;
    }

    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius((radius - 10) * 0.6);

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('id', 'svgBox')
      .attr('class', 'donut')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .style('width', '100%')
      .style('height', '100%');

    // Flatten the data
    const data = this.flattenItems();

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

    const g2 = svg.selectAll('.arc2')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc ');

    const section = g.append('path')
      .style('fill', d => this.attributes.items[d.data.key].color);

    if (this.useTransitions) {
      section.transition()
        .delay(500)
        .duration(700)
        .attrTween('d', tweenPie);
    } else {
      section.attr('d', arc);
    }

    if (this.attributes.label_mode === 'hover') {
      this.hoverTextDisplay(svg, section, [(width / 2), (height / 2)]);
    } else if (this.attributes.label_mode === 'always') {
      let outline = '#FFFFFF';
      if (ColorHelper.isLight(this.attributes.font_color)) {
        outline = '#000000';
      }

      g2.append('text')
        .attr('class', 'alwaystext')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '.35em')
        .style('font-size', `${this.attributes.font_size}pt`)
        .style('fill', `${this.attributes.font_color}`)
        .style('color', `${this.attributes.font_color}`)
        .style('stroke', `${outline}`)
        .style('stroke-width', '0.025em')
        .style('stroke-linejoin', 'round')
        .attr('id', d => `label-${d.data.key}`)
        .text(d => d.data.key);
    }

    if (this.editmode) {
      section.on('click', (d) => {
        this.currentEditKey = d.data.key;
        this.renderControls();
        this.render();
      });
      const editKey = this.currentEditKey;
      if (editKey !== null) {
        section.attr('stroke-width', (d) => {
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

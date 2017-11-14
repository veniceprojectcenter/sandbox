import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';
import ColorHelper from './helpers/ColorHelper';

class Donut extends Visual {
  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);
    this.editmode = false;
    this.currentEditKey = null;
  }

  onLoadData() {
    let defaultCat = '';
    if (this.data.length > 0) {
      const cats = Object.keys(this.data[0]);
      if (cats.length > 1) {
        defaultCat = cats[1];
      }
    }
    this.orderedGroups = null;
    this.changedBins = false;
    this.applyDefaultAttributes({
      width: 500,
      height: 500,
      dontDefineDimensions: false,
      font_size: 30,
      hide_empty: true,
      color: {
        mode: 'manual',
      },
      items: {}, // Contains objects that specify: key: {weight, color} where
                 // a weight of 0 means first on the donut chart
      label_mode: 'hover',
      group_by: defaultCat,
      title: '',
    });
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    if (this.editmode === false) {
      this.editmode = true;
      this.render();
    }

    this.disableTransitions();

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Configure Donut Chart');
    editor.createTextField('donut-title', 'Donut Title', (e) => {
      this.attributes.title = $(e.currentTarget).val();
      this.render();
    });

    const cats = [];
    let catsRaw = Object.keys(this.getCategoricalData()[0]);
    catsRaw = catsRaw.concat(Object.keys(this.getNumericData()[0]));
    for (let i = 0; i < catsRaw.length; i += 1) {
      cats.push({ value: catsRaw[i], text: catsRaw[i] });
    }
    editor.createSelectBox('donut-column', 'Select column to display', cats, this.attributes.group_by,
     (e) => {
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
    editor.createTextField('bin-start', 'Start Value of first Group', (e) => {
      this.attributes.binStart = $(e.currentTarget).val();
      this.changedBins = true;
      this.render();
      this.changedBins = false;
    });
    editor.createTextField('bin-size', 'Group Size', (e) => {
      this.attributes.binSize = $(e.currentTarget).val();
      this.changedBins = true;
      this.render();
      this.changedBins = false;
    });
    const start = document.getElementById('bin-start');
    const size = document.getElementById('bin-size');
    start.style.display = 'none';
    size.style.display = 'none';

    if (this.currentEditKey != null) {
      editor.createColorField('donut-piececolor',
       `${this.currentEditKey} Color`,
       this.attributes.items[this.currentEditKey].color, (e) => {
         const value = $(e.currentTarget).val();
         this.attributes.items[this.currentEditKey].color = value;
         this.render();
       },
      );
      editor.createLeftRightButtons('donut-order', 'Change Piece Position',
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

    editor.createCheckBox('bubble-hideempty', 'Hide Empty Category', this.attributes.hide_empty, (e) => {
      this.attributes.hide_empty = e.currentTarget.checked;
      this.render();
    });

    editor.createNumberSlider('donut-font-size',
     'Label Font Size',
      this.attributes.font_size,
       1, 60,
     (e) => {
       const value = $(e.currentTarget).val();
       this.attributes.font_size = `${value}`;
       this.render();
     });

    const displayModes = [
      { value: 'hover', text: 'On Hover' },
      { value: 'always', text: 'Always Visible' },
      { value: 'hidden', text: 'Hidden' }];
    editor.createSelectBox('donut-labelmode', 'Label Display', displayModes, this.attributes.label_mode,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.label_mode = value;
        this.render();
      });
  }

  render() {
    // Empty the container, then place the SVG in there
    Visual.empty(this.renderID);
    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2;
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

    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(100);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    if (this.attributes.title !== '') {
      const title = d3.select(`#${this.renderID}`).append('h3')
        .attr('class', 'visual-title');
      title.html(this.attributes.title);
    }

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('class', 'donut')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    if (!this.attributes.dontDefineDimensions) {
      d3.select(`#${this.renderID} > svg`)
        .style('width', this.attributes.width)
        .style('height', this.attributes.height);
    }

    if (this.attributes.hide_empty) {
      data = data.filter(d => d.key !== '');
    }

    data = data.sort((a, b) => {
      if (this.attributes.items[b.key] !== undefined &&
      this.attributes.items[a.key] !== undefined) {
        return this.attributes.items[b.key].weight - this.attributes.items[a.key].weight;
      }
      return 0;
    });
    console.log(data);

    const g = svg.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc ');

    const tweenPie = function (b) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
      return function (t) { return arc(i(t)); };
    };
    const path = g.append('path')
      .style('fill', (d, i) => {
        if (this.attributes.items[d.data.key] === undefined) {
          const hue = d.index / data.length;
          const color = d3.hsl(hue * 360.0, 1, 0.6);
          this.attributes.items[d.data.key] = {
            weight: i,
            color: ColorHelper.rgbToHex(color.toString()),
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

    if (this.attributes.label_mode == 'hover') {
      const donut = this;
      const handleMouseOver = function (d, i) {
        let coordinates = [0, 0];
        coordinates = d3.mouse(this);

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

      const handleMouseOut = function (d, i) {
        d3.select(this)
          .attr('fill-opacity', 1);
        d3.select('#donut-tooltip').remove();
      };

      path.on('mousemove', handleMouseOver)
          .on('mouseout', handleMouseOut);
    } else if (this.attributes.label_mode == 'always') {
      g.append('text')
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
        console.log(d);
      });
    }
  }
}
export default Donut;

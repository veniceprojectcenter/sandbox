import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';

class Bar extends Visual {

  /**
   * Sets default attributes after data is loaded
   */
  onLoadData() {
    this.attributes.can_stack = true;
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

    const generalEditor = new EditorGenerator(document.getElementById('general-accordion-body'));
    const colorEditor = new EditorGenerator(document.getElementById('color-accordion-body'));
    const miscEditor = new EditorGenerator(document.getElementById('misc-accordion-body'));

    const cats = [];
    const catsRaw = Object.keys(this.data[0]);
    for (let i = 0; i < catsRaw.length; i += 1) {
      cats.push({ value: catsRaw[i], text: catsRaw[i] });
    }
    cats.unshift({ value: 'No Column', text: 'No Column' });

    generalEditor.createSelectBox('bar-column-stack', 'Select stacked column', cats,
      this.attributes.group_by_stack, (e) => {
        this.attributes.group_by_stack = $(e.currentTarget).val();
        if (this.attributes.group_by_stack === 'No Column') {
          document.getElementById('key').style.display = 'none';
          document.getElementById('drop-showlegend').style.display = 'none';
        } else {
          document.getElementById('key').style.display = 'block';
          document.getElementById('drop-showlegend').style.display = 'block';
        }
        this.structureData();
        this.renderKey();
        this.render();
      }, '', 'Select a Property', 'column-select');

    this.attributes.show_x_label = true;
    this.attributes.show_y_label = true;

    miscEditor.createTextField('bar-x-label', 'Custom X Label', (e) => {
      this.attributes.x_label = e.currentTarget.value;
      this.render();
    }, this.attributes.x_label);

    miscEditor.createCheckBox('bar-show-x', 'Show X Label', this.attributes.show_x_label, (e) => {
      this.attributes.show_x_label = e.currentTarget.checked;
      this.render();
    });

    miscEditor.createTextField('bar-y-label', 'Custom Y Label', (e) => {
      this.attributes.y_label = e.currentTarget.value;
      this.render();
    }, this.attributes.y_label);

    document.getElementById('bar-y-label').style.marginTop = '0';

    miscEditor.createCheckBox('bar-show-y', 'Show Y Label', this.attributes.show_y_label, (e) => {
      this.attributes.show_y_label = e.currentTarget.checked;
      this.render();
    });

    document.getElementById('bar-show-y').style.marginBottom = '5%';

    miscEditor.createNumberSlider('bar-x-font-rotation',
      'X Axis Font Rotation', this.attributes.x_font_rotation, 0, 90, 1,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.x_font_rotation = `${value}`;
        this.render();
      });
    miscEditor.createNumberSlider('bar-x-font-x-offset',
      'X Axis Font X Offset', this.attributes.x_font_x_offset, -50, 50, 1,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.x_font_x_offset = `${value}`;
        this.render();
      });
    miscEditor.createNumberSlider('bar-x-font-y-offset',
      'X Axis Font Y Offset', this.attributes.x_font_y_offset, -50, 50, 1,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.x_font_y_offset = `${value}`;
        this.render();
      });
  }

  /**
   * Renders visuals for Bar chart
   */
  render() {
    if (!super.render()) {
      return;
    }

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('id', 'svgBox')
      .attr('class', 'bar');

    const dt = document.getElementById('visual');
    const margin = { top: (dt.clientHeight * 0.02),
      right: (dt.clientWidth * 0.02),
      bottom: (dt.clientHeight * 0.02),
      left: (dt.clientWidth * 0.02) };
    const width = dt.clientWidth - (margin.left + margin.right);
    const height = dt.clientHeight - (margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand();
    const y = d3.scaleLinear();

    // Assemble appropriate data
    let keys = [];
    let stackData = [];
    if (this.attributes.group_by_stack !== 'No Column') {
      keys = this.getSubkeys();
      stackData = [];
      const outerKeys = Object.keys(this.attributes.items);
      for (let i = 0; i < outerKeys.length; i += 1) {
        stackData.push({ key: outerKeys[i] });
        for (let j = 0; j < keys.length; j += 1) {
          if (this.attributes.items[outerKeys[i]].subitems &&
            this.attributes.items[outerKeys[i]].subitems[keys[j]]) {
            stackData[i][keys[j]] = this.attributes.items[outerKeys[i]].subitems[keys[j]].value;
          } else {
            stackData[i][keys[j]] = 0;
          }
        }
      }

      stackData = stackData.sort((a, b) => d3.ascending(a.key, b.key));
    } else {
      stackData = this.flattenItems();
      keys = ['value'];
    }

    // Prep data for d3
    const outerKeys = stackData.map(a => a.key);
    const stack = [];
    for (let i = 0; i < keys.length; i += 1) {
      stack.push([]);
      stack[i].index = i;
      stack[i].key = keys[i];
      for (let j = 0; j < outerKeys.length; j += 1) {
        if (keys.length === 1) {
          stack[i].push({
            key: outerKeys[j],
            stack: { start: 0, end: this.attributes.items[outerKeys[j]].value },
            color: this.attributes.items[outerKeys[j]].color,
          });
        } else {
          let start = 0;
          if (i > 0) {
            start = stack[i - 1][j].stack.end;
          }
          let end = start;
          let color;
          if (this.attributes.items[outerKeys[j]].subitems[keys[i]]) {
            end = start + this.attributes.items[outerKeys[j]].subitems[keys[i]].value;
            color = this.attributes.items[outerKeys[j]].subitems[keys[i]].color;
          }
          stack[i].push({
            key: outerKeys[j],
            stack: { start, end },
            color,
          });
        }
      }
    }

    // Set graph dimensions
    x.domain(stackData.map(a => a.key));
    y.domain([0, d3.max(stack[stack.length - 1].map(item => item.stack.end))]);

    let offsetWidth = 0;
    let offsetHeight = 0;
    let yText = this.attributes.y_label;
    if (!yText || yText === '') {
      yText = `Number of ${this.dataSet}`;
    }
    if (this.attributes.show_y_label) {
      offsetWidth = (this.lengthinPX('W')[1]);
      svg.append('g')
        .attr('transform', `translate(${(offsetWidth * 0.5)}, ${(height / 2)})`)// ((height / 2) + (yLabelLength / 2)))//((textHeight * 0.2)))
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(270)')
        .style('font-size', `${this.attributes.font_size}pt`)
        .style('fill', `${this.attributes.font_color}`)
        .style('color', `${this.attributes.font_color}`)
        .text(yText);
    }
    const fontOffset = 2 * (this.attributes.font_size - 10);

    let xText = this.attributes.x_label;
    if (!xText || xText === '') {
      xText = this.attributes.group_by;
    }
    if (this.attributes.show_x_label) {
      offsetHeight = ((this.lengthinPX('W')[1]));
      svg.append('g')
      .attr('id', 'bar-x-axis')
      .attr('class', 'bar-x-axis')
      .attr('transform', `translate(${(width / 2)}, ${height + margin.top + margin.bottom})`)// ((height / 2) + (yLabelLength / 2)))//((textHeight * 0.2)))
      .append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', `${this.attributes.font_size}pt`)
      .style('fill', `${this.attributes.font_color}`)
      .style('color', `${this.attributes.font_color}`)
      .text(xText);
    }
    // Axes
    y.rangeRound([height - (offsetHeight * 2), 0]);
    x.rangeRound([0, width - (offsetWidth * 2)]).padding(0.05);

    g.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', `translate(0,${offsetHeight})`)
      .call(d3.axisLeft(y).ticks(10))
      .selectAll('text')
      .attr('text-anchor', 'end')
      .styles({
        'font-size': `${this.attributes.font_size}pt`,
        fill: `${this.attributes.font_color}`,
        color: `${this.attributes.font_color}`,
        'font-family': 'Gilroy',
      });

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('id', 'bar-x-labels')
      .attr('transform', `translate(0,${height - offsetHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('text-anchor', 'end')
      .styles({
        'font-size': `${this.attributes.font_size}pt`,
        fill: `${this.attributes.font_color}`,
        color: `${this.attributes.font_color}`,
        'font-family': 'Gilroy',
        transform: `rotate(-${this.attributes.x_font_rotation}deg) translate(${this.attributes.x_font_x_offset}px,${this.attributes.x_font_y_offset}px)`,
      });

    g.append('g')
    .selectAll('g')
    .data(stack)
    .enter()
    .append('g')
      .attr('fill', (d) => {
        let color = '#000000';
        for (let i = 0; i < d.length; i += 1) {
          if (d[i].color) {
            color = d[i].color;
            break;
          }
        }
        return color;
      })
    .selectAll('rect')
    .data(d => d)
    .enter()
    .append('rect')
    .attr('x', d => x(d.key))
      .attr('y', d => (y(d.stack.end) + offsetHeight))
    .attr('height', d => y(d.stack.start) - y(d.stack.end))
    .attr('width', x.bandwidth());

    if (xText) {
      d3.select('#bar-x-axis').attr('transform', `translate(${width / 2}, ${height + svg.select('.axis--x').node().getBBox().height - offsetHeight})`);
    }

    const gbox = g.node().getBBox();
    g.attr('transform', `translate(${-gbox.x + offsetWidth},${margin.top - offsetHeight})`);
    const viewBoxWidth = gbox.width + fontOffset + gbox.x + margin.left + margin.right;
    const viewBoxHeight = gbox.height + gbox.y + margin.top + margin.bottom;
    svg.attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    this.renderBasics();
  }
}

export default Bar;

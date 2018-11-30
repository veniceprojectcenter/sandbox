import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';
import ColorHelper from './helpers/ColorHelper';

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
        this.structureData();
        this.render();
      }, '', 'Select a Property', 'column-select');

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

    let renderData = JSON.parse(JSON.stringify(this.data));

    if (this.isNumeric(this.attributes.group_by)) {
      renderData = this.makeBin(this.attributes.group_by, Number(this.attributes.binSize),
        Number(this.attributes.binStart));
    }

    const svg = d3.select(`#${this.renderID}`).append('svg')
    .attr('class', 'bar');

    const margin = { top: 10, right: 10, bottom: 35, left: 25 };
    const dt = document.getElementById(`${this.renderID}`);
    const width = dt.scrollWidth - (margin.left + margin.right);
    const height = width * (1.0 / this.attributes.aspect_ratio);

    const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand();
    const y = d3.scaleLinear();

    // Assemble appropriate data
    let keys = [];
    let stackData = [];
    let dataSizes = [];
    if (this.attributes.group_by_stack !== 'No Column') {
      const cats = [this.attributes.group_by, this.attributes.group_by_stack];
      const multiLevelData = Visual.groupByMultiple(cats, renderData);
      const innerLevelData = Object.values(multiLevelData);
      dataSizes = innerLevelData.map(d => Object.values(d).reduce((a, b) => a.concat(b)).length);

      Object.keys(multiLevelData).forEach((k) => {
        keys = keys.concat(Object.keys(multiLevelData[k]));
      });
      keys = keys.filter((e, i) => keys.indexOf(e) === i).sort();
      Object.keys(multiLevelData).forEach((k) => {
        const tempObj = {};
        keys.forEach((key) => {
          if (typeof multiLevelData[k][key] !== 'undefined') {
            tempObj[key] = multiLevelData[k][key].length;
          } else {
            tempObj[key] = 0;
          }
        });
        tempObj.key = k;
        stackData.push(tempObj);
      });
    } else {
      const cats = this.attributes.group_by;
      const data = Visual.groupBy(cats, renderData);
      const innerData = Object.values(data);
      dataSizes = innerData.map(d => d.length);

      keys = ['value'];
      Object.keys(data).forEach((k) => {
        stackData.push({ key: k, value: data[k].length });
      });

      // TODO: this does not account for filtering empty
    }

    if (this.attributes.hide_empty) {
      stackData = Visual.hideEmpty(stackData);
      keys = Visual.hideEmpty(keys.map((a) => {
        return { key: a };
      })).map(a => a.key);
    }

    stackData = stackData.sort((a, b) => d3.ascending(a.key, b.key));
    x.domain(stackData.map(a => a.key));
    y.domain([0, d3.max(dataSizes)]);

    // Render the key
    //this.renderKey(keys, 'below');
    let lbox = {};
    if (this.attributes.group_by_stack !== 'No Column') {
      const legend = g.append('g')
      .attr('font-size', `${this.attributes.font_size}pt`)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(keys.slice())
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(10,${(keys.length - i) * 1.25 * this.attributes.font_size})`);

      legend.append('rect')
      .attr('width', `${this.attributes.font_size}`)
      .attr('height', `${this.attributes.font_size}`)
      .attr('fill', (d, e) => ColorHelper.gradientValue(e / (keys.length - 1),
          this.attributes.color.start_color, this.attributes.color.end_color));

      legend.append('text')
      .attr('y', '0.5em')
      .attr('dy', '0.25em')
      .text(d => (d === '' ? 'NULL' : d));

      lbox = legend.node().getBBox();
      legend.selectAll('rect')
      .attr('x', width - (0.25 * lbox.width) - this.attributes.font_size - 15);
      legend.selectAll('text')
      .attr('x', width - (0.25 * lbox.width) - this.attributes.font_size - 20);
    } else {
      lbox = {
        x: 0, y: 0, width: 0, height: 0,
      };
    }

    // Axes
    y.rangeRound([height, 0]);

    g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(y).ticks(10))
    .selectAll('text')
    .attr('text-anchor', 'end')
    .styles({
      'font-size': `${this.attributes.font_size}pt`,
      'font-family': 'Gilroy',
    });

    const ybox = svg.select('.axis--y').node().getBBox();

    const adjWidth = width - (ybox.width + lbox.width) - 25;
    x.rangeRound([0, adjWidth]).padding(0.1);

    g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('text-anchor', 'end')
    .styles({
      'font-size': `${this.attributes.font_size}pt`,
      'font-family': 'Gilroy',
      transform: `rotate(-${this.attributes.x_font_rotation}deg) translate(${this.attributes.x_font_x_offset}px,${this.attributes.x_font_y_offset}px)`,
    });


    const stack = d3.stack().keys(keys)(stackData);

    for (let i = 0; i < stack.length; i += 1) {
      for (let j = 0; j < stack[0].length; j += 1) {
        stack[i][j] = {
          key: stack[i][j].data.key,
          value: stack[i][j].data.value,
          stack: { start: stack[i][j][0], end: stack[i][j][1] },
        };
      }
    }

    g.append('g')
    .selectAll('g')
    .data(stack)
    .enter()
    .append('g')
    .attr('fill', (d, e) => ColorHelper.gradientValue(e / (keys.length - 1),
      this.attributes.color.start_color, this.attributes.color.end_color))
    .selectAll('rect')
    .data(d => d)
    .enter()
    .append('rect')
    .attr('x', d => x(d.key))
    .attr('y', d => y(d.stack.end))
    .attr('height', d => y(d.stack.start) - y(d.stack.end))
    .attr('width', x.bandwidth());

    const gbox = g.node().getBBox();
    g.attr('transform', `translate(${-gbox.x},${margin.top})`);
    const fontOffset = 2 * (this.attributes.font_size - 10);
    const viewBoxWidth = gbox.width + fontOffset + gbox.x + margin.left + margin.right;
    const viewBoxHeight = gbox.height + gbox.y + margin.top + margin.bottom;
    svg.attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    this.renderBasics();
  }
}

export default Bar;

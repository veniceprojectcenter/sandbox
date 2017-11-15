import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';

class Bar extends Visual {
  onLoadData() {
    let defaultCat1 = '';
    let defaultCat2 = '';
    if (this.data.length > 0) {
      const cats = Object.keys(this.data[0]);
      if (cats.length > 2) {
        defaultCat1 = cats[1];
        defaultCat2 = cats[2];
        console.log(`Using ${defaultCat1} and ${defaultCat2}`);
      }
    }
    this.applyDefaultAttributes({
      width: 600,
      height: 450,
      font_size: '8',
      x_font_rotation: 45,
      x_font_x_offset: 0,
      x_font_y_offset: 0,
      color: {
        mode: 'list',
        colorspace: 'hcl',
        list: [
          0, 45, 90, 135, 180, 225, 270, 315,
          120, 165, 210, 255, 300, 345, 30, 75,
          240, 285, 330, 15, 60, 105, 150, 195,
        ],
        range: [0, 359],
      },
      hide_empty: '',
      category_order: '',
      group_by_main: defaultCat1,
      group_by_stack: defaultCat2,
      title: '',
    });
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }
    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Configure Bar Chart');

    editor.createTextField('bar-title', 'Bar Title', (e) => {
      this.attributes.title = $(e.currentTarget).val();
      this.render();
    });

    const cats = [];
    const catsRaw = Object.keys(this.getCategoricalData()[0]);
    for (let i = 0; i < catsRaw.length; i += 1) {
      cats.push({ value: catsRaw[i], text: catsRaw[i] });
    }

    editor.createSelectBox('bar-column-main', 'Select main column to display', cats, this.attributes.group_by_main,
     (e) => {
       const value = $(e.currentTarget).val();
       this.attributes.group_by_main = value;
       this.render();
     });
    const stackCats = cats;
    stackCats.unshift({ value: 'No Column', text: 'No Column' });
    editor.createSelectBox('bar-column-stack', 'Select stack column to display', stackCats, this.attributes.group_by_stack,
     (e) => {
       const value = $(e.currentTarget).val();
       this.attributes.group_by_stack = value;
       this.render();
     });

    editor.createNumberSlider('bar-font-size',
      'Label Font Size', this.attributes.font_size, 1, 60,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.font_size = `${value}`;
        this.render();
      });

    editor.createNumberSlider('bar-x-font-rotation',
      'X Axis Font Rotation', this.attributes.x_font_rotation, 0, 90,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.x_font_rotation = `${value}`;
        this.render();
      });
    editor.createNumberSlider('bar-x-font-x-offset',
      'X Axis Font X Offset', this.attributes.x_font_x_offset, -50, 50,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.x_font_x_offset = `${value}`;
        this.render();
      });
    editor.createNumberSlider('bar-x-font-y-offset',
      'X Axis Font Y Offset', this.attributes.x_font_y_offset, -50, 50,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.x_font_y_offset = `${value}`;
        this.render();
      });

    editor.createNumberSlider('bar-color',
      'Bar color', this.attributes.color.list[0], 0, 359,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.color.list[0] = `${value}`;
        this.render();
      });
  }

  render() {
    // Empty the container, then place the SVG in there
    Visual.empty(this.renderID);

    let renderData = JSON.parse(JSON.stringify(this.getCategoricalData()));

    if (this.isNumeric(this.attributes.group_by_main)) {
      renderData = this.makeBin(this.attributes.group_by_main, Number(this.attributes.binSize),
      Number(this.attributes.binStart));
    }

    const margin = { top: 10, right: 10, bottom: 35, left: 25 };
    const width = this.attributes.width - margin.left - margin.right;
    const height = this.attributes.height - margin.top - margin.bottom;
    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    let keys = [];
    const stackData = [];
    if (this.attributes.group_by_stack !== 'No Column') {
      const cats = [this.attributes.group_by_main, this.attributes.group_by_stack];
      const multiLevelData = Visual.groupByMultiple(cats, renderData);
      const innerLevelData = Object.values(multiLevelData);
      const dataMapFunction = d => Object.values(d).reduce((a, b) => a.concat(b)).length;
      const dataSizes = innerLevelData.map(dataMapFunction);

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

      x.domain(Object.keys(multiLevelData));
      y.domain([0, d3.max(dataSizes)]);
    } else {
      const cats = this.attributes.group_by_main;
      const data = Visual.groupBy(cats, renderData);
      const innerData = Object.values(data);
      const dataSizes = innerData.map(d => d.length);

      keys = ['value'];
      Object.keys(data).forEach((k) => {
        stackData.push({ key: k, value: data[k].length });
      });

      x.domain(Object.keys(data));
      y.domain([0, d3.max(dataSizes)]);
    }

    const colorspace = d3.scaleOrdinal().domain(keys).range(this.attributes.color.list);
    const z = i => d3.hcl(colorspace(keys[i]), 100, 50).rgb();

    if (this.attributes.title !== '') {
      const title = d3.select(`#${this.renderID}`).append('h3')
        .attr('class', 'visual-title');
      title.html(this.attributes.title);
    }

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('class', 'bar');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('text-anchor', 'end')
        .styles({
          'font-size': `${this.attributes.font_size}pt`,
          transform: `rotate(-${this.attributes.x_font_rotation}deg) translate(${this.attributes.x_font_x_offset}px,${this.attributes.x_font_y_offset}px)`,
        });

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y).ticks(10))
      .selectAll('text')
        .attr('text-anchor', 'end')
        .style('font-size', `${this.attributes.font_size}pt`);

    g.append('g')
      .selectAll('g')
      .data(d3.stack().keys(keys)(stackData))
      .enter()
      .append('g')
        .attr('fill', (d, e) => z(e))
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
        .attr('x', d => x(d.data.key))
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth());
    if (this.attributes.group_by_stack !== 'No Column') {
      const legend = g.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', `${this.attributes.font_size}pt`)
        .attr('text-anchor', 'end')
        .selectAll('g')
        .data(keys.slice())
        .enter()
        .append('g')
          .attr('transform', (d, i) => `translate(30,${(keys.length - i) * 1.25 * this.attributes.font_size})`);

      legend.append('rect')
        .attr('x', width - 19)
        .attr('width', `${this.attributes.font_size}`)
        .attr('height', `${this.attributes.font_size}`)
        .attr('fill', (d, e) => z(e));

      legend.append('text')
        .attr('x', width - 24)
        .attr('y', '0.5em')
        .attr('dy', '0.25em')
        .text(d => (d === '' ? 'NULL' : d));

      const lbox = legend.node().getBBox();
      legend.selectAll('rect')
        .attr('x', (width + lbox.width) - 14);
      legend.selectAll('text')
        .attr('x', (width + lbox.width) - 19);
    }

    const gbox = g.node().getBBox();
    g.attr('transform', `translate(${-gbox.x},${margin.top})`);
    svg.attr('width', gbox.width + gbox.x + 10)
      .attr('height', gbox.height + gbox.y + 10);
  }
}

export default Bar;

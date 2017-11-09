import Visual from '../Visual';
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
      height: 400,
      font_size: '8',
      x_font_rotation: 45,
      x_font_x_offset: 0,
      x_font_y_offset: 0,
      ccolors: {
        mode: 'list',
        colorspace: 'hcl',
        list: [0],
      },
      hide_empty: '',
      category_order: '',
      group_by_main: defaultCat1,
      group_by_stack: defaultCat2,
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
    const catsRaw = Object.keys(this.data[0]);
    for (let i = 0; i < catsRaw.length; i += 1) {
      cats.push({ value: catsRaw[i], text: catsRaw[i] });
    }

    editor.createSelectBox('bar-column-main', 'Select main column to display', cats, this.attributes.group_by_main,
     (e) => {
       const value = $(e.currentTarget).val();
       this.attributes.group_by_main = value;
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
    editor.createCheckBox('bar-hide-empty', 'Hide empty column?',
        (e) => {
          const value = $(e.currentTarget).val();
          // console.log(value);

          this.attributes.hide_empty = value;
          this.render();
        });
  }

  render() {
    // Empty the container, then place the SVG in there
    Visual.empty(this.renderID);

    const margin = { top: 10, right: 10, bottom: 20, left: 20 };
    const width = this.attributes.width - margin.left - margin.right;
    const height = this.attributes.height - margin.top - margin.bottom;
    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const renderData = JSON.parse(JSON.stringify(this.data));

    if (this.isNumeric(this.attributes.group_by_main)) {
      renderData = this.makeBin(this.attributes.group_by_main, Number(this.attributes.binSize),
      Number(this.attributes.binStart));
    }

    const data = this.getGroupedListCounts(this.attributes.group_by_main, renderData);

    if (this.attributes.hide_empty == 'true') {

    }

    console.log(data);
    if (this.attributes.title !== '') {
      const title = d3.select(`#${this.renderID}`).append('h3')
        .attr('class', 'visual-title');
      title.html(this.attributes.title);
    }

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'bar')
      .attr('viewBox', '0 0 600 400')
      .append('g');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    x.domain(data.map(d => d.key));
    y.domain([0, d3.max(data, d => d.value)]);

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
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('height')
        .style('font-size', `${this.attributes.font_size}pt`);

    g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
          .attr('class', 'bar')
          .attr('x', d => x(d.key))
          .attr('y', d => y(d.value))
          .attr('width', x.bandwidth())
          .attr('height', d => height - y(d.value));
  }
}

export default Bar;

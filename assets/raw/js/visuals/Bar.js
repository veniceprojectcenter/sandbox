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
      font_size: '1em',
      colors: [],
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
    editor.createSelectBox('bar-column-x', 'Select main column to display', cats, this.attributes.group_by_main,
     (e) => {
       const value = $(e.currentTarget).val();
       this.attributes.group_by_main = value;
       this.render();
     });
    editor.createSelectBox('bar-column-y', 'Select stack column to display', cats, this.attributes.group_by_stack,
     (e) => {
       const value = $(e.currentTarget).val();
       this.attributes.group_by_stack = value;
       this.render();
     });
  }

  render() {
    // Empty the container, then place the SVG in there
    Visual.empty(this.renderID);

    // console.log(this.data);
    const margin = { top: 10, right: 10, bottom: 20, left: 20 };
    const width = this.attributes.width - margin.left - margin.right;
    const height = this.attributes.height - margin.top - margin.bottom;
    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const renderData = JSON.parse(JSON.stringify(this.data));

    const data = this.getGroupedListCounts(this.attributes.group_by_main);
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
      .call(d3.axisBottom(x));

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y).ticks(10))
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('height');

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

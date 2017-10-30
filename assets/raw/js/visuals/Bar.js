import Visual from '../Visual';

class Bar extends Visual {
  constructor(config) {
    super(config);
    this.applyDefaultAttributes({
      width: 600,
      height: 400,
      font_size: '1em',
      colors: [],
      category_order: '',
    });
  }

  render() {
    // console.log(this.data);
    const margin = { top: 10, right: 10, bottom: 20, left: 20 };
    const width = this.attributes.width - margin.left - margin.right;
    const height = this.attributes.height - margin.top - margin.bottom;

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'bar')
      .attr('viewBox', '0 0 600 400')
      .append('g');

    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // d3.json(this.data, (d) => {
    //   d.height = +d.height;
    //   return d;
    // }, (error, data) => {
    //   if (error) throw error;

    x.domain(this.data.map(d => d.id));
    y.domain([0, d3.max(this.data, d => d.height)]);

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
        .data(this.data)
        .enter().append('rect')
          .attr('class', 'bar')
          .attr('x', d => x(d.id))
          .attr('y', d => y(d.height))
          .attr('width', x.bandwidth())
          .attr('height', d => height - y(d.height));
    // });
  }
}

export default Bar;

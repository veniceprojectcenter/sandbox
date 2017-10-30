import Visual from '../Visual';

class Donut extends Visual {
  constructor(config) {
    super(config);
    this.applyDefaultAttributes({
      width: 500,
      height: 500,
      font_size: '1em',
      colors: [],
      category_order: '',
    });
  }

  renderControls() {
    this.empty(this.renderControlsID);
  }

  render() {
    // Empty the container, then place the SVG in there
    this.empty(this.renderID);

    const width = this.attributes.width;
    const height = this.attributes.height;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(100);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'donut')
      .attr('viewBox', '0 0 500 500')
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const g = svg.selectAll('.arc')
      .data(pie(this.getGroupedListCounts('color')))
      .enter().append('g')
      .attr('class', 'arc ');

    g.append('path')
      .attr('d', arc)
      .style('fill', d => '#d0743c', // color(d.data.age);
      );

    g.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .attr('style', `font-size:${this.attributes.font_size}`)
      .text(d => d.data.key);
  }
}

export default Donut;

// new DonutVisual(
//   {
//     data: 'Lol!',
//     attributes:
//     {
//       category_field: 'population',
//     },
//   },
// ).render('visual');

import Visual from '../Visual';

class Bar extends Visual {
  constructor(config) {
    super(config);
    this.applyDefaultAttributes({
      width: 960,
      height: 500,
      font_size: '1em',
      colors: [],
      category_order: '',
    });
  }

  render() {

    const svg = d3.select(`#${this.renderID}`).append('svg')
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = this.attributes.width - margin.left - margin.right,
        height = this.attributes.height - margin.top - margin.bottom;

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    let g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(this.data.map(function(d) { return d.key; }));
    y.domain([0, d3.max(this.data, function(d) { return d.value; })]);

    g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("value");

    g.selectAll(".bar")
      .data(this.data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value); });

  }
}

export default Bar;

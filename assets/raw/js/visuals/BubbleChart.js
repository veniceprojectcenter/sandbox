import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';

class BubbleChart extends Visual {
  onLoadData() {
    let defaultCat;
    // Try to set a default selected column
    if (this.data.length > 0) {
      const cats = Object.keys(this.data[0]);
      if (cats.length > 1) {
        defaultCat = cats[1];
      }
    }

    this.applyDefaultAttributes({
      width: 500,
      height: 500,
      dontDefineDimensions: false,
      font_size: 20,
      label_mode: 'always',
      hide_empty: true,
      category_order: '',
      group_by: defaultCat,
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

    editor.createHeader('Configure Bubble Chart');
    const cats = [];
    const catsRaw = Object.keys(this.getCategoricalData()[0]);
    for (let i = 0; i < catsRaw.length; i += 1) {
      cats.push({ value: catsRaw[i], text: catsRaw[i] });
    }
    editor.createSelectBox('bubble-column', 'Select column to group by', cats, this.attributes.group_by,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.group_by = value;
        this.render();
      });

    const displayModes = [
        { value: 'always', text: 'Always Visible' },
        { value: 'hover', text: 'On Hover' },
        { value: 'hidden', text: 'Hidden' }];
    editor.createSelectBox('bubble-labelmode', 'Label Display', displayModes, this.attributes.label_mode,
        (e) => {
          const value = $(e.currentTarget).val();
          this.attributes.label_mode = value;
          this.render();
        });
    editor.createNumberSlider('bubble-labelsize', 'Label Size', this.attributes.font_size, 1, 60,
    (e) => {
      const value = $(e.currentTarget).val();
      this.attributes.font_size = `${value}`;
      this.render();
    });
    editor.createCheckBox('bubble-hideempty', 'Hide Empty Category', this.attributes.hide_empty, (e) => {
      this.attributes.hide_empty = e.currentTarget.checked;
      this.render();
    });
  }

  render() {
    Visual.empty(this.renderID);

    const svgWidth = 500;
    const svgHeight = 500;
    const diameter = 500;

    const bubble = d3.pack()
        .size([diameter, diameter])
        .padding(1.5);

    const svg = d3.select(`#${this.renderID}`).append('svg')
        .attr('class', 'bubble-chart')
        .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);


    let counts = this.getGroupedListCounts(this.attributes.group_by);
    if (this.attributes.hide_empty) {
      counts = counts.filter(cat => cat.key !== '');
    }
    const root = d3.hierarchy({ children: counts })
          .sum(d => d.value)
          .sort((a, b) => b.value - a.value);

    bubble(root);
    const node = svg.selectAll('.node')
      .data(root.children)
    .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);


    node.append('title')
      .text(d => `${d.data.key}: ${d.value}`);

    node.append('circle')
      .attr('r', d => d.r)
      .style('fill', 'gray');

    const text = svg.selectAll('.nodetext')
      .data(root.children)
      .enter()
      .append('text')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .attr('dy', '.3em')
      .attr('data-key', d => d.data.key)
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('font-size', `${this.attributes.font_size}pt`)
      .text(d => d.data.key);
    // let text = node.append('text')
    //   .attr('dy', '.3em')
    //   .style('text-anchor', 'middle')
    //   .style('pointer-events', 'none')
    //   .text(d => d.data.key);
    if (this.attributes.label_mode === 'hover') {
      text.style('display', 'none');
      const handleMouseOver = function (d, i) {
        d3.select(this)
            .attr('fill-opacity', 0.5);

        d3.select(this.parentNode.parentNode)
          .select(`text[data-key="${d.data.key}"]`)
          .style('display', 'initial');
      };

      const handleMouseOut = function (d, i) {
        d3.select(this)
            .attr('fill-opacity', 1);
        d3.select(this.parentNode.parentNode)
          .select(`text[data-key="${d.data.key}"]`)
          .style('display', 'none');
      };

      node.select('circle').on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut);
    } else if (this.attributes.label_mode == 'always') {

    }
  }
}
export default BubbleChart;

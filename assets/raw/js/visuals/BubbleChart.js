import Visual from './helpers/Visual';
import EditorGenerator from './helpers/EditorGenerator';
import ColorHelper from './helpers/ColorHelper';

/**
 * Class that is used for creating Bubble Charts
 */
class BubbleChart extends Visual {

  constructor(config, renderID, renderControlsID) {
    super(config, renderID, renderControlsID);
    this.editmode = false;
    this.currentEditKey = null;
    this.useTransitions = true;
    this.attributes.packed_graph = true;
  }

  /**
   * Sets default attributes after data is loaded
   */
  onLoadData() {
    this.attributes.can_stack = false;
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
    if (this.editmode === false) {
      this.editmode = true;
      this.render();
    }

    this.disableTransitions();

    const generalEditor = new EditorGenerator(document.getElementById('general-accordion-body'));
    const colorEditor = new EditorGenerator(document.getElementById('color-accordion-body'));
    const miscEditor = new EditorGenerator(document.getElementById('misc-accordion-body'));

    /*
    const cats = [];
    const catsRaw = Object.keys(this.getCategoricalData()[0]);
    for (let i = 0; i < catsRaw.length; i += 1) {
      cats.push({ value: catsRaw[i], text: catsRaw[i] });
    }
    editor.createSelectBox('bubble-column', 'Select column to group by', cats, this.attributes.group_by,
      (e) => {
        this.attributes.group_by = $(e.currentTarget).val();
        this.render();
      });
      */

    const displayModes = [
        { value: 'always', text: 'Always Visible' },
        { value: 'hover', text: 'On Hover' },
        { value: 'hidden', text: 'Hidden' }];
    generalEditor.createSelectBox('bubble-labelmode', 'Label Display', displayModes, this.attributes.label_mode,
        (e) => {
          this.attributes.label_mode = $(e.currentTarget).val();
          this.render();
        });

    if (this.attributes.color.mode === 'manual') {
      if (this.currentEditKey != null) {
        colorEditor.createSubHeader(`Edit Color for: ${this.currentEditKey}`);
        let currentColor = '#808080';
        const temp = this.attributes.color.colors.filter(c => c.key === this.currentEditKey);
        if (temp.length === 1) {
          currentColor = temp[0].value;
        }
        colorEditor.createColorField('bubble-colorpicker', 'Bubble Color', currentColor,
        (e) => {
          this.attributes.color.mode = 'manual';
          this.attributes.items[this.currentEditKey].color = $(e.currentTarget).val();
          this.render();
        });
      }
    }
  }

  /**
   * Renders visuals for Bubble chart
   */
  render() {
    if (!super.render()) {
      return;
    }

    const svgWidth = document.getElementById('visual').clientWidth;
    const svgHeight = document.getElementById('visual').clientHeight;

    const bubble = d3.pack()
        .size([svgWidth, svgHeight])
        .padding(1.5);

    const svg = d3.select(`#${this.renderID}`).append('svg')
        .attr('id', 'svgBox')
        .attr('class', 'bubble-chart')
        .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    const g = svg.append('g')
      .style('width', '100%')
      .style('height', '100%');
    const counts = this.flattenItems();

    const root = d3.hierarchy({ children: counts })
          .sum(d => d.value)
          .sort((a, b) => b.value - a.value);

    bubble(root);
    const node = g.selectAll('.node')
      .data(root.children)
    .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);


    node.append('title')
      .text((d) => {
        const percent = ((d.data.value / d.parent.value) * 100).toFixed(1);
        return `${d.data.key}: ${percent}%`;
      });

    const circles = node.append('circle')
      .attr('r', d => d.r)
      .style('fill', (d) => d.data.color);

    if (this.useTransitions) {
      circles.attr('transform', 'scale(0)')
        .transition()
        .delay((d, i) => 500 + (i * 10))
        .duration(500)
        .attr('transform', 'scale(1)');
    }

    const text = g.selectAll('.nodetext')
      .data(root.children)
      .enter()
      .append('text')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .attr('dy', '.3em')
      .attr('data-key', d => d.data.key)
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('fill', `${this.attributes.font_color}`)
      .style('color', `${this.attributes.font_color}`)
      .style('stroke', () => {
        if (ColorHelper.isLight(this.attributes.font_color)) {
          return '#000000';
        }
        return '#FFFFFF';
      })
      .style('stroke-width', '0.025em')
      .style('stroke-linejoin', 'round')
      .style('font-size', `${this.attributes.font_size}pt`)
      .text(d => d.data.key);

    if (this.useTransitions) {
      text.attr('transform', d => `translate(${d.x},${d.y})scale(0)`)
      .transition()
      .delay((d, i) => 500 + (i * 10))
      .duration(500)
      .attr('transform', d => `translate(${d.x},${d.y})scale(1)`);
    }

    // this.renderKey(root.children.map(a => a.key), 'below');

    if (this.attributes.label_mode === 'hover') {
      this.hoverTextDisplay(svg, node, [0, 0]);
      text.style('display', 'none');
      /*
      text.style('display', 'none');
      const handleMouseOver = function (d) {
        d3.select(this)
            .attr('fill-opacity', 0.5);

        d3.select(this.parentNode.parentNode)
          .select(`text[data-key="${d.data.key}"]`)
          .style('display', 'initial');
      };

      const handleMouseOut = function (d) {
        d3.select(this)
            .attr('fill-opacity', 1);
        d3.select(this.parentNode.parentNode)
          .select(`text[data-key="${d.data.key}"]`)
          .style('display', 'none');
      };

      node.select('circle').on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut); */
    } else if (this.attributes.label_mode === 'hidden') {
      text.style('display', 'none');
    }

    if (this.editmode && this.attributes.color.mode === 'manual') {
      node.select('circle').on('click', (d) => {
        this.currentEditKey = d.data.key;
        this.renderControls();
      });
    }

    this.renderBasics();
  }
}
export default BubbleChart;


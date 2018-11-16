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
  }

  /**
   * Sets default attributes after data is loaded
   */
  onLoadData() {
    super.onLoadData();
  }

  /**
   * Creates menu options
   */
  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }
    if (this.editmode === false) {
      this.editmode = true;
      this.render();
    }

    this.disableTransitions();

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    this.renderBasicControls(editor);

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
    editor.createSelectBox('bubble-labelmode', 'Label Display', displayModes, this.attributes.label_mode,
        (e) => {
          this.attributes.label_mode = $(e.currentTarget).val();
          this.render();
        });
    editor.createNumberField('bubble-font-size', 'Label Font Size',
      (e) => {
        let value = $(e.currentTarget).val();
        if (value === '') {
          value = 10;
        } else if (Number(value) < 1) {
          e.currentTarget.value = '1';
          value = 1;
        } else if (Number(value) > 100) {
          e.currentTarget.value = '100';
          value = 100;
        }
        this.attributes.font_size = `${value}`;
        this.render();
      }, this.attributes.font_size);
    editor.createCheckBox('bubble-hideempty', 'Hide Empty Category', this.attributes.hide_empty, (e) => {
      this.attributes.hide_empty = e.currentTarget.checked;
      this.render();
    });

    editor.createColorField('bubble-fontcolor', 'Font Color', this.attributes.font_color,
      (e) => {
        this.attributes.font_color = $(e.currentTarget).val();
        this.render();
      });

    const colorModes = [
      { value: 'single', text: 'Single Color' },
      { value: 'manual', text: 'Manual Assignment (Click bubble to assign)' },
      { value: 'palette', text: 'Single Color (with light variance)' },
    ];
    editor.createSelectBox('bubble-colormode', 'Bubble Color Mode', colorModes, this.attributes.color.mode,
      (e) => {
        this.attributes.color.mode = $(e.currentTarget).val();
        this.renderControls();
        this.render();
      });


    if (this.attributes.color.mode === 'manual') {
      if (this.currentEditKey != null) {
        editor.createSubHeader(`Edit Color for: ${this.currentEditKey}`);
        let currentColor = '#808080';
        const temp = this.attributes.color.colors.filter(c => c.key === this.currentEditKey);
        if (temp.length === 1) {
          currentColor = temp[0].value;
        }
        editor.createColorField('bubble-colorpicker', 'Bubble Color', currentColor,
        (e) => {
          this.attributes.color.mode = 'manual';
          this.attributes.color.colors[this.currentEditKey] = {
            key: this.currentEditKey,
            value: $(e.currentTarget).val(),
          };
          this.render();
        });
      }
    } else {
      let colorSelectHandle = null;
      if (this.attributes.color.mode === 'palette') {
        colorSelectHandle = (e) => {
          this.attributes.color.single_color = $(e.currentTarget).val();
          this.render();
        };
      } else if (this.attributes.color.mode === 'single') {
        colorSelectHandle = (e) => {
          this.attributes.color.single_color = $(e.currentTarget).val();
          this.render();
        };
      }

      editor.createColorField('bubble-staticcolorpicker',
       'Bubble Color',
        this.attributes.color.single_color,
        colorSelectHandle);
    }
  }

  /**
   * Renders visuals for Bubble chart
   */
  render() {
    if (!this.attributes.group_by) {
      return;
    }

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
      counts = Visual.hideEmpty(counts);
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
      .text((d) => {
        const percent = ((d.data.value / d.parent.value) * 100).toFixed(1);
        return `${d.data.key}: ${percent}%`;
      });

    const circles = node.append('circle')
      .attr('r', d => d.r)
      .style('fill', (d, i) => {
        if (this.attributes.color.mode === 'manual') {
          const temp = this.attributes.color.colors.filter(c => c.key === d.data.key);
          if (temp.length === 1) {
            return temp[0].value;
          }
        } else if (this.attributes.color.mode === 'single') {
          return this.attributes.color.single_color;
        } else if (this.attributes.color.mode === 'palette') {
          return ColorHelper.gradientValue(i / (d.parent.children.length),
            this.attributes.color.single_color, '#FFFFFF');
          // TODO: make this gradient not go to white?
        }
        return 'gray';
      });

    if (this.useTransitions) {
      circles.attr('transform', 'scale(0)')
        .transition()
        .delay((d, i) => 500 + (i * 10))
        .duration(500)
        .attr('transform', 'scale(1)');
    }

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
      .style('text-shadow', '0px 0px 5px white')
      .attr('fill', this.attributes.font_color)
      .text(d => d.data.key);

    if (this.useTransitions) {
      text.attr('transform', d => `translate(${d.x},${d.y})scale(0)`)
      .transition()
      .delay((d, i) => 500 + (i * 10))
      .duration(500)
      .attr('transform', d => `translate(${d.x},${d.y})scale(1)`);
    }


    if (this.attributes.label_mode === 'hover') {
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
            .on('mouseout', handleMouseOut);
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


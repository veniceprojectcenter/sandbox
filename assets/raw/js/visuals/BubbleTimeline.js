import Visual from '../Visual';
import EditorGenerator from './helpers/EditorGenerator';

class BubbleTimeline extends Visual {
  onLoadData() {
    this.applyDefaultAttributes({
      width: 600,
      height: 500,
      font_size: 30,
      color: {
        mode: 'interpolate',
        colorspace: 'hcl',
        range: [0, 359],
      },
      x_cat: '',
      bubble_cat: '',
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

    editor.createHeader('Configure Bubble Timeline');

    const cats = [];
    const catsRaw = Object.keys(this.getNumericData(0)[0]);
    for (let i = 0; i < catsRaw.length; i += 1) {
      cats.push({ value: catsRaw[i], text: catsRaw[i] });
    }
    editor.createSelectBox('bubble-x-column', 'Select column for X axis', cats, this.attributes.x_cat,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.x_cat = value;
        this.render();
      });
  }

  render() {
    Visual.empty(this.renderID);

    const width = this.attributes.width;
    const height = this.attributes.height;

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('class', 'bubble-timeline')
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.append('line')
      .attr('x1', '5%')
      .attr('y1', '60%')
      .attr('x2', '95%')
      .attr('y2', '60%')
      .attr('class', 'timeline-bar');

    const x_bar = this.getGroupedListCounts(this.attributes.x_cat);
    console.log(x_bar);
  }
}

export default BubbleTimeline;

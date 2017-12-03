
class EditorGenerator {
  constructor(container) {
    this.container = container;
  }

  createTextField(id, title, onTextChanged) {
    const context = { id, title };
    this.handlebarsWithContext('text-field-entry', context);
    $(`#${id} > input`).on('input', onTextChanged);
  }

  createColorField(id, title, color, onColorChanged) {
    const context = { id, title, color };
    this.handlebarsWithContext('colorpicker', context);
    $(`#${id}-field`).on('change', (e) => {
      $(e.currentTarget).siblings('input[type="text"]').val($(e.currentTarget).val());
      onColorChanged(e);
    });
    $(`#${id}-mirror`).on('change', (e) => {
      $(e.currentTarget).siblings('input[type="color"]').val($(e.currentTarget).val());
      onColorChanged(e);
    });
  }
  createRemoveButton(id, onPress) {
    const context = { id };
    this.handlebarsWithContext('remove-button', context);
    $(`#${id}-button`).on('click', onPress);
  }

  createLeftRightButtons(id, title, onLeftClicked, onRightClicked) {
    const context = { id, title };
    this.handlebarsWithContext('leftrightbuttons', context);
    $(`#${id}-left`).click(onLeftClicked);
    $(`#${id}-right`).click(onRightClicked);
  }

  createSelectBox(id, title, options, current, onOptionChanged) {
    const context = { id, title, options };
    this.handlebarsWithContext('select-entry', context);
    $(`#${id}-select`).val(current).material_select();
    $(`#${id}-select`).change(onOptionChanged);
  }
  createMultipleSelectBox(id, title, options, current, onOptionChanged) {
    const context = { id, title, options };
    this.handlebarsWithContext('select-multiple-entry', context);
    $(`#${id}-select`).val(current).material_select();
    $(`#${id}-select`).change(onOptionChanged);
  }

  createDataFilter(id, column, className, onColumn, remove) {
    const context = { id, column, className };
    this.handlebarsWithContext('data-filter', context);
    $(`#${id}-columnSelect`).val(0).material_select();
    $(`#${id}-operations`).val(1).material_select();
    $(`#${id}-categories`).val(2).material_select();
    $(`#${id}-columnSelect`).on('change', onColumn);
    $(`#${id}-remove`).on('click', remove);
  }

  createNumericFilter(seriesNum, filterNum, columns, remove) {
    const context = { seriesNum, filterNum, columns };
    this.handlebarsWithContext('numeric-filter', context);
    $(`#numFilter${seriesNum}-${filterNum}-columnSelect`).val(0).material_select();
    $(`#numFilter${seriesNum}-${filterNum}-operations`).val(1).material_select();
    $(`#numFilter${seriesNum}-${filterNum}-remove`).on('click', remove);
  }

  createCheckBox(id, title, current, onOptionChanged) {
    let checked = '';
    if (current === true) {
      checked = 'checked';
    }
    const context = { id, title, checked };

    this.handlebarsWithContext('check-entry', context);
    $(`#${id}-checkbox`).change(onOptionChanged);
  }

  createNumberSlider(id, title, current, min, max, step, onValueChanged, inputEvent = 'input') {
    const context = { id, title, min, max, step, current };
    this.handlebarsWithContext('range-entry', context);
    $(`#${id}-input`).on(inputEvent, onValueChanged);
  }

  createFileUpload(id, title, onChange) {
    const context = { id, title };
    this.handlebarsWithContext('file-upload', context);
    $(`#${id}-input`).on('change', onChange);
  }

  createHeader(text) {
    const context = { text };
    this.handlebarsWithContext('header-one', context);
  }

  createSubHeader(text) {
    const context = { text };
    this.handlebarsWithContext('header-two', context);
  }

  createMoveableList(id, title, color, onChange, onColor) {
    const context = { id, color, title };
    this.handlebarsWithContext('moveable', context);
    $(`#${id}-up`).on('click', onChange);
    $(`#${id}-dn`).on('click', onChange);
    $(`#${id}-color`).on('change', onColor);
  }

  createButton(id, text, activationFunction) {
    const context = { id, text };
    this.handlebarsWithContext('button', context);
    $(`#${id}`).on('click', activationFunction);
  }

  createAggregationRow(id, text, column, className) {
    const context = { id, text, column, className };
    this.handlebarsWithContext('Aggregation-Row', context);
    $(`#${id}-aggOperations`).val(0).material_select();
    $(`#${id}-aggColumnSelect`).val(1).material_select();
  }

  createSpacer() {
    const context = {};
    this.handlebarsWithContext('spacer', context);
  }

  handlebarsWithContext(handlebarId, context) {
    const source = document.getElementById(handlebarId).innerHTML;
    const template = Handlebars.compile(source);
    const html = template(context);

    $(this.container).append(html);
  }
}

export default EditorGenerator;

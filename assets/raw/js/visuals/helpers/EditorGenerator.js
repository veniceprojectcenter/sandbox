
class EditorGenerator {
  constructor(container) {
    this.container = container;
  }

  createTextField(id, title, onTextChanged, defaultText = null) {
    const context = { id, title };
    this.handlebarsWithContext('text-field-entry', context);
    $(document).ready(() => {
      $(`#${id} > input`).on('input', onTextChanged);
    });

    if (defaultText && defaultText !== '') {
      const def = document.getElementById(id);
      def.getElementsByTagName('input')[0].value = defaultText;
      def.getElementsByTagName('label')[0].setAttribute('class', 'active');
    }
  }

  createNumberField(id, title, onNumberChanged, defaultText = null) {
    const context = { id, title };
    this.handlebarsWithContext('number-field-entry', context);
    $(document).ready(() => {
      $(`#${id} > input`).on('input', onNumberChanged);
    });

    if (defaultText) {
      const def = document.getElementById(id);
      def.getElementsByTagName('input')[0].value = defaultText;
      def.getElementsByTagName('label')[0].setAttribute('class', 'active');
    }
  }

  createColorField(id, title, color, onColorChanged) {
    let context;
    if (color) {
      context = { id, title, color: color.substring(1, color.length) };
    } else {
      context = { id, title, color: '000000' };
    }
    this.handlebarsWithContext('colorpicker', context);
    $(`#${id}-field`).on('change', (e) => {
      let val = $(e.currentTarget).val();
      val = val.substring(1, val.length);
      $(e.currentTarget).siblings('input[type="text"]').val(val);
      onColorChanged(e);
    });
    $(`#${id}-mirror`).on('input', (e) => {
      let ogval = $(e.currentTarget).val();
      const valid = /[0-9A-Fa-f]/;
      // Clear unwanted characters
      for (let i = 0; i < ogval.length; i += 1) {
        if (!valid.test(ogval.substring(i, i + 1))) {
          ogval = ogval.substring(0, i) + ogval.substring(i + 1, ogval.length);
          i -= 1;
        }
      }

      if (ogval.length > 6) {
        ogval = ogval.substring(0, 6);
      }

      // Valid hexcode found, perform color update
      if (ogval.length === 6) {
        const val = `#${ogval}`;
        $(e.currentTarget).val(val);
        $(e.currentTarget).siblings('input[type="color"]').val(val);
        onColorChanged(e);
      }

      $(e.currentTarget).val(ogval);
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

  createSelectBox(id, title, options, current, onOptionChanged, defaultValue = '', defaultText = 'Select a Property', prevElement = null) {
    const context = { id, title, options, defaultValue, defaultText };
    this.handlebarsWithContext('select-entry', context, prevElement);
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
    $(document).ready(() => {
      $(`#${id}-field`).on(inputEvent, onValueChanged);
    });
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

  handlebarsWithContext(handlebarId, context, prevElement = null) {
    const source = document.getElementById(handlebarId).innerHTML;
    const template = Handlebars.compile(source);
    const html = template(context);

    if (prevElement === null) {
      $(this.container)
      .append(html);
    } else {
      $(`#${prevElement}`).after(html);
    }
  }
}

export default EditorGenerator;

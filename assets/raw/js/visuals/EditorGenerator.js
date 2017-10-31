
class EditorGenerator {
  constructor(container) {
    this.container = container;
  }

  createTextField(id, title, onTextChanged) {
    const context = { id, title };
    this.handlebarsWithContext('text-field-entry', context);
    $(`#${id} > input`).on('input', onTextChanged);
  }

  createSelectBox(id, title, options, current, onOptionChanged) {
    const context = { id, title, options };
    this.handlebarsWithContext('select-entry', context);
    $(`#${id}-select`).val(current).material_select();
    $(`#${id}-select`).change(onOptionChanged);
    console.log(`Using ${current}`);
  }

  createNumberSlider(id, title, current, min, max, onValueChanged) {
    const context = { id, title, min, max, current };
    this.handlebarsWithContext('range-entry', context);
    $(`#${id} input`).on('input', onValueChanged);
  }

  createHeader(text) {
    const context = { text };
    this.handlebarsWithContext('header-one', context);
  }

  createCategoryEditor() {

  }

  handlebarsWithContext(handlebarId, context) {
    const source = document.getElementById(handlebarId).innerHTML;
    const template = Handlebars.compile(source);
    const html = template(context);

    $(this.container).append(html);
  }
}

export default EditorGenerator;


class EditorGenerator {
  constructor(container) {
    this.container = container;
  }

  createTextField(id, title, onTextChanged) {
    const context = { id, title };
    this.handlebarsWithContext('text-field-entry', context);
    $(`#${id} > input`).on('input', onTextChanged);
  }

  createSelectBox(id, title, options, onOptionChanged) {
    const context = { id, title, options };
    this.handlebarsWithContext('select-entry', context);
    $(`#${id}-select`).material_select();
    $(`#${id}-select`).change(onOptionChanged);
    console.log(document.querySelector(`#${id} > select`));
  }

  createNumberSlider(id, title, min, max, onValueChanged) {
    const context = { id, title, min, max };
    this.handlebarsWithContext('range-entry', context);
    document.querySelector(`#${id} > input`).addEventListener('change', onValueChanged);
  }

  handlebarsWithContext(handlebarId, context) {
    const source = document.getElementById(handlebarId).innerHTML;
    const template = Handlebars.compile(source);
    const html = template(context);

    $(this.container).append(html);
  }

}

export default EditorGenerator;

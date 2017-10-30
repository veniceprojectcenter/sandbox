
class ComponentUtils {

  static createTextField(container, id, title, onTextChanged) {
    const context = { id, title };
    ComponentUtils.handlebarsWithContext(container, 'text-field-entry', context);

    document.querySelector(`#${id}-field`).addEventListener('input', onTextChanged);
  }


  static createSelectBox(container, id, title, options, onOptionChanged) {
    const context = { id, title, options };
    ComponentUtils.handlebarsWithContext(container, 'select-entry', context);
    document.querySelector(`#${id}-select`).addEventListener('change', onOptionChanged);
  }

  static handlebarsWithContext(container, handlebarId, context) {
    const source = document.getElementById(handlebarId).innerHTML;
    const template = Handlebars.compile(source);
    const html = template(context);
    container.innerHTML += html;
  }
}

export default ComponentUtils;

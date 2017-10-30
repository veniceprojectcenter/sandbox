
class ComponentUtils {

  static createTextField(container, id, title, onTextChanged) {
    const source = document.getElementById('text-field-entry').innerHTML;
    const template = Handlebars.compile(source);
    const context = { id, title };
    const html = template(context);

    container.innerHTML += html;
    document.getElementById(`${id}-field`).addEventListener('input', onTextChanged);
  }

}

export default ComponentUtils;

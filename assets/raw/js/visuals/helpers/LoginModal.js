import Firebase from '../../Firebase';

class LoginModal {
  generate() {
    if (!this.modal) {
      this.modal = document.createElement('div');
      this.modal.className = 'modal modal-fixed-footer';
      this.modal.id = 'login-modal';

      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';

      const headerRow = document.createElement('div');
      headerRow.className = 'row';
      const headerContainer = document.createElement('div');
      headerContainer.className = 'col';
      const modalHeader = document.createElement('h4');
      modalHeader.innerText = 'Log In';

      const emailRow = document.createElement('div');
      emailRow.className = 'row';
      const emailContainer = document.createElement('div');
      emailContainer.className = 'input-field col';
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.className = 'validate';
      emailInput.id = 'email';
      const emailLabel = document.createElement('label');
      emailLabel.setAttribute('for', 'email');
      emailLabel.innerText = 'Email';

      const passwordRow = document.createElement('div');
      passwordRow.className = 'row';
      const passwordContainer = document.createElement('div');
      passwordContainer.className = 'input-field col';
      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.className = 'validate';
      passwordInput.id = 'password';
      const passwordLabel = document.createElement('label');
      passwordLabel.setAttribute('for', 'password');
      passwordLabel.innerText = 'Password';

      const modalFooter = document.createElement('div');
      modalFooter.className = 'modal-footer';

      this.loginButton = document.createElement('button');
      this.loginButton.className = 'waves-effect btn-flat';
      this.loginButton.innerText = 'Login And Publish';
      this.loginButton.addEventListener('click', async () => {
        this.loginButton.classList.add('disabled');
        const email = emailInput.value;
        const password = passwordInput.value;
        Firebase.login(email, password, () => {
          $('#login-modal').modal('close');
        }, () => {
          this.loginButton.classList.remove('disabled');
        });
      });

      const cancelButton = document.createElement('button');
      cancelButton.className = 'modal-action modal-close waves-effect btn-flat';
      cancelButton.innerText = 'Cancel';


      headerRow.appendChild(headerContainer);
      headerContainer.appendChild(modalHeader);

      emailContainer.appendChild(emailInput);
      emailContainer.appendChild(emailLabel);
      emailRow.appendChild(emailContainer);

      passwordContainer.appendChild(passwordInput);
      passwordContainer.appendChild(passwordLabel);
      passwordRow.appendChild(passwordContainer);

      modalContent.appendChild(headerRow);
      modalContent.appendChild(emailRow);
      modalContent.appendChild(passwordRow);
      this.modal.appendChild(modalContent);

      modalFooter.appendChild(cancelButton);
      modalFooter.appendChild(this.loginButton);
      this.modal.appendChild(modalFooter);
    }

    return this.modal;
  }

  bind() {
    $(`#${this.modal.id}`).modal();
  }

  authenticate(buttonText = 'Login') {
    this.loginButton.innerText = buttonText;
    return new Promise((resolve) => {
      if (!this.isStateChangeRegistered) {
        this.isStateChangeRegistered = true;
        firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            this.isAuthenticated = true;
            resolve();
          } else {
            $('#login-modal').modal('open');
          }
        });
      } else if (this.isAuthenticated) {
        resolve();
      } else {
        $('#login-modal').modal('open');
      }
    });
  }
}

export default LoginModal;

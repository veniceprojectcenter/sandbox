
class Firebase {
  static initFirebase() {
    // Initialize Firebase - might want to move to a different place eventually
    const config = {
      apiKey: 'AIzaSyBHXHjj5oldp863PFl4Fs5WzOe07JC5OWg',
      authDomain: 'cityknowledge30.firebaseapp.com',
      databaseURL: 'https://cityknowledge30.firebaseio.com',
      projectId: 'cityknowledge30',
      storageBucket: 'cityknowledge30.appspot.com',
      messagingSenderId: '33704287925',
    };
    firebase.initializeApp(config);
  }

  static login(email, password, success, failure) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        if (success) {
          success();
        }
      } else {
        firebase.auth().signInWithEmailAndPassword(email, password).catch((e) => {
          console.error(e);
          // Materialize.toast('Unable to Log In', 3000);
          if (failure) {
            failure();
          }
        });
      }
    });
  }
}


export default Firebase;

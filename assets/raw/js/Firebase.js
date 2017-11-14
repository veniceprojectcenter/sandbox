
class Firebase {
  static initFirebase() {
    // Initialize Firebase - might want to move to a different place eventually
    const config = {
      apiKey: 'AIzaSyBqpAQE7wrvXnitoSwso-QTDa_5U8fHvgM',
      authDomain: 'vpc-sandbox-test.firebaseapp.com',
      databaseURL: 'https://vpc-sandbox-test.firebaseio.com',
      projectId: 'vpc-sandbox-test',
      storageBucket: 'vpc-sandbox-test.appspot.com',
      messagingSenderId: '962614899759',
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
          Materialize.toast('Unable to Log In', 3000);
          if (failure) {
            failure();
          }
        });
      }
    });
  }
}


export default Firebase;

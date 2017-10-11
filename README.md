### Before starting ###
* install nodejs: `https://nodejs.org/en/download/package-manager/`
* install git: `https://git-scm.com/book/id/v2/Getting-Started-Installing-Git`
* install Ionic CLI and Cordova : `https://ionicframework.com/docs/intro/installation/`


### Installation ###

* Clone this repository. Run: `git clone https://github.com/frontiere21/chat21-ionic.git` in the folder in which you'd like to contain the project.
* Next you will need to get all your node_modules back into your application. All these modules are based on your package.json file. In the project folder “chat21-ionic” run `npm install`
* Now you will need to serve the app. Run `ionic serve` in the terminal.

### Firebase Configuration ###
* Create account Firebase
* Create a Firebase project in the Firebase console, if you don't already have one. https://console.firebase.google.com/
* Click Add Firebase to your web app.
* Copy `{
    apiKey: "AIzaSyCUUfce8cV_KPpEJIgp1zTulzQrdbCYkfI",
    authDomain: "test-5cd6b.firebaseapp.com",
    databaseURL: "https://test-5cd6b.firebaseio.com",
    projectId: "test-5cd6b",
    storageBucket: "test-5cd6b.appspot.com",
    messagingSenderId: "766594739520"
  };` and paste in `<poject-name>/src/app/app.module.ts` replacing to
  `{
    apiKey: "AIzaSyDg_mbIV_ejd_l1ZrH1lq22NyA2h94-4aQ",
    authDomain: "ionic3chat.firebaseapp.com",
    databaseURL: "https://ionic3chat.firebaseio.com",
    projectId: "ionic3chat",
    storageBucket: "ionic3chat.appspot.com",
    messagingSenderId: "1096415488178"
  }`   
* Config Firebase auth
In the Firebase Console open the Authentication section > SIGN IN METHOD tab you need to enable the Email/password Sign-in Provider and click SAVE. This will allow users to sign-in the Web app with their Email
https://firebase.google.com/docs/auth/

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines
* Change tenant name e name storage: in `<poject-name>/src/app/app.module.ts` replace chat21 with your app name

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact

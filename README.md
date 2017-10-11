## Before starting ##
* install nodejs: `https://nodejs.org/en/download/package-manager/`
* install git: `https://git-scm.com/book/id/v2/Getting-Started-Installing-Git`
* install Ionic CLI and Cordova : `https://ionicframework.com/docs/intro/installation/`

## Installation ##
* Clone this repository. Run: `git clone https://github.com/frontiere21/chat21-ionic.git` in the folder in which you'd like to contain the project.
* Next you will need to get all your node_modules back into your application. All these modules are based on your package.json file. In the project folder “chat21-ionic” run `npm install`
* Now you will need to serve the app. Run `ionic serve` in the terminal. (Update the plugins if required)

## Firebase Configuration ##
* Create account Firebase
* Create a Firebase project in the Firebase console, if you don't already have one. https://console.firebase.google.com/

### Firebase DB Configuration ### 
* Click Add Firebase to your web app.
* Copy `{
    apiKey: "<your api key>",
    authDomain: "<your authDomain>",
    databaseURL: "<your databaseURL>",
    projectId: "<your projectId>",
    storageBucket: "<your storageBucket>",
    messagingSenderId: "< your messagingSenderId >"
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
* Change tenant name (facoltativo)...

## Create build browser ##
* run: ionic cordova platform add browser
* (update browser run: cordova platform update@latest)
* run: ionic cordova build browser

## Upload project on firebase hosting ##
https://firebase.google.com/docs/hosting/quickstart?authuser=0
* install the Firebase CLI. run: npm install -g firebase-tools
* run: firebase login
* Change directories in the terminal to your desired project directory(run: cd platforms/browser) and run: firebase init
    * select hosting (press Spacebar to select) and press return
    * select your project and press return
    * answer the following questions:
        * "what do you want to use as your public directory?"  www and press return  
        * "configure as a single-page app?"  N and press return
        * "file www/index.html alredy exists. Overwrite?" N and press return
* run firebase deploy

### Firebase Functions Configuration ###


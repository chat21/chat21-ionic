## Live Demo ##
Visit https://ionic3chat.firebaseapp.com/ to see a live demo of chat21-ionic.
<img src="http://www.dariodepascalis.com/wp-content/uploads/2017/10/chat21-desktop.png" alt="A screenshot of chat21-ionic demo" style="max-width:100%;">

## Before starting ##
* Install nodejs: `https://nodejs.org/en/download/`
* Install git: `https://git-scm.com/book/id/v2/Getting-Started-Installing-Git`
* Install Ionic CLI and Cordova : `https://ionicframework.com/docs/intro/installation/`

## Installation ##
* Clone this repository. Run: `git clone https://github.com/frontiere21/chat21-ionic.git` in the folder in which you'd like to contain the project.
* Next you will need to get all your node_modules back into your application. All these modules are based on your package.json file. In the project folder “chat21-ionic” run: `npm install`

## Firebase Configuration ##
* Create account Firebase
* Create a Firebase project in the Firebase console, if you don't already have one. https://console.firebase.google.com/

#### Firebase DB Configuration #### 
* Click Add Firebase to your web app and copy var config = ```{ "apiKey": "<your api key>",
"authDomain": "<your authDomain>",
"databaseURL": "<your databaseURL>",
"projectId": "<your projectId>",
"storageBucket": "<your storageBucket>",
"messagingSenderId": "< your messagingSenderId >" }```
* Update app.module.ts: 
    * go to the root of your project
    * open /src/app/app.module.ts and replace `firebaseConfig : {...}` whit `firebaseConfig : {
    apiKey: "<your api key>",
    authDomain: "<your authDomain>",
    databaseURL: "<your databaseURL>",
    projectId: "<your projectId>",
    storageBucket: "<your storageBucket>",
    messagingSenderId: "< your messagingSenderId >"
  }`
* Config Firebase auth
In the Firebase Console open the Authentication section > SIGN IN METHOD tab you need to enable the Email/password Sign-in Provider and click SAVE. This will allow users to sign-in the Web app with their Email
https://firebase.google.com/docs/auth/
* Update app.module.ts: 
    * open `/src/app/app.module.ts` and change tenant name (optional)
    https://angularfirebase.com/lessons/send-push-notifications-in-angular-with-firebase-cloud-messaging/
* Update firebase-messaging-sw.js: 
    * open `/src/firebase-messaging-sw.js` and replace messagingSenderId: "..." with < your messagingSenderId >
* Update manifest.json: 
    * open `/src/manifest.json` and replace "name": "chat21-ionic" and "short_name": "chat21-ionic" with the name of your project (optional)

## Run App on Browser ##
* Now you will need to serve the app. Run: `ionic serve` in the terminal. (Update the plugins if required)

## Upload Notification functions on Firebase Cloud Functions ##
https://firebase.google.com/docs/functions/get-started?authuser=0
* Install the Firebase CLI. run: `npm install -g firebase-tools`
* Run: `firebase login`
* Change directories in the terminal go to your Firebase project directory and run: `firebase init functions`
* Select your project and press return
    * answer the following question:
        * "are yuo ready to proceed?" Y and press return
        * "do yuo want to install dependencies with npm now?" Y and press return  
* Get file notification functions from here `https://github.com/frontiere21/chat21-cloud-functions` 
* Replace `/firebase-functions/functions/index.js` with the file downloaded to the previous step
* Deploy your functions, run: `firebase deploy`

## Create build browser ##
* Run: `cordova platform add browser@latest`
* Run: `ionic cordova build browser`

## Upload project on firebase hosting ##
https://firebase.google.com/docs/hosting/quickstart?authuser=0
* Install the Firebase CLI. run: `npm install -g firebase-tools`
* Run: `firebase login`
(these steps can be avoided if you have already done before)
* Change directories in the terminal to your desired project directory(run: `cd platforms/browser`) and run: `firebase init`
    * select hosting (press Spacebar to select) and press return
    * select your project and press return
    * answer the following questions:
        * "what do you want to use as your public directory?"  www and press return  
        * "configure as a single-page app?"  N and press return
        * "file www/index.html alredy exists. Overwrite?" N and press return
* Run: `firebase deploy`
* In your firebase consol click hosting and click on link your project


## Run on Android and iOS
run on simulator : ionic cordova run android
run on device : ionic cordova run android --device

run on simulator : ionic cordova run ios
run on device : ionic cordova run ios --device

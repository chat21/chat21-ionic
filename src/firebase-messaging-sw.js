// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup

// ------ old ------
// importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-messaging.js');
// importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase.js');

// ------ new ------
// import * as firebase from 'firebase/app';
// import '@firebase/messaging';

importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-messaging.js');
// importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase.js');



// importScripts('/__/firebase/3.9.0/firebase-app.js');
// importScripts('/__/firebase/3.9.0/firebase-messaging.js');
// importScripts('/__/firebase/init.js');

//const messaging = firebase.messaging();

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 **/
 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 //importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
 //importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');
 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
//  firebase.initializeApp({
//    'messagingSenderId': '77360455507' // old
// //  'messagingSenderId': '269505353043'
  
//  });


 firebase.initializeApp({
  apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4"',
  authDomain: 'chat21-pre-01.firebaseapp.com',
  databaseURL: 'https://chat21-pre-01.firebaseio.com',
  projectId: 'chat21-pre-01',
  storageBucket: 'chat21-pre-01.appspot.com',
  messagingSenderId: '269505353043',
  appId: '1:269505353043:web:b82af070572669e3707da6'
});
 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();//.useServiceWorker(registration);
 
 // [END initialize_firebase_in_sw]
 


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]

// ----- old -------
// messaging.setBackgroundMessageHandler(function(payload) {
//   console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) Received background message ', payload);
//   // Customize notification here
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     // icon: '/firebase-logo.png'
//   };

//   return self.registration.showNotification(notificationTitle,
//       notificationOptions);
// });

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.onBackgroundMessage` handler.
// messaging.onMessage((payload) => {
//   console.log('FIREBASE-NOTIFICATION FIREBASE-MESSAGING-SW) Message received. ', payload);
//   // ...
// });


// ----- new -------
messaging.onBackgroundMessage(function(payload) {
  console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
  body: payload.notification.body,
  icon: './assets/images/tiledesk_logo_50x50.png',
  data: { url:payload.data.click_action }, //the url which we gonna use later
  actions: [{action: "open_url", title: "Read Now"}]
  };
  // /Users/nicola/CHAT21_IONIC/src/assets/images/tiledesk_logo_no_text_72x72.png
  self.registration.showNotification(notificationTitle,
  notificationOptions);
  });
// [END background_handler]
// v 0.4

self.addEventListener('notificationclick', event => {
  console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  +++ event ', event);
  let baseurl = ''
  if (event.notification &&
    event.notification.data &&
    event.notification.data.FCM_MSG &&
    event.notification.data.FCM_MSG.data &&
    event.notification.data.FCM_MSG.data.click_action
  ) {
    baseurl = event.notification.data.FCM_MSG.data.click_action;
    console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  BASE-URL ', baseurl);
  }
  else {
    console.error('FIREBASE-NOTIFICATION NO BASE URL')
    return
  }
  // Android doesnâ€™t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();
  event.waitUntil(async function () {
    const allClients = await clients.matchAll({
      includeUncontrolled: true,
      type: 'window'
    });
    let chatClient;
    // Let's see if we already have a chat window open:
    for (const client of allClients) {
     
      if (client.url.startsWith(baseurl)) {
        client.focus();
        chatClient = client;
    
        if (event.notification.data.FCM_MSG.data.channel_type === 'group') {
          if (event.notification &&
            event.notification.data &&
            event.notification.data.FCM_MSG &&
            event.notification.data.FCM_MSG.data &&
            event.notification.data.FCM_MSG.data.recipient) {
            chatClient.postMessage({
              conversWith: event.notification.data.FCM_MSG.data.recipient
            });
          }

        } else if (event.notification.data.FCM_MSG.data.channel_type === 'direct') {
          if (event.notification &&
            event.notification.data &&
            event.notification.data.FCM_MSG &&
            event.notification.data.FCM_MSG.data &&
            event.notification.data.FCM_MSG.data.sender) {
            chatClient.postMessage({
              conversWith:  event.notification.data.FCM_MSG.data.sender
            });
          }
        }
        break;
      }
    }
    // If we didn't find an existing chat window,
    // open a new one:
    if (!chatClient) {
      if (clients.openWindow) {
        
        if (event.notification.data.FCM_MSG.data.channel_type === "direct") {
          if (event.notification &&
            event.notification.data &&
            event.notification.data.FCM_MSG &&
            event.notification.data.FCM_MSG.data) {
       
            const url = baseurl + '#/conversation-detail/' + event.notification.data.FCM_MSG.data.sender + "/" + event.notification.data.FCM_MSG.data.sender_fullname + '/active'
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) HERE YES  2  built url ', url);
            chatClient = await clients.openWindow(url);


          }
        } else if (event.notification.data.FCM_MSG.data.channel_type === "group") {
          if (event.notification && 
            event.notification.data && 
            event.notification.data.FCM_MSG && 
            event.notification.data.FCM_MSG.data) {
    
            const url = baseurl + '#/conversation-detail/' + event.notification.data.FCM_MSG.data.recipient + "/" + event.notification.data.FCM_MSG.data.sender_fullname + '/active'
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) HERE YES  2  built url ', url);
            chatClient = await clients.openWindow(url);
          }
        }
      }
    }
  }());
});


importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-messaging.js');

// -----------------------------------------------
// Pre config
// -----------------------------------------------
// firebase.initializeApp({
//   apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4"',
//   authDomain: 'chat21-pre-01.firebaseapp.com',
//   databaseURL: 'https://chat21-pre-01.firebaseio.com',
//   projectId: 'chat21-pre-01',
//   storageBucket: 'chat21-pre-01.appspot.com',
//   messagingSenderId: '269505353043',
//   appId: '1:269505353043:web:b82af070572669e3707da6'
// });

// -----------------------------------------------
// Prod config
// -----------------------------------------------
firebase.initializeApp({
  apiKey: 'AIzaSyDKfdKrlD7AYcbQ-U-xxgV-b3FUQ4xt7NM',
  authDomain: 'tiledesk-prod-v2.firebaseapp.com',
  databaseURL: 'https://tiledesk-prod-v2.firebaseio.com',
  projectId: 'tiledesk-prod-v2',
  storageBucket: 'tiledesk-prod-v2.appspot.com',
  messagingSenderId: '92907897826',
  appId: '1:92907897826:web:f255664014a7cc14ee2fbb',
});
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();//.useServiceWorker(registration);
// [END initialize_firebase_in_sw]

messaging.onBackgroundMessage(function (payload) {
  console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) Received background message ', payload);
 
  // self.registration.showNotification(notificationTitle, notificationOptions);
});
// [END background_handler]
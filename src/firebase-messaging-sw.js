// v 0.8 - PROD

self.addEventListener('notificationclick', event => {

  console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  +++ event ', event);
  let baseurl = ''
  // if (event.notification &&
  //   event.notification.data &&
  //   event.notification.data.FCM_MSG &&
  //   event.notification.data.FCM_MSG.data &&
  //   event.notification.data.FCM_MSG.data.click_action
  // )
  if (event.notification &&
    event.notification.data &&
    event.notification.data.FCM_MSG &&
    event.notification.data.FCM_MSG.notification &&
    event.notification.data.FCM_MSG.notification.click_action
  )
  {
    baseurl = event.notification.data.FCM_MSG.notification.click_action;
    console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  BASE-URL ', baseurl);
  }
  else {
    console.error('FIREBASE-NOTIFICATION NO BASE URL')
    // console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  +++ event 2', event);
    return
  }
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();
  event.waitUntil(async function () {
    const allClients = await clients.matchAll({
      includeUncontrolled: true,
      type: 'window'
    });

    let chatClient;
    console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES ');
    // Let's see if we already have a chat window open:
    for (const client of allClients) {
      console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  1B client.url', client.url);
      if (client.url.startsWith(baseurl)) {
        client.focus();
        chatClient = client;
        // if (event.notification && event.notification.actions && event.notification.actions.length > 0) {
        //   console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  CALLING POSTMESSAGE USECASE event.notification.actions[0][action]', event.notification.actions[0]['action']);

        //   chatClient.postMessage({
        //     message: 'Received a push message.',
        //     data: event.notification.actions[0]['action']
        //   });

        // } else 
        if (event.notification.data.FCM_MSG.data.channel_type === 'group') {
          if (event.notification &&
            event.notification.data &&
            event.notification.data.FCM_MSG &&
            event.notification.data.FCM_MSG.data &&
            event.notification.data.FCM_MSG.data.recipient) {
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  CALLING POSTMESSAGE USECASE event.notification.data.FCM_MSG.data.recipient', event.notification.data.FCM_MSG.data.recipient);
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  CALLING POSTMESSAGE USECASE event.notification.data.FCM_MSG.data.channel_type', event.notification.data.FCM_MSG.data.channel_type);

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

            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  CALLING POSTMESSAGE USECASE event.notification.data.FCM_MSG.data.sender', event.notification.data.FCM_MSG.data.sender);
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick  CALLING POSTMESSAGE USECASE event.notification.data.FCM_MSG.data.channel_type', event.notification.data.FCM_MSG.data.channel_type);

            chatClient.postMessage({
              conversWith:  event.notification.data.FCM_MSG.data.sender
            });
          }
        }


        console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  1C chatClient', chatClient);
        break;
      }
    }

    // If we didn't find an existing chat window,
    // open a new one:
    if (!chatClient) {
      if (clients.openWindow) {
        console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2');

        // if (event.notification && event.notification.actions && event.notification.actions.length > 0) {
        //   console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2A event.notification.actions  ', event.notification.actions);

        //   const url = baseurl + '#/conversation-detail/' + event.notification.actions[0]['action'] + "/" + event.notification.actions[0]['title'] + '/active'
        //   console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) HERE YES  2  built url ', url);
        //   chatClient = await clients.openWindow(url);

        // } else 
        if (event.notification.data.FCM_MSG.data.channel_type === "direct") {
          if (event.notification &&
            event.notification.data &&
            event.notification.data.FCM_MSG &&
            event.notification.data.FCM_MSG.data) {
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2B  event.notification.data.FCM_MSG.data  ', event.notification.data.FCM_MSG.data);
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2B  event.notification.data.FCM_MSG.data.channel_type  ', event.notification.data.FCM_MSG.data.channel_type);
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2B  event.notification.data.FCM_MSG.data.sender_fullname  ', event.notification.data.FCM_MSG.data.sender_fullname);
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2B  event.notification.data.FCM_MSG.data.channel_type  ', event.notification.data.FCM_MSG.data.sender);

            const url = baseurl + '#/conversation-detail/' + event.notification.data.FCM_MSG.data.sender + "/" + event.notification.data.FCM_MSG.data.sender_fullname + '/active'
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) HERE YES  2  built url ', url);
            chatClient = await clients.openWindow(url);


          }
        } else if (event.notification.data.FCM_MSG.data.channel_type === "group") {
          if (event.notification && 
            event.notification.data && 
            event.notification.data.FCM_MSG && 
            event.notification.data.FCM_MSG.data) {
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2B  event.notification.data.FCM_MSG.data  ', event.notification.data.FCM_MSG.data);
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2B  event.notification.data.FCM_MSG.data.channel_type  ', event.notification.data.FCM_MSG.data.channel_type);
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2B  event.notification.data.FCM_MSG.data.sender_fullname  ', event.notification.data.FCM_MSG.data.sender_fullname);
            console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) notificationclick HERE YES  2B  event.notification.data.FCM_MSG.data.recipient  ', event.notification.data.FCM_MSG.data.recipient);

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


firebase.initializeApp({
  apiKey: 'CHANGEIT',
  authDomain: 'CHANGEIT',
  databaseURL: 'CHANGEIT',
  projectId: 'CHANGEIT',
  storageBucket: 'CHANGEIT',
  messagingSenderId: 'CHANGEIT',
  appId: 'CHANGEIT'
});



// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();//.useServiceWorker(registration);

// [END initialize_firebase_in_sw]



// ----- new -------
messaging.onBackgroundMessage(function (payload) {
  console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) Received background message ', payload);
  // console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) Received background message payload recipient', payload.data.recipient);
  // console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) Received background message payload sender', payload.data.sender);
  // console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) Received background message payload channel_type', payload.data.channel_type);
  // console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) Received background message payload recipient_fullname', payload.data.recipient_fullname);
  // console.log('FIREBASE-NOTIFICATION (FIREBASE-MESSAGING-SW) Received background message payload sender_fullname', payload.data.sender_fullname);
  // data = `{ "recipient": "${payload.data.recipient}", "recipient_fullname": "${payload.data.recipient_fullname}", "status": "${payload.data.status}" }`



  // conv_id = ""
  // if (payload.data.channel_type === "direct") {
  //   conv_id = payload.data.sender
  // } else if (payload.data.channel_type === "group") {
  //   conv_id = payload.data.recipient
  // }


  // let sender_fullname = payload.data.sender_fullname
  // const notificationTitle = payload.notification.title;
  // const notificationOptions = {
  //   body: payload.notification.body,
  //   icon: './assets/images/tiledesk_logo_50x50.png',
  //   data: { url: payload.data.click_action }, //the url which we gonna use later
  //   actions: [{
  //     "action": conv_id, "title": sender_fullname
  //   }]
  // };
  // /Users/nicola/CHAT21_IONIC/src/assets/images/tiledesk_logo_no_text_72x72.png
  // self.registration.showNotification(notificationTitle, notificationOptions);
});
// [END background_handler]





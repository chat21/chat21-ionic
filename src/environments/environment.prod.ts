export const environment = {
  tenant: 'tilechat',
  supportMode: false,
  CHAT_SEND_BY_EMAIL_LINK: 'mailto:?subject=Transcript Chat Conversation&body=Salve,%0D%0A%0D%0Adi seguito potrà scaricare il transcript della conversazione intercorsa con il nostro servizio di Supporto:%0D%0A%0D%0Ahttps://api.tiledesk.com/v1/public/requests/',
  DASHBOARD_URL: 'https://support-pre.tiledesk.com/dashboard/',
  FIREBASESTORAGE_BASE_URL_IMAGE: 'https://firebasestorage.googleapis.com/v0/b/',
  SERVER_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/',
  production: true,
  remoteConfig: false,
  remoteConfigUrl: './chat-config.json',
  remoteContactsUrl: 'https://tiledesk-server-pre.herokuapp.com/chat21/contacts',
  firebaseConfig: {
      apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4',
      authDomain: 'chat21-pre-01.firebaseapp.com',
      databaseURL: 'https://chat21-pre-01.firebaseio.com',
      projectId: 'chat21-pre-01',
      storageBucket: 'chat21-pre-01.appspot.com',
      messagingSenderId: '269505353043',
      appId: '1:269505353043:web:b82af070572669e3707da6',
      chat21ApiUrl: 'https://us-central1-chat21-pre-01.cloudfunctions.net'
  }
}
// export const environment = {
//   supportMode: false,
//   CHAT_SEND_BY_EMAIL_LINK: "mailto:?subject=Transcript Chat Conversation&body=Salve,%0D%0A%0D%0Adi seguito potrà scaricare il transcript della conversazione intercorsa con il nostro servizio di Supporto:%0D%0A%0D%0Ahttps://api.tiledesk.com/v1/public/requests/",
//   DASHBOARD_URL: "https://console.tiledesk.com/v2/dashboard/",
//   FIREBASESTORAGE_BASE_URL_IMAGE: "https://firebasestorage.googleapis.com/v0/b/",
//   SERVER_BASE_URL: "https://api.tiledesk.com/v2/",
//   production: true,
//   remoteConfig: false,
//   remoteConfigUrl: './chat-config.json',
//   remoteContactsUrl: 'https://api.tiledesk.com/v2/chat21/contacts',
//   firebaseConfig: {
//       apiKey: "AIzaSyDKfdKrlD7AYcbQ-U-xxgV-b3FUQ4xt7NM",
//       authDomain: "tiledesk-prod-v2.firebaseapp.com",
//       databaseURL: "https://tiledesk-prod-v2.firebaseio.com",
//       projectId: "tiledesk-prod-v2",
//       storageBucket: "tiledesk-prod-v2.appspot.com",
//       messagingSenderId: "92907897826",
//       appId: "1:92907897826:web:f255664014a7cc14ee2fbb",
//       chat21ApiUrl: "https://us-central1-tiledesk-prod-v2.cloudfunctions.net"
//   }
// }
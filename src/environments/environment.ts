
export const environment = {
    tenant: 'CHANGEIT',
    supportMode: true,
    CHAT_SEND_BY_EMAIL_LINK: 'CHANGEIT',
    FIREBASESTORAGE_BASE_URL_IMAGE: 'https://firebasestorage.googleapis.com/v0/b/',
    DASHBOARD_URL: 'http://localhost:4500/',
    SERVER_BASE_URL: 'http://localhost:3000/',
    production: false,
    remoteConfig: true,
    remoteConfigUrl: './chat-config.json',
    remoteContactsUrl: '',
    chatEngine: 'mqtt',
    firebaseConfig: {
        apiKey: 'CHANGEIT',
        authDomain: 'CHANGEIT',
        databaseURL: 'CHANGEIT',
        projectId: 'CHANGEIT',
        storageBucket: 'CHANGEIT',
        messagingSenderId: 'CHANGEIT',
        appId: 'CHANGEIT',
        chat21ApiUrl: 'CHANGEIT'
    },
    chat21Config: {
        appId: 'tilechat',
        MQTTendpoint: 'mqtt://localhost:15675/ws', // MQTT endpoint
        APIendpoint: 'http://localhost:8004/api',
        loginServiceEndpoint: 'http://localhost:3000/chat21/native/auth/createCustomToken' // endpoint readed from apiUrl property
      }
};

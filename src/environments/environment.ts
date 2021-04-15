export const environment = {
    production: false,
    tenant: 'tilechat',
    remoteConfig: true,
    remoteConfigUrl: './chat-config.json',
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
    },
    apiUrl: 'http://localhost:3000/',
    baseImageUrl: 'https://firebasestorage.googleapis.com/v0/b/',
    dashboardUrl: 'http://localhost:4500/',
    authPersistence: 'LOCAL',
    supportMode: false,
};

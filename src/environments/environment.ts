export const environment = {
    production: false,
    remoteConfig: true,
    remoteConfigUrl: './chat-config.json',
    chatEngine: 'mqtt',
    uploadEngine: 'native',
    pushEngine: 'none',
    fileUploadAccept: "*/*",
    firebaseConfig: {
        tenant: 'CHANGEIT',
        apiKey: 'CHANGEIT',
        authDomain: 'CHANGEIT',
        databaseURL: 'CHANGEIT',
        projectId: 'CHANGEIT',
        storageBucket: 'CHANGEIT',
        messagingSenderId: 'CHANGEIT',
        appId: 'CHANGEIT',
        chat21ApiUrl: 'CHANGEIT',
        vapidKey: 'CHANGEIT'
    },
    chat21Config: {
        appId: 'tilechat',
        MQTTendpoint: 'mqtt://localhost:15675/ws', // MQTT endpoint
        APIendpoint: 'http://localhost:8004/api'
    },
    apiUrl: 'http://localhost:3000/',
    baseImageUrl: 'https://firebasestorage.googleapis.com/v0/b/',
    dashboardUrl: 'http://localhost:4500/',
    storage_prefix: 'chat_sv5',
    authPersistence: 'LOCAL',
    logLevel: 'Info',
    supportMode: false,
};
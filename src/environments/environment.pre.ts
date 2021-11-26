export const environment = {
    production: false,
    remoteConfig: true,
    remoteConfigUrl: './chat-config.json',
    remoteContactsUrl: '',
    chatEngine: 'mqtt',
    uploadEngine: 'native',
    pushEngine: 'none',
    fileUploadAccept: "*/*",
    firebaseConfig: {
        tenant: 'CHANGEIT',
        apiKey: 'pre-CHANGEIT',
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
        appId: 'CHANGEIT',
        MQTTendpoint: 'CHANGEIT', // MQTT endpoint
        APIendpoint: 'CHANGEIT'
    },
    apiUrl: 'CHANGEIT',
    baseImageUrl: 'CHANGEIT',
    dashboardUrl: 'CHANGEIT',
    wsUrl: 'CHANGEIT',
    storage_prefix: 'chat_sv5',
    authPersistence: 'LOCAL',
    logLevel: 'Info',
    supportMode: false,
};

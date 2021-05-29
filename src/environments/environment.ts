export const environment = {
    tenant: 'tilechat',
    supportMode: false,
    CHAT_SEND_BY_EMAIL_LINK: "mailto:",
    dashboardUrl: "http://tiledesk-dashboard-pre.s3-eu-west-1.amazonaws.com/native-mqtt/dashboard/index.html",
    FIREBASESTORAGE_BASE_URL_IMAGE: "https://firebasestorage.googleapis.com/v0/b/",
    //SERVER_BASE_URL: "https://api.tiledesk.com/v2/", // prod
    // SERVER_BASE_URL: "http://console-native.tiledesk.com/api/", // pre
    
    
    production: true,
    remoteConfig: false,
    remoteConfigUrl: './chat-config.json',
    uploadEngine: 'native',
    //remoteContactsUrl: 'https://api.tiledesk.com/v2/chat21/contacts', // prod
    // remoteContactsUrl: 'http://console-native.tiledesk.com/api/chat21/contacts', // pre
    // remoteContactsUrl: 'http://localhost:8002/contacts',
    
    // LOCALHOST
    // apiUrl: 'http://localhost:8002/',
    // chat21Config: { 
    //     appId: "tilechat",
    //     MQTTendpoint: 'ws://localhost:15675/ws', // MQTT endpoint
    //     APIendpoint: 'http://localhost:8004/api',
    //     //loginServiceEndpoint: 'http://console-native.tiledesk.com/api/chat21/native/auth/createCustomToken'
    //     loginServiceEndpoint: 'http://localhost:8002/tilechat/signin'
    // },

    // AWS
    apiUrl: 'http://99.80.197.164:3000/',
    chat21Config: {
        appId: "tilechat",
        MQTTendpoint: 'mqtt://99.80.197.164:15675/ws', // MQTT endpoint
        APIendpoint: 'http://99.80.197.164:8004/api'
    },

    firebaseConfig: {
        apiKey: "AIzaSyDKfdKrlD7AYcbQ-U-xxgV-b3FUQ4xt7NM",
        authDomain: "tiledesk-prod-v2.firebaseapp.com",
        databaseURL: "https://tiledesk-prod-v2.firebaseio.com",
        projectId: "tiledesk-prod-v2",
        storageBucket: "tiledesk-prod-v2.appspot.com",
        messagingSenderId: "92907897826",
        appId: "1:92907897826:web:f255664014a7cc14ee2fbb",
        chat21ApiUrl: "https://us-central1-tiledesk-prod-v2.cloudfunctions.net"
    },
    authPersistence: 'LOCAL',
    chatEngine: 'mqtt', // firebase
    baseImageUrl: 'https://firebasestorage.googleapis.com/v0/b/',
    storage_prefix: 'chat_sv5'
};
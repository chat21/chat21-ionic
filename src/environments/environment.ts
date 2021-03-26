export const environment = {
    tenant: 'tilechat',
    supportMode: false,
    CHAT_SEND_BY_EMAIL_LINK: "mailto:",
    DASHBOARD_URL: "https://console.tiledesk.com/v2/dashboard/",
    FIREBASESTORAGE_BASE_URL_IMAGE: "https://firebasestorage.googleapis.com/v0/b/",
    //SERVER_BASE_URL: "https://api.tiledesk.com/v2/",
    // http://console-native.tiledesk.com/api/chat21/native/auth
    SERVER_BASE_URL: "http://console-native.tiledesk.com/api/",
    production: true,
    remoteConfig: false,
    remoteConfigUrl: './chat-config.json',
    //remoteContactsUrl: 'https://api.tiledesk.com/v2/chat21/contacts',
    remoteContactsUrl: 'http://console-native.tiledesk.com/api/chat21/contacts',

    chat21Config: {
        appId: "tilechat",
        MQTTendpoint: 'mqtt://localhost:15675/ws', // MQTT endpoint
        APIendpoint: 'http://localhost:8004/api',
        //loginServiceEndpoint: 'http://console-native.tiledesk.com/api/chat21/native/auth/createCustomToken'
        loginServiceEndpoint: 'http://localhost:8002/tiledesk/signin'
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
    chatEngine: 'nqtt'
};

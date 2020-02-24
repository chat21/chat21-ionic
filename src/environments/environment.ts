// import { firebaseConfig } from '../environments/firebase-config'; // please comment on this line when changing the values ​​of firebase {}

export const environment = {
    supportMode: true,
    URL_SEND_BY_EMAIL: "mailto:?subject=Transcript Chat Conversation&body=Salve,%0D%0A%0D%0Adi seguito potrà scaricare il transcript della conversazione intercorsa con il nostro servizio di Supporto:%0D%0A%0D%0Ahttps://api.tiledesk.com/v1/public/requests/",
    // URL_VIDEO_CHAT: 'https://videochat.tiledesk.com/add-user-group.html',
    // URL_TICKET_CHAT: 'https://chat21sdk.atlassian.net/secure/CreateIssue!default.jspa',
    FIREBASESTORAGE_BASE_URL_IMAGE: 'https://firebasestorage.googleapis.com/v0/b/',
    BASE_URL_HOSTNAME: 'support-pre.tiledesk.com',
    URL_DASHBOARD: 'https://support-pre.tiledesk.com/dashboard/',
    URL_PROJECT_ID: "https://support-pre.tiledesk.com/dashboard/#/project/",
    production: false,
    remoteConfig: true,
    remoteConfigUrl: '/firebase-config.json',
    firebaseConfig: {
        apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4',
        authDomain: 'chat21-pre-01.firebaseapp.com',
        databaseURL: 'https://chat21-pre-01.firebaseio.com',
        projectId: 'chat21-pre-01',
        storageBucket: 'chat21-pre-01.appspot.com',
        messagingSenderId: '269505353043',
        chat21ApiUrl: 'https://us-central1-chat21-pre-01.cloudfunctions.net'
    }
}
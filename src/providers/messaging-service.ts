import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';

import { Config } from 'ionic-angular';
import * as PACKAGE from '../../package.json';

//import { AuthService } from './auth-service';

/*
  Generated class for the AuthService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MessagingService {
    messaging: firebase.messaging.Messaging;
    //private afAuth: AngularFireAuth;
    private urlNodeFirebase: string;
    private connectionsRefinstancesId: string;
    private tenant: string;
    //private deviceConnectionRef;
    public token: string;
    public BUILD_VERSION: string;
 
    //public authService: AuthService;

    constructor(
        //private afAuth: AngularFireAuth 
        public events: Events,
        public config: Config
    ) { 
        // recupero tenant
        this.tenant = config.get("appConfig").tenant;
        this.urlNodeFirebase = '/apps/'+this.tenant;
        this.BUILD_VERSION = 'v.' + PACKAGE.version; // 'b.0.5';

        // Callback fired if Instance ID token is updated.
        // this.messaging.onTokenRefresh(function() {
        //     this.messaging.getToken()
        //     .then(function(refreshedToken) {
        //         console.log('Token refreshed.');
        //         // Indicate that the new Instance ID token has not yet been sent to the
        //         // app server.
        //         //this.setTokenSentToServer(false);
        //         this.token = refreshedToken;
        //         // Send Instance ID token to app server.
        //         this.updateToken(refreshedToken);
        //         // ...
        //     })
        //     .catch(function(err) {
        //         console.log('Unable to retrieve refreshed token ', err);
        //         this.showToken('Unable to retrieve refreshed token ', err);
        //     });
        // });
    }

    initMessage() {
        this.messaging = firebase.messaging();
        console.log('initMessage:::: ', this.messaging);
        // //navigator.serviceworker.register('/XXXXX/sw.js', {scope: '/XXXX/non-existant-path/')
        // navigator.serviceWorker.register(SERVICE_WORKER_DEV, {scope: "firebase-cloud-messaging-push-scope"})
        // .then(function (registration) {
        //     this.messaging = firebase.messaging();
        //     this.messaging.useServiceWorker(registration);
        //     console.log('initMessage:::: ', registration); 
        // }).catch(function (err) {
        //     // registration failed :(
        //     console.log('ServiceWorker registration failed: ', err);
        // });
    }

    /**
     * 
     */
    getPermission() {
        console.log('Notification getPermission.');
        const that = this;
        // Request permission and get token.....
        this.messaging.requestPermission()
        .then(token => {
            console.log('Notification permission granted.');
            // TODO(developer): Retrieve an Instance ID token for use with FCM.
            that.token = token;
            console.log('NOTIFICA PERMESSO token.', token);
            //callback PERMESSO NOTIFICA OK
            that.events.publish('requestPermission', true);
            //this.updateToken(token);
        })
        .catch(function() {
            that.events.publish('requestPermission', false);
            console.log('Unable to get permission to notify.');
        });
        

        // navigator.serviceWorker.register('./firebase-messaging-sw.js')
        // .then((registration) => {
        //     this.messaging.useServiceWorker(registration);
        //     console.log('useServiceWorker.', registration);
        //     // Request permission and get token.....
        //     this.messaging.requestPermission()
        //     .then(token => {
        //         console.log('Notification permission granted.');
        //         // TODO(developer): Retrieve an Instance ID token for use with FCM.
        //         this.token = token;
        //         console.log('NOTIFICA PERMESSO token.', token);
        //         //this.updateToken(token);
        //     })
        //     .catch(function(err) {
        //         console.log('Unable to get permission to notify.', err);
        //     });
        // });
        

        // .then(() => {
        //     console.log('Notification permission granted.');
        //     firebase.auth().currentUser.getToken(/* forceRefresh */ true)
        //     .then(function(idToken) {
        //         // Send token to your backend via HTTPS
        //         this.token = idToken;
        //     })
        //     .catch(function(error) {
        //         // Handle error
        //         console.log('NON POSSO RECUPERARE IL TOKEN.', error);
        //     });
        //     //return this.messaging.getToken();
        // })
        // .then(token => {
        //     this.token = token;
        //     console.log(token);
        //     console.log('NOTIFICA PERMESSO token.', token);
        //     //this.updateToken(token);
        // })
        // .catch((err) => {
        //     console.log('NON DISPONIBILE IL PERMESSO DI NOTIFICA.', err);
        // });
    }
  
    getToken(){
        // Get Instance ID token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        let that = this;
        //firebase.messaging().getToken()
        this.messaging.getToken()
        .then(function(currentToken) {
            console.log('currentToken: ', currentToken);
            if (currentToken) {
                //sendTokenToServer(currentToken);
                that.token = currentToken;
                //updateUIForPushEnabled(currentToken);
                //that.updateToken(user);
                that.events.publish('eventGetToken', currentToken);
                //that.updateToken(user);
            } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.');
                // Show permission UI.
                //updateUIForPushPermissionRequired();
                //setTokenSentToServer(false);
            }
        })
        .catch(function(err) {
            console.log('An error occurred while retrieving token. ', err);
            //showToken('Error retrieving Instance ID token. ', err);
            //setTokenSentToServer(false);
        });
    }

    // returnToken(): string {
    //     return this.token;
    // }


    updateToken(userUid, token) {
        console.log("***********************",token);
        //this.afAuth.authState.take(1).subscribe(user => {
        if (!userUid || !token) return;
        console.log("aggiorno token nel db");
        // aggiorno token nel db
        //let connectionsRef: firebase.database.Reference = this.referenceToUserListToken(user.uid);
        let conection = token;
        var updates = {};
        this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userUid+"/instances/";
        let device_model = {
            device_model: navigator.userAgent,
            language: navigator.language,
            platform: 'ionic',
            platform_version: this.BUILD_VERSION
        }
        updates[this.connectionsRefinstancesId + conection] = device_model;
        
        // else{
            // this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+user.uid+"/instanceId/";
            // updates[this.connectionsRefinstancesId] = conection;
        //}
        console.log("Aggiorno token ------------>", updates);
        firebase.database().ref().update(updates)
        
        //this.deviceConnectionRef = connectionsRef.push(conection);
        //this.tokenId = conection;//this.deviceConnectionRef.key;
        //console.log("--------->rimuovo token nel db", this.deviceConnectionRef.key);
        //!!! solo quando faccio logout devo rimuovere il token inserito
        //this.deviceConnectionRef.onDisconnect().remove(); 
    }
    
    removeToken() {
        console.log("rimuovo token nel db", this.token);
        // this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userUid+"/instances/";
        let connectionsRefURL = "";
        if(this.connectionsRefinstancesId){
            connectionsRefURL = this.connectionsRefinstancesId+'/'+this.token;
            const connectionsRef = firebase.database().ref().child(connectionsRefURL);
            connectionsRef.remove();
        }
    }

    referenceToUserListToken(userid){
        this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userid+"/instances/";
        // else{
            //this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userid+"/instanceId/";
        //}
        const connectionsRef = firebase.database().ref().child(this.connectionsRefinstancesId);
        console.log("referenceToUserListToken ------------>", connectionsRef);
        return connectionsRef;
    }

    receiveMessage() {
        this.messaging.onMessage((payload) => {
            console.log("OKKKK -------------> Message received. ", payload);
            //this.currentMessage.next(payload)
        });
    }

    returnToken(){
        console.log("returnToken -------------> ", this.token);
        return this.token;
    }
}
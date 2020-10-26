import { Injectable } from '@angular/core';
// import 'rxjs/add/operator/map';

// import * as firebase from 'Firebase';
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';

import { EventsService } from './events-service';
import { Config } from '@ionic/angular';
import { AppConfigProvider } from './app-config';
// import * as PACKAGE from  '../../../package.json';

import { environment } from '../../environments/environment';
/*
  Generated class for the AuthService provider.
  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable({ providedIn: 'root' })
export class MessagingService {
    messaging: firebase.messaging.Messaging;
    private urlNodeFirebase: string;
    private connectionsRefinstancesId: string;
    private tenant: string;
    public token: string;
    public BUILD_VERSION: string;
 
    //public authService: AuthService;

    constructor(
        public config: Config,
        private events: EventsService,
        private appConfigProvider: AppConfigProvider
    ) { 
     
    }


    initialize() {
      // recupero tenant
      this.tenant = environment.tenant;
      this.urlNodeFirebase = '/apps/' + this.tenant;
      // this.BUILD_VERSION = 'v.' + PACKAGE.version; // 'b.0.5';
      // this.initFirebase();
      this.initMessage();
      // this.getPermission();
    }

    /** */
    // initFirebase() {
    //   console.log('BBB', this.appConfigProvider.getConfig().firebaseConfig);
    //   if (!this.appConfigProvider.getConfig().firebaseConfig || this.appConfigProvider.getConfig().firebaseConfig.apiKey === 'CHANGEIT') {
    //     throw new Error('firebase config is not defined. Please create your firebase-config.json. See the Chat21-Web_widget Installation Page');
    //   }
    //   console.log(this.appConfigProvider.getConfig().firebaseConfig);
    //   firebase.initializeApp(this.appConfigProvider.getConfig().firebaseConfig);
    // }


    /** */
    initMessage() {
      try {
        this.messaging = firebase.messaging();
        console.log('initMessage:::: ', this.messaging);
      }
      catch(err) {
        console.log('error initializing firebase messaging system');
      }
    }

    /**
     * 
     */
    getPermission() {
      try {
        console.log('Notification getPermission.');
        const that = this;
        // Request permission and get token.....
        this.messaging.requestPermission()
        .then(token => {
            console.log('Notification permission granted.');
            // TODO(developer): Retrieve an Instance ID token for use with FCM.
            //that.token = token;
            console.log('NOTIFICA PERMESSO token.', token);
            //callback PERMESSO NOTIFICA OK
            that.events.publish('requestPermission', true);
            //this.updateToken(token);
        })
        .catch(function() {
            that.events.publish('requestPermission', false);
            console.log('Unable to get permission to notify.');
        });
         
      }
      catch(err) {
        //console.log('error getPermission firebase messaging system');
      }
    }
  
    /** */
    getToken() {
      console.log('getToken: ');
      try {
         // Get Instance ID token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        const that = this;
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
      catch(err) {
        console.log('error getting token firebase messaging system');
      }
      
       
    }

    // returnToken(): string {
    //     return this.token;
    // }


    /** */
    updateToken(userUid, token) {
        console.log("***********************", token);
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
    
    /** */
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

    /** */
    referenceToUserListToken(userid){
        this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userid+"/instances/";
        // else{
            //this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userid+"/instanceId/";
        //}
        const connectionsRef = firebase.database().ref().child(this.connectionsRefinstancesId);
        console.log("referenceToUserListToken ------------>", connectionsRef);
        return connectionsRef;
    }

    /** */
    receiveMessage() {
      try {
        this.messaging.onMessage((payload) => {
            console.log("OKKKK -------------> Message received. ", payload);
            //this.currentMessage.next(payload)
        });
      }
      catch(err) {
        console.log('error receviving message');
      }
    }

    /** */
    returnToken(){
        console.log("returnToken -------------> ", this.token);
        return this.token;
    }
}

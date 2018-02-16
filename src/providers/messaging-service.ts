import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';

import { Config } from 'ionic-angular';
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
    //public tokenId: string;
 
    //public authService: AuthService;

    constructor(
        //private afAuth: AngularFireAuth 
        public config: Config
    ) { 
        // recupero tenant
        this.tenant = config.get("appConfig").tenant;
        this.urlNodeFirebase = '/apps/'+this.tenant+'/';

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
    }

    getPermission() {
        this.messaging.requestPermission()
        .then(token => {
            console.log('Notification permission granted.');
            // TODO(developer): Retrieve an Instance ID token for use with FCM.
            this.token = token;
            console.log(token);
            console.log('NOTIFICA PERMESSO token.', token);
            //this.updateToken(token);
        })
        .catch(function(err) {
          console.log('Unable to get permission to notify.', err);
        });

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
  
    getToken(user){
        // Get Instance ID token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        let that = this;
        this.messaging.getToken()
        .then(function(currentToken) {
            if (currentToken) {
                console.log('currentToken: ', currentToken);
                //sendTokenToServer(currentToken);
                that.token = currentToken;
                //updateUIForPushEnabled(currentToken);
                that.updateToken(user);
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


    updateToken(user) {
        console.log("***********************",this.token);
        //this.afAuth.authState.take(1).subscribe(user => {
        if (!user || !this.token) return;
        console.log("aggiorno token nel db");
        // aggiorno token nel db
        //let connectionsRef: firebase.database.Reference = this.referenceToUserListToken(user.uid);
        let conection = this.token;
        var updates = {};
        
        // if(this.tenant != "bppintranet" ){
        //     this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+user.uid+"/instancesId/";
        //     updates[this.connectionsRefinstancesId + conection] = conection;
        // }
        // else{
            this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+user.uid+"/instanceId/";
            updates[this.connectionsRefinstancesId] = conection;
        //}
        firebase.database().ref().update(updates);
        //this.deviceConnectionRef = connectionsRef.push(conection);
        //this.tokenId = conection;//this.deviceConnectionRef.key;
        //console.log("--------->rimuovo token nel db", this.deviceConnectionRef.key);
        //!!! solo quando faccio logout devo rimuovere il token inserito
        //this.deviceConnectionRef.onDisconnect().remove(); 
    }
    
    removeToken() {
        console.log("rimuovo token nel db", this.token);
        let connectionsRefURL = "";
        if(this.connectionsRefinstancesId){
            connectionsRefURL = this.connectionsRefinstancesId;
            const connectionsRef = firebase.database().ref().child(connectionsRefURL);
            connectionsRef.remove();
        }
    }

    referenceToUserListToken(userid){
        // if(this.tenant != "bppintranet" ){
        //     this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userid+"/instancesId/";
        // }
        // else{
            this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userid+"/instanceId/";
        //}
        const connectionsRef = firebase.database().ref().child(this.connectionsRefinstancesId);
        return connectionsRef;
    }

    receiveMessage() {
        this.messaging.onMessage((payload) => {
            console.log("OKKKK -------------> Message received. ", payload);
            //this.currentMessage.next(payload)
        });
    }
}
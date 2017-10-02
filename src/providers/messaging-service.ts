import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
//import { AngularFireAuth } from 'angularfire2/auth';
//import { AngularFireDatabase } from 'angularfire2/database';
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
    messaging:any;
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
    }

    initMessage() {
        this.messaging= firebase.messaging();        
    }

    getPermission() {
        this.messaging.requestPermission()
        .then(() => {
            console.log('Notification permission granted.');
            return this.messaging.getToken();
        })
        .then(token => {
            this.token = token;
            console.log(token);
            console.log('Notification permission token.', token);
            //this.updateToken(token);
        })
        .catch((err) => {
            console.log('Unable to get permission to notify.', err);
        });
    }
  
    updateToken(user) {
        //console.log(this.token, user);
        //this.afAuth.authState.take(1).subscribe(user => {
        if (!user || !this.token) return;
        console.log("aggiorno token nel db");
        // aggiorno token nel db
        //let connectionsRef: firebase.database.Reference = this.referenceToUserListToken(user.uid);
        let conection = this.token;
        var updates = {};
        this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+user.uid+"/instancesId/";
        updates[this.connectionsRefinstancesId + conection] = conection;
        firebase.database().ref().update(updates);
        //this.deviceConnectionRef = connectionsRef.push(conection);
        //this.tokenId = conection;//this.deviceConnectionRef.key;
        //console.log("--------->rimuovo token nel db", this.deviceConnectionRef.key);
        //!!! solo quando faccio logout devo rimuovere il token inserito
        //this.deviceConnectionRef.onDisconnect().remove(); 
    }
    
    removeToken() {
        console.log("rimuovo token nel db", this.token);
        let connectionsRefURL = this.connectionsRefinstancesId+this.token;
        const connectionsRef = firebase.database().ref().child(connectionsRefURL);
        connectionsRef.remove();
    }

    referenceToUserListToken(userid){
        this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userid+"/instancesId/";
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
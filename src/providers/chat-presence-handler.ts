import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Config } from 'ionic-angular';
import * as firebase from 'firebase/app';

import { ApplicationContext } from './application-context/application-context';

/*
  Generated class for the AuthService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ChatPresenceHandler {

  tenant: string;
  public fireAuth: firebase.auth.Auth;
  public urlNodeFirebase: string;
  public deviceConnectionRef;

  constructor(
    public config: Config,
    public applicationContext: ApplicationContext
  ) {
    // imposto db
    //this.db = db;
    // recupero tenant
    let appConfig = config.get("appConfig");
    this.tenant = appConfig.tenant;
    // imposto auth
    this.fireAuth = firebase.auth();
    //imposto nodo principale
    this.urlNodeFirebase = '/apps/'+this.tenant+'/';
  }

  lastOnlineRefForUser(userid){
    let lastOnlineRefURL = this.urlNodeFirebase+"/presence/"+userid+"/lastOnline";
    const lastOnlineRef = firebase.database().ref().child(lastOnlineRefURL);
    return lastOnlineRef;
  }

  onlineRefForUser(userid){
    let myConnectionsRefURL = this.urlNodeFirebase+"/presence/"+userid+"/connections";
    const connectionsRef = firebase.database().ref().child(myConnectionsRefURL);
    return connectionsRef;
  }

  setupMyPresence(userid){
    let myConnectionsRef = this.onlineRefForUser(userid);
    let lastOnlineRef = this.lastOnlineRefForUser(userid);
    let connectedRefURL = "/.info/connected";
    let conn = firebase.database().ref(connectedRefURL);
    let that = this;
    conn.on('value', function(dataSnapshot) {
      //console.log("KEY: ",dataSnapshot,that.deviceConnectionRef);
      if(dataSnapshot.val()){
        if (!that.deviceConnectionRef || that.deviceConnectionRef == "undefined") {
          console.log("self.deviceConnectionRef: ", that.deviceConnectionRef);
          //this.deviceConnectionRef = myConnectionsRef.set(true);
          let conection = true;
          that.deviceConnectionRef = myConnectionsRef.push(conection);
          // when this device disconnects, remove it
          //!!! quando faccio logout devo disconnettermi
          that.deviceConnectionRef.onDisconnect().remove();
          // when I disconnect, update the last time I was seen online
          let now: Date = new Date();
          let timestamp = now.valueOf();
          lastOnlineRef.onDisconnect().set(timestamp);
        } else {
          console.log("This is an error. self.deviceConnectionRef already set. Cannot be set again.");
        }
      }
    });
    // salvo reference connected nel singlelton
    console.log("salvo reference connected nel singlelton: ", this.applicationContext);
    this.applicationContext.setRef(conn, 'connected')
  }
    

  goOffline() {
    console.log("goOffline.")
    if(this.deviceConnectionRef){
      this.deviceConnectionRef.off();
      this.deviceConnectionRef.remove();
      this.deviceConnectionRef.then(function() {
        console.log("Remove succeeded.")
      })
      .catch(function(error) {
        console.log("Remove failed: " + error.message)
      });
    }
    this.deviceConnectionRef = null;
  }
}
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Config } from 'ionic-angular';
import * as firebase from 'firebase/app';

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
  //public db: AngularFireDatabase;
  public deviceConnectionRef;

  //public loggeduser: firebase.auth.Auth;

  constructor(
    //private afAuth: AngularFireAuth,
    config: Config,
    //db: AngularFireDatabase
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
  
  // GetUser
  getUser(): firebase.User {
    return this.fireAuth.currentUser;
  }

  lastOnlineRefForUser(userid){
    let lastOnlineRefURL = this.urlNodeFirebase+"/presence/"+userid+"/lastOnline";
    //const lastOnlineRef = this.db.object(lastOnlineRefURL, { preserveSnapshot: true });
    const lastOnlineRef = firebase.database().ref().child(lastOnlineRefURL);
    return lastOnlineRef;
  }

  onlineRefForUser(userid){
    let myConnectionsRefURL = this.urlNodeFirebase+"/presence/"+userid+"/connections";
   // const connectionsRef1 = this.db.object(myConnectionsRefURL);
    const connectionsRef = firebase.database().ref().child(myConnectionsRefURL);
    //console.log("myConnectionsRefURL::", connectionsRef.child);
    //let connectionsRef = this.db.object(myConnectionsRefURL);
    return connectionsRef;
  }

  setupMyPresence(){
    let userid = this.getUser().uid;
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
  }
    

  goOffline() {
    console.log("goOffline.")
    this.deviceConnectionRef.off();
    this.deviceConnectionRef.remove();
    this.deviceConnectionRef.then(function() {
      console.log("Remove succeeded.")
    })
    .catch(function(error) {
      console.log("Remove failed: " + error.message)
    });
    this.deviceConnectionRef = null;
  }
}
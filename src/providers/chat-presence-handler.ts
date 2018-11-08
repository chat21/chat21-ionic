import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Events } from 'ionic-angular';

// firebase
import * as firebase from 'firebase/app';

// services
import { ChatManager } from './chat-manager/chat-manager';

// utils
import { setLastDate } from '../utils/utils';

import { TranslateService } from '@ngx-translate/core';

//import { ApplicationContext } from './application-context/application-context';

/*
  Generated class for the AuthService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ChatPresenceHandler {
  public tenant: string;
  public urlNodeFirebase: string;
  //public deviceConnectionRef;
  public myConnectionsRef; //: firebase.database.Reference;
  public lastOnlineRef; //: firebase.database.Reference;

  constructor(
    public events: Events,
    public chatManager: ChatManager,
    public translate: TranslateService
  ) {
    this.tenant = chatManager.getTenant();
    this.urlNodeFirebase = '/apps/'+this.tenant;
  }

  /**
   * controlla se esiste una connessione per l'utente analizzato,
   * verificando se esiste un nodo in presence/uid/connections
   * mi sottosrivo al nodo
   * se non esiste pubblico utente offline 
   * se esiste pubblico utente online 
   * @param userid 
   */
  userIsOnline(userid){
    //this.lastOnlineForUser(userid);
    const that = this;
    let myConnectionsRefURL = this.urlNodeFirebase+"/presence/"+userid+"/connections";
    const connectionsRef = firebase.database().ref().child(myConnectionsRefURL);
    connectionsRef.on("value", (child) => {
      if(child.val()){
        that.events.publish('statusUser:online-'+userid, userid, true);
      }
      else {
        that.events.publish('statusUser:online-'+userid, userid, false);
        //that.events.publish('statusUser:offline-'+userid, userid,'offline');
      }
    })
  }
  /**
   * mi sottoscrivo al nodo presence/uid/lastOnline
   * e recupero la data dell'ultimo stato online
   * pubblico lastConnectionDate 
   * @param userid 
   */
  lastOnlineForUser(userid){
    const that = this;
    let lastOnlineRefURL = this.urlNodeFirebase+"/presence/"+userid+"/lastOnline";
    const lastOnlineRef = firebase.database().ref().child(lastOnlineRefURL);
    lastOnlineRef.on("value", (child) => {
      if(child.val()){
        const lastConnectionDate = that.getTimeLastConnection(child.val());
        that.events.publish('lastConnectionDate-'+userid, userid,lastConnectionDate);
      }
    });
  }

  /**
   * calcolo tempo trascorso tra ora e timestamp passato
   * @param timestamp 
   */
  getTimeLastConnection(timestamp:string){
    //let timestampNumber = parseInt(timestamp)/1000;
    let time = setLastDate(this.translate, timestamp);
    return time;
  }

  /**
   * recupero la reference di lastOnline del currentUser
   * usata in setupMyPresence
   * @param userid 
   */
  lastOnlineRefForUser(userid){
    let lastOnlineRefURL = this.urlNodeFirebase+"/presence/"+userid+"/lastOnline";
    const lastOnlineRef = firebase.database().ref().child(lastOnlineRefURL);
    return lastOnlineRef;
  }

  /**
   * recupero la reference di connections (online/offline) del currentUser
   * usata in setupMyPresence
   * @param userid 
   */
  onlineRefForUser(userid){
    let myConnectionsRefURL = this.urlNodeFirebase+"/presence/"+userid+"/connections";
    const connectionsRef = firebase.database().ref().child(myConnectionsRefURL);
    return connectionsRef;
  }

  /**
   * 1 - imposto reference online/offline
   * 2 - imposto reference lastConnection
   * 3 - mi sincronizzo con /.info/connected
   * 4 - se il valore esiste l'utente è online
   * 5 - aggiungo nodo a connection (true)
   * 6 - aggiungo job su onDisconnect di deviceConnectionRef che rimuove nodo connection 
   * 7 - aggiungo job su onDisconnect di lastOnlineRef che imposta timestamp
   * 8 - salvo reference connected nel singlelton !!!!! DA FARE
   * @param userid 
   */
  setupMyPresence(userid){
    let that = this;
    this.myConnectionsRef = this.onlineRefForUser(userid);
    this.lastOnlineRef = this.lastOnlineRefForUser(userid);
    let connectedRefURL = "/.info/connected";
    let conn = firebase.database().ref(connectedRefURL);
    conn.on('value', function(dataSnapshot) {
      //console.log("KEY: ",dataSnapshot,that.deviceConnectionRef);
      if(dataSnapshot.val()){
        console.log("self.deviceConnectionRef: ", that.myConnectionsRef);
        //if (!that.myConnectionsRef || that.myConnectionsRef==='undefined') {
        if (that.myConnectionsRef) {
          //this.deviceConnectionRef = myConnectionsRef.set(true);
          let conection = true;
          //that.deviceConnectionRef = 
          that.myConnectionsRef.push(conection);
          //!!! quando faccio logout devo disconnettermi
          that.myConnectionsRef.onDisconnect().remove();
          // when I disconnect, update the last time I was seen online
          let now: Date = new Date();
          let timestamp = now.valueOf();
          that.lastOnlineRef.onDisconnect().set(timestamp);
        } else {
          console.log("This is an error. self.deviceConnectionRef already set. Cannot be set again.");
        }
      }
    });
  }
    
  /**
   * rimuovo la references su lastOnline
   * rimuovo la references su connection
   */
  goOffline() {
    console.log("goOffline.", this.myConnectionsRef)
    this.removeConnectionReference();
    this.removeLastOnlineReference();
  }

  removeConnectionReference(){
    if(this.myConnectionsRef){
      this.myConnectionsRef.off();
      console.log("goOffline 1", this.myConnectionsRef)
      this.myConnectionsRef.remove();
      console.log("goOffline 2", this.myConnectionsRef)
    }
    this.myConnectionsRef = null;
  }

  removeLastOnlineReference(){
    if(this.lastOnlineRef){
      this.lastOnlineRef.off();
      this.lastOnlineRef.remove();
    }
    this.lastOnlineRef = null;
  }
}
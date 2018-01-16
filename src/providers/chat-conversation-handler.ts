import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Events } from 'ionic-angular';
// firebase
import * as firebase from 'firebase/app';
// models
import { MessageModel } from '../models/message';
import { UserModel } from '../models/user';
// services
//import { ChatManager } from './chat-manager/chat-manager';
// utils
import { MSG_STATUS_RECEIVED } from '../utils/constants';
import { urlify, searchIndexInArrayForUid, setHeaderDate, conversationMessagesRef } from '../utils/utils';

@Injectable()
export class ChatConversationHandler {
  private urlNodeFirebase: string;
  private recipientId: string;
  private recipientFullname: string;
  private tenant: string;
  private loggedUser: UserModel;
  private senderId: string;
  public conversationWith: string;
  public messages: any[];
  public messagesRef: firebase.database.Query;
  //public events: Events;

  constructor(
    public events: Events
  ) {
    console.log("CONSTRUCTOR ChatConversationHandlerProvider");
    //this.tenant = this.chatManager.getTenant();
    //this.loggedUser = this.chatManager.getLoggedUser();
    //this.events = new Events();
  }
  /**
   * inizializzo conversation handler
   * @param recipientId 
   * @param recipientFullName 
   */
  initWithRecipient(recipientId,recipientFullName, loggedUser, tenant) {
    this.loggedUser = loggedUser;
    this.tenant = tenant;
    this.recipientId = recipientId;
    this.recipientFullname = recipientFullName;
    this.senderId = this.loggedUser.uid;
    this.conversationWith = recipientId;
    this.messages = [];
  }
  /**
   * mi connetto al nodo messages
   * recupero gli ultimi 100 messaggi
   * creo la reference
   * mi sottoscrivo a change, removed, added
   */
  connect() {
    //this.messages = [];
    var lastDate: string = "";
    const that = this;

    this.urlNodeFirebase = conversationMessagesRef(this.tenant, this.loggedUser.uid);
    this.urlNodeFirebase = this.urlNodeFirebase+this.conversationWith;
    console.log("urlNodeFirebase *****", this.urlNodeFirebase);
    const firebaseMessages = firebase.database().ref(this.urlNodeFirebase);
    this.messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(100);

    this.messagesRef.on("child_changed", function(childSnapshot) {
      console.log("child_changed *****", childSnapshot.key);
      const itemMsg = childSnapshot.val();
      // imposto il giorno del messaggio per visualizzare o nascondere l'header data
      const calcolaData = setHeaderDate(itemMsg['timestamp'], lastDate);
      if(calcolaData != null){
        lastDate = calcolaData;
      }
      // controllo fatto per i gruppi da rifattorizzare
      (!itemMsg.sender_fullname || itemMsg.sender_fullname == 'undefined')?itemMsg.sender_fullname = itemMsg.sender:itemMsg.sender_fullname;
     
      // creo oggetto messaggio e lo aggiungo all'array dei messaggi
      const msg = new MessageModel(itemMsg['language'], itemMsg['recipient'], itemMsg['recipient_fullname'], itemMsg['sender'], itemMsg['sender_fullname'], itemMsg['status'], itemMsg['text'], itemMsg['timestamp'], calcolaData, itemMsg['type']);
      const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
      console.log("child_changed222 *****", index, that.messages, childSnapshot.key);
      that.messages.splice(index, 1, msg);
      // aggiorno stato messaggio
      // questo stato indica che è stato consegnato al client e NON che è stato letto
      that.setStatusMessage(childSnapshot, that.conversationWith);
      // pubblico messaggio - sottoscritto in dettaglio conversazione
      that.events.publish('listMessages:changed-'+that.conversationWith, that.conversationWith, that.messages);
    });

    this.messagesRef.on("child_removed", function(childSnapshot) {
      // al momento non previsto!!!
      const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
        // controllo superfluo sarà sempre maggiore
        if(index>-1){
          that.messages.splice(index, 1);
          this.events.publish('conversations:update-'+that.conversationWith, that.messages);
        }
    });

    this.messagesRef.on("child_added", function(childSnapshot) {
      //console.log("child_added *****", childSnapshot.key);
      const itemMsg = childSnapshot.val();
      // imposto il giorno del messaggio per visualizzare o nascondere l'header data
      let calcolaData = setHeaderDate(itemMsg['timestamp'], lastDate);
      if(calcolaData != null){
        lastDate = calcolaData;
      }
      // controllo fatto per i gruppi da rifattorizzare
      (!itemMsg.sender_fullname || itemMsg.sender_fullname == 'undefined')?itemMsg.sender_fullname = itemMsg.sender:itemMsg.sender_fullname;
      // creo oggetto messaggio e lo aggiungo all'array dei messaggi
      const messageText = urlify(itemMsg['text']);
      const msg = new MessageModel(itemMsg['language'], itemMsg['recipient'], itemMsg['recipient_fullname'], itemMsg['sender'], itemMsg['sender_fullname'], itemMsg['status'], messageText, itemMsg['timestamp'], calcolaData, itemMsg['type']);
      
      console.log("child_added *****", calcolaData, that.messages, msg);
      that.messages.push(msg);
     
      // aggiorno stato messaggio
      // questo stato indica che è stato consegnato al client e NON che è stato letto
      that.setStatusMessage(childSnapshot, that.conversationWith);
      // pubblico messaggio - sottoscritto in dettaglio conversazione
      console.log("publish:: ", 'listMessages:added-'+that.conversationWith, that.events);
      that.events.publish('listMessages:added-'+that.conversationWith, that.conversationWith, that.messages);
    })
  } 
  /**
   * arriorno lo stato del messaggio
   * questo stato indica che è stato consegnato al client e NON che è stato letto
   * se il messaggio NON è stato inviato da loggedUser AGGIORNO stato a 200
   * @param item 
   * @param conversationWith 
   */
  setStatusMessage(item,conversationWith){
    if(item.val()['status'] < MSG_STATUS_RECEIVED){
      //const tenant = this.chatManager.getTenant();
      //const loggedUser = this.chatManager.getLoggedUser();
      let msg = item.val();
      if (msg.sender != this.loggedUser.uid && msg.status < MSG_STATUS_RECEIVED){
        const urlNodeMessagesUpdate  = '/apps/'+this.tenant+'/users/'+this.loggedUser.uid+'/messages/'+conversationWith+"/"+item.key;
        console.log("AGGIORNO STATO MESSAGGIO", urlNodeMessagesUpdate);
        firebase.database().ref(urlNodeMessagesUpdate).update({ status: MSG_STATUS_RECEIVED });
      }
    }
  }
  /**
   * controllo se il messaggio è stato inviato da loggerUser
   * richiamato dalla pagina elenco messaggi della conversazione
   * @param message 
   */
  isSender(message) {
    const currentUser = this.loggedUser;//this.chatManager.getLoggedUser();
    if (currentUser){
      if (message.sender == currentUser.uid) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * bonifico url in testo messaggio
   * recupero time attuale
   * recupero lingua app
   * recupero sender_fullname e recipient_fullname
   * aggiungo messaggio alla reference
   * @param msg 
   * @param conversationWith 
   * @param conversationWithDetailFullname 
   */
  sendMessage(msg, conversationWith, conversationWithDetailFullname, channel_type): boolean {
    
    (!channel_type || channel_type == 'undefined')?'direct':channel_type;
    console.log("SEND MESSAGE: ", msg, channel_type);
    // console.log("messageTextArea:: ",this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style);
    // const messageString = urlify(msg);
    const now: Date = new Date();
    const timestamp = now.valueOf();
    const language = document.documentElement.lang;
    const sender_fullname = this.loggedUser.fullname;
    const recipient_fullname = conversationWithDetailFullname;
    let firebaseMessages = firebase.database().ref(this.urlNodeFirebase);
    if(firebaseMessages) {
      const message = {
        language: language,
        recipient: conversationWith,
        recipient_fullname: recipient_fullname,
        sender: this.loggedUser.uid,
        sender_fullname: sender_fullname,
        text: msg,
        timestamp: timestamp,
        type: 'text',
        channel_type: channel_type
      };
      console.log('messaggio **************',message);
      const newMessageRef = firebaseMessages.push();
      newMessageRef.set(message);
      // se non c'è rete viene aggiunto al nodo in locale e visualizzato
      // appena torno on line viene inviato!!!
      return true;
    }
    else {
      return false;
    }
  }
  /**
   * dispose reference della conversazione
   */
  dispose() {
    this.messagesRef.off();
  }
}
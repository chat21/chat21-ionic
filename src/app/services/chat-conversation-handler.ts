import { Injectable } from '@angular/core';
// import 'rxjs/add/operator/map';
// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
// models
import { MessageModel } from '../models/message';
import { ConversationModel } from '../models/conversation';
import { UserModel } from '../models/user';
// services
import { AppConfigProvider } from './app-config';
// import { BehaviorSubject } from '../../node_modules/rxjs/BehaviorSubject';
import { EventsService } from './events-service';
// utils
import { MSG_STATUS_RECEIVED, TYPE_GROUP } from '../utils/constants';
import {
  htmlEntities,
  compareValues, nodeTypingsPath,
  searchIndexInArrayForUid,
  setHeaderDate,
  conversationMessagesRef,
  conversationsPathForUserId,
  avatarPlaceholder,
  getColorBck,
  getImageUrlThumb,
  getTimeLastMessage
} from '../utils/utils';
import { TranslateService } from '@ngx-translate/core';




@Injectable({ providedIn: 'root' })
export class ChatConversationHandler {
  private urlNodeFirebase: string;
  private urlNodeTypings: string;
  private recipientId: string;
  private recipientFullname: string;
  private tenant: string;
  private loggedUser: UserModel;
  private senderId: string;
  public conversationWith: string;
  public messages: any[];
  // public messagesRef: firebase.database.Query;
  public ref: firebase.database.Query;
  public listSubsriptions: any[];
  public attributes: any;
  public CLIENT_BROWSER: string;
  // obsAdded: BehaviorSubject<MessageModel>;
  public listMembersInfo: any[];
  private setTimeoutWritingMessages;

  private lastDate = '';


  constructor(
    private events: EventsService,
    public translate: TranslateService,
    public appConfig: AppConfigProvider
  ) {
    console.log('CONSTRUCTOR ChatConversationHandlerProvider', translate);
    this.listSubsriptions = [];
    this.CLIENT_BROWSER = navigator.userAgent;
    // this.obsAdded = new BehaviorSubject<MessageModel>(null);
  }

  /**
   * inizializzo conversation handler
   */
  initWithRecipient(recipientId, recipientFullName, loggedUser, tenant) {
    console.log('initWithRecipient:::', tenant);
    this.loggedUser = loggedUser;
    this.tenant = tenant;
    this.recipientId = recipientId;
    this.recipientFullname = recipientFullName;
    if (loggedUser) {
      this.senderId = loggedUser.uid;
    }
    this.conversationWith = recipientId;
    this.messages = [];
    this.attributes = this.setAttributes();
  }

  setAttributes(): any {
    let attributes: any = JSON.parse(sessionStorage.getItem('attributes'));
    if (!attributes || attributes === 'undefined') {
        attributes = {
            client: this.CLIENT_BROWSER,
            sourcePage: location.href,
            userEmail: this.loggedUser.email,
            userFullname: this.loggedUser.fullname
        };
        console.log('>>>>>>>>>>>>>> setAttributes: ', JSON.stringify(attributes));
        sessionStorage.setItem('attributes', JSON.stringify(attributes));
    }
    return attributes;
  }


  connectConversation(conversationId: string) {
    const that = this;
    const urlNodeFirebase = conversationsPathForUserId(this.tenant, this.loggedUser.uid) + '/' + conversationId;
    console.log('connect -------> conversation', urlNodeFirebase);
    const ref =  firebase.database().ref(urlNodeFirebase).once('value');
    return ref;
  }

  /** */
  completeConversation(conv: any): ConversationModel {
    console.log('ALT ********************************************************** completeConversation', conv);
    const conversation: ConversationModel = conv;
    if (!conv.sender_fullname || conv.sender_fullname === 'undefined' || conv.sender_fullname.trim() === '') {
      conversation.sender_fullname = conv.sender;
    }
    if (!conv.recipient_fullname || conv.recipient_fullname === 'undefined' || conv.recipient_fullname.trim() === '') {
      conversation.recipient_fullname = conv.recipient;
    }
    let LABEL_TU: string;
    this.translate.get('LABEL_TU').subscribe((res: string) => {
        LABEL_TU = res;
    });
    let conversationWithFullname = conv.sender_fullname;
    let conversationWith = conv.sender;
    conversation.last_message_text = conv.last_message_text;

    if (conv.sender === this.loggedUser.uid) {
        conversationWith = conv.recipient;
        conversationWithFullname = conv.recipient_fullname;
        conversation.last_message_text = LABEL_TU + conv.last_message_text;
    }
    // else if (conv.channelType === TYPE_GROUP) {
    //     conv.last_message_text = conv.last_message_text;
    // }
    conversation.conversation_with_fullname = conversationWithFullname;
    conversation.selected = false;
    conversation.status = this.setStatusConversation(conv.sender, conv.uid);
    conversation.time_last_message = getTimeLastMessage(conv.timestamp);
    conversation.avatar = avatarPlaceholder(conversationWithFullname);
    conversation.color = getColorBck(conversationWithFullname);
    try {
        const FIREBASESTORAGE_BASE_URL_IMAGE = this.appConfig.getConfig().FIREBASESTORAGE_BASE_URL_IMAGE;
        conversation.image = getImageUrlThumb(FIREBASESTORAGE_BASE_URL_IMAGE, conversationWith);
    } catch (err) {
        console.log(err);
    }
    console.log('completeConversation', conversation);
    return conversation;
  }

  /** */
  setStatusConversation(sender: string, uid: string): string {
    let status = '0';
    if (sender === this.loggedUser.uid || uid === this.conversationWith) {
        status = '0';
    } else {
        status = '1';
    }
    return status;
  }

  /**
   * mi connetto al nodo messages
   * recupero gli ultimi 100 messaggi
   * creo la reference
   * mi sottoscrivo a change, removed, added
   */
  connect() {
    this.lastDate = '';
    const that = this;
    this.urlNodeFirebase = conversationMessagesRef(this.tenant, this.loggedUser.uid);
    this.urlNodeFirebase = this.urlNodeFirebase + this.conversationWith;
    console.log("urlNodeFirebase *****", this.urlNodeFirebase);
    const firebaseMessages = firebase.database().ref(this.urlNodeFirebase);
    this.ref = firebaseMessages.orderByChild('timestamp').limitToLast(100);
    console.log("this.translate *****", this.translate);

    //// AGGIUNTA MESSAGGIO ////
    this.ref.on("child_added", function (childSnapshot) {
      const itemMsg = childSnapshot.val();
      // imposto il giorno del messaggio per visualizzare o nascondere l'header data
      // console.log("that.translate *****", that.translate);
      let calcolaData = setHeaderDate(that.translate, itemMsg['timestamp'], that.lastDate);
      if (calcolaData != null) {
        that.lastDate = calcolaData;
      }
      console.log("calcolaData *****", calcolaData);
      // controllo fatto per i gruppi da rifattorizzare
      // tslint:disable-next-line: max-line-length
      (!itemMsg.senderFullname || itemMsg.senderFullname === 'undefined') ? itemMsg.senderFullname = itemMsg.sender : itemMsg.senderFullname;
      // bonifico messaggio da url
      //let messageText = replaceBr(itemMsg['text']);
      let messageText = itemMsg['text'];
      if (itemMsg['type'] == 'text') {
        //messageText = urlify(itemMsg['text']);
        messageText = htmlEntities(itemMsg['text']);
      }

      if (itemMsg['metadata']) {
        const index = searchIndexInArrayForUid(that.messages, itemMsg['metadata'].uid);
        if (index > -1) {
          that.messages.splice(index, 1);
        }
      }

      let isSender = that.isSender(itemMsg['sender'], that.loggedUser);

      // creo oggetto messaggio e lo aggiungo all'array dei messaggi
      const msg = new MessageModel(
        childSnapshot.key,
        itemMsg['language'],
        itemMsg['recipient'],
        itemMsg['recipient_fullname'],
        itemMsg['sender'],
        itemMsg['sender_fullname'],
        itemMsg['status'], 
        itemMsg['metadata'], 
        messageText, 
        itemMsg['timestamp'], 
        calcolaData, 
        itemMsg['type'], 
        itemMsg['attributes'], 
        itemMsg['channel_type'], 
        isSender
      );
      if (msg.attributes && msg.attributes.subtype && (msg.attributes.subtype === 'info' || msg.attributes.subtype === 'info/support')) {
        that.translateInfoSupportMessages(msg);
      }
      console.log("child_added *****", msg);
      that.messages.push(msg);
      that.messages.sort(compareValues('timestamp', 'asc'));

      // aggiorno stato messaggio
      // questo stato indica che è stato consegnato al client e NON che è stato letto
      that.setStatusMessage(childSnapshot, that.conversationWith);

      console.log("msg.sender ***** " + msg.sender + " that.loggedUser.uid:::" + that.loggedUser.uid);
      // if (isSender) {
      //   that.events.publish('doScroll');
      // } 
      //that.obsAdded.next(msg);
      that.events.publish('newMessage', msg);
      // pubblico messaggio - sottoscritto in dettaglio conversazione
    })

    //// SUBSRIBE CHANGE ////
    this.ref.on("child_changed", function(childSnapshot) {
      const itemMsg = childSnapshot.val();
      // imposto il giorno del messaggio per visualizzare o nascondere l'header data
      // const calcolaData = setHeaderDate(that.translate, itemMsg['timestamp'], this.lastDate);
      // if (calcolaData != null) {
      //   this.lastDate = calcolaData;
      // }
      // controllo fatto per i gruppi da rifattorizzare
      // tslint:disable-next-line: max-line-length
      (!itemMsg.senderFullname || itemMsg.senderFullname === 'undefined') ? itemMsg.senderFullname = itemMsg.sender : itemMsg.senderFullname;
      // bonifico messaggio da url
      //let messageText = replaceBr(itemMsg['text']);
      let messageText = itemMsg['text'];
      if (itemMsg['type'] == 'text') {
        //messageText = urlify(itemMsg['text']);
        messageText = htmlEntities(itemMsg['text']);
      }
      let isSender = that.isSender(itemMsg['sender'], that.loggedUser);
      // creo oggetto messaggio e lo aggiungo all'array dei messaggi
      const msg = new MessageModel(
        childSnapshot.key, 
        itemMsg['language'], 
        itemMsg['recipient'], 
        itemMsg['recipient_fullname'], 
        itemMsg['sender'], 
        itemMsg['sender_fullname'], 
        itemMsg['status'], 
        itemMsg['metadata'], 
        messageText, 
        itemMsg['timestamp'], 
        null, 
        itemMsg['type'], 
        itemMsg['attributes'], 
        itemMsg['channel_type'], 
        isSender
      );
      const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);

      if (msg.attributes && msg.attributes.subtype && (msg.attributes.subtype === 'info' || msg.attributes.subtype === 'info/support')) {
        that.translateInfoSupportMessages(msg);
      }

     
  
      that.messages.splice(index, 1, msg);
      // aggiorno stato messaggio
      // questo stato indica che è stato consegnato al client e NON che è stato letto
      that.setStatusMessage(childSnapshot, that.conversationWith);
      
      
      // pubblico messaggio - sottoscritto in dettaglio conversazione
      //that.events.publish('listMessages:changed-'+that.conversationWith, that.conversationWith, that.messages);
      //that.events.publish('listMessages:changed-'+that.conversationWith, that.conversationWith, msg);

      // if (isSender) {
      //   that.events.publish('doScroll');
      // }
    });

    this.ref.on("child_removed", function(childSnapshot) {
      // al momento non previsto!!!
      const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
      // controllo superfluo sarà sempre maggiore
      if (index > -1) {
        that.messages.splice(index, 1);
        //this.events.publish('conversations:update-'+that.conversationWith, that.messages);
      }

      // if(!this.isSender(msg)){
      //   that.events.publish('doScroll');
      // }
    });
  } 
   
  private translateInfoSupportMessages(message: MessageModel) {
    // console.log("ChatConversationHandler::translateInfoSupportMessages::message:", message);

    // check if the message has attributes, attributes.subtype and these values
    if (message.attributes && message.attributes.subtype && (message.attributes.subtype === 'info' || message.attributes.subtype === 'info/support')) {
      
      // check if the message attributes has parameters and it is of the "MEMBER_JOINED_GROUP" type
      // [BEGIN MEMBER_JOINED_GROUP]
      if ((message.attributes.messagelabel && message.attributes.messagelabel.parameters && message.attributes.messagelabel.key === 'MEMBER_JOINED_GROUP')) {
        
        var subject:string;
        var verb:string;
        var complement:string;
        if (message.attributes.messagelabel.parameters.member_id === this.loggedUser.uid) {
          this.translate.get('INFO_SUPPORT_USER_ADDED_SUBJECT').subscribe((res: string) => {      
            subject = res;
          });
          this.translate.get('INFO_SUPPORT_USER_ADDED_YOU_VERB').subscribe((res: string) => {      
            verb = res;
          });
          this.translate.get('INFO_SUPPORT_USER_ADDED_COMPLEMENT').subscribe((res: string) => {      
            complement = res;
          });
        } else {
          if (message.attributes.messagelabel.parameters.fullname) {
            // other user has been added to the group (and he has a fullname)
            subject = message.attributes.messagelabel.parameters.fullname;
            this.translate.get('INFO_SUPPORT_USER_ADDED_VERB').subscribe((res: string) => {      
              verb = res;
            });
            this.translate.get('INFO_SUPPORT_USER_ADDED_COMPLEMENT').subscribe((res: string) => {      
              complement = res;
            });
          } else {
            // other user has been added to the group (and he has not a fullname, so use hes useruid)
            subject = message.attributes.messagelabel.parameters.member_id;
            this.translate.get('INFO_SUPPORT_USER_ADDED_VERB').subscribe((res: string) => {      
              verb = res;
            });
            this.translate.get('INFO_SUPPORT_USER_ADDED_COMPLEMENT').subscribe((res: string) => {      
              complement = res;
            });
          }
        }

        // perform translation
        this.translate.get('INFO_SUPPORT_USER_ADDED_MESSAGE', {
          'subject': subject,
          'verb': verb,
          'complement': complement
        }).subscribe((res: string) => {
          message.text = res;
        });

      } // [END MEMBER_JOINED_GROUP]

      // [END CHAT_REOPENED]
      else if ((message.attributes.messagelabel && message.attributes.messagelabel.key === 'CHAT_REOPENED')) {
        this.translate.get('INFO_SUPPORT_CHAT_REOPENED').subscribe((res: string) => {      
          message.text = res;
        });
      }
      // [END CHAT_REOPENED]

      // [END CHAT_CLOSED]
      else if ((message.attributes.messagelabel && message.attributes.messagelabel.key === 'CHAT_CLOSED')) {
        this.translate.get('INFO_SUPPORT_CHAT_CLOSED').subscribe((res: string) => {      
          message.text = res;
        });
      }
      // [END CHAT_CLOSED]
    }
   

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
   */
  isSender(sender, currentUser) {
    //const currentUser = this.loggedUser;//this.chatManager.getLoggedUser();
    console.log("isSender::::: ", sender, currentUser.uid);
    if (currentUser) {
      if (sender === currentUser.uid) {
        //message.isSender = true;
        return true;
      } else {
        //message.isSender = false;
        return false;
      }
    } else {
      //message.isSender = false;
      return false;
    }
  }

  /**
   * bonifico url in testo messaggio
   * recupero time attuale
   * recupero lingua app
   * recupero senderFullname e recipientFullname
   * aggiungo messaggio alla reference
   * @param msg
   * @param conversationWith
   * @param conversationWithDetailFullname
   */
  sendMessage(
    msg: string,
    type: string,
    metadata: string,
    conversationWith: string,
    conversationWithDetailFullname: string,
    sender: string,
    senderFullname: string,
    channelType: string
  ) {
    const that = this;
    if (!channelType || channelType === 'undefined') {
      channelType = 'direct';
    }
    console.log('messages: ',  this.messages);
    console.log('senderFullname: ',  senderFullname);
    console.log('sender: ',  sender);
    console.log('SEND MESSAGE: ', msg, channelType);
    const now: Date = new Date();
    const timestamp =  firebase.database.ServerValue.TIMESTAMP;
    console.log('timestamp: ', timestamp);
    console.log('timestamp: ', firebase.database['ServerValue']['TIMESTAMP']);

    const language = document.documentElement.lang;
    // const senderFullname = this.loggedUser.fullname;
    const recipientFullname = conversationWithDetailFullname;
    const dateSendingMessage = setHeaderDate(this.translate, timestamp);
    const firebaseMessagesCustomUid = firebase.database().ref(this.urlNodeFirebase);
    const message = new MessageModel(
      '', // uid
      language, // language
      conversationWith, // recipient
      recipientFullname, // recipient_full_name
      sender, // sender
      senderFullname, // sender_full_name
      0, // status
      metadata, // metadata
      msg, // text
      timestamp, // timestamp
      dateSendingMessage, // headerDate
      type, // type
      this.attributes, // attributes
      channelType, // channel_type
      true // is_sender
    );

    console.log('messaggio **************', message);
    const messageRef = firebaseMessagesCustomUid.push();
    const key = messageRef.key;
    message.uid = key;
    console.log('messageRef: ', messageRef, key);
    messageRef.set(message, ( error ) => {
      if (error) {
        message.status = -100;
        console.log('ERRORE', error);
      } else {
        message.status = 150;
        console.log('OK MSG INVIATO CON SUCCESSO AL SERVER', message);
      }
      console.log('****** changed *****', that.messages);
    });

  }


  updateMetadataMessage(uid: string, metadata: any) {
    metadata.status = true;
    const message = {
      metadata: metadata
    };
    const firebaseMessages = firebase.database().ref(this.urlNodeFirebase + uid);
    firebaseMessages.set(message);
  }


  // BEGIN TYPING FUNCTIONS
  /**
   * 
   */
  initWritingMessages() {
    this.urlNodeTypings = nodeTypingsPath(this.tenant, this.conversationWith);
    console.log('checkWritingMessages', this.urlNodeTypings);
  }

  /**
   * check if agent writing
   */
  getWritingMessages() {
    const that = this;
    const ref = firebase.database().ref(this.urlNodeTypings).orderByChild('timestamp').limitToLast(1);
    ref.on('child_changed', (childSnapshot) => {
        // that.changedTypings(childSnapshot);
        // console.log('child_changed key', childSnapshot.key);
        // console.log('child_changed val', childSnapshot.val());
        that.events.publish('isTypings', childSnapshot);
    });
  }

  /**
   * 
   */
  setWritingMessages(str, channelType?) {
    const that = this;
    //clearTimeout(this.setTimeoutWritingMessages);
    this.setTimeoutWritingMessages = setTimeout(function () {
      let readUrlNodeTypings = nodeTypingsPath(that.tenant, that.loggedUser.uid);
      //let readUrlNodeTypings = that.urlNodeTypings;
      if (channelType === TYPE_GROUP) {
        console.log('GRUPPO');
        readUrlNodeTypings = that.urlNodeTypings + '/' + that.loggedUser.uid;
      }
      
      console.log('setWritingMessages:', readUrlNodeTypings);
      const timestamp =  firebase.database.ServerValue.TIMESTAMP;
      const precence = {
        'timestamp': timestamp, 
        'message': str
      }
      firebase.database().ref(readUrlNodeTypings).set(precence, function( error ) {
        if (error) {
          console.log('ERRORE', error);
        } else {
          console.log('OK update typing');
        }
      });
    }, 500);
  }
  // END TYPING FUNCTIONS


  /**
   * dispose reference della conversazione
   */
  dispose() {
    this.ref.off();
  }


  unsubscribe(key){
    console.log("unsubscribe: ", key);
    this.listSubsriptions.forEach(sub => {
      console.log("unsubscribe: ", sub.uid, key);
      if(sub.uid === key){
        console.log("unsubscribe: ", sub.uid, key);
        sub.unsubscribe(key, null);
        return;
      }
    });
    
  }

}
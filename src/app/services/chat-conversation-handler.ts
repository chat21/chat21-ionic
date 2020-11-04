import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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

  // BehaviorSubject
  // messageAdded: BehaviorSubject<MessageModel> = new BehaviorSubject<MessageModel>(null);
  // messageChanged: BehaviorSubject<MessageModel> = new BehaviorSubject<MessageModel>(null);
  // messageRemoved: BehaviorSubject<string> = new BehaviorSubject<string>(null);

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
    public translate: TranslateService,
    public appConfig: AppConfigProvider
  ) { }

  /**
   * inizializzo conversation handler
   */
  initialize(
    recipientId: string,
    recipientFullName: string,
    loggedUser: UserModel,
    tenant: string
  ) {
    console.log('initWithRecipient:::', tenant);
    this.listSubsriptions = [];
    this.CLIENT_BROWSER = navigator.userAgent;
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

  /** */
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


  /** */
  connectConversation(conversationId: string) {
    const urlNodeFirebase = conversationsPathForUserId(this.tenant, this.loggedUser.uid) + '/' + conversationId;
    console.log('connect -------> conversation', urlNodeFirebase);
    const ref =  firebase.database().ref(urlNodeFirebase).once('value');
    return ref;
  }

  /** */
  completeConversation(conv: any): ConversationModel {
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
    console.log('urlNodeFirebase *****', this.urlNodeFirebase);
    const firebaseMessages = firebase.database().ref(this.urlNodeFirebase);
    this.ref = firebaseMessages.orderByChild('timestamp').limitToLast(100);
    this.ref.on('child_added', (childSnapshot) => {
      that.added(childSnapshot);
    });
    this.ref.on('child_changed', (childSnapshot) => {
      that.changed(childSnapshot);
    });
    this.ref.on('child_removed', (childSnapshot) => {
      that.removed(childSnapshot);
    });
  }

  //// SUBSRIBTIONS ////
  /** */
  private added(childSnapshot: any) {
    const msg = this.messageGenerate(childSnapshot);
    // imposto il giorno del messaggio per visualizzare o nascondere l'header data
    const headerDate = setHeaderDate(this.translate, msg.timestamp);
    if (headerDate) {
      this.lastDate = headerDate;
      msg.headerDate = headerDate;
    }
    // elimino eventuali messaggi duplicati
    if (msg.metadata) {
      const index = searchIndexInArrayForUid(this.messages, msg.metadata.uid);
      if (index > -1) {
        this.messages.splice(index, 1);
      }
    }
    // aggiungo msg all'array e ordino l'array
    this.messages.push(msg);
    this.messages.sort(compareValues('timestamp', 'asc'));
    // aggiorno stato messaggio
    // questo stato indica che è stato consegnato al client e NON che è stato letto
    this.setStatusMessage(msg, this.conversationWith);
    // sollevo l'evento
    // this.messageAdded.next(msg);
  }

  /** */
  private changed(childSnapshot: any) {
    const msg = this.messageGenerate(childSnapshot);
    // imposto il giorno del messaggio per visualizzare o nascondere l'header data
    // sostituisco messaggio nuovo con quello nell'array
    const index = searchIndexInArrayForUid(this.messages, childSnapshot.key);
    this.messages.splice(index, 1, msg);
    // aggiorno stato messaggio
    // questo stato indica che è stato consegnato al client e NON che è stato letto
    this.setStatusMessage(msg, this.conversationWith);
    // sollevo l'evento
    // this.events.publish('messages_child_changed', msg);
    // this.messageChanged.next(msg);
  }

  /** */
  private removed(childSnapshot: any) {
    const index = searchIndexInArrayForUid(this.messages, childSnapshot.key);
    // controllo superfluo sarà sempre maggiore
    if (index > -1) {
      this.messages.splice(index, 1);
      // this.messageRemoved.next(childSnapshot.key);
     // this.events.publish('messages_child_removed', childSnapshot.key);
    }
  }

  /** */
  private messageGenerate(childSnapshot: any) {
    const msg: MessageModel = childSnapshot.val();
    msg.uid = childSnapshot.key;
    // controllo fatto per i gruppi da rifattorizzare
    if (!msg.sender_fullname || msg.sender_fullname === 'undefined') {
      msg.sender_fullname = msg.sender;
    }
    // bonifico messaggio da url
    if (msg.type === 'text') {
      msg.text = htmlEntities(msg.text);
    }
    // verifico che il sender è il logged user
    msg.isSender = this.isSender(msg.sender, this.loggedUser.uid);
    // traduco messaggi se sono del server
    if (msg.attributes && msg.attributes.subtype) {
      if (msg.attributes.subtype === 'info' || msg.attributes.subtype === 'info/support') {
        this.translateInfoSupportMessages(msg);
      }
    }
    return msg;
  }

  /** */
  private translateInfoSupportMessages(message: MessageModel) {
    // check if the message attributes has parameters and it is of the "MEMBER_JOINED_GROUP" type
    // [BEGIN MEMBER_JOINED_GROUP]
    if (message.attributes.messagelabel
      && message.attributes.messagelabel.parameters
      && message.attributes.messagelabel.key === 'MEMBER_JOINED_GROUP'
    ) {
      let subject: string;
      let verb: string;
      let complement: string;
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
    } else if ((message.attributes.messagelabel && message.attributes.messagelabel.key === 'CHAT_REOPENED')) {
      this.translate.get('INFO_SUPPORT_CHAT_REOPENED').subscribe((res: string) => {
        message.text = res;
      });
    } else if ((message.attributes.messagelabel && message.attributes.messagelabel.key === 'CHAT_CLOSED')) {
      this.translate.get('INFO_SUPPORT_CHAT_CLOSED').subscribe((res: string) => {
        message.text = res;
      });
    }
  }


  /**
   * aggiorno lo stato del messaggio
   * questo stato indica che è stato consegnato al client e NON che è stato letto
   * se il messaggio NON è stato inviato da loggedUser AGGIORNO stato a 200
   * @param item
   * @param conversationWith
   */
  setStatusMessage(msg: MessageModel, conversationWith: string) {
    if (msg.status < MSG_STATUS_RECEIVED) {
      if (msg.sender !== this.loggedUser.uid && msg.status < MSG_STATUS_RECEIVED) {
        // tslint:disable-next-line: max-line-length
        const urlNodeMessagesUpdate  = '/apps/' + this.tenant + '/users/' + this.loggedUser.uid + '/messages/' + conversationWith + '/' + msg.uid;
        console.log('AGGIORNO STATO MESSAGGIO', urlNodeMessagesUpdate);
        firebase.database().ref(urlNodeMessagesUpdate).update({ status: MSG_STATUS_RECEIVED });
      }
    }
  }

  /**
   * controllo se il messaggio è stato inviato da loggerUser
   * richiamato dalla pagina elenco messaggi della conversazione
   */
  isSender(sender: string, currentUserId: string) {
    console.log('isSender::::: ', sender, currentUserId);
    if (currentUserId) {
      if (sender === currentUserId) {
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

        //that.events.publish('isTypings', childSnapshot);
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
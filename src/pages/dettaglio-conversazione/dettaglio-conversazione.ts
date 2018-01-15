import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavParams, Content, Events, NavController } from 'ionic-angular';
//import { Subscription } from 'rxjs/Subscription';
// models
import { UserModel } from '../../models/user';
import { MessageModel } from '../../models/message';
// services 
import { UserService } from '../../providers/user/user';
import { NavProxyService } from '../../providers/nav-proxy';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';
import { ChatManager } from '../../providers/chat-manager/chat-manager';
// pages
import { _DetailPage } from '../_DetailPage';
import { ProfilePage } from '../profile/profile';
// utils
import { LABEL_NO_MSG_HERE, LABEL_ACTIVE_NOW, MIN_HEIGHT_TEXTAREA,MSG_STATUS_SENDING, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT } from '../../utils/constants';
//import { urlify, searchIndexInArrayForUid, setHeaderDate, conversationMessagesRef } from '../../utils/utils';

import { ChatConversationHandler } from '../../providers/chat-conversation-handler';


@IonicPage()
@Component({
  selector: 'page-dettaglio-conversazione',
  templateUrl: 'dettaglio-conversazione.html',
})
export class DettaglioConversazionePage extends _DetailPage{
  @ViewChild(Content) content: Content;
  @ViewChild('messageTextArea') messageTextArea: ElementRef;
  //@ViewChild('messageTextArea') messageTextArea: ElementRef;   

  private tenant: string;
  private conversationHandler: ChatConversationHandler;
  private scrollDirection: any = 'bottom';
  private messages: Array<MessageModel> = [];
  private conversationWith: string;
  private currentUserDetail: UserModel;
  private conversationWithFullname: string;
  private online: boolean;
  private lastConnectionDate: string;
  private messageString: string;
  private style_message_welcome: boolean;

  
  LABEL_ACTIVE_NOW = LABEL_ACTIVE_NOW;
  LABEL_NO_MSG_HERE = LABEL_NO_MSG_HERE;
  MSG_STATUS_SENDING = MSG_STATUS_SENDING;
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  
  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public chatPresenceHandler: ChatPresenceHandler,
    public navProxy: NavProxyService,
    public userService: UserService,
    public events: Events,
    public chatManager: ChatManager
  ) {
    super();
    // recupero id utente e fullname con cui si conversa
    
    this.conversationWith = navParams.get('conversationWith');
    this.conversationWithFullname = navParams.get('conversationWithFullname');
    this.messages = [];

    console.log('constructor PAGE ::: ');

    //const that = this;
    // elenco sottoscrizioni 
    // subscribe stato utente con cui si conversa ONLINE
    this.events.subscribe('statusUser:online-'+this.conversationWith, this.statusUserOnline);
    // subscribe stato utente con cui si conversa ONLINE
    this.events.subscribe('statusUser:offline-'+this.conversationWith, this.statusUserOffline);
    // subscribe data ultima connessione utente con cui si conversa
    this.events.subscribe('lastConnectionDate-'+this.conversationWith, this.updateLastConnectionDate);
  
    // subscribe elenco messaggi
    this.events.subscribe('listMessages:added-'+this.conversationWith, this.addHandler);
    this.events.subscribe('listMessages:changed-'+this.conversationWith, this.changedHandler);
    
  }
  /**
   * on subscribe stato utente con cui si conversa ONLINE
   */
  statusUserOnline: any = (uid) => {
    if(uid !== this.conversationWith){return;}
    this.online = true;
    console.log('ONLINE **************');
  }
  /**
   * on subscribe stato utente con cui si conversa OFFLINE
   */
  statusUserOffline: any = (uid) => {
    if(uid !== this.conversationWith){return;}
    this.online = false;
    console.log('OFFLINE **************');
  }
  /**
   * on subscribe data ultima connessione utente con cui si conversa
   */
  updateLastConnectionDate: any = (uid,lastConnectionDate) => {
    this.lastConnectionDate = lastConnectionDate;
    console.log('updateLastConnectionDate **************',this.lastConnectionDate);
  }
  /**
   * on subcribe add message
   */
  addHandler:any = (uid, messages) => {
    console.log('addHandler', uid, messages);
    this.messages = messages;
    this.doScroll();
  }
  /**
   * on subcribe change message
   */
  changedHandler:any = (uid, messages) => {
    console.log('changedHandler', uid, messages);
    this.messages = messages;
    this.doScroll();
  }

  /**
   * 
   */
  ngOnInit() {
    this.messages = [];
    console.log('ngOnInit',this.events,this.conversationWithFullname);
  }
  /**
   * quando ho renderizzato la pagina richiamo il metodo di inizialize
   */
  ionViewDidEnter(){
    console.log('ionViewDidEnter');
    //this.content.scrollDownOnLoad = true;
    this.initialize();
  }
  /**
   * quando esco dalla pagina distruggo i subscribe
   */
  ionViewWillLeave() {
    console.log('ionViewWillLeave **************');
    this.unsubescribeAll();
  }
  /**
   * unsubscribe all subscribe events
   */
  unsubescribeAll(){
    // this.events.unsubscribe('statusUser:online-'+this.conversationWith, this.statusUserOnline);
    // this.events.unsubscribe('statusUser:offline-'+this.conversationWith, this.statusUserOffline);
    // this.events.unsubscribe('lastConnectionDate-'+this.conversationWith, this.updateLastConnectionDate);
    // this.events.unsubscribe('listMessages:added-'+this.conversationWith, this.addHandler);
    // this.events.unsubscribe('listMessages:changed-'+this.conversationWith, this.changedHandler);
  }

  /**
   * resetto array messaggi
   * resetto stato online user with
   * resetto data ultima connessione
   * recupero currentUserDetail
   * load stato utente con cui si conversa online/offline
   * load data ultimo aggesso utente con cui si conversa
   * recupero info status user conversation with
   * carico messaggi
   */
  initialize(){
    console.log('initialize DettaglioConversazionePage **************',this.chatManager.handlers);
    // this.updatingMessageList = false;
    //this.messages = [];
    this.online = false;
    this.lastConnectionDate = '';
    this.tenant = this.chatManager.getTenant();
    this.currentUserDetail = this.chatManager.getLoggedUser();
    this.chatPresenceHandler.userIsOnline(this.conversationWith);
    this.chatPresenceHandler.lastOnlineForUser(this.conversationWith);
    this.initConversationHandler();
  }
  /**
   * recupero da chatManager l'handler
   * se NON ESISTE creo un handler e mi connetto 
   * se ESISTE mi connetto
   * carico messaggi
   * attendo un sec se nn arrivano messaggi visualizzo msg wellcome
   */
  initConversationHandler() {
    //const loggedUser = this.chatManager.getLoggedUser();
    const that = this;
    this.style_message_welcome = false;
    let handler:ChatConversationHandler = this.chatManager.getConversationHandlerByConversationId(this.conversationWith);
    console.log('initConversationHandler **************',this.chatManager, handler, this.conversationWith);
    if (!handler) {
      console.log('ENTRO ***',this.conversationHandler);
      //const handler = 
      this.conversationHandler = new ChatConversationHandler(this.events);
      this.conversationHandler.initWithRecipient(this.conversationWith, this.conversationWithFullname,this.currentUserDetail,this.tenant);
      //this.chatConversationHandler.initWithRecipient(this.conversationWith, this.conversationWithFullname,this.currentUserDetail,this.tenant);
      
      //handler = this.chatConversationHandler;
      //this.conversationHandler = handler;
      //[self subscribe:handler];
      //[self.conversationHandler restoreMessagesFromDB];
      if (this.conversationWith) {
        //handler.connect();
        this.conversationHandler.connect();
        console.log('PRIMA ***', this.chatManager.handlers);
        this.chatManager.addConversationHandler(this.conversationHandler);
        console.log('DOPO ***', this.chatManager.handlers);
      }
    }
    else {
      console.log('NON ENTRO ***',this.conversationHandler,handler);
      //handler.connect();
      //[self subscribe:handler];
      this.conversationHandler = handler;
      this.messages = this.conversationHandler.messages;
      console.log('NON ENTRO2  ***',this.conversationHandler, this.messages );
      this.doScroll();
    }
    // attendo un secondo e poi visualizzo il messaggio se nn ci sono messaggi
    setTimeout(function() {
      //console.log('setTimeout *** 111',that.messages);
      if(!that.messages || that.messages.length == 0){
        that.style_message_welcome = true;
        console.log('setTimeout *** 111',that.style_message_welcome);
      }
    }, 1000);
  }
  /**
   * chiamato dal subscribe('listMessages:added')
   * ogni volta che viene aggiunto un messaggio
   * aggiorno la lista dei messaggi e mi posiziono sull'ultimo
   * @param messages 
   */
  updateMessageList(messages){
    // if(!this.updatingMessageList){
      this.messages = messages;
      console.log('updateMessageList **************', this.messages.length);
      this.doScroll();
    // }
    // this.updatingMessageList = true;
  }

  //// START Scroll managemant functions ////
  /**
   * Scroll to bottom of page after a short delay.
   */
  scrollBottom() {
    let that = this;
    setTimeout(function() {
      //console.log('scrollBottom **************', that.content._scroll);
      if(that.content._scroll){
        that.content.scrollToBottom(0);
      }
    }, 1);
  }
  /**
   * Scroll to top of the page after a short delay.
   */
  scrollTop() {
    let that = this;
    setTimeout(function() {
      that.content.scrollToTop();
    }, 1);
  }
  /**
   * Scroll depending on the direction.
   */
  doScroll() {
    // console.log('doScroll **************', this.scrollDirection);
    if (this.scrollDirection == 'bottom') {
      this.scrollBottom();
    } else if (this.scrollDirection == 'top') {
      this.scrollTop();
    }
  }
  //// END Scroll managemant functions ////




  //// START FUNZIONI RICHIAMATE DA HTML ////
  /**
   * Check if the user is the sender of the message.
   * @param message 
   */
  isSender(message) {
    return this.conversationHandler.isSender(message);
  }
  /**
   * se il messaggio non è vuoto
   * 1 - ripristino l'altezza del box input a quella di default
   * 2 - invio il messaggio
   * 3 - se l'invio è andato a buon fine mi posiziono sull'ultimo messaggio
   * @param msg 
   */
  sendMessage(msg) {
    console.log("SEND MESSAGE: ", msg);
    if (msg && msg.trim() != ''){
      this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style.height = MIN_HEIGHT_TEXTAREA+"px";
      const resultSendMsg = this.conversationHandler.sendMessage(msg, this.conversationWith, this.conversationWithFullname);
      if (resultSendMsg){
        this.doScroll();
      }
    }
  }

  /**
   * purifico il messaggio
   * e lo passo al metodo di invio
   * @param messageString 
   */
  controlOfMessage(messageString){
    console.log('controlOfMessage **************');
    messageString = messageString.replace(/(\r\n|\n|\r)/gm,"");
    if (messageString.trim() != ''){
      this.sendMessage(messageString);
    } 
    this.messageString = "";
  }
  /**
   * invocata dalla pressione del tasto invio sul campo di input messaggio
   * se il messaggio non è vuoto lo passo al metodo di controllo
   * @param event 
   * @param messageString 
   */
  pressedOnKeyboard(event,messageString){
    console.log('pressedOnKeyboard ************** event:: ', event.code);
    if (event.inputType == "insertLineBreak" && event.data == null){
      this.messageString = "";
      return
    }
    else{
      this.controlOfMessage(messageString);
    }
  }
  /**
   * metodo chiamato dall'html quando premo sul nome utente nell'header della pagina
   * apro la pg di dettaglio user
   * @param uidReciver 
   */
  goToUserDetail(uidReciver: string) {
    console.log('goToUserDetail::: ',this.navProxy.isOn, uidReciver);
    this.navCtrl.push(ProfilePage, {
      uidUser: uidReciver
    });
  }
  //// END FUNZIONI RICHIAMATE DA HTML ////


}


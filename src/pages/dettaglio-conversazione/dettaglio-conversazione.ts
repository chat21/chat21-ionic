import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavParams, Content, Events, NavController } from 'ionic-angular';
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
  // private updatingMessageList: boolean;
  
  LABEL_ACTIVE_NOW = LABEL_ACTIVE_NOW;
  LABEL_NO_MSG_HERE = LABEL_NO_MSG_HERE;
  MSG_STATUS_SENDING = MSG_STATUS_SENDING;
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  
  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public chatPresenceHandler: ChatPresenceHandler,
    public chatConversationHandler: ChatConversationHandler,
    public navProxy: NavProxyService,
    public userService: UserService,
    public events: Events,
    public chatManager: ChatManager
  ) {
    super();
    // recupero id utente e fullname con cui si conversa
    this.conversationWith = navParams.get('conversationWith');
    this.conversationWithFullname = navParams.get('conversationWithFullname');
  }

  ngOnInit() {
    console.log('ngOnInit',this.conversationWithFullname);
    // elenco sottoscrizioni 
    // subscribe stato utente con cui si conversa ONLINE
    this.events.subscribe('statusUser:online', (uid) => {
      if(uid !== this.conversationWith){return;}
      this.online = true;
      //console.log('ONLINE **************');
    });
    // subscribe stato utente con cui si conversa ONLINE
    this.events.subscribe('statusUser:offline', (uid) => {
      if(uid !== this.conversationWith){return;}
      this.online = false;
      //console.log('OFFLINE **************');
    });
    // subscribe data ultima connessione utente con cui si conversa
    this.events.subscribe('lastConnectionDate', (uid,lastConnectionDate) => {
      this.lastConnectionDate = lastConnectionDate;
    });
    // subscribe elenco messaggi
    /**
     * mi sottoscrivo a listMessages:added chiamato ogni volta che viene letto un nuovo msg
     * attendo 500 millisecondi e aggiorno elenco messaggi
     * (il ritardo è per evitare lo scroll ad ogni visualizzazione di un nuovo msg può essere eliminato)
     */
    this.events.subscribe('listMessages:added', (uid, messages) => {
      //console.log('listMessages:added **************', uid);
      if (messages !== this.messages && uid == this.conversationWith){
        //const that = this;
        //setTimeout(function(){
        this.updateMessageList(messages);
        //}, 1);
      }
    });
    this.events.subscribe('listMessages:changed', (uid,messages) => {
      // console.log('listMessages:changed **************',messages, uid);
      if(uid == this.conversationWith){
        this.messages = messages;
      }
      //this.doScroll();
    });
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
   * NO!!! non ne ho bisogno mi servono attivi!!!
   */
  ionViewWillLeave() {
    console.log('ionViewWillLeave **************');
    // this.events.unsubscribe('statusUser:online');
    // this.events.unsubscribe('statusUser:offline');
    // this.events.unsubscribe('lastConnectionDate');
    // this.events.unsubscribe('listMessages:added');
    // this.events.unsubscribe('listMessages:changed');
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
    console.log('initialize DettaglioConversazionePage **************');
    // this.updatingMessageList = false;
    this.messages = [];
    this.online = false;
    this.lastConnectionDate = '';
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
    const that = this;
    this.style_message_welcome = false;
    let handler:ChatConversationHandler = this.chatManager.getConversationHandlerByConversationId(this.conversationWith);
    console.log('initConversationHandler **************',handler, this.conversationWith);
    if (!handler) {
      console.log('ENTRO ***');
      handler = this.chatConversationHandler.initWithRecipient(this.conversationWith, this.conversationWithFullname);
      this.chatManager.addConversationHandler(handler);
      this.conversationHandler = handler;
      //[self subscribe:handler];
      //[self.conversationHandler restoreMessagesFromDB];
      if (this.conversationWith) {
        handler.connect();
      }
    }
    else {
      console.log('NON ENTRO ***');
      handler.connect();
      //[self subscribe:handler];
      this.conversationHandler = handler;
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
    return this.chatConversationHandler.isSender(message);
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
      const resultSendMsg = this.chatConversationHandler.sendMessage(msg, this.conversationWith, this.conversationWithFullname);
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


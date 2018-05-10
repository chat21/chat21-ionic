import { Component, ViewChild, ElementRef } from '@angular/core';
import { PopoverController, Platform, ActionSheetController, IonicPage, NavParams, Content, Events, NavController } from 'ionic-angular';
// models
import { UserModel } from '../../models/user';
import { MessageModel } from '../../models/message';
import { UploadModel } from '../../models/upload';
// providers services 
import { UserService } from '../../providers/user/user';
import { NavProxyService } from '../../providers/nav-proxy';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';
import { ChatManager } from '../../providers/chat-manager/chat-manager';
import { UploadService } from '../../providers/upload-service/upload-service';
import { ChatConversationHandler } from '../../providers/chat-conversation-handler';
// pages
import { _DetailPage } from '../_DetailPage';
import { ProfilePage } from '../profile/profile';
// import { InfoConversationPage } from '../info-conversation/info-conversation';
// import { InfoMessagePage } from '../info-message/info-message';
import { PopoverPage } from '../popover/popover';
// utils
import { TYPE_POPUP_DETAIL_MESSAGE, TYPE_DIRECT, MAX_WIDTH_IMAGES, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, MIN_HEIGHT_TEXTAREA,MSG_STATUS_SENDING, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT } from '../../utils/constants';
import { isPopupUrl, popupUrl, strip_tags, getSizeImg, urlify, convertMessageAndUrlify } from '../../utils/utils';


@IonicPage()
@Component({
  selector: 'page-dettaglio-conversazione',
  templateUrl: 'dettaglio-conversazione.html',
})
export class DettaglioConversazionePage extends _DetailPage{
  @ViewChild(Content) content: Content;
  @ViewChild('messageTextArea') messageTextArea: ElementRef; 

  private tenant: string;
  private conversationHandler: ChatConversationHandler;
  private scrollDirection: any = 'bottom';
  private messages: Array<MessageModel> = [];
  private arrayLocalImmages:  Array<any> = [];

  private conversationWith: string;
  private currentUserDetail: UserModel;
  private conversationWithFullname: string;
  private channel_type: string;
  private online: boolean;
  private lastConnectionDate: string;
  private messageString: string;
  private style_message_welcome: boolean;

  private selectedFiles: FileList;
  private isFileSelected: boolean;
  private openInfoConversation: boolean;
  private openInfoMessage: boolean;
  private conversationEnabled: boolean = true;
  
  MSG_STATUS_SENDING = MSG_STATUS_SENDING;
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  urlify = urlify;
  isPopupUrl = isPopupUrl;
  popupUrl = popupUrl;
  strip_tags = strip_tags;
  
  convertMessageAndUrlify = convertMessageAndUrlify;
  
  constructor(
    public popoverCtrl: PopoverController,
    public navParams: NavParams,
    public navCtrl: NavController,
    public chatPresenceHandler: ChatPresenceHandler,
    public navProxy: NavProxyService,
    public userService: UserService,
    public events: Events,
    public chatManager: ChatManager,
    public actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    private upSvc: UploadService
  ) {
    super();
    //// recupero id utente e fullname con cui si conversa
    //// uid utente con cui si conversa
    this.conversationWith = navParams.get('conversationWith');
    //// nome utente con cui si conversa
    this.conversationWithFullname = navParams.get('conversationWithFullname');
    //// tipo di canale della chat: direct/group
    this.channel_type = navParams.get('channel_type');
    (!this.channel_type || this.channel_type == 'undefined')?this.channel_type=TYPE_DIRECT:this.channel_type;
    this.messages = []; // list messages of conversation
    this.isFileSelected = false; // indica se è stato selezionato un file (image da uplodare)
    this.openInfoConversation = this.chatManager.openInfoConversation; // indica se è aperto il box info conversation
    this.openInfoMessage = false; // indica se è aperto il box info message
    //// init variables
    this.initSubscriptions();
    // DESTROY INFO CONVERSATION 
    console.log('1 - DESTROY INFO CONVERSATION',this.events);
    this.events.publish('closeDetailConversation', true);
  }

  //// SUBSCRIBTIONS ////
  /** 
   * subscriptions list 
  */
  initSubscriptions(){
    // subscribe stato utente con cui si conversa ONLINE
    this.events.subscribe('statusUser:online-'+this.conversationWith, this.statusUserOnline);
    // subscribe stato utente con cui si conversa ONLINE
    this.events.subscribe('statusUser:offline-'+this.conversationWith, this.statusUserOffline);
    // subscribe data ultima connessione utente con cui si conversa
    this.events.subscribe('lastConnectionDate-'+this.conversationWith, this.updateLastConnectionDate);
    // subscribe elenco messaggi
    this.events.subscribe('doScroll', this.goToBottom);
    // subscribe dettaglio messaggio
    this.events.subscribe('openInfoMessage', this.onOpenInfoMessage);
    // subscribe message videochat
    this.events.subscribe('openVideoChat', this.onOpenVideoChat);

  }

  //// CALLBACK SUBSCRIBTIONS ////
  onConversationEnabled: any = (status) => {
    console.log('onConversationEnabled');
    this.conversationEnabled = status;
  }

  onOpenVideoChat: any = (message) => {
    this.messageString = message;
    const text_area = this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0];
    text_area.value = message; //<HTMLInputElement>document.getElementById('chat21-main-message-context');
    text_area.focus();
  }
  /**
   * callback sottoscrizione openInfoMessage
   * apre il box di dx del info messaggio
   */
  onOpenInfoMessage: any = (message) => {
    this.openInfoMessage = true;
    //console.log('OPEN MESSAGE **************', message);
  }
  /**
   * on subscribe stato utente con cui si conversa ONLINE
   */
  statusUserOnline: any = (uid) => {
    if(uid !== this.conversationWith){return;}
    this.online = true;
    this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
    console.log('************** ONLINE');
  }
  /**
   * on subscribe stato utente con cui si conversa OFFLINE
   */
  statusUserOffline: any = (uid) => {
    if(uid !== this.conversationWith){return;}
    this.online = false;
    this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
    console.log('************** OFFLINE');
  }
  /**
   * on subscribe data ultima connessione utente con cui si conversa
   */
  updateLastConnectionDate: any = (uid,lastConnectionDate) => {
    this.lastConnectionDate = lastConnectionDate;
    this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
    console.log('************** updateLastConnectionDate',this.lastConnectionDate);
  }
  /**
   * on subcribe doScroll add message
   */
  goToBottom:any = (data) => {
    this.doScroll();
    console.log('*********** goToBottom');
  }


  //// UNSUBSCRIPTIONS ////
  /**
   * unsubscribe all subscribe events
   */
  unsubescribeAll(){
    //this.events.unsubscribe('doScroll', null);
    //this.events.unsubscribe('openInfoMessage', null);
    this.events.unsubscribe('statusUser:online-'+this.conversationWith, null);
    this.events.unsubscribe('statusUser:offline-'+this.conversationWith, null);
    this.events.unsubscribe('lastConnectionDate-'+this.conversationWith, null);
    this.events.unsubscribe('conversationEnabled', null);
    //this.events.unsubscribe('openVideoChat', null);
  }

  //// SYSTEM FUNCTIONS ////
  /**
   * quando ho renderizzato la pagina richiamo il metodo di inizialize
   */
  ionViewDidEnter(){
    //console.log('ionViewDidEnter');
    this.initialize();
  }
  /**
   * quando esco dalla pagina distruggo i subscribe
   */
  ionViewWillLeave() {
    console.log('------------> ionViewWillLeave');
    this.unsubescribeAll();
  }

  ngAfterViewInit() {
    console.log('------------> ngAfterViewInit ');
    //this.events.subscribe('conversationEnabled', this.onConversationEnabled);
  }

  //// MY FUNCTIONS ////
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
    console.log('----------> initialize DettaglioConversazionePage',this.chatManager.handlers);
    (!this.channel_type || this.channel_type == 'undefined')?this.channel_type=TYPE_DIRECT:this.channel_type;
    this.messages = []; // list messages of conversation
    this.isFileSelected = false; // indica se è stato selezionato un file (image da uplodare)
    this.openInfoMessage = false; // indica se è aperto il box info message
    this.online = false;
    this.lastConnectionDate = '';

    this.tenant = this.chatManager.getTenant();
    this.currentUserDetail = this.chatManager.getLoggedUser();
    this.openInfoConversation = this.chatManager.getOpenInfoConversation();

    
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
        this.messages = this.conversationHandler.messages;
        this.doScroll();
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
      } else {
        that.doScroll();
        that.onInfoConversation();
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
    if (this.scrollDirection == 'bottom') {
      this.scrollBottom();
    } else if (this.scrollDirection == 'top') {
      this.scrollTop();
    }
  }
  //// END Scroll managemant functions ////


  //// START FUNZIONI RICHIAMATE DA HTML ////
  /** 
   * chiude il box di dx del info messaggio
  */
  onCloseInfoPage(){
    if(this.openInfoMessage){
      this.openInfoMessage = false;
    } else {
      this.onOpenCloseInfoConversation();
    }
  }

  /** 
   * 
  */
  onOpenCloseInfoConversation(){
    this.chatManager.onOpenCloseInfoConversation();
    this.openInfoConversation =  this.chatManager.openInfoConversation;
    this.onInfoConversation();
  }

  /** */
  onInfoConversation(){
    // ordino array x tempo decrescente
    // cerco messaggi non miei
    // prendo il primo
    let msgRicevuti;
    let attributes = [];
    try {
      msgRicevuti = this.messages.find(item => item.sender !== this.currentUserDetail.uid);
      attributes = msgRicevuti.attributes;
    }
    catch(err) {
    }
    //const msgRicevuti = this.messages.find(item => item.sender !== this.currentUserDetail.uid);
    console.log('msgRicevuti::::: ', msgRicevuti);
    console.log('onUidSelected::::: ', this.conversationWith,  this.openInfoConversation);
    this.events.publish('onOpenInfoConversation', this.openInfoConversation, this.conversationWith, this.channel_type, attributes);
    //this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
  }

  /**
   * Check if the user is the sender of the message.
   * @param message 
   */
  isSender(message) {
    const currentUser = this.chatManager.getLoggedUser();
    return this.conversationHandler.isSender(message, currentUser);
  }
  /**
   * se il messaggio non è vuoto
   * 1 - ripristino l'altezza del box input a quella di default
   * 2 - invio il messaggio
   * 3 - se l'invio è andato a buon fine mi posiziono sull'ultimo messaggio
   * @param msg 
   */
  sendMessage(msg, type, metadata?) {
    (metadata) ? metadata = metadata : metadata = '';
    console.log("SEND MESSAGE: ", msg, this.messages);
    // if (type == 'image'){
    //   msg = 'Image: ' + metadata['src'];
    // } else if(type == 'file'){
    //   msg = 'file';
    // }
    //(!msg)? msg = metadata.type: msg;
    if (msg && msg.trim() != '' || type !== TYPE_MSG_TEXT ){
      this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style.height = MIN_HEIGHT_TEXTAREA+"px";
      this.conversationHandler.sendMessage(msg, type, metadata, this.conversationWith, this.conversationWithFullname, this.channel_type);
      this.doScroll();
    }
  }
  /**
   * 
   * @param metadata 
   */
  // updateMetadataMessage(metadata) {
  //   // recupero id nodo messaggio
  //   const key = metadata.src.substring(metadata.src.length - 16);
  //   const uid =  this.arrayLocalImmages[key];
  //   console.log("UPDATE MESSAGE: ",key, uid);
  //   this.conversationHandler.updateMetadataMessage(uid, metadata);
  //   delete this.arrayLocalImmages[key];
  // }
  /**
   * purifico il messaggio
   * e lo passo al metodo di invio
   * @param messageString 
   */
  controlOfMessage(messageString){
    console.log('controlOfMessage **************');
    messageString = messageString.replace(/(\r\n|\n|\r)/gm,"");
    if (messageString.trim() != ''){
      this.sendMessage(messageString, TYPE_MSG_TEXT);
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
  /**
   * 
   * @param message 
   */
  getSizeImg(message): any {
    return getSizeImg(message, MAX_WIDTH_IMAGES);
  }

  // setUrlString(text, name): any {
  //   return name;
  //   // if(text) {
  //   //   return setUrlString(text, name);
  //   // } else {
  //   //   return name;
  //   // }
  // }

  /** */
  showButtonInfo(){
    console.log('showButtonInfo');
  }
  /**
   * 
   * @param msg 
   */
  showDetailMessage(msg){
    console.log('showDetailMessage', msg);
    //this.presentPopover(msg);
  }
  /**
  * apro il menu delle opzioni 
  * (metodo richiamato da html) 
  * alla chiusura controllo su quale opzione ho premuto e attivo l'azione corrispondete
  */
 presentPopover(event, msg) {
  let popover = this.popoverCtrl.create(PopoverPage, {typePopup:TYPE_POPUP_DETAIL_MESSAGE, message:msg});
  popover.present({
    ev: event
  });
  /**
   * 
   */
  popover.onDidDismiss((data: string) => {
    console.log(" ********* data::: ", data);
    if (data == 'logOut') {
      //this.logOut();
    }
    else if (data == 'ProfilePage') {
      if(this.chatManager.getLoggedUser()){
        this.navCtrl.push(ProfilePage);
      }
    }
  });
}
//// END FUNZIONI RICHIAMATE DA HTML ////






  //// START LOAD IMAGE ////
  /**
   * 
   * @param event 
   */
  detectFiles(event) {
    console.log('event: ', event.target.files[0].name, event.target.files);
    if (event) {
      this.selectedFiles = event.target.files;
      this.fileChange(event);
    }
  }

  fileChange(event) {
    const that = this;
    if (event.target.files && event.target.files[0]) {
      const nameImg = event.target.files[0].name;
      const typeFile = event.target.files[0].type;
      // const preview = document.querySelector('img');
      // const file    = document.querySelector('input[type=file]').files[0];
      const reader  = new FileReader();
      reader.addEventListener('load', function () {
          that.isFileSelected = true;
    
          if(typeFile.indexOf('image') !== -1 ){
            const file4Load = new Image;
            file4Load.src = reader.result;
            file4Load.title = nameImg;
            file4Load.onload = function() {
              console.log('that.file4Load: ', file4Load);
                that.arrayLocalImmages.push(file4Load);
                const file = that.selectedFiles.item(0);
                const uid = file4Load.src.substring(file4Load.src.length - 16);
                const metadata = {
                  'name': file.name,
                  'src': file4Load.src,
                  'width': file4Load.width,
                  'height': file4Load.height,
                  'type': typeFile,
                  'uid': uid
                };
                const type_msg = 'image';
                // 1 - invio messaggio
                that.addLocalMessage(metadata, type_msg);
                // 2 - carico immagine
                that.uploadSingle(metadata, type_msg);
            };
          } else if(typeFile.indexOf('application') !== -1 ){
            const type_msg = 'file';
            const file = that.selectedFiles.item(0);
            const metadata = {
              'name': file.name,
              'src': event.target.files[0].src,
              'type': type_msg
            };
      
            // 1 - invio messaggio
            that.addLocalMessage(metadata, type_msg);
            // 2 - carico immagine
            that.uploadSingle(metadata, type_msg);
          }
          
      }, false);
      if (event.target.files[0]) {
          reader.readAsDataURL(event.target.files[0]);
          console.log('reader-result: ', event.target.result);
      }
    }
  }

  /**
   * salvo un messaggio localmente nell'array dei msg
   * @param metadata
   */
  addLocalMessage(metadata, type_msg) {
    const now: Date = new Date();
    const timestamp = now.valueOf();
    const language = document.documentElement.lang; 
    let textMessage = type_msg;
    if(type_msg === 'image'){
      textMessage = '';
    } 
    const message = new MessageModel(
        metadata.uid, // uid
        language, // language
        this.conversationWith, // recipient
        this.conversationWithFullname, //'Support Group', // recipient_fullname
        this.currentUserDetail.uid, // sender
        this.currentUserDetail.fullname, //'Ospite', // sender_fullname
        '', // status
        metadata, // metadata
        textMessage, // text
        timestamp, // timestamp
        '', // headerDate
        type_msg, //TYPE_MSG_IMAGE,
        '', //attributes
        '' // channel_type
    );

    // if(type_msg == 'file'){
    //   message.text = metadata.src;
    // }
    this.messages.push(message);
    // message.metadata.uid = message.uid;
    console.log('addLocalMessage: ', this.messages);
    //this.isFileSelected = true;
    this.doScroll();
  }

  /**
   * 
   * @param metadata 
   */
  uploadSingle(metadata, type_msg) {
    this.isFileSelected = false;
    const that = this;
    const file = this.selectedFiles.item(0);
    console.log('Uploaded a file! ', file);
    const currentUpload = new UploadModel(file);
    this.upSvc.pushUploadMessage(currentUpload)
    .then(function(snapshot) {
      console.log('Uploaded a blob or file! ', snapshot.downloadURL);
      // metadata.src = snapshot.downloadURL;
      // that.sendMessage('', type_msg, metadata);


      metadata.src = snapshot.downloadURL;
      let type_message = TYPE_MSG_TEXT;
      let message = 'File: ' + metadata.src;
      if (metadata.type.startsWith('image')) {
          type_message = TYPE_MSG_IMAGE;
          message = 'Image: ' + metadata.src;
      }
      that.sendMessage(message, type_message, metadata);


    })
    .catch(function(error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('error: ', errorCode, errorMessage);
    });
    console.log('reader-result: ', file);
  }
  /**
   * 
   * @param metadata 
   */
  onSendImage(metadata) {
    console.log('onSendImage::::: ', metadata);
    this.sendMessage('', TYPE_MSG_IMAGE, metadata);
    this.doScroll();
  }


}


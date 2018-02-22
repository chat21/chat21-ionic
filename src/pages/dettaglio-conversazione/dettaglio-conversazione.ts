import { Component, ViewChild, ElementRef } from '@angular/core';
import { PopoverController, Platform, ActionSheetController, IonicPage, NavParams, Content, Events, NavController } from 'ionic-angular';
//import { Subscription } from 'rxjs/Subscription';
// models
import { UserModel } from '../../models/user';
import { MessageModel } from '../../models/message';
import { UploadModel } from '../../models/upload';
// services 
import { UserService } from '../../providers/user/user';
import { NavProxyService } from '../../providers/nav-proxy';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';
import { ChatManager } from '../../providers/chat-manager/chat-manager';
import { UploadService } from '../../providers/upload-service/upload-service';
// pages
import { _DetailPage } from '../_DetailPage';
import { ProfilePage } from '../profile/profile';
import { InfoConversationPage } from '../info-conversation/info-conversation';
import { InfoMessagePage } from '../info-message/info-message';

import { PopoverPage } from '../popover/popover';

// utils
import { TYPE_POPUP_DETAIL_MESSAGE, TYPE_DIRECT, TYPE_GROUP, MAX_WIDTH_IMAGES, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, MIN_HEIGHT_TEXTAREA,MSG_STATUS_SENDING, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT } from '../../utils/constants';
import { searchIndexInArrayForUid, getSizeImg } from '../../utils/utils';

import { ChatConversationHandler } from '../../providers/chat-conversation-handler';
//import { CustomTranslateService } from '../../providers/translate-service';
//import { TranslateService } from '@ngx-translate/core';

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
  private isSelected: boolean;
  private openInfoConversation: boolean;
  private openInfoMessage: boolean;
  

  MSG_STATUS_SENDING = MSG_STATUS_SENDING;
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  
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
    //public translate: TranslateService
  ) {
    super();
    // recupero id utente e fullname con cui si conversa
    
    this.conversationWith = navParams.get('conversationWith');
    this.conversationWithFullname = navParams.get('conversationWithFullname');
    this.channel_type = navParams.get('channel_type');
    this.messages = [];
    (!this.channel_type || this.channel_type == 'undefined')?this.channel_type=TYPE_DIRECT:this.channel_type;
    console.log('constructor PAGE ::: ',this.channel_type);

    //const that = this;
    // elenco sottoscrizioni 
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
    
    // this.events.subscribe('listMessages:added-'+this.conversationWith, this.addHandler);
    // this.events.subscribe('listMessages:changed-'+this.conversationWith, this.changedHandler);
    
    this.isSelected = false;
    this.openInfoConversation = true;
    this.openInfoMessage = false;
  }

  onOpenInfoMessage: any = (message) => {
    this.openInfoMessage = true;
    console.log('OPEN MESSAGE **************', message);
  }

  onCloseInfoMessage(){
    this.openInfoMessage = false;
    console.log('OPEN MESSAGE **************');
  }

  /**
   * on subscribe stato utente con cui si conversa ONLINE
   */
  statusUserOnline: any = (uid) => {
    if(uid !== this.conversationWith){return;}
    this.online = true;
    this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
    console.log('ONLINE **************');
  }
  /**
   * on subscribe stato utente con cui si conversa OFFLINE
   */
  statusUserOffline: any = (uid) => {
    if(uid !== this.conversationWith){return;}
    this.online = false;
    this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
    console.log('OFFLINE **************');
  }
  /**
   * on subscribe data ultima connessione utente con cui si conversa
   */
  updateLastConnectionDate: any = (uid,lastConnectionDate) => {
    this.lastConnectionDate = lastConnectionDate;
    this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
    console.log('updateLastConnectionDate **************',this.lastConnectionDate);
  }
  /**
   * on subcribe doScroll add message
   */
  goToBottom:any = (data) => {
    console.log('goToBottom');
    this.doScroll();
  }

  // /**
  //  * on subcribe add message
  //  */
  // addHandler:any = (uid, messages) => {
  //   console.log('addHandler', uid, messages);
  //   this.messages = messages;
  //   this.doScroll();
  // }
  // /**
  //  * on subcribe change message
  //  */
  // changedHandler:any = (uid, messages) => {
  //   console.log('changedHandler', uid, messages);
  //   this.messages = messages;
  //   // this.doScroll();
  // }
  /**
   * on subcribe add message
   */
  // addHandler:any = (uid, message) => {
  //   console.log('ADD NW MSG ->', message.type, message);
  //   if (message && message.sender === this.currentUserDetail.uid ) {
  //       // && message.type !== TYPE_MSG_TEXT
  //       // se è un'immagine che ho inviato io nn fare nulla
  //       // aggiorno la stato del messaggio e la data
  //       console.log('UPDATE NW MSG ->');
  //       this.updateMessage(message);
  //       this.doScroll();
  //   } else if (message) {
  //     if(message.type !== TYPE_MSG_TEXT){
  //       if(!message.metadata || message.metadata === '' || message.metadata === 'undefined'){
  //         message.metadata = '{src:'+message.text+'}';
  //       }
  //     }
  //     console.log('ADD NW MSG 2:', message);
  //     this.messages.push(message);
  //     this.doScroll();
  //   }

  //   // console.log('addHandler', uid, messages);
  //   // this.messages = messages;
  //   // this.doScroll();
  // }
  // /**
  //  * on subcribe change message
  //  */
  // changedHandler:any = (uid, message) => {
  //   console.log('CHANGED NW MSG:----> ', message.uid, uid);
  //   if (message) {
  //       const index = searchIndexInArrayForUid(this.messages, message.uid);
  //       if(index > -1){
  //         console.log('index:----> ', index, this.messages);
  //         this.messages.splice(index, 1, message);
  //       }
        
  //   }
  //   // console.log('changedHandler', uid, messages);
  //   // this.messages = messages;
  // }

  /**
   * aggiorno messaggio: uid, status, timestamp, headerDate
   * richiamata alla sottoscrizione dell'aggiunta di un nw messaggio
   * in caso in cui il messaggio è un'immagine ed è stata inviata dall'utente
  */
  updateMessage(message) {
    console.log('UPDATE MSG:', message);
    const index = searchIndexInArrayForUid(this.messages, message.metadata.uid);
    if (index > -1) {
        this.messages[index].uid = message.uid;
        this.messages[index].status = message.status;
        this.messages[index].timestamp = message.timestamp;
        this.messages[index].headerDate = message.headerDate;
        console.log('UPDATE ok:', this.messages[index]);
    } 
    // else {
    //     this.messages.push(message);
    // }
    // if(message.type ===TYPE_MSG_IMAGE && !message.metadata || message.metadata === ''){
    //   this.messages.push(message);
    //   return;
    // }
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
    this.events.unsubscribe('statusUser:online-'+this.conversationWith, this.statusUserOnline);
    this.events.unsubscribe('statusUser:offline-'+this.conversationWith, this.statusUserOffline);
    this.events.unsubscribe('lastConnectionDate-'+this.conversationWith, this.updateLastConnectionDate);
    // this.events.unsubscribe('listMessages:added-'+this.conversationWith, this.addHandler);
    // this.events.unsubscribe('listMessages:changed-'+this.conversationWith, this.changedHandler);
    // this.chatManager.removeConversationHandler(this.conversationWith);
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
   * Check if the user is the sender of the message.
   * @param message 
   */
  ifIsSender(message) {
    const currentUser = this.chatManager.getLoggedUser();
    return this.conversationHandler.ifIsSender(message, currentUser);
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
    if (msg && msg.trim() != '' || type !== TYPE_MSG_TEXT ){
      this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style.height = MIN_HEIGHT_TEXTAREA+"px";
      this.conversationHandler.sendMessage(msg, type, metadata, this.conversationWith, this.conversationWithFullname, this.channel_type);
      this.doScroll();
      // if (resultSendMsgKey){
      //   if(metadata){
      //     const key = metadata.src.substring(metadata.src.length - 16);
      //     this.arrayLocalImmages[key] = resultSendMsgKey;
      //   }
      //   this.doScroll();
      // }
    }
  }


  updateMetadataMessage(metadata) {
    // recupero id nodo messaggio
    const key = metadata.src.substring(metadata.src.length - 16);
    const uid =  this.arrayLocalImmages[key];
    console.log("UPDATE MESSAGE: ",key, uid);
    this.conversationHandler.updateMetadataMessage(uid, metadata);
    delete this.arrayLocalImmages[key];
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

  getSizeImg(message): any {
    return getSizeImg(message, MAX_WIDTH_IMAGES);
  }

  showButtonInfo(){
    console.log('showButtonInfo');
  }
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






  // START LOAD IMAGE 
  
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
        // const preview = document.querySelector('img');
        // const file    = document.querySelector('input[type=file]').files[0];
        const reader  = new FileReader();
        reader.addEventListener('load', function () {
            that.isSelected = true;
            // aggiungo nome img in un div 'event.target.files[0].name'
            // aggiungo div pulsante invio
            // preview.src = reader.result;
            const imageXLoad = new Image;
            imageXLoad.src = reader.result;
            imageXLoad.title = nameImg;
            imageXLoad.onload = function() {
              console.log('that.imageXLoad: ', imageXLoad);
                that.arrayLocalImmages.push(imageXLoad);
                const uid = imageXLoad.src.substring(imageXLoad.src.length - 16);
                const metadata = {
                  'src': imageXLoad.src,
                  'width': imageXLoad.width,
                  'height': imageXLoad.height,
                  'uid': uid
                };
                // 1 - invio messaggio
                //that.onSendImage(metadata);
                that.addLocalMessageImage(metadata);
                // 2 - carico immagine
                that.uploadSingle(metadata);
            };
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
    addLocalMessageImage(metadata) {
      const now: Date = new Date();
      const timestamp = now.valueOf();
      const language = document.documentElement.lang; 

      const message = new MessageModel(
          metadata.uid, // uid
          language, // language
          this.conversationWith, // recipient
          this.conversationWithFullname, //'Support Group', // recipient_fullname
          this.currentUserDetail.uid, // sender
          this.currentUserDetail.fullname, //'Ospite', // sender_fullname
          '', // status
          metadata, // metadata
          '', // text
          timestamp.toString(), // timestamp
          '', // headerDate
          TYPE_MSG_IMAGE,
          '' // type
      );
      this.messages.push(message);
      // message.metadata.uid = message.uid;
      console.log('addLocalMessageImage: ', this.messages);
      this.isSelected = true;
      this.doScroll();
  }

  uploadSingle(metadata) {
    this.isSelected = false;
    const that = this;
    const file = this.selectedFiles.item(0);
    const currentUpload = new UploadModel(file);
    this.upSvc.pushUploadMessage(currentUpload)
    .then(function(snapshot) {
      console.log('Uploaded a blob or file! ', snapshot.downloadURL);
      //// AGGIORNO MESSAGGIO SUL SERVER!!! recuperandolo dall'array chiave valore
      ////that.onSendImage(snapshot.downloadURL, w, h);
      //that.updateMetadataMessage(metadata);

      metadata.src = snapshot.downloadURL;
      that.sendMessage('', TYPE_MSG_IMAGE, metadata);
    })
    .catch(function(error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('error: ', errorCode, errorMessage);
    });
    console.log('reader-result: ', file);
  }


  onSendImage(metadata) {
    console.log('onSendImage::::: ', metadata);
    this.sendMessage('', TYPE_MSG_IMAGE, metadata);
    this.doScroll();
  }

  onOpenCloseInfoConversation(){
    this.openInfoConversation = !this.openInfoConversation;
    this.onInfoConversation();
  }

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
    this.events.publish('onUidSelected', this.openInfoConversation, this.conversationWith, this.channel_type, attributes);
    this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
  }


}


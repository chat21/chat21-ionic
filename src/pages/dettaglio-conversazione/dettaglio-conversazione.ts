import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PopoverController, Platform, ActionSheetController, IonicPage, NavParams, Content, Events, NavController } from 'ionic-angular';
// models
import { UserModel } from '../../models/user';
import { MessageModel } from '../../models/message';
import { UploadModel } from '../../models/upload';
import { GroupModel } from '../../models/group';

// providers services 
import { UserService } from '../../providers/user/user';
import { NavProxyService } from '../../providers/nav-proxy';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';
import { ChatManager } from '../../providers/chat-manager/chat-manager';
import { UploadService } from '../../providers/upload-service/upload-service';
import { ChatConversationHandler } from '../../providers/chat-conversation-handler';
import { AppConfigProvider } from '../../providers/app-config/app-config';
import { DatabaseProvider } from '../../providers/database/database';
import { CannedResponsesServiceProvider } from '../../providers/canned-responses-service/canned-responses-service';
import { GroupService } from '../../providers/group/group';
// pages
import { _DetailPage } from '../_DetailPage';
import { ProfilePage } from '../profile/profile';
import { InfoUserPage } from '../info-user/info-user';
// import { InfoMessagePage } from '../info-message/info-message';
import { PopoverPage } from '../popover/popover';
// utils
import { TYPE_SUPPORT_GROUP, TYPE_POPUP_DETAIL_MESSAGE, TYPE_DIRECT, MAX_WIDTH_IMAGES, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, MIN_HEIGHT_TEXTAREA, MSG_STATUS_SENDING, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, TYPE_GROUP, URL_NO_IMAGE, LABEL_NOICON } from '../../utils/constants';
import { compareValues, htmlEntities, isURL, isInArray, replaceBr, isPopupUrl, popupUrl, strip_tags, getSizeImg, urlify, convertMessageAndUrlify, getFormatData } from '../../utils/utils';

import { TranslateService } from '@ngx-translate/core';
import { Subscription } from '../../../node_modules/rxjs/Subscription';
import { ConversationModel } from '../../models/conversation';
import { timer } from 'rxjs';




@IonicPage()
@Component({
  selector: 'page-dettaglio-conversazione',
  templateUrl: 'dettaglio-conversazione.html',
})
export class DettaglioConversazionePage extends _DetailPage {
  @ViewChild(Content) content: Content;
  @ViewChild('messageTextArea') messageTextArea: ElementRef;
  @ViewChild('scrollMe') private scrollMe: ElementRef;

  showButtonToBottom = false;
  contentScroll: any;
  NUM_BADGES = 0;

  private subscriptions: Array<string>;
  private tenant: string;
  private conversationHandler: ChatConversationHandler;

  private scrollDirection: any = 'bottom';
  private messages: Array<MessageModel> = [];
  private arrayLocalImmages: Array<any> = [];
  private projectId: string;
  public messageSelected: any;

  //aggiunta 
  private conversationSelected: ConversationModel;
  private groupDetailAttributes: any;
  

  private currentUserDetail: UserModel;
  private memberSelected: UserModel;

  private conversationWith: string;
  private conversationWithFullname: string;

  private uidConversationWith: string;
  private fullnameConversationWith: string;
  private conversationType: string;

  private channel_type: string;
  private online: boolean;
  private lastConnectionDate: string;
  private messageString: string;
  private style_message_welcome: boolean;

  private selectedFiles: FileList;
  private isFileSelected: boolean;
  private openInfoConversation = false;
  private openInfoUser = false;                 /** check is open info conversation */
  private openInfoMessage: boolean;                         /** check is open info message */
  private conversationEnabled: boolean = true;
  private isMobile: boolean = true;

  private advancedAttributes: any = [];
  private openInfoAdvanced: boolean = false;


  private tagsCanned: any = [];
  private tagsCannedFilter: any = [];

  public TYPE_GROUP = TYPE_GROUP;
  public TYPE_DIRECT = TYPE_DIRECT;
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
    private upSvc: UploadService,
    private translateService: TranslateService,
    public appConfig: AppConfigProvider, 
    private databaseProvider: DatabaseProvider,
    public cannedResponsesServiceProvider: CannedResponsesServiceProvider,
    public groupService: GroupService
  ) {
    super();
    console.log('**** constructor DettaglioConversazionePage *****');
    this.tagsCanned = [];
    this.subscriptions = [];
    // passo oggetto conversazione
    this.conversationSelected = navParams.get('conversationSelected');

    //// recupero id utente e fullname con cui si conversa
    //// uid utente con cui si conversa
    this.conversationWith = navParams.get('conversationWith');
    //// nome utente con cui si conversa
    this.conversationWithFullname = navParams.get('conversationWithFullname');
    //// tipo di canale della chat: direct/group
    this.channel_type = navParams.get('channel_type');
    (!this.channel_type || this.channel_type == 'undefined') ? this.channel_type = TYPE_DIRECT : this.channel_type;
    this.messages = []; // list messages of conversation
    this.isFileSelected = false; // indica se è stato selezionato un file (image da uplodare)
    this.openInfoMessage = false; // indica se è aperto il box info message
    //// init variables

    //this.initSubscriptions();
    // DESTROY INFO CONVERSATION 
    console.log('1 - DESTROY INFO CONVERSATION', this.events);
    this.events.publish('closeDetailConversation', true);
    // console.log(">>>>>>>>>>>> ", this.navProxy.onSplitPaneChanged);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerWidth = event.target.innerWidth;
    console.log("newInnerWidth ", newInnerWidth);
    if (newInnerWidth < 768) {
      console.log("sparisci!!!!!", newInnerWidth)
      this.openInfoMessage = false;
      this.openInfoConversation = false;
    }
  }

  //// SUBSCRIBTIONS ////
  /** 
   * subscriptions list 
  */
  initSubscriptions() {
    console.log('initSubscriptions');
    // subscribe elenco messaggi
    let key = 'doScroll';
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key);
      this.events.subscribe(key, this.goToBottom);
    }
    // subscribe dettaglio messaggio
    key = 'openInfoMessage';
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key);
      this.events.subscribe(key, this.onOpenInfoMessage);
    }
    // subscribe message videochat
    key = 'openVideoChat';
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key);
      this.events.subscribe('openVideoChat', this.onOpenVideoChat);
    }
  }



  /** 
   * init group details subscription
   */
  loadGroupDetail() {
    console.log('-------------------------->  Dettaglio conersazione ::loadGroupDetail');
    const keySubscription = 'conversationGroupDetails';
    if (!isInArray(keySubscription, this.subscriptions)) {
      console.log(' subscribe ::groupDetails');
      this.events.subscribe(keySubscription, this.returnLoadGroupDetail);
      // carico il gruppo in info dettaglio
      //this.groupService.conversationLoadGroupDetail(this.currentUserDetail.uid, this.conversationWith, keySubscription);
    }
  }

  /**
   * information detail group called of groupService.loadGroupDetail
   */
  returnLoadGroupDetail = (snapshot) => {
    console.log('<<<<<<<<<<< returnLoadGroupDetail >>>>>>>>>>>>>>>>>>', snapshot.val());
    if (snapshot.val()) {
      console.log('Dettaglio conersazione ::subscribeGroupDetails', snapshot.val());
      const groupDetails = snapshot.val();
      this.groupDetailAttributes = groupDetails.attributes;
    }
  }


  /**
   * individuo nella conversazione id e nome dell'utente con il quale sto conversando
   * se il tipo di chat è DIRECT o SUPPORT GROUP: id = recipient/sender e fullname = recipient_fullname/sender_fullname
   * altrimenti se è un semplice GRUPPO: id = recipient e fullname = recipient_fullname
   */
  setConversationWith() {
    console.log('DETTAGLIO CONV - conversationSelected »»»»»»» : ', this.conversationSelected);
    this.loadGroupDetail();
    this.loadTagsCanned();
    if (this.conversationSelected) {
      // GROUP CONVERSATION 
      this.conversationType = TYPE_GROUP;
      let uidConversationWith = this.conversationSelected.recipient;
      let fullnameConversationWith = this.conversationSelected.recipient_fullname;
      // DIRECT CONVERSATION
      if (this.conversationSelected.channel_type === TYPE_DIRECT) {
        this.conversationType = TYPE_DIRECT;
        if (this.conversationSelected.recipient === this.currentUserDetail.uid) {
          uidConversationWith = this.conversationSelected.sender;
          fullnameConversationWith = this.conversationSelected.sender_fullname;
        } else {
          uidConversationWith = this.conversationSelected.recipient;
          fullnameConversationWith = this.conversationSelected.recipient_fullname;
        }
      }
      // SUPPORT GROUP CONVERSATION 
      else if (this.conversationSelected.channel_type === TYPE_GROUP && this.conversationSelected.recipient.startsWith(TYPE_SUPPORT_GROUP)) {
        this.conversationType = TYPE_SUPPORT_GROUP;
        console.log('DETTAGLIO CONV - SUPPORT GROUP CONVERSATION ------------>', this.conversationType)
        console.log('DETTAGLIO CONV - this.conversationSelected ------------>', this.conversationSelected)
        console.log('DETTAGLIO CONV - this.conversationSelected.attributes ------------>', this.conversationSelected.attributes)
        console.log('DETTAGLIO CONV - this.conversationSelected.attributes.requester_id ------------>', this.conversationSelected.attributes.requester_id)
        if (this.conversationSelected.attributes && this.conversationSelected.attributes.requester_id) {
          uidConversationWith = this.conversationSelected.attributes.requester_id;
          console.log('DETTAGLIO CONV - RECUPERO requester_id ------------>', uidConversationWith)
        }
        if (this.conversationSelected.senderAuthInfo && this.conversationSelected.senderAuthInfo.authVar && this.conversationSelected.senderAuthInfo.authVar.uid) {
          // uidConversationWith = this.conversationSelected.senderAuthInfo.authVar.uid;
          fullnameConversationWith = this.conversationSelected.recipient_fullname;
        }
      }
      this.uidConversationWith = uidConversationWith;
      this.fullnameConversationWith = fullnameConversationWith
      console.log('IMPOSTO this.uidConversationWith ------------>', this.uidConversationWith)
    }

    if (this.uidConversationWith) {
      console.log('SOTTOSCRIZIONE:  ', this.conversationType, this.uidConversationWith);

      if (this.conversationType != TYPE_GROUP) {
        console.log('MI SOTTOSCRIVO SE E DIVERSO DA  ', TYPE_GROUP);
        // subscribe data ultima connessione utente con cui si conversa
        let key = 'lastConnectionDate-' + this.uidConversationWith;
        if (!isInArray(key, this.subscriptions)) {
          this.subscriptions.push(key);
          this.events.subscribe(key, this.updateLastConnectionDate);
        }
        // subscribe status utente con il quale si conversa (online/offline)
        key = 'statusUser:online-' + this.uidConversationWith;
        if (!isInArray(key, this.subscriptions)) {
          this.subscriptions.push(key);
          this.events.subscribe(key, this.statusUserOnline);
        }
      }
    }



   
  }

  /**
    *
    */
  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
    console.log('onScroll');
    if (this.scrollMe) {
      const divScrollMe = this.scrollMe.nativeElement;
      const checkContentScrollPosition = this.isContentScrollEnd(divScrollMe);
      if (checkContentScrollPosition) {
        this.showButtonToBottom = false;
        this.NUM_BADGES = 0;
      } else {
        this.showButtonToBottom = true;
        // this.scrollToBottom();
      }
    }
  }

  private isContentScrollEnd(divScrollMe): boolean {
    console.log('isContentScrollEnd');
    if (divScrollMe.scrollTop === (divScrollMe.scrollHeight - divScrollMe.offsetHeight)) {
      return true;
    } else {
      return false;
    }
  }

  //// CALLBACK SUBSCRIBTIONS ////
  onConversationEnabled: any = (status) => {
    console.log('onConversationEnabled');
    this.conversationEnabled = status;
  }

  onOpenVideoChat: any = (message) => {
    console.log('onOpenVideoChat');
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
    console.log('onOpenInfoMessage');
    this.openInfoMessage = true;
    this.openInfoConversation = false;
    this.messageSelected = message;
    //console.log('OPEN MESSAGE **************', message);
  }

  /**
   * on subscribe stato utente con cui si conversa ONLINE
   */
  statusUserOnline: any = (uid: string, status: boolean) => {
    console.log('************** statusUserOnline', uid, this.conversationWith, status);
    // if(uid !== this.conversationWith){return;}
    if (status === true) {
      console.log('************** ONLINE');
      this.online = true;
    } else {
      console.log('************** OFFLINE');
      this.online = false;
    }
    //this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
  }
  // /**
  //  * on subscribe stato utente con cui si conversa OFFLINE
  //  */
  // statusUserOffline: any = (uid) => {
  //   if(uid !== this.conversationWith){return;}
  //   this.online = false;
  //   this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
  //   console.log('************** OFFLINE');
  // }

  /**
   * on subscribe data ultima connessione utente con cui si conversa
   */
  updateLastConnectionDate: any = (uid: string, lastConnectionDate: string) => {
    this.lastConnectionDate = lastConnectionDate;
    // this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
    console.log('************** updateLastConnectionDate', this.lastConnectionDate);
  }

  /**
   * on subcribe doScroll add message
   */
  goToBottom: any = (data) => {
    this.doScroll();
    console.log('*********** goToBottom');
  }


  //// UNSUBSCRIPTIONS ////
  /**
   * unsubscribe all subscribe events
   */
  unsubescribeAll() {
    console.log('unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach(subscription => {
      console.log('unsubescribeAll: ', subscription);
      this.events.unsubscribe(subscription, null);
    });
    this.subscriptions = [];
    // this.events.unsubscribe('statusUser:online-'+this.conversationWith, null);
    // this.events.unsubscribe('lastConnectionDate-'+this.conversationWith, null);
    // this.events.unsubscribe('conversationEnabled', null);
  }

  //// SYSTEM FUNCTIONS ////
  ngOnInit() {
    console.log('------------> ngOnInit');

  }

  ionViewWillEnter() {
    console.log('------------> ionViewWillEnter');
    this.initSubscriptions();
    this.initialize();
  }
  /**
   * quando ho renderizzato la pagina richiamo il metodo di inizialize
   */

  ionViewDidEnter() {
    console.log('------------> ionViewDidEnter');
    // this.initialize();
  }

  /**
   * quando esco dalla pagina distruggo i subscribe
   * e chiudo la finestra di info
   */
  ionViewWillLeave() {
    console.log('------------> ionViewWillLeave');
    this.openInfoMessage = false;
    this.openInfoConversation = false;
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
  initialize() {
    console.log('----------> initialize DettaglioConversazionePage', this.chatManager.handlers);
    (!this.channel_type || this.channel_type == 'undefined') ? this.channel_type = TYPE_DIRECT : this.channel_type;
    this.messages = []; // list messages of conversation
    const innerWidth = window.innerWidth;
    console.log('const innerWidth = ', innerWidth);
    if (innerWidth < 768) {
      console.log("sparisci!!!!!")
      this.openInfoMessage = false;
      this.openInfoConversation = false;
    }
    else {
      //this.openInfoConversation = this.chatManager.getOpenInfoConversation();
    }

    this.online = false;
    this.lastConnectionDate = '';
    this.tenant = this.chatManager.getTenant();

    
    this.currentUserDetail = this.chatManager.getLoggedUser();


    this.setConversationWith();
    console.log('conversationSelected: ', this.uidConversationWith);
    this.chatPresenceHandler.userIsOnline(this.uidConversationWith);
    this.chatPresenceHandler.lastOnlineForUser(this.uidConversationWith);
    this.initConversationHandler();

    var that = this;
    // NUOVO MESSAGGIO!!
    this.conversationHandler.obsAdded
      .subscribe(newMessage => {
        if (that.scrollMe) {
          const divScrollMe = that.scrollMe.nativeElement;
          const checkContentScrollPosition = that.isContentScrollEnd(divScrollMe);
          if (checkContentScrollPosition) {
            setTimeout(function () {
              that.scrollBottom();
            }, 100);
          } else {
            that.NUM_BADGES++;
          }
        }
      });
    this.isFileSelected = false; // indica se è stato selezionato un file (image da uplodare)
    this.openInfoMessage = false; // indica se è aperto il box info message
    this.openInfoConversation = true;
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
    // CHIEDE ChatConversationHandler  AL CHATMANAGER
    let handler: ChatConversationHandler = this.chatManager.getConversationHandlerByConversationId(this.conversationWith);
    console.log('DETTAGLIO CONV - initConversationHandler **************', this.chatManager, handler, this.conversationWith);
    // SE NN C'è LO CREA CON IL conversationWith -> LO CONNETTE -> LO MEMORIZZA NEL CHATMANAGER
    if (!handler) {
      console.log('DETTAGLIO CONV - ENTRO ***', this.conversationHandler);
      //const handler = 
      console.log('DETTAGLIO CONV - CONVERSATION WITH ', this.conversationWith, ' CONVERSATION F-NAME ', this.conversationWithFullname, ' CONVERSATION C U DETAILS ', this.currentUserDetail);
      this.conversationHandler = new ChatConversationHandler(this.events, this.translateService);
      this.conversationHandler.initWithRecipient(this.conversationWith, this.conversationWithFullname, this.currentUserDetail, this.tenant);

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
        console.log('DETTAGLIO CONV - MESSAGES ***', this.messages);
        this.doScroll();
      }
    }
    else {
      console.log('NON ENTRO ***', this.conversationHandler, handler);
      //handler.connect();
      //[self subscribe:handler];
      this.conversationHandler = handler;
      this.messages = this.conversationHandler.messages;
      this.doScroll();
    }
    // attendo un secondo e poi visualizzo il messaggio se nn ci sono messaggi
    setTimeout(function () {
      //console.log('setTimeout *** 111',that.messages);
      if (!that.messages || that.messages.length == 0) {
        that.style_message_welcome = true;
        console.log('setTimeout *** 111', that.style_message_welcome);
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
  updateMessageList(messages) {
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
    console.log('scrollBottom');
    var scrollDiv = document.getElementById("scroll-me");
    if (scrollDiv) {
      scrollDiv.scrollTop = scrollDiv.scrollHeight;
    }
  }
  /**
   * Scroll to top of the page after a short delay.
   */
  scrollTop() {
    console.log('scrollTop');
    let that = this;
    setTimeout(function () {
      that.content.scrollToTop();
    }, 1);
  }

  /**
   * Scroll depending on the direction.
   */
  doScroll() {
    console.log('doScroll');
    if (this.scrollDirection == 'bottom') {
      this.scrollBottom();
    } else if (this.scrollDirection == 'top') {
      this.scrollTop();
    }
  }
  //// END Scroll managemant functions ////


  // //// START FUNZIONI RICHIAMATE DA HTML ////
  // /** 
  //  * chiude il box di dx del info messaggio
  // */
  // onCloseInfoPage(){
  //   if(this.openInfoMessage){
  //     this.openInfoMessage = false;
  //   } else {
  //     this.onOpenCloseInfoConversation();
  //   }
  // }

  returnCloseInfoMessage() {
    console.log('returnCloseInfoMessage');
    this.openInfoMessage = false;
  }
  returnCloseInfoConversation() {
    console.log('returnCloseInfoConversation');
    this.openInfoConversation = false;
  }
  returnOpenInfoUser(member) {
    this.memberSelected = member;
    this.openInfoUser = true;
    console.log('returnOpenInfoUser **************', this.openInfoUser);
  }
  returnCloseInfoUser() {
    this.openInfoUser = false;
    console.log('returnCloseInfoUser **************', this.openInfoUser);
  }

  returnOpenInfoAdvanced(advanced) {
    console.log('returnOpenInfoAdvanced **************', advanced);
    this.advancedAttributes = advanced;
    this.openInfoAdvanced = true;
  }
  returnCloseInfoAdvanced() {
    this.openInfoAdvanced = false;
    this.advancedAttributes = [];
    console.log('returnCloseInfoAdvanced **************', this.openInfoAdvanced);
  }



  /** 
   * 
  */
  onOpenCloseInfoConversation() {
    this.openInfoMessage = false;
    this.openInfoConversation = !this.openInfoConversation;
    console.log('onOpenCloseInfoConversation **************', this.openInfoConversation);
  }

  /** */
  onInfoConversation() {
    // ordino array x tempo decrescente
    // cerco messaggi non miei
    // prendo il primo
    console.log('onInfoConversation');
    let msgRicevuti: any;
    let attributes: any[] = [];
    try {
      msgRicevuti = this.messages.find(item => item.sender !== this.currentUserDetail.uid);
      if (msgRicevuti) {
        attributes = msgRicevuti.attributes;
      }
      console.log('msgRicevuti::::: ', msgRicevuti);
    } catch (err) {
      console.log("DettaglioConversazionePage::onInfoConversation:error:", err)
    }
    //const msgRicevuti = this.messages.find(item => item.sender !== this.currentUserDetail.uid);
    //console.log('onUidSelected::::: ', this.conversationWith,  this.openInfoConversation);
    //this.events.publish('onOpenInfoConversation', this.openInfoConversation, this.conversationWith, this.channel_type, attributes);
    //this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
  }

  /**
   * Check if the user is the sender of the message.
   * @param message 
   */
  isSender(message) {
    //console.log('isSender');
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
    if (msg && msg.trim() != '' || type !== TYPE_MSG_TEXT) {
      //const textMsg = replaceBr(msg);
      this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style.height = MIN_HEIGHT_TEXTAREA + "px";
      this.conversationHandler.sendMessage(msg, type, metadata, this.conversationWith, this.conversationWithFullname, this.channel_type);
      this.chatManager.conversationsHandler.uidConvSelected = this.conversationWith;
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
  controlOfMessage(messageString) {
    console.log('controlOfMessage **************');
    messageString = messageString.replace(/(\r\n|\n|\r)/gm, "");
    if (messageString.trim() != '') {
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
  pressedOnKeyboard(event, messageString) {
    console.log('pressedOnKeyboard ************** event:: ', event);  
    if (event.inputType == "insertLineBreak" && event.data == null) {
      this.messageString = "";
      return
    }
    else {
      this.controlOfMessage(messageString);
    }
  }
  /**
   * metodo chiamato dall'html quando premo sul nome utente nell'header della pagina
   * apro la pg di dettaglio user
   * @param uidReciver 
   */
  goToUserDetail(uidReciver: string) {
    console.log('goToUserDetail::: ', this.navProxy.isOn, uidReciver);
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
  showButtonInfo() {
    //console.log('showButtonInfo');
  }
  /**
   * 
   * @param msg 
   */
  showDetailMessage(msg) {
    console.log('showDetailMessage', msg);
    //this.presentPopover(msg);
  }
  /**
  * apro il menu delle opzioni 
  * (metodo richiamato da html) 
  * alla chiusura controllo su quale opzione ho premuto e attivo l'azione corrispondete
  */
  presentPopover(event, msg) {
    console.log('presentPopover');
    let popover = this.popoverCtrl.create(PopoverPage, { typePopup: TYPE_POPUP_DETAIL_MESSAGE, message: msg });
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
        if (this.chatManager.getLoggedUser()) {
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
    console.log('detectFiles');
    if (event && event.target && event.target.files) {
      this.selectedFiles = event.target.files;
      this.fileChange(event);
      console.log('event: ', event.target.files);
    }
  }

  fileChange(event) {
    console.log('fileChange');
    const that = this;
    if (event.target.files && event.target.files[0]) {
      const nameImg = event.target.files[0].name;
      const typeFile = event.target.files[0].type;
      // const preview = document.querySelector('img');
      // const file    = document.querySelector('input[type=file]').files[0];
      const reader = new FileReader();
      reader.addEventListener('load', function () {
        that.isFileSelected = true;

        if (typeFile.indexOf('image') !== -1) {
          const file4Load = new Image;
          // if (typeof reader.result == 'string' || reader.result instanceof String) {}
          file4Load.src = reader.result.toString();
          file4Load.title = nameImg;
          file4Load.onload = function () {
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
        } else if (typeFile.indexOf('application') !== -1) {
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
    if (type_msg === 'image') {
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
      '', // channel_type
      true
    );

    // if(type_msg == 'file'){
    //   message.text = metadata.src;
    // }


    //this.messages.push(message);
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
    let uploadTask = this.upSvc.pushUploadMessage(currentUpload)

    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on('state_changed', function (snapshot) {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    }, function (error) {
      // Handle unsuccessful uploads
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('error: ', errorCode, errorMessage);
    }, function () {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
        console.log('File available at', downloadURL);

        metadata.src = downloadURL;
        let type_message = TYPE_MSG_TEXT;
        let message = 'File: ' + metadata.src;
        if (metadata.type.startsWith('image')) {
          type_message = TYPE_MSG_IMAGE;
          message = 'Image: ' + metadata.src;
        }
        that.sendMessage(message, type_message, metadata);
      });
    });


    // .then(function(snapshot) {
    //   console.log('1 Uploaded a blob or file! ', snapshot);
    //   // metadata.src = snapshot.downloadURL;
    //   // that.sendMessage('', type_msg, metadata);
    //   metadata.src = snapshot.downloadURL;
    //   let type_message = TYPE_MSG_TEXT;
    //   let message = 'File: ' + metadata.src;
    //   if (metadata.type.startsWith('image')) {
    //       type_message = TYPE_MSG_IMAGE;
    //       message = 'Image: ' + metadata.src;
    //   }
    //   that.sendMessage(message, type_message, metadata);
    // })
    // .catch(function(error) {
    //   // Handle Errors here.
    //   const errorCode = error.code;
    //   const errorMessage = error.message;
    //   console.log('error: ', errorCode, errorMessage);
    // });
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

  public isImage(message: any) {
    if (message && message.type && message.metadata && message.metadata.src && message.type === 'image') {
      return true;
    }
    return false;
  }

  public isFile(message: any) {
    if (message && message.type && message.metadata && message.metadata.src && message.type === 'file') {
      return false;
    }
    return false;
  }

  /**
   * messageChange
   * 
   * @param event 
   */
  public messageChange(event) { 
    const that = this;
    console.log("event:::",event);
    try {
      if (event) {
        console.log("event.value:: ", event);
        setTimeout(function () {
          var str = event.value;
          var pos = str.lastIndexOf("/");
          console.log("str:: ", str);
          console.log("pos:: ", pos);
          if(pos >= 0 && that.tagsCanned.length > 0) {
            var strSearch = str.substr(pos+1);
            that.showTagsCanned(strSearch);
            //that.loadTagsCanned(strSearch);
          } else {
            that.tagsCannedFilter = [];
          }
        }, 300);
        that.resizeTextArea();
      }
    } catch (err) {
      console.log("error: ", err)
    }    
  }
  

  resizeTextArea(){
    const that = this;
    setTimeout(function () {
      try {
        var text_area = that.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0];
        if(text_area.value.length <= 0){
          text_area.style.height = 'auto';
        } else {
          text_area.style.height = text_area.scrollHeight + 'px';
          console.log("text_area.scrollHeight ",text_area.scrollHeight);
        }
        //var footerHeight = that.messageTextArea['_elementRef'].nativeElement.offsetHeight+28;
        //var footerHeight = text_area.offsetHeight;
        console.log("text_area.nativeElement ",text_area.offsetHeight);
        
        var footerMessage = document.getElementById("footerMessage");
        var footerHeight = footerMessage.offsetHeight;
        console.log("footerMessage.height ", footerHeight);
        
        console.log('msgRicevuti::::: ', footerHeight);
        var scrollDiv = document.getElementById("scroll-me");
        if (scrollDiv) {
          scrollDiv.parentElement.style.marginBottom = footerHeight+"px";
        }
      } catch (err) {
        console.log("error: ", err)
      }    
    }, 0);
  }


  loadTagsCanned(){
    // recupero tagsCanned dalla memoria 
    const that = this;
    console.log('projectId--->XXXX--->> ', this.conversationSelected.attributes.projectId);//attributes.projectId);
    var projectId = this.conversationSelected.attributes.projectId;
    var SERVER_BASE_URL = this.appConfig.getConfig().SERVER_BASE_URL;
    console.log('SERVER_BASE_URL---> ', SERVER_BASE_URL);//attributes.projectId);
    // this.contactsService.getLeads(this.queryString, this.pageNo).subscribe((leads_object: any) => {
    console.log('this.tagsCanned.length---> ', this.tagsCanned.length);//attributes.projectId);
    //if(this.tagsCanned.length <= 0 ){
      this.cannedResponsesServiceProvider.getCannedResponses(SERVER_BASE_URL, projectId)
      .toPromise()
      .then(data => {
        console.log('----------------------------------> getCannedResponses:');
        console.log(data);
        that.tagsCanned = data;
        //that.showTagsCanned(strSearch);
      }).catch(err => {
        console.log('error', err);
      });
    // } else {
    //   that.showTagsCanned(strSearch);
    // }
  }

  /** */
  showTagsCanned(strSearch){
    const that = this;
      that.tagsCannedFilter = [];
      var tagsCannedClone = JSON.parse(JSON.stringify(that.tagsCanned));
      //console.log("that.contacts lenght:: ", strSearch);
      that.tagsCannedFilter = that.filterItems(tagsCannedClone, strSearch);
      that.tagsCannedFilter.sort(compareValues('title', 'asc'));
      var strReplace = strSearch;
      if(strSearch.length > 0){
        strReplace = "<b>"+strSearch+"</b>";
      }
      for(var i=0; i < that.tagsCannedFilter.length; i++) {
        const textCanned = "<div class='cannedText'>"+that.replacePlaceholderInCanned(that.tagsCannedFilter[i].text)+"</div>";
        that.tagsCannedFilter[i].title = "<div class='cannedContent'><div class='cannedTitle'>"+that.tagsCannedFilter[i].title.toString().replace(strSearch,strReplace.trim())+"</div>"+textCanned+'</div>';
      }
      
  }



  /**
   * filtro array contatti per parola passata 
   * filtro sul campo fullname
   * @param items 
   * @param searchTerm 
   */
  filterItems(items,searchTerm){
    //console.log("filterItems::: ",searchTerm);
    return items.filter((item) => {
      //console.log("filterItems::: ", item.title.toString().toLowerCase());
      return item.title.toString().toLowerCase().indexOf(searchTerm.toString().toLowerCase()) > -1;
    });     
  }

  /**
   * 
   */
  replaceTagInMessage(canned){
    const that = this;
    this.tagsCannedFilter = [];
    console.log("canned::: ",canned.text);
    // // prendo val input
    var text_area = this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0];
    console.log("messageTextArea::: ",text_area.value);
    
    // replace text
    var pos = text_area.value.lastIndexOf("/");
    var strSearch = text_area.value.substr(pos);
    var strTEMP = text_area.value.replace(strSearch,canned.text);
    console.log("strSearch::: ",strSearch);
    console.log("this.conversationSelected.attributes:::::: ",this.conversationSelected.attributes);
    strTEMP = this.replacePlaceholderInCanned(strTEMP);
    console.log("strSearch::: ",strSearch);
    text_area.value = '';
    that.messageString = strTEMP;
    //text_area.value = strTEMP;
    setTimeout(() => {
      text_area.focus();
      that.resizeTextArea();
    },200);
  }

  replacePlaceholderInCanned(str){
    if (this.groupDetailAttributes && this.groupDetailAttributes.userEmail) {
      str = str.replace('$email',this.groupDetailAttributes.userEmail);
    }
    if (this.groupDetailAttributes && this.groupDetailAttributes.website) {
      str = str.replace('$website',this.groupDetailAttributes.website);
    }
    if (this.groupDetailAttributes && this.groupDetailAttributes.userFullname) {
      str = str.replace('$recipient_name',this.groupDetailAttributes.userFullname);
    }
    if (this.currentUserDetail && this.currentUserDetail.fullname) {
      str = str.replace('$agent_name',this.currentUserDetail.fullname);
    }
    return str;
  }


  
  insertAtCursor(myField, myValue) {
    console.log('CANNED-RES-CREATE.COMP - insertAtCursor - myValue ', myValue );
     
    // if (this.addWhiteSpaceBefore === true) {
    //   myValue = ' ' + myValue;
    //   console.log('CANNED-RES-CREATE.COMP - GET TEXT AREA - QUI ENTRO myValue ', myValue );
    // }
   
    //IE support
    if (myField.selection) {
      myField.focus();
      let sel = myField.selection.createRange();
      sel.text = myValue;
      // this.cannedResponseMessage = sel.text;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart;
      console.log('CANNED-RES-CREATE.COMP - insertAtCursor - startPos ', startPos);
      
      var endPos = myField.selectionEnd;
      console.log('CANNED-RES-CREATE.COMP - insertAtCursor - endPos ', endPos);
      
      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
  
      // place cursor at end of text in text input element
      //myField.focus();
      var val = myField.value; //store the value of the element
      myField.value = ''; //clear the value of the element
      myField.value = val + ' '; //set that value back. 
  
      //this.cannedResponseMessage = myField.value;
      //this.texareaIsEmpty = false;
      /// myField.select();
    } else {
      myField.value += myValue;
      //this.cannedResponseMessage = myField.value;
    }
  }
  

}


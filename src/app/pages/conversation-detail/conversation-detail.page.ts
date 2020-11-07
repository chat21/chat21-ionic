import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer} from '@angular/platform-browser';

import { 
  ModalController, 
  PopoverController, 
  Platform, ActionSheetController, NavController, IonContent, IonTextarea } from '@ionic/angular';


// translate
import { TranslateService } from '@ngx-translate/core';

// models
import { UserModel } from '../../models/user';
import { MessageModel } from '../../models/message';
import { ConversationModel } from '../../models/conversation';

// services
import { AuthService } from '../../services/auth.service';
import { ChatManager } from '../../services/chat-manager';
import { AppConfigProvider } from '../../services/app-config';
import { DatabaseProvider } from '../../services/database';
import { CustomTranslateService } from 'src/app/services/custom-translate.service';
import { TypingService } from 'src/app/services/typing.service';

// import { ChatConversationsHandler } from '../../services/chat-conversations-handler';
import { ConversationsHandlerService } from 'src/app/services/conversations-handler.service';
import { ConversationHandlerService } from 'src/app/services/conversation-handler.service';
import { CurrentUserService } from 'src/app/services/current-user/current-user.service';
import { ContactsService } from 'src/app/services/contacts/contacts.service';

// import { CannedResponsesServiceProvider } from '../../services/canned-responses-service';
// import { GroupService } from '../../services/group';

// pages
// import { _DetailPage } from '../_DetailPage';
// import { ProfilePage } from '../profile/profile';
// import { PopoverPage } from '../popover/popover';

// utils
import {
  SYSTEM,
  TYPE_SUPPORT_GROUP,
  TYPE_POPUP_DETAIL_MESSAGE,
  TYPE_DIRECT, MAX_WIDTH_IMAGES,
  TYPE_MSG_TEXT, TYPE_MSG_IMAGE,
  MIN_HEIGHT_TEXTAREA,
  MSG_STATUS_SENDING,
  MSG_STATUS_SENT,
  MSG_STATUS_RETURN_RECEIPT,
  TYPE_GROUP,
  MESSAGE_TYPE_INFO,
  MESSAGE_TYPE_MINE,
  MESSAGE_TYPE_OTHERS,
  MESSAGE_TYPE_DATE
} from '../../utils/constants';

import {
  isInArray,
  isPopupUrl,
  popupUrl,
  stripTags,
  urlify,
  convertMessageAndUrlify,
  checkPlatformIsMobile,
  closeModal,
  setConversationAvatar,
  setChannelType
} from '../../utils/utils';

import {
  getColorBck,
  avatarPlaceholder,
  getImageUrlThumbFromFirebasestorage,
} from '../../utils/utils-user';

import {
  isFirstMessage,
  isImage,
  isFile,
  isInfo,
  isMine,
  messageType
} from '../../utils/utils-message';

// import { EventsService } from '../../services/events-service';
// import { initializeApp } from 'firebase';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-conversation-detail',
  templateUrl: './conversation-detail.page.html',
  styleUrls: ['./conversation-detail.page.scss'],
})



export class ConversationDetailPage implements OnInit, OnDestroy {
  @ViewChild('ionContentChatArea', {static: false}) ionContentChatArea: IonContent;
  @ViewChild('rowMessageTextArea', {static: false}) rowTextArea: ElementRef;

  showButtonToBottom = false; // indica lo stato del pulsante per scrollare la chat (showed/hidden)
  NUM_BADGES = 0; // numero di messaggi non letti
  COLOR_GREEN = '#24d066'; // colore presence active da spostare nelle costanti
  COLOR_RED = '#db4437'; // colore presence none da spostare nelle costanti

  private subscriptions: Array<Subscription>;
  private tenant: string;
  public loggedUser: UserModel;
  public conversationWith: string;
  public conversationWithFullname: string;
  public messages: Array<MessageModel> = [];
  public messageSelected: any;
  public channelType: string;
  public online: boolean;
  public lastConnectionDate: string;
  public showMessageWelcome: boolean;
  public openInfoConversation = false;
  public openInfoMessage: boolean;              /** check is open info message */
  public isMobile = false;
  public isTypings = false;
  public nameUserTypingNow: string;

  public heightMessageTextArea = '';
  public translationMap: Map<string, string>;
  public conversationAvatar: any;
  public membersConversation: any;
  public member: UserModel;
  public urlConversationSupportGroup: any;
  private tagsCanned: any = [];
  private isFileSelected: boolean;

  // private arrayLocalImmages: Array<any> = [];
  // private projectId: string;
  // private groupDetailAttributes: any;
  // private memberSelected: UserModel;
  // private fullnameConversationWith: string;
  // private conversationType: string;
  // private messageString: string;
  // private selectedFiles: FileList;
  // private conversationEnabled = true;
  // private advancedAttributes: any = [];
  // private openInfoAdvanced = false;
  // private openInfoUser = false;                 /** check is open info conversation */
  // private setTimeoutWritingMessages;
  // private conversationMembers: any = [];




  MESSAGE_TYPE_INFO = MESSAGE_TYPE_INFO;
  MESSAGE_TYPE_MINE = MESSAGE_TYPE_MINE;
  MESSAGE_TYPE_OTHERS = MESSAGE_TYPE_OTHERS;

  // functions utils
  isMine = isMine;
  isInfo = isInfo;
  isFirstMessage = isFirstMessage;
  messageType = messageType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private el: ElementRef,
    // public popoverCtrl: PopoverController,
    // public navCtrl: NavController,
    // public userService: UserService,
    // public events: EventsService,
    public chatManager: ChatManager,
    public actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    // private upSvc: UploadService,
    private translateService: TranslateService,
    private customTranslateService: CustomTranslateService,
    public appConfigProvider: AppConfigProvider,
    private databaseProvider: DatabaseProvider,
    private keyboard: Keyboard,
    public modalController: ModalController,
    public typingService: TypingService,
    private sanitizer: DomSanitizer,
    public authService: AuthService,
    // public chatConversationsHandler: ChatConversationsHandler,
    public conversationsHandlerService: ConversationsHandlerService,
    public conversationHandlerService: ConversationHandlerService,
    public currentUserService: CurrentUserService,
    // public cannedResponsesServiceProvider: CannedResponsesServiceProvider,
    // public groupService: GroupService
    public contactsService: ContactsService
  ) {
    console.log('CONVERSATION DETAIL COSTRACTOR', this.loggedUser);
    this.loggedUser = this.authService.getUser();
    this.tenant = environment.tenant;
    this.translations();
    // get params from url (conversationWith, conversationWithFullname)
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    console.log('this.conversationWith: ', this.conversationWith);
    // this.channelType = setChannelType(this.conversationWith);


    this.route.queryParams.subscribe(params => {
      if (params && params.conversationWithFullname) {
        this.conversationWithFullname = params.conversationWithFullname;
        this.conversationAvatar = setConversationAvatar(
          this.conversationWith,
          this.conversationWithFullname,
          this.channelType
        );
      }
      console.log('route.queryParams ---> ', this.conversationWithFullname);
    });


    // if (!this.loggedUser) {
    //   // subscribe is logged and start page
    //   const that = this;
    //   this.authService.authStateChanged.subscribe((user: any) => {
    //       console.log('***** authStateChanged *****', user);
    //       that.loggedUser = user;
    //       if (user && user.uid) {
    //         that.initialize();
    //       }
    //   });
    // }

    if (!this.loggedUser) {
      const that = this;
      this.currentUserService.BScurrentUser.subscribe((currentUser: any) => {
        console.log('***** BScurrentUser *****', currentUser);
        if (currentUser) {
          that.loggedUser = currentUser;
          that.initialize();
        }
      });
    }

  }

  // -------------- SYSTEM FUNCTIONS -------------- //
  /** */
  ngOnInit() {
    console.log('ngOnInit ConversationDetailPage: ');
    this.showMessageWelcome = false;
  }

  ngOnDestroy() {
    console.log('ngOnDestroy ConversationDetailPage: ');
    this.unsubescribeAll();
  }

  /** */
  ionViewWillEnter() {
    console.log('ionViewWillEnter ConversationDetailPage: ', this.loggedUser);
    if (this.loggedUser) {
      this.initialize();
    }
  }

  /** */
  ionViewDidEnter() {}

  /**
   * quando esco dalla pagina distruggo i subscribe
   * e chiudo la finestra di info
   */
  ionViewWillLeave() {}

  // -------------- START MY functions -------------- //
  /**
   * resetto array messaggi
   * resetto stato online user with
   * resetto data ultima connessione
   * recupero loggedUser
   * load stato utente con cui si conversa online/offline
   * load data ultimo aggesso utente con cui si conversa
   * recupero info status user conversation with
   * carico messaggi
   */
  initialize() {
    console.log('initialize ConversationDetailPage: ', this.loggedUser );
    this.subscriptions = [];
    this.setHeightTextArea();
    this.tagsCanned = []; // list of canned
    this.messages = []; // list messages of conversation
    this.isFileSelected = false; // indica se è stato selezionato un file (image da uplodare)
    this.openInfoMessage = false; // indica se è aperto il box info message
    if (checkPlatformIsMobile()) {
      this.isMobile = true;
      this.openInfoConversation = false; // indica se è aperto il box info conversazione
    } else {
      this.isMobile = false;
      this.openInfoConversation = true;
    }
    this.online = false;
    this.lastConnectionDate = '';
    this.initConversationHandler();
    this.startConversation();
  }


  /**
   * translations
   * translationMap passed to components in the html file
   */
  public translations() {
    const keys = [
      'LABEL_AVAILABLE',
      'LABEL_NOT_AVAILABLE',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_TO',
      'LABEL_LAST_ACCESS',
      'ARRAY_DAYS',
      'LABEL_ACTIVE_NOW',
      'LABEL_IS_WRITING'
    ];
    this.translationMap = this.customTranslateService.translateLanguage(keys);
  }


  /**
   * recupero da chatManager l'handler
   * se NON ESISTE creo un handler e mi connetto e lo memorizzo nel chatmanager
   * se ESISTE mi connetto
   * carico messaggi
   * attendo x sec se nn arrivano messaggi visualizzo msg wellcome
   */
  initConversationHandler() {
    const keys = [
      'INFO_SUPPORT_USER_ADDED_SUBJECT',
      'INFO_SUPPORT_USER_ADDED_YOU_VERB',
      'INFO_SUPPORT_USER_ADDED_COMPLEMENT',
      'INFO_SUPPORT_USER_ADDED_VERB',
      'INFO_SUPPORT_CHAT_REOPENED',
      'INFO_SUPPORT_CHAT_CLOSED',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_LAST_ACCESS',
      'LABEL_TO',
      'ARRAY_DAYS'
    ];
    const translationMap = this.customTranslateService.translateLanguage(keys);
    this.showMessageWelcome = false;

    const handler: ConversationHandlerService = this.chatManager.getConversationHandlerByConversationId(this.conversationWith);
    console.log('DETTAGLIO CONV - initConversationHandler **************', this.chatManager, handler, this.conversationWith);
    if (!handler) {
      console.log(
      ' CONVERSATION WITH ', this.conversationWith,
      ' CONVERSATION FULLNAME ', this.conversationWithFullname,
      ' CONVERSATION LOGGED ', this.loggedUser,
      ' CONVERSATION TENANT ', this.tenant);
      this.conversationHandlerService.initialize(
      this.conversationWith,
      this.conversationWithFullname,
      this.loggedUser,
      this.tenant,
      translationMap);

      this.conversationHandlerService.connect();

      console.log('PRIMA ***', this.chatManager.handlers);
      this.chatManager.addConversationHandler(this.conversationHandlerService);
      console.log('DOPO ***', this.chatManager.handlers);
    } else {
      console.log('NON ENTRO ***', this.conversationHandlerService, handler);
      this.conversationHandlerService = handler;
    }
    this.messages = this.conversationHandlerService.messages;
    console.log('CONVERSATION MESSAGES ', this.messages);

    // attendo un secondo e poi visualizzo il messaggio se nn ci sono messaggi
    const that = this;
    setTimeout( () => {
      console.log('setTimeout ***', that.messages);
      if (!that.messages || that.messages.length === 0) {
        that.showMessageWelcome = true;
        console.log('setTimeout ***', that.showMessageWelcome);
      }
    }, 3000);
  }

  /**
   * startConversation
   */
  startConversation() {
    console.log('startConversation: ', this.conversationWith);
    if (this.conversationWith) {
      this.channelType = setChannelType(this.conversationWith);
      console.log('setChannelType: ', this.channelType);
      this.selectInfoContentTypeComponent();
      this.conversationAvatar =  setConversationAvatar(
        this.conversationWith,
        this.conversationWithFullname,
        this.channelType
      );
      this.detectBottom();
      this.initSubscriptions();
    }
  }

  // -------------- START SET INFO COMPONENT -------------- //
  /**
   *
   */
  selectInfoContentTypeComponent() {
    if (this.channelType === TYPE_DIRECT) {
      this.setInfoDirect();
    } else if (this.channelType === TYPE_GROUP) {
      this.setInfoGroup();
    } else if (this.channelType === TYPE_SUPPORT_GROUP) {
      this.urlConversationSupportGroup = '';
      this.setInfoSupportGroup();
    }
  }

  /**
   *
   */
  setInfoDirect() {
    this.member = null;
    const that = this;
    const tiledeskToken = this.authService.getTiledeskToken();
    this.contactsService.loadContactDetail(tiledeskToken, this.conversationWith);
  }

  /**
   *
   */
  setInfoGroup() {
    // group
  }

  /**
   *
   */
  setInfoSupportGroup() {
    let projectID = '';
    const DASHBOARD_URL = this.appConfigProvider.getConfig().DASHBOARD_URL;
    if (this.conversationHandlerService.attributes && this.conversationHandlerService.attributes.projectId) {
      projectID = this.conversationHandlerService.attributes.projectId;
    }
    if (projectID && this.conversationWith) {
      const urlPanel = DASHBOARD_URL + '#/project/' + projectID + '/request-for-panel/' + this.conversationWith;
      const urlConversationTEMP = this.sanitizer.bypassSecurityTrustResourceUrl(urlPanel);
      this.urlConversationSupportGroup = urlConversationTEMP;
    } else {
      this.urlConversationSupportGroup = this.sanitizer.bypassSecurityTrustResourceUrl(DASHBOARD_URL);
    }
    console.log('this.urlConversationSupportGroup:: ', this.urlConversationSupportGroup);
  }
  // -------------- END SET INFO COMPONENT -------------- //



  

  /**
   *
   */
  // connectConversation(conversationId: string) {
  //   const that = this;
  //   console.log('-----> connectConversation: ', conversationId);
  //   this.conversationHandler.connectConversation(conversationId)
  //   .then((snapshot) => {
  //     console.log('-----> conversation snapshot: ', snapshot.val());
  //     if (snapshot.val()) {
  //       console.log('-----> conversation snapshot.val(): ', snapshot.val());
  //       const childData: ConversationModel = snapshot.val();
  //       console.log('-----> conversation childData: ', childData);
  //       childData.uid = snapshot.key;
  //       const conversation = that.conversationHandler.completeConversation(childData);
  //       console.log('-----> conversation conversation: ', conversation);
  //       that.conversationSelected = conversation; // childData;
  //       console.log('-----> conversation: ', that.conversationSelected);
  //       that.startConversation();
  //     } else {
  //       // è una nuova conversazione
  //       console.log('-----> conversation childData: NEW');
  //     }
  //   })
  //   .catch((err) => {
  //     console.log('connectConversation Error:', err);
  //   });
  // }

  /**
   * se il messaggio non è vuoto
   * 1 - ripristino l'altezza del box input a quella di default
   * 2 - invio il messaggio
   * 3 - se l'invio è andato a buon fine mi posiziono sull'ultimo messaggio
   */
  sendMessage(msg: string, type: string, metadata?: any) {
    console.log('sendMessage: ');

    let fullname = this.loggedUser.uid;
    if (this.loggedUser.fullname) {
      fullname = this.loggedUser.fullname;
    }
    // const sender = this.loggedUser.uid;
    // let senderFullname = this.loggedUser.fullname; // this.conversationSelected.sender_fullname;
    // if (this.conversationSelected.recipient === this.loggedUser.uid) {
    //   senderFullname = this.conversationSelected.recipient_fullname;
    // }

    console.log('loggedUserID: ', this.loggedUser.uid);

    console.log('conversationWith: ', this.conversationWith);
    console.log('conversationWithFullname: ', this.conversationWithFullname);

    (metadata) ? metadata = metadata : metadata = '';
    console.log('SEND MESSAGE: ', msg, this.messages, this.loggedUser);
    if (msg && msg.trim() !== '' || type !== TYPE_MSG_TEXT) {
      this.conversationHandlerService.sendMessage(
        msg,
        type,
        metadata,
        this.conversationWith,
        this.conversationWithFullname,
        this.loggedUser.uid,
        fullname,
        this.channelType
      );
      this.chatManager.conversationsHandlerService.uidConvSelected = this.conversationWith;
    }
  }

  /** */
  // setWritingMessages(str) {
  //   this.conversationHandler.setWritingMessages(str, this.channelType);
  // }

  // -------------- END MY functions -------------- //


  // -------------- START SUBSCRIBTIONS functions -------------- //
  /**
   * subscriptions list
   */
  initSubscriptions() {
    console.log('initSubscriptions');
    this.addEventsKeyboard();

    const that = this;
    const subscribeConversationsChanged = this.conversationsHandlerService.conversationsChanged.subscribe((conversations: any) => {
      // console.log('***** DATAIL conversationsChanged *****', conversations);
    });
    if (this.subscriptions.indexOf(subscribeConversationsChanged) === -1 ) {
      this.subscriptions.push(subscribeConversationsChanged);
    }

    const subscribeMessageAdded = this.conversationHandlerService.messageAdded.subscribe((msg: any) => {
      // console.log('***** DATAIL messageAdded *****', msg);
      that.newMessageAdded(msg);
    });
    if (this.subscriptions.indexOf(subscribeMessageAdded) === -1 ) {
      this.subscriptions.push(subscribeMessageAdded);
    }

    const subscribeMessageChanged = this.conversationHandlerService.messageChanged.subscribe((msg: any) => {
      // console.log('***** DATAIL messageChanged *****', msg);
    });
    if (this.subscriptions.indexOf(subscribeMessageChanged) === -1 ) {
      this.subscriptions.push(subscribeMessageChanged);
    }

    const subscribeMessageRemoved = this.conversationHandlerService.messageRemoved.subscribe((messageId: any) => {
      // console.log('***** DATAIL messageRemoved *****', messageId);
    });
    if (this.subscriptions.indexOf(subscribeMessageRemoved) === -1 ) {
      this.subscriptions.push(subscribeMessageRemoved);
    }

    const subscribeBScontactDetail = this.contactsService.BScontactDetail.subscribe((contact: UserModel) => {
      // console.log('***** DATAIL subscribeBScontactDetail *****', contact);
      that.member = contact;
    });
    if (this.subscriptions.indexOf(subscribeBScontactDetail) === -1 ) {
      this.subscriptions.push(subscribeBScontactDetail);
    }

  }

  /**
   * addEventsKeyboard
   */
  addEventsKeyboard() {
    window.addEventListener('keyboardWillShow', () => {
      console.log('Keyboard will Show');
    });
    window.addEventListener('keyboardDidShow', () => {
      console.log('Keyboard is Shown');
    });
    window.addEventListener('keyboardWillHide', () => {
      console.log('Keyboard will Hide');
    });
    window.addEventListener('keyboardDidHide', () => {
      console.log('Keyboard is Hidden');
    });
  }

  /**
   * unsubscribe all subscribe events
   */
  unsubescribeAll() {
    console.log('unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];

    // https://www.w3schools.com/jsref/met_element_removeeventlistener.asp
    window.removeEventListener('keyboardWillShow', null);
    window.removeEventListener('keyboardDidShow', null);
    window.removeEventListener('keyboardWillHide', null);
    window.removeEventListener('keyboardDidHide', null);

  }
  // -------------- END SUBSCRIBTIONS functions -------------- //


  // -------------- START OUTPUT functions -------------- //
  logScrollStart(event: any) {
    // console.log('logScrollStart : When Scroll Starts', event);
  }

  logScrolling(event: any) {
    // console.log('logScrolling : When Scrolling', event);
  }

  logScrollEnd(event: any) {
    // console.log('logScrollEnd : When Scroll Ends', event);
    this.detectBottom();
  }

  /**
   * detectBottom
   */
  async detectBottom() {
    if (!this.ionContentChatArea) {
      return;
    }
    const scrollElement = await this.ionContentChatArea.getScrollElement();
    if ( scrollElement.scrollTop === scrollElement.scrollHeight - scrollElement.clientHeight ) {
      this.showButtonToBottom = false;
      this.NUM_BADGES = 0;
      this.conversationsHandlerService.readAllMessages.next(this.conversationWith);
    } else {
      this.showButtonToBottom = true;
    }
  }



  /** */
  returnChangeTextArea(e: any) {
    try {
      this.heightMessageTextArea = e.target.scrollHeight + 20;
      const message = e.detail.value;
      console.log('------------> returnChangeTextArea', this.heightMessageTextArea);
      console.log('------------> returnChangeTextArea', e.detail.value);

      console.log('------------> returnChangeTextArea loggedUser uid:', this.loggedUser.uid);
      console.log('------------> returnChangeTextArea loggedUser firstname:', this.loggedUser.firstname);
      console.log('------------> returnChangeTextArea conversationSelected uid:', this.conversationWith);
      console.log('------------> returnChangeTextArea channelType:', this.channelType);
      let userId = '';
      let userFullname = '';

      if (this.channelType === TYPE_DIRECT) {
        userId = this.loggedUser.uid;
      }
      if (this.loggedUser.firstname && this.loggedUser.firstname !== undefined) {
        userFullname = this.loggedUser.firstname;
      }
      this.typingService.setTyping(this.conversationWith, message, userId, userFullname);
      // const elTextArea = this.rowTextArea['el'];
      // this.heightMessageTextArea = elTextArea.offsetHeight;
    } catch (err) {
      console.log('error: ', err);
    }
  }

  /** */
  returnSendMessage(e: any) {
    console.log('returnSendMessage::: ', e);
    try {
      const message = e.message;
      const type = e.type;
      this.sendMessage(message, type);
    } catch (err) {
      console.log('error: ', err);
    }
  }

  // -------------- END OUTPUT functions -------------- //


  // -------------- START CLICK functions -------------- //
  /** */
  returnOpenCloseInfoConversation(openInfoConversation: boolean) {
    console.log('returnOpenCloseInfoConversation **************', openInfoConversation);
    this.resizeTextArea();
    this.openInfoMessage = false;
    this.openInfoConversation = openInfoConversation;
  }

  /** */
  pushPage(pageName: string ) {
    this.router.navigateByUrl(pageName);
  }
  // -------------- END CLICK functions -------------- //



  // -------------- START SCROLL/RESIZE functions -------------- //
  /** */
  resizeTextArea() {
    try {
      const elTextArea = this.rowTextArea['el'];
      const that = this;
      setTimeout( () => {
        const textArea = elTextArea.getElementsByTagName('ion-textarea')[0];
        console.log('messageTextArea.ngAfterViewInit ', textArea);
        const txtValue = textArea.value;
        textArea.value = ' ';
        textArea.value = txtValue;
      }, 0);
      setTimeout( () => {
        console.log('text_area.nativeElement ', elTextArea.offsetHeight);
        that.heightMessageTextArea = elTextArea.offsetHeight;
      }, 100);
    } catch (err) {
      console.log('error: ', err);
    }
  }


  /**
   *
   * @param message
   */
  newMessageAdded(message: MessageModel) {
    setTimeout( () => {
      console.log('newMessageAdded', message);
      if (message && message.isSender) {
        this.scrollBottom(0);
      } else if (message && message.status && message.status < 200 ) {
        this.NUM_BADGES++;
        this.showButtonToBottom = true;
      } else {
        this.showButtonToBottom = true;
      }
    }, 0);
  }


  /**
   *
   * @param time
   */
  private scrollBottom(time: number) {
    console.log('scrollBottom', this.ionContentChatArea);
    this.showButtonToBottom = false;
    this.NUM_BADGES = 0;
    this.ionContentChatArea.scrollToBottom(time);
    this.conversationsHandlerService.readAllMessages.next(this.conversationWith);
  }

  /**
   * Scroll to bottom of page after a short delay.
   */
  public actionScrollBottom() {
    console.log('scrollBottom', this.ionContentChatArea);
    const that = this;
    this.showButtonToBottom = false;
    this.NUM_BADGES = 0;
    setTimeout( () => {
      this.ionContentChatArea.scrollToBottom(5);
      this.conversationsHandlerService.readAllMessages.next(this.conversationWith);
    }, 200);
  }

  /**
   * Scroll to top of the page after a short delay.
   */
  scrollTop() {
    console.log('scrollTop');
    this.ionContentChatArea.scrollToTop(100);
  }

  /** */
  setHeightTextArea() {
    try {
      this.heightMessageTextArea = this.rowTextArea['el'].offsetHeight;
    } catch (e) {
      this.heightMessageTextArea = '50';
    }
  }
  // -------------- END SCROLL/RESIZE functions -------------- //

}
// END ALL //

   /**
   * callback sottoscrizione openInfoMessage
   * apre il box di dx del info messaggio
   */
  // onOpenInfoMessage: any = (message) => {
  //   console.log('onOpenInfoMessage');
  //   this.openInfoMessage = true;
  //   this.openInfoConversation = false;
  //   this.messageSelected = message;
  //   //console.log('OPEN MESSAGE **************', message);
  // }

  // onOpenVideoChat: any = (message) => {
  //   console.log('onOpenVideoChat');
  //   this.messageString = message;
  //   const text_area = this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0];
  //   text_area.value = message; //<HTMLInputElement>document.getElementById('chat21-main-message-context');
  //   text_area.focus();
  // }


  /**
   * on subscribe Typings
   */
  // subscribeTypings: any = (childSnapshot) => {
  //   if(this.channelType === TYPE_DIRECT) {
  //     this.isTypings = true;
  //     this.nameUserTypingNow = this.fullnameConversationWith;
  //     console.log('*********** subscribeTypings', this.nameUserTypingNow);
  //   } else {
  //     console.log('child_changed key', childSnapshot.key);
  //     console.log('child_changed val', childSnapshot.val());
  //     this.getFullNameUserForId(childSnapshot.key);
  //   }
  //   const that = this;
  //   clearTimeout(this.setTimeoutWritingMessages);
  //   this.setTimeoutWritingMessages = setTimeout(function () {
  //       that.isTypings = false;
  //   }, 2000);
  // }

  /** 
   * init group details subscription
   */
  // loadGroupDetail() {
  //   console.log('-------------------------->  Dettaglio conersazione ::loadGroupDetail');
  //   const keySubscription = 'conversationGroupDetails';
  //   if (!isInArray(keySubscription, this.subscriptions)) {
  //     console.log(' subscribe ::groupDetails');
  //     this.events.subscribe(keySubscription, this.returnLoadGroupDetail);
  //     // carico il gruppo in info dettaglio
  //     //this.groupService.conversationLoadGroupDetail(this.loggedUser.uid, this.conversationWith, keySubscription);
  //   }
  // }

  /**
   * information detail group called of groupService.loadGroupDetail
   */
  // returnLoadGroupDetail = (snapshot) => {
  //   console.log('<<<<<<<<<<< returnLoadGroupDetail >>>>>>>>>>>>>>>>>>', snapshot.val());
  //   if (snapshot.val()) {
  //     console.log('Dettaglio conersazione ::subscribeGroupDetails', snapshot.val());
  //     const groupDetails = snapshot.val();
  //     this.groupDetailAttributes = groupDetails.attributes;
  //   }
  // }


  // /**
  //  * individuo nella conversazione id e nome dell'utente con il quale sto conversando
  //  * se il tipo di chat è DIRECT o SUPPORT GROUP: id = recipient/sender e fullname = recipientFullname/senderFullname
  //  * altrimenti se è un semplice GRUPPO: id = recipient e fullname = recipientFullname
  //  */
  // setConversationWith() {
  //   console.log('DETTAGLIO CONV - conversationSelected »»»»»»» : ', this.conversationSelected);
  //   this.loadGroupDetail();
  //   //this.loadTagsCanned();
  //   if (this.conversationSelected) {
  //     // GROUP CONVERSATION 
  //     this.conversationType = TYPE_GROUP;
  //     let conversationWith = this.conversationSelected.recipient;
  //     let fullnameConversationWith = this.conversationSelected.recipientFullname;
  //     // DIRECT CONVERSATION
  //     if (this.conversationSelected.channelType === TYPE_DIRECT) {
  //       this.conversationType = TYPE_DIRECT;
  //       if (this.conversationSelected.recipient === this.loggedUser.uid) {
  //         conversationWith = this.conversationSelected.sender;
  //         fullnameConversationWith = this.conversationSelected.senderFullname;
  //       } else {
  //         conversationWith = this.conversationSelected.recipient;
  //         fullnameConversationWith = this.conversationSelected.recipientFullname;
  //       }
  //     }
  //     // SUPPORT GROUP CONVERSATION 
  //     else if (this.conversationSelected.channelType === TYPE_GROUP && this.conversationSelected.recipient.startsWith(TYPE_SUPPORT_GROUP)) {
  //       this.conversationType = TYPE_SUPPORT_GROUP;
  //       console.log('DETTAGLIO CONV - SUPPORT GROUP CONVERSATION ------------>', this.conversationType)
  //       console.log('DETTAGLIO CONV - this.conversationSelected ------------>', this.conversationSelected)
  //       console.log('DETTAGLIO CONV - this.conversationSelected.attributes ------------>', this.conversationSelected.attributes)
  //       console.log('DETTAGLIO CONV - this.conversationSelected.attributes.requester_id ------------>', this.conversationSelected.attributes.requester_id)
  //       if (this.conversationSelected.attributes && this.conversationSelected.attributes.requester_id) {
  //         conversationWith = this.conversationSelected.attributes.requester_id;
  //         console.log('DETTAGLIO CONV - RECUPERO requester_id ------------>', conversationWith)
  //       }
  //       if (this.conversationSelected.senderAuthInfo && this.conversationSelected.senderAuthInfo.authVar && this.conversationSelected.senderAuthInfo.authVar.uid) {
  //         // conversationWith = this.conversationSelected.senderAuthInfo.authVar.uid;
  //         fullnameConversationWith = this.conversationSelected.recipientFullname;
  //       }
  //     }
  //     this.conversationWith = conversationWith;
  //     this.fullnameConversationWith = fullnameConversationWith
  //     console.log('IMPOSTO this.conversationWith ------------>', this.conversationWith)
  //   }

  //   if (this.conversationWith) {
  //     console.log('SOTTOSCRIZIONE:  ', this.conversationType, this.conversationWith);

  //     if (this.conversationType != TYPE_GROUP) {
  //       console.log('MI SOTTOSCRIVO SE E DIVERSO DA  ', TYPE_GROUP);
  //       // subscribe data ultima connessione utente con cui si conversa
  //       let key = 'lastConnectionDate-' + this.conversationWith;
  //       if (!isInArray(key, this.subscriptions)) {
  //         this.subscriptions.push(key);
  //         this.events.subscribe(key, this.updateLastConnectionDate);
  //       }
  //       // subscribe status utente con il quale si conversa (online/offline)
  //       key = 'statusUser:online-' + this.conversationWith;
  //       if (!isInArray(key, this.subscriptions)) {
  //         this.subscriptions.push(key);
  //         this.events.subscribe(key, this.statusUserOnline);
  //       }
  //     }
  //   }



   
  // }


 

  // private isContentScrollEnd(divScrollMe): boolean {
  //   console.log('isContentScrollEnd');
  //   if (divScrollMe.scrollTop === (divScrollMe.scrollHeight - divScrollMe.offsetHeight)) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // //// CALLBACK SUBSCRIBTIONS ////
  // onConversationEnabled: any = (status) => {
  //   console.log('onConversationEnabled');
  //   this.conversationEnabled = status;
  // }


 

  // /**
  //  * on subscribe stato utente con cui si conversa ONLINE
  //  */
  // statusUserOnline: any = (uid: string, status: boolean) => {
  //   console.log('************** statusUserOnline', uid, this.conversationWith, status);
  //   // if(uid !== this.conversationWith){return;}
  //   if (status === true) {
  //     console.log('************** ONLINE');
  //     this.online = true;
  //   } else {
  //     console.log('************** OFFLINE');
  //     this.online = false;
  //   }
  //   //this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
  // }
  // // /**
  // //  * on subscribe stato utente con cui si conversa OFFLINE
  // //  */
  // // statusUserOffline: any = (uid) => {
  // //   if(uid !== this.conversationWith){return;}
  // //   this.online = false;
  // //   this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
  // //   console.log('************** OFFLINE');
  // // }

  // /**
  //  * on subscribe data ultima connessione utente con cui si conversa
  //  */
  // updateLastConnectionDate: any = (uid: string, lastConnectionDate: string) => {
  //   this.lastConnectionDate = lastConnectionDate;
  //   // this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
  //   console.log('************** updateLastConnectionDate', this.lastConnectionDate);
  // }

  


  

  // //// SYSTEM FUNCTIONS ////

  // ionViewWillEnter() {
  //   console.log('------------> ionViewWillEnter', this.conversationSelected);
  //   this.initSubscriptions();
  //   this.initialize();
  //   // if(this.conversationSelected){
  //   //   this.initSubscriptions();
  //   //   this.initialize();
  //   //   // console.log(">>>>>>>>>>>> ", this.navProxy.onSplitPaneChanged);
  //   // } else {
  //   //   this.openInfoConversation = false;
  //   // }
  // }
  // /**
  //  * quando ho renderizzato la pagina richiamo il metodo di inizialize
  //  */

  

  // /**
  //  * quando esco dalla pagina distruggo i subscribe
  //  * e chiudo la finestra di info
  //  */
  // ionViewWillLeave() {
  //   console.log('------------> ionViewWillLeave');
  //   this.openInfoMessage = false;
  //   this.openInfoConversation = false;
  //   this.unsubescribeAll();
  // }

  // ngAfterViewInit() {
  //   console.log('------------> ngAfterViewInit ');
  //   //this.events.subscribe('conversationEnabled', this.onConversationEnabled);
  // }


  

  // /**
  //  * chiamato dal subscribe('listMessages:added')
  //  * ogni volta che viene aggiunto un messaggio
  //  * aggiorno la lista dei messaggi e mi posiziono sull'ultimo
  //  * @param messages 
  //  */
  // updateMessageList(messages) {
  //   // if(!this.updatingMessageList){
  //   this.messages = messages;
  //   console.log('updateMessageList **************', this.messages.length);
  //   this.doScroll();
  //   // }
  //   // this.updatingMessageList = true;
  // }


  /**
   */
  // getFullNameUserForId(memberID){
  //   const that = this;
  //   console.log('getFullNameUserForId', this.conversationMembers);
  //   const member = this.conversationMembers.find(item => item.uid === memberID);
  //   if (!member) {
  //     if ( memberID.trim() !== ''
  //           && memberID.trim() !== SYSTEM
  //           && memberID.trim() !== this.loggedUser.uid
  //       ) {
  //       this.userService.getUserDetail(memberID)
  //       .then(function (snapshot) {
  //         if(that.isTypings == false){
  //           that.isTypings = true;
  //         }
          
  //         console.log('getUserDetail snapshot: ', snapshot.val());
  //         if (snapshot.val()) {
  //           const user = snapshot.val();
  //           const fullname = user.firstname + " " + user.lastname;
  //           that.nameUserTypingNow = fullname;
  //           let position = that.conversationMembers.findIndex(i => i.uid === memberID);
  //           if (position == -1 ) {            
  //             var member = { 'uid': memberID, 'fullname': fullname};
  //             that.conversationMembers.push(member);
  //           }
  //           console.log('getUserDetail: nameUserTypingNow', that.nameUserTypingNow);
  //         }
  //       }).catch(function(error) {
  //         console.log('getUserDetail error: ', error);
  //       });
        
  //       // this.userService.getSenderDetail(this.conversationWith)
  //       // .then(function (snapshot) {
  //       //   if (snapshot.val()) {
  //       //     console.log('::::getSenderDetail::::',snapshot.val() );
  //       //   }
  //       // });
  //     }
  //   } else {
  //     this.isTypings = true;
  //     this.nameUserTypingNow = member.fullname;
  //   }
  // }




  //// START Scroll managemant functions ////
  
  

  // //// END Scroll managemant functions ////


  // // //// START FUNZIONI RICHIAMATE DA HTML ////
  // // /** 
  // //  * chiude il box di dx del info messaggio
  // // */
  // // onCloseInfoPage(){
  // //   if(this.openInfoMessage){
  // //     this.openInfoMessage = false;
  // //   } else {
  // //     this.onOpenCloseInfoConversation();
  // //   }
  // // }

  // returnCloseInfoMessage() {
  //   console.log('returnCloseInfoMessage');
  //   this.openInfoMessage = false;
  // }

  // returnOpenInfoUser(member) {
  //   this.memberSelected = member;
  //   this.openInfoUser = true;
  //   console.log('returnOpenInfoUser **************', this.openInfoUser);
  // }
  // returnCloseInfoUser() {
  //   this.openInfoUser = false;
  //   console.log('returnCloseInfoUser **************', this.openInfoUser);
  // }

  // returnOpenInfoAdvanced(advanced) {
  //   console.log('returnOpenInfoAdvanced **************', advanced);
  //   this.advancedAttributes = advanced;
  //   this.openInfoAdvanced = true;
  // }
  // returnCloseInfoAdvanced() {
  //   this.openInfoAdvanced = false;
  //   this.advancedAttributes = [];
  //   console.log('returnCloseInfoAdvanced **************', this.openInfoAdvanced);
  // }



  // /** 
  //  * 
  // */
 

  // /** */
  // onInfoConversation() {
  //   // ordino array x tempo decrescente
  //   // cerco messaggi non miei
  //   // prendo il primo
  //   console.log('onInfoConversation');
  //   let msgRicevuti: any;
  //   let attributes: any[] = [];
  //   try {
  //     msgRicevuti = this.messages.find(item => item.sender !== this.loggedUser.uid);
  //     if (msgRicevuti) {
  //       attributes = msgRicevuti.attributes;
  //     }
  //     console.log('msgRicevuti::::: ', msgRicevuti);
  //   } catch (err) {
  //     console.log("DettaglioConversazionePage::onInfoConversation:error:", err)
  //   }
  //   //const msgRicevuti = this.messages.find(item => item.sender !== this.loggedUser.uid);
  //   //console.log('onUidSelected::::: ', this.conversationWith,  this.openInfoConversation);
  //   //this.events.publish('onOpenInfoConversation', this.openInfoConversation, this.conversationWith, this.channelType, attributes);
  //   //this.events.publish('changeStatusUserSelected', (this.online, this.lastConnectionDate));
  // }

  /**
   * Check if the user is the sender of the message.
   */
  // public isSender(message) {
  //   console.log('isSender');
  //   const currentUser = this.chatManager.getLoggedUser();
  //   return this.conversationHandler.isSender(message, currentUser);
  // }


  


  // /**
  //  * 
  //  * @param metadata 
  //  */
  // // updateMetadataMessage(metadata) {
  // //   // recupero id nodo messaggio
  // //   const key = metadata.src.substring(metadata.src.length - 16);
  // //   const uid =  this.arrayLocalImmages[key];
  // //   console.log("UPDATE MESSAGE: ",key, uid);
  // //   this.conversationHandler.updateMetadataMessage(uid, metadata);
  // //   delete this.arrayLocalImmages[key];
  // // }
  // /**
  //  * purifico il messaggio
  //  * e lo passo al metodo di invio
  //  * @param messageString
  //  */
  // public controlOfMessage(messageString: string) {
  //   console.log('controlOfMessage **************');
  //   messageString = messageString.replace(/(\r\n|\n|\r)/gm, "");
  //   if (messageString.trim() !== '') {
  //     this.sendMessage(messageString, TYPE_MSG_TEXT);
  //   }
  //   this.messageString = '';
  // }
  // /**
  //  * invocata dalla pressione del tasto invio sul campo di input messaggio
  //  * se il messaggio non è vuoto lo passo al metodo di controllo
  //  * @param event 
  //  * @param messageString 
  //  */
  // pressedOnKeyboard(event, messageString) {
  //   console.log('pressedOnKeyboard ************** event:: ', event);  
  //   if (event.inputType == "insertLineBreak" && event.data == null) {
  //     this.messageString = "";
  //     return
  //   }
  //   else {
  //     this.controlOfMessage(messageString);
  //   }
  // }
  // /**
  //  * metodo chiamato dall'html quando premo sul nome utente nell'header della pagina
  //  * apro la pg di dettaglio user
  //  * @param uidReciver 
  //  */
  // goToUserDetail(uidReciver: string) {
  //   console.log('goToUserDetail::: ', this.navProxy.isOn, uidReciver);
  //   this.navCtrl.push(ProfilePage, {
  //     uidUser: uidReciver
  //   });
  // }
  
  

  // // setUrlString(text, name): any {
  // //   return name;
  // //   // if(text) {
  // //   //   return setUrlString(text, name);
  // //   // } else {
  // //   //   return name;
  // //   // }
  // // }


  // /**
  //  * 
  //  * @param msg 
  //  */
  // showDetailMessage(msg) {
  //   console.log('showDetailMessage', msg);
  //   //this.presentPopover(msg);
  // }
  
  // //// END FUNZIONI RICHIAMATE DA HTML ////






  // //// START LOAD IMAGE ////
  // /**
  //  * 
  //  * @param event 
  //  */
  // detectFiles(event) {
  //   console.log('detectFiles');
  //   if (event && event.target && event.target.files) {
  //     this.selectedFiles = event.target.files;
  //     this.fileChange(event);
  //     console.log('event: ', event.target.files);
  //   }
  // }

  // fileChange(event) {
  //   console.log('fileChange');
  //   const that = this;
  //   if (event.target.files && event.target.files[0]) {
  //     const nameImg = event.target.files[0].name;
  //     const typeFile = event.target.files[0].type;
  //     // const preview = document.querySelector('img');
  //     // const file    = document.querySelector('input[type=file]').files[0];
  //     const reader = new FileReader();
  //     reader.addEventListener('load', function () {
  //       that.isFileSelected = true;

  //       if (typeFile.indexOf('image') !== -1) {
  //         const file4Load = new Image;
  //         // if (typeof reader.result == 'string' || reader.result instanceof String) {}
  //         file4Load.src = reader.result.toString();
  //         file4Load.title = nameImg;
  //         file4Load.onload = function () {
  //           console.log('that.file4Load: ', file4Load);
  //           that.arrayLocalImmages.push(file4Load);
  //           const file = that.selectedFiles.item(0);
  //           const uid = file4Load.src.substring(file4Load.src.length - 16);
  //           const metadata = {
  //             'name': file.name,
  //             'src': file4Load.src,
  //             'width': file4Load.width,
  //             'height': file4Load.height,
  //             'type': typeFile,
  //             'uid': uid
  //           };
  //           const type_msg = 'image';
  //           // 1 - invio messaggio
  //           that.addLocalMessage(metadata, type_msg);
  //           // 2 - carico immagine
  //           that.uploadSingle(metadata, type_msg);
  //         };
  //       } else if (typeFile.indexOf('application') !== -1) {
  //         const type_msg = 'file';
  //         const file = that.selectedFiles.item(0);
  //         const metadata = {
  //           'name': file.name,
  //           'src': event.target.files[0].src,
  //           'type': type_msg
  //         };

  //         // 1 - invio messaggio
  //         that.addLocalMessage(metadata, type_msg);
  //         // 2 - carico immagine
  //         that.uploadSingle(metadata, type_msg);
  //       }

  //     }, false);
  //     if (event.target.files[0]) {
  //       reader.readAsDataURL(event.target.files[0]);
  //       console.log('reader-result: ', event.target.result);
  //     }
  //   }
  // }

  // /**
  //  * salvo un messaggio localmente nell'array dei msg
  //  * @param metadata
  //  */
  // addLocalMessage(metadata, type_msg) {
  //   const now: Date = new Date();
  //   const timestamp = now.valueOf();
  //   const language = document.documentElement.lang;
  //   let textMessage = type_msg;
  //   if (type_msg === 'image') {
  //     textMessage = '';
  //   }
  //   const message = new MessageModel(
  //     metadata.uid, // uid
  //     language, // language
  //     this.conversationWith, // recipient
  //     this.conversationWithFullname, //'Support Group', // recipientFullname
  //     this.loggedUser.uid, // sender
  //     this.loggedUser.fullname, //'Ospite', // senderFullname
  //     '', // status
  //     metadata, // metadata
  //     textMessage, // text
  //     timestamp, // timestamp
  //     '', // headerDate
  //     type_msg, //TYPE_MSG_IMAGE,
  //     '', //attributes
  //     '', // channelType
  //     true
  //   );

  //   // if(type_msg == 'file'){
  //   //   message.text = metadata.src;
  //   // }


  //   //this.messages.push(message);
  //   // message.metadata.uid = message.uid;
  //   console.log('addLocalMessage: ', this.messages);
  //   //this.isFileSelected = true;
  //   this.doScroll();
  // }

  // /**
  //  * 
  //  * @param metadata 
  //  */
  // uploadSingle(metadata, type_msg) {
  //   this.isFileSelected = false;
  //   const that = this;
  //   const file = this.selectedFiles.item(0);
  //   console.log('Uploaded a file! ', file);
  //   const currentUpload = new UploadModel(file);
  //   let uploadTask = this.upSvc.pushUploadMessage(currentUpload)

  //   // Register three observers:
  //   // 1. 'state_changed' observer, called any time the state changes
  //   // 2. Error observer, called on failure
  //   // 3. Completion observer, called on successful completion
  //   uploadTask.on('state_changed', function (snapshot) {
  //     // Observe state change events such as progress, pause, and resume
  //     // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
  //     var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //     console.log('Upload is ' + progress + '% done');
  //   }, function (error) {
  //     // Handle unsuccessful uploads
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     console.log('error: ', errorCode, errorMessage);
  //   }, function () {
  //     // Handle successful uploads on complete
  //     // For instance, get the download URL: https://firebasestorage.googleapis.com/...
  //     uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
  //       console.log('File available at', downloadURL);

  //       metadata.src = downloadURL;
  //       let type_message = TYPE_MSG_TEXT;
  //       let message = 'File: ' + metadata.src;
  //       if (metadata.type.startsWith('image')) {
  //         type_message = TYPE_MSG_IMAGE;
  //         message = 'Image: ' + metadata.src;
  //       }
  //       that.sendMessage(message, type_message, metadata);
  //     });
  //   });


  //   // .then(function(snapshot) {
  //   //   console.log('1 Uploaded a blob or file! ', snapshot);
  //   //   // metadata.src = snapshot.downloadURL;
  //   //   // that.sendMessage('', type_msg, metadata);
  //   //   metadata.src = snapshot.downloadURL;
  //   //   let type_message = TYPE_MSG_TEXT;
  //   //   let message = 'File: ' + metadata.src;
  //   //   if (metadata.type.startsWith('image')) {
  //   //       type_message = TYPE_MSG_IMAGE;
  //   //       message = 'Image: ' + metadata.src;
  //   //   }
  //   //   that.sendMessage(message, type_message, metadata);
  //   // })
  //   // .catch(function(error) {
  //   //   // Handle Errors here.
  //   //   const errorCode = error.code;
  //   //   const errorMessage = error.message;
  //   //   console.log('error: ', errorCode, errorMessage);
  //   // });
  //   console.log('reader-result: ', file);
  // }
  // /**
  //  * 
  //  * @param metadata 
  //  */
  // onSendImage(metadata) {
  //   console.log('onSendImage::::: ', metadata);
  //   this.sendMessage('', TYPE_MSG_IMAGE, metadata);
  //   this.doScroll();
  // }




  // /**
  //  * 
  //  * @param str 
  //  */
  

  // loadTagsCanned(strSearch){
  //   // recupero tagsCanned dalla memoria 
  //   const that = this;
  //   console.log('projectId--->XXXX--->> ', this.conversationSelected);//attributes.projectId);
  //   console.log('this.appConfig.getConfig().SERVER_BASE_URL--->> ', this.appConfig.getConfig().SERVER_BASE_URL);
  //   if(!this.conversationSelected || !this.conversationSelected.attributes || !this.conversationSelected.attributes.projectId || !this.appConfig.getConfig().SERVER_BASE_URL){
  //     return;
  //   }
  //   var projectId = this.conversationSelected.attributes.projectId;
  //   var SERVER_BASE_URL = this.appConfig.getConfig().SERVER_BASE_URL;
  //   //console.log('SERVER_BASE_URL---> ', SERVER_BASE_URL);//attributes.projectId);
  //   // this.contactsService.getLeads(this.queryString, this.pageNo).subscribe((leads_object: any) => {
  //   console.log('this.tagsCanned.length---> ', this.tagsCanned.length);//attributes.projectId);
  //   //if(this.tagsCanned.length <= 0 ){
  //   this.tagsCanned = [];
  //   this.cannedResponsesServiceProvider.getCannedResponses(SERVER_BASE_URL, projectId)
  //     .toPromise()
  //     .then(data => {
  //       console.log('----------------------------------> getCannedResponses:');
  //       console.log(data);
  //       that.tagsCanned = data;
  //       that.showTagsCanned(strSearch);
  //     }).catch(err => {
  //       console.log('error', err);
  //     });
  //   // } else {
  //   //   that.showTagsCanned(strSearch);
  //   // }
  // }

  // /** */
  // showTagsCanned(strSearch){
  //   const that = this;
  //     that.tagsCannedFilter = [];
  //     var tagsCannedClone = JSON.parse(JSON.stringify(that.tagsCanned));
  //     //console.log("that.contacts lenght:: ", strSearch);
  //     that.tagsCannedFilter = that.filterItems(tagsCannedClone, strSearch);
  //     that.tagsCannedFilter.sort(compareValues('title', 'asc'));
  //     var strReplace = strSearch;
  //     if(strSearch.length > 0){
  //       strReplace = "<b>"+strSearch+"</b>";
  //     }
  //     for(var i=0; i < that.tagsCannedFilter.length; i++) {
  //       const textCanned = "<div class='cannedText'>"+that.replacePlaceholderInCanned(that.tagsCannedFilter[i].text)+"</div>";
  //       that.tagsCannedFilter[i].title = "<div class='cannedContent'><div class='cannedTitle'>"+that.tagsCannedFilter[i].title.toString().replace(strSearch,strReplace.trim())+"</div>"+textCanned+'</div>';
  //     }
      
  // }



  // /**
  //  * filtro array contatti per parola passata 
  //  * filtro sul campo fullname
  //  * @param items 
  //  * @param searchTerm 
  //  */
  // filterItems(items,searchTerm){
  //   //console.log("filterItems::: ",searchTerm);
  //   return items.filter((item) => {
  //     //console.log("filterItems::: ", item.title.toString().toLowerCase());
  //     return item.title.toString().toLowerCase().indexOf(searchTerm.toString().toLowerCase()) > -1;
  //   });     
  // }

  // /**
  //  * 
  //  */
  // replaceTagInMessage(canned){
  //   const that = this;
  //   this.tagsCannedFilter = [];
  //   console.log("canned::: ",canned.text);
  //   // // prendo val input
  //   var text_area = this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0];
  //   console.log("messageTextArea::: ",text_area.value);
    
  //   // replace text
  //   var pos = text_area.value.lastIndexOf("/");
  //   var strSearch = text_area.value.substr(pos);
  //   var strTEMP = text_area.value.replace(strSearch,canned.text);
  //   console.log("strSearch::: ",strSearch);
  //   console.log("this.conversationSelected.attributes:::::: ",this.conversationSelected.attributes);
  //   strTEMP = this.replacePlaceholderInCanned(strTEMP);
  //   console.log("strSearch::: ",strSearch);
  //   text_area.value = '';
  //   that.messageString = strTEMP;
  //   //text_area.value = strTEMP;
  //   setTimeout(() => {
  //     text_area.focus();
  //     that.resizeTextArea();
  //   },200);
  // }

  // replacePlaceholderInCanned(str){
  //   if (this.groupDetailAttributes && this.groupDetailAttributes.userEmail) {
  //     str = str.replace('$email',this.groupDetailAttributes.userEmail);
  //   }
  //   if (this.groupDetailAttributes && this.groupDetailAttributes.website) {
  //     str = str.replace('$website',this.groupDetailAttributes.website);
  //   }
  //   if (this.groupDetailAttributes && this.groupDetailAttributes.userFullname) {
  //     str = str.replace('$recipient_name',this.groupDetailAttributes.userFullname);
  //   }
  //   if (this.loggedUser && this.loggedUser.fullname) {
  //     str = str.replace('$agent_name',this.loggedUser.fullname);
  //   }
  //   return str;
  // }


  
  // insertAtCursor(myField, myValue) {
  //   console.log('CANNED-RES-CREATE.COMP - insertAtCursor - myValue ', myValue );
     
  //   // if (this.addWhiteSpaceBefore === true) {
  //   //   myValue = ' ' + myValue;
  //   //   console.log('CANNED-RES-CREATE.COMP - GET TEXT AREA - QUI ENTRO myValue ', myValue );
  //   // }
   
  //   //IE support
  //   if (myField.selection) {
  //     myField.focus();
  //     let sel = myField.selection.createRange();
  //     sel.text = myValue;
  //     // this.cannedResponseMessage = sel.text;
  //   }
  //   //MOZILLA and others
  //   else if (myField.selectionStart || myField.selectionStart == '0') {
  //     var startPos = myField.selectionStart;
  //     console.log('CANNED-RES-CREATE.COMP - insertAtCursor - startPos ', startPos);
      
  //     var endPos = myField.selectionEnd;
  //     console.log('CANNED-RES-CREATE.COMP - insertAtCursor - endPos ', endPos);
      
  //     myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
  
  //     // place cursor at end of text in text input element
  //     //myField.focus();
  //     var val = myField.value; //store the value of the element
  //     myField.value = ''; //clear the value of the element
  //     myField.value = val + ' '; //set that value back. 
  
  //     //this.cannedResponseMessage = myField.value;
  //     //this.texareaIsEmpty = false;
  //     /// myField.select();
  //   } else {
  //     myField.value += myValue;
  //     //this.cannedResponseMessage = myField.value;
  //   }
  // }
  
  // onResizeWindow = (type: string) => {
  //   console.log('resize_', type);
  //   if(type === 'mobile' && !this.IDConv && !this.conversationSelected) {
  //     this.router.navigateByUrl('/conversations-list');
  //   } else {
  //   }
  // }

  // @HostListener('window:resize', ['$event'])
  // onResize(event: any) {
  //   const newInnerWidth = event.target.innerWidth;
  //   console.log("newInnerWidth ", newInnerWidth);
  //   if (newInnerWidth < 768) {
  //     console.log("sparisci!!!!!", newInnerWidth)
  //     this.openInfoMessage = false;
  //     this.openInfoConversation = false;
  //   }
  // }

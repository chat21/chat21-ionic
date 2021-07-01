
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter } from '@angular/core';
import { ModalController, IonRouterOutlet, NavController } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
// config
import { environment } from '../../../environments/environment';

// models
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { UserModel } from 'src/chat21-core/models/user';

// utils
import {
  isInArray,
  checkPlatformIsMobile,
  presentModal,
  closeModal,
  getParameterByName,
  convertMessage,
  windowsMatchMedia,
  isGroup,
  replaceEndOfLine,

} from '../../../chat21-core/utils/utils';
import { TYPE_POPUP_LIST_CONVERSATIONS, AUTH_STATE_OFFLINE, TYPE_GROUP } from '../../../chat21-core/utils/constants';
import { EventsService } from '../../services/events-service';
import PerfectScrollbar from 'perfect-scrollbar'; // https://github.com/mdbootstrap/perfect-scrollbar



// pages
// import { LoginModal } from '../../modals/authentication/login/login.modal';

// services
import { DatabaseProvider } from '../../services/database';
// import { ChatConversationsHandler } from '../../services/chat-conversations-handler';
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service';
import { ChatManager } from 'src/chat21-core/providers/chat-manager';
import { NavProxyService } from '../../services/nav-proxy.service';
import { TiledeskService } from '../../services/tiledesk/tiledesk.service';


import { ConversationDetailPage } from '../conversation-detail/conversation-detail.page';
import { ContactsDirectoryPage } from '../contacts-directory/contacts-directory.page';
import { ProfileInfoPage } from '../profile-info/profile-info.page';
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { AppConfigProvider } from '../../services/app-config';


@Component({
  selector: 'app-conversations-list',
  templateUrl: './conversations-list.page.html',
  styleUrls: ['./conversations-list.page.scss'],
})
export class ConversationListPage implements OnInit {
  private subscriptions: Array<string>;
  public tenant: string;
  public loggedUserUid: string;
  public conversations: Array<ConversationModel> = [];
  public archivedConversations: Array<ConversationModel> = [];
  public uidConvSelected: string;
  public conversationSelected: ConversationModel;
  public uidReciverFromUrl: string;
  public showPlaceholder = true;
  public numberOpenConv = 0;

  public loadingIsActive = true;
  public supportMode = environment.supportMode;

  public convertMessage = convertMessage;
  private isShowMenuPage = false;
  private logger: LoggerService = LoggerInstance.getInstance()
  translationMapConversation: Map<string, string>;
  stylesMap: Map<string, string>;

  // --- START:::event Emitter handler functions --- //
  private onConversationSelectedHandler = new EventEmitter();
  private onImageLoadedHandler = new EventEmitter();
  private onConversationLoadedHandler = new EventEmitter();
  // --- END:::event Emitter handler functions --- //

  public conversationType = 'active'
  headerTitle: string

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavProxyService,
    public events: EventsService,
    public modalController: ModalController,
    public databaseProvider: DatabaseProvider,
    // public chatConversationsHandler: ChatConversationsHandler,
    public conversationsHandlerService: ConversationsHandlerService,
    public archivedConversationsHandlerService: ArchivedConversationsHandlerService,
    public chatManager: ChatManager,
    public messagingAuthService: MessagingAuthService,
    public imageRepoService: ImageRepoService,
    private translateService: CustomTranslateService,
    public tiledeskService: TiledeskService,
    public tiledeskAuthService: TiledeskAuthService,
    public appConfigProvider: AppConfigProvider,
  ) {
    // console.log('constructor ConversationListPage');

    // this.getUrlParams();

    this.listenToAppCompConvsLengthOnInitConvs()
    this.listenToLogoutEvent();
    this.listenToNotificationCLick()
  }

  listenToNotificationCLick() {
    const that = this;
    navigator.serviceWorker.addEventListener('message', function (event) {
      console.log('FIREBASE-NOTIFICATION (conversation list page) Received a message from service worker event data: ', event.data);
      console.log('FIREBASE-NOTIFICATION (conversation list) Received a message from service worker event data data: ', event.data['data']);
      console.log('FIREBASE-NOTIFICATION (conversation list) Received a message from service worker event data data typeof: ', typeof event.data['data']);
      let uidConvSelected = ''
      if (typeof event.data['data'] === 'string') {
        uidConvSelected = event.data['data']
      } else {
        uidConvSelected = event.data['data']['recipient']
      }
      // const dataObjct = JSON.parse(event.data['data']);
      // console.log('FIREBASE-NOTIFICATION (conversation list page)) Received a message from service worker event dataObjct : ', dataObjct);
      // const uidConvSelected = dataObjct.recipient

      console.log('FIREBASE-NOTIFICATION (conversation list page) Received a message from service worker event dataObjct uidConvSelected: ', uidConvSelected);
      console.log('FIREBASE-NOTIFICATION (conversation list page)) Received a message from service worker that.conversations: ', that.conversations);
      const conversationSelected = that.conversations.find(item => item.uid === uidConvSelected);
      if (conversationSelected) {

        that.conversationSelected = conversationSelected;
        console.log('FIREBASE-NOTIFICATION (conversation list page) Received a message from service worker event conversationSelected: ', that.conversationSelected);


        that.navigateByUrl('active', uidConvSelected)
      }
    });
  }

  // getUrlParams() {
  //   this.route.paramMap.subscribe(params => {
  //     console.log('ConversationListPage get params: ', params);
  //     // this.conversationWith = params.get('IDConv');
  //     // this.conversationWithFullname = params.get('FullNameConv');
  //     // this.conv_type = params.get('Convtype');
  //   });
  // }

  private listnerStart() {
    const that = this;
    this.chatManager.BSStart.subscribe((data: any) => {
      this.logger.printDebug('CONVERSATION-LIST-PAGE ***** BSStart Current user *****', data);
      if (data) {
        that.initialize();
      }
    });
  }

  ngOnInit() {
    //console.log('ngOnInit ConversationDetailPage: ');
  }

  ionViewWillEnter() {
    this.logger.printDebug('CONVERSATION-LIST-PAGE ionViewWillEnter uidConvSelected', this.uidConvSelected);
    this.listnerStart();
    // if (this.loggedUserUid) {
    //   // this.initialize();
    // } else {
    //   // this.listnerUserLogged();
    // }
  }



  ionViewDidEnter() {
    // console.log('ConversationListPage ------------> ionViewDidEnter');
  }

  private navigatePage() {
    console.log('navigatePage:: >>>> conversationSelected ', this.conversationSelected);
    let urlPage = 'detail/';
    if (this.conversationSelected) {
      // urlPage = 'conversation-detail/' + this.uidConvSelected;
      urlPage = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname;
      // this.openDetailsWithState(this.conversationSelected);
    }
    // else {
    //   this.router.navigateByUrl('detail');
    // }

    const navigationExtras: NavigationExtras = {
      state: {
        conversationSelected: this.conversationSelected
      }
    };
    this.navService.openPage(urlPage, ConversationDetailPage, navigationExtras);
  }

  // openDetailsWithState(conversationSelected) {
  //   console.log('openDetailsWithState:: >>>> conversationSelected ', conversationSelected);
  //   let navigationExtras: NavigationExtras = {
  //     state: {
  //       conversationSelected: conversationSelected
  //     }
  //   };
  //   this.router.navigate(['conversation-detail/' + this.uidConvSelected], navigationExtras);
  // }

  // ------------------------------------------------------------------ //
  // BEGIN SUBSCRIPTIONS
  // ------------------------------------------------------------------ //


  /**
   * ::: initConversationsHandler :::
   * inizializzo chatConversationsHandler 
   * recupero le conversazioni salvate nello storage e pubblico l'evento loadedConversationsStorage
   * imposto uidConvSelected in conversationHandler
   * e mi sottoscrivo al nodo conversazioni in conversationHandler (connect)
   * salvo conversationHandler in chatManager
   */
  initConversationsHandler() {
    // const keys = ['YOU'];

    // const translationMap = this.translateService.translateLanguage(keys);

    // console.log('initConversationsHandler ------------->', userId, this.tenant);
    // // 1 - init chatConversationsHandler and  archviedConversationsHandler
    // this.conversationsHandlerService.initialize(this.tenant, userId, translationMap);
    // 2 - get conversations from storage
    // this.chatConversationsHandler.getConversationsFromStorage();
    // 5 - connect conversationHandler and archviedConversationsHandler to firebase event (add, change, remove)

    // this.conversationsHandlerService.connect(); // old - now renamed in subscribeToConversations

    // ------------------------------------------------------------------------------------------
    // subscribeToConversations Moved in APP.COMPONENT.ts - to manage that.showPlaceholder = true;
    // ------------------------------------------------------------------------------------------ 
    // this.conversationsHandlerService.subscribeToConversations(() => {
    //   this.logger.printDebug('SubscribeToConversations (convs-list-page) - conversations')
    //   if (!this.conversations || this.conversations.length === 0) {
    //     that.showPlaceholder = true;
    //   }
    // });

    this.conversations = this.conversationsHandlerService.conversations;
    this.logger.printDebug('CONVS - CONVERSATION-LIST-PAGE CONVS ++++', this.conversations)



    // 6 - save conversationHandler in chatManager
    this.chatManager.setConversationsHandler(this.conversationsHandlerService);
    const that = this;
    this.showPlaceholder = false;
    // setTimeout(() => {
    //   if (!that.conversations || that.conversations.length === 0) {
    //     that.showPlaceholder = true;
    //   }
    // }, 2000);
  }

  // ----------------------------------------------------------------------------------------------------
  // To display "No conversation yet" MESSAGE in conversazion list 
  // this.loadingIsActive is set to false only if on init there are not conversation
  // otherwise loadingIsActive remains set to true and the message "No conversation yet" is not displayed
  // to fix this
  // - for the direct conversation  
  // ---------------------------------------------------------------------------------------------------- 
  listenToAppCompConvsLengthOnInitConvs() {
    this.events.subscribe('appcompSubscribeToConvs:loadingIsActive', (loadingIsActive) => {
      this.logger.printDebug('CONVS - CONVERSATION-LIST-PAGE CONVS loadingIsActive', loadingIsActive);
      if (loadingIsActive === false) {
        this.loadingIsActive = false
      }
    });
  }

  listenToLogoutEvent() {
    this.events.subscribe('profileInfoButtonClick:logout', (hasclickedlogout) => {
      this.logger.printDebug('CONVS - CONVERSATION-LIST-PAGE CONVS loadingIsActive hasclickedlogout', hasclickedlogout);
      if (hasclickedlogout === true) {
        this.loadingIsActive = false
      }
    });
  }



  /**
   * ::: initArchivedConversationsHandler :::
   * inizializzo archviedConversationsHandler
   * recupero le conversazioni salvate nello storage e pubblico l'evento loadedConversationsStorage
   * imposto uidConvSelected in chatArchivedConversationsHandler
   * e mi sottoscrivo al nodo conversazioni in chatArchivedConversationsHandler (connect)
   * salvo conversationHandler in chatManager
   */
  initArchivedConversationsHandler(userId: string) {
    // const keys = ['YOU'];
    // const translationMap = this.translateService.translateLanguage(keys);

    const keysConversation = ['CLOSED'];
    this.translationMapConversation = this.translateService.translateLanguage(keysConversation);

    // console.log('initArchivedConversationsHandler ------------->', userId, this.tenant);
    // // 1 - init  archviedConversationsHandler
    // this.archivedConversationsHandlerService.initialize(this.tenant, userId, translationMap);
    // 2 - get conversations from storage
    // this.chatConversationsHandler.getConversationsFromStorage();
    // 5 - connect archviedConversationsHandler to firebase event (add, change, remove)
    // this.archivedConversationsHandlerService.subscribeToConversations();

    this.archivedConversationsHandlerService.subscribeToConversations(() => {
      this.logger.printDebug('CONVS SubscribeToConversations (convs-list-page) - conversations archived length ', this.archivedConversations.length)
      // if (!this.archivedConversations || this.archivedConversations.length === 0) {
      //   this.loadingIsActive = false;
      // }


      // this.archivedConversations.forEach(conv => {
      //   console.log('CONVS SubscribeToConversations (convs-list-page) - conversations archived COV ', conv.last_message_text);
      //   // Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly in the archived convesations list
      //   if (conv && conv.last_message_text) {
      //     var regex = /<br\s*[\/]?>/gi;
      //     conv.last_message_text = conv.last_message_text.replace(regex, "\n")
      //   }
      // });
    });

    this.archivedConversations = this.archivedConversationsHandlerService.archivedConversations;
    this.logger.printDebug("archived conversation", this.archivedConversations)
    // 6 - save archivedConversationsHandlerService in chatManager
    this.chatManager.setArchivedConversationsHandler(this.archivedConversationsHandlerService);
    // const that = this;
    // this.showPlaceholder = false;
    // setTimeout(() => {
    //   if (!that.archivedConversations || that.archivedConversations.length === 0) {
    //     this.showPlaceholder = true;
    //   }
    // }, 2000);
    this.logger.printDebug('CONVS SubscribeToConversations (convs-list-page) - conversations archived length ', this.archivedConversations.length)
    if (!this.archivedConversations || this.archivedConversations.length === 0) {
      this.loadingIsActive = false;
    }

  }


  /** */
  initSubscriptions() {
    let key = '';
    // key = 'loggedUser:login';
    // if (!isInArray(key, this.subscriptions)) {
    //   this.subscriptions.push(key);
    //   this.events.subscribe(key, this.subscribeLoggedUserLogin);
    // }

    // key = 'conversationsChanged';
    // if (!isInArray(key, this.subscriptions)) {
    //   this.subscriptions.push(key);
    //   this.events.subscribe(key, this.conversationsChanged);
    // }

    key = 'loggedUser:logout';
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key);
      this.events.subscribe(key, this.subscribeLoggedUserLogout);
    }

    key = 'readAllMessages';
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key);
      this.events.subscribe(key, this.readAllMessages);
    }

    key = 'profileInfoButtonClick:changed';
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key);
      this.events.subscribe(key, this.subscribeProfileInfoButtonClicked);
    }

    this.conversationsHandlerService.readAllMessages.subscribe((conversationId: string) => {
      this.logger.printDebug('***** readAllMessages *****', conversationId);
      this.readAllMessages(conversationId);
    });

    const that = this;
    this.conversationsHandlerService.conversationAdded.subscribe((conversation: ConversationModel) => {
      this.logger.printDebug('***** conversationsAdded *****', conversation);
      // that.conversationsChanged(conversations);
    });
    this.conversationsHandlerService.conversationChanged.subscribe((conversation: ConversationModel) => {
      this.logger.printDebug('***** conversationsChanged *****', conversation);
      // that.conversationsChanged(conversations);
    });
    this.conversationsHandlerService.conversationRemoved.subscribe((conversation: ConversationModel) => {
      this.logger.printDebug('***** conversationsRemoved *****', conversation);
    });

  }
  // CALLBACKS //

  /**
   * ::: readAllMessages :::
   * quando tutti i messaggi della chat risultano visualizzati,
   * cioè quando nel dettaglio conversazione mi porto al bottom della pagina,
   * scatta l'evento readAllMessages che viene intercettato nell'elenco conversazioni
   * e modifica la conversazione attuale portando is_new a true
   */
  readAllMessages = (uid: string) => {
    this.logger.printDebug('CONVERSATION-LIST-PAGE readAllMessages', uid);
    const conversationSelected = this.conversations.find(item => item.uid === this.uidConvSelected);
    if (conversationSelected) {
      conversationSelected.is_new = false;
      conversationSelected.status = '0';
      conversationSelected.selected = true;
    }
  }


  // /**
  //  * ::: subscribeLoggedUserLogin :::
  //  * effettuato il login:
  //  * 1 - imposto loggedUser
  //  * 2 - dismetto modale
  //  * 3 - inizializzo elenco conversazioni
  //  */
  // subscribeLoggedUserLogin = (user: any) => {
  //   console.log('3 ************** subscribeLoggedUserLogin', user);
  //   this.loggedUser = user;
  //   try {
  //     closeModal(this.modalController);
  //   } catch (err) {
  //     console.error('-> error:', err);
  //   }
  //   this.initialize();
  // }

  /**
   * ::: subscribeLoggedUserLogout :::
   * effettuato il logout:
   * 1 - resetto array conversazioni
   * 2 - resetto conversazione selezionata
   * 3 - mostro modale login
   */
  subscribeLoggedUserLogout = () => {
    this.logger.printDebug('CONVERSATION-LIST-PAGE - subscribeLoggedUserLogout');
    this.conversations = [];
    this.uidConvSelected = null;
    // presentModal(this.modalController, LoginModal, { tenant: this.tenant, enableBackdropDismiss: false });
  }

  /**
   * ::: conversationsChanged :::
   * evento richiamato su add, change, remove dell'elenco delle conversazioni
   * 1 - aggiorno elenco conversazioni
   * 2 - aggiorno il conto delle nuove conversazioni
   * 4 - se esiste un uidReciverFromUrl (passato nell'url)
   *    e se esiste una conversazione con lo stesso id di uidReciverFromUrl
   *    imposto questa come conversazione attiva (operazione da fare una sola volta al caricamento delle conversazioni) 
   *    e la carico nella pagina di dettaglio e azzero la variabile uidReciverFromUrl!!!
   * 5 - altrimenti se esiste una conversazione con lo stesso id della conversazione attiva
   *    e la pagina di dettaglio è vuota (placeholder), carico la conversazione attiva (uidConvSelected) nella pagina di dettaglio 
   *    (operazione da fare una sola volta al caricamento delle conversazioni)
   */
  conversationsChanged = (conversations: ConversationModel[]) => {
    const that = this;
    // this.conversations = conversations;
    this.numberOpenConv = this.conversationsHandlerService.countIsNew();
    console.log('ConversationListPage  »»»»»»»»» conversationsChanged - CONVERSATIONS: ', this.numberOpenConv);
    // console.log('conversationsChanged »»»»»»»»» uidConvSelected', that.conversations[0], that.uidConvSelected);
    if (that.uidConvSelected && !this.conversationSelected) {
      const conversationSelected = that.conversations.find(item => item.uid === that.uidConvSelected);
      if (conversationSelected) {
        console.log('11111');
        this.conversationSelected = conversationSelected;
        that.setUidConvSelected(that.uidConvSelected);
      }
      // localStorage.setItem('conversationSelected', JSON.stringify(conversationSelected));
    }
    // }
  }


  /**
   * ::: subscribeChangedConversationSelected :::
   * evento richiamato quando si seleziona un utente nell'elenco degli user
   * apro dettaglio conversazione
   */
  subscribeChangedConversationSelected = (user: UserModel, type: string) => {
    console.log('ConversationListPage  ************** subscribeUidConvSelectedChanged navigateByUrl', user, type);
    this.uidConvSelected = user.uid;
    console.log('ConversationListPage  ************** uidConvSelected ', this.uidConvSelected);
    // this.conversationsHandlerService.uidConvSelected = user.uid;
    const conversationSelected = this.conversations.find(item => item.uid === this.uidConvSelected);
    if (conversationSelected) {
      console.log('ConversationListPage --> uidConvSelected: ', this.conversationSelected, this.uidConvSelected);
      this.conversationSelected = conversationSelected;
    }
    // this.router.navigateByUrl('conversation-detail/' + user.uid + '?conversationWithFullname=' + user.fullname);
  }

  /**
   * ::: subscribeProfileInfoButtonClicked :::
   * evento richiamato quando si seleziona bottone profile-info-modal
   */
  subscribeProfileInfoButtonClicked = (event: string) => {
    console.log('ConversationListPage ************** subscribeProfileInfoButtonClicked: ', event);
    if (event === 'displayArchived') {
      this.initArchivedConversationsHandler(this.loggedUserUid);
      // this.openArchivedConversationsModal()
      this.conversationType = 'archived'

      // let storedArchivedConv = localStorage.getItem('activeConversationSelected');
      const keys = ['LABEL_ARCHIVED'];
      this.headerTitle = this.translateService.translateLanguage(keys).get(keys[0]);

    } else if (event === 'displayContact') {
      this.conversationType = 'archived'
      const keys = ['LABEL_CONTACTS'];
      this.headerTitle = this.translateService.translateLanguage(keys).get(keys[0]);
    }
  }

  onBackButtonFN(event) {
    this.conversationType = 'active'

    // let storedActiveConv = localStorage.getItem('activeConversationSelected');
    // // console.log('ConversationListPage - storedActiveConv: ', storedActiveConv);
    // if (storedActiveConv) {
    //   let storedActiveConvObjct = JSON.parse(storedActiveConv)
    //   console.log('ConversationListPage - storedActiveConv Objct: ', storedActiveConvObjct);
    //   this.navigateByUrl('active', storedActiveConvObjct.uid)
    // } else {
    //   // da implementare se nn c'è stata nessuna conv attive selezionata 
    // }

  }


  // ------------------------------------------------------------------//
  // END SUBSCRIPTIONS
  // ------------------------------------------------------------------//

  // :: handler degli eventi in output per i componenti delle modali
  // ::::: vedi ARCHIVED-CONVERSATION-LIST --> MODALE
  initHandlerEventEmitter() {
    this.onConversationSelectedHandler.subscribe(conversation => {
      console.log('ConversationListPage - onversaation selectedddd', conversation)
      this.onConversationSelected(conversation)
    })

    this.onImageLoadedHandler.subscribe(conversation => {
      this.onImageLoaded(conversation)
    })

    this.onConversationLoadedHandler.subscribe(conversation => {
      this.onConversationLoaded(conversation)
    })
  }



  // ------------------------------------------------------------------//
  // BEGIN FUNCTIONS
  // ------------------------------------------------------------------//
  /**
   * ::: initialize :::
   */
  initialize() {
    // this.tenant = environment.tenant;
    this.tenant = this.appConfigProvider.getConfig().tenant
    console.log('ConversationListPage this.tenant', this.tenant)
    this.loggedUserUid = this.tiledeskAuthService.getCurrentUser().uid;
    this.subscriptions = [];
    this.initConversationsHandler();
    this.databaseProvider.initialize(this.loggedUserUid, this.tenant);
    this.initVariables();
    this.initSubscriptions();
    this.initHandlerEventEmitter();
  }


  /**
   * ::: initVariables :::
   * al caricamento della pagina:
   * setto BUILD_VERSION prendendo il valore da PACKAGE
   * recupero conversationWith -
   * se vengo da dettaglio conversazione o da users con conversazione attiva ???? sarà sempre undefined da spostare in ionViewDidEnter
   * recupero tenant
   * imposto recipient se esiste nei parametri passati nell'url
   * imposto uidConvSelected recuperando id ultima conversazione aperta dallo storage
   */
  initVariables() {
    const that = this;
    // const TEMP = getParameterByName('recipient');
    // if (TEMP) {
    //   this.uidReciverFromUrl = TEMP;
    // }
    console.log('uidReciverFromUrl:: ' + this.uidReciverFromUrl);
    console.log('loggedUserUid:: ' + this.loggedUserUid);
    console.log('tenant:: ' + this.tenant);
    if (this.route.component['name'] !== "ConversationListPage") {
      const IDConv = this.route.snapshot.firstChild.paramMap.get('IDConv');
      console.log('ConversationListPage .conversationWith: ', IDConv);
      if (IDConv) {
        console.log('22222');
        this.setUidConvSelected(IDConv);
      } else {

        // // da togliere
        // this.databaseProvider.getUidLastOpenConversation().then((uid: string) => {
        //   console.log('getUidLastOpenConversation:: ' + uid);
        //   console.log('33333');
        //   that.navigateByUrl('active', uid);
        // })
        //   .catch((error) => {
        //     console.log('44444');
        //     console.log('error::: ', error);
        //   });
      }
    }

    console.log('::::tenant:::: ', this.tenant);
    console.log('::::uidReciverFromUrl:::: ', this.uidReciverFromUrl);
  }


  // /**
  //  * ::: initConversationsHandler :::
  //  * inizializzo chatConversationsHandler e archviedConversationsHandler
  //  * recupero le conversazioni salvate nello storage e pubblico l'evento loadedConversationsStorage
  //  * imposto uidConvSelected in conversationHandler e chatArchivedConversationsHandler
  //  * e mi sottoscrivo al nodo conversazioni in conversationHandler e chatArchivedConversationsHandler (connect)
  //  * salvo conversationHandler in chatManager
  //  */
  // initConversationsHandler() {
  //   console.log('initConversationsHandler -------------> initConversationsHandler');
  //   /// const tenant = this.chatManager.getTenant();
  //   /// const loggedUser = this.chatManager.getLoggedUser();

  //   // 1 - init chatConversationsHandler and  archviedConversationsHandler
  //   this.chatConversationsHandler = this.chatConversationsHandler.initWithTenant(this.tenant, this.loggedUser);
  //   // this.chatArchivedConversationsHandler = this.chatArchivedConversationsHandler.initWithTenant(this.tenant, this.loggedUser);

  //   // 2 - get conversations from storage
  //   this.chatConversationsHandler.getConversationsFromStorage();

  //   // 3 - set uidConvSelected in conversationHandler
  //   this.chatConversationsHandler.uidConvSelected = this.uidConvSelected;
  //   // this.chatArchivedConversationsHandler.uidConvSelected = this.uidConvSelected

  //   // 5 - connect conversationHandler and archviedConversationsHandler to firebase event (add, change, remove)
  //   this.chatConversationsHandler.connect();
  //   // this.chatArchivedConversationsHandler.connect();

  //   // 6 - save conversationHandler in chatManager
  //   this.chatManager.setConversationsHandler(this.chatConversationsHandler);
  // }

  /**
   * ::: setUidConvSelected :::
   */
  setUidConvSelected(uidConvSelected: string, conversationType?: string,) {
    console.log('setuidCOnvSelected', uidConvSelected)
    this.uidConvSelected = uidConvSelected;
    // this.conversationsHandlerService.uidConvSelected = uidConvSelected;
    if (uidConvSelected) {
      let conversationSelected;
      if (conversationType === 'active') {
        conversationSelected = this.conversations.find(item => item.uid === this.uidConvSelected);
      } else if (conversationType === 'archived') {
        conversationSelected = this.archivedConversations.find(item => item.uid === this.uidConvSelected);
      }
      if (conversationSelected) {
        console.log('ConversationListPage conversationSelected', conversationSelected);
        console.log('la conv ', this.conversationSelected, ' è già stata caricata');
        this.conversationSelected = conversationSelected;
        console.log('setUidConvSelected: ', this.conversationSelected);
        // this.databaseProvider.setUidLastOpenConversation(uidConvSelected);

        // if (this.conversationSelected.status === "0") {
        //   localStorage.setItem('activeConversationSelected', JSON.stringify(this.conversationSelected));
        // } else if (this.conversationSelected.status === "1") {
        //   localStorage.setItem('archivedConversationSelected', JSON.stringify(this.conversationSelected));
        // }
      }
    }
  }

  onConversationSelected(conversation: ConversationModel) {
    //console.log('returnSelectedConversation::', conversation)
    if (conversation.archived) {
      this.navigateByUrl('archived', conversation.uid)
    } else {
      this.navigateByUrl('active', conversation.uid)
    }

  }

  onImageLoaded(conversation: ConversationModel) {
    let conversation_with_fullname = conversation.sender_fullname;
    let conversation_with = conversation.sender;
    if (conversation.sender === this.loggedUserUid) {
      conversation_with = conversation.recipient;
      conversation_with_fullname = conversation.recipient_fullname;
    } else if (isGroup(conversation)) {
      // conversation_with_fullname = conv.sender_fullname;
      // conv.last_message_text = conv.last_message_text;
      conversation_with = conversation.recipient;
      conversation_with_fullname = conversation.recipient_fullname;
    }
    conversation.image = this.imageRepoService.getImagePhotoUrl(conversation_with)
  }

  onConversationLoaded(conversation: ConversationModel) {
    const keys = ['YOU'];
    const translationMap = this.translateService.translateLanguage(keys);
    // Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly in the convesations list

    var regex = /<br\s*[\/]?>/gi;
    // conversation.last_message_text =  conversation.last_message_text.replace(regex, "\n")
    conversation.last_message_text = conversation.last_message_text.replace(regex, "")

    // conversation.last_message_text = replaceEndOfLine(conversation.last_message_text);
    if (conversation.sender === this.loggedUserUid && !conversation.last_message_text.includes(': ')) {
      console.log('onConversationLoaded', conversation)
      conversation.last_message_text = translationMap.get('YOU') + ': ' + conversation.last_message_text;
    }
  }

  // ?????? 
  navigateByUrl(converationType: string, uidConvSelected: string) {
    console.log('FIREBASE-NOTIFICATION (conversation list page) uidConvSelected: ', uidConvSelected);
    console.log('ConversationListPage navigateByUrl run  this.setUidConvSelected');
    console.log('ConversationListPage navigateByUrl this.uidConvSelected ', this.uidConvSelected);
    // console.log('ConversationListPage navigateByUrl this.conversationSelected.conversation_with_fullname ' , this.conversationSelected.conversation_with_fullname);
    console.log('ConversationListPage navigateByUrl this.conversationSelected ', this.conversationSelected)

    this.setUidConvSelected(uidConvSelected, converationType);
    if (checkPlatformIsMobile()) {
      console.log('PLATFORM_MOBILE 1', this.navService);
      let pageUrl = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname + '/' + converationType;
      this.logger.printDebug('pageURL', pageUrl)
      this.router.navigateByUrl(pageUrl);
    } else {
      console.log('PLATFORM_DESKTOP 2', this.navService);
      let pageUrl = 'conversation-detail/' + this.uidConvSelected;
      if (this.conversationSelected && this.conversationSelected.conversation_with_fullname) {
        pageUrl = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname + '/' + converationType;
      }
      console.log('setUidConvSelected navigateByUrl--->: ', pageUrl);
      this.router.navigateByUrl(pageUrl);
    }
  }


  /**
   * ::: onOpenContactsDirectory :::
   * apro pagina elenco users
   * (metodo richiamato da html)
   */
  openContactsDirectory(event: any) {
    const TOKEN = this.tiledeskAuthService.getTiledeskToken();
    console.log('openContactsDirectory', TOKEN);
    if (checkPlatformIsMobile()) {
      presentModal(this.modalController, ContactsDirectoryPage, { token: TOKEN });
    } else {
      this.navService.push(ContactsDirectoryPage, { token: TOKEN });
    }
  }

  /** */
  closeContactsDirectory() {
    try {
      closeModal(this.modalController);
    } catch (err) {
      console.error('-> error:', err);
    }
  }

  /**
   * ::: onOpenProfileInfo :::
   * apro pagina profilo
   * (metodo richiamato da html)
   */
  openProfileInfo(event: any) {
    const TOKEN = this.messagingAuthService.getToken();
    console.log('open ProfileInfoPage', TOKEN);
    if (checkPlatformIsMobile()) {
      presentModal(this.modalController, ProfileInfoPage, { token: TOKEN })
    } else {
      this.navService.push(ProfileInfoPage, { token: TOKEN })
    }
  }


  // ---------------------------------------------------------------------------------
  // nk Commentanto - nn sembra usato
  // ---------------------------------------------------------------------------------
  /**
   * ::: openMessageList :::
   * 1 - cerco conv con id == this.uidConvSelected e imposto select a FALSE
   * 2 - cerco conv con id == nw uidConvSelected se esiste:
   * 2.1 - imposto status a 0 come letto
   * 2.2 - seleziono conv selected == TRUE
   * 2.3 - imposto nw uidConvSelected come this.uidConvSelected
   * 2.4 - apro conv
   * 3 salvo id conv nello storage
   */
  // is_new lo cambio a false quando leggo tutti i messaggi della conversazione,
  // cioè quando scatta l evento che indica che sono al bottom della pagina

  // openMessageList(type?: string) {
  //   const that = this;
  //   console.log('openMessageList:: >>>> conversationSelected ', that.uidConvSelected);
  //   // if the conversation from the isConversationClosingMap is waiting to be closed
  //   // deny the click on the conversation
  //   if (this.conversationsHandlerService.getClosingConversation(this.uidConvSelected)) { return; }

  //   setTimeout(() => {
  //     const conversationSelected = that.conversations.find(item => item.uid === that.uidConvSelected);
  //     if (conversationSelected) {
  //       // conversationSelected.is_new = false;
  //       // conversationSelected.status = '0';
  //       // conversationSelected.selected = true;
  //       // that.navProxy.pushDetail(DettaglioConversazionePage, {
  //       //   conversationSelected: conversationSelected,
  //       //   conversationWith: that.uidConvSelected,
  //       //   conversationWithFullname: conversationSelected.conversation_with_fullname,
  //       //   channelType: conversationSelected.channelType
  //       // });
  //       // that.conversationsHandler.setConversationRead(conversationSelected.uid);
  //       that.databaseProvider.setUidLastOpenConversation(that.uidConvSelected);
  //       // that.openDetailsWithState(conversationSelected);
  //       // const urlPage = 'conversation-detail/' + that.uidConvSelected
  //       const urlPage = 'conversation-detail/' + that.uidConvSelected + '/' + conversationSelected.conversation_with_fullname;
  //       // const navigationExtras: NavigationExtras = {
  //       //   state: {
  //       //     conversationSelected: that.conversationSelected
  //       //   }
  //       // };
  //       console.log('1 openPage', urlPage);
  //       this.router.navigateByUrl(urlPage);
  //       // that.navService.openPage(urlPage, ConversationDetailPage, navigationExtras);
  //     } else if (!type) {
  //       if (windowsMatchMedia()) {
  //         // that.navProxy.pushDetail(PlaceholderPage, {});
  //       }
  //     }
  //   }, 0);
  // }
  // ::: ./ openMessageList :::

  // if (checkPlatformIsMobile()) {
  //   this.platformIs = PLATFORM_MOBILE;
  //   console.log('PLATFORM_MOBILE2 navigateByUrl', PLATFORM_MOBILE);
  //   this.router.navigateByUrl(pageUrl);
  //   // this.navService.setRoot(ConversationListPage, {});
  // } else {
  //   console.log('PLATFORM_DESKTOP', this.navService, pageUrl);
  //   this.platformIs = PLATFORM_DESKTOP;
  //   this.navService.setRoot(ConversationListPage, {});

  //   console.log('checkPlatform navigateByUrl', pageUrl);
  //   this.router.navigateByUrl(pageUrl);

  //   const DASHBOARD_URL = this.appConfigProvider.getConfig().dashboardUrl;
  //   createExternalSidebar(this.renderer, DASHBOARD_URL);
  // }


  /**
   * ::: onCloseConversation :::
   * chiudo conversazione
   * (metodo richiamato da html) 
   * the conversationId is:
   * - se è una conversazione diretta: elimino conversazione 
   * - se è una conversazione di gruppo: chiudo conversazione 
   * @param conversation 
   * https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
   */

  onCloseConversation(conversation: ConversationModel) {

    // -------------------------------------------------------------------------------------
    // Fix the display of the message "No conversation yet" when a conversation is archived 
    // but there are others in the list (happens when loadingIsActive is set to false because 
    // when is called the initConversationsHandler method there is not conversations)
    // -------------------------------------------------------------------------------------
    this.loadingIsActive = false;
    // console.log('CONVS - CONV-LIST-PAGE onCloseConversation CONVS: ', conversation)
    this.logger.printDebug('CONVS - CONV-LIST-PAGE onCloseConversation loadingIsActive: ', this.loadingIsActive)

    // --------------------------------------------------------------
    // To display "No conversation yet" MESSAGE in conversazion list
    // -------------------------------------------------------------- 
    // if (this.conversations.length === 0) {
    //   this.loadingIsActive = false;
    // }


    const conversationId = conversation.uid;

    this.logger.printDebug('CONV-LIST-PAGE onCloseConversation conversationId: ', conversationId)
    const conversationId_segments = conversationId.split('-');
    this.logger.printDebug('ConversationListPage - conversationId_segments: ', conversationId_segments);
    const project_id = conversationId_segments[2]
    this.logger.printDebug('ConversationListPage - conversationWith_segments project_id: ', project_id);

    if (conversationId.startsWith("support-group")) {

      // const projectId = conversation.attributes.projectId
      const tiledeskToken = this.tiledeskAuthService.getTiledeskToken();
      this.logger.printDebug('CONV-LIST-PAGE onCloseConversation projectId: ', project_id)
      // console.log('CONV-LIST-PAGE onCloseConversation tiledeskToken: ', tiledeskToken)
      this.tiledeskService.closeSupportGroup(tiledeskToken, project_id, conversationId).subscribe(res => {
        this.logger.printDebug('CONV-LIST-PAGE onCloseConversation closeSupportGroup RES', res);


      }, (error) => {
        console.log('CONV-LIST-PAGE onCloseConversation closeSupportGroup - ERROR  ', error);

      }, () => {
        this.logger.printDebug('CONV-LIST-PAGE onCloseConversation closeSupportGroup * COMPLETE *');
        this.logger.printDebug('CONVS - onCloseConversation (closeSupportGroup) CONVS ', this.conversations)
        this.logger.printDebug('CONVS - onCloseConversation (closeSupportGroup) CONVS LENGHT ', this.conversations.length)
      });
    } else {
      const that = this
      // questo se è direct o group-
      // this.conversationsHandlerService.archiveConversation(conversationId, function (response) {
      //   console.log('CONVS archiveConversation (direct o group-) response ', response);

      //   if (response == 'success') {
      //     console.log('CONVS - CONVERSATION-LIST-PAGE CONVS (archiveConversation) ++++', that.conversations)
      //     console.log('CONVS - CONVERSATION-LIST-PAGE CONVS LENGHT (archiveConversation) ++++', that.conversations.length)
      //   }
      // });

      this.conversationsHandlerService.archiveConversation(conversationId)


    }









    // var isSupportConversation = conversationId.startsWith("support-group");
    // if (!isSupportConversation) {
    //   this.deleteConversation(conversationId, function (result, data) {
    //     if (result === 'success') {
    //       console.log("ListaConversazioniPage::closeConversation::deleteConversation::response", data);
    //     } else if (result === 'error') {
    //       console.error("ListaConversazioniPage::closeConversation::deleteConversation::error", data);
    //     }
    //   });
    // } else {
    //   this.closeSupportGroup(conversationId, function (result: string, data: any) {
    //     if (result === 'success') {
    //       console.log("ListaConversazioniPage::closeConversation::closeSupportGroup::response", data);
    //     } else if (result === 'error') {
    //       console.error("ListaConversazioniPage::closeConversation::closeSupportGroup::error", data);
    //     }
    //   });
    // }
  }

  /**
   * ::: openArchivedConversationsPage :::
   * Open the archived conversations page
   * (metodo richiamato da html)
   */
  openArchivedConversationsPage() {
    this.logger.printDebug('openArchivedConversationsPage');
    // this.router.navigate(['/']);
    // this.navCtrl.push(ArchivedConversationsPage, {
    //   'archivedConversations': this.archivedConversations,
    //   'tenant': this.tenant,
    //   'loggedUser': this.loggedUser
    // });
  }


  // info page
  returnCloseInfoPage() {
    this.logger.printDebug('returnCloseInfoPage');
    // this.isShowMenuPage = false;
    this.initialize();

  }

  public generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }


}

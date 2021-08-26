import { URL_SOUND_LIST_CONVERSATION } from './../chat21-core/utils/constants';
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';

import { Component, ViewChild, NgZone, OnInit, HostListener, ElementRef, Renderer2, } from '@angular/core';
import { Config, Platform, IonRouterOutlet, IonSplitPane, NavController, MenuController, AlertController, IonNav, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';

import * as firebase from 'firebase/app';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { TranslateService } from '@ngx-translate/core';

// services
import { AppConfigProvider } from './services/app-config';
// import { UserService } from './services/user.service';
// import { CurrentUserService } from './services/current-user/current-user.service';
import { EventsService } from './services/events-service';
import { MessagingAuthService } from '../chat21-core/providers/abstract/messagingAuth.service';
import { PresenceService } from '../chat21-core/providers/abstract/presence.service';
import { TypingService } from '../chat21-core/providers/abstract/typing.service';
import { UploadService } from '../chat21-core/providers/abstract/upload.service';
// import { ChatPresenceHandler} from './services/chat-presence-handler';
import { NavProxyService } from './services/nav-proxy.service';
import { ChatManager } from 'src/chat21-core/providers/chat-manager';
// import { ChatConversationsHandler } from './services/chat-conversations-handler';
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';

// pages
import { LoginPage } from './pages/authentication/login/login.page';
import { ConversationListPage } from './pages/conversations-list/conversations-list.page';

// utils
import { createExternalSidebar, checkPlatformIsMobile, isGroup } from '../chat21-core/utils/utils';
import { STORAGE_PREFIX, PLATFORM_MOBILE, PLATFORM_DESKTOP, CHAT_ENGINE_FIREBASE, AUTH_STATE_OFFLINE, AUTH_STATE_ONLINE } from '../chat21-core/utils/constants';
import { environment } from '../environments/environment';
import { UserModel } from '../chat21-core/models/user';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
// FCM
import { NotificationsService } from 'src/chat21-core/providers/abstract/notifications.service';
import { getImageUrlThumbFromFirebasestorage } from 'src/chat21-core/utils/utils-user';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent implements OnInit {
  @ViewChild('sidebarNav', { static: false }) sidebarNav: IonNav;
  @ViewChild('detailNav', { static: false }) detailNav: IonRouterOutlet;

  private subscription: Subscription;
  public sidebarPage: any;
  public notificationsEnabled: boolean;
  public zone: NgZone;
  private platformIs: string;
  private doitResize: any;
  private timeModalLogin: any;
  public tenant: string;
  public authModal: any;

  private audio: any;
  private setIntervalTime: any;
  private setTimeoutSound: any;
  private isTabVisible: boolean = true;
  private tabTitle: string;
  private logger: LoggerService = LoggerInstance.getInstance();
  public toastMsg: string;
  private modalOpen: boolean = false;
  private hadBeenCalledOpenModal: boolean = false;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private appConfigProvider: AppConfigProvider,
    private events: EventsService,
    public config: Config,
    public chatManager: ChatManager,
    public translate: TranslateService,
    public alertController: AlertController,
    public navCtrl: NavController,
    // public userService: UserService,
    // public currentUserService: CurrentUserService,
    public modalController: ModalController,
    public messagingAuthService: MessagingAuthService,
    public tiledeskAuthService: TiledeskAuthService,
    public presenceService: PresenceService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private navService: NavProxyService,
    // public chatPresenceHandler: ChatPresenceHandler,
    public typingService: TypingService,
    public uploadService: UploadService,
    public appStorageService: AppStorageService,

    // public chatConversationsHandler: ChatConversationsHandler,
    public conversationsHandlerService: ConversationsHandlerService,
    public archivedConversationsHandlerService: ArchivedConversationsHandlerService,
    private translateService: CustomTranslateService,
    public notificationsService: NotificationsService,
    public toastController: ToastController
  ) {

    const appconfig = appConfigProvider.getConfig();
    this.logger.info('[APP-COMP] appconfig: ', appconfig) 
    this.logger.info('[APP-COMP] logLevel: ', appconfig.logLevel);
    this.tenant = appconfig.firebaseConfig.tenant;
    this.logger.info('[APP-COMP] appconfig firebaseConfig tenant: ', this.tenant) 

    // let loggingLevel = null
    // if (appconfig.logLevel) {
      // if (appconfig.logLevel === 'Error') {
      //   loggingLevel = 0
      // } else if (appconfig.logLevel === 'Warn') {
      //   loggingLevel = 1
      // } else if (appconfig.logLevel === 'Info') {
      //   loggingLevel = 2
      // } else if (appconfig.logLevel === 'Debug') {
      //   loggingLevel = 3
      // }

      // this.logger.setLoggerConfig(true, loggingLevel)
      this.logger.setLoggerConfig(true, appconfig.logLevel)
    // }
    if (!this.platform.is('desktop')) {
      this.splashScreen.show();
    }
  }


  /**
   */
  ngOnInit() {
    this.logger.info('[APP-COMP] ngOnInit -->', this.route.snapshot.params);
    this.tabTitle = document.title
    this.initializeApp();
  }


  /** */
  initializeApp() {
    this.notificationsEnabled = true;
    this.zone = new NgZone({}); // a cosa serve?
    this.platform.ready().then(() => {
      this.setLanguage();

      if (this.splashScreen) {
        this.splashScreen.hide();
      }
      this.statusBar.styleDefault();
      this.navService.init(this.sidebarNav, this.detailNav);
      this.appStorageService.initialize(environment.storage_prefix, environment.authPersistence, '')
      this.tiledeskAuthService.initialize(this.appConfigProvider.getConfig().apiUrl);
      this.messagingAuthService.initialize();

      // this.currentUserService.initialize();
      this.chatManager.initialize();
      this.presenceService.initialize(this.tenant);
      this.typingService.initialize(this.tenant);
      const pushEngine = this.appConfigProvider.getConfig().pushEngine
      if (pushEngine && pushEngine !== 'none') {
        this.notificationsService.initialize(this.tenant)
      }
      this.uploadService.initialize();

      this.initAuthentication();
      this.initSubscriptions();
      this.initAudio()

      this.logger.debug('[APP-COMP] initializeApp:: ', this.sidebarNav, this.detailNav);
      // this.listenToLogoutEvent()
      this.translateToastMessage();
    });
  }

  translateToastMessage() {
    this.translate.get('AnErrorOccurredWhileUnsubscribingFromNotifications')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // this.logger.debug('FIREBASE-NOTIFICATION >>>> (APP-COMPONENT) text: ', text)
        this.toastMsg = text;
        // this.logger.debug('FIREBASE-NOTIFICATION >>>> (APP-COMPONENT): this.toastMsg', this.toastMsg)
      });
  }

  /***************************************************+*/
  /**------- AUTHENTICATION FUNCTIONS --> START <--- +*/
  private initAuthentication() {
    const tiledeskToken = this.appStorageService.getItem('tiledeskToken')
    const currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
    if (tiledeskToken) {
      this.logger.debug('[APP-COMP] >>> I LOG IN WITH A TOKEN EXISTING IN THE LOCAL STORAGE OR WITH A TOKEN PASSED IN THE URL PARAMETERS <<<')
      this.tiledeskAuthService.signInWithCustomToken(tiledeskToken).then(user => {
        this.messagingAuthService.createCustomToken(tiledeskToken)
      }).catch(error => { this.logger.error('[APP-COMP] SIGNINWITHCUSTOMTOKEN error::' + error) })
    } else {
      this.logger.warn('[APP-COMP] >>> I AM NOT LOGGED IN <<<')
      const that = this;
      clearTimeout(this.timeModalLogin);
      this.timeModalLogin = setTimeout(() => {
        if (!this.hadBeenCalledOpenModal) {
        this.authModal = this.presentModal('initAuthentication');
        this.hadBeenCalledOpenModal = true;
        }
      }, 1000);
    }

    this.route.queryParams.subscribe(params => {
      if (params.jwt) {
        this.tiledeskAuthService.signInWithCustomToken(params.jwt).then(user => {
          this.messagingAuthService.createCustomToken(params.jwt)
        }).catch(error => { this.logger.error('[APP-COMP] SIGNINWITHCUSTOMTOKEN error::' + error) })
      }
    });
  }

  authenticate() {
    let token = this.appStorageService.getItem('tiledeskToken');
    this.logger.debug('[APP-COMP] ***** authenticate - stored token *****', token);
    if (!token) {
      this.goOffLine()
    }
  }

  /**
   * goOnLine:
   * 1 - nascondo splashscreen
   * 2 - recupero il tiledeskToken e lo salvo in chat manager
   * 3 - carico in d
   * @param user
   */
  goOnLine = () => {
    clearTimeout(this.timeModalLogin);
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken();
    const currentUser = this.tiledeskAuthService.getCurrentUser();
    // this.logger.printDebug('APP-COMP - goOnLine****', currentUser);
    this.logger.debug('[APP-COMP] - goOnLine****', currentUser);
    this.chatManager.setTiledeskToken(tiledeskToken);

    // ----------------------------------------------
    // PUSH NOTIFICATIONS
    // ----------------------------------------------
    const pushEngine = this.appConfigProvider.getConfig().pushEngine
    if (pushEngine && pushEngine !== 'none') {
      this.notificationsService.getNotificationPermissionAndSaveToken(currentUser.uid);
    }

    if (currentUser) {
      this.chatManager.setCurrentUser(currentUser);
      this.presenceService.setPresence(currentUser.uid);
      this.initConversationsHandler(currentUser.uid);
      this.initArchivedConversationsHandler(currentUser.uid);
    }
    this.checkPlatform();
    try {
      this.logger.debug('[APP-COMP] ************** closeModal', this.authModal);
      if (this.authModal) {
        this.closeModal();
      }
    } catch (err) {
      this.logger.error('[APP-COMP] -> error:', err);
    }
    this.chatManager.startApp();
  }

  goOffLine = () => {
    this.logger.debug('[APP-COMP] ************** goOffLine:', this.authModal);
    // this.conversationsHandlerService.conversations = [];
  
    this.chatManager.setTiledeskToken(null);
    this.chatManager.setCurrentUser(null);
    this.chatManager.goOffLine();

    this.router.navigateByUrl('conversation-detail/'); //redirect to basePage
    const that = this;
    clearTimeout(this.timeModalLogin);
    this.timeModalLogin = setTimeout(() => {
      if (!this.hadBeenCalledOpenModal) {
      this.authModal = this.presentModal('goOffLine');
      this.hadBeenCalledOpenModal = true
      }
    }, 1000);
  }
  /**------- AUTHENTICATION FUNCTIONS --> END <--- +*/
  /***************************************************+*/

  /**
   * ::: initConversationsHandler :::
   * inizializzo chatConversationsHandler e archviedConversationsHandler
   * recupero le conversazioni salvate nello storage e pubblico l'evento loadedConversationsStorage
   * imposto uidConvSelected in conversationHandler e chatArchivedConversationsHandler
   * e mi sottoscrivo al nodo conversazioni in conversationHandler e chatArchivedConversationsHandler (connect)
   * salvo conversationHandler in chatManager
   */
  // initConversationsHandler(userId: string) {
  //   const keys = [
  //     'LABEL_TU'
  //   ];
  //   const translationMap = this.translateService.translateLanguage(keys);

  //   this.logger.debug('initConversationsHandler ------------->', userId);
  //   // 1 - init chatConversationsHandler and  archviedConversationsHandler
  //   this.conversationsHandlerService.initialize(userId, translationMap);
  //   // 2 - get conversations from storage
  //   // this.chatConversationsHandler.getConversationsFromStorage();
  //   // 5 - connect conversationHandler and archviedConversationsHandler to firebase event (add, change, remove)
  //   this.conversationsHandlerService.connect();
  //   // 6 - save conversationHandler in chatManager
  //   this.chatManager.setConversationsHandler(this.conversationsHandlerService);
  // }

  /** */
  setLanguage() {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.logger.debug('[APP-COMP] navigator.language: ', navigator.language);
    let language;
    if (navigator.language.indexOf('-') !== -1) {
      language = navigator.language.substring(0, navigator.language.indexOf('-'));
    } else if (navigator.language.indexOf('_') !== -1) {
      language = navigator.language.substring(0, navigator.language.indexOf('_'));
    } else {
      language = navigator.language;
    }
    this.translate.use(language);
  }

  checkPlatform() {
    this.logger.debug('[APP-COMP] checkPlatform');
    // let pageUrl = '';
    // try {
    //   const pathPage = this.route.snapshot.firstChild.routeConfig.path;
    //   this.route.snapshot.firstChild.url.forEach(element => {
    //     pageUrl += '/' + element.path;
    //   });
    // } catch (error) {
    //   this.logger.debug('error', error);
    // }
    // this.logger.debug('checkPlatform pathPage: ', pageUrl);
    // if (!pageUrl || pageUrl === '') {
    //   pageUrl = '/conversations-list';
    // }

    if (checkPlatformIsMobile()) {
      this.platformIs = PLATFORM_MOBILE;
      const IDConv = this.route.snapshot.firstChild.paramMap.get('IDConv');
      this.logger.debug('[APP-COMP] PLATFORM_MOBILE2 navigateByUrl', PLATFORM_MOBILE, this.route.snapshot);
      if (!IDConv) {
        this.router.navigateByUrl('conversations-list')
      }
      // this.router.navigateByUrl(pageUrl);
      // this.navService.setRoot(ConversationListPage, {});
    } else {
      this.platformIs = PLATFORM_DESKTOP;
      this.logger.debug('[APP-COMP] PLATFORM_DESKTOP ', this.navService);
      this.navService.setRoot(ConversationListPage, {});

      const IDConv = this.route.snapshot.firstChild.paramMap.get('IDConv');
      const FullNameConv = this.route.snapshot.firstChild.paramMap.get('FullNameConv');
      const Convtype = this.route.snapshot.firstChild.paramMap.get('Convtype');


      let pageUrl = 'conversation-detail/'
      if (IDConv && FullNameConv) {
        pageUrl += IDConv + '/' + FullNameConv + '/' + Convtype
      }

      this.router.navigateByUrl(pageUrl);


      // const DASHBOARD_URL = this.appConfigProvider.getConfig().DASHBOARD_URL;
      // createExternalSidebar(this.renderer, DASHBOARD_URL);

      // // FOR REALTIME TESTING
      // createExternalSidebar(this.renderer, 'http://localhost:4203');

    }
  }

  /** */
  // showNavbar() {
  //   let TEMP = location.search.split('navBar=')[1];
  //   if (TEMP) { this.isNavBar = TEMP.split('&')[0]; }
  // }

  /** */
  hideAlert() {
    this.logger.debug('[APP-COMP] hideAlert');
    this.notificationsEnabled = true;
  }

  private initAudio() {
    // SET AUDIO
    this.audio = new Audio();
    this.audio.src = URL_SOUND_LIST_CONVERSATION;
    this.audio.load();
  }

  private manageTabNotification() {
    if (!this.isTabVisible) {
      // TAB IS HIDDEN --> manage title and SOUND

      let badgeNewConverstionNumber = this.conversationsHandlerService.countIsNew()
      badgeNewConverstionNumber > 0 ? badgeNewConverstionNumber : badgeNewConverstionNumber = 1
      document.title = "(" + badgeNewConverstionNumber + ") " + this.tabTitle

      clearInterval(this.setIntervalTime)
      const that = this
      this.setIntervalTime = setInterval(function () {
        if (document.title.charAt(0) === '(') {
          document.title = that.tabTitle
        } else {
          document.title = "(" + badgeNewConverstionNumber + ") " + that.tabTitle;
        }
      }, 1000);
      this.soundMessage()
    }
  }

  soundMessage() {
    const that = this;
    // this.audio = new Audio();
    // // this.audio.src = '/assets/sounds/pling.mp3';
    // this.audio.src = URL_SOUND_LIST_CONVERSATION;
    // this.audio.load();
    this.logger.debug('[APP-COMP] conversation play', this.audio);
    clearTimeout(this.setTimeoutSound);
    this.setTimeoutSound = setTimeout(function () {
      that.audio.play().then(() => {
        that.logger.debug('[APP-COMP] ****** soundMessage played *****');
      }).catch((error: any) => {
        that.logger.debug('[APP-COMP] ***soundMessage error*', error);
      });
    }, 1000);
  }
  /**---------------- SOUND FUNCTIONS --> END <--- +*/
  /***************************************************+*/


  // BEGIN SUBSCRIPTIONS //
  /** */
  initSubscriptions() {
    const that = this;

    this.messagingAuthService.BSAuthStateChanged.subscribe((state: any) => {
      this.logger.debug('[APP-COMP] ***** BSAuthStateChanged ***** state', state);
      if (state && state === AUTH_STATE_ONLINE) {
        const user = that.tiledeskAuthService.getCurrentUser();
        that.goOnLine();
      } else if (state === AUTH_STATE_OFFLINE) {
        // that.goOffLine();
        that.authenticate() //se c'è un tiledeskToken salvato, allora aspetta, altrimenti vai offline
      }
    });

    // this.authService.BSSignOut.subscribe((data: any) => {
    //   this.logger.debug('***** BSSignOut *****', data);
    //   if (data) {
    //     that.presenceService.removePresence();
    //   }
    // });


    // this.currentUserService.BScurrentUser.subscribe((currentUser: any) => {
    //   this.logger.debug('***** app comp BScurrentUser *****', currentUser);
    //   if (currentUser) {
    //     that.chatManager.setCurrentUser(currentUser);
    //   }
    // });


    // this.events.subscribe('go-off-line', this.goOffLine);
    // this.events.subscribe('go-on-line', this.goOnLine);
    // this.events.subscribe('sign-in', this.signIn);
    // dopo il login quando ho completato il profilo utente corrente
    // this.events.subscribe('loaded-current-user', null);
    // this.events.subscribe('firebase-sign-in-with-custom-token', this.firebaseSignInWithCustomToken);
    // this.events.subscribe('firebase-create-user-with-email-and-password', this.firebaseCreateUserWithEmailAndPassword);
    // this.events.subscribe('firebase-current-user-delete', this.firebaseCurrentUserDelete);
    // this.events.subscribe('firebase-send-password-reset-email', this.firebaseSendPasswordResetEmail);
    // this.events.subscribe('firebase-sign-out', this.firebaseSignOut);
    this.events.subscribe('uidConvSelected:changed', this.subscribeChangedConversationSelected);
    this.events.subscribe('profileInfoButtonClick:logout', this.subscribeProfileInfoButtonLogOut);

    this.conversationsHandlerService.conversationAdded.subscribe((conversation: ConversationModel) => {
      this.logger.log('[APP-COMP] ***** conversationsAdded *****', conversation);
      // that.conversationsChanged(conversations);
      this.manageTabNotification()
    });
    this.conversationsHandlerService.conversationChanged.subscribe((conversation: ConversationModel) => {
      this.logger.log('[APP-COMP] ***** subscribeConversationChanged *****', conversation);
      // that.conversationsChanged(conversations);
      this.manageTabNotification();
    });
  }

  /**
   * ::: subscribeChangedConversationSelected :::
   * evento richiamato quando si seleziona un utente nell'elenco degli user
   * apro dettaglio conversazione
   */
  subscribeChangedConversationSelected = (user: UserModel, type: string) => {
    this.logger.info('[APP-COMP] subscribeUidConvSelectedChanged navigateByUrl', user, type);
    // this.router.navigateByUrl('conversation-detail/' + user.uid + '?conversationWithFullname=' + user.fullname);
    this.router.navigateByUrl('conversation-detail/' + user.uid + '/' + user.fullname + '/' + type);
  }

  subscribeProfileInfoButtonLogOut = (hasClickedLogout) => {
    this.logger.log('[APP-COMP] FIREBASE-NOTIFICATION >>>>  subscribeProfileInfoButtonLogOut ');
    // if (hasClickedLogout === true) {
    //   this.removePresenceAndLogout()
    // }

    if (hasClickedLogout === true) {
      // ----------------------------------------------
      // PUSH NOTIFICATIONS
      // ----------------------------------------------
      const that = this;
      const pushEngine = this.appConfigProvider.getConfig().pushEngine
      if (pushEngine && pushEngine !== 'none') {
        this.notificationsService.removeNotificationsInstance(function (res) {
          that.logger.log('[APP-COMP] FIREBASE-NOTIFICATION >>>>  removeNotificationsInstance > CALLBACK RES', res);

          if (res === 'success') {
            that.removePresenceAndLogout();
          } else {
            that.removePresenceAndLogout();
            that.presentToast();
          }
        })
      }

    }
  }

  private async presentModal(calledby): Promise<any> {
    this.logger.log('[APP-COMP] presentModal calledby', calledby, '- hadBeenCalledOpenModal: ', this.hadBeenCalledOpenModal );
    const attributes = { tenant: this.tenant, enableBackdropDismiss: false };
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: LoginPage,
        componentProps: attributes,
        swipeToClose: false,
        backdropDismiss: false
      });
    modal.onDidDismiss().then((detail: any) => {
      this.hadBeenCalledOpenModal = false
      this.logger.log('[APP-COMP] presentModal onDidDismiss detail.data ', detail.data);
      // this.checkPlatform();
      if (detail !== null) {
        //  this.logger.debug('The result: CHIUDI!!!!!', detail.data);
      }
    });
    // await modal.present();
    // modal.onDidDismiss().then((detail: any) => {
    //    this.logger.debug('The result: CHIUDI!!!!!', detail.data);
    //   //  this.checkPlatform();
    //    if (detail !== null) {
    //     //  this.logger.debug('The result: CHIUDI!!!!!', detail.data);
    //    }
    // });
    return await modal.present();
  }

  private async closeModal() {
    this.logger.debug('[APP-COMP] closeModal', this.modalController);
    this.logger.debug('[APP-COMP] closeModal .getTop()', this.modalController.getTop());
    await this.modalController.getTop();
    this.modalController.dismiss({ confirmed: true });
  }


  // listenToLogoutEvent() {
  //   this.events.subscribe('profileInfoButtonClick:logout', (hasclickedlogout) => {
  //     this.logger.debug('[APP-COMP] hasclickedlogout', hasclickedlogout);
  //     if (hasclickedlogout === true) {
  //       // ----------------------------------------------
  //       // PUSH NOTIFICATIONS
  //       // ----------------------------------------------
  //       const that = this;
  //       const pushEngine = this.appConfigProvider.getConfig().pushEngine
  //       if( pushEngine && pushEngine !== 'none'){
  //         this.notificationsService.removeNotificationsInstance(function (res) {
  //           that.logger.debug('[APP-COMP] FIREBASE-NOTIFICATION >>>>  removeNotificationsInstance > CALLBACK RES', res);

  //           if (res === 'success') {
  //             that.removePresenceAndLogout();
  //           } else {
  //             that.removePresenceAndLogout();
  //             that.presentToast();
  //           }
  //         })
  //       }

  //     }
  //   });
  // }


  async presentToast() {
    const toast = await this.toastController.create({
      message: this.toastMsg,
      duration: 2000
    });
    toast.present();
  }

  removePresenceAndLogout() {
    this.logger.debug('[APP-COMP] FIREBASE-NOTIFICATION >>>> calling removePresenceAndLogout');
    this.presenceService.removePresence();
    this.tiledeskAuthService.logOut()
    this.messagingAuthService.logout()
  }

  private initConversationsHandler(userId: string) {
    const keys = ['YOU'];
    const translationMap = this.translateService.translateLanguage(keys);

    this.logger.debug('[APP-COMP] initConversationsHandler ------------->', userId, this.tenant);
    // 1 - init chatConversationsHandler and  archviedConversationsHandler
    this.conversationsHandlerService.initialize(this.tenant, userId, translationMap);

    // this.subscribeToConvs()
    this.conversationsHandlerService.subscribeToConversations(() => {
      this.logger.debug('[APP-COMP]-CONVS- INIT CONV')
      const conversations = this.conversationsHandlerService.conversations;
      this.logger.debug('[APP-COMP]-CONVS - INIT CONV CONVS', conversations)

      // this.logger.printDebug('SubscribeToConversations (convs-list-page) - conversations')
      if (!conversations || conversations.length === 0) {
        // that.showPlaceholder = true;
        this.logger.debug('[APP-COMP]-CONVS - INIT CONV CONVS 2', conversations)
        this.events.publish('appcompSubscribeToConvs:loadingIsActive', false);
      }
    });

  }

  private initArchivedConversationsHandler(userId: string) {
    const keys = ['YOU'];

    const translationMap = this.translateService.translateLanguage(keys);

    this.logger.debug('[APP-COMP] initArchivedConversationsHandler ------------->', userId, this.tenant);
    // 1 - init  archviedConversationsHandler
    this.archivedConversationsHandlerService.initialize(this.tenant, userId, translationMap);
  }

  // BEGIN RESIZE FUNCTIONS //
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const that = this;
    // this.logger.debug('this.doitResize)', this.doitResize)
    clearTimeout(this.doitResize);
    this.doitResize = setTimeout(() => {
      let platformIsNow = PLATFORM_DESKTOP;
      if (checkPlatformIsMobile()) {
        platformIsNow = PLATFORM_MOBILE;
      }
      if (!this.platformIs || this.platformIs === '') {
        this.platformIs = platformIsNow;
      }
      this.logger.debug('[APP-COMP] onResize width::::', window.innerWidth);
      this.logger.debug('[APP-COMP] onResize width:::: platformIsNow', platformIsNow);
      this.logger.debug('[APP-COMP] onResize width:::: platformIsNow this.platformIs', this.platformIs);
      if (platformIsNow !== this.platformIs) {
        window.location.reload();
      }
    }, 500);
  }
  // END RESIZE FUNCTIONS //

  @HostListener('document:visibilitychange', [])
  visibilitychange() {
    // this.logger.debug("document TITLE", document.hidden, document.title);
    if (document.hidden) {
      this.isTabVisible = false
    } else {
      // TAB IS ACTIVE --> restore title and DO NOT SOUND
      clearInterval(this.setIntervalTime)
      this.isTabVisible = true;
      document.title = this.tabTitle;
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorageChanged(event: any) {
    if (this.appStorageService.getItem('tiledeskToken') === null) {
      this.tiledeskAuthService.logOut()
      this.messagingAuthService.logout();
    }
  }

}

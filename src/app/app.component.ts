import { Component, ViewChild, NgZone, OnInit, HostListener, ElementRef, Renderer2, } from '@angular/core';
import { Config, Platform, IonRouterOutlet, IonSplitPane, NavController, MenuController, AlertController, IonNav } from '@ionic/angular';
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
import { AuthService } from '../chat21-core/providers/abstract/auth.service';
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
import { createExternalSidebar, checkPlatformIsMobile } from '../chat21-core/utils/utils';
import { STORAGE_PREFIX, PLATFORM_MOBILE, PLATFORM_DESKTOP, CHAT_ENGINE_FIREBASE, AUTH_STATE_OFFLINE, AUTH_STATE_ONLINE } from '../chat21-core/utils/constants';
import { environment } from '../environments/environment';
import { UserModel } from '../chat21-core/models/user';

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
    public authService: AuthService,
    public presenceService: PresenceService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private navService: NavProxyService,
    // public chatPresenceHandler: ChatPresenceHandler,
    public typingService: TypingService,
    public uploadService: UploadService,

    // public chatConversationsHandler: ChatConversationsHandler,
    public conversationsHandlerService: ConversationsHandlerService,
    private translateService: CustomTranslateService
  ) {
    console.log('AppComponent');
    console.log('environment  -----> ', environment);
    this.tenant = environment.tenant;
    this.splashScreen.show();
    // if (environment.chatEngine === CHAT_ENGINE_FIREBASE) {
    // this.initFirebase();
    // }

  }



  /**
   */
  ngOnInit() {
    console.log('ngOnInit -->', this.route.snapshot.params);
    this.initializeApp();
  }


  /** */
  initializeApp() {
    this.notificationsEnabled = true;
    this.zone = new NgZone({}); // a cosa serve?
    this.platform.ready().then(() => {
      this.setLanguage();
      this.splashScreen.hide();
      this.statusBar.styleDefault();
      this.navService.init(this.sidebarNav, this.detailNav);
      this.authService.initialize('');
      // this.currentUserService.initialize();
      this.chatManager.initialize();
      this.presenceService.initialize();
      this.typingService.initialize();
      this.uploadService.initialize();
      this.initSubscriptions();
      console.log('initializeApp:: ', this.sidebarNav, this.detailNav);
    });
  }

  /**
   * initFirebase
   */
  initFirebase() {
    console.log('initFirebase', this.appConfigProvider.getConfig());
    if (!this.appConfigProvider.getConfig().firebaseConfig || this.appConfigProvider.getConfig().firebaseConfig.apiKey === 'CHANGEIT') {
      // tslint:disable-next-line: max-line-length
      throw new Error('firebase config is not defined. Please create your firebase-config.json. See the Chat21-Web_widget Installation Page');
    }
    firebase.initializeApp(this.appConfigProvider.getConfig().firebaseConfig);
  }

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

  //   console.log('initConversationsHandler ------------->', userId);
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
    console.log('navigator.language: ', navigator.language);
    let language;
    if (navigator.language.indexOf('-') !== -1) {
      language = navigator.language.substring(0, navigator.language.indexOf('-'));
    } else if (navigator.language.indexOf('_') !== -1) {
      language = navigator.language.substring(0, navigator.language.indexOf('_'));
    } else {
      language = navigator.language;
    }
    this.translate.use(language);
    console.log('language: ', language);
  }

  checkPlatform() {
    console.log('checkPlatform');
    let pageUrl = '';
    try {
      const pathPage = this.route.snapshot.firstChild.routeConfig.path;
      this.route.snapshot.firstChild.url.forEach(element => {
        pageUrl += '/' + element.path;
      });
    } catch (error) {
      console.log('error', error);
    }
    console.log('checkPlatform pathPage: ', pageUrl);
    if (!pageUrl || pageUrl === '') {
      pageUrl = '/conversations-list';
    }

    if (checkPlatformIsMobile()) {
      this.platformIs = PLATFORM_MOBILE;
      console.log('PLATFORM_MOBILE2 navigateByUrl', PLATFORM_MOBILE);
      // this.router.navigateByUrl(pageUrl);
      // this.navService.setRoot(ConversationListPage, {});
    } else {
      console.log('PLATFORM_DESKTOP ', this.navService, pageUrl);
      this.platformIs = PLATFORM_DESKTOP;
      this.navService.setRoot(ConversationListPage, {});
      console.log('checkPlatform navigateByUrl', pageUrl);
      // this.router.navigateByUrl(pageUrl);

      // const DASHBOARD_URL = this.appConfigProvider.getConfig().DASHBOARD_URL;
      // createExternalSidebar(this.renderer, DASHBOARD_URL);
    }
  }




  // BEGIN MY FUNCTIONS //



  /** */
  // showNavbar() {
  //   let TEMP = location.search.split('navBar=')[1];
  //   if (TEMP) { this.isNavBar = TEMP.split('&')[0]; }
  // }



  /** */
  hideAlert() {
    console.log('hideAlert');
    this.notificationsEnabled = true;
  }
  // END MY FUNCTIONS //




  // BEGIN SUBSCRIPTIONS //
  /** */
  initSubscriptions() {
    const that = this;

    this.authService.BSAuthStateChanged.subscribe((state: any) => {
      console.log('APP-COMPONENT ***** BSAuthStateChanged ***** state', state);
      if (state && state === AUTH_STATE_ONLINE) {
        const user = that.authService.getCurrentUser();
        that.goOnLine(user);
      } else if (state === AUTH_STATE_OFFLINE) {
        // that.goOffLine();
        that.authenticate()
      }
    });

    this.authService.BSSignOut.subscribe((data: any) => {
      console.log('***** BSSignOut *****', data);
      if (data) {
        that.presenceService.removePresence();
      }
    });


    // this.currentUserService.BScurrentUser.subscribe((currentUser: any) => {
    //   console.log('***** app comp BScurrentUser *****', currentUser);
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
  }

  authenticate() {
    let token = localStorage.getItem('tiledeskToken');
    console.log('APP-COMPONENT ***** authenticate - stored token *****', token);
    if (token) {
      console.log('APP-COMPONENT ***** authenticate user is logged in');
    } else {
      console.log('APP-COMPONENT ***** authenticate user is NO logged in call goOffLine');
      this.goOffLine()
    }
  }


  /**
   * ::: subscribeChangedConversationSelected :::
   * evento richiamato quando si seleziona un utente nell'elenco degli user
   * apro dettaglio conversazione
   */
  subscribeChangedConversationSelected = (user: UserModel, type: string) => {
    console.log('************** subscribeUidConvSelectedChanged navigateByUrl', user, type);
    // this.router.navigateByUrl('conversation-detail/' + user.uid + '?conversationWithFullname=' + user.fullname);
    this.router.navigateByUrl('conversation-detail/' + user.uid + '/' + user.fullname);
  }



  private async presentModal(): Promise<any> {
    console.log('presentModal');
    const attributes = { tenant: 'tilechat', enableBackdropDismiss: false };
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: LoginPage,
        componentProps: attributes,
        swipeToClose: false,
        backdropDismiss: false
      });
    modal.onDidDismiss().then((detail: any) => {
      console.log('The result: CHIUDI!!!!!', detail.data);
      // this.checkPlatform();
      if (detail !== null) {
        //  console.log('The result: CHIUDI!!!!!', detail.data);
      }
    });
    // await modal.present();
    // modal.onDidDismiss().then((detail: any) => {
    //    console.log('The result: CHIUDI!!!!!', detail.data);
    //   //  this.checkPlatform();
    //    if (detail !== null) {
    //     //  console.log('The result: CHIUDI!!!!!', detail.data);
    //    }
    // });
    return await modal.present();
  }

  private async closeModal() {
    console.log('closeModal', this.modalController);
    await this.modalController.getTop();
    this.modalController.dismiss({ confirmed: true });
  }

  /**
   * goOnLine:
   * 1 - nascondo splashscreen
   * 2 - recupero il tiledeskToken e lo salvo in chat manager
   * 3 - carico in d
   * @param user
   */
  goOnLine = (user: any) => {
    clearTimeout(this.timeModalLogin);
    console.log('************** goOnLine', user);
    const tiledeskToken = this.authService.getTiledeskToken();
    const currentUser = this.authService.getCurrentUser();
    this.chatManager.setTiledeskToken(tiledeskToken);
    this.chatManager.setCurrentUser(currentUser);
    this.presenceService.setPresence(user.uid);
    this.checkPlatform();
    try {
      console.log('************** closeModal', this.authModal);
      if (this.authModal) {
        this.closeModal();
      }
    } catch (err) {
      console.error('-> error:', err);
    }
    this.chatManager.startApp();
  }

  /**
   *
   */
  goOffLine = () => {
    console.log('************** goOffLine:', this.authModal);
    this.chatManager.setTiledeskToken(null);
    this.chatManager.setCurrentUser(null);
    this.chatManager.goOffLine();

    const that = this;
    clearTimeout(this.timeModalLogin);
    this.timeModalLogin = setTimeout(() => {
      this.authModal = this.presentModal();
    }, 1000);
  }

  /** */
  // signIn = (user: any, error: any) => {
  //   console.log('************** signIn:: user:' + user + '  - error: ' + error);
  //   if (error) {
  //     localStorage.removeItem('tiledeskToken');
  //   }
  // }




  /**
   *
   */
  // firebaseSignInWithCustomToken = (response: any, error) => {
  //   console.log('************** firebaseSignInWithCustomToken: ' + response + ' error: ' + error);
  //   try {
  //     closeModal(this.modalController);
  //     this.checkPlatform();
  //   } catch (err) {
  //     console.error('-> error:', err);
  //   }
  // }


  // END SUBSCRIPTIONS //

  // BEGIN RESIZE FUNCTIONS //
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const that = this;
    clearTimeout(this.doitResize);
    this.doitResize = setTimeout(() => {
      let platformIsNow = PLATFORM_DESKTOP;
      if (checkPlatformIsMobile()) {
        platformIsNow = PLATFORM_MOBILE;
      }
      if (!this.platformIs || this.platformIs === '') {
        this.platformIs = platformIsNow;
      }
      console.log('onResize width::::', window.innerWidth);
      console.log('onResize width:::: platformIsNow', platformIsNow);
      console.log('onResize width:::: platformIsNow this.platformIs', this.platformIs);
      if (platformIsNow !== this.platformIs) {
        window.location.reload();
      }
    }, 500);
  }
  // END RESIZE FUNCTIONS //

}

import { Component, ViewChild, NgZone, OnInit, HostListener, ElementRef, Renderer2,  } from '@angular/core';
import { Config, Platform, IonRouterOutlet, IonSplitPane, NavController, MenuController, AlertController, IonNav } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import * as firebase from 'firebase/app';
// import { ListaConversazioniPage } from './pages/lista-conversazioni/lista-conversazioni';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import {NavProxyService} from './services/nav-proxy';
import { MessagingService } from './services/messaging-service';
import { ChatManager } from './services/chat-manager';
import { TranslateService } from '@ngx-translate/core';

import { AppConfigProvider } from './services/app-config';
import { UserService } from './services/user.service';
import { EventsService } from './services/events-service';
import { AuthService } from './services/auth.service';
import { PresenceService } from './services/presence.service';
import { TypingService } from './services/typing.service';


import { ChatPresenceHandler} from './services/chat-presence-handler';

import { NavProxyService } from './services/nav-proxy.service';

import { ModalController } from '@ionic/angular';
// pages
import { LoginPage } from './pages/authentication/login/login.page';

// import { LoginModal } from './modals/authentication/login/login.modal';
// import { ConversationListPage } from './pages/conversations-list/conversations-list.page';
// utils
import { presentModal, closeModal, createExternalSidebar, checkPlatformIsMobile } from './utils/utils';
import { PLATFORM_MOBILE, PLATFORM_DESKTOP } from './utils/constants';
import { ConversationListPage } from './pages/conversations-list/conversations-list.page';

import { environment } from '../environments/environment';
// type NewType = IonRouterOutlet;

// import { Component } from '@angular/core';
// import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  // @ViewChild('masterNav', {static: false}) masterNav: ElementRef;
  // @ViewChild('nav', {static: false}) nav: IonNav;
  @ViewChild('sidebarNav', {static: false}) sidebarNav: IonNav;
  @ViewChild('detailNav', {static: false}) detailNav: IonRouterOutlet;

  sidebarPage: any;
  public notificationsEnabled: boolean;
  public zone: NgZone;
  // public isNavBar: string;

  private platformIs: string;
  private doitResize: any;
  public tenant: string;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private appConfigProvider: AppConfigProvider,
    private msgService: MessagingService,
    private events: EventsService,
    public config: Config,
    public chatManager: ChatManager,
    public translate: TranslateService,
    public alertController: AlertController,
    public navCtrl: NavController,
    public userService: UserService,
    public modalController: ModalController,
    public authService: AuthService,
    public presenceService: PresenceService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private navService: NavProxyService,
    public chatPresenceHandler: ChatPresenceHandler,
    public typingService: TypingService
  ) {
    console.log('AppComponent');
    this.tenant = environment.tenant;
    this.initFirebase();
    this.initializeApp();
    // this.nav.initialize();
  }


  // BEGIN RESIZE FUNCTIONS //
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const that = this;
    clearTimeout(this.doitResize);
    this.doitResize = setTimeout( () => {
      let platformIsNow = PLATFORM_DESKTOP;
      if (checkPlatformIsMobile()) {
        platformIsNow = PLATFORM_MOBILE;
      }
      console.log('onResize width:::: platformIsNow this.platformIs', window.innerWidth, platformIsNow, this.platformIs);
      if ( platformIsNow !== this.platformIs ) {
        window.location.reload();
      }

    }, 500);
  }
  // END RESIZE FUNCTIONS //

  /**
   */
  ngOnInit() {
    // if (!checkPlatformIsMobile()) {
    //   const pathPage = this.route.snapshot.firstChild.params;
    //   console.log('ConversationListPage .conversationWith: ', pathPage);
    //   // if (pathPage === 'conversations-list') {
    //   //   //this.router.navigateByUrl('conversation-detail');
    //   // }
    // }
  }


  /** */
  // onRouterActivate(): void {
  //   this.masterNav.pop().then(() => {
  //     //this hasn't finish to pop, so it goes to the below route... and then pops it
  //     this.navCtrl.navigateRoot(["", { outlets: { detailNav: "path/to/thing"}}]);
  //   });
  // }

  // checkPlatformIsMobile_old() {
  //   const platformList = this.platform.platforms();
  //   console.log('platforms -----------> ', platformList);
  //   if (this.platform.is('desktop')) {
  //     return false;
  //   } else if (this.platform.is('tablet')) {
  //     return false;
  //   } else if (this.platform.is('ios')) {
  //     return true;
  //   } else if (this.platform.is('android')) {
  //     return true;
  //   }
  //   return false;
  // }
  /** */
  initializeApp() {
    this.notificationsEnabled = true;
    this.zone = new NgZone({});

    this.platform.ready().then(() => {
      this.setLanguage();
      // this.showNavbar();
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // init
     
      this.msgService.initialize();
      this.authService.initialize(this.tenant);
      this.userService.initialize(this.tenant);
      this.presenceService.initialize(this.tenant);
      this.typingService.initialize(this.tenant);

      this.navService.init(this.sidebarNav, this.detailNav);
      this.chatManager.initialize();
      this.initSubscriptions();
    });
  }

  checkPlatform() {
    console.log('checkPlatform');
    if (checkPlatformIsMobile()) {
      this.platformIs = PLATFORM_MOBILE;
      console.log('PLATFORM_MOBILE2', PLATFORM_MOBILE);
      this.router.navigateByUrl('conversations-list');
    } else {
      console.log('PLATFORM_DESKTOP', this.navService);
      this.platformIs = PLATFORM_DESKTOP;
      this.navService.setRoot(ConversationListPage, {});
      const pathPage = this.route.snapshot.firstChild.routeConfig.path;
      console.log('pathPage: ', pathPage);
      let pageUrl = '';
      this.route.snapshot.firstChild.url.forEach(element => {
        pageUrl += '/' + element.path;
      });
      if (!pageUrl || pageUrl === '') {
        pageUrl = 'conversation-detail/';
      }
      console.log('pathPage: ', pageUrl);
      this.router.navigateByUrl(pageUrl);

      const DASHBOARD_URL = this.appConfigProvider.getConfig().DASHBOARD_URL;
      createExternalSidebar(this.renderer, DASHBOARD_URL);
    }
  }




  // BEGIN MY FUNCTIONS //

  /** */
  initFirebase() {
    console.log('AAA', this.appConfigProvider.getConfig());
    if (!this.appConfigProvider.getConfig().firebaseConfig || this.appConfigProvider.getConfig().firebaseConfig.apiKey === 'CHANGEIT') {
      throw new Error('firebase config is not defined. Please create your firebase-config.json. See the Chat21-Web_widget Installation Page');
    }
    firebase.initializeApp(this.appConfigProvider.getConfig().firebaseConfig);
  }

  /** */
  // showNavbar() {
  //   let TEMP = location.search.split('navBar=')[1];
  //   if (TEMP) { this.isNavBar = TEMP.split('&')[0]; }
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

  /** */
  hideAlert() {
    console.log('hideAlert');
    this.notificationsEnabled = true;
  }
  // END MY FUNCTIONS //




  // BEGIN SUBSCRIPTIONS //
  /** */
  initSubscriptions() {
    // this.events.subscribe('requestPermission', this.callbackRequestPermission);
    // this.events.subscribe('requestPermission', (permission) => {
    //   this.notificationsEnabled = permission;
      //  this.msgService.getToken();
    // });

    // this.events.subscribe('loggedUser:login', this.subscribeLoggedUserLogin);
    // this.events.subscribe('loggedUser:logout', this.subscribeLoggedUserLogout);

    this.events.subscribe('go-off-line', this.goOffLine);
    this.events.subscribe('go-on-line', this.goOnLine);
    this.events.subscribe('sign-in', this.signIn);

    // dopo il login quando ho completato il profilo utente corrente
    // this.events.subscribe('loaded-current-user', null);

    this.events.subscribe('firebase-sign-in-with-custom-token', this.firebaseSignInWithCustomToken);
    // this.events.subscribe('firebase-create-user-with-email-and-password', this.firebaseCreateUserWithEmailAndPassword);
    // this.events.subscribe('firebase-current-user-delete', this.firebaseCurrentUserDelete);
    // this.events.subscribe('firebase-send-password-reset-email', this.firebaseSendPasswordResetEmail);
    // this.events.subscribe('firebase-sign-out', this.firebaseSignOut);
    this.events.subscribe('uidConvSelected:changed', this.subscribeChangedConversationSelected);
  }


  /**
   * ::: subscribeChangedConversationSelected :::
   * evento richiamato quando si seleziona un utente nell'elenco degli user
   * apro dettaglio conversazione
   */
  subscribeChangedConversationSelected = (uidConvSelected: string, type: string) => {
    console.log('************** subscribeUidConvSelectedChanged', uidConvSelected, type);
    // this.checkMessageListIsOpen(uidConvSelected, type);
    this.router.navigateByUrl('conversation-detail/' + uidConvSelected);
  }

  /**
   * ::: subscribeLoggedUserLogin :::
   * effettuato il login:
   * dismetto modale
   */
  // subscribeLoggedUserLogin = (user: any) => {
  //   console.log('1 ************** subscribeLoggedUserLogin', user);
  //   try {
  //     closeModal(this.modalController);
  //   } catch (err) {
  //     console.error('-> error:', err);
  //   }
  //   this.checkPlatform();
  // }

  /**
   * ::: subscribeLoggedUserLogout :::
   * effettuato il logout:
   * mostro modale login
   */
  // subscribeLoggedUserLogout = () => {
  //   console.log('************** subscribeLoggedUserLogout');
  //   presentModal(this.modalController, LoginPage, { tenant: 'tilechat', enableBackdropDismiss: false });
  //   // presentModal(this.modalController, LoginModal, { tenant: 'tilechat', enableBackdropDismiss: false });
  // }


  /**
   *
   */
  goOffLine = () => {
    console.log('************** goOffLine');
    this.chatManager.goOffLine();
    presentModal(this.modalController, LoginPage, { tenant: 'tilechat', enableBackdropDismiss: false });
  }

  /**
   *
   * @param user
   */
  goOnLine = (user: any) => {
    console.log('************** goOnLine', user);
    this.chatManager.goOnLine(user);
    this.chatPresenceHandler.setupMyPresence(user.uid);
    try {
      closeModal(this.modalController);
      this.checkPlatform();
    } catch (err) {
      console.error('-> error:', err);
    }
  }

  /** */
  signIn = (user: any, error: any) => {
    console.log('************** signIn:: user:' + user + '  - error: ' + error);
  }




  /**
   *
   */
  firebaseSignInWithCustomToken = (response: any, error) => {
    console.log('************** firebaseSignInWithCustomToken: ' + response + ' error: ' + error);
  }


  // END SUBSCRIPTIONS //



}

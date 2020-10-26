import { Component, ViewChild, NgZone } from '@angular/core';
import { Events, Platform, MenuController, Nav, AlertController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { ListaConversazioniPage } from '../pages/lista-conversazioni/lista-conversazioni';
// import { StatusBar } from '@ionic-native/status-bar';
// import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import { Config } from 'ionic-angular';
import {NavProxyService} from '../providers/nav-proxy';
//import {PlaceholderPage} from '../pages/placeholder/placeholder';
import { MessagingService } from '../providers/messaging-service';
import { ChatManager } from '../providers/chat-manager/chat-manager';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../environments/environment';
import { AppConfigProvider } from '../providers/app-config/app-config';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  // new branch v2.0
  // Grab References to our 2 NavControllers...
  @ViewChild('detailNav') detailNav: Nav;
  @ViewChild('masterNav') masterNav: Nav;
  // Empty placeholders for the 'master/detail' pages...
  masterPage: any = null;
  detailPage: any = null;
  public zone: NgZone;
  public user:any;
  pages: Array<{title: string, component: any}>;
  isNavBar: string;
  notificationsEnabled: boolean;
  //firebaseConfig = environment.firebaseConfig;
  
  /**
   * 1 - init firebase
   * 2 - quando
   * @param platform 
   * @param menu 
   * @param statusBar 
   * @param splashScreen 
   * @param config 
   * @param navProxy 
   * @param alertCtrl 
   * @param msgService 
   * @param chatManager 
   */
  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public config: Config,
    public events: Events,
    private navProxy: NavProxyService,
    public alertCtrl: AlertController,
    public msgService: MessagingService,
    public chatManager: ChatManager,
    public translate: TranslateService,
    public appConfigProvider: AppConfigProvider
  ) {
    this.notificationsEnabled = true;
    this.zone = new NgZone({});
    //this.isNavBar = (location.search.split('navBar=')[1]).split('&')[0];
    let TEMP = location.search.split('navBar=')[1];
    if (TEMP) { this.isNavBar = TEMP.split('&')[0]; }
    //console.log('isNavBar: ', this.isNavBar);
    //this.isNavBar = 'http://support.chat21.org/dashboard/';

    // this language will be used as a fallback when a translation isn't found in the current language
    //translate.setDefaultLang('it');


    //firebase.initializeApp(config.get("firebaseConfig"));
    //firebase.initializeApp(this.firebaseConfig);
    
    if (!appConfigProvider.getConfig().firebaseConfig || appConfigProvider.getConfig().firebaseConfig.apiKey === 'CHANGEIT') {
      // tslint:disable-next-line:max-line-length
      throw new Error('firebase config is not defined. Please create your firebase-config.json. See the Chat21-Web_widget Installation Page');
    }
    firebase.initializeApp(appConfigProvider.getConfig().firebaseConfig);  // here shows the error


    platform.ready().then(() => {
      this.events.subscribe('requestPermission', this.callbackRequestPermission);
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // alert("  navProxy.masterNav: ");
      // Add our nav controllers to
      // the nav proxy service...
      navProxy.masterNav = this.masterNav;
      navProxy.detailNav = this.detailNav;
      this.masterNav.setRoot(ListaConversazioniPage, { detailNavCtrl: this.detailNav });
      // this.detailNav.setRoot(PlaceholderPage);
      this.msgService.initMessage();
      this.msgService.getPermission();
      // set tenant
      let appConfig = config.get("appConfig");
      const tenant = appConfig.tenant;
      // init chat manager
      this.chatManager.configureWithAppId(tenant);

      // const language = document.documentElement.lang;
      // let language = window.navigator.language; // detect browser language
      // if (language == null || language == undefined) {
      //   language = "en";
      // }
      // console.log('language: ', language);
      this.translate.setDefaultLang('en');
      this.translate.use('en');

      console.log('navigator.language: ', navigator.language);
      var language;
      if(navigator.language.indexOf('-') != -1){
        language = navigator.language.substring(0, navigator.language.indexOf('-'));
      } else if(navigator.language.indexOf('_') != -1){
        language = navigator.language.substring(0, navigator.language.indexOf('_'));
      } else {
        language = navigator.language;
      }
      //let language = (navigator.language.indexOf('-') != -1) ? navigator.language.substring(0, navigator.language.indexOf('-')) : navigator.language;
      this.translate.use(language);
      console.log('language: ', language);

    });

    // // solve the issue : "Cannot read property 'myID' of undefined"
    // // source :
    // // https://github.com/firebase/angularfire/issues/970
    // if (getLocalStorage()) {
    //   getLocalStorage().removeItem('firebase:previous_websocket_failure');
    // }

    localStorage.removeItem('firebase:previous_websocket_failure');
  }

  callbackRequestPermission: any = (permission) => {
    console.log("callbackRequestPermission", permission);
    this.notificationsEnabled = permission;
    this.msgService.getToken();
  }
  hideAlert(){
    console.log("hideAlert");
    this.notificationsEnabled = true;
  }

}

// export function getLocalStorage() {
//   return (typeof window !== "undefined") ? window.localStorage : null;
// }
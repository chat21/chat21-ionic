import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, MenuController, Nav, AlertController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { ListaConversazioniPage } from '../pages/lista-conversazioni/lista-conversazioni';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Config } from 'ionic-angular';
import {NavProxyService} from '../providers/nav-proxy';
//import {PlaceholderPage} from '../pages/placeholder/placeholder';
import { MessagingService } from '../providers/messaging-service';
import { ChatManager } from '../providers/chat-manager/chat-manager';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
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
    private navProxy: NavProxyService,
    public alertCtrl: AlertController,
    public msgService: MessagingService,
    public chatManager: ChatManager,
    public translate: TranslateService
  ) {
    this.zone = new NgZone({});
    //this.isNavBar = (location.search.split('navBar=')[1]).split('&')[0];
    let TEMP = location.search.split('navBar=')[1];
    if (TEMP) { this.isNavBar = TEMP.split('&')[0]; }
    //console.log('isNavBar: ', this.isNavBar);
    //this.isNavBar = 'http://support.chat21.org/dashboard/';

    // this language will be used as a fallback when a translation isn't found in the current language
    //translate.setDefaultLang('it');

    firebase.initializeApp(config.get("firebaseConfig"));
    platform.ready().then(() => {
      
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

      const language = document.documentElement.lang;
      console.log('language: ', language);
      this.translate.use(language);
    });
  }

}

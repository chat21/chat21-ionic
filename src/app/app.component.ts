import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, MenuController, Nav, AlertController } from 'ionic-angular';

import * as firebase from 'firebase/app';

//import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
//import { ListPage } from '../pages/list/list';
//import { LoginPage } from '../pages/authentication/login/login';
import { ListaConversazioniPage } from '../pages/lista-conversazioni/lista-conversazioni';
//import {DettaglioConversazionePage} from '../pages/dettaglio-conversazione/dettaglio-conversazione';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Config } from 'ionic-angular';
import {NavProxyService} from '../providers/nav-proxy';
import {PlaceholderPage} from '../pages/placeholder/placeholder';

//import { ModalController, NavParams } from 'ionic-angular';
//import { Push, PushObject, PushOptions } from "@ionic-native/push";
import { MessagingService } from '../providers/messaging-service';
import { ChatManager } from '../providers/chat-manager/chat-manager';


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

  //@ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  //rootPage: any;
  public zone:NgZone;

  public user:any;

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    config: Config,
    private navProxy: NavProxyService,
    //public push: Push,
    public alertCtrl: AlertController,
    public msgService: MessagingService,
    public chatManager: ChatManager
  ) {
    this.zone = new NgZone({});
    firebase.initializeApp(config.get("firebaseConfig"));
    
    //firebase.initializeApp(config);
    
    
    // // set home page
    // firebase.auth().onAuthStateChanged( user => {
    //   //this.rootPage = LoginPage;
    //   this.zone.run( () => {
    //     this.user = user;
    //     alert("user: "+ user);
    //     if (!user) {
    //       alert("LoginPage: "+ user);
    //       //this.modalCtrl.create(LoginPage);
    //       this.masterPage = LoginPage;
    //     } else {
    //        alert("ListaConversazioniPage: "+ user);
    //       this.masterPage =  ListaConversazioniPage;
    //     }
    //   });
    // });


  

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

      // set initial pages for
      // our nav controllers...
      // if (!this.user){

      //   //alert("1this.user: "+ this.user);
      //   this.masterNav.setRoot(ListaConversazioniPage, { detailNavCtrl: this.detailNav });
      //   //this.masterNav.setRoot(LoginPage, { detailNavCtrl: this.detailNav });
      // }else {
      //    //alert("else !this.user: "+ this.user);
      //  this.masterNav.setRoot(ListaConversazioniPage, { detailNavCtrl: this.detailNav });
      // }
      this.masterNav.setRoot(ListaConversazioniPage, { detailNavCtrl: this.detailNav });
      this.detailNav.setRoot(PlaceholderPage);

      this.msgService.initMessage();
      this.msgService.getPermission();
      //this.msgService.receiveMessage();

      // set tenant
      let appConfig = config.get("appConfig");
      const tenant = appConfig.tenant;
      // init chat manager
      this.chatManager.configureWithAppId(tenant);
    });
  }
}

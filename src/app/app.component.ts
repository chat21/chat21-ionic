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
    public msgService: MessagingService
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

      console.log("ciao1");
      this.msgService.initMessage();
      console.log("ciao2");
      this.msgService.getPermission();
      //this.msgService.receiveMessage();
    
    });

  }
  

  //initPushNotification() {
    // if (!this.platform.is('cordova')) {
       //console.log("initPushNotification");
    //   return;
    // }

    // to check if we have permission
    // this.push.hasPermission()
    // .then((res: any) => {
    //   if (res.isEnabled) {
    //     console.log('We have permission to send push notifications');
    //   } else {
    //     console.log('We do not have permission to send push notifications');
    //   }
    // });

    // const options: PushOptions = {
    
    //   android: {
    //     senderID: '1096415488178'
    //   },
    //   ios: {
    //     alert: 'true',
    //     badge: true,
    //     sound: 'false'
    //   },
    //   windows: {},
    //   browser: {
    //     //applicationServerKey: 'AAAA_0d0qLI:APA91bHytQr_aYxLz3Qf9e8RRx-mNwKZyctlEnOjFlI-XaogTiwsNia7zbBo9hPU0lQ5wIbUDY92RWshfiZ1BMUNgLlBR59T9QJ15BAgzf3B2zMTU_t52--Slp_oaeE2khdJQDReB5WJ'
    //     //applicationServerKey: 'AAAA_0d0qLI:APA91bHytQr_aYxLz3Qf9e8RRx-mNwKZyctlEnOjFlI-XaogTiwsNia7zbBo9hPU0lQ5wIbUDY92RWshfiZ1BMUNgLlBR59T9QJ15BAgzf3B2zMTU_t52--Slp_oaeE2khdJQDReB5WJ',
    //     pushServiceURL: 'http://push.api.phonegap.com/v1/push'
    //   }
    // };
  

    // const pushObject: PushObject = this.push.init(options);
  
    //   pushObject.on('registration').subscribe((data: any) => {
    //     console.log("device token : " + data.registrationId);
  
    //     // save device token on art-restheart http://art.dbapi.io/gart/appInstallations
    //     //this.installationService.saveRegID(data.registrationId)
       
  
    //     let alert = this.alertCtrl.create({
    //       title: 'device token',
    //       subTitle: data.registrationId,
    //       buttons: ['OK']
    //     });
    //     alert.present();
  
    //   });
  
  
      // pushObject.on('notification').subscribe((data: any) => {
      //   console.log('message', data.message);
      //   //if user using app and push notification comes
      //   if (data.additionalData.foreground) {
      //     // if application open, show popup
      //     let confirmAlert = this.alertCtrl.create({
      //       title: 'New Notification',
      //       message: data.message,
      //       buttons: [{
      //         text: 'Ignore',
      //         role: 'cancel'
      //       }, {
      //         text: 'View',
      //         handler: () => {
      //           //TODO: Your logic here
      //           //this.nav.push(DetailsPage, {message: data.message});
      //         }
      //       }]
      //     });
      //     confirmAlert.present();
      //   } else {
      //     //if user NOT using app and push notification comes
      //     //TODO: Your logic on click of push notification directly
      //     //this.nav.push(DetailsPage, {message: data.message});
      //     console.log("Push notification clicked");
      //   }
      // });
  
  
  
      // pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  
    //}

  // initializeApp() {
  //   this.platform.ready().then(() => {
  //     // Okay, so the platform is ready and our plugins are available.
  //     // Here you can do any higher level native things you might need.
  //     this.statusBar.styleDefault();
  //     this.splashScreen.hide();
  //   });
  // }

  /*openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }*/
}

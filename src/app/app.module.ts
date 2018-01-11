import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

//import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { UsersPage } from '../pages/users/users';
import { LoginPage } from '../pages/authentication/login/login';
import { RegisterPage } from '../pages/authentication/register/register';
import { ResetpwdPage } from '../pages/authentication/resetpwd/resetpwd';
import { ListaConversazioniPage } from '../pages/lista-conversazioni/lista-conversazioni';
import { DettaglioConversazionePage } from '../pages/dettaglio-conversazione/dettaglio-conversazione';
import { ProfilePage } from '../pages/profile/profile';

import { AngularFireModule } from 'angularfire2';
//import * as firebase from "firebase";
// import { AngularFireDatabaseModule } from 'angularfire2/database';
// import { AngularFireAuthModule } from 'angularfire2/auth';

import { AuthService } from '../providers/auth-service';
import { ChatPresenceHandler } from '../providers/chat-presence-handler';
import { UploadService } from '../providers/upload-service/upload-service';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NavProxyService } from '../providers/nav-proxy';
import { PlaceholderPage } from '../pages/placeholder/placeholder';
import { PopoverPage } from '../pages/popover/popover';
import { PopoverProfilePage } from '../pages/popover-profile/popover-profile';
import { UpdateImageProfilePage } from '../pages/update-image-profile/update-image-profile';


//import { FirebaseProvider } from '../providers/firebase-provider';

// SQLite

import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { SQLite } from '@ionic-native/sqlite';
import { MessagingService } from '../providers/messaging-service';
import { UserService } from '../providers/user/user';
import { AutosizeDirective } from '../directives/autosize/autosize';
import { DatabaseProvider } from '../providers/database/database';
import { ChatConversationsHandler } from '../providers/chat-conversations-handler';
import { ChatConversationHandler } from '../providers/chat-conversation-handler';
import { ChatManager } from '../providers/chat-manager/chat-manager';
import { ChatContactsSynchronizer } from '../providers/chat-contacts-synchronizer';




@NgModule({
  declarations: [
    MyApp,
    UsersPage,
    //UserDetailsPage,
    LoginPage,
    RegisterPage,
    ResetpwdPage,
    ProfilePage,
    ListaConversazioniPage,
    DettaglioConversazionePage,
    PlaceholderPage,
    PopoverPage,
    PopoverProfilePage,
    UpdateImageProfilePage,
    AutosizeDirective
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
      
    IonicModule.forRoot(MyApp,{

      firebaseConfig : {
        // apiKey: "AIzaSyCXckPF4UCyewDbOt_zMl4D893Kv2NUQ7Q",
        // authDomain: "chat21demo.firebaseapp.com",
        // databaseURL: "https://chat21demo.firebaseio.com",
        // projectId: "chat21demo",
        // storageBucket: "chat21demo.appspot.com",
        // messagingSenderId: "769986182759"
        apiKey: 'AIzaSyDWMsqHBKmWVT7mWiSqBfRpS5U8YwTl7H0',
        authDomain: 'chat-v2-dev.firebaseapp.com',
        databaseURL: 'https://chat-v2-dev.firebaseio.com',
        projectId: 'chat-v2-dev',
        storageBucket: 'chat-v2-dev.appspot.com',
        messagingSenderId: '77360455507'
      },
      appConfig: {
        tenant:"tilechat"
      }
    }),
    IonicStorageModule.forRoot({
      name: "tilechat",
      storeName: 'contacts',
      driverOrder: ['indexeddb','sqlite', 'websql', 'indexeddb', 'localstorage']
    }),

    AngularFireModule.initializeApp(this.firebaseConfig)
    // AngularFireDatabaseModule,
    // AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    UsersPage,
    LoginPage,
    RegisterPage,
    ResetpwdPage,
    ProfilePage,
    ListaConversazioniPage,
    DettaglioConversazionePage,
    PlaceholderPage,
    PopoverPage,
    PopoverProfilePage,
    UpdateImageProfilePage
  ],
  providers: [
    //ApplicationContext,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider,
    SQLitePorter,
    SQLite,
    AuthService,
    ChatPresenceHandler,
    NavProxyService,
    MessagingService,
    UserService,
    UploadService,
    ChatManager,
    ChatConversationsHandler,
    ChatConversationHandler,
    ChatContactsSynchronizer
  ]
})
export class AppModule {}

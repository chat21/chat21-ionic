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


import { FirebaseProvider } from '../providers/firebase-provider';

// SQLite

import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { SQLite } from '@ionic-native/sqlite';

//import { Data } from '../providers/data';
//import { Push } from '@ionic-native/push';
import { MessagingService } from '../providers/messaging-service';
import { UserService } from '../providers/user/user';
import { ConversationProvider } from '../providers/conversation/conversation';
import { MessageProvider } from '../providers/message/message';
import { AutosizeDirective } from '../directives/autosize/autosize';
import { DatabaseProvider } from '../providers/database/database';

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
<<<<<<< HEAD
        firebaseConfig : {
        apiKey: "...",
        authDomain: "...",
        databaseURL: "...",
        projectId: "...",
        storageBucket: "...",
        messagingSenderId: "..."
=======
      firebaseConfig : {
>>>>>>> build_0.0.3
      },

      appConfig: {
        tenant:"chat21"
      }
    }),
    IonicStorageModule.forRoot({
      name: "chat21",
      storeName: 'contacts',
      driverOrder: ['indexeddb','sqlite', 'websql', 'indexeddb', 'localstorage']
    }),

    AngularFireModule.initializeApp(this.firebaseConfig),
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
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider,
    SQLitePorter,
    SQLite,
    AuthService,
    ChatPresenceHandler,
    NavProxyService,
    FirebaseProvider,
    //Push,
    MessagingService,
    UserService,
    ConversationProvider,
    MessageProvider,
    UploadService
    //Data
  ]
})
export class AppModule {}

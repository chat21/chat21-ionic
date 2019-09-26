import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';

import { HttpModule, Http } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { LinkyModule } from 'angular-linky';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { environment } from '../environments/environment';


//import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { UsersPage } from '../pages/users/users';
import { LoginPage } from '../pages/authentication/login/login';
import { RegisterPage } from '../pages/authentication/register/register';
import { ResetpwdPage } from '../pages/authentication/resetpwd/resetpwd';
import { ListaConversazioniPage } from '../pages/lista-conversazioni/lista-conversazioni';
import { DettaglioConversazionePage } from '../pages/dettaglio-conversazione/dettaglio-conversazione';
import { ProfilePage } from '../pages/profile/profile';
import { InfoConversationPage } from '../pages/info-conversation/info-conversation';
import { InfoUserPage } from '../pages/info-user/info-user';
import { InfoMessagePage } from '../pages/info-message/info-message';
import { InfoAdvancedPage } from '../pages/info-advanced/info-advanced';

// import { AngularFireModule } from 'angularfire2';
import * as firebase from "firebase";
// import { AngularFireDatabaseModule } from 'angularfire2/database';
// import { AngularFireAuthModule } from 'angularfire2/auth';

import { AuthService } from '../providers/auth-service';
import { ChatPresenceHandler } from '../providers/chat-presence-handler';
import { UploadService } from '../providers/upload-service/upload-service';

import { NavProxyService } from '../providers/nav-proxy';
import { PlaceholderPage } from '../pages/placeholder/placeholder';
import { PopoverPage } from '../pages/popover/popover';
import { PopoverProfilePage } from '../pages/popover-profile/popover-profile';
import { UpdateImageProfilePage } from '../pages/update-image-profile/update-image-profile';
import { ArchivedConversationsPage } from '../pages/archived-conversations/archived-conversations';
//import { FirebaseProvider } from '../providers/firebase-provider';

// @ionic
// import { StatusBar } from '@ionic-native/status-bar';
// import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';


import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';

import { MessagingService } from '../providers/messaging-service';
import { UserService } from '../providers/user/user';
import { GroupService } from '../providers/group/group';
import { AutosizeDirective } from '../directives/autosize/autosize';
import { DatabaseProvider } from '../providers/database/database';
import { ChatConversationsHandler } from '../providers/chat-conversations-handler';
import { ChatArchivedConversationsHandler } from '../providers/chat-archived-conversations-handler';
import { ChatConversationHandler } from '../providers/chat-conversation-handler';
import { ChatManager } from '../providers/chat-manager/chat-manager';
import { ChatContactsSynchronizer } from '../providers/chat-contacts-synchronizer';


import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TiledeskConversationProvider } from '../providers/tiledesk-conversation/tiledesk-conversation';
import { AppConfigProvider } from '../providers/app-config/app-config';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


const appInitializerFn = (appConfig: AppConfigProvider) => {
  return () => {
    if (environment.remoteConfig) {
      return appConfig.loadAppConfig();
    }
  };
};


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
    AutosizeDirective,
    InfoConversationPage,
    InfoUserPage,
    InfoMessagePage,
    InfoAdvancedPage,
    ArchivedConversationsPage,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    LinkyModule,
    IonicModule.forRoot(MyApp,{
      appConfig: {
        tenant:"tilechat"
      }
    }),
    IonicStorageModule.forRoot({
      name: "tilechat",
      storeName: 'settings',
      driverOrder: ['indexeddb','sqlite', 'websql', 'indexeddb', 'localstorage']
    })
    // AngularFireModule.initializeApp(this.firebaseConfig)
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
    UpdateImageProfilePage,
    InfoConversationPage,
    InfoUserPage,
    InfoMessagePage,
    InfoAdvancedPage,
    ArchivedConversationsPage
  ],
  providers: [
    AppConfigProvider, // https://juristr.com/blog/2018/01/ng-app-runtime-config/
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigProvider]
    },
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
    ChatArchivedConversationsHandler,
    ChatConversationHandler,
    ChatContactsSynchronizer,
    GroupService,
    TiledeskConversationProvider
  ]
})
export class AppModule {}

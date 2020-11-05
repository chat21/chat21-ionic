import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
// import { HashLocationStrategy, LocationStrategy } from '@angular/common';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { Keyboard } from '@ionic-native/keyboard/ngx';

// @NgModule({
//   declarations: [AppComponent],
//   entryComponents: [],
//   imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
//   providers: [
//     StatusBar,
//     SplashScreen,
//     { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
//   ],
//   bootstrap: [AppComponent]
// })
// export class AppModule {}





// import { HttpModule } from '@angular/http';
// import { IonicStorageModule } from '@ionic/storage';
// import { LinkyModule } from 'ngx-linky';

// import { IonicApp, IonicModule, IonicErrorHandler } from '@ionic/angular';

import { environment } from '../environments/environment';


// import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
// import { SQLite } from '@ionic-native/sqlite/ngx';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { HttpClientModule, HttpClient } from '@angular/common/http';

// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule, TranslatePipe} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';

// import { UsersPage } from '../pages/users/users';
// import { LoginPage } from '../pages/authentication/login/login';
// import { RegisterPage } from '../pages/authentication/register/register';
// import { ResetpwdPage } from '../pages/authentication/resetpwd/resetpwd';
// import { ListaConversazioniPage } from '../pages/lista-conversazioni/lista-conversazioni';
// import { DettaglioConversazionePage } from '../pages/dettaglio-conversazione/dettaglio-conversazione';
// import { ProfilePage } from '../pages/profile/profile';
// import { InfoConversationPage } from '../pages/info-conversation/info-conversation';
// import { InfoUserPage } from '../pages/info-user/info-user';
// import { InfoMessagePage } from '../pages/info-message/info-message';
// import { InfoAdvancedPage } from '../pages/info-advanced/info-advanced';
// import { PlaceholderPage } from '../pages/placeholder/placeholder';
// import { PopoverPage } from '../pages/popover/popover';
// import { PopoverProfilePage } from '../pages/popover-profile/popover-profile';
// import { UpdateImageProfilePage } from '../pages/update-image-profile/update-image-profile';
// import { ArchivedConversationsPage } from '../pages/archived-conversations/archived-conversations';


// import { AuthService } from '../providers/auth-service';
// import { ChatPresenceHandler } from '../providers/chat-presence-handler';
// import { UploadService } from '../providers/upload-service/upload-service';
// import { NavProxyService } from '../providers/nav-proxy';


// @ionic
// import { StatusBar } from '@ionic-native/status-bar';
// import { SplashScreen } from '@ionic-native/splash-screen';
import { AppConfigProvider } from './services/app-config';
import { MessagingService } from './services/messaging-service';
import { EventsService } from './services/events-service';
import { AuthService } from './services/auth.service';
import { FirebaseAuthService } from './services/firebase/firebase-auth-service';
// import { UserService } from './services/user.service';
// import { FirebaseUserService } from './services/firebase/firebase-user-service';
import { PresenceService } from './services/presence.service';
import { FirebasePresenceService } from './services/firebase/firebase-presence.service';
import { TypingService } from './services/typing.service';
import { FirebaseTypingService } from './services/firebase/firebase-typing.service';
import { ConversationsHandlerService } from './services/conversations-handler.service';
import { FirebaseConversationsHandler } from './services/firebase/firebase-conversations-handler';
import { DatabaseProvider } from './services/database';
import { ConversationHandlerService } from './services/conversation-handler.service';
import { FirebaseConversationHandler } from './services/firebase/firebase-conversation-handler';

// import { ConversationListPage } from './pages/conversations-list/conversations-list.page';
import { ConversationListPageModule } from './pages/conversations-list/conversations-list.module';
import { ConversationDetailPageModule } from './pages/conversation-detail/conversation-detail.module';

// import { DetailsPage } from './pages/details/details.page';
import {LoginPageModule} from './pages/authentication/login/login.module';

// import { ConversationDetailPage } from './pages/conversation-detail/conversation-detail.page';
// import { LoginPage } from './pages/authentication/login/login';
// import { LoginPageModule } from './modals/authentication/login/login.module';
// import { ConversationListTestPageModule } from './pages/conversations-list-test/conversations-list-test.module';

// import { UserService } from '../providers/user/user';
// import { GroupService } from '../providers/group/group';
// import { AutosizeDirective } from '../directives/autosize/autosize';
// 
// import { ChatConversationsHandler } from '../providers/chat-conversations-handler';
// import { ChatArchivedConversationsHandler } from '../providers/chat-archived-conversations-handler';
// import { ChatConversationHandler } from '../providers/chat-conversation-handler';
// import { ChatManager } from '../providers/chat-manager/chat-manager';
// import { ChatContactsSynchronizer } from '../providers/chat-contacts-synchronizer';
// 

// import { CannedResponsesServiceProvider } from '../providers/canned-responses-service/canned-responses-service';

// export function createTranslateLoader(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }


import { ScrollbarThemeModule } from './utils/scrollbar-theme.directive';
import { SharedModule } from 'src/app/shared/shared.module';
// import { SharedConversationInfoModule } from 'src/app/shared/shared-conversation-info.module';
// import { DdpHeaderComponent } from 'src/app/components/ddp-header/ddp-header.component';



export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const appInitializerFn = (appConfig: AppConfigProvider) => {
  return () => {
    if (environment['remoteConfig']) {
      console.log('environment.remoteConfig: ', environment['remoteConfig']);
      return appConfig.loadAppConfig();
    }
  };
};

export function authenticationFactory(events: EventsService, http: HttpClient) {
  console.log('authenticationFactory: ');
  return new FirebaseAuthService(events, http);
}

// export function userFactory() {
//   console.log('userFactory: ');
//   return new FirebaseUserService();
// }

export function presenceFactory(events: EventsService) {
  console.log('presenceFactory: ');
  return new FirebasePresenceService(events);
}

export function typingFactory(events: EventsService) {
  console.log('typingFactory: ');
  return new FirebaseTypingService(events);
}

export function conversationsHandlerFactory(
  databaseProvider: DatabaseProvider) {
  console.log('conversationsHandlerFactory: ');
  return new FirebaseConversationsHandler(databaseProvider);
}

export function conversationHandlerFactory() {
  console.log('conversationHandlerFactory: ');
  return new FirebaseConversationHandler();
}


@NgModule({
  declarations: [
    AppComponent,
    // AvatarComponent,
    // DdpHeaderComponent
  ],
  entryComponents: [
    // DdpHeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    LoginPageModule,
    ConversationListPageModule,
    ConversationDetailPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    ScrollbarThemeModule,
    SharedModule,
    // SharedConversationInfoModule
    // LinkyModule,
    // IonicStorageModule.forRoot({
    //   name: "tilechat",
    //   storeName: 'settings',
    //   driverOrder: ['indexeddb','sqlite', 'websql', 'indexeddb', 'localstorage']
    // })
    // ConversationListTestPageModule
  ],
  bootstrap: [AppComponent],

  providers: [
    AppConfigProvider, // https://juristr.com/blog/2018/01/ng-app-runtime-config/
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigProvider]
    },
    {
      provide: AuthService,
      useFactory: authenticationFactory,
      deps: [EventsService, HttpClient]
     },
    // {
    //   provide: UserService,
    //   useFactory: userFactory,
    //   deps: []
    // },
    {
      provide: PresenceService,
      useFactory: presenceFactory,
      deps: [EventsService, HttpClient]
    },
    {
      provide: TypingService,
      useFactory: typingFactory,
      deps: [EventsService, HttpClient]
    },
    {
      provide: ConversationsHandlerService,
      useFactory: conversationsHandlerFactory,
      deps: [DatabaseProvider]
    },
    {
      provide: ConversationHandlerService,
      useFactory: conversationHandlerFactory,
      deps: [DatabaseProvider]
    },
    StatusBar,
    SplashScreen,
    Keyboard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // { provide: LocationStrategy, useClass: HashLocationStrategy },
    MessagingService,
    EventsService,
    DatabaseProvider
  ]
})
export class AppModule {}


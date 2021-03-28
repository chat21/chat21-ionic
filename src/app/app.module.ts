import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute } from '@angular/router';
import {TranslateLoader, TranslateModule, TranslatePipe} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { Keyboard } from '@ionic-native/keyboard/ngx';

// COMPONENTS
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// CONFIG
import { environment } from '../environments/environment';
import { CHAT_ENGINE_NQTT, CHAT_ENGINE_FIREBASE } from './utils/constants';

// SERVICES
import { AppConfigProvider } from './services/app-config';
import { MessagingService } from './services/messaging-service';
import { EventsService } from './services/events-service';
import { AuthService } from './services/auth.service';
import { FirebaseAuthService } from './services/firebase/firebase-auth-service';
import { PresenceService } from './services/presence.service';
import { FirebasePresenceService } from './services/firebase/firebase-presence.service';
import { TypingService } from './services/typing.service';
import { FirebaseTypingService } from './services/firebase/firebase-typing.service';
import { ConversationsHandlerService } from './services/conversations-handler.service';
import { FirebaseConversationsHandler } from './services/firebase/firebase-conversations-handler';
import { DatabaseProvider } from './services/database';
import { FirebaseImageRepoService } from './services/firebase/firebase-image-repo';
import { ImageRepoService } from './services/image-repo.service';

// MQTT
import { Chat21Service } from './services/chat-service';
import { MQTTAuthService } from './services/mqtt/mqtt-auth-service';
import { MQTTConversationsHandler } from './services/mqtt/mqtt-conversations-handler';
import { MQTTTypingService } from './services/mqtt/mqtt-typing.service';
import { MQTTPresenceService } from './services/mqtt/mqtt-presence.service';

// PAGES
import { ConversationListPageModule } from './pages/conversations-list/conversations-list.module';
import { ConversationDetailPageModule } from './pages/conversation-detail/conversation-detail.module';
import {LoginPageModule} from './pages/authentication/login/login.module';

// UTILS
import { ScrollbarThemeModule } from './utils/scrollbar-theme.directive';
import { SharedModule } from 'src/app/shared/shared.module';

// FACTORIES
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function authenticationFactory(http: HttpClient, route: ActivatedRoute, chat21Service: Chat21Service) {
  console.log('authenticationFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new MQTTAuthService(http, chat21Service);
  } else {
    return new FirebaseAuthService(http, route);
  }
}

export function presenceFactory(events: EventsService) {
  console.log('presenceFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new MQTTPresenceService();
  } else {
    return new FirebasePresenceService();
  }
}

export function typingFactory(events: EventsService) {
  console.log('typingFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new MQTTTypingService(events);
  } else {
    return new FirebaseTypingService(events);
  }
}

export function conversationsHandlerFactory(
  databaseProvider: DatabaseProvider, chat21Service: Chat21Service) {
  console.log('conversationsHandlerFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new MQTTConversationsHandler(databaseProvider, chat21Service);
  } else {
    return new FirebaseConversationsHandler(databaseProvider);
  }
}

export function imageRepoFactory() {
  console.log('imageRepoFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new FirebaseImageRepoService();
  } else {
    return new FirebaseImageRepoService();
  }
}

const appInitializerFn = (appConfig: AppConfigProvider) => {
  return () => {
    if (environment.remoteConfig) {
      console.log('environment.remoteConfig: ', environment.remoteConfig);
      return appConfig.loadAppConfig();
    }
  };
};

@NgModule({
  declarations: [
    AppComponent
  ],
  entryComponents: [
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
    // {
    //   provide: AuthService,
    //   useFactory: authenticationFactory,
    //   deps: [HttpClient, ActivatedRoute]
    //  },
    {
      provide: AuthService,
      useFactory: authenticationFactory,
      deps: [HttpClient, ActivatedRoute, Chat21Service]
     },
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
    // {
    //   provide: ConversationsHandlerService,
    //   useFactory: conversationsHandlerFactory,
    //   deps: [DatabaseProvider]
    // },
    {
      provide: ConversationsHandlerService,
      useFactory: conversationsHandlerFactory,
      deps: [DatabaseProvider, Chat21Service]
    },
    {
      provide: ImageRepoService,
      useFactory: imageRepoFactory,
      deps: []
    },
    StatusBar,
    SplashScreen,
    Keyboard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    MessagingService,
    EventsService,
    DatabaseProvider,
    Chat21Service
  ]
})
export class AppModule {}

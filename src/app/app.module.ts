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
import { ConversationHandlerBuilderService } from './services/conversation-handler-builder.service';
import { FirebaseConversationHandlerBuilderService } from './services/firebase/firebase-conversation-handler-builder.service';

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

export function authenticationFactory(http: HttpClient, route: ActivatedRoute) {
  console.log('authenticationFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new FirebaseAuthService(http, route);
  } else {
    return new FirebaseAuthService(http, route);
  }
}

export function presenceFactory(events: EventsService) {
  console.log('presenceFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new FirebasePresenceService();
  } else {
    return new FirebasePresenceService();
  }
}

export function typingFactory(events: EventsService) {
  console.log('typingFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new FirebaseTypingService(events);
  } else {
    return new FirebaseTypingService(events);
  }
}

export function conversationsHandlerFactory(
  databaseProvider: DatabaseProvider) {
  console.log('conversationsHandlerFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new FirebaseConversationsHandler(databaseProvider);
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

export function conversationHandlerBuilderFactory() {
  console.log('conversationHandlerBuilderFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_NQTT) {
    return new FirebaseConversationHandlerBuilderService();
  } else {
    return new FirebaseConversationHandlerBuilderService();
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
    {
      provide: AuthService,
      useFactory: authenticationFactory,
      deps: [HttpClient, ActivatedRoute]
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
    {
      provide: ConversationsHandlerService,
      useFactory: conversationsHandlerFactory,
      deps: [DatabaseProvider]
    },
    {
      provide: ImageRepoService,
      useFactory: imageRepoFactory,
      deps: []
    },
    {
      provide: ConversationHandlerBuilderService,
      useFactory: conversationHandlerBuilderFactory,
      deps: []
    },
    StatusBar,
    SplashScreen,
    Keyboard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    MessagingService,
    EventsService,
    DatabaseProvider
  ]
})
export class AppModule {}


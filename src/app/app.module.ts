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
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { Chooser } from '@ionic-native/chooser/ngx';

// COMPONENTS
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// CONFIG
import { environment } from '../environments/environment';
import { CHAT_ENGINE_MQTT, CHAT_ENGINE_FIREBASE } from '../chat21-core/utils/constants';

// SERVICES
import { AppConfigProvider } from './services/app-config';

import { EventsService } from './services/events-service';
import { AuthService } from 'src/chat21-core/providers/abstract/auth.service';
import { FirebaseAuthService } from 'src/chat21-core/providers/firebase/firebase-auth-service';
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';
import { FirebasePresenceService } from 'src/chat21-core/providers/firebase/firebase-presence.service';
import { TypingService } from 'src/chat21-core/providers/abstract/typing.service';
import { FirebaseTypingService } from 'src/chat21-core/providers/firebase/firebase-typing.service';
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service';
import { ConversationHandlerService } from '../chat21-core/providers/abstract/conversation-handler.service';

import { FirebaseConversationsHandler } from 'src/chat21-core/providers/firebase/firebase-conversations-handler';
import { FirebaseConversationHandler } from 'src/chat21-core/providers/firebase/firebase-conversation-handler';

import { DatabaseProvider } from './services/database';
import { FirebaseImageRepoService } from 'src/chat21-core/providers/firebase/firebase-image-repo';
import { FirebaseArchivedConversationsHandler } from 'src/chat21-core/providers/firebase/firebase-archivedconversations-handler';
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { ConversationHandlerBuilderService } from 'src/chat21-core/providers/abstract/conversation-handler-builder.service';
import { FirebaseConversationHandlerBuilderService } from 'src/chat21-core/providers/firebase/firebase-conversation-handler-builder.service';
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
import { FirebaseUploadService } from 'src/chat21-core/providers/firebase/firebase-upload.service';

// PAGES
import { ConversationListPageModule } from './pages/conversations-list/conversations-list.module';
import { ConversationDetailPageModule } from './pages/conversation-detail/conversation-detail.module';
import {LoginPageModule} from './pages/authentication/login/login.module';
import {LoaderPreviewPageModule} from './pages/loader-preview/loader-preview.module';

// UTILS
import { ScrollbarThemeModule } from './utils/scrollbar-theme.directive';
import { SharedModule } from 'src/app/shared/shared.module';

// FACTORIES
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function authenticationFactory(http: HttpClient, appConfig: AppConfigProvider ) {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    const auth= new FirebaseAuthService(http); 
    auth.setBaseUrl(appConfig.getConfig().SERVER_BASE_URL)
    return auth
  } else {
    const auth= new FirebaseAuthService(http); 
    auth.setBaseUrl(appConfig.getConfig().SERVER_BASE_URL)
    return auth
  }
}

// export function authenticationFactory(http: HttpClient, appConfig: AppConfigProvider ) {
//   if (environment.chatEngine === CHAT_ENGINE_MQTT) {
//     const auth= new FirebaseAuthService(http); 
//     auth.setBaseUrl(appConfig.getConfig().apiUrl)
//     return auth
//   } else {
//     const auth= new FirebaseAuthService(http); 
//     auth.setBaseUrl(appConfig.getConfig().apiUrl)
//     return auth
//   }
// }

export function presenceFactory() {
  console.log('presenceFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebasePresenceService();
  } else {
    return new FirebasePresenceService();
  }
}

export function typingFactory() {
  console.log('typingFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebaseTypingService();
  } else {
    return new FirebaseTypingService();
  }
}

export function uploadFactory() {
  console.log('uploadFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebaseUploadService();
  } else {
    return new FirebaseUploadService();
  }
}

export function conversationsHandlerFactory() {
  console.log('conversationsHandlerFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebaseConversationsHandler();
  } else {
    return new FirebaseConversationsHandler();
  }
}

export function imageRepoFactory() {
  console.log('imageRepoFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebaseImageRepoService();
  } else {
    return new FirebaseImageRepoService();
  }
}

export function archivedConversationsHandlerFactory() {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebaseArchivedConversationsHandler();
  } else {
    return new FirebaseArchivedConversationsHandler();
  }
}

export function conversationHandlerBuilderFactory() {
  console.log('conversationHandlerBuilderFactory: ');
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebaseConversationHandlerBuilderService();
  } else {
    return new FirebaseConversationHandlerBuilderService();
  }
}

export function conversationHandlerFactory() {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebaseConversationHandler(false);
  } else {
    return new FirebaseConversationHandler(false);
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
    NgxLinkifyjsModule.forRoot(),
    LoaderPreviewPageModule
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
    //   deps: [HttpClient, AppConfigService ]
    // },
    {
      provide: AuthService,
      useFactory: authenticationFactory,
      deps: [HttpClient, AppConfigProvider]
     },
    {
      provide: PresenceService,
      useFactory: presenceFactory,
      deps: []
    },
    {
      provide: TypingService,
      useFactory: typingFactory,
      deps: []
    },
    {
      provide: UploadService,
      useFactory: uploadFactory,
      deps: []
    },
    {
      provide: ConversationsHandlerService,
      useFactory: conversationsHandlerFactory,
      deps: []
    },
    {
      provide: ArchivedConversationsHandlerService,
      useFactory: archivedConversationsHandlerFactory,
      deps: []
    },
    {
      provide: ConversationHandlerService,
      useFactory: conversationHandlerFactory,
      deps: []
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
    EventsService,
    DatabaseProvider,
    Chooser
  ]
})
export class AppModule {}


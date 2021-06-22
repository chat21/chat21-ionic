import { LogLevel, PUSH_ENGINE_NATIVE } from './../chat21-core/utils/constants';
import { MomentModule } from 'angular2-moment';
import { CustomLogger } from 'src/chat21-core/providers/logger/customLogger';
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { Chooser } from '@ionic-native/chooser/ngx';
import { LoggerModule, NGXLogger, NgxLoggerLevel } from "ngx-logger";

// COMPONENTS
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// CONFIG
import { environment } from '../environments/environment';
import { CHAT_ENGINE_MQTT, CHAT_ENGINE_FIREBASE, UPLOAD_ENGINE_NATIVE } from '../chat21-core/utils/constants';

// SERVICES
import { AppConfigProvider } from './services/app-config';
import { EventsService } from './services/events-service';
import { DatabaseProvider } from './services/database';

// ABSTRACT SERVICES
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { ConversationHandlerBuilderService } from 'src/chat21-core/providers/abstract/conversation-handler-builder.service';
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service';
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { ConversationHandlerService } from 'src/chat21-core/providers/abstract/conversation-handler.service';
import { TypingService } from 'src/chat21-core/providers/abstract/typing.service';
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
import { GroupsHandlerService } from 'src/chat21-core/providers/abstract/groups-handler.service';
import { NotificationsService } from 'src/chat21-core/providers/abstract/notifications.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';

// FIREBASE
import { FirebaseInitService } from 'src/chat21-core/providers/firebase/firebase-init-service';
import { FirebaseAuthService } from 'src/chat21-core/providers/firebase/firebase-auth-service';
import { FirebaseConversationHandlerBuilderService } from 'src/chat21-core/providers/firebase/firebase-conversation-handler-builder.service';
import { FirebaseConversationsHandler } from 'src/chat21-core/providers/firebase/firebase-conversations-handler';
import { FirebaseArchivedConversationsHandler } from 'src/chat21-core/providers/firebase/firebase-archivedconversations-handler';
import { FirebaseConversationHandler } from 'src/chat21-core/providers/firebase/firebase-conversation-handler';
import { FirebaseTypingService } from 'src/chat21-core/providers/firebase/firebase-typing.service';
import { FirebasePresenceService } from 'src/chat21-core/providers/firebase/firebase-presence.service';
import { FirebaseImageRepoService } from 'src/chat21-core/providers/firebase/firebase-image-repo';
import { FirebaseUploadService } from 'src/chat21-core/providers/firebase/firebase-upload.service';
import { FirebaseGroupsHandler } from 'src/chat21-core/providers/firebase/firebase-group-handler';
import { FirebaseNotifications } from 'src/chat21-core/providers/firebase/firebase-notifications';

// MQTT
import { Chat21Service } from 'src/chat21-core/providers/mqtt/chat-service';
import { MQTTAuthService } from 'src/chat21-core/providers/mqtt/mqtt-auth-service';
import { MQTTConversationHandlerBuilderService } from 'src/chat21-core/providers/mqtt/mqtt-conversation-handler-builder.service';
import { MQTTArchivedConversationsHandler } from 'src/chat21-core/providers/mqtt/mqtt-archivedconversations-handler';
import { MQTTConversationsHandler } from 'src/chat21-core/providers/mqtt/mqtt-conversations-handler';
import { MQTTConversationHandler } from 'src/chat21-core/providers/mqtt/mqtt-conversation-handler';
import { MQTTTypingService } from 'src/chat21-core/providers/mqtt/mqtt-typing.service';
import { MQTTPresenceService } from 'src/chat21-core/providers/mqtt/mqtt-presence.service';
import { MQTTGroupsHandler } from '../chat21-core/providers/mqtt/mqtt-groups-handler';
import { MQTTNotifications } from 'src/chat21-core/providers/mqtt/mqtt-notifications';

//NATIVE 
import { NativeUploadService } from 'src/chat21-core/providers/native/native-upload-service';
import { NativeImageRepoService } from './../chat21-core/providers/native/native-image-repo';

//LOGGER SERVICES
import { LocalSessionStorage } from 'src/chat21-core/providers/localSessionStorage';
//APP_STORAGE
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';

// PAGES
import { ConversationListPageModule } from './pages/conversations-list/conversations-list.module';
import { ConversationDetailPageModule } from './pages/conversation-detail/conversation-detail.module';
import { LoginPageModule } from './pages/authentication/login/login.module';
import { LoaderPreviewPageModule } from './pages/loader-preview/loader-preview.module';

// UTILS
import { ScrollbarThemeModule } from './utils/scrollbar-theme.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { ConversationInfoModule } from 'src/app/components/conversation-info/conversation-info.module';


// Directives
import { TooltipModule } from 'ng2-tooltip-directive';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { ReturnStatement } from '@angular/compiler';

// FACTORIES
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');

}

export function authenticationFactory(http: HttpClient, appConfig: AppConfigProvider, chat21Service: Chat21Service, appSorage: AppStorageService) {
  const config = appConfig.getConfig()
  if (config.chatEngine === CHAT_ENGINE_MQTT) {

    chat21Service.config = config.chat21Config;
    chat21Service.initChat();
    console.log("appConfig.getConfig()", config);
    const auth = new MQTTAuthService(http, chat21Service, appSorage);

    auth.setBaseUrl(appConfig.getConfig().apiUrl)
    return auth
  } else {

    FirebaseInitService.initFirebase(config.firebaseConfig)
    const auth = new FirebaseAuthService(http);
    auth.setBaseUrl(config.apiUrl)
    return auth
  }
}

export function conversationsHandlerFactory(chat21Service: Chat21Service, httpClient: HttpClient, appConfig: AppConfigProvider) {
  console.log('conversationsHandlerFactory: ');
  const config = appConfig.getConfig()
  if (config.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTConversationsHandler(chat21Service);
  } else {
    return new FirebaseConversationsHandler(httpClient, appConfig);
  }
}

export function archivedConversationsHandlerFactory(chat21Service: Chat21Service, appConfig: AppConfigProvider) {
  const config = appConfig.getConfig()
  if (config.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTArchivedConversationsHandler(chat21Service);
  } else {
    return new FirebaseArchivedConversationsHandler();
  }
}

export function conversationHandlerBuilderFactory(chat21Service: Chat21Service, appConfig: AppConfigProvider) {
  console.log('conversationHandlerBuilderFactory: ');
  const config = appConfig.getConfig()
  if (config.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTConversationHandlerBuilderService(chat21Service);
  } else {
    return new FirebaseConversationHandlerBuilderService();
  }
}

export function conversationHandlerFactory(chat21Service: Chat21Service, appConfig: AppConfigProvider) {
  const config = appConfig.getConfig()
  if (config.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTConversationHandler(chat21Service, false);
  } else {
    return new FirebaseConversationHandler(false);
  }
}

export function groupsHandlerFactory(http: HttpClient, chat21Service: Chat21Service, appConfig: AppConfigProvider) {
  const config = appConfig.getConfig()
  if (config.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTGroupsHandler(chat21Service)
  } else {
    return new FirebaseGroupsHandler(http, appConfig);
  }
}

export function typingFactory(appConfig: AppConfigProvider) {
  // console.log('typingFactory: ');
  const config = appConfig.getConfig()
  if (config.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTTypingService();
    // const typing = new MQTTTypingService();
    // typing.setTenant(config.tenant)
    // return typing
  } else {
    return new FirebaseTypingService();    
    // const typing = new FirebaseTypingService();
    // typing.setTenant(config.tenant)
    // return typing 
  }
}

export function presenceFactory(appConfig: AppConfigProvider) {
  const config = appConfig.getConfig()
  if (config.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTPresenceService();
    // const presence = new MQTTPresenceService();
    // presence.setTenant(config.tenant)
    // return presence
  } else {
    return new FirebasePresenceService();
    // const presence = new FirebasePresenceService();
    // presence.setTenant(config.tenant);
    // return presence
  }
}

export function imageRepoFactory(appConfig: AppConfigProvider) {

  const config = appConfig.getConfig()
  if (config.uploadEngine === UPLOAD_ENGINE_NATIVE) {
    const imageService = new NativeImageRepoService()
    imageService.setImageBaseUrl(config.baseImageUrl)
    return imageService
  } else {
    const imageService = new FirebaseImageRepoService();
    FirebaseInitService.initFirebase(config.firebaseConfig)
    imageService.setImageBaseUrl(config.baseImageUrl)
    return imageService
  }
}

export function uploadFactory(http: HttpClient, appConfig: AppConfigProvider, appStorage: AppStorageService) {

  const config = appConfig.getConfig()
  if (config.uploadEngine === UPLOAD_ENGINE_NATIVE) {
    const nativeUploadService = new NativeUploadService(http, appStorage)
    nativeUploadService.setBaseUrl(config.apiUrl)
    return nativeUploadService
  } else {
    return new FirebaseUploadService();
  }
}

export function notificationsServiceFactory(appConfig: AppConfigProvider) {
  const config = appConfig.getConfig()
  if (config.pushEngine === 'none') {
    return;
  } else if (config.pushEngine === PUSH_ENGINE_NATIVE) {
    const notifications = new MQTTNotifications();
    notifications.setTenant(config.tenant)
    return notifications
  } else {
    const notifications = new FirebaseNotifications();
    notifications.setTenant(config.tenant)
    return notifications
  }
}

const appInitializerFn = (appConfig: AppConfigProvider, logger: NGXLogger) => {
  return () => {
    let customLogger = new CustomLogger(true, logger, LogLevel.All)
    LoggerInstance.setInstance(customLogger)
    if (environment.remoteConfig) {
      return appConfig.loadAppConfig();
    }
  };
};

@NgModule({
  declarations: [
    AppComponent,
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
    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR,
      timestampFormat: 'HH:mm:ss.SSS',
      enableSourceMaps: true
    }),
    ScrollbarThemeModule,
    SharedModule,
    ConversationInfoModule,
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
      deps: [AppConfigProvider, NGXLogger]
    },
    {
      provide: MessagingAuthService,
      useFactory: authenticationFactory,
      deps: [HttpClient, AppConfigProvider, Chat21Service, AppStorageService]
    },
    {
      provide: PresenceService,
      useFactory: presenceFactory,
      deps: [AppConfigProvider]
    },
    {
      provide: TypingService,
      useFactory: typingFactory,
      deps: [AppConfigProvider]
    },
    {
      provide: UploadService,
      useFactory: uploadFactory,
      deps: [HttpClient, AppConfigProvider, AppStorageService]
    },
    {
      provide: ConversationsHandlerService,
      useFactory: conversationsHandlerFactory,
      deps: [Chat21Service, HttpClient, AppConfigProvider]
    },
    {
      provide: ArchivedConversationsHandlerService,
      useFactory: archivedConversationsHandlerFactory,
      deps: [Chat21Service, AppConfigProvider]
    },
    {
      provide: ConversationHandlerService,
      useFactory: conversationHandlerFactory,
      deps: [Chat21Service, AppConfigProvider]
    },
    {
      provide: GroupsHandlerService,
      useFactory: groupsHandlerFactory,
      deps: [HttpClient, Chat21Service, AppConfigProvider]
    },

    {
      provide: ImageRepoService,
      useFactory: imageRepoFactory,
      deps: [AppConfigProvider]
    },
    {
      provide: ConversationHandlerBuilderService,
      useFactory: conversationHandlerBuilderFactory,
      deps: [Chat21Service, AppConfigProvider]
    },
    {
      provide: NotificationsService,
      useFactory: notificationsServiceFactory,
      deps: [AppConfigProvider]
    },
    {
      provide: AppStorageService,
      useClass: LocalSessionStorage
    },
    StatusBar,
    SplashScreen,
    Keyboard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    EventsService,
    DatabaseProvider,
    Chooser,
    Chat21Service,
  ]
})
export class AppModule { }


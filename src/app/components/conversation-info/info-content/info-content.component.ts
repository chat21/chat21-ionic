import { Component, OnInit, Input } from '@angular/core';

// models
import { UserModel } from 'src/app/models/user';

@Component({
  selector: 'app-info-content',
  templateUrl: './info-content.component.html',
  styleUrls: ['./info-content.component.scss'],
})


export class InfoContentComponent implements OnInit {
  @Input() channelType: string;
  @Input() urlConversationSupportGroup: string;
  @Input() openInfoConversation: boolean;
  @Input() translationMap: Map<string, string>;
  @Input() member: UserModel;

  public urlConversation: any;

  constructor() { }

  ngOnInit() {
    console.log('InfoContentComponent:::');
    console.log(this.member);
  }


}
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { DomSanitizer} from '@angular/platform-browser';

// // services
// import { AppConfigProvider } from '../../services/app-config';
// import { UserService } from '../../services/user.service';
// import { PresenceService } from '../../services/presence.service';
// import { EventsService } from '../../services/events-service';
// import { CustomTranslateService } from '../../services/custom-translate.service';

// // models
// import { UserModel } from '../../models/user';

// // utils
// import { avatarPlaceholder, getColorBck, isInArray, setLastDateWithLabels } from '../../utils/utils';


// @Component({
//   selector: 'app-conversation-info',
//   templateUrl: './conversation-info.page.html',
//   styleUrls: ['./conversation-info.page.scss'],
// })
// export class ConversationInfoPage implements OnInit {
//   // ========= begin:: Input/Output values ============//
//   // @Output() eventClose = new EventEmitter();

//   @Input() attributes: any = {};
//   @Input() channelType: string;
//   @Input() conversationWith: string;
//   @Input() openInfoConversation: boolean;
//   // ========= end:: Input/Output values ============//

//   private DASHBOARD_URL: string;
//   private FIREBASESTORAGE_BASE_URL_IMAGE: string;
//   private urlStorageBucket: string;
//   private projectID: string;
//   private subscriptions = [];

//   public urlConversation: any;
//   public member: UserModel;
//   public translationMap: Map<string, string>;

//   constructor(
//     private appConfig: AppConfigProvider,
//     private sanitizer: DomSanitizer,
//     private userService: UserService,
//     private presenceService: PresenceService,
//     private events: EventsService,
//     private translateService: CustomTranslateService,
//   ) {
//     this.DASHBOARD_URL = this.appConfig.getConfig().DASHBOARD_URL;
//     this.FIREBASESTORAGE_BASE_URL_IMAGE = this.appConfig.getConfig().FIREBASESTORAGE_BASE_URL_IMAGE;
//     this.urlStorageBucket = this.appConfig.getConfig().firebaseConfig.storageBucket + '/o/profiles%2F';
//   }



//   public translations() {
//     const keys = [
//       'LABEL_TODAY',
//       'LABEL_TOMORROW',
//       'LABEL_TO',
//       'LABEL_LAST_ACCESS',
//       'ARRAY_DAYS',
//       'LABEL_ACTIVE_NOW'
//     ];
//     this.translationMap = this.translateService.translateLanguage(keys);
//   }







//   /**
//    *
//    */
//   setSubscriptions() {
//     console.log('setSubscriptions');
//     this.presenceService.userIsOnline(this.conversationWith);
//     this.presenceService.lastOnlineForUser(this.conversationWith);
//     let keySubscription = '';
//     keySubscription = 'is-online-' + this.conversationWith;
//     if (!isInArray(keySubscription, this.subscriptions)) {
//       this.subscriptions.push(keySubscription);
//       this.events.subscribe(keySubscription, this.userIsOnLine);
//     }
//     keySubscription = 'last-connection-date-' + this.conversationWith;
//     if (!isInArray(keySubscription, this.subscriptions)) {
//       this.subscriptions.push(keySubscription);
//       this.events.subscribe(keySubscription, this.userLastConnection);
//     }
//   }

//   /**
//    *
//    */
//   userIsOnLine = (userId: string, isOnline: boolean) => {
//     console.log('************** userIsOnLine', userId, isOnline);
//     this.member.online = isOnline;
//   }

//   /**
//    *
//    */
//   userLastConnection = (userId: string, timestamp: string) => {
//     console.log('************** userLastConnection', userId, timestamp);
//     if (timestamp && timestamp !== '') {
//       const lastConnectionDate = setLastDateWithLabels(this.translationMap, timestamp);
//       this.member.lastConnection = lastConnectionDate;
//     }
//   }

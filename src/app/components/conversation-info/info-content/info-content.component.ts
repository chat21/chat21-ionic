import { Component, OnInit, Input } from '@angular/core';
// models
import { UserModel } from 'src/chat21-core/models/user';
import { ConversationModel } from 'src/chat21-core/models/conversation';

import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service';
import { AuthService } from 'src/chat21-core/providers/abstract/auth.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ContactsService } from 'src/app/services/contacts/contacts.service';
import { AppConfigProvider } from '../../../services/app-config';
import { setChannelType } from '../../../../chat21-core/utils/utils';
import { TYPE_SUPPORT_GROUP, TYPE_DIRECT, TYPE_GROUP } from '../../../../chat21-core/utils/constants';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-info-content',
  templateUrl: './info-content.component.html',
  styleUrls: ['./info-content.component.scss'],
})


export class InfoContentComponent implements OnInit {

  @Input() openInfoConversation: boolean;
  @Input() translationMap: Map<string, string>;
  // @Input() member: UserModel;
  @Input() loggedUser: UserModel
  @Input() tenant: string
  @Input() groupDetail: any

  public member: UserModel;
  public urlConversation: any;
  // public loggedUser: UserModel;
  // private tenant: string;
  public conversationWith: string;
  public conversationWithFullname: string;
  public conv_type: string;
  private channelType: string;
  private urlConversationSupportGroup: any;
  public conversations: Array<ConversationModel> = [];
  public conversationSelected: any;
  public panelType: string;
  public project_id: string

  constructor(
    public archivedConversationsHandlerService: ArchivedConversationsHandlerService,
    public conversationsHandlerService: ConversationsHandlerService,
    public authService: AuthService,
    private route: ActivatedRoute,
    public contactsService: ContactsService,
    public appConfigProvider: AppConfigProvider,
    private sanitizer: DomSanitizer,
  ) {
    console.log('INFO-CONTENT-COMP HELLO (CONSTUCTOR) !!!!!');
    // this.loggedUser = this.authService.getCurrentUser();
    // console.log('INFO-CONTENT-COMP loggedUser: ', this.loggedUser);
    this.tenant = environment.tenant;

    this.route.paramMap.subscribe(params => {
      console.log('INFO-CONTENT-COMP initialize params: ', params);
      this.conversationWith = params.get('IDConv');
      this.conversationWithFullname = params.get('FullNameConv');
      this.conv_type = params.get('Convtype');
      const conversationWith_segments = this.conversationWith.split('-');
      console.log('INFO-CONTENT-COMP - selectInfoContentTypeComponent conversationWith_segments: ', conversationWith_segments);
      this.project_id = conversationWith_segments[2]

      // this.project_id = this.groupDetail['attributes']['projectId']
    });
  }

  ngOnInit() {
    console.log('INFO-CONTENT-COMP CALLING ngOnInit');
    console.log('INFO-CONTENT-COMP  Logged user', this.loggedUser);
    console.log('INFO-CONTENT-COMP  Tenant', this.tenant);
    console.log('INFO-CONTENT-COMP  conversationWith', this.conversationWith);
    console.log('INFO-CONTENT-COMP  conversationWithFullname', this.conversationWithFullname);
    console.log('INFO-CONTENT-COMP  conv_type', this.conv_type);
    console.log('INFO-CONTENT-COMP  project_id', this.project_id);
    // this.initConversationsHandler(); // nk

    this.selectInfoContentTypeComponent(); // nk

  }


  //DARINOMINARE 
  // initConversationsHandler() {
  //   console.log('INFO-CONTENT-COMP initConversationsHandler ::: TENANT: ', this.tenant, 'LOGGED-USER-ID' , this.loggedUser.uid, ' CONV-WITH ' , this.conversationWith, ' CONV-TYPE ', this.conv_type);
  //   if (this.conv_type === 'active' || this.conv_type === 'new') {
  //     // qui al refresh array conv è null
  //     console.log('INFO-CONTENT-COMP initConversationsHandler USE CASE conv_type ACTIVE');
  //     this.conversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
  //       console.log('INFO-CONTENT-COMP initConversationsHandler USE CASE conv_type ACTIVE - GET conv FROM ACTIVE - CONV FOUND ', conv);
  //       if (conv) {
  //         this.conversationSelected = conv;
  //         this.conversationWith = conv.uid;
  //         this.selectInfoContentTypeComponent();
  //       } else {
  //         // CONTROLLO SE LA CONV E' NEL NODO DELLE CHAT ARCHIVIATE
  //         console.log('INFO-CONTENT-COMP initConversationsHandler conv null', conv)
  //         console.log('INFO-CONTENT-COMP initConversationsHandler USE CASE conv_type ACTIVE - CONV NOT FOUND - get from ARCHIVED');


  //         this.archivedConversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
  //           console.log('INFO-CONTENT-COMP initConversationsHandler USE CASE conv_type ACTIVE - GET conv FROM ARCHIVED - CONV FOUND ', conv);
  //           if (conv) {
  //             this.conversationSelected = conv;
  //             this.conversationWith = conv.uid;
  //             this.selectInfoContentTypeComponent();
  //           } else {
  //             // SHOW ERROR --> nessuna conversazione trovata tra attiVe e archiviate
  //           }
  //         });
  //       }
  //     });

  //   } else if (this.conv_type === 'archived') {
  //     console.log('INFO-CONTENT-COMP initConversationsHandler USE CASE conv_type ARCHIVED ');
  //     this.archivedConversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
  //       console.log('INFO-CONTENT-COMP initConversationsHandler USE CASE conv_type ARCHIVED GET conv FROM ARCHIVED - CONV FOUND ', conv);
  //       if (conv) {
  //         this.conversationSelected = conv
  //         this.conversationWith = conv.uid
  //         this.selectInfoContentTypeComponent();
  //       } else {
  //         // CONTROLLO SE LA CONV E' NEL NODO DELLE CHAT ATTIVE
  //         console.log('INFO-CONTENT-COMP initConversationsHandler conv null', conv)
  //         console.log('INFO-CONTENT-COMP initConversationsHandler USE CASE conv_type ARCHIVED - CONV NOT FOUND - get from ARCHIVED');

  //         this.conversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
  //           console.log('INFO-CONTENT-COMP initConversationsHandler USE CASE conv_type ARCHIVED GET conv FROM ACTIVE - CONV FOUND ', conv);
  //           if (conv) {
  //             this.conversationSelected = conv;
  //             this.conversationWith = conv.uid;
  //             this.selectInfoContentTypeComponent();
  //           } else {
  //             // SHOW ERROR --> nessuna conversazione trovata tra attice e archiviate
  //           }
  //         });
  //       }
  //     });
  //   } else {
  //     // use case conversation new (write to)
  //     // this.selectInfoContentTypeComponent()
  //   }
  // }
  // ---------------------------------------------------
  // START SET INFO COMPONENT
  // ---------------------------------------------------
  selectInfoContentTypeComponent() {
    // console.log('INFO-CONTENT-COMP - selectInfoContentTypeComponent conversationWith: ', this.conversationWith);


    if (this.conversationWith) {
      // this.channelType = setChannelType(this.conversationWith , 'INFO-CONTENT');
      this.panelType = 'direct-panel'
      // console.log('INFO-CONTENT-COMP - panelType: ', this.panelType);
      // console.log('INFO-CONTENT-COMP - channelType: ', this.channelType);
      // controlllare come comincia conversationWith nn + channel type

      if (this.conversationWith.startsWith("support-group")) {
        console.log('INFO-CONTENT-COMP - selectInfoContentTypeComponent - SUPPORT_GROUP - conversationWith start with "support-group"  ', this.conversationWith.startsWith("support-group"));
        this.urlConversationSupportGroup = '';
        this.setInfoSupportGroup();
        this.panelType = 'support-group-panel'
        console.log('INFO-CONTENT-COMP - panelType: ', this.panelType);

      } else if (this.conversationWith.startsWith("group-")) {
        console.log('INFO-CONTENT-COMP - selectInfoContentTypeComponent - GROUP -  conversationWith start with "group-"  ', this.conversationWith.startsWith("group-"));
        this.setInfoGroup();
        this.panelType = 'group-panel'
        console.log('INFO-CONTENT-COMP - panelType: ', this.panelType);

      } else {
        console.log('INFO-CONTENT-COMP - selectInfoContentTypeComponent - DIRECT - conversationWith NOT START with "group-" NOR with "support-group" ',);
        this.setInfoDirect();
        this.panelType = 'direct-panel'
        console.log('INFO-CONTENT-COMP - panelType: ', this.panelType);

      }



      // if (this.channelType === TYPE_DIRECT) {
      //   console.log('INFO-CONTENT-COMP - selectInfoContentTypeComponent CHANNEL-TYPE: ', this.channelType);
      //   this.setInfoDirect();
      // } else if (this.channelType === TYPE_GROUP) {
      //   console.log('INFO-CONTENT-COMP - selectInfoContentTypeComponent CHANNEL-TYPE: ', this.channelType);
      //   this.setInfoGroup();
      // } else if (this.channelType === TYPE_SUPPORT_GROUP) {
      //   console.log('INFO-CONTENT-COMP - selectInfoContentTypeComponent CHANNEL-TYPE: ', this.channelType);
      //   this.urlConversationSupportGroup = '';
      //   this.setInfoSupportGroup();
      // }
    }
  }

  // ---------------------------------------------------
  // @ setInfoDirect
  // ---------------------------------------------------
  setInfoDirect() {
    console.log('INFO-CONTENT-COMP - setInfoDirect ', this.conversationWith);
    console.log('INFO-CONTENT-COMP - setInfoDirect member', this.member);
   
    
    this.member = null;
    const that = this;
    const tiledeskToken = this.authService.getTiledeskToken();
    this.contactsService.loadContactDetail(tiledeskToken, this.conversationWith)
      .subscribe(res => {
        console.log('INFO-CONTENT-COMP - setInfoDirect loadContactDetail RES', res);
        this.member = res
      }, (error) => {
        console.log('INFO-CONTENT-COMP - setInfoDirect loadContactDetail - ERROR  ', error);

      }, () => {
        console.log('INFO-CONTENT-COMP - setInfoDirect loadContactDetail * COMPLETE *');

      });
  }

  // ---------------------------------------------------
  // @ setInfoGroup
  // ---------------------------------------------------
  setInfoGroup() {
    console.log('INFO-CONTENT-COMP - setInfoGroup groupDetail ', this.groupDetail);
    
    // group
  }


  // ---------------------------------------------------
  // @ setInfoGroup
  // ---------------------------------------------------
  setInfoSupportGroup() {
  //   let projectID = '';
  //   const tiledeskToken = this.authService.getTiledeskToken();
  //   const DASHBOARD_URL = this.appConfigProvider.getConfig().dashboardUrl;
  //   if (this.conversationSelected && this.conversationSelected.attributes) {
  //     projectID = this.conversationSelected.attributes.projectId;
  //   }
  //   console.log('INFO-CONTENT-COMP setInfoSupportGroup conversationSelected ', this.conversationSelected)
  //   console.log('INFO-CONTENT-COMP setInfoSupportGroup projectID ', projectID)
  //   if (projectID && this.conversationWith) {
  //     console.log('INFO-CONTENT-COMP setInfoSupportGroup HERE YES ')
  //     let urlPanel = DASHBOARD_URL + '#/project/' + projectID + '/request-for-panel/' + this.conversationWith;
  //     urlPanel += '?token=' + tiledeskToken;
  //     console.log('INFO-CONTENT-COMP setInfoSupportGroup urlPanel ', urlPanel)
  //     const urlConversationTEMP = this.sanitizer.bypassSecurityTrustResourceUrl(urlPanel);
  //     this.urlConversationSupportGroup = urlConversationTEMP;
  //   } else {
  //     this.urlConversationSupportGroup = this.sanitizer.bypassSecurityTrustResourceUrl(DASHBOARD_URL);
  //   }
  //   console.log('INFO-CONTENT-COMP  urlConversationSupportGroup:: ', this.urlConversationSupportGroup, this.conversationSelected);
  // }


 
  const tiledeskToken = this.authService.getTiledeskToken();
  const DASHBOARD_URL = this.appConfigProvider.getConfig().dashboardUrl;
  
  console.log('INFO-CONTENT-COMP setInfoSupportGroup projectID ', this.project_id)
  if (this.conversationWith) {
   
    let urlPanel = DASHBOARD_URL + '#/project/' + this.project_id + '/request-for-panel/' + this.conversationWith;
    urlPanel += '?token=' + tiledeskToken;
   
    const urlConversationTEMP = this.sanitizer.bypassSecurityTrustResourceUrl(urlPanel);
    this.urlConversationSupportGroup = urlConversationTEMP;
    console.log('INFO-CONTENT-COMP setInfoSupportGroup urlConversationSupportGroup ', this.urlConversationSupportGroup)
  } else {
    this.urlConversationSupportGroup = this.sanitizer.bypassSecurityTrustResourceUrl(DASHBOARD_URL);
  }
  console.log('INFO-CONTENT-COMP  urlConversationSupportGroup:: ', this.urlConversationSupportGroup, this.conversationSelected);
}



}
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { DomSanitizer} from '@angular/platform-browser';

// // services
// import { AppConfigProvider } from '../../services/app-config';
// import { UserService } from '../../services/user.service';
// import { PresenceService } from '../../services/presence.service';
// import { EventsService } from '../../services/events-service';
// import { CustomTranslateService } from 'src/chat21-core/custom-translate.service';

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
//     this.DASHBOARD_URL = this.appConfig.getConfig().dashboardUrl;
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

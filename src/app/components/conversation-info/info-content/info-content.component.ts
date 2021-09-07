import { TiledeskAuthService } from './../../../../chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TiledeskService } from '../../../services/tiledesk/tiledesk.service';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
// models
import { UserModel } from 'src/chat21-core/models/user';
import { ConversationModel } from 'src/chat21-core/models/conversation';

import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service';

import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ContactsService } from 'src/app/services/contacts/contacts.service';
import { AppConfigProvider } from '../../../services/app-config';
import { setChannelType } from '../../../../chat21-core/utils/utils';
import { TYPE_SUPPORT_GROUP, TYPE_DIRECT, TYPE_GROUP } from '../../../../chat21-core/utils/constants';
import { DomSanitizer } from '@angular/platform-browser';

import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';


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
  public urlConversationSupportGroup: any;
  public conversations: Array<ConversationModel> = [];
  public conversationSelected: any;
  public panelType: string;
  public project_id: string
  private logger: LoggerService = LoggerInstance.getInstance();
  public IS_GROUP_PANEL: boolean = false

  constructor(
    public archivedConversationsHandlerService: ArchivedConversationsHandlerService,
    public conversationsHandlerService: ConversationsHandlerService,
    public tiledeskAuthService: TiledeskAuthService,
    private route: ActivatedRoute,
    public contactsService: ContactsService,
    public appConfigProvider: AppConfigProvider,
    private sanitizer: DomSanitizer,
    public tiledeskService: TiledeskService

  ) {
    this.logger.log('[INFO-CONTENT-COMP] HELLO (CONSTUCTOR) !!!!!');
    // this.loggedUser = this.authService.getCurrentUser();
    // this.logger.log('INFO-CONTENT-COMP loggedUser: ', this.loggedUser);

    const appconfig = appConfigProvider.getConfig()
    // this.tenant = appconfig.tenant;
    this.tenant = appconfig.firebaseConfig.tenant;
    this.logger.log('[INFO-CONTENT-COMP] appconfig firebaseConfig tenant ', this.tenant);


    this.route.paramMap.subscribe(params => {
      this.logger.log('[INFO-CONTENT-COMP] initialize params: ', params);
      this.conversationWith = params.get('IDConv');
      this.logger.log('[INFO-CONTENT-COMP] - paramMap.subscribe conversationWith: ', this.conversationWith);
      this.conversationWithFullname = params.get('FullNameConv');
      this.conv_type = params.get('Convtype');

      const conversationWith_segments = this.conversationWith.split('-');
      this.logger.log('[INFO-CONTENT-COMP] - paramMap.subscribe conversationWith_segments: ', conversationWith_segments);

      if (this.conversationWith.startsWith("support-group")) {
        if (conversationWith_segments.length === 4) {
          this.project_id = conversationWith_segments[2];

          this.selectInfoContentTypeInfoSupportGroup();

        } else {

          this.getProjectIdByConversationWith(this.conversationWith)
        }
      } else {
        this.selectInfoContentTypeDirectAndGroup(this.conversationWith);
      }

      // this.project_id = this.groupDetail['attributes']['projectId']
    });

  }

  getProjectIdByConversationWith(conversationWith: string) {
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken();

    this.tiledeskService.getProjectIdByConvRecipient(tiledeskToken, conversationWith).subscribe(res => {
      this.logger.log('[INFO-CONTENT-COMP] - GET PROJECTID BY CONV RECIPIENT RES', res);

      if (res) {
        this.project_id = res.id_project
        this.logger.log('[INFO-CONTENT-COMP] - GET PROJECTID BY CONV RECIPIENT  this.project_id', this.project_id);
      }

    }, (error) => {
      this.logger.error('[INFO-CONTENT-COMP] - GET PROJECTID BY CONV RECIPIENT - ERROR  ', error);

    }, () => {
      this.logger.log('[INFO-CONTENT-COMP] - GET PROJECTID BY CONV RECIPIENT * COMPLETE *');
      this.selectInfoContentTypeInfoSupportGroup();
    });
  }

  ngOnInit() {
    this.logger.log('>>> N INFO-CONTENT-COMP CALLING ngOnInit');
    this.logger.log('[INFO-CONTENT-COMP] - ngOnInit - Logged user', this.loggedUser);
    this.logger.log('[INFO-CONTENT-COMP] - ngOnInit - Tenant', this.tenant);
    this.logger.log('[INFO-CONTENT-COMP] - ngOnInit - conversationWith', this.conversationWith);
    this.logger.log('[INFO-CONTENT-COMP] - ngOnInit - conversationWithFullname', this.conversationWithFullname);
    this.logger.log('[INFO-CONTENT-COMP] - ngOnInit - conv_type', this.conv_type);
    this.logger.log('[INFO-CONTENT-COMP] - ngOnInit - project_id', this.project_id);
    // this.initConversationsHandler(); // nk

    // this.selectInfoContentTypeComponent(); // nk
  }
  ngAfterViewInit() {
    this.logger.log('[INFO-CONTENT-COMP] - ngAfterViewInit');

  }

  ngOnDestroy() {
    this.logger.log('[INFO-CONTENT-COMP] - ngOnDestroy');
  }



  selectInfoContentTypeInfoSupportGroup() {
    this.panelType = ''
    this.logger.log('[INFO-CONTENT-COMP] - selectInfoContentTypeComponent - SUPPORT_GROUP - conversationWith start with "support-group"  ', this.conversationWith.startsWith("support-group"));
    this.urlConversationSupportGroup = '';
    this.setInfoSupportGroup();
    this.panelType = 'support-group-panel';
    this.IS_GROUP_PANEL = false;
    this.logger.log('[INFO-CONTENT-COMP] - panelType IS_GROUP_PANEL: ', this.IS_GROUP_PANEL);
    this.logger.log('[INFO-CONTENT-COMP] - panelType: ', this.panelType);
  } 

  // ---------------------------------------------------
  // START SET INFO COMPONENT
  // ---------------------------------------------------
  selectInfoContentTypeDirectAndGroup(conversationWith) {
    this.logger.log('[INFO-CONTENT-COMP] - selectInfoContentTypeComponent conversationWith: ', this.conversationWith);

    if (conversationWith) {
      this.panelType = 'direct-panel'

      // if (conversationWith.startsWith("support-group")) {
      //   this.panelType = ''
      //   this.logger.log('[INFO-CONTENT-COMP] - selectInfoContentTypeComponent - SUPPORT_GROUP - conversationWith start with "support-group"  ', this.conversationWith.startsWith("support-group"));
      //   this.urlConversationSupportGroup = '';
      //   this.setInfoSupportGroup();
      //   this.panelType = 'support-group-panel';
      //   this.IS_GROUP_PANEL = false;
      //   this.logger.log('[INFO-CONTENT-COMP] - panelType IS_GROUP_PANEL: ', this.IS_GROUP_PANEL);
      //   this.logger.log('[INFO-CONTENT-COMP] - panelType: ', this.panelType);

      // } else
     if (conversationWith.startsWith("group-")) {
        this.panelType = ''
        this.logger.log('[INFO-CONTENT-COMP] - selectInfoContentTypeComponent - GROUP -  conversationWith start with "group-"  ', this.conversationWith.startsWith("group-"));
        this.setInfoGroup();
        this.panelType = 'group-panel';
        this.IS_GROUP_PANEL = true;
        this.logger.log('[INFO-CONTENT-COMP] - panelType IS_GROUP_PANEL: ', this.IS_GROUP_PANEL);
        this.logger.log('[INFO-CONTENT-COMP] - panelType: ', this.panelType);

      } else {
        this.panelType = ''
        this.logger.log('[INFO-CONTENT-COMP] - selectInfoContentTypeComponent - DIRECT - conversationWith NOT START with "group-" NOR with "support-group" ',);
        this.setInfoDirect();
        this.panelType = 'direct-panel';
        this.IS_GROUP_PANEL = false;
        this.logger.log('[INFO-CONTENT-COMP] - panelType IS_GROUP_PANEL: ', this.IS_GROUP_PANEL);
        this.logger.log('[INFO-CONTENT-COMP] - panelType: ', this.panelType);

      }
    }
  }

  // private deleteHandler(): void {
  //   if ( this.panelType !== 'group-panel') {
  //     this.childExists = false;
  //     this.logger.log('INFO-CONTENT-COMP - childExists panelType ', this.panelType);
  //     this.logger.log('INFO-CONTENT-COMP - childExists ', this.childExists);
  //   } else if  (this.panelType === 'group-panel'){
  //     this.childExists = true;
  //     this.logger.log('INFO-CONTENT-COMP - childExists panelType ', this.panelType);
  //     this.logger.log('INFO-CONTENT-COMP - childExists ', this.childExists);
  //   }
  // }

  // ---------------------------------------------------
  // @ setInfoDirect
  // ---------------------------------------------------
  setInfoDirect() {
    this.logger.log('[INFO-CONTENT-COMP] - setInfoDirect ', this.conversationWith);

    this.member = null;

    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken();
    this.contactsService.loadContactDetail(tiledeskToken, this.conversationWith)
      .subscribe(res => {
        this.logger.log('[INFO-CONTENT-COMP] - setInfoDirect loadContactDetail RES', res);
        this.member = res
        this.logger.log('[INFO-CONTENT-COMP] - setInfoDirect member', this.member);
      }, (error) => {
        this.logger.error('[INFO-CONTENT-COMP] - setInfoDirect loadContactDetail - ERROR  ', error);
      }, () => {
        this.logger.log('I[INFO-CONTENT-COMP] - setInfoDirect loadContactDetail * COMPLETE *');
      });
  }

  // ---------------------------------------------------
  // @ setInfoGroup
  // ---------------------------------------------------
  setInfoGroup() {
    this.logger.log('[INFO-CONTENT-COMP] - setInfoGroup groupDetail ', this.groupDetail);
  }


  // ---------------------------------------------------
  // @ setInfoSupportGroup
  // ---------------------------------------------------
  setInfoSupportGroup() {
    this.logger.log('[INFO-CONTENT-COMP] setInfoSupportGroup HERE YES ');
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken();
    const DASHBOARD_URL = this.appConfigProvider.getConfig().dashboardUrl;
    this.logger.log('[INFO-CONTENT-COMP] setInfoSupportGroup projectID ', this.project_id);

    if (this.conversationWith) {
      let urlPanel = DASHBOARD_URL + '#/project/' + this.project_id + '/request-for-panel/' + this.conversationWith;
      urlPanel += '?token=' + tiledeskToken;

      const urlConversationTEMP = this.sanitizer.bypassSecurityTrustResourceUrl(urlPanel);
      this.urlConversationSupportGroup = urlConversationTEMP;
      this.logger.log('[INFO-CONTENT-COMP] setInfoSupportGroup urlConversationSupportGroup ', this.urlConversationSupportGroup)
    } else {
      this.urlConversationSupportGroup = this.sanitizer.bypassSecurityTrustResourceUrl(DASHBOARD_URL);
    }
    this.logger.log('[INFO-CONTENT-COMP] urlConversationSupportGroup:: ', this.urlConversationSupportGroup, this.conversationSelected);
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
//     this.logger.log('setSubscriptions');
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
//     this.logger.log('************** userIsOnLine', userId, isOnline);
//     this.member.online = isOnline;
//   }

//   /**
//    *
//    */
//   userLastConnection = (userId: string, timestamp: string) => {
//     this.logger.log('************** userLastConnection', userId, timestamp);
//     if (timestamp && timestamp !== '') {
//       const lastConnectionDate = setLastDateWithLabels(this.translationMap, timestamp);
//       this.member.lastConnection = lastConnectionDate;
//     }
//   }

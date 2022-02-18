import { Component, EventEmitter, Input, IterableDiffers, KeyValueDiffers, OnInit, Output } from '@angular/core';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { convertMessage } from 'src/chat21-core/utils/utils';
import { ListConversationsComponent } from '../list-conversations/list-conversations.component';
import { Platform } from '@ionic/angular';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';
import { NetworkService } from '../../../services/network-service/network.service';
import { AppConfigProvider } from 'src/app/services/app-config';
import { DomSanitizer } from '@angular/platform-browser'
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';

// import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
// import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'ion-list-conversations',
  templateUrl: './ion-list-conversations.component.html',
  styleUrls: ['./ion-list-conversations.component.scss'],
})
export class IonListConversationsComponent extends ListConversationsComponent implements OnInit {

  @Input() uidConvSelected: string;
  @Output() onCloseConversation = new EventEmitter<ConversationModel>();

  convertMessage = convertMessage;
  isApp: boolean = false;
  public logger: LoggerService = LoggerInstance.getInstance();
  public currentYear: any;
  public browserLang: string;

  public PROJECT_FOR_PANEL: any;
  public archive_btn_tooltip: string;
  public resolve_btn_tooltip: string;

  tooltip_options = {
    'show-delay': 0,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 100
  };
  /**
   * 
   * @param iterableDiffers 
   * @param imageRepoService 
   * @param platform 
   */
  constructor(
    public iterableDiffers: IterableDiffers,
    public kvDiffers: KeyValueDiffers,
    public platform: Platform,
    private translate: TranslateService,
    private networkService: NetworkService,
    private appConfigProvider: AppConfigProvider,
    private sanitizer: DomSanitizer,
    public tiledeskAuthService: TiledeskAuthService,
  
  ) {
    super(iterableDiffers, kvDiffers)
    this.setMomentLocale();


    // if (this.browserLang) {

    //   moment.locale(this.browserLang)
    //   // if (this.browserLang === 'it') {
    //   //   // this.translate.use('it');
    //   //   moment.locale('it')

    //   // } else {
    //   //   // this.translate.use('en');
    //   //   moment.locale('en')
    //   // }
    // }

    this.currentYear = moment().format('YYYY');
    this.logger.log('[ION-LIST-CONVS-COMP] - currentYear ', this.currentYear)

    const DASHBOARD_BASE_URL = this.appConfigProvider.getConfig().dashboardUrl;

    // console.log('[ION-LIST-CONVS-COMP] - DASHBOARD_BASE_URL ', DASHBOARD_BASE_URL)
    this.PROJECT_FOR_PANEL = this.sanitizer.bypassSecurityTrustResourceUrl(DASHBOARD_BASE_URL + '#/project-for-panel');
    this.translateLbls();
    
  }


  translateLbls() {
    this.translate.get('Resolve')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        this.resolve_btn_tooltip = text;
        //  console.log('[ION-LIST-CONVS-COMP] getTranslations Resolve : ', text)

      });
      this.translate.get('Archive')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        this.archive_btn_tooltip = text;
        //  console.log('[ION-LIST-CONVS-COMP] getTranslations Resolve : ', text)
      });
  }

  setMomentLocale() {
    this.browserLang = this.translate.getBrowserLang();
    const currentUser = this.tiledeskAuthService.getCurrentUser();
    this.logger.log('[ION-LIST-CONVS-COMP] - ngOnInit - currentUser ', currentUser)
    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid
      this.logger.log('[ION-LIST-CONVS-COMP] - ngOnInit - currentUserId ', currentUserId)
    }

    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
    this.logger.log('[ION-LIST-CONVS-COMP] stored_preferred_lang: ', stored_preferred_lang);


    let chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      chat_lang = this.browserLang
    } else if (this.browserLang && stored_preferred_lang) {
      chat_lang = stored_preferred_lang
    }
    moment.locale(chat_lang)
  }

  ngOnInit() {
    this.isApp = this.platform.is('ios') || this.platform.is('android')
    this.logger.log('[ION-LIST-CONVS-COMP] - ngOnInit - IS-APP ', this.isApp)
    this.logger.log('[ION-LIST-CONVS-COMP] - ngOnInit - Platform', this.platform.platforms());
  }





  // --------------------------------------------------
  // subdsribe to event
  // --------------------------------------------------
  // subdcribeToWatchToConnectionStatus() {
  //   this.logger.log('[ION-LIST-CONVS-COMP] subdcribeToWatchToConnectionStatus ');
  //   // this.events.subscribe('uidConvSelected:changed', this.subscribeChangedConversationSelected);
  //   this.events.subscribe('internetisonline', (internetisonline) => {
  //     // user and time are the same arguments passed in `events.publish(user, time)`
  //     this.logger.log('[ION-LIST-CONVS-COMP] internetisonline ',internetisonline);
  //     if (internetisonline === true) {
  //       this.isOnline = true;
  //     } else {
  //       this.isOnline = false;
  //     }
  //   });
  // }



  closeConversation(conversation: ConversationModel) {
    var conversationId = conversation.uid;
    this.logger.log('[ION-LIST-CONVS-COMP] - closeConversation - conversationId ', conversationId)
    this.onCloseConversation.emit(conversation)
  }


}

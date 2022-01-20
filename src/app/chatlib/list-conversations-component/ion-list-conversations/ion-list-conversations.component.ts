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
// import { EventsService } from 'src/app/services/events-service';
// import { TiledeskService } from '../../../services/tiledesk/tiledesk.service';
import { NetworkService } from '../../../services/network-service/network.service';
import { AppConfigProvider } from 'src/app/services/app-config';
import { DomSanitizer } from '@angular/platform-browser'
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
    // private events: EventsService,
    // private tiledeskService: TiledeskService,
    private networkService: NetworkService,
    private appConfigProvider: AppConfigProvider,
    private sanitizer: DomSanitizer,
  ) {
    super(iterableDiffers, kvDiffers)
    this.browserLang = this.translate.getBrowserLang();
    if (this.browserLang) {

      moment.locale(this.browserLang)
      // if (this.browserLang === 'it') {
      //   // this.translate.use('it');
      //   moment.locale('it')

      // } else {
      //   // this.translate.use('en');
      //   moment.locale('en')
      // }
    }

    this.currentYear = moment().format('YYYY');
    this.logger.log('[ION-LIST-CONVS-COMP] - currentYear ', this.currentYear)

    const DASHBOARD_BASE_URL = this.appConfigProvider.getConfig().dashboardUrl;

    // console.log('[ION-LIST-CONVS-COMP] - DASHBOARD_BASE_URL ', DASHBOARD_BASE_URL)
    this.PROJECT_FOR_PANEL = this.sanitizer.bypassSecurityTrustResourceUrl(DASHBOARD_BASE_URL + '#/project-for-panel');
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

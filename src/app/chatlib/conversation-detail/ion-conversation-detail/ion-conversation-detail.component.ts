import { ConversationContentComponent } from '../conversation-content/conversation-content.component';
import { ChangeDetectorRef, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';


import { MESSAGE_TYPE_INFO, MESSAGE_TYPE_MINE, MESSAGE_TYPE_OTHERS } from 'src/chat21-core/utils/constants';
import { isChannelTypeGroup, isFirstMessage, isInfo, isMine, messageType } from 'src/chat21-core/utils/utils-message';
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
import { isFile, isFrame, isImage } from 'src/chat21-core/utils/utils-message';

import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AppConfigProvider } from 'src/app/services/app-config';
@Component({
  selector: 'ion-conversation-detail',
  templateUrl: './ion-conversation-detail.component.html',
  styleUrls: ['./ion-conversation-detail.component.scss'],
})
export class IonConversationDetailComponent extends ConversationContentComponent implements OnInit {

  @Input() senderId: string;
  @Input() channelType: string;
  @Output() onImageRendered = new EventEmitter<boolean>()
  @Output() onAddUploadingBubble = new EventEmitter<boolean>();

  public public_Key: any
  public areVisibleCAR: boolean
  public support_mode: boolean
  public uploadProgress: number = 100
  public fileType: any
  public browserLang: string;
  public addAsCannedResponseTooltipText: string;
  isImage = isImage;
  isFile = isFile;
  isFrame = isFrame;

  isMine = isMine;
  isInfo = isInfo;
  isFirstMessage = isFirstMessage;
  messageType = messageType;
  isChannelTypeGroup = isChannelTypeGroup;

  MESSAGE_TYPE_INFO = MESSAGE_TYPE_INFO;
  MESSAGE_TYPE_MINE = MESSAGE_TYPE_MINE;
  MESSAGE_TYPE_OTHERS = MESSAGE_TYPE_OTHERS;
  logger: LoggerService = LoggerInstance.getInstance()
  /**
   * Constructor
   * @param cdref 
   * @param uploadService 
   */
  constructor(
    public cdref: ChangeDetectorRef,
    public uploadService: UploadService,
    public tiledeskAuthService: TiledeskAuthService,
    private translate: TranslateService,
    public appConfigProvider: AppConfigProvider,
  ) {
    super(cdref, uploadService)

  }

  ngOnInit() {
    this.getOSCODE()
    this.listenToUploadFileProgress();
    this.setMomentLocaleAndGetTranslation();
  }

  getOSCODE() {
    this.support_mode = this.appConfigProvider.getConfig().supportMode
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    console.log('[CONVS-DETAIL][ION-CONVS-DETAIL] AppConfigService getAppConfig public_Key', this.public_Key)

    if (this.public_Key) {
      let keys = this.public_Key.split('-')
      console.log('[CONVS-DETAIL][ION-CONVS-DETAIL] PUBLIC-KEY - public_Key keys', keys)

      keys.forEach((key) => {
        if (key.includes('CAR')) {
          let car = key.split(':')
          if (car[1] === 'F') {
            this.areVisibleCAR = false
            console.log('[CONVS-DETAIL][ION-CONVS-DETAIL] PUBLIC-KEY - areVisibleCAR', this.areVisibleCAR)
          } else {
            this.areVisibleCAR = true
            console.log('[CONVS-DETAIL][ION-CONVS-DETAIL] PUBLIC-KEY - areVisibleCAR', this.areVisibleCAR)
          }
        }
      })

      if (!this.public_Key.includes('CAR')) {
        this.areVisibleCAR = false
        console.log('[CONVS-DETAIL][ION-CONVS-DETAIL] PUBLIC-KEY - areVisibleCAR', this.areVisibleCAR)
      }
    } else {
      this.areVisibleCAR = false
    }
  }

  setMomentLocaleAndGetTranslation() {
    this.browserLang = this.translate.getBrowserLang();
    const currentUser = this.tiledeskAuthService.getCurrentUser();
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - ngOnInit - currentUser ', currentUser)
    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid
      this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL]] - ngOnInit - currentUserId ', currentUserId)
    }

    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] stored_preferred_lang: ', stored_preferred_lang);


    let chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      chat_lang = this.browserLang
    } else if (this.browserLang && stored_preferred_lang) {
      chat_lang = stored_preferred_lang
    }
    moment.locale(chat_lang)
    // this.translate.getTranslation(chat_lang).subscribe((labels: string) => {
    //   console.log('[CONVS-DETAIL] translations: ', labels);
    // });
    this.translate.get('AddAsCannedResponse')
      .subscribe((text: string) => {
        // console.log('[CONVS-DETAIL] AddAsCannedResponse translated: ', text);
        this.addAsCannedResponseTooltipText = text
      })
  }

  listenToUploadFileProgress() {
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - calling BSStateUpload ');
    this.uploadService.BSStateUpload.subscribe((data: any) => {
      this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data', data);

      if (data) {
        this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data.upload', data.upload);
        this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data.upload typeof', typeof data.upload);
        this.uploadProgress = data.upload

        if (isNaN(data.upload)) {
          this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data.upload IS NaN (e.g. file size is 0)');
          this.uploadProgress = 100
        }
        // if (data.type.startsWith("application")) {
        // if (!data.type.startsWith("image")) {

        // this.fileType = 'file'

        this.addUploadingBubblePlaceholder(true)

        // this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload this.fileType', this.fileType);
        // }
      }
    });
  }

  addUploadingBubblePlaceholder(value: boolean) {
    this.onAddUploadingBubble.emit(value);
  }

  onImageRenderedFN(event) {
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - onImageRenderedFN:::ionic', event)
    this.onImageRendered.emit(event)
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    // console.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - trackByFn index', index)
    // console.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - trackByFn item', item)
    return item.uid || index;
  }
}

import { ConversationContentComponent } from '../conversation-content/conversation-content.component';
import { ChangeDetectorRef, Component, Input, OnInit, Output, EventEmitter} from '@angular/core';


import { MESSAGE_TYPE_INFO, MESSAGE_TYPE_MINE, MESSAGE_TYPE_OTHERS } from 'src/chat21-core/utils/constants';
import { isChannelTypeGroup, isFirstMessage, isInfo, isMine, messageType } from 'src/chat21-core/utils/utils-message';
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
import { isFile, isFrame, isImage } from 'src/chat21-core/utils/utils-message';

import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

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
 

  public uploadProgress: number = 100
  public fileType: any

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
    public uploadService: UploadService
  ) {
    super(cdref, uploadService)
   
  }

  ngOnInit() { 
  this.listenToUploadFileProgress()
  }

  listenToUploadFileProgress() {
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - calling BSStateUpload ');
    this.uploadService.BSStateUpload.subscribe((data: any) => {
      this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data', data);
     
      if (data) {
        this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data.upload', data.upload);
        this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data.upload typeof', typeof data.upload);
        this.uploadProgress = data.upload

        if (isNaN(data.upload))  {
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

  onImageRenderedFN(event){
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - onImageRenderedFN:::ionic', event)
    this.onImageRendered.emit(event)
  }


}

import { ConversationContentComponent } from './../conversation-content/conversation-content.component';
import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, Output, EventEmitter, OnChanges, DoCheck, IterableDiffers } from '@angular/core';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';

import { MESSAGE_TYPE_INFO, MESSAGE_TYPE_MINE, MESSAGE_TYPE_OTHERS } from 'src/chat21-core/utils/constants';
import { isChannelTypeGroup, isFirstMessage, isInfo, isMine, messageType } from 'src/chat21-core/utils/utils-message';
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
@Component({
  selector: 'ion-conversation-detail',
  templateUrl: './ion-conversation-detail.component.html',
  styleUrls: ['./ion-conversation-detail.component.scss'],
})
export class IonConversationDetailComponent extends ConversationContentComponent implements OnInit, DoCheck {

  @Input() channelType: string;
  @Input() senderId: string;
  @Output() addUploadingBubbleEvent = new EventEmitter<boolean>();
 

  public uploadProgress: number
  public fileType: any
  // public iterableDifferListConv: any

  // functions utils
  isMine = isMine;
  isInfo = isInfo;
  isFirstMessage = isFirstMessage;
  messageType = messageType;
  isChannelTypeGroup = isChannelTypeGroup;

  MESSAGE_TYPE_INFO = MESSAGE_TYPE_INFO;
  MESSAGE_TYPE_MINE = MESSAGE_TYPE_MINE;
  MESSAGE_TYPE_OTHERS = MESSAGE_TYPE_OTHERS;

  constructor(
    public logger: LoggerService,
    public cdref: ChangeDetectorRef,
    public uploadService: UploadService,
    private iterableDiffers: IterableDiffers,
  ) {
    super(logger, cdref)

    this.listenToUploadFileProgress()
   
    // this.iterableDifferListConv = this.iterableDiffers.find([]).create(null);
  }

  listenToUploadFileProgress() {
    this.uploadService.BSStateUpload.subscribe((data: any) => {
      console.log('ION-CONVERSATION-DETAIL BSStateUpload', data);
      if (data) {
        this.uploadProgress = data.upload
        if (data.type.startsWith("application")) {
          this.fileType = 'file'

          this.addUploadingBubblePlaceholder(true)

          console.log('ION-CONVERSATION-DETAIL BSStateUpload this.fileType', this.fileType);
        }

      }
    });
  }



  addUploadingBubblePlaceholder(value: boolean) {
    this.addUploadingBubbleEvent.emit(value);
  }


  ngOnInit() {
   
  }



  ngDoCheck() {
    // let changesMessagesArray = this.iterableDifferListConv.diff(this.messages);
    // if(changesMessagesArray){
    //   changesMessagesArray.forEachAddedItem(element => {
    //     console.log('ION-CONVERSATION-DETAIL changesMessagesArray new element ', element);
    //     //console.log('1111 added ', element)
    //     // let conv = element.item
       
    //   });
    // }
  }



}

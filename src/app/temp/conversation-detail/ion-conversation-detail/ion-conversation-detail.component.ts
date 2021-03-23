import { ConversationContentComponent } from './../conversation-content/conversation-content.component';
import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';

import { MESSAGE_TYPE_INFO, MESSAGE_TYPE_MINE, MESSAGE_TYPE_OTHERS } from 'src/chat21-core/utils/constants';
import { isChannelTypeGroup, isFirstMessage, isInfo, isMine, messageType } from 'src/chat21-core/utils/utils-message';

@Component({
  selector: 'ion-conversation-detail',
  templateUrl: './ion-conversation-detail.component.html',
  styleUrls: ['./ion-conversation-detail.component.scss'],
})
export class IonConversationDetailComponent extends ConversationContentComponent implements OnInit {

  @Input() channelType: string;

  // functions utils
  isMine = isMine;
  isInfo = isInfo;
  isFirstMessage = isFirstMessage;
  messageType = messageType;
  isChannelTypeGroup = isChannelTypeGroup;

  MESSAGE_TYPE_INFO = MESSAGE_TYPE_INFO;
  MESSAGE_TYPE_MINE = MESSAGE_TYPE_MINE;
  MESSAGE_TYPE_OTHERS = MESSAGE_TYPE_OTHERS;
    
  constructor(public logger: LoggerService,
              public cdref: ChangeDetectorRef) { 
                super(logger, cdref )
              }

  ngOnInit() {}




}

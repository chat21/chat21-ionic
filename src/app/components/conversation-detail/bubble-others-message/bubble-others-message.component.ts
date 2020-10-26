import { Component, OnInit, Input } from '@angular/core';
import { MessageModel } from 'src/app/models/message';
// utils
import {
  popupUrl,
  urlify,
  isPopupUrl,
  getColorBck,
  stripTags
} from 'src/app/utils/utils';

import {
  isImage,
  isFile,
  isInfo,
  getSizeImg,
  isChannelTypeGroup
} from 'src/app/utils/utils-message';

import {
  MSG_STATUS_SENT,
  MSG_STATUS_RETURN_RECEIPT
} from 'src/app/utils/constants';

@Component({
  selector: 'app-bubble-others-message',
  templateUrl: './bubble-others-message.component.html',
  styleUrls: ['./bubble-others-message.component.scss'],
})


export class BubbleOthersMessageComponent implements OnInit {
  @Input() message: MessageModel;
  @Input() isFirstMessage = true;
  @Input() channelType: string;

  // utils functions
  popupUrl = popupUrl;
  urlify = urlify;
  isPopupUrl = isPopupUrl;
  getColorBck = getColorBck;
  stripTags = stripTags;

  // utils-message functions
  isImage = isImage;
  isFile = isFile;
  isInfo = isInfo;
  getSizeImg = getSizeImg;
  isChannelTypeGroup = isChannelTypeGroup;

  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;

  constructor() { }

  ngOnInit() {}

  showButtonInfo() {
  }

  presentPopover(event, msg) {
    console.log('presentPopover');
  }

}

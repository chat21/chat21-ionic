import { Component, OnInit, Input } from '@angular/core';
import { MessageModel } from 'src/chat21-core/models/message';



// utils
import {
  popupUrl,
  urlify,
  isPopupUrl,
  stripTags
} from 'src/chat21-core/utils/utils';

import {
  getSizeImg
} from 'src/chat21-core/utils/utils-message';

import {
  MSG_STATUS_SENT,
  MSG_STATUS_RETURN_RECEIPT,
  MAX_WIDTH_IMAGES
} from 'src/chat21-core/utils/constants';

@Component({
  selector: 'app-bubble-my-message',
  templateUrl: './bubble-my-message.component.html',
  styleUrls: ['./bubble-my-message.component.scss'],
})

export class BubbleMyMessageComponent implements OnInit {
  @Input() message: MessageModel;
  @Input() isFirstMessage = true;

  // utils functions
  popupUrl = popupUrl;
  urlify = urlify;
  isPopupUrl = isPopupUrl;
  stripTags = stripTags;

  // utils-message functions
  getSizeImg = getSizeImg;

  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  MAX_WIDTH_IMAGES = MAX_WIDTH_IMAGES;
  
  constructor() { }

  ngOnInit() {
    // console.log('msg::::', JSON.stringify(this.message));
  }

  /** */
  showButtonInfo() {
    //console.log('showButtonInfo');
  }

  /**
  * apro il menu delle opzioni 
  * (metodo richiamato da html) 
  * alla chiusura controllo su quale opzione ho premuto e attivo l'azione corrispondete
  */
 presentPopover(event, msg) {
  // console.log('presentPopover');
  // let popover = this.popoverCtrl.create(PopoverPage, { typePopup: TYPE_POPUP_DETAIL_MESSAGE, message: msg });
  // popover.present({
  //   ev: event
  // });
  //   /**
  //    * 
  //    */
  //   popover.onDidDismiss((data: string) => {
  //     console.log(" ********* data::: ", data);
  //     if (data == 'logOut') {
  //       //this.logOut();
  //     }
  //     else if (data == 'ProfilePage') {
  //       if (this.chatManager.getLoggedUser()) {
  //         this.navCtrl.push(ProfilePage);
  //       }
  //     }
  //   });
  }
}

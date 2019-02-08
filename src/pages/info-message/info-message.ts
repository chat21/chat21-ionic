import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Events, NavParams } from 'ionic-angular';
import { MessageModel } from '../../models/message';

import { ChatConversationHandler } from '../../providers/chat-conversation-handler';
import { ChatManager } from '../../providers/chat-manager/chat-manager';

import { searchIndexInArrayForUid, getSizeImg } from '../../utils/utils';

/**
 * Generated class for the InfoMessagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-info-message',
  templateUrl: 'info-message.html',
})
export class InfoMessagePage {
  // ========= begin:: Input/Output values ============//
  @Input() message: any;
  @Output() eventClose = new EventEmitter();
  // ========= end:: Input/Output values ============//
  // public message: MessageModel;

  constructor(
    public events: Events,
    public navParams: NavParams,
    public conversationHandler: ChatConversationHandler,
    public chatManager: ChatManager
  ) {
    this.initialize();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoMessagePage');
  }

  initialize() {
    console.log('initialize InfoMessagePage');
    // this.events.subscribe('openInfoMessage', this.openInfoMessage);
    // this.events.subscribe('closeInfoMessage', this.openInfoMessage);
  }

  // openInfoMessage: any = (message) => {
  //   this.message = message;
  //   console.log('**************** OPEN MESSAGE **************', message);
  // }


  //// START FUNZIONI RICHIAMATE DA HTML ////
  /**
   * Check if the user is the sender of the message.
   * @param message 
   */
  isSender(message) {
    const currentUser = this.chatManager.getLoggedUser();
    return this.conversationHandler.isSender(message, currentUser);
  }

  getSizeImg(message): any {
    return getSizeImg(message, 280);
  }

  //// START FUNZIONI RICHIAMATE DA HTML ////
  /** 
   * chiude il box di dx del info messaggio
  */
 onCloseInfoPage(){
   console.log('onCloseInfoPage');
  this.eventClose.emit();
  // if(this.openInfoMessage){
  //   this.openInfoMessage = false;
  // } else {
  //   this.onOpenCloseInfoConversation();
  // }
}
  // setUrlString(text, name): any {
  //   return name;
  //   // if(text) {
  //   //   return setUrlString(text, name);
  //   // } else {
  //   //   return name;
  //   // }
  // }

}

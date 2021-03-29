import { EventsService } from './../../services/events-service';
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { DatabaseProvider } from './../../services/database';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { NavProxyService } from 'src/app/services/nav-proxy.service';
// utils
import { checkPlatformIsMobile } from '../../../chat21-core/utils/utils';
import { Router } from '@angular/router';
@Component({
  selector: 'app-conversations-archived-list',
  templateUrl: './conversations-archived-list.page.html',
  styleUrls: ['./conversations-archived-list.page.scss'],
})
export class ConversationsArchivedListPage implements OnInit {

  @Input() listConversations: Array<ConversationModel>;
  @Input() limit?: number
  @Input() styleMap: Map<string, string>;
  @Input() translationMap: Map< string, string>;
  @Output() onConversationSelected = new EventEmitter<ConversationModel>();
  @Output() onImageLoaded = new EventEmitter<ConversationModel>();
  @Output() onConversationLoaded = new EventEmitter<ConversationModel>();

  public uidConvSelected: string;
  public conversationSelected: ConversationModel;

  constructor(private modalController: ModalController,
              private navService: NavProxyService,
              private events: EventsService) { }

  ngOnInit() {
    console.log('conversationnn', this.modalController)
  }

  /** */
  async onCloseArchived() {
    const isModalOpened = await this.modalController.getTop();
    if (isModalOpened) {
      this.modalController.dismiss({ confirmed: true });
    } else {
      this.events.unsubscribe('profileInfoButtonClick:changed')
      this.navService.pop();
    }
  }

  onConversationSelectedFN(conversation: ConversationModel){
    //console.log('onConversationSelectedFN::', conversation)
    this.onConversationSelected.emit(conversation)
    this.onCloseArchived();
  }

  onImageLoadedFN(conversation: ConversationModel){
   //console.log('onImageLoadedFN::', conversation)
    this.onImageLoaded.emit(conversation)
  }

  onConversationLoadedFN(conversation: ConversationModel){
    //console.log('onImageLoadedFN::', conversation)
    this.onConversationLoaded.emit(conversation)
  }


}

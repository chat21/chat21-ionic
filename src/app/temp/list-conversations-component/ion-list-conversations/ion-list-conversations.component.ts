import { Component, EventEmitter, Input, IterableDiffers, KeyValueDiffers, OnInit, Output } from '@angular/core';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { convertMessage } from 'src/chat21-core/utils/utils';
import { ListConversationsComponent } from '../list-conversations/list-conversations.component';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'ion-list-conversations',
  templateUrl: './ion-list-conversations.component.html',
  styleUrls: ['./ion-list-conversations.component.scss'],
})
export class IonListConversationsComponent extends ListConversationsComponent implements OnInit {

  @Input() uidConvSelected: string;
  @Output() onCloseConversation = new EventEmitter<ConversationModel>();

  public convertMessage = convertMessage;
  isApp: boolean;
  constructor(
    public iterableDiffers: IterableDiffers,
    public imageRepoService: ImageRepoService,
    public platform: Platform
  ) {
    super(iterableDiffers, imageRepoService)
  }

  ngOnInit() {
    this.isApp = this.platform.is('cordova')
    console.log('ION-LIST-CONV IS-APP ',this.isApp )
   }

  closeConversation(conversation: ConversationModel) {
    var conversationId = conversation.uid;
    this.onCloseConversation.emit(conversation)
  }


}

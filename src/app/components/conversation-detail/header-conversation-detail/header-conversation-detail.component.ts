import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';

@Component({
  selector: 'app-header-conversation-detail',
  templateUrl: './header-conversation-detail.component.html',
  styleUrls: ['./header-conversation-detail.component.scss'],
})
export class HeaderConversationDetailComponent implements OnInit ,OnChanges {
  @Input() conversationAvatar: any;
  @Input() idLoggedUser: string;
  @Input() isOpenInfoConversation: boolean;
  @Input() isMobile: boolean;
  @Input() translationMap: Map<string, string>;
  @Output() eventOpenCloseInfoConversation = new EventEmitter<boolean>();

  openInfoConversation = true;
  openInfoMessage = true;
  DIRECT = 'direct';

  isDirect = false;
  isTyping = false;
  borderColor = '#ffffff';
  fontColor = '#949494';
  membersConversation = ['SYSTEM'];

  constructor(
    public imageRepoService: ImageRepoService
    // private translateService: CustomTranslateService
  ) {
  }

  ngOnInit() {
    console.log('HeaderConversationDetailComponent', this.idLoggedUser);
    console.log(this.conversationAvatar);
    this.initialize();
  }

  ngOnChanges() {
    console.log('HeaderConversationDetailComponent', this.conversationAvatar);
    if(this.conversationAvatar){
      this.conversationAvatar.imageurl = this.imageRepoService.getImagePhotoUrl(this.conversationAvatar.uid)
    }

    console.log('HeaderConversationDetailComponent isOpenInfoConversation', this.isOpenInfoConversation);
    this.openInfoConversation =  this.isOpenInfoConversation;
  }

  /** */
  initialize() {
    if (this.conversationAvatar && this.conversationAvatar.channelType === this.DIRECT) {
      this.isDirect = true;
    } else if (this.idLoggedUser) {
      this.membersConversation.push(this.idLoggedUser);
    }
  }

  /** */
  pushPage(event) {}

  /** */
  onOpenCloseInfoConversation() {
    this.openInfoMessage = false;
    this.openInfoConversation = !this.openInfoConversation;
    console.log('onOpenCloseInfoConversation1 **************', this.openInfoConversation);
    this.eventOpenCloseInfoConversation.emit(this.openInfoConversation);
  }
}

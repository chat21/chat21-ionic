import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header-conversation-detail',
  templateUrl: './header-conversation-detail.component.html',
  styleUrls: ['./header-conversation-detail.component.scss'],
})
export class HeaderConversationDetailComponent implements OnInit {
  @Input() conversationAvatar: any;
  @Input() idLoggedUser: string;
  @Input() isMobile: boolean;
  @Input() translationMap: Map<string, string>;
  @Output() eventOpenCloseInfoConversation = new EventEmitter<boolean>();

  openInfoConversation = true;
  openInfoMessage = true;
  DIRECT = 'direct';

  isDirect = false;
  isTypings = false;
  borderColor = '#ffffff';
  fontColor = '#949494';
  membersConversation = ['SYSTEM'];

  constructor(
    // private translateService: CustomTranslateService
  ) {
  }

  ngOnInit() {
    console.log('HeaderConversationDetailComponent', this.idLoggedUser);
    console.log(this.conversationAvatar);
    this.initialize();
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

import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'app-header-conversation-detail',
  templateUrl: './header-conversation-detail.component.html',
  styleUrls: ['./header-conversation-detail.component.scss'],
})
export class HeaderConversationDetailComponent implements OnInit, OnChanges {
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

  private logger: LoggerService = LoggerInstance.getInstance();

  /**
   * Constructor
   * @param imageRepoService 
   */
  constructor(
    public imageRepoService: ImageRepoService

  ) { }

  // ----------------------------------------------------
  // @ Lifehooks
  // ----------------------------------------------------
  ngOnInit() {
    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnInit) - idLoggedUser', this.idLoggedUser);
    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnInit) - conversationAvatar', this.conversationAvatar);

    this.initialize();
  }

  ngOnChanges() {
    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnChanges) -  conversationAvatar', this.conversationAvatar);
    if (this.conversationAvatar) {
      this.conversationAvatar.imageurl = this.imageRepoService.getImagePhotoUrl(this.conversationAvatar.uid)
    }

    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnChanges) - isOpenInfoConversation', this.isOpenInfoConversation);
    this.openInfoConversation = this.isOpenInfoConversation;
  }


  // ----------------------------------------------------
  // @ Initialize (called in ngOnInit)
  // ----------------------------------------------------
  initialize() {
    if (this.conversationAvatar && this.conversationAvatar.channelType === this.DIRECT) {
      this.isDirect = true;
    } else if (this.idLoggedUser) {
      this.membersConversation.push(this.idLoggedUser);
    }
  }

  onOpenCloseInfoConversation() {
    this.openInfoMessage = false;
    this.openInfoConversation = !this.openInfoConversation;
    this.logger.log('[CONVS-DETAIL][HEADER] - onOpenCloseInfoConversation - openInfoConversation ', this.openInfoConversation);
    this.eventOpenCloseInfoConversation.emit(this.openInfoConversation);
  }

  /** */
  pushPage(event) { }

}

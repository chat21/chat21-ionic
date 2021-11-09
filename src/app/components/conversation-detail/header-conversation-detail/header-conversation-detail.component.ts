import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { setConversationAvatar, setChannelType } from 'src/chat21-core/utils/utils';

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
  conversationWithFullname: string
  openInfoConversation = true;
  openInfoMessage = true;
  DIRECT = 'direct';

  isDirect = false;
  isTyping = false;
  borderColor = '#ffffff';
  fontColor = '#949494';
  membersConversation = ['SYSTEM'];
  fullNameConv: string;
  idConv: string;
  conversation_with_fullname: string
 
  private logger: LoggerService = LoggerInstance.getInstance();

  /**
   * Constructor
   * @param imageRepoService 
   */
  constructor(
    public imageRepoService: ImageRepoService,
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe(params => {


      // this.conversationWithFullname = params.get('FullNameConv');
      this.logger.log('[CONVS-DETAIL][HEADER] -> params: ', params);
      this.fullNameConv = params.get('FullNameConv')
      this.logger.log('[CONVS-DETAIL][HEADER] -> params > conversation_with_fullname: ', this.fullNameConv);
      this.idConv = params.get('IDConv');
      this.logger.log('[CONVS-DETAIL][HEADER] -> params > conversation_with: ', this.idConv);
    });
  }

  // ----------------------------------------------------
  // @ Lifehooks
  // ----------------------------------------------------
  ngOnInit() {
    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnInit) - idLoggedUser', this.idLoggedUser);
    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnInit) - conversationAvatar', this.conversationAvatar);
   this.conversation_with_fullname = this.conversationAvatar.conversation_with_fullname

    this.initialize();
  }

  ngOnChanges() {
    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnChanges) -  conversationAvatar', this.conversationAvatar);
    if (this.conversationAvatar) {
      this.conversationAvatar.imageurl = this.imageRepoService.getImagePhotoUrl(this.conversationAvatar.uid)
    } else {
      const channelType = setChannelType(this.idConv);
      this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnChanges) - conversationAvatar usecase UNDEFINED channelType ', channelType);
      this.conversationAvatar = setConversationAvatar(
        this.idConv,
        this.fullNameConv,
        channelType,
      );
      if (this.conversationAvatar) {
        this.conversationAvatar.imageurl = this.imageRepoService.getImagePhotoUrl(this.conversationAvatar.uid)
      }
      this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnChanges) - conversationAvatar usecase UNDEFINED conversationAvatar',  this.conversationAvatar);
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

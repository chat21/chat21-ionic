import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service'

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service'
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance'
import {
  setConversationAvatar,
  setChannelType,
} from 'src/chat21-core/utils/utils'
import { Platform } from '@ionic/angular'

import { ModalController } from '@ionic/angular'
import { EventsService } from 'src/app/services/events-service'
import { CreateTicketPage } from 'src/app/pages/create-ticket/create-ticket.page'
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service'

@Component({
  selector: 'app-header-conversation-detail',
  templateUrl: './header-conversation-detail.component.html',
  styleUrls: ['./header-conversation-detail.component.scss'],
})
export class HeaderConversationDetailComponent implements OnInit, OnChanges {
  @Input() conversationAvatar: any
  @Input() idLoggedUser: string
  @Input() conv_type: string
  @Input() isOpenInfoConversation: boolean
  @Input() isMobile: boolean
  @Input() translationMap: Map<string, string>
  @Output() eventOpenCloseInfoConversation = new EventEmitter<boolean>()
  conversationWithFullname: string
  openInfoConversation = true
  openInfoMessage = true
  DIRECT = 'direct'

  isDirect = false
  isTyping = false
  borderColor = '#ffffff'
  fontColor = '#949494'
  membersConversation = ['SYSTEM']
  fullNameConv: string
  idConv: string
  conversation_with_fullname: string
  platformName: string
  conv_closed: boolean = false;

  private logger: LoggerService = LoggerInstance.getInstance()

  /**
   * Constructor
   * @param imageRepoService
   */
  constructor(
    public imageRepoService: ImageRepoService,
    private route: ActivatedRoute,
    public platform: Platform,
    private router: Router,
    // public tiledeskAuthService: TiledeskAuthService,
    public tiledeskService: TiledeskService,
    public events: EventsService,
    public modalController: ModalController,
  ) {
    this.route.paramMap.subscribe((params) => {
      // this.conversationWithFullname = params.get('FullNameConv');
      this.logger.log('[CONVS-DETAIL][HEADER] -> params: ', params)
      this.fullNameConv = params.get('FullNameConv')
      this.logger.log(
        '[CONVS-DETAIL][HEADER] -> params > conversation_with_fullname: ',
        this.fullNameConv,
      )
      this.idConv = params.get('IDConv')
      this.logger.log(
        '[CONVS-DETAIL][HEADER] -> params > conversation_with: ',
        this.idConv,
      )
    })
  }

  // ----------------------------------------------------
  // @ Lifehooks
  // ----------------------------------------------------
  ngOnInit() {
   
    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnInit) - idLoggedUser', this.idLoggedUser, )
    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnInit) - conversationAvatar', this.conversationAvatar, )
    this.logger.log('[CONVS-DETAIL][HEADER] - (ngOnInit) -  conv_type', this.conv_type, )
    this.conversation_with_fullname = this.conversationAvatar.conversation_with_fullname
    this.listenToConversationHasBeenClosed()
    this.initialize()
  }

  ngOnChanges() {
    this.logger.log(
      '[CONVS-DETAIL][HEADER] - (ngOnChanges) -  conversationAvatar',
      this.conversationAvatar,
    )
    if (this.conversationAvatar) {
      this.conversationAvatar.imageurl = this.imageRepoService.getImagePhotoUrl(
        this.conversationAvatar.uid,
      )
    } else {
      const channelType = setChannelType(this.idConv)
      this.logger.log(
        '[CONVS-DETAIL][HEADER] - (ngOnChanges) - conversationAvatar usecase UNDEFINED channelType ',
        channelType,
      )
      this.conversationAvatar = setConversationAvatar(
        this.idConv,
        this.fullNameConv,
        channelType,
      )
      if (this.conversationAvatar) {
        this.conversationAvatar.imageurl = this.imageRepoService.getImagePhotoUrl(
          this.conversationAvatar.uid,
        )
      }
      this.logger.log(
        '[CONVS-DETAIL][HEADER] - (ngOnChanges) - conversationAvatar usecase UNDEFINED conversationAvatar',
        this.conversationAvatar,
      )
    }

    this.logger.log(
      '[CONVS-DETAIL][HEADER] - (ngOnChanges) - isOpenInfoConversation',
      this.isOpenInfoConversation,
    )
    this.openInfoConversation = this.isOpenInfoConversation
  }

  // ----------------------------------------------------
  // @ Initialize (called in ngOnInit)
  // ----------------------------------------------------
  initialize() {
    this.getPlatformName()
    if (
      this.conversationAvatar &&
      this.conversationAvatar.channelType === this.DIRECT
    ) {
      this.isDirect = true
    } else if (this.idLoggedUser) {
      this.membersConversation.push(this.idLoggedUser)
    }
  }

  getPlatformName() {
    this.logger.log('getPlatformName this.platform', this.platform)
    if (this.platform.is('ios')) {
      this.platformName = 'ios'
      this.logger.log('getPlatformName platformName', this.platformName)
    } else if (this.platform.is('android')) {
      this.platformName = 'android'
      this.logger.log('getPlatformName platformName', this.platformName)
    }
  }

  closeConversation() {
    this.events.publish('hasclosedconversation', this.idConv)
  }

  listenToConversationHasBeenClosed() {
    this.events.subscribe('conversationhasbeenclosed', (convId) => {
      // console.log('[CONVS-DETAIL][HEADER] conversationhasbeenclosed  convId', convId)
        if (convId === this.idConv) {
          this.logger.log('[CONVS-DETAIL][HEADER] the conversation was closed',)
          this.conv_closed = true;
        }
    });
  }

  

  onOpenCloseInfoConversation() {
    this.openInfoMessage = false
    this.openInfoConversation = !this.openInfoConversation
    this.logger.log(
      '[CONVS-DETAIL][HEADER] - onOpenCloseInfoConversation - openInfoConversation ',
      this.openInfoConversation,
    )
    this.eventOpenCloseInfoConversation.emit(this.openInfoConversation)
  }

  /** */
  pushPage(event) {}

  goBackToConversationList() {
    this.router.navigateByUrl('/conversations-list')
  }

  // -----------------------------------------------------------------
  // PRESENT MODAL CREATE TICKET (MOVED IN ddp-deader.component.ts)
  // -----------------------------------------------------------------
  // async presentCreateTicketModal(e: any): Promise<any>{

  //   // const attributes = {  enableBackdropDismiss: false };
  //   const modal: HTMLIonModalElement =
  //     await this.modalController.create({
  //       component: CreateTicketPage,
  //       // componentProps: attributes,
  //       swipeToClose: false,
  //       backdropDismiss: false
  //     });
  //   modal.onDidDismiss().then((detail: any) => {
  //     this.logger.log('[CONVS-DETAIL][HEADER] ', detail.data);
  //   });
  //   return await modal.present();
  // }
}

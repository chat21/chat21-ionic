import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { EventsService } from 'src/app/services/events-service'
import { CreateTicketPage } from 'src/app/pages/create-ticket/create-ticket.page'
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service'
@Component({
  selector: 'app-ddp-header',
  templateUrl: './ddp-header.component.html',
  styleUrls: ['./ddp-header.component.scss'],
})
export class DdpHeaderComponent implements OnInit {
  @Input() numberOpenConv: number
  @Input() supportMode: boolean
  @Input() archived_btn: boolean
  @Input() writeto_btn: boolean
  @Output() openContactsDirectory = new EventEmitter()
  @Output() openProfileInfo = new EventEmitter()
  IS_ON_MOBILE_DEVICE: boolean
  createTicketModal = null
  public translationMap: Map<string, string>;
  tooltipOptions = {
    'show-delay': 0,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 0
  };
  constructor(
    public events: EventsService,
    public modalController: ModalController,
    private translateService: CustomTranslateService,
  ) {
    this.isOnMobileDevice();
    this.translations();
    // this.listenToCloseCreateTicketModal() // published from create ticket page
  }

  public translations() {
    const keys = [
      'CreateTicket',
      'ViewArchivedConversations',
      'ViewContactsList'
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }

  // listenToCloseCreateTicketModal() {
  //   this.events.subscribe('closeModalCreateTicket', (bool) => {
  //     console.log('[HEADER-CONV] closeModalCreateTicket ', bool)
  //     if (bool === true) {
  //       this.closeCreateTicketModal()

  //     }
  //   })
  // }

  // closeCreateTicketModal() {
  //   if (this.createTicketModal) {
  //     this.createTicketModal.dismiss().then(() => {
  //       this.createTicketModal = null;
  //     });
  //   }
  // }

  isOnMobileDevice() {
    this.IS_ON_MOBILE_DEVICE = false
    if (/Android|iPhone/i.test(window.navigator.userAgent)) {
      this.IS_ON_MOBILE_DEVICE = true
    }
    // console.log('[DDP-HEADER] IS_ON_MOBILE_DEVICE', this.IS_ON_MOBILE_DEVICE)
    return this.IS_ON_MOBILE_DEVICE
  }

  ngOnInit() {
    // console.log('DDP HEADER SUPPORT MODE ', this.supportMode)
  }

  // START @Output() //
  /** */
  onOpenProfileInfo(e: any) {
    this.openProfileInfo.emit(e)
  }

  /** */
  onOpenContactsDirectory(e: any) {
    this.openContactsDirectory.emit(e)
  }
  // END @Output() //

  onClickArchivedConversation() {
    this.events.publish('profileInfoButtonClick:changed', 'displayArchived')
  }

  // PRESENT MODAL CREATE TICKET
  // async presentCreateTicketModal(): Promise<any>{

  //   // const attributes = {  enableBackdropDismiss: false };
  //   const modal: HTMLIonModalElement =
  //     await this.modalController.create({
  //       component: CreateTicketPage,
  //       // componentProps: attributes,
  //       swipeToClose: false,
  //       backdropDismiss: false
  //     });
  //   modal.onDidDismiss().then((detail: any) => {
  //     console.log('[DDP-HEADER] ', detail.data);
  //   });
  //   return await modal.present();
  // }

  async presentCreateTicketModal() {
    // const attributes = {  enableBackdropDismiss: false };
    const modal = await this.modalController.create({
      component: CreateTicketPage,
      // componentProps: attributes,
      swipeToClose: false,
      backdropDismiss: false,
    })
    modal.onDidDismiss().then((detail: any) => {
      console.log('[DDP-HEADER] ', detail.data)
    })
    modal.present()
    this.createTicketModal = modal
  }
}

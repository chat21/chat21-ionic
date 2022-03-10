import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EventsService } from 'src/app/services/events-service';
import { CreateTicketPage } from 'src/app/pages/create-ticket/create-ticket.page';
@Component({
  selector: 'app-ddp-header',
  templateUrl: './ddp-header.component.html',
  styleUrls: ['./ddp-header.component.scss'],
})
export class DdpHeaderComponent implements OnInit {
  @Input() numberOpenConv: number;
  @Input() supportMode: boolean;
  @Input() archived_btn: boolean;
  @Input() writeto_btn: boolean;
  @Output() openContactsDirectory = new EventEmitter();
  @Output() openProfileInfo = new EventEmitter();
  IS_ON_MOBILE_DEVICE: boolean;

  constructor(
    public events: EventsService,
    public modalController: ModalController
  ) { 
    this.isOnMobileDevice();
    // this.listenToOpenCreateTicketModal() // published from create ticket page
  }

  listenToOpenCreateTicketModal() {
    this.events.subscribe('openModalCreateTicket', (bool) => {
      console.log('[HEADER-CONV] openModalCreateTicket ', bool)
        if (bool === true) {
          this.presentCreateTicketModal()
          
        }
    });
  }

  isOnMobileDevice() {
    this.IS_ON_MOBILE_DEVICE = false;
    if (/Android|iPhone/i.test(window.navigator.userAgent)) {
      this.IS_ON_MOBILE_DEVICE = true;
    }
    // console.log('[DDP-HEADER] IS_ON_MOBILE_DEVICE', this.IS_ON_MOBILE_DEVICE)
    return this.IS_ON_MOBILE_DEVICE;
  }

  ngOnInit() {
    // console.log('DDP HEADER SUPPORT MODE ', this.supportMode)
  }

  // START @Output() //
  /** */
  onOpenProfileInfo(e: any) {
    this.openProfileInfo.emit(e);
  }

  /** */
  onOpenContactsDirectory(e: any) {
    this.openContactsDirectory.emit(e);
  }
  // END @Output() //

  onClickArchivedConversation() {
    this.events.publish('profileInfoButtonClick:changed', 'displayArchived');
  }

    // PRESENT MODAL CREATE TICKET
  async presentCreateTicketModal(): Promise<any>{

    // const attributes = {  enableBackdropDismiss: false };
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: CreateTicketPage,
        // componentProps: attributes,
        swipeToClose: false,
        backdropDismiss: false
      });
    modal.onDidDismiss().then((detail: any) => {
      console.log('[DDP-HEADER] ', detail.data);
    });
    return await modal.present();
  }

}

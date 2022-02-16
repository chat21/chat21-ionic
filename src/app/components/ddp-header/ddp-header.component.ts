import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EventsService } from 'src/app/services/events-service';
@Component({
  selector: 'app-ddp-header',
  templateUrl: './ddp-header.component.html',
  styleUrls: ['./ddp-header.component.scss'],
})
export class DdpHeaderComponent implements OnInit {
  @Input() numberOpenConv: number;
  @Input() supportMode: boolean;
  @Output() openContactsDirectory = new EventEmitter();
  @Output() openProfileInfo = new EventEmitter();
  IS_ON_MOBILE_DEVICE: boolean;

  constructor(
    public events: EventsService,
  ) { 
    this.isOnMobileDevice()
  }

  isOnMobileDevice() {
    this.IS_ON_MOBILE_DEVICE = false;
    if (/Android|iPhone/i.test(window.navigator.userAgent)) {
      this.IS_ON_MOBILE_DEVICE = true;
    }
    console.log('[DDP-HEADER] IS_ON_MOBILE_DEVICE', this.IS_ON_MOBILE_DEVICE)
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

}

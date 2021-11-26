import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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

  constructor(
  ) { }

  ngOnInit() {
    console.log('DDP HEADER SUPPORT MODE ', this.supportMode)
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

}

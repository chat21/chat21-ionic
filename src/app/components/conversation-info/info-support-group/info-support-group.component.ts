import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-info-support-group',
  templateUrl: './info-support-group.component.html',
  styleUrls: ['./info-support-group.component.scss'],
})
export class InfoSupportGroupComponent implements OnInit {

  @Input() urlConversationSupportGroup: any;

  constructor() { }

  ngOnInit() {
    console.log('urlConversationSupportGroup: ', this.urlConversationSupportGroup);
  }

}

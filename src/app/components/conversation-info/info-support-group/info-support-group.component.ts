import { Component, OnInit, Input } from '@angular/core';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
@Component({
  selector: 'app-info-support-group',
  templateUrl: './info-support-group.component.html',
  styleUrls: ['./info-support-group.component.scss'],
})
export class InfoSupportGroupComponent implements OnInit {

  @Input() urlConversationSupportGroup: any;

  private logger: LoggerService = LoggerInstance.getInstance();
  constructor() { }

  ngOnInit() {
    this.logger.log('InfoSupportGroupComponent - urlConversationSupportGroup: ', this.urlConversationSupportGroup);
  }

  ngOnDestroy() {
    // this.logger.log('ngOnDestroy ConversationDetailPage: ');
    this.logger.log('InfoSupportGroupComponent - ngOnDestroy ');


  }

}

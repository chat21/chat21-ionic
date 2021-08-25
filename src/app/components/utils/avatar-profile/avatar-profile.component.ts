import { Component, OnInit, Input } from '@angular/core';
// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'app-avatar-profile',
  templateUrl: './avatar-profile.component.html',
  styleUrls: ['./avatar-profile.component.scss'],
})
export class AvatarProfileComponent implements OnInit {
  @Input() itemAvatar: any;
  
  private logger: LoggerService = LoggerInstance.getInstance();
  constructor() {
    this.logger.log('AvatarProfileComponent:::: constructor');
   }

  ngOnInit() {
    this.logger.log('AvatarProfileComponent:::: ngOnInit');
    this.logger.log(this.itemAvatar);
  }

}

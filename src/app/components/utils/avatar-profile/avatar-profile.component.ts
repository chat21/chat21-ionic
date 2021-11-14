import { Component, OnInit, Input, OnChanges } from '@angular/core';
// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'app-avatar-profile',
  templateUrl: './avatar-profile.component.html',
  styleUrls: ['./avatar-profile.component.scss'],
})
export class AvatarProfileComponent implements OnInit, OnChanges {
  @Input() itemAvatar: any;
  public avatarUrl: string
  public avatar: string
  public color: string
  private logger: LoggerService = LoggerInstance.getInstance();
  constructor() {
    this.logger.log('AvatarProfileComponent:::: constructor');
  }

  ngOnInit() {
    this.logger.log('AvatarProfileComponent:::: ngOnInit');
    // console.log('AvatarProfileComponent itemAvatar ',this.itemAvatar);
    if (this.itemAvatar) {
      this.avatarUrl = this.itemAvatar.imageurl
      this.avatar = this.itemAvatar.avatar
      this.color = this.itemAvatar.color
    }
    // console.log('AvatarProfileComponent avatarUrl ',this.avatarUrl);
    // console.log('AvatarProfileComponent avatar ',this.avatar);
    // console.log('AvatarProfileComponent color ',this.color);
  }

  ngOnChanges() {
    // console.log('AvatarProfileComponent itemAvatar ',this.itemAvatar);
    // console.log('AvatarProfileComponent avatarUrl ',this.avatarUrl);
    // console.log('AvatarProfileComponent avatar ',this.avatar);
    // console.log('AvatarProfileComponent color ',this.color);
  }

}

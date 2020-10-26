import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-avatar-profile',
  templateUrl: './avatar-profile.component.html',
  styleUrls: ['./avatar-profile.component.scss'],
})
export class AvatarProfileComponent implements OnInit {
  @Input() itemAvatar: any;
  constructor() {
    console.log('AvatarProfileComponent:::: constructor');
   }

  ngOnInit() {
    console.log('AvatarProfileComponent:::: ngOnInit');
    console.log(this.itemAvatar);
  }

}

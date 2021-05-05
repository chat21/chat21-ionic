import { Component, OnInit, AfterViewInit , Input } from '@angular/core';
// import {avatarPlaceholder, getColorBck} from 'src/chat21-core/utils/utils-user';
@Component({
  selector: 'app-info-group',
  templateUrl: './info-group.component.html',
  styleUrls: ['./info-group.component.scss'],
})
export class InfoGroupComponent implements OnInit, AfterViewInit{

  @Input() groupDetail: any; 

  constructor() {

    console.log('InfoGroupComponent HELLO !!!' ) 
   }

  ngOnInit() { 
    
    console.log('InfoGroupComponent groupDetail', this.groupDetail);

    // this.groupDetail.avatar = avatarPlaceholder(this.groupDetail.name);
    // this.groupDetail.color = getColorBck(this.groupDetail.name);
      
}

  ngAfterViewInit() {
    console.log('InfoGroupComponent - ngAfterViewInit');
   
    // console.log('InfoGroupComponent conversationWith', this.conversationWith);
  }

}

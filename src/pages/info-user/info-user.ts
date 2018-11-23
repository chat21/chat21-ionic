import { Component, Output, Input, EventEmitter } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


// models
import { UserModel } from '../../models/user';

/**
 * Generated class for the InfoUserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-info-user',
  templateUrl: 'info-user.html',
})
export class InfoUserPage {
  // ========= begin:: Input/Output values ============//
  @Output() eventClose = new EventEmitter();
  @Input() member: UserModel;
  // ========= end:: Input/Output values ============//

  userDetail: UserModel;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams) {
  }

  ngOnInit() {
    console.log('ngOnInit:', this.member);
    this.userDetail = this.member;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoUserPage', this.member);
  }
  

  onCloseInfoPage() {
    this.eventClose.emit();
  }
}

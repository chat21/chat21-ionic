import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as firebase from 'firebase/app';

import { UserService } from '../../providers/user/user';

import { UserModel } from '../../models/user';
import { NavProxyService } from '../../providers/nav-proxy';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
//import { PARENT_PAGE_DETAIL_CONVERSATION } from '../../utils/constants';


/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  currentUserDetail: UserModel;
  currentUser: any;//UserModel;
  uidUser: string;
  //parentPage: string;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userService: UserService,
    public navProxy: NavProxyService
  ) {
    this.uidUser = navParams.get('uidUser');
    // recupero parent page
    //this.parentPage = navParams.get('parentPage');

    if (!this.uidUser){
      // recupero current currentUserDetail
      this.currentUserDetail = this.userService.getCurrentUserDetails();
    }
    else{
      console.log('this.uidUser',this.uidUser);
      this.currentUserDetail = new UserModel(this.uidUser, '', '', '', '');
      const userFirebaseSender = this.userService.setUserDetail(this.uidUser)
      userFirebaseSender.subscribe(snapshot => {
        const user = snapshot.val();
        const fullname = user.name+" "+user.surname;
        const userDetails = new UserModel(user.uid, user.name, user.surname, fullname, user.imageurl);
        console.log("userDetails userSender:: ",userDetails);
        this.currentUserDetail = userDetails;
      });
    }
    
    //this.currentUser = this.userService.getCurrentUserDetails();
   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  goBack(){
    this.navCtrl.pop();
    // if (this.parentPage == PARENT_PAGE_DETAIL_CONVERSATION){
    //   this.navProxy.isOn = true;
    //   this.navProxy.pushDetail(DettaglioConversazionePage, {
    //     uidReciver: this.currentUserDetail.uid
    //   });
    // }
    // else{
    //   this.navCtrl.pop();
    // }
    
  }

}

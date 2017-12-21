import { Component, NgZone } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams } from 'ionic-angular';
import * as firebase from 'firebase/app';

import { UserService } from '../../providers/user/user';

import { UserModel } from '../../models/user';
import { UploadModel } from '../../models/upload';
import { NavProxyService } from '../../providers/nav-proxy';
import { UploadService } from '../../providers/upload-service/upload-service';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
//import { PARENT_PAGE_DETAIL_CONVERSATION } from '../../utils/constants';
import { PopoverProfilePage } from '../popover-profile/popover-profile';

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
  profileYourself: boolean;
  selectedFiles: FileList;
  currentUpload: UploadModel;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userService: UserService,
    public navProxy: NavProxyService,
    private upSvc: UploadService,
    public popoverCtrl: PopoverController,
    public zone: NgZone
  ) {
    this.uidUser = navParams.get('uidUser');
    let uidCurrentUser = firebase.auth().currentUser.uid;

    if (!this.uidUser || uidCurrentUser == this.uidUser){
      this.currentUserDetail = this.userService.getCurrentUserDetails();
      this.profileYourself = true;
      // load image
      this.displayImage(uidCurrentUser);
    }
    else{
      this.profileYourself = false;
      console.log('this.uidUser',this.uidUser);
      this.currentUserDetail = new UserModel(this.uidUser, '', '', '', '', '');
      const userFirebaseSender = this.userService.setUserDetail(this.uidUser);
      let that = this;
      userFirebaseSender.on("value", function(snapshot) {
        let userDetails = new UserModel(snapshot.key, '', '', snapshot.key, '', '');        
        if (snapshot.val()){
          const user = snapshot.val();
          const fullname = user.firstname+" "+user.lastname;  
          userDetails = new UserModel(snapshot.key, user.email, user.firstname, user.lastname, fullname, user.imageurl);        
        }
        console.log("userDetails userSender:: ",userDetails);
        that.currentUserDetail = userDetails;
      });
      // load image
      this.displayImage(this.uidUser);
      
    }
       
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  //// start gestione menu opzioni ////
  // apro menu opzioni //
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopoverProfilePage,{uidContact:this.currentUserDetail.uid});
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss((data: string) => {
      //alert("popover.onDidDismiss: "+data);
      console.log(" ********* data::: ", data);
    });
  }
  //// end gestione menu opzioni ////

  displayImage(uidContact){
    this.upSvc.display(uidContact)
    .then((url) => {
      this.zone.run(() => {
        this.currentUserDetail.imageurl = url;
      });
    })
    .catch((error)=>{
      console.log("error::: ",error);
    });
  }

  goBack(){
    this.navCtrl.pop();
  }

}

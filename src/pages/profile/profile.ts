import { Component, NgZone } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
// models
import { UserModel } from '../../models/user';
// services
import { UploadService } from '../../providers/upload-service/upload-service';
import { UserService } from '../../providers/user/user';
import { ChatManager } from '../../providers/chat-manager/chat-manager';
// pages
import { PopoverProfilePage } from '../popover-profile/popover-profile';

/**
 * Generated class for the ProfilePage page.
 */
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  public userDetail: UserModel;
  public currentUserDetail: UserModel;
  public uidUser: string;

  public profileYourself: boolean;
  //public selectedFiles: FileList;
  //public currentUpload: UploadModel;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userService: UserService,
    //public navProxy: NavProxyService,
    public upSvc: UploadService,
    public popoverCtrl: PopoverController,
    public zone: NgZone,
    public chatManager: ChatManager,
    public events: Events
  ) {
    this.uidUser = navParams.get('uidUser');
  }
  /**
   * 
   */
  ngOnInit() {
    this.initialize();
  }
  /**
   * imposto subsribe dettaglio utente
   * controllo se sono nel profilo currentuser oppure usercon cui converso
   * carico dettaglio user
   */
  initialize(){
    this.events.subscribe('loadUserDetail:complete', userDetail => {
      this.userDetail = userDetail;
    });
    if (!this.uidUser){ // || this.userDetail.uid == this.uidUser
      this.profileYourself = true;
      this.currentUserDetail = this.chatManager.getLoggedUser();
      //this.displayImage(this.currentUserDetail.uid);
    }
    else {
      this.profileYourself = false;
      console.log('this.uidUser',this.uidUser);
      this.userDetail = new UserModel(this.uidUser, '', '', this.uidUser, '', '');
      this.userService.loadUserDetail(this.uidUser);
      //this.displayImage(this.uidUser);
    }
  }
  /**
   * metodo richiamato dalla pg html del current user 
   * alla pressione sul pulsante modifica della foto profillo
   * apro PopoverProfilePage passando id current user
   * @param myEvent 
   */
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
  /**
   * carico url immagine profilo passando id utente
   */
  displayImage(uidContact: string){
    const that = this;
    console.log(" ********* displayImage::: ");
    // this.upSvc.display(uidContact, 'thumb')
    // .then(onResolve, onReject)
    // function onResolve(foundURL:string) {
    //     console.log('foundURL', foundURL);
    //     if(that.profileYourself){
    //       that.currentUserDetail.imageurl = foundURL;
    //     }else{
    //       that.userDetail.imageurl = foundURL;
    //     }
    // } 
    // function onReject(error:any){ 
    //     console.log('error.code', error.code); 
    //     if(that.profileYourself){
    //       that.currentUserDetail.imageurl = '';
    //     }else{
    //       that.userDetail.imageurl = '';
    //     }
    // }


    // .then((url) => {
    //   that.zone.run(() => {
    //     if(that.profileYourself){
    //       that.currentUserDetail.imageurl = url;
    //     }else{
    //       that.userDetail.imageurl = url;
    //     }
    //   });
    // })
    // .catch((error)=>{
    //   //console.log("displayImage error::: ",error);
    // });
  }

  /**
   * chiudo il popup profilo utente
   */
  goBack(){
    this.navCtrl.pop({animate: false, duration: 0});
  }
}

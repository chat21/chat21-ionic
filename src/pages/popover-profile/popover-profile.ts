import { Component } from '@angular/core';
import { ModalController, ViewController, IonicPage, NavParams } from 'ionic-angular';
import { UpdateImageProfilePage } from '../update-image-profile/update-image-profile';

@IonicPage()
@Component({
  selector: 'page-popover-profile',
  templateUrl: 'popover-profile.html',
})
export class PopoverProfilePage {

  private uidContact:string;

  constructor(
    public viewCtrl: ViewController,  
    public modalCtrl: ModalController,
    public navParams: NavParams
  ) {
    this.uidContact = navParams.get('uidContact');
    // controllo piattaforma per il caricamento img da mobile o browser
  }
  /**
   * 
   * @param event 
   */
  detectFiles(event) {
    console.log('event: ',event);
    let profileModal = this.modalCtrl.create(UpdateImageProfilePage, {event: event}, { enableBackdropDismiss: false });
    profileModal.present();
    this.viewCtrl.dismiss();
  }
  /**
   * 
   */
  goToProfilePage(){
    let profileModal = this.modalCtrl.create(UpdateImageProfilePage, {uidContact: this.uidContact}, { enableBackdropDismiss: true });
    profileModal.present();
  }

}

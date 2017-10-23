import { Component } from '@angular/core';
import { ModalController, ViewController, IonicPage, NavController, NavParams } from 'ionic-angular';

import { UpdateImageProfilePage } from '../update-image-profile/update-image-profile';
/**
 * Generated class for the PopoverProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-popover-profile',
  templateUrl: 'popover-profile.html',
})
export class PopoverProfilePage {

  private uidContact:string;

  constructor(
    public viewCtrl: ViewController, 
    public navCtrl: NavController, 
    public modalCtrl: ModalController,
    public navParams: NavParams
  ) {
    this.uidContact = navParams.get('uidContact');
    // controllo piattaforma per il caricamento img da mobile o browser
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PopoverProfilePage',this.viewCtrl);
  }

  detectFiles(event) {
    console.log('event: ',event);
    // apro popup dettaglio foto
    let profileModal = this.modalCtrl.create(UpdateImageProfilePage, {event: event}, { enableBackdropDismiss: false });
    profileModal.present();
    this.viewCtrl.dismiss();
  }

  goToProfilePage(){
    let profileModal = this.modalCtrl.create(UpdateImageProfilePage, {uidContact: this.uidContact}, { enableBackdropDismiss: true });
    profileModal.present();
  }

}

import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import {ProfilePage} from '../profile/profile';
/**
 * Generated class for the PopoverPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html',
  template: `
    <ion-list>
      <!--<ion-list-header>Ionic</ion-list-header>-->
      <button ion-item (click)="goToProfilePage()">Profilo</button>
      <button ion-item (click)="close()">Impostazioni</button>
      <button ion-item (click)="logOut()">Disconnetti</button>
    </ion-list>
  `
})
export class PopoverPage {

  constructor(
    public viewCtrl: ViewController, 
    public navParams: NavParams,
    public navCtrl: NavController,
    public authService: AuthService
    ) {
      
  }

  showConfirm() {
        
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PopoverPage');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  goToProfilePage(){
    this.viewCtrl.dismiss("ProfilePage");
  }

  logOut() {
    this.viewCtrl.dismiss("logOut");
  }

}

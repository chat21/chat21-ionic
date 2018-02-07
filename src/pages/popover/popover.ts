import { Component } from '@angular/core';
import { ViewController, IonicPage } from 'ionic-angular';

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
    public viewCtrl: ViewController
  ) {}
  /**
   * chiudo il popover menu
   */
  close() {
    this.viewCtrl.dismiss();
  }
  /**
   * chiudo il popover passando 'ProfilePage' al chiamante (lista conversazioni)
   */
  goToProfilePage(){
    this.viewCtrl.dismiss("ProfilePage");
  }
  /**
   * chiudo il popover passando 'logOut' al chiamante (lista conversazioni)
   */
  logOut() {
    this.viewCtrl.dismiss("logOut");
  }
}

import { Component } from '@angular/core';
import { Events, ViewController, IonicPage, NavParams } from 'ionic-angular';
// models
import { MessageModel } from '../../models/message';
// utils
import { TYPE_POPUP_LIST_CONVERSATIONS, TYPE_POPUP_DETAIL_MESSAGE } from '../../utils/constants';
import { ArchivedConversationsPage } from '../archived-conversations/archived-conversations';
import { AlertController } from 'ionic-angular';
import * as PACKAGE from '../../../package.json';

@IonicPage()
@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html'
})



export class PopoverPage {

  public type: string;
  public message: MessageModel;

  TYPE_POPUP_LIST_CONVERSATIONS = TYPE_POPUP_LIST_CONVERSATIONS;
  TYPE_POPUP_DETAIL_MESSAGE = TYPE_POPUP_DETAIL_MESSAGE;

  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public events: Events,
    private alertCtrl: AlertController
  ) {
    this.type = navParams.get('typePopup');
    this.message = navParams.get('message');
    console.log(" PopoverPage ********* data::: ", this.message);
  }
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

  goToInfoMessage(){
   // pubblico open info message passando il messaggio
   this.viewCtrl.dismiss();
   this.events.publish('openInfoMessage', (this.message));
   console.log('goToInfoMessage **************');
  }
  /**
   * chiudo il popover passando 'logOut' al chiamante (lista conversazioni)
   */
  logOut() {
    this.viewCtrl.dismiss("logOut");
  }

  /**
   * returns the result of the dismiss
   * @returns a string that identify the closed page
   */
  openArchivedConversationsPage() {
    this.viewCtrl.dismiss("ArchivedConversationsPage");
  }


  openInfo(){
    var BUILD_VERSION = '<p style="text-align: center;">version ' + PACKAGE.version +'</p>';
    var that = this;
    let alert = this.alertCtrl.create({
      title: '',
      subTitle: BUILD_VERSION,
      buttons: [
      {
          text: 'OK',
          role: 'ok',
          handler: data => {
            that.viewCtrl.dismiss();
          }
      }]
    });
    alert.present();
  }
}

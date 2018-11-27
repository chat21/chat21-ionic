import { Component, Output, Input, EventEmitter } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { ChatPresenceHandler } from '../../providers/chat-presence-handler';

import { isExistInArray } from '../../utils/utils';


// models
import { UserModel } from '../../models/user';
import { initializeApp } from 'firebase';

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

  private subscriptions = [];
  public conversationWith: string;
  public lastConnectionDate: string;
  

  
  constructor(
    public events: Events,
    public navCtrl: NavController, 
    public translate: TranslateService,
    public navParams: NavParams,
    public chatPresenceHandler: ChatPresenceHandler
    ) {
  }

  ngOnInit() {
    console.log('ngOnInit:', this.member);
    this.initialize();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoUserPage', this.member);
  }
  

  initialize(){
    this.lastOnlineForUser(this.member.uid);
  }


  lastOnlineForUser(uid){
    const keySubscription = 'lastConnectionDate-' + uid;
    this.events.subscribe(keySubscription, this.callbackLastOnlineForUser);
    let isNewSubscription = this.addSubscription(keySubscription);
    if( isNewSubscription ){
      console.log("subscribe::lastConnectionDate");
      this.chatPresenceHandler.lastOnlineForUser(uid);
    }
  }

  callbackLastOnlineForUser:any = (uid, lastConnectionDate) => {
    console.log("callbackLastOnlineForUser::",lastConnectionDate);
    this.lastConnectionDate = lastConnectionDate;
  }

  /** */
  addSubscription(key){
    console.log("addSubscription--->",key);
    if (!isExistInArray(this.subscriptions, key)){
      console.log("addSubscription: TRUE");
      this.subscriptions.push(key);
      return true;
    } 
    console.log("addSubscription: FALSE");
    return false;
  }
  /**
   * unsubscribe all subscribe events
   */
  unsubscribeAll() {
    this.subscriptions.forEach((key) => {
      console.log("unsubscribe:",key);
      this.events.unsubscribe(key, null);
    });
  }

  onCloseInfoPage() {
    this.eventClose.emit();
  }
}

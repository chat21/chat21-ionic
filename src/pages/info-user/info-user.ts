import { Component, Output, Input, EventEmitter } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { ChatPresenceHandler } from '../../providers/chat-presence-handler';

import { validateEmail, urlify, isExistInArray } from '../../utils/utils';


// models
import { UserModel } from '../../models/user';
import { initializeApp } from 'firebase';
import { text } from '@angular/core/src/render3/instructions';

/**
 * Generated class for the InfoUserPage page.
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
  public decoded: Array<string> = [];
  
  constructor(
    public events: Events,
    public navCtrl: NavController, 
    public translate: TranslateService,
    public navParams: NavParams,
    public chatPresenceHandler: ChatPresenceHandler
    ) {
  }

  ngOnInit() {
    console.log('ngOnInit: InfoUserPage', this.member);
    setTimeout(() => {
      this.initialize();
    }, 200);
  }

  initialize(){
    console.log('PRE decoded:', this.member.decoded, this.member);
    this.lastOnlineForUser(this.member.uid);
    this.decoded = this.completeDecoded(this.member.decoded);
  }


  completeDecoded(json){
    var array = [];
    for (const e in json) {
    //for (let e of Object.keys(json)) {
      var itemValue = this.searchEmailOrUrlInString(json[e]);
      var item = {key: e, val: itemValue};
      array.push(item);
    }
    return array;
    //this.events.publish('decodedComplete', array);
  }

  /** SUBSCRIPTIONS */
  // setSubscriptions() {
  //   console.log('InfoUserPage::setSubscriptions');
  //   this.events.subscribe('decodedComplete', this.returnDecodedComplete);
  //   this.addSubscription('decodedComplete');
  // }

  // returnDecodedComplete: any = (array) => {
  //   // this.decoded = array;
  //   array.forEach(function(element) {
  //     if(element){
  //       let item = this.searchEmailOrUrlInString(element);
  //       this.decoded.push(item);
  //     }
  //   });
  // }


  // completeDecoded(json){
  //   var array = [];
  //   for (const e in json) {
  //   //for (let e of Object.keys(json)) {
  //     var itemValue = (json[e]);
  //     var item = {key: e, val: itemValue};
  //     array.push(item);
  //   }
  //   this.events.publish('decodedComplete', array);
  // }

  searchEmailOrUrlInString(item){
    item = item.toString();
    return urlify(item);
    // if( validateEmail(item) ){
    //   return "<a href='mailto:"+item+"'>"+item+"</a>";
    // } else {
    //   return urlify(item);
    // } 
  }

  //jsonToArray(json){
    // Object.keys(json).forEach(e => {
    //   var itemValue = json[e].toString();
    //   if( validateEmail(itemValue) ){
    //     // verifico se è una email
    //     itemValue = '<a href="mailto:'+itemValue+'">'+itemValue+'</a>';
    //   } else {
    //     // verifico se è un link
    //     itemValue = urlify(itemValue);
    //   } 
    //   var item = {key: e, val: itemValue};
    //   array.push(item);
    //   //console.log('key='+key +'item='+item+array);
    //   //console.log(`key=${e} value=${this.member.decoded[e]}`)
    // });
    //return array;
  //}

  
  

  

  // urlify(text){
  //   return convertMessageAndUrlify(text);
  // }

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

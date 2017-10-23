import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';

import { Config, Platform } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { UserModel } from '../../models/user';
import { UserService } from '../../providers/user/user';

import { removeHtmlTags } from '../../utils/utils';

/*
  Generated class for the MessageProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MessageProvider {

  private tenant: string;
  private items;//: AngularFireList<any>;
  private userSender: UserModel;
  private userRecipient: UserModel;
  private userRecipientUid: string;
  private userSenderUid: string;
  private conversationId: string;


  constructor(
    private platform: Platform,
    public http: Http,
    public config: Config,
    //public db: AngularFireDatabase,
    private userService:UserService
  ) {
    let appConfig = this.config.get("appConfig");
    this.tenant = appConfig.tenant;
    console.log('constructor MessageProvider',this.tenant);
  }

  ngOnInit() {
    //console.log('HngOnInit MessageProvider');
  }

  ifConversationExist(){
    const urlNodeFirebase = '/apps/'+this.tenant+'/messages/';
    return firebase.database().ref(urlNodeFirebase).once('value');
  }

  loadListMeggages(userRecipientUid: string, userSenderUid:string): any {
    this.userRecipientUid = userRecipientUid;
    this.userSenderUid = userSenderUid;
    // recupero current user detail
    console.log('userSender::::', userSenderUid, userRecipientUid);
    // creo id conversazione
    this.conversationId = this.createConversationId(userSenderUid, userRecipientUid);
    // creo message path
    const urlNodeFirebase = '/apps/'+this.tenant+'/messages/'+this.conversationId;
    console.log("loadListMeggages::", urlNodeFirebase);
    // this.items = this.db.list(urlNodeFirebase, 
    // ref => ref.limitToLast(100));

    this.items = firebase.database().ref(urlNodeFirebase);
    console.log("loadListMeggages::", urlNodeFirebase, this.items);
    return this.items;
   // this.userSender = userSender;//this.userService.getCurrentUserDetails();
  }

  setStatusMessage(item){
    //console.log("setStatusMessageKEY*****", item.key);
    // aggiorno stato messaggi conversazione 0:nn consegnato; 1:ricevuto; 2:letto
    let msg = item.val();
    if (msg.sender != firebase.auth().currentUser.uid && msg.status!=2){
      // aggiorno stato messaggio in elenco messaggi
      const urlNodeFirebase = '/apps/'+this.tenant+'/messages/'+msg.conversationId+"/"+item.key;
      console.log("AGGIORNO STATO MESSAGGIO", urlNodeFirebase);
      firebase.database().ref(urlNodeFirebase).update({ status: 2 });
    }
  }

  setStatusConversation(conversationId){
    console.log("setStatusConversation", conversationId);
    // aggiorno stato messaggi conversazione 0:nn consegnato; 1:ricevuto; 2:letto
    //console.log("CONFRONTO", item.sender,firebase.auth().currentUser.uid);
    //if (item.sender != firebase.auth().currentUser.uid && item.conversationId){
    
      // se la conversazione esiste
      // aggiorno stato messaggio in conversazioni
      const urlNodeFirebase = '/apps/'+this.tenant+'/users/'+firebase.auth().currentUser.uid+'/conversations/'+conversationId;
      firebase.database().ref(urlNodeFirebase).once('value', function(snapshot) {
        if (snapshot.hasChildren()) {
          var updates = {};
          //console.log("setStatusConversation urlNodeFirebase", urlNodeFirebase);
          //console.log("urlNodeFirebase", urlNodeFirebase);
          firebase.database().ref(urlNodeFirebase).update({ status: 2 });
        }
      });
  }

  // Check if the user is the sender of the message.
  isSender(message) {
    //console.log('isSender **************', message);
    if (firebase.auth().currentUser){
      if (message.sender == firebase.auth().currentUser.uid) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  createConversationId(userSenderUid:string, userRecipientUid:string) {
    //var n = uidSender.toUpperCase().localeCompare(uidReceiver.toUpperCase());
    var n = userSenderUid.localeCompare(userRecipientUid);
    if (n>0){
      //return uidReceiver.toUpperCase()+"-"+uidSender.toUpperCase();
      return userRecipientUid+"-"+userSenderUid;
    }
    else {
      //return uidSender.toUpperCase()+"-"+uidReceiver.toUpperCase();
      return userSenderUid+"-"+userRecipientUid;
    }
  }

  createSenderConversation(message:any, userSender:UserModel, userRecipient:UserModel) {
    this.userSender = userSender;
    this.userRecipient = userRecipient;
    const urlNodeFirebase = '/apps/'+this.tenant+'/users/'+this.userSender.uid+'/conversations/'+this.conversationId;
    console.log("createSenderConversation.conversationsPathDb::", urlNodeFirebase);
    const converationsObj = firebase.database().ref(urlNodeFirebase);
    const conversation = {
              //convers_with: this.userRecipient.uid,
              convers_with_fullname: this.userRecipient.fullname,
              recipient: this.userRecipient.uid,
              //image: this.userRecipient.imageurl?this.userRecipient.imageurl:'',
              is_new: true,
              last_message_text: "tu: "+removeHtmlTags(message.text),
              sender: this.userSender.uid,
              sender_fullname: this.userSender.fullname,
              status: 2,
              timestamp: message.timestamp,
          };
    converationsObj.set(conversation);
  }

  createReceiverConversation(message:any, userSender:UserModel, userRecipient:UserModel) {
    const urlNodeFirebase = '/apps/'+this.tenant+'/users/'+this.userRecipient.uid+'/conversations/'+this.conversationId;
    console.log("createReceiverConversation.conversationsPathDb::", urlNodeFirebase);
    const converationsObj = firebase.database().ref(urlNodeFirebase);
    const conversation = {
              //convers_with: this.userSender.uid,
              convers_with_fullname: this.userSender.fullname,
              recipient: this.userSender.uid,
              //image: this.userSender.imageurl?this.userSender.imageurl:'',
              is_new: true,
              last_message_text: removeHtmlTags(message.text),
              sender: this.userSender.uid,
              sender_fullname: this.userSender.fullname,
              status: 1,
              timestamp: message.timestamp,
          };
    converationsObj.set(conversation);
  }

  
  
}

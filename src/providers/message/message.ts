import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Config, Platform } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { UserModel } from '../../models/user';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
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
  private items: FirebaseListObservable<any>;
  private userSender: UserModel;
  private userRecipient: UserModel;
  private userRecipientUid: string;
  private userSenderUid: string;
  private conversationId: string;


  constructor(
    private platform: Platform,
    public http: Http,
    public config: Config,
    public db: AngularFireDatabase,
    private userService:UserService
  ) {
    let appConfig = this.config.get("appConfig");
    this.tenant = appConfig.tenant;
    console.log('constructor MessageProvider',this.tenant);
  }

  ngOnInit() {
    //console.log('HngOnInit MessageProvider');
  }

  // setUsersDetail(){
  //   const userFirebaseSender = this.userService.setUserDetail(userSenderUid)
  //   userFirebaseSender.subscribe(snapshot => {
  //     const user = snapshot.val();
  //     const fullname = user.name+" "+user.lastname;
  //     const userDetails = new UserModel(user.uid, user.name, user.lastname, fullname, user.imageurl);
  //     console.log("userDetails userSender:: ",userDetails);
  //     this.userSender = userDetails;
  //   });
  //   const userFirebaseRecipient = this.userService.setUserDetail(userRecipientUid)
  //   userFirebaseRecipient.subscribe(snapshot => {
  //     const user = snapshot.val();
  //     const fullname = user.name+" "+user.lastname;
  //     const userDetails = new UserModel(user.uid, user.name, user.lastname, fullname, user.imageurl);
  //     console.log("userDetails userRecipient:: ",userDetails);
  //     this.userRecipient = userDetails;
  //   });
  // }

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
    this.items = this.db.list(urlNodeFirebase, {
      query: {
        //orderByChild: 'timestamp',
        limitToLast: 300
      }
    });
    console.log("loadListMeggages::", urlNodeFirebase, this.items);
    return this.items;
   // this.userSender = userSender;//this.userService.getCurrentUserDetails();
  }

  setStatusMessage(item){
    console.log("setStatusMessage", item);
    // aggiorno stato messaggi conversazione 0:nn consegnato; 1:ricevuto; 2:letto
    if (item.sender != firebase.auth().currentUser.uid){
      // aggiorno stato messaggio in elenco messagi
      const urlNodeFirebase = '/apps/'+this.tenant+'/messages/'+item.conversationId+"/"+item.$key;
      console.log("AGGIORNO STATO MESSAGGIO", urlNodeFirebase);
      firebase.database().ref(urlNodeFirebase).update({ status: 2 });
      //this.items.update(item.sender, { status: 2 });
    }
  }
  setStatusConversation(item){
    console.log("setStatusConversation", item);
    // aggiorno stato messaggi conversazione 0:nn consegnato; 1:ricevuto; 2:letto
    if (item.sender != firebase.auth().currentUser.uid){
      // aggiorno stato messaggio in conversazioni
      const urlNodeFirebase = '/apps/'+this.tenant+'/users/'+item.recipient+'/conversations/'+item.conversationId;
      var updates = {};
      console.log("setStatusConversation urlNodeFirebase", urlNodeFirebase);
      //console.log("urlNodeFirebase", urlNodeFirebase);
      firebase.database().ref(urlNodeFirebase).update({ status: 2 });
    }
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
    const  converationsObj = this.db.object(urlNodeFirebase);
    const conversation = {
              convers_with: this.userRecipient.uid,
              convers_with_fullname: this.userRecipient.fullname,
              recipient: this.userRecipient.uid,
              image: this.userRecipient.imageurl,
              is_new: true,
              last_message_text: removeHtmlTags(message.text),
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
    const converationsObj = this.db.object(urlNodeFirebase);
    const conversation = {
              convers_with: this.userSender.uid,
              convers_with_fullname: this.userSender.fullname,
              recipient: this.userSender.uid,
              image: this.userSender.imageurl,
              is_new: true,
              last_message_text: removeHtmlTags(message.text),
              sender: this.userSender.uid,
              sender_fullname: this.userSender.fullname,
              status: 2,
              timestamp: message.timestamp,
          };
    converationsObj.set(conversation);
  }

  
  
}

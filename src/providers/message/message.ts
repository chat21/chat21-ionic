import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';

// services 
import { ApplicationContext } from '../application-context/application-context';
// utils
import { MSG_STATUS_RECEIVED } from '../../utils/constants';


@Injectable()
export class MessageProvider {
  //private tenant: string;
  //private currentUser: firebase.User;
  private items;
  //private urlNodeConversations: string;
  private urlNodeMessages: string;


  constructor(
    private applicationContext: ApplicationContext
  ) {
    console.log('constructor MessageProvider');
    // recupero current user e tenant dal singlelton
    //this.tenant = this.applicationContext.getTenant();
    //this.currentUser = this.applicationContext.getCurrentUser();
    //console.log('constructor MessageProvider', this.currentUser);
  }

  ngOnInit() {
    console.log('ngOnInit MessageProvider');
  }

  // ifConversationExist(conversationWith) {
  //   // SET URLS
  //   this.currentUser = this.applicationContext.getCurrentUser();
  //   this.urlNodeConversations = '/apps/'+this.tenant+'/users/'+this.currentUser.uid+'/conversations/'+conversationWith;
  //   console.log("ifConversationExist:: ", this.urlNodeConversations);
  //   return firebase.database().ref(this.urlNodeConversations).once('value');
  // }

  loadListMeggages(conversationWith): firebase.database.Query {
    // carico i messaggi della conversazione: ho bisogno di conoscere conversationWith
    // SET URLS
    const tenant = this.applicationContext.getTenant();
    const currentUser = this.applicationContext.getCurrentUser();
    this.urlNodeMessages = '/apps/'+tenant+'/users/'+currentUser.uid+'/messages/'+conversationWith;
    this.items = firebase.database().ref(this.urlNodeMessages);
    console.log("loadListMeggages:: ", this.urlNodeMessages, this.items);
    return this.items;
  }

  setStatusMessage(item,conversationWith){
    console.log("setStatusMessageKEY*****", item.key);
    const tenant = this.applicationContext.getTenant();
    const currentUser = this.applicationContext.getCurrentUser();
    let msg = item.val();
    // se il messaggio NON l'ho inviato io AGGIORNO stato a 200
    if (msg.sender != currentUser.uid && msg.status < MSG_STATUS_RECEIVED){
      const urlNodeMessagesUpdate  = '/apps/'+tenant+'/users/'+currentUser.uid+'/messages/'+conversationWith+"/"+item.key;
      console.log("AGGIORNO STATO MESSAGGIO", urlNodeMessagesUpdate);
      firebase.database().ref(urlNodeMessagesUpdate).update({ status: MSG_STATUS_RECEIVED });
    }
  }

  // setStatusConversation(conversationId){
  //   // aggiorno stato conversazione 0:nn consegnato; 1:ricevuto; 2:letto
  //   console.log("setStatusConversation", conversationId);
  //   // aggiorno stato conversazione se ultimo messaggio NON è il mio (quindi ho ricevuto 1 o + messaggi non letti)
  //   // anche se l'ultimo msg è il mio aggiorno stato conversazione quindi evito un controllo inutile
      
  //   // se la conversazione esiste
  //   // aggiorno stato messaggio in conversazioni
  //   const urlNodeFirebase = '/apps/'+this.tenant+'/users/'+this.currentUser.uid+'/conversations/'+conversationId;
  //   firebase.database().ref(urlNodeFirebase).once('value', function(snapshot) {
  //     if (snapshot.hasChildren()) {
  //       //console.log("urlNodeFirebase", urlNodeFirebase);
  //       firebase.database().ref(urlNodeFirebase).update({ status: 2 });
  //     }
  //   });
  // }

  // Check if the user is the sender of the message.
  isSender(message) {
    //console.log('isSender **************', message);
    const currentUser = this.applicationContext.getCurrentUser();
    if (currentUser){
      if (message.sender == currentUser.uid) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // createConversationId(userSenderUid:string, userRecipientUid:string) {
  //   var n = userSenderUid.localeCompare(userRecipientUid);
  //   if (n>0){
  //     //return uidReceiver.toUpperCase()+"-"+uidSender.toUpperCase();
  //     return userRecipientUid+"-"+userSenderUid;
  //   }
  //   else {
  //     //return uidSender.toUpperCase()+"-"+uidReceiver.toUpperCase();
  //     return userSenderUid+"-"+userRecipientUid;
  //   }
  // }

  // createSenderConversation(message:any, userSender:UserModel, userRecipient:UserModel) {
  //   this.userSender = userSender;
  //   this.userRecipient = userRecipient;
  //   const urlNodeFirebase = '/apps/'+this.tenant+'/users/'+this.userSender.uid+'/conversations/'+this.conversationId;
  //   console.log("createSenderConversation.conversationsPathDb::", urlNodeFirebase);
  //   const converationsObj = firebase.database().ref(urlNodeFirebase);
  //   const conversation = {
  //             //convers_with: this.userRecipient.uid,
  //             convers_with_fullname: this.userRecipient.fullname,
  //             recipient: this.userRecipient.uid,
  //             //image: this.userRecipient.imageurl?this.userRecipient.imageurl:'',
  //             is_new: true,
  //             last_message_text: "tu: "+removeHtmlTags(message.text),
  //             sender: this.userSender.uid,
  //             sender_fullname: this.userSender.fullname,
  //             status: 2,
  //             timestamp: message.timestamp,
  //         };
  //   converationsObj.set(conversation);
  // }

  // createReceiverConversation(message:any, userSender:UserModel, userRecipient:UserModel) {
  //   const urlNodeFirebase = '/apps/'+this.tenant+'/users/'+this.userRecipient.uid+'/conversations/'+this.conversationId;
  //   console.log("createReceiverConversation.conversationsPathDb::", urlNodeFirebase);
  //   const converationsObj = firebase.database().ref(urlNodeFirebase);
  //   const conversation = {
  //             //convers_with: this.userSender.uid,
  //             convers_with_fullname: this.userSender.fullname,
  //             recipient: this.userRecipient.uid, // this.userSender.uid,
  //             //image: this.userSender.imageurl?this.userSender.imageurl:'',
  //             is_new: true,
  //             last_message_text: removeHtmlTags(message.text),
  //             sender: this.userSender.uid,
  //             sender_fullname: this.userSender.fullname,
  //             status: 1,
  //             timestamp: message.timestamp,
  //         };
  //   converationsObj.set(conversation);
  // }

  
  
}

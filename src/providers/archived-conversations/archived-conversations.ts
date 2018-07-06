// import * as firebase from 'firebase/app';
// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { ChatManager } from '../chat-manager/chat-manager';
// import { UserModel } from '../../models/user';
// import { ConversationModel } from '../../models/conversation';
// import { TYPE_GROUP, LABEL_TU, URL_NO_IMAGE, TYPE_DIRECT } from '../../utils/constants';
// import { getFromNow, contactsRef, searchIndexInArrayForUid } from '../../utils/utils';

// @Injectable()
// export class ArchivedConversationsProvider {

//   private appId : string;
//   private loggedUser : UserModel;
//   private loggedUserId : string; 

//   // the path of the archived conversations node
//   private nodeArchivedConversationsPath : string;

//   // the reference to the archived conversations node
//   private nodeArchivedConversationsRef: firebase.database.Reference

//   // reference to the query at archived conversations node
//   private nodeArchivedConversationsQueryRef: firebase.database.Query;

//   // default number of displayed conversations
//   private DEFAULT_DISPLAYED_CONVERSATIONS_NUMBER = 200;

//   // custom number of displayed conversations
//   private displayedConversationsNumber : number;

//   private archivedConversations : ConversationModel[];
 
//   constructor(
//     public http: HttpClient,
//     public chatManager: ChatManager) {

//     // init the array of archived conversations
//     this.archivedConversations = [];
//   }

//   /**
//    * returns the instance of ArchivedConversationsProvider
//    */
//   getInstance() {
//     return this;
//   }

//   /**
//    * fill the ArchivedConversationsProvider with the data provided from ChatManager
//    * @param appId
//    * @param loggedUser 
//    */
//   public init(appId, loggedUser): ArchivedConversationsProvider {
//     this.appId = appId;
//     this.loggedUser = loggedUser;
//     this.loggedUserId = loggedUser.uid;
//     this.displayedConversationsNumber = this.DEFAULT_DISPLAYED_CONVERSATIONS_NUMBER;

//     // init the node path
//     this.nodeArchivedConversationsPath = '/apps/' + this.appId + '/users/' + this.loggedUserId + '/archived_conversations';

//     // init the node ref object
//     this.nodeArchivedConversationsRef = firebase.database().ref(this.nodeArchivedConversationsPath);

//     return this;
//   }

//   /**
//    * 
//    * @param number Set the number of displayed conversations
//    */
//   setDisplayedConversationsNumber(number : number) {
//     this.displayedConversationsNumber = number;
//   }

//   /**
//    * returns the archived conversations
//    */
//   getArchviedConversations() {
//     return this.archivedConversations;
//   }

//   /**
//    * 
//    */
//   connect() {
//     const that = this;
//     // perform the query
//     // it will return the first {displayedConversationsNumber} conversation sorted by timestamp
//     this.nodeArchivedConversationsQueryRef = this.nodeArchivedConversationsRef.orderByChild('timestamp');//.limitToLast(this.displayedConversationsNumber);

//     // subscribe at on add event
//     this.nodeArchivedConversationsQueryRef.on("child_added", function (snapshot) {
//       // console.log("ArchivedConversationsProvider::connect::child_added", snapshot.ref);
//       // console.log("ArchivedConversationsProvider::connect::child_added", snapshot.key);
//       // console.log("ArchivedConversationsProvider::connect::child_added::snapshot:", snapshot);
//       that.onConversationSnapshotAdded(snapshot);
//     })

//     // subscribe at on change event
//     this.nodeArchivedConversationsQueryRef.on("child_changed", function (snapshot) {
//       // console.log("ArchivedConversationsProvider::connect::child_changed", snapshot.ref);
//       // console.log("ArchivedConversationsProvider::connect::child_changed", snapshot.key);
//       that.onConversationSnapshotChanged(snapshot);
//     });

//     // subscribe at on remove event
//     this.nodeArchivedConversationsQueryRef.on("child_removed", function (snapshot) {
//       // console.log("ArchivedConversationsProvider::connect::child_removed::snapshot:", snapshot.ref);
//       // console.log("ArchivedConversationsProvider::connect::child_removed::snapshot:", snapshot.key);
//       that.onConversationSnapshotRemoved(snapshot);
//     });
//   }

//   /**
//    * Decode the conversation snapshot to the relative ConversationModel.
//    * Push the conversation to the conversation array
//    * @param snapshot the conversations snapshot
//    */
//   private onConversationSnapshotAdded(snapshot) {

//     // retrieve the snapshot val which contains the conversation data
//     const childData: ConversationModel = snapshot.val();

//     // retrieve the snapshot key which coincides with the conversation id 
//     childData.uid = snapshot.key;

//     // create the conversation object 
//     const conversation = this.completeConversation(childData);
//     // console.log("ArchivedConversationsProvider::onConversationSnapshotAdded::conversation:", conversation);

//     // add the conversation at the top of the conversations array
//     this.archivedConversations.unshift(conversation);

//     // @TODO riordina
//   }

//   /**
//    * Decode the conversation snapshot to the relative ConversationModel
//    * Look within the array for the decoded conversation: 
//    * if it exists remove it and add it to the top (update)
//    * @param snapshot the conversations snapshot
//    */
//   private onConversationSnapshotChanged(snapshot) {

//     // retrieve the snapshot val which contains the conversation data
//     const childData: ConversationModel = snapshot.val();

//     // retrieve the snapshot key which coincides with the conversation id 
//     childData.uid = snapshot.key;

//     // create the conversation object 
//     const conversation = this.completeConversation(childData);
//     // console.log("ArchivedConversationsProvider::onConversationSnapshotChanged::conversation:", conversation);

//     // looking for the retrieved conversation an retrieve its index within the array
//     const index = searchIndexInArrayForUid(this.archivedConversations, conversation.uid);
//     if(index > -1) {
//       // conversations exists 
//       this.archivedConversations.splice(index, 1, conversation); // remove it 
//       // push the conversation to the top to update 
//       this.archivedConversations.unshift(conversation);
//     }
//   }


//   /**
//   * Decode the conversation snapshot to the relative ConversationModel
//   * Look within the array for the decoded conversation: 
//   * if it exists remove it 
//   * @param snapshot the conversations snapshot
//   */
//   private onConversationSnapshotRemoved(snapshot) {

//     // retrieve the snapshot val which contains the conversation data
//     const childData: ConversationModel = snapshot.val();

//     // retrieve the snapshot key which coincides with the conversation id 
//     childData.uid = snapshot.key;

//     // create the conversation object 
//     const conversation = this.completeConversation(childData);
//     // console.log("ArchivedConversationsProvider::onConversationSnapshotRemoved::conversation:", conversation);

//     // looking for the retrieved conversation an retrieve its index within the array
//     const index = searchIndexInArrayForUid(this.archivedConversations, conversation.uid);
//     if (index > -1) {
//       // conversations exists 
//       this.archivedConversations.splice(index, 1); // remove it 
//     }
//   }

//   /**
//    * Detach the listener both from the archived conversations node and the archived conversations node query.
//    * More details can be found there: 
//    * https://firebase.google.com/docs/database/web/read-and-write#listen_for_value_events
//    */
//   dispose() {

//     // detach listener from the nodeArchivedConversations archived conversations node nodeArchivedConversationsRef
//     this.nodeArchivedConversationsRef.off();

//     // detach listener from the archived conversations node query nodeArchivedConversationsQueryRef
//     this.nodeArchivedConversationsQueryRef.off();
//   }

//   /**
//     * Completo conversazione aggiungendo:
//     * 1 - imposto selected == true se è la conversazione selezionata
//     * 2 - imposto fullname del sender concatenando nome e cognome e
//     *   - aggiungo 'tu:' se il sender coincide con il loggedUser
//     * 3 - imposto il tempo trascorso dell'invio dell'ultimo messaggio
//     * @param conv 
//     */
//   private completeConversation(conv): ConversationModel {
//     //debugger;
//     conv.selected = false;
//     if (!conv.sender_fullname || conv.sender_fullname === 'undefined' || conv.sender_fullname.trim() === '') {
//       conv.sender_fullname = conv.sender;
//     }
//     if (!conv.recipient_fullname || conv.recipient_fullname === 'undefined' || conv.recipient_fullname.trim() === '') {
//       conv.recipient_fullname = conv.recipient;
//     }

//     let conversation_with_fullname = conv.sender_fullname;
//     let conversation_with = conv.sender;
//     if (conv.sender === this.loggedUser.uid) {
//       conversation_with = conv.recipient;
//       conversation_with_fullname = conv.recipient_fullname;
//       conv.last_message_text = LABEL_TU + conv.last_message_text;
//     }
//     else if (conv.channel_type === TYPE_GROUP) {
//       conversation_with = conv.recipient;
//       conversation_with_fullname = conv.recipient_fullname;
//       conv.last_message_text = conv.last_message_text;
//     }
//     conv.conversation_with_fullname = conversation_with_fullname;

//     conv.status = this.setStatusConversation(conv.sender, conv.uid);
//     this.setImageConversation(conv, conversation_with);

//     const time_last_message = this.getTimeLastMessage(conv.timestamp);
//     conv.time_last_message = time_last_message;

//     return conv;
//   }

//   private setStatusConversation(sender, uid): string {
//     let status = '0'; //letto
//     // if (sender === this.loggedUser.uid || uid === this.uidConvSelected) {
//     if (sender === this.loggedUser.uid) {
//       status = '0';
//     } else {
//       status = '1'; // non letto
//     }
//     return status;
//   }

//   /**
//    * calcolo il tempo trascorso da ora al timestamp passato
//    * @param timestamp 
//    */
//   private getTimeLastMessage(timestamp: string) {
//     let timestampNumber = parseInt(timestamp) / 1000;
//     let time = getFromNow(timestampNumber);
//     return time;
//   }

//   private setImageConversation(conv, conversation_with) {
//     let image = URL_NO_IMAGE;
//     if (conv.channel_type === TYPE_DIRECT) {
//       const urlNodeConcacts = contactsRef(this.appId) + conversation_with + '/imageurl/';
//       firebase.database().ref(urlNodeConcacts).once('value')
//         .then(function (snapshot) {
//           //console.log("urlNodeConcacts::: ", snapshot.val(), urlNodeConcacts);
//           //conv.image = snapshot.val();
//           if (snapshot.val().trim()) {
//             //return snapshot.val();
//             conv.image = snapshot.val();
//           } else {
//             conv.image = image;
//           }
//         })
//         .catch(function (err) {
//           conv.image = image;
//         })
//     } else {
//       conv.image = image;
//     }
//   }
// }
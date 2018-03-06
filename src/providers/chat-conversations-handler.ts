import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Events } from 'ionic-angular';
// firebase
import * as firebase from 'firebase/app';
// models
import { UserModel } from '../models/user';
import { ConversationModel } from '../models/conversation';
// services
import { ChatManager } from './chat-manager/chat-manager';
// utils
import { LABEL_TU, URL_NO_IMAGE, TYPE_DIRECT } from '../utils/constants';
import { getFromNow, contactsRef, conversationsPathForUserId, searchIndexInArrayForUid } from '../utils/utils';
// import { LABEL_TU } from '../utils/constants';

@Injectable()
export class ChatConversationsHandler {

    private tenant: string;
    private loggedUser: UserModel;
    private userId: string;
    //public conversations: ConversationModel[];
    private idConversationSelected: String;
    private ref: firebase.database.Query;
    //public LABEL_TU: string;
    constructor(
        public events: Events,
        public chatManager: ChatManager
    ) {
    
    }
    /**
     * ritorno istanza di conversations handler
     */
    getInstance() {
        return this;
    }
    /**
     * inizializzo conversations handler
     * @param tenant 
     * @param user 
     */
    initWithTenant(tenant, loggedUser):ChatConversationsHandler{
        this.tenant = tenant;
        this.loggedUser = loggedUser;
        this.userId = loggedUser.uid;
        //this.conversations = [];
        return this;
    }
    /**
     * mi connetto al nodo conversations
     * creo la reference
     * mi sottoscrivo a change, removed, added
     */
    connect() {
        const that = this;
        const urlNodeFirebase = conversationsPathForUserId(this.tenant, this.userId);
        //const urlNodeFirebase = '/apps/'+tenant+'/users/'+this.loggedUser.uid+'/conversations';
        this.ref = firebase.database().ref(urlNodeFirebase).orderByChild('timestamp').limitToLast(50);
        this.ref.on("child_changed", function(childSnapshot) {
            that.changed(childSnapshot);
        });
        this.ref.on("child_removed", function(childSnapshot) {
            that.removed(childSnapshot);
        });
        this.ref.on("child_added", function(childSnapshot) {
            that.added(childSnapshot);
        })
    }
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    /**
     * 1 - aggiungo alla pos 0 la nuova conversazione all'array di conversazioni 
     * 2 - pubblico conversations:update
     * @param childSnapshot 
     */
    added(childSnapshot){
        const childData:ConversationModel = childSnapshot.val();
        childData.uid = childSnapshot.key;
        if(!childData.image){
            childData.image = URL_NO_IMAGE;
        }
        const conversation = this.completeConversation(childData);
        console.log("child_added conversationS",conversation);
        this.events.publish('conversations:added', conversation);
        //this.conversations.splice(0, 0, conversation);
        //this.events.publish('conversations:added', this.conversations, childSnapshot.key );
    }
    /**
     * 1 - cerco indice conversazione nell'array conversation
     * 2 - sostituisco conversazione
     * 3 - pubblico conversations:update
     * @param childSnapshot 
     */
    changed(childSnapshot){
        const childData:ConversationModel = childSnapshot.val();
        childData.uid = childSnapshot.key;
        if(!childData.image){
            childData.image = URL_NO_IMAGE;
        }
        const conversation = this.completeConversation(childData);
        conversation.status = '1'; 
        console.log("child_changed conversationS",conversation);
        this.events.publish('conversations:changed', conversation);

        // const index = searchIndexInArrayForUid(this.conversations, childSnapshot.key);
        // // controllo superfluo sarà sempre maggiore
        // console.log("child_changed", index);
        // if(index>-1){
        //     const conversation = this.completeConversation(childData);
        //     conversation.status = '1'; 
        //     this.conversations.splice(index, 1, conversation);
        //     //this.events.publish('conversations:changed', this.conversations, childSnapshot.key);
        // }
    }
    /**
     * 1 - cerco indice conversazione da eliminare
     * 2 - elimino conversazione da array conversations
     * 3 - pubblico conversations:update
     * @param childSnapshot 
     */
    removed(childSnapshot){
        console.log("child_removed");
        // const index = searchIndexInArrayForUid(this.conversations, childSnapshot.key);
        // // controllo superfluo sarà sempre maggiore
        // if(index>-1){
        //     this.conversations.splice(index, 1);
        //     this.events.publish('conversations:update', this.conversations);
        // }
    }
    /**
     * Completo conversazione aggiungendo:
     * 1 - imposto selected == true se è la conversazione selezionata
     * 2 - imposto fullname del sender concatenando nome e cognome e
     *   - aggiungo 'tu:' se il sender coincide con il loggedUser
     * 3 - imposto il tempo trascorso dell'invio dell'ultimo messaggio
     * @param conv 
     */
    completeConversation(conv):ConversationModel{
        conv.selected = false;
        if(this.idConversationSelected && conv.key == this.idConversationSelected){
            conv.selected = true;
        }
        if(!conv.sender_fullname || conv.sender_fullname == 'undefined' || conv.sender_fullname.trim() == ''){
            conv.sender_fullname = conv.sender;
        }
        if(!conv.recipient_fullname || conv.recipient_fullname == 'undefined' || conv.recipient_fullname.trim() == ''){
            conv.recipient_fullname = conv.recipient;
        }
        let conversation_with_fullname = conv.sender_fullname;
        let conversation_with = conv.sender;
        if(conv.sender == this.loggedUser.uid){
            conversation_with = conv.recipient;
            conversation_with_fullname = conv.recipient_fullname;
            conv.last_message_text = LABEL_TU + conv.last_message_text;
        } else {
            conv.last_message_text = conv.sender_fullname + ': ' + conv.last_message_text;
        }
        const time_last_message = this.getTimeLastMessage(conv.timestamp);
        conv.conversation_with_fullname = conversation_with_fullname
        conv.time_last_message = time_last_message;
        
        if(conv.channel_type === TYPE_DIRECT) {
            const urlNodeConcacts = contactsRef(this.tenant) + conversation_with + '/imageurl/';
            firebase.database().ref(urlNodeConcacts)
            .once('value').then(function(snapshot) {
                console.log("urlNodeConcacts::: ", snapshot.val(), urlNodeConcacts);
                conv.image = snapshot.val();
            });
        }
        return conv;
    }
    /**
     * calcolo il tempo trascorso da ora al timestamp passato
     * @param timestamp 
     */
    getTimeLastMessage(timestamp: string) {
        let timestampNumber = parseInt(timestamp) / 1000;
        let time = getFromNow(timestampNumber);
        return time;
    }
    /**
     * 1 - deseleziono tutte le conversazioni (setto tutti su on selected FALSE)
     * 2 - evidezio la conversazione selezionata (setto selected TRUE)
     * @param uid 
     */
    // setConversationSelected(uid): ConversationModel[]{
    //     this.conversations.forEach(function(element) {
    //         element.selected = false;
    //     });   
    //     this.conversations.filter(function(item){
    //         if(item.uid == uid){
    //         item.selected = true;
    //         return;
    //         }
    //     });
    //     return this.conversations;
    // }
    /**
     * dispose reference di conversations
     */
    dispose() {
        this.ref.off();
    }

}
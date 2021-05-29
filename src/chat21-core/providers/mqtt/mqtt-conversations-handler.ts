import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// mqtt
import {Chat21Service} from './chat-service';

// models
import { ConversationModel } from '../../models/conversation';

// services
import { ConversationsHandlerService } from '../abstract/conversations-handler.service';
// import { DatabaseProvider } from 'src/app/services/database';

// utils
import { getImageUrlThumbFromFirebasestorage, avatarPlaceholder, getColorBck } from '../../utils/utils-user';
import { compareValues, getFromNow, conversationsPathForUserId, searchIndexInArrayForUid } from '../../utils/utils';
// import { ImageRepoService } from '../abstract/image-repo.service';
// import { ConsoleReporter } from 'jasmine';

@Injectable({ providedIn: 'root' })
export class MQTTConversationsHandler extends ConversationsHandlerService {

    // BehaviorSubject
    BSConversationDetail: BehaviorSubject<ConversationModel>;
    readAllMessages: BehaviorSubject<string>;
    conversationAdded: BehaviorSubject<ConversationModel>;
    conversationChanged: BehaviorSubject<ConversationModel>;
    conversationRemoved: BehaviorSubject<ConversationModel>;
    loadedConversationsStorage: BehaviorSubject<ConversationModel[]>;
    BSConversations: BehaviorSubject<ConversationModel[]>
    // imageRepo: ImageRepoService;

    // public variables
    conversations: Array<ConversationModel> = [];
    uidConvSelected: string;
    tenant: string;

    // privates
    private loggedUserId: string;
    private translationMap: Map<string, string>;
    private isConversationClosingMap: Map<string, boolean>;

    private ref: firebase.database.Query;
    private audio: any;
    private setTimeoutSound: any;

    constructor(
        public chat21Service: Chat21Service
    ) {
        super();
    }

    /**
     * inizializzo conversations handler
     */
    initialize(
        tenant: string, 
        userId: string,
        translationMap: Map<string, string>
        ) {
        console.log('initialize MQTTConversationsHandler');
        this.loggedUserId = userId;
        this.translationMap = translationMap;
        this.conversations = [];
        // this.databaseProvider.initialize(userId, this.tenant);
        this.isConversationClosingMap = new Map();
        // this.getConversationsFromStorage();
    }

    public getConversationDetail(conversationWith: string, callback) {
        // 1 cerco array locale
        // 2 cerco remoto
        // callback

        const conversation = this.conversations.find(conv => conv.conversation_with === conversationWith);
        console.log('found locally? getConversationDetail *****: ', conversation);
        if (conversation) {
            console.log('found!');
            callback(conversation);
        } else {
            console.log('Not found locally, remote.getConversationDetail *****: ', conversation);
            this.chat21Service.chatClient.conversationDetail(conversationWith, (conversation) => {
                if (conversation) {
                    if (callback) {
                        callback(this.completeConversation(conversation));
                    }
                }
                else {
                    if (callback) {
                        callback(null);
                    }
                }
            })
        }
    }

    setConversationRead(conversationrecipient): void {
        console.log("setConversationRead...")
        this.chat21Service.chatClient.updateConversationIsNew(conversationrecipient, false, (err) => {
            if (err) {
                console.error("setConversationRead: false. An error occurred", err);
            }
            else {
                console.log("setConversationRead: false. Ok");
            }
        });
    }

    // ---------------------------------------------------------------------------------
     // New connect - renamed subscribeToConversation
     //----------------------------------------------------------------------------------
     subscribeToConversations(loaded) {
            console.log('connecting MQTT conversations handler');
            const handlerConversationAdded = this.chat21Service.chatClient.onConversationAdded( (conv) => {
                console.log('conversation added:', conv);
                this.added(conv);
            });
            const handlerConversationUpdated = this.chat21Service.chatClient.onConversationUpdated( (conv, topic) => {
                console.log('conversation updated:', conv);
                this.changed(conv);
            });
            const handlerConversationDeleted = this.chat21Service.chatClient.onConversationDeleted( (conv, topic) => {
                console.log('conversation deleted:', conv, topic);
                // example topic: apps.tilechat.users.ME.conversations.CONVERS-WITH.clientdeleted
                const topic_parts = topic.split("/")
                console.debug("topic and parts", topic_parts)
                if (topic_parts.length < 7) {
                    console.error("Error. Not a conversation-deleted topic:", topic);
                    return
                }
                const convers_with = topic_parts[5];
                this.removed({
                    uid: convers_with
                });
            });
            this.chat21Service.chatClient.lastConversations( false, (err, conversations) => {
                console.log('Last conversations', conversations, 'err', err);
                if (!err) {
                    conversations.forEach(conv => {
                        this.added(conv);
                    });
                    loaded();
                }
            });
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    /**
     * 1 -  completo la conversazione con i parametri mancanti
     * 2 -  verifico che sia una conversazione valida
     * 3 -  salvo stato conversazione (false) nell'array delle conversazioni chiuse
     * 4 -  aggiungo alla pos 0 la nuova conversazione all'array di conversazioni 
     *      o sostituisco la conversazione con quella preesistente
     * 5 -  salvo la conversazione nello storage
     * 6 -  ordino l'array per timestamp
     * 7 -  pubblico conversations:update
     */
    private added(childSnapshot: any) {
        console.log("NEW CONV:", childSnapshot)
        let conversation = this.completeConversation(childSnapshot);
        if (this.isValidConversation(conversation)) {
            this.setClosingConversation(conversation.conversation_with, false);
            const index = this.searchIndexInArrayForConversationWith(this.conversations, conversation.conversation_with);
            if (index > -1) {
                this.conversations.splice(index, 1, conversation);
            } else {
                this.conversations.splice(0, 0, conversation);
            }
            this.conversations.sort(compareValues('timestamp', 'desc'));
            this.conversationAdded.next(conversation);
        } else {
            console.error('ChatConversationsHandler::added::conversations with conversationId: ', conversation.conversation_with, 'is not valid');
        }
    }

    searchIndexInArrayForConversationWith(conversations, conversation_with: string) {
        return conversations.findIndex(conv => conv.conversation_with === conversation_with);
    }

    /**
     * 1 -  completo la conversazione con i parametri mancanti
     * 2 -  verifico che sia una conversazione valida
     * 3 -  aggiungo alla pos 0 la nuova conversazione all'array di conversazioni 
     * 4 -  salvo la conversazione nello storage
     * 5 -  ordino l'array per timestamp
     * 6 -  pubblico conversations:update
     * 7 -  attivo sound se è un msg nuovo
     */
    private changed(childSnapshot: any) {
        console.log("Conversation changed:", childSnapshot)
        childSnapshot.uid = childSnapshot.conversWith;
        this.setClosingConversation(childSnapshot.uid, false);
        const index = searchIndexInArrayForUid(this.conversations, childSnapshot.uid);
        if (index > -1) {
            const conversation = this.conversations[index];
            console.log("Conversation to update found", conversation);
            this.updateConversationWithSnapshot(this.conversations[index], childSnapshot);
            this.conversations.sort(compareValues('timestamp', 'desc'));
            this.conversationChanged.next(conversation);
            // this.conversations.splice(index, 1, conversation');
        }
    }

    private updateConversationWithSnapshot(conv: ConversationModel, snap: any) {
        console.log("updating conv", conv, "with snap", snap)
        console.log("print snap keys/values")
        Object.keys(snap).forEach(k => {
            console.log("key:" + k);
            if (k === 'is_new') {
                const value = snap[k];
                conv.is_new = snap[k]; //(value == 'true' ? true : false);
            }
        })
    }
    /**
     * 1 -  cerco indice conversazione da eliminare
     * 2 -  elimino conversazione da array conversations
     * 3 -  elimino la conversazione dallo storage
     * 4 -  pubblico conversations:update
     * 5 -  elimino conversazione dall'array delle conversazioni chiuse
     */
    private removed(childSnapshot) {
        const index = searchIndexInArrayForUid(this.conversations, childSnapshot.uid);
        if (index > -1) {
            const conversationRemoved = this.conversations[index]
            this.conversations.splice(index, 1);
            // this.conversations.sort(compareValues('timestamp', 'desc'));
            // this.databaseProvider.removeConversation(childSnapshot.key);
            console.debug("conversationRemoved::", conversationRemoved)
            this.conversationRemoved.next(conversationRemoved);
        }
        // remove the conversation from the isConversationClosingMap
        this.deleteClosingConversation(childSnapshot.uid);
    }

    /**
     * dispose reference di conversations
     */
    dispose() {
        this.conversations.length = 0;
        this.conversations = [];
        this.uidConvSelected = '';
    }

    getClosingConversation(conversationId: string) {
        return this.isConversationClosingMap[conversationId];
    }

    setClosingConversation(conversationId: string, status: boolean) {
        this.isConversationClosingMap[conversationId] = status;
    }

    deleteClosingConversation(conversationId: string) {
        this.isConversationClosingMap.delete(conversationId);
    }

    archiveConversation(conversationId: string) { 
        this.chat21Service.chatClient.archiveConversation(conversationId);
    }

    private completeConversation(conv): ConversationModel {
        console.log('completeConversation', conv);
        conv.selected = false;
        if (!conv.sender_fullname || conv.sender_fullname === 'undefined' || conv.sender_fullname.trim() === '') {
            conv.sender_fullname = conv.sender;
        }
        if (!conv.recipient_fullname || conv.recipient_fullname === 'undefined' || conv.recipient_fullname.trim() === '') {
            conv.recipient_fullname = conv.recipient;
        }
        let conversation_with_fullname = conv.sender_fullname;
        let conversation_with = conv.sender;
        if (conv.sender === this.loggedUserId) {
            conversation_with = conv.recipient;
            conversation_with_fullname = conv.recipient_fullname;
            conv.last_message_text = conv.last_message_text;
        } else if (this.isGroup(conv)) {
            conversation_with = conv.recipient;
            conversation_with_fullname = conv.recipient_fullname;
            conv.last_message_text = conv.last_message_text;
        }
        conv.conversation_with_fullname = conversation_with_fullname;
        conv.conversation_with = conversation_with;
        conv.status = this.setStatusConversation(conv.sender, conv.uid);
        conv.time_last_message = this.getTimeLastMessage(conv.timestamp);
        conv.avatar = avatarPlaceholder(conversation_with_fullname);
        conv.color = getColorBck(conversation_with_fullname);
        if (!conv.last_message_text) {
            conv.last_message_text = conv.text; // building conv with a message
        }
        conv.uid = conv.conversation_with;
        return conv;
    }

    private isGroup(conv: ConversationModel) {
        if (conv.recipient.startsWith('group-') || conv.recipient.startsWith('support-group')) {
            return true;
        };
        return false;
    }

    /** */
    private setStatusConversation(sender, uid): string {
        let status = '0'; // letto
        if (sender === this.loggedUserId || uid === this.uidConvSelected) {
            status = '0';
        } else {
            status = '1'; // non letto
        }
        return status;
    }

    /**
     * calcolo il tempo trascorso da ora al timestamp passato
     * @param timestamp 
     */
    private getTimeLastMessage(timestamp: string) {
        const timestampNumber = parseInt(timestamp) / 1000;
        const time = getFromNow(timestampNumber);
        return time;
    }

    /**
     * restituisce il numero di conversazioni nuove
     */
    countIsNew(): number {
        let num = 0;
        this.conversations.forEach((element) => {
            if (element.is_new === true) {
                num++;
            }
        });
        return num;
    }

    // ---------------------------------------------------------- //
    // END FUNCTIONS
    // ---------------------------------------------------------- //

    /**
     *  check if the conversations is valid or not
    */
    private isValidConversation(convToCheck: ConversationModel) : boolean {
        //console.log("[BEGIN] ChatConversationsHandler:: convToCheck with uid: ", convToCheckId);
        console.log("checking uid of", convToCheck)
        console.log("conversation.uid", convToCheck.uid)
        console.log("channel_type is:", convToCheck.channel_type)
        
        if (!this.isValidField(convToCheck.uid)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'uid is not valid' ");
            return false;
        }
        // if (!this.isValidField(convToCheck.is_new)) {
        //     console.error("ChatConversationsHandler::isValidConversation:: 'is_new is not valid' ");
        //     return false;
        // }
        if (!this.isValidField(convToCheck.last_message_text)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'last_message_text is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.recipient)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'recipient is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.recipient_fullname)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'recipient_fullname is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.sender)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'sender is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.sender_fullname)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'sender_fullname is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.status)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'status is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.timestamp)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'timestamp is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.channel_type)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'channel_type is not valid' ");
            return false;
        }
        //console.log("[END] ChatConversationsHandler:: convToCheck with uid: ", convToCheckId);
        // any other case
        return true;
    }

    // checks if a conversation's field is valid or not
    private isValidField(field) : boolean{
        return (field === null || field === undefined) ? false : true;
    }

}

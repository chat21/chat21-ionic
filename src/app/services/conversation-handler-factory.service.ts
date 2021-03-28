import { Injectable } from '@angular/core';

// services
import {ConversationHandlerService } from './conversation-handler.service';
import {FirebaseConversationHandler } from './firebase/firebase-conversation-handler';
import { MQTTConversationHandler } from './mqtt/mqtt-conversation-handler';


// config
import { environment } from 'src/environments/environment';
import { Chat21Service } from './chat-service';

@Injectable({
  providedIn: 'root'
})
export class ConversationHandlerFactory {

  conversationHandlerService: any;
  constructor(
    public chat21Service: Chat21Service
  ) {
    // console.log('chat21Serviceeeee', this.chat21Service.chatClient.options);
  }

  public build(): ConversationHandlerService {
    console.log('chat21Serviceeeee', this.chat21Service.chatClient.options);
    if (environment.chatEngine === 'mqtt') {
      this.conversationHandlerService = new MQTTConversationHandler(this.chat21Service);
    } else {
      this.conversationHandlerService = new FirebaseConversationHandler();
    }
    return this.conversationHandlerService;
  }
}

import { Injectable } from '@angular/core';

// services
import {ConversationHandlerService } from './conversation-handler.service';
import {FirebaseConversationHandler } from './firebase/firebase-conversation-handler';

// config
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConversationHandlerFactory {

  conversationHandlerService: any;
  constructor() { }

  public build(): ConversationHandlerService {
    if (environment.chatEngine === 'nqtt') {
      this.conversationHandlerService = new FirebaseConversationHandler();
    } else {
      this.conversationHandlerService = new FirebaseConversationHandler();
    }
    return this.conversationHandlerService;
  }
}

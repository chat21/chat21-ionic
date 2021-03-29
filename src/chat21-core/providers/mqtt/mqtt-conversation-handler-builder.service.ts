import { Injectable } from '@angular/core';
// services
import { ConversationHandlerBuilderService } from '../abstract/conversation-handler-builder.service';
import { MQTTConversationHandler } from './mqtt-conversation-handler';
import { Chat21Service } from './chat-service';

@Injectable({
  providedIn: 'root'
})
export class MQTTConversationHandlerBuilderService extends ConversationHandlerBuilderService {

  constructor() {
    super();
  }

  public build(): any {
    const conversationHandlerService = new MQTTConversationHandler(
      Chat21Service
    );
    return conversationHandlerService;
  }
}

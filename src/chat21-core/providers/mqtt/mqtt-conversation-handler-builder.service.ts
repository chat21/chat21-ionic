import { Injectable } from '@angular/core';
// services
import { ConversationHandlerBuilderService } from '../abstract/conversation-handler-builder.service';
import { MQTTConversationHandler } from './mqtt-conversation-handler';

@Injectable({
  providedIn: 'root'
})
export class MQTTConversationHandlerBuilderService extends ConversationHandlerBuilderService {

  constructor() {
    super();
  }

  public build(): any {
    const conversationHandlerService = new MQTTConversationHandler(false);
    return conversationHandlerService;
  }
}

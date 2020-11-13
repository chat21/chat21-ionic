import { Injectable } from '@angular/core';
// services
import { ConversationHandlerBuilderService } from 'src/app/services/abstract/conversation-handler-builder.service';
import { FirebaseConversationHandler } from 'src/app/services/firebase/firebase-conversation-handler';

@Injectable({
  providedIn: 'root'
})
export class FirebaseConversationHandlerBuilderService extends ConversationHandlerBuilderService {

  constructor() {
    super();
  }

  public build(): any {
    const conversationHandlerService = new FirebaseConversationHandler();
    return conversationHandlerService;
  }
}

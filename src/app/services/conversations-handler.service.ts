import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';

// models
import { ConversationModel } from '../models/conversation';

@Injectable({
  providedIn: 'root'
})
export abstract class ConversationsHandlerService {

  // BehaviorSubject
  abstract readAllMessages: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  abstract conversationsAdded: BehaviorSubject<ConversationModel[]> = new BehaviorSubject<ConversationModel[]>([]);
  abstract conversationsChanged: BehaviorSubject<ConversationModel[]> = new BehaviorSubject<ConversationModel[]>([]);
  abstract conversationsRemoved: BehaviorSubject<ConversationModel[]> = new BehaviorSubject<ConversationModel[]>([]);
  abstract loadedConversationsStorage: BehaviorSubject<ConversationModel[]> = new BehaviorSubject<ConversationModel[]>([]);

  // params
  abstract conversations: Array<ConversationModel> = [];
  abstract uidConvSelected: string;
  abstract tenant = environment.tenant;
  abstract FIREBASESTORAGE_BASE_URL_IMAGE = environment.FIREBASESTORAGE_BASE_URL_IMAGE;
  abstract urlStorageBucket = environment.firebaseConfig.storageBucket + '/o/profiles%2F';

  // functions
  abstract initialize(userId: string, translationMap: Map<string, string>): void;
  abstract connect(): void;
  abstract countIsNew(): number;
  abstract dispose(): void;
  abstract getClosingConversation(conversationId: string): boolean;
  abstract setClosingConversation(conversationId: string, status: boolean): void;
  abstract deleteClosingConversation(conversationId: string): void;

}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// models
import { ConversationModel } from '../models/conversation';

@Injectable({
  providedIn: 'root'
})
export abstract class ConversationsHandlerService {

  // BehaviorSubject
  abstract conversationsChanged: BehaviorSubject<ConversationModel[]> = new BehaviorSubject<ConversationModel[]>([]);
  abstract loadedConversationsStorage: BehaviorSubject<ConversationModel[]> = new BehaviorSubject<ConversationModel[]>([]);

  // params
  abstract conversations: Array<ConversationModel> = [];
  abstract uidConvSelected: string;

  // functions
  abstract initialize(tenant: string, userId: string, translationMap: Map<string, string>): void;
  abstract connect(): void;
  abstract countIsNew(): number;
  abstract dispose(): void;
}

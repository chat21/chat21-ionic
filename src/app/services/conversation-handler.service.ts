import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// models
import { MessageModel } from '../models/message';
import { UserModel } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})

export abstract class ConversationHandlerService {

  // BehaviorSubject
  abstract messageAdded: BehaviorSubject<MessageModel> = new BehaviorSubject<MessageModel>(null);
  abstract messageChanged: BehaviorSubject<MessageModel> = new BehaviorSubject<MessageModel>(null);
  abstract messageRemoved: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  // params
  abstract attributes: any;
  abstract messages: Array<MessageModel> = [];
  abstract ref: any;
  abstract conversationWith: string;


  // functions
  abstract initialize(
    recipientId: string, recipientFullName: string, loggedUser: UserModel, tenant: string, translationMap: Map<string, string>): void;
  abstract connect(): void;
  abstract sendMessage(
    msg: string,
    type: string,
    metadata: string,
    conversationWith: string,
    conversationWithDetailFullname: string,
    sender: string,
    senderFullname: string,
    channelType: string
  ): void;
  abstract dispose(): void;

}

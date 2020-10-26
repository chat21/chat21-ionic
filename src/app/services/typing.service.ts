import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export abstract class TypingService {

  abstract initialize(tenant: string): void;

  abstract isTyping(idConversation: string, idUser: string): void;

  abstract setTyping(idConversation: string, message: string, idUser: string, userFullname: string): void;

}

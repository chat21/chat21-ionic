import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export abstract class TypingService {
  // params
  abstract tenant = environment.tenant;

  // functions
  abstract initialize(): void;
  abstract isTyping(idConversation: string, idUser: string): void;
  abstract setTyping(idConversation: string, message: string, idUser: string, userFullname: string): void;
}

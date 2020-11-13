import { Injectable } from '@angular/core';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';

// services
import { EventsService } from '../events-service';
import { PresenceService } from '../presence.service';

// utils
import { setLastDate } from '../../utils/utils';
import { environment } from '../../../environments/environment';
import { TypingService } from '../typing.service';

export class TypingModel {
  constructor(
      public timestamp: any,
      public message: string,
      public name: string
  ) { }
}

@Injectable({
  providedIn: 'root'
})

export class FirebaseTypingService extends TypingService {

  tenant: string;

  private urlNodeTypings: string;
  private setTimeoutWritingMessages: any;

  constructor(
    private events: EventsService
  ) {
    super();
  }

  /** */
  public initialize() {
    console.log('FirebaseTypingService', this.tenant);
    this.urlNodeTypings = '/apps/' + this.tenant + '/typings/';
  }

  /** */
  public isTyping(idConversation: string, idUser: string) {
    const that = this;
    
    let urlTyping = this.urlNodeTypings + idConversation;
    if (idUser) {
      urlTyping = this.urlNodeTypings + idUser + '/' + idConversation;
    }
    console.log('urlTyping: ', urlTyping);
    const ref = firebase.database().ref(urlTyping).orderByChild('timestamp').limitToLast(1);
    ref.on('child_changed', (childSnapshot) => {
      console.log('urlTyping: ', childSnapshot.val());
      // this.BSIsTyping.next({uid: childSnapshot.key, nameUserTypingNow: childSnapshot.name});
      that.events.publish('isTyping', childSnapshot);
    });
  }

  /** */
  public setTyping(idConversation: string, message: string, idUser: string, userFullname: string) {
    const that = this;
    this.setTimeoutWritingMessages = setTimeout(() => {

      let urlTyping = this.urlNodeTypings + idConversation;
      if (idUser) {
        urlTyping = this.urlNodeTypings + idConversation + '/' + idUser ;
      }
      console.log('setWritingMessages:', urlTyping, userFullname);
      const timestampData =  firebase.database.ServerValue.TIMESTAMP;
      const precence = new TypingModel(timestampData, message, userFullname);
      firebase.database().ref(urlTyping).set(precence, ( error ) => {
        if (error) {
          console.log('ERRORE', error);
        } else {
          // console.log('OK update typing');
        }
        that.events.publish('setTyping', precence, error);
      });
    }, 500);
  }

}

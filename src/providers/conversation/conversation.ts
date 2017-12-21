import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { ApplicationContext } from '../application-context/application-context';
import * as firebase from 'firebase/app';

@Injectable()
export class ConversationProvider {

  constructor(
    public applicationContext: ApplicationContext
  ) {
  }

  loadListConversations(): any {
    //recupero uid current user
    const tenant = this.applicationContext.getTenant();
    const currentUser = firebase.auth().currentUser;//this.applicationContext.getCurrentUser();
    const urlNodeFirebase = '/apps/'+tenant+'/users/'+currentUser.uid+'/conversations';
    let ref = firebase.database().ref(urlNodeFirebase).orderByChild('timestamp').limitToLast(50);
    return ref;
  }

}

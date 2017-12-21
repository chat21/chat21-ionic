import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Platform } from 'ionic-angular';

import { UserModel } from '../../models/user';
import * as firebase from 'firebase/app';

// utils
import { getNowTimestamp } from '../../utils/utils';
import { ApplicationContext } from '../../providers/application-context/application-context';


//// COME CREARE UN SINGLETON 
////https://stackoverflow.com/questions/43387855/singletons-in-ionic-3-angular-4
/*
  Generated class for the UserProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

@Injectable()

export class UserService {
  public currentUserDetails: UserModel;
  private urlNodeContacts: string;

  private currentUser: firebase.User;


  constructor(
    private platform: Platform,
    public applicationContext: ApplicationContext
  ) {
    platform.ready().then(() => {
      const tenant = this.applicationContext.getTenant();
      this.urlNodeContacts = '/apps/'+tenant+'/contacts/';
    });
  }

  setUserDetail(uid): any {
    // controllo se il nodo esiste prima di restituire il risultato
    //// DA FARE ////
    const urlNodeFirebase = this.urlNodeContacts+uid;
    const userFirebase = firebase.database().ref(urlNodeFirebase);
    return userFirebase;
  }

  saveCurrentUserDetail(uid: string, email: string, firstname: string, lastname: string){
    let timestamp = getNowTimestamp();
    console.log("saveCurrentUserDetail: ",this.urlNodeContacts, uid, firstname, lastname);
    return firebase.database().ref(this.urlNodeContacts)
    .child(uid).set({uid:uid, email:email, firstname:firstname, lastname:lastname, timestamp:timestamp, imageurl:''})
  }

  setCurrentUserDetails(uid, email) {
    const urlNodeFirebase = this.urlNodeContacts+uid;
    let that = this;
    const userFirebase = firebase.database().ref(urlNodeFirebase);
    userFirebase.on('value', function(snapshot) {
      if (snapshot.val()){
        const user = snapshot.val();
        const fullname = user.firstname+" "+user.lastname;
        that.currentUserDetails = new UserModel(user.uid, user.email, user.firstname, user.lastname, fullname, '');
      }
      else {
        that.currentUserDetails = new UserModel(uid, email, '', '', uid, '');
        // aggiorno user nel nodo firebase contacts
        that.saveCurrentUserDetail(uid, email, '', '');
      }
      // salvo dettaglio currentUser nel singlelton
      that.applicationContext.setCurrentUserDetail(that.currentUserDetails);
    });
    // salvo reference e dettaglio currentUser nel singlelton
    this.applicationContext.setRef(userFirebase, 'contact');
  }

  getCurrentUserDetails(){
    console.log("getCurrentUserDetails: ", this.currentUserDetails);
    if (this.currentUserDetails){
      return this.currentUserDetails;
    }
    return;
  }

}

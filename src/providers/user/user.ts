import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Platform, Config } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';

import { UserModel } from '../../models/user';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

// utils
import { getNowTimestamp } from '../../utils/utils';


//// COME CREARE UN SINGLETON 
////https://stackoverflow.com/questions/43387855/singletons-in-ionic-3-angular-4
/*
  Generated class for the UserProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UserService {

  //static injector: Injector;
  public currentUserDetails: UserModel;
  private tenant: string;
  private urlNodeContacts: string;
  private currentUser: firebase.User;


  constructor(
    //injector: Injector,
    platform: Platform,
    public config: Config,
    public db: AngularFireDatabase
  ) {
    //UserProvider.injector = injector;
    // recupero tenant
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      let appConfig = this.config.get("appConfig");
      this.tenant = appConfig.tenant;
      this.urlNodeContacts = '/apps/'+this.tenant+'/contacts/';
      //this.setCurrentUserDetails();
    });
  }

  setUserDetail(uid): any {
    // controllo se il nodo esiste prima di restituire il risultato
    //// DA FARE ////
    const urlNodeFirebase = this.urlNodeContacts+uid;
    //return firebase.database().ref(urlNodeFirebase).once('value');
    const userFirebase = this.db.object(urlNodeFirebase, { preserveSnapshot: true});
    return userFirebase;
  }

  saveCurrentUserDetail(uid: string, username: string, name: string, surname: string){
    // recupero tenant
    let timestamp = getNowTimestamp();
    console.log("saveCurrentUserDetail --------->",this.urlNodeContacts, uid, name, surname);
    return firebase.database().ref(this.urlNodeContacts)
    .child(uid).set({uid:uid, name:name, surname:surname, imageurl:'', timestamp:timestamp})
  }

  setCurrentUserDetails(uid, email) {
    const urlNodeFirebase = this.urlNodeContacts+uid;
    const userFirebase = this.db.object(urlNodeFirebase, { preserveSnapshot: true });
    userFirebase.subscribe(snapshot => {
      if (snapshot.val()){
        const user = snapshot.val();
        const fullname = user.name+" "+user.surname;
        this.currentUserDetails = new UserModel(user.uid, user.name, user.surname, fullname, user.imageurl);
      }
      else {
        this.currentUserDetails = new UserModel(uid, email, '', '', '');
        // aggiorno user nel db contacts
        this.saveCurrentUserDetail(uid, "", email, '');
      }
    });
  }

  getCurrentUserDetails(){
    console.log("getCurrentUserDetails --------->",this.currentUserDetails);
    return this.currentUserDetails;
  }

}

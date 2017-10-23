import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Platform, Config } from 'ionic-angular';

import { UserModel } from '../../models/user';
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
    //public db: AngularFireDatabase
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
    //const userFirebase = this.db.object(urlNodeFirebase, { preserveSnapshot: true});
    //const userFirebase = this.db.object(urlNodeFirebase);
    const userFirebase = firebase.database().ref(urlNodeFirebase);
    return userFirebase;
  }

  saveCurrentUserDetail(uid: string, email: string, username: string, name: string, surname: string){
    // recupero tenant
    let timestamp = getNowTimestamp();
    console.log("saveCurrentUserDetail --------->",this.urlNodeContacts, uid, name, surname);
    return firebase.database().ref(this.urlNodeContacts)
    .child(uid).set({uid:uid, email:email, name:name, surname:surname, timestamp:timestamp, imageurl:''})
  }

  setCurrentUserDetails(uid, email) {
    const urlNodeFirebase = this.urlNodeContacts+uid;
    //const userFirebase = this.db.object(urlNodeFirebase, { preserveSnapshot: true });
    //const userFirebase = this.db.object(urlNodeFirebase);
    //userFirebase.snapshotChanges().subscribe(snapshot => {
    let that = this;
    const userFirebase = firebase.database().ref(urlNodeFirebase);
    userFirebase.on('value', function(snapshot) {
      if (snapshot.val()){
        const user = snapshot.val();
        const fullname = user.name+" "+user.surname;
        that.currentUserDetails = new UserModel(user.uid, user.email, user.name, user.surname, fullname, '');
      }
      else {
        that.currentUserDetails = new UserModel(uid, email, '', '', uid, '');
        // aggiorno user nel db contacts
        that.saveCurrentUserDetail(uid, email, '', '', uid);
      }
    });
  }

  getCurrentUserDetails(){
    console.log("getCurrentUserDetails --------->",this.currentUserDetails);
    if (this.currentUserDetails){
      return this.currentUserDetails;
    }
  }

}

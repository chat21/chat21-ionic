import { Injectable } from '@angular/core';
// models
import { UserModel } from 'src/app/models/user';
// firebase
import * as firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
// services
import { UserService } from '../user.service';

@Injectable({ providedIn: 'root' })
export class FirebaseUserService extends UserService {
  FIREBASESTORAGE_BASE_URL_IMAGE: string;
  urlStorageBucket: string;

  private tenant: string;
  private urlNodeContacts: string;

  constructor(
  ) {
    super();
  }

  /**
   * 
   * @param tenant
   */
  initialize(tenant: string) {
    this.tenant = tenant;
    this.urlNodeContacts = '/apps/' + this.tenant + '/contacts/';
  }

  /**
   *
   * @param userUID
   */
  public loadUserDetail(userUID: string): UserModel {
    const that = this;
    console.log('loadUserDetail: ', userUID);
    return this.firebaseUserDetail(userUID)
    .then((user: any) => {
      console.log('loadUserDetail: then ', user.val());
      return that.createCompleteUser(user.val());
    })
    .catch((err: Error) => {
      console.log('error fullProfile', err);
      return;
    });
  }

  /**
   * loadCurrentUserDetail
   */
  public loadCurrentUserDetail(): UserModel {
    const currentUser = firebase.auth().currentUser;
    console.log('currentUser: ', currentUser);
    return this.loadUserDetail(currentUser.uid);
  }

  /**
   *
   * @param user
   */
  updateUserDetail(user: any) {
    // updateUserDetail
  }

  /**
   *
   * @param userUID
   */
  private firebaseUserDetail(userUID: string): any {
    const urlNode = this.urlNodeContacts + userUID;
    console.log('loadUserDetail::: ', urlNode);
    const firebaseRef = firebase.database().ref(urlNode);
    return firebaseRef.once('value');
  }

  /**
   * 
   * @param user
   */
  private createCompleteUser(user: any) {
    const member = new UserModel(user.uid);
    try {
      const firstname = user.firstname ? user.firstname : '';
      const lastname = user.lastname ? user.lastname : '';
      const email = user.email ? user.email : '';
      const fullname = ( firstname + ' ' + lastname ).trim();
      const avatar = this.avatarPlaceholder(fullname);
      const color = this.getColorBck(fullname);
      const imageurl = this.getImageUrlThumbFromFirebasestorage(user.uid);
      member.email = email;
      member.firstname = firstname;
      member.lastname = lastname;
      member.fullname = fullname;
      member.imageurl = imageurl;
      member.avatar = avatar;
      member.color = color;
      console.log('createCompleteUser: ', member);
      return member;
    } catch (err) {
      console.log(err);
      console.log('createCompleteUser: ', member);
      return member;
    }
  }



  /**
   *
   * @param str
   */
  private getColorBck(str: string): string {
    const arrayBckColor = ['#fba76f', '#80d066', '#73cdd0', '#ecd074', '#6fb1e4', '#f98bae'];
    let num = 0;
    if (str) {
      const code = str.charCodeAt((str.length - 1));
      num = Math.round(code % arrayBckColor.length);
    }
    return arrayBckColor[num];
  }

  /**
   *
   * @param name
   */
  private avatarPlaceholder(name: string) {
    let initials = '';
    if (name) {
      const arrayName = name.split(' ');
      arrayName.forEach(member => {
        if (member.trim().length > 1 && initials.length < 3) {
          initials += member.substring(0, 1).toUpperCase();
        }
      });
    }
    return initials;
  }

  /**
   *
   * @param uid
   */
  private getImageUrlThumbFromFirebasestorage(uid: string) {
    const imageurl = this.FIREBASESTORAGE_BASE_URL_IMAGE + this.urlStorageBucket + uid + '%2Fthumb_photo.jpg?alt=media';
    return imageurl;
  }

}




  // /** */
  // saveCurrentUserDetail(uid: string, email: string, firstname: string, lastname: string){
  //   let timestamp = getNowTimestamp();
  //   console.log("saveCurrentUserDetail: ",this.urlNodeContacts, uid, firstname, lastname);
  //   return firebase.database().ref(this.urlNodeContacts)
  //   .child(uid).set({uid:uid, email:email, firstname:firstname, lastname:lastname, timestamp:timestamp, imageurl:''})
  // }

  // getUserDetail(uid): any {
  //   const tenant = this.chatManager.getTenant();
  //   const urlNodeConcacts = contactsRef(tenant) + uid;
  //   var ref =  firebase.database().ref(urlNodeConcacts).once('value');
  //   console.log("UserService::getUserDetail::ref:", urlNodeConcacts);
  //   return ref;
  // }

  // getListMembers(members): UserModel[]{ 
  //   let arrayMembers = [];
  //   members.forEach(member => {
  //     console.log("loadUserDetail: ", member);
  //     let userDetail = new UserModel(member, '', '', member, '', URL_NO_IMAGE);
  //     if (member.trim() !== '' && member.trim() !== SYSTEM) {
  //       this.getUserDetail(member)
  //       .then(function(snapshot) { 
  //         if (snapshot.val()){
  //           const user = snapshot.val();
  //           const fullname = user.firstname+" "+user.lastname;  
  //           let imageUrl =  URL_NO_IMAGE;
  //           if(user.imageurl && user.imageurl !== LABEL_NOICON){
  //             imageUrl = user.imageurl;
  //           }
  //           userDetail = new UserModel(
  //             snapshot.key, 
  //             user.email, 
  //             user.firstname, 
  //             user.lastname, 
  //             fullname.trim(), 
  //             imageUrl
  //           );  
  //           console.log("userDetail: ", userDetail)
  //         }
  //         console.log("---------------> : ", member);
  //         arrayMembers.push(userDetail);
  //       })
  //       .catch(function(err) {
  //         console.log('Unable to get permission to notify.', err);
  //       });
  //     }
  //   });
  //   return arrayMembers;
  // }

  // /**
  //  * CONTROLLO SE L'UTENTE E' AUTENTICATO
  //  * rimango in ascolto sul login logout
  //  * LOGOUT:
  //  * 1 - cancello utente dal nodo presenze
  //  * 2 - rimuovo il token
  //  * 3 - passo lo stato offline al chatmanager
  //  * LOGIN:
  //  * 1 - imposto stato di connessione utente
  //  * 2 - aggiorno il token
  //  * 3 - carico il dettaglio utente (o ne creo uno nuovo)
  //  * 4 - passo lo stato online al chatmanager
  //  */
  // onAuthStateChanged(){
  //   console.log("UserService::onAuthStateChanged");

  //   firebase.auth().onAuthStateChanged(user => {
  //     console.log("UserService::onAuthStateChanged::user:", user);

  //     if (!user) {
  //       console.log(" 3 - PASSO OFFLINE AL CHAT MANAGER");
  //       this.chatManager.goOffLine();
  //       this.events.publish('loggedUser:logout', null);
  //     }
  //     else{
  //       this.userUid = user.uid;
  //       console.log(" 1 - IMPOSTO STATO CONNESSO UTENTE ");
  //       this.chatPresenceHandler.setupMyPresence(user.uid);
  //       console.log(" 2 - AGGIORNO IL TOKEN ::: ", user);
  //       const keySubscription = 'eventGetToken';
  //       this.events.subscribe(keySubscription, this.callbackGetToken);
  //       //this.addSubscription(keySubscription);
  //       //this.msgService.getToken();
        
  //       this.msgService.getToken(); //this.getToken(); // perchè???
  //       console.log(" 3 - CARICO IL DETTAGLIO UTENTE ::: ");
  //       let that = this;
  //       const userFirebase = this.initUserDetails(user.uid);
  //       userFirebase.on('value', function(snapshot) {
  //         if (snapshot.val()){
  //           const user = snapshot.val();
  //           const fullname = user.firstname+" "+user.lastname;
  //           that.currentUserDetails = new UserModel(user.uid, user.email, user.firstname, user.lastname, fullname, user.imageurl);
  //         }
  //         else {
  //           that.currentUserDetails = new UserModel(user.uid, user.email, '', '', user.uid, '');
  //           that.saveCurrentUserDetail(user.uid, user.email, '', '');
  //         }
  //         console.log(" 4 - PASSO ONLINE AL CHAT MANAGER");
  //         that.chatManager.goOnLine(that.currentUserDetails);
  //         that.events.publish('loggedUser:login', this.loggedUser);
  //       });
  //     }
  //   });
  // }

  // callbackGetToken: any = (token) => {
  //   console.log(" 4 - callbackGetToken");
  //   this.msgService.updateToken(this.userUid, token);
  //   this.token = token;
  // }


  // returnToken():string{
  //   return this.token;
  // }

  // /**
  //  * IMPOSTO FIREBASE REFERENCE
  //  * imposto la reference al nodo di firebase dettaglio utente uid
  //  * @param uid 
  //  */
  // initUserDetails(uid) {
  //   this.userUid = uid;
  //   const urlNodeFirebase = this.urlNodeContacts+uid;
  //   return firebase.database().ref(urlNodeFirebase);
  // } 

  // initGroupDetails(uidUser, uidGroup) {
  //   const tenant = this.chatManager.getTenant();
  //   const urlNodeContacts = '/apps/'+tenant+'/users/'+uidUser+'/groups/'+uidGroup;
  //   return firebase.database().ref(urlNodeContacts);
  // } 

  // getUidLastOpenConversation(): string {
  //   return this.uidLastOpenConversation;
  // }

  // /**
  //  * LOGUOT FIREBASE
  //  * al logout vado in automatico su onAuthStateChanged
  //  */
  // logoutUser() {
  //   console.log("UserService::logoutUser");
  //   console.log(" 1 - CANCELLO L'UTENTE DAL NODO PRESENZE");
  //   this.chatPresenceHandler.goOffline();
  //   console.log(" 2 - RIMUOVO IL TOKEN");
  //   this.msgService.removeToken();
  //   return firebase.auth().signOut();
  // }


  // updateUserDetail(user: UserModel) {
  //   const that = this;
  //   const userFirebase = this.initUserDetails(user.uid);
  //   userFirebase.on('value', (snapshot) => {
  //     if (snapshot.val()) {
  //       const newUser = snapshot.val();
  //       const fullname = newUser.firstname + ' ' + newUser.lastname;
  //       that.setCurrentUserDetail(newUser.uid, newUser.email, newUser.firstname, newUser.lastname, fullname, newUser.imageurl);
  //       // currentUserDetails = new UserModel(user.uid, user.email, user.firstname, user.lastname, fullname, user.imageurl);
  //     } else {
  //       that.setCurrentUserDetail(user.uid, user.email, null, null, null, null);
  //       //currentUserDetails = new UserModel(user.uid, user.email, '', '', user.uid, '');
  //       that.saveCurrentUserDetail(user.uid, user.email, '', '');
  //     }
  //   });
  // }
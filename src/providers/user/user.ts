import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Events, Platform } from 'ionic-angular';

// models
import { UserModel } from '../../models/user';
//import { GroupModel } from '../../models/group';
// firebase
import * as firebase from 'firebase/app';
// utils
import { getNowTimestamp, contactsRef } from '../../utils/utils';
import { SYSTEM, URL_NO_IMAGE, LABEL_NOICON } from '../../utils/constants';

// services
import { ChatManager } from '../../providers/chat-manager/chat-manager';
import { ChatPresenceHandler} from '../../providers/chat-presence-handler';
import { MessagingService } from '../../providers/messaging-service';

/**
 * DESC PROVIDER
 */
@Injectable()
export class UserService {
  public currentUserDetails: UserModel;
  public urlNodeContacts: string;
  public uidLastOpenConversation: string;
  public token: string;


  constructor(
    public platform: Platform,
    public events: Events,
    public chatManager: ChatManager,
    public chatPresenceHandler: ChatPresenceHandler,
    public msgService: MessagingService
  ) {
    /**
     * 1 - controllo se l'utente è autenticato e rimango in ascolto
     * 2 - recupero tenant e impoto url contatti 
     */
    platform.ready().then(() => {
      this.onAuthStateChanged();
      const tenant = this.chatManager.getTenant();
      this.urlNodeContacts = '/apps/'+tenant+'/contacts/';
    });
  }

  // setUserDetail(uid): any {
  //   // controllo se il nodo esiste prima di restituire il risultato
  //   //// DA FARE ////
  //   const urlNodeFirebase = this.urlNodeContacts+uid;
  //   const userFirebase = firebase.database().ref(urlNodeFirebase);
  //   return userFirebase;
  // }

  saveCurrentUserDetail(uid: string, email: string, firstname: string, lastname: string){
    let timestamp = getNowTimestamp();
    console.log("saveCurrentUserDetail: ",this.urlNodeContacts, uid, firstname, lastname);
    return firebase.database().ref(this.urlNodeContacts)
    .child(uid).set({uid:uid, email:email, firstname:firstname, lastname:lastname, timestamp:timestamp, imageurl:''})
  }

  // setCurrentUserDetails(uid, email) {
  //   const urlNodeFirebase = this.urlNodeContacts+uid;
  //   let that = this;
  //   const userFirebase = firebase.database().ref(urlNodeFirebase);
  //   userFirebase.on('value', function(snapshot) {
  //     if (snapshot.val()){
  //       const user = snapshot.val();
  //       const fullname = user.firstname+" "+user.lastname;
  //       that.currentUserDetails = new UserModel(user.uid, user.email, user.firstname, user.lastname, fullname, '');
  //     }
  //     else {
  //       that.currentUserDetails = new UserModel(uid, email, '', '', uid, '');
  //       // aggiorno user nel nodo firebase contacts
  //       that.saveCurrentUserDetail(uid, email, '', '');
  //     }
  //     // salvo dettaglio currentUser nel singlelton
  //     that.applicationContext.setCurrentUserDetail(that.currentUserDetails);
  //   });
  //   // salvo reference e dettaglio currentUser nel singlelton
  //   this.applicationContext.setRef(userFirebase, 'contact');
  // }

  // getCurrentUserDetails(){
  //   console.log("getCurrentUserDetails: ", this.currentUserDetails);
  //   if (this.currentUserDetails){
  //     return this.currentUserDetails;
  //   }
  //   return;
  // }


  /**
   * RECUPERO DETTAGLIO UTENTE 
   * @param uid 
   * 1 - leggo nodo contacts con uid passato
   * 2 - creo un model userDetails vouto e rimango in attesa
   * 3 - recupero il dettaglio utente se esiste
   * 4 - pubblico dettaglio utente (subscribe in profile.ts)
   */
  loadUserDetail(uid){
    console.log("loadUserDetail: ", uid);
    const userFirebase = this.initUserDetails(uid);
    return userFirebase.once('value');
    // let that = this;
    // userFirebase.on("value", function(snapshot) {
    //     let userDetail = new UserModel(snapshot.key, '', '', snapshot.key, '', '');        
    //     if (snapshot.val()){
    //       const user = snapshot.val();
    //       const fullname = user.firstname+" "+user.lastname;  
    //       userDetail = new UserModel(
    //         snapshot.key, 
    //         user.email, 
    //         user.firstname, 
    //         user.lastname, 
    //         fullname.trim(), 
    //         user.imageurl
    //       );        
    //     }
    //     console.log("loadUserDetail: ", userDetail);
    //     that.events.publish('loadUserDetail:complete', userDetail);
    //   });
    }

    getUserDetail(uid): any {
      const tenant = this.chatManager.getTenant();
      const urlNodeConcacts = contactsRef(tenant) + uid;
      return firebase.database().ref(urlNodeConcacts).once('value');
    }

    getListMembers(members): UserModel[]{ 
      let arrayMembers = [];
      members.forEach(member => {
        console.log("loadUserDetail: ", member);
        let userDetail = new UserModel(member, '', '', member, '', URL_NO_IMAGE);
        if (member.trim() !== '' && member.trim() !== SYSTEM) {
          this.getUserDetail(member)
          .then(function(snapshot) { 
            if (snapshot.val()){
              const user = snapshot.val();
              const fullname = user.firstname+" "+user.lastname;  
              let imageUrl =  URL_NO_IMAGE;
              if(user.imageurl && user.imageurl !== LABEL_NOICON){
                imageUrl = user.imageurl;
              }
              userDetail = new UserModel(
                snapshot.key, 
                user.email, 
                user.firstname, 
                user.lastname, 
                fullname.trim(), 
                imageUrl
              );  
              console.log("userDetail: ", userDetail)
            }
            console.log("---------------> : ", member);
            arrayMembers.push(userDetail);
          })
          .catch(function(err) {
            console.log('Unable to get permission to notify.', err);
          });
        }
      });
      return arrayMembers;
    }


    

    // loadGroupDetail(uidUser, uidGroup){
    //   console.log("loadGroudDetail: ", uidGroup);
    //   const userFirebase = this.initGroupDetails(uidUser, uidGroup);
    //   let that = this;
    //   userFirebase.on("value", function(snapshot) {
    //       let groupDetail = new GroupModel(snapshot.key, 0, '', [], '', '');        
    //       if (snapshot.val()){
    //         const group = snapshot.val();
    //         groupDetail = new GroupModel(
    //           snapshot.key, 
    //           group.createdOn, 
    //           group.iconURL,
    //           group.members, 
    //           group.name, 
    //           group.owner
    //         );    
    //       }
    //       console.log("loadGroupDetail: ", groupDetail);
    //       that.events.publish('loadGroupDetail:complete', groupDetail);
    //     });
    // }

  /**
   * CONTROLLO SE L'UTENTE E' AUTENTICATO
   * rimango in ascolto sul login logout
   * LOGOUT:
   * 1 - cancello utente dal nodo presenze
   * 2 - rimuovo il token
   * 3 - passo lo stato offline al chatmanager
   * LOGIN:
   * 1 - imposto stato di connessione utente
   * 2 - aggiorno il token
   * 3 - carico il dettaglio utente (o ne creo uno nuovo)
   * 4 - passo lo stato online al chatmanager
   */
  onAuthStateChanged(){
    console.log("UserService::onAuthStateChanged");

    firebase.auth().onAuthStateChanged(user => {
      console.log("UserService::onAuthStateChanged::user:", user);

      if (!user) {
        console.log(" 3 - PASSO OFFLINE AL CHAT MANAGER");
        this.chatManager.goOffLine();
      }
      else{
        console.log(" 1 - IMPOSTO STATO CONNESSO UTENTE ");
        this.chatPresenceHandler.setupMyPresence(user.uid);
        console.log(" 2 - AGGIORNO IL TOKEN ::: ", user);
        this.msgService.getToken(user);
        this.getToken();
        console.log(" 3 - CARICO IL DETTAGLIO UTENTE ::: ");
        let that = this;
        const userFirebase = this.initUserDetails(user.uid);
        userFirebase.on('value', function(snapshot) {
          if (snapshot.val()){
            const user = snapshot.val();
            const fullname = user.firstname+" "+user.lastname;
            that.currentUserDetails = new UserModel(user.uid, user.email, user.firstname, user.lastname, fullname, user.imageurl);
          }
          else {
            that.currentUserDetails = new UserModel(user.uid, user.email, '', '', user.uid, '');
            that.saveCurrentUserDetail(user.uid, user.email, '', '');
          }
          console.log(" 4 - PASSO ONLINE AL CHAT MANAGER");
          that.chatManager.goOnLine(that.currentUserDetails);
        });
      }
    });
  }


  getToken(){
    const that = this;
    console.log('Notification permission granted.');
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
    .then(function(idToken) {
        that.token = idToken;
        console.log('idToken.', idToken);
    }).catch(function(error) {
      // Handle error
      console.log('idToken.', error);
    });
  }

  returnToken():string{
    return this.token;
  }

  /**
   * IMPOSTO FIREBASE REFERENCE
   * imposto la reference al nodo di firebase dettaglio utente uid
   * @param uid 
   */
  initUserDetails(uid) {
    const urlNodeFirebase = this.urlNodeContacts+uid;
    return firebase.database().ref(urlNodeFirebase);
  } 

  initGroupDetails(uidUser, uidGroup) {
    const tenant = this.chatManager.getTenant();
    const urlNodeContacts = '/apps/'+tenant+'/users/'+uidUser+'/groups/'+uidGroup;
    return firebase.database().ref(urlNodeContacts);
  } 

  getUidLastOpenConversation(): string {
    return this.uidLastOpenConversation;
  }

  /**
   * LOGUOT FIREBASE
   * al logout vado in automatico su onAuthStateChanged
   */
  logoutUser() {
    console.log("UserService::logoutUser");

    console.log(" 1 - CANCELLO L'UTENTE DAL NODO PRESENZE");
    this.chatPresenceHandler.goOffline();
    console.log(" 2 - RIMUOVO IL TOKEN");
    this.msgService.removeToken();
    return firebase.auth().signOut();
  }

}
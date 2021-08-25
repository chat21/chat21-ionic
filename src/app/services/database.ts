//https://devdactic.com/ionic-sqlite-queries-database/
//http://ionicframework.com/docs/native/sqlite/
//https://stackoverflow.com/questions/42840951/uncaught-in-promise-cordova-not-available-in-ionic-2
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
// import 'rxjs/add/operator/map';
import { Config } from '@ionic/angular';
// models
import { UserModel } from 'src/chat21-core/models/user';
// firebase
// import * as firebase from 'firebase/app';
import firebase from "firebase/app";
import 'firebase/messaging';
import 'firebase/database';
//utils
import { getNowTimestamp, compareValues } from '../../chat21-core/utils/utils';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

/**
 * GESTIONE SALVATAGGIO IMMAGINI IN FIREBASE
 */
@Injectable({ providedIn: 'root' })

export class DatabaseProvider {

  public tenant: string;
  public storageSettings: Storage;
  public storageContacts: Storage;
  public storageConversations: Storage;
  public loggedUser: UserModel;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public config: Config
  ) {
  }

  initialize(userId: string, tenant: string) {
    this.logger.log("[DATABASE-PROVIDER] initialize userId:", userId, ' - tenant: ' ,tenant);
    this.tenant = tenant;
    // this.logger.log("DatabaseProvider - loggedUser::", loggedUser.uid);
    // this.logger.log("DatabaseProvider - this.storageSettings::", this.storageSettings);
    // this.logger.log("DatabaseProvider - this.storageContacts::", this.storageContacts);
    // this.logger.log("DatabaseProvider - this.storageConversations::", this.storageConversations);
    if (!this.storageSettings || !this.storageContacts || !this.storageConversations) {
      this.storageSettings = this.configStorage('settings-' + userId);
      this.storageContacts = this.configStorage('contacts-' + userId);
      this.storageConversations = this.configStorage('conversations-' + userId);
    }
  }
  /**
   * inizializzo databaseprovider 
   * creo un nuovo storage
   * chiamato nell'init di chat-manager
   * @param tenant 
   */
  configStorage(storeName: string) {
    this.logger.log("[DATABASE-PROVIDER] configStorage storeName:", storeName);
    let driverOrder = ['indexeddb', 'localstorage', 'sqlite', 'websql'];
    if (storeName.startsWith('settings')) {
      driverOrder = ['localstorage', 'indexeddb', 'sqlite', 'websql'];
    }
    let configStorage = {
      name: this.tenant,
      storeName: storeName,
      driverOrder: driverOrder
    };
    return new Storage(configStorage);
  }
  /**
   * ritorno data ultimo aggiornamento salvata nel DB locale
   */
  getTimestamp() {
    // settings
    // const storageSettings = this.configStorage('settings');
    return this.storageSettings.get('lastUpdate')
      .then(function (lastUpdate) {
        return lastUpdate;
      });
  }
  /**
   * salvo data ultimo aggiornamento nel DB locale
   */
  setTimestamp() {
    // settings
    let lastUpdate = getNowTimestamp();
    // this.logger.log("SALVO NEL DB DATA UPDATE:", lastUpdate);
    //const storageSettings = this.configStorage('settings');
    this.storageSettings.set('lastUpdate', lastUpdate);
  }

  /**
   * ritorno uid ultima conversazione aperta salvata nel DB locale
   */
  // getUidLastOpenConversation() {
  //   // settings
  //   this.logger.log("getUidLastOpenConversation");
  //   return this.storageSettings.get('uidLastOpenConversation');
  // }
  // /**
  //  * salvo uid ultima conversazione aperta nel DB
  //  */
  // setUidLastOpenConversation(uid: string ) {
  //   // settings
  //   // this.logger.log("SALVO NEL DB UID ULTIMA CHAT APERTA:", uid);
  //   // const storageSettings = this.configStorage('settings');
  //   // return storageSettings.set('uidLastOpenConversation',uid)
  //   this.storageSettings.set('uidLastOpenConversation', uid)
  //   .then(() => {
  //     this.logger.log('SALVATO:', uid);
  //   })
  //   .catch((error) => {
  //     this.logger.log('ERRORE SALVATAGGIO:', error);
  //   });
  // }


  /**
   * ritorno contatti salvati nel DB locale
   * da verificare!!!
   * @param limit
   */
  getContactsLimit(limit?) {
    const that = this;
    let idCurrentUser = firebase.auth().currentUser.uid;
    let contacts = [];
    //const storageSettings = this.configStorage('contacts');
    return this.storageContacts.forEach((data, key, index) => {
      limit > 0 ? limit : null;
      this.logger.log("[DATABASE-PROVIDER] getContactsLimit INDEX::", index, limit);
      if (index < limit || !limit) {
        this.logger.log("[DATABASE-PROVIDER] getContactsLimit This is the value ------> ", data);
        if (data.uid != idCurrentUser) {
          contacts.push({ uid: data.uid, firstname: data.firstname, lastname: data.lastname, fullname: data.fullname, imageurl: data.imageurl });
        }
      } else {
        // NON FUNZIONA!!! 
        this.logger.log("[DATABASE-PROVIDER] getContactsLimit LIMIT ---> ", limit);
        //contacts.sort(compareValues('name', 'asc'));
        return Promise.resolve(contacts);
      }
    })
      .then(function () {
        that.logger.log("[DATABASE-PROVIDER] getContactsLimit contacts:", contacts);
        //contacts.sort(compareValues('name', 'asc'));
        return contacts;
      });
  }
  /**
   * aggiungo un nuovo contatto o sovrascrivo uno già esistente al DB locale
   * @param uid 
   * @param email 
   * @param firstname 
   * @param lastname 
   * @param fullname 
   * @param imageurl 
   */
  addContact(uid, email, firstname, lastname, fullname, imageurl) {
    //INSERT OR REPLACE
    let value = {
      "imageurl": (imageurl && imageurl != 'undefined') ? imageurl : '',
      "email": (email && email != 'undefined') ? email : '',
      "firstname": (firstname && firstname != 'undefined') ? firstname : '',
      "lastname": (lastname && lastname != 'undefined') ? lastname : '',
      "fullname": (fullname && fullname != 'undefined') ? fullname : '',
      "uid": uid
    }
    //const storageSettings = this.configStorage('contacts');
    this.storageContacts.set(uid, value);
  }
  /**
   * rimuovo un contatto dal DB locale
   * @param uid 
   */
  removeContact(uid) {
    //this.storage.ready().then(() => {
    //const storageSettings = this.configStorage('contacts');
    this.storageContacts.remove(uid);
    // })
    // .catch((error) => {
    //   this.logger.log("error::", error);
    //   //return contacts;
    // });
  }


  /**
   *
   */
  getConversations() {
    this.logger.log('getConversations ::');
    const conversations = [];
    return this.storageConversations.forEach((data, key, index) => {
      conversations.push(data);
    })
      .then(() => {
        conversations.sort(compareValues('timestamp', 'desc'));
        return conversations;
      });

  }

  /** */
  setConversation(conversation: any) {
    this.logger.log("[DATABASE-PROVIDER] setConversation conversation", conversation);
    //const storageSettings = this.configStorage('conversations');
    return this.storageConversations.set(conversation.uid, conversation)
  }
  /** */
  removeConversation(uid: string) {
    this.logger.log("[DATABASE-PROVIDER] removeConversation uid", uid);
    // const storageSettings = this.configStorage('conversations');
    this.storageConversations.remove(uid);
  }
}
//https://devdactic.com/ionic-sqlite-queries-database/
//http://ionicframework.com/docs/native/sqlite/
//https://stackoverflow.com/questions/42840951/uncaught-in-promise-cordova-not-available-in-ionic-2
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { Config } from 'ionic-angular';

// models
import { UserModel } from '../../models/user';
// firebase
import * as firebase from 'firebase/app';
//utils
import { getNowTimestamp, compareValues } from '../../utils/utils';

/**
 * GESTIONE SALVATAGGIO IMMAGINI IN FIREBASE
 */
@Injectable()
export class DatabaseProvider {
  public tenant: string;
  public storageSettings: Storage;
  public storageContacts: Storage;
  public storageConversations: Storage;
  public loggedUser: UserModel;

  constructor(
    public config: Config
  ) {
  }

  initialize(loggedUser:UserModel, tenant: string){
    this.loggedUser = loggedUser;
    this.tenant = tenant;
    console.log("DatabaseProvider - loggedUser::", loggedUser.uid);
    console.log("DatabaseProvider - this.storageSettings::", this.storageSettings);
    console.log("DatabaseProvider - this.storageContacts::", this.storageContacts);
    console.log("DatabaseProvider - this.storageConversations::", this.storageConversations);
    if(!this.storageSettings || !this.storageContacts || !this.storageConversations){
      this.storageSettings = this.configStorage('settings-'+loggedUser.uid);
      this.storageContacts = this.configStorage('contacts-'+loggedUser.uid);
      this.storageConversations = this.configStorage('conversations-'+loggedUser.uid);
    }
  }
  /**
   * inizializzo databaseprovider 
   * creo un nuovo storage
   * chiamato nell'init di chat-manager
   * @param tenant 
   */
  configStorage(storeName: string){
    let driverOrder = ['indexeddb','localstorage','sqlite','websql'];
    if(storeName.startsWith('settings')){
      driverOrder = ['localstorage','indexeddb','sqlite','websql'];
    }
    let configStorage = {
      name: this.tenant,
      storeName: storeName,
      driverOrder: driverOrder
    };
    return  new Storage(configStorage);
  }
  /**
   * ritorno data ultimo aggiornamento salvata nel DB locale
   */
  getTimestamp(){
    // settings
    // const storageSettings = this.configStorage('settings');
    return this.storageSettings.get('lastUpdate')
    .then(function(lastUpdate) { 
      return lastUpdate;
    });
  }
  /**
   * salvo data ultimo aggiornamento nel DB locale
   */
  setTimestamp(){
    // settings
    let lastUpdate = getNowTimestamp();
    // console.log("SALVO NEL DB DATA UPDATE:", lastUpdate);
    //const storageSettings = this.configStorage('settings');
    this.storageSettings.set('lastUpdate',lastUpdate);
  }
  /**
   * ritorno uid ultima conversazione aperta salvata nel DB locale
   */
  getUidLastOpenConversation() {
    // settings
    console.log("getUidLastOpenConversation");
    return this.storageSettings.get('uidLastOpenConversation');
  }
  /**
   * salvo uid ultima conversazione aperta nel DB
   * @param uid 
   */
  setUidLastOpenConversation(uid){
    // settings
    // console.log("SALVO NEL DB UID ULTIMA CHAT APERTA:", uid);
    //const storageSettings = this.configStorage('settings');
    //return storageSettings.set('uidLastOpenConversation',uid)
    this.storageSettings.set('uidLastOpenConversation',uid)
    .then(()=>{
      console.log("SALVATO:", uid);
    })
    .catch(function(error){
      console.log("ERRORE SALVATAGGIO:", error);
    })
  }
  /**
   * ritorno contatti salvati nel DB locale
   * da verificare!!!
   * @param limit 
   */
  getContactsLimit(limit?) {
    let idCurrentUser = firebase.auth().currentUser.uid;
    let contacts = [];
    //const storageSettings = this.configStorage('contacts');
    return this.storageContacts.forEach( (data, key, index) => {
      limit>0?limit:null;
      console.log("INDEX::", index, limit);
      if (index<limit || !limit){
        console.log("This is the value ------> ", data);
        if(data.uid != idCurrentUser){
          contacts.push({ uid: data.uid, firstname: data.firstname, lastname: data.lastname, fullname: data.fullname, imageurl: data.imageurl });
        }
      } else {
        // NON FUNZIONA!!! 
        console.log("LIMIT ---> ", limit);
        //contacts.sort(compareValues('name', 'asc'));
        return Promise.resolve(contacts);
      }
    })
    .then(function() { 
      console.log("contacts:", contacts); 
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
          "imageurl" : (imageurl && imageurl!='undefined')?imageurl:'',
          "email" : (email && email!='undefined')?email:'',
          "firstname" : (firstname && firstname!='undefined')?firstname:'',
          "lastname" : (lastname && lastname!='undefined')?lastname:'',
          "fullname" : (fullname && fullname!='undefined')?fullname:'',
          "uid" : uid
      }
      //const storageSettings = this.configStorage('contacts');
      this.storageContacts.set(uid, value);
  }
  /**
   * rimuovo un contatto dal DB locale
   * @param uid 
   */
  removeContact(uid){
    //this.storage.ready().then(() => {
      //const storageSettings = this.configStorage('contacts');
      this.storageContacts.remove(uid);
    // })
    // .catch((error) => {
    //   console.log("error::", error);
    //   //return contacts;
    // });
  }


  /**
   * 
   */
  getConversations() {
    console.log("getConversations ::");
    let conversations = [];
    //const storageSettings = this.configStorage('conversations');
    return this.storageConversations.forEach( (data, key, index) => {
      conversations.push(data);
    })
    .then(function() { 
      conversations.sort(compareValues('timestamp', 'desc'));
      return conversations;
    });

  }
  /** */
  setConversation(conversation:any) {
    console.log("setConversation",  conversation);
    //const storageSettings = this.configStorage('conversations');
    return this.storageConversations.set(conversation.uid, conversation)
  }
  /** */
  removeConversation(uid: string){
    console.log("removeConversation");
    // const storageSettings = this.configStorage('conversations');
    this.storageConversations.remove(uid);
  }
}
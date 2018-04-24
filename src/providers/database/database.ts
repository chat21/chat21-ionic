//https://devdactic.com/ionic-sqlite-queries-database/
//http://ionicframework.com/docs/native/sqlite/
//https://stackoverflow.com/questions/42840951/uncaught-in-promise-cordova-not-available-in-ionic-2
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
// firebase
import * as firebase from 'firebase/app';
//utils
import { getNowTimestamp } from '../../utils/utils';

/**
 * GESTIONE SALVATAGGIO IMMAGINI IN FIREBASE
 */
@Injectable()
export class DatabaseProvider {
  private storageSettings: Storage;

  constructor(
    private storage: Storage
  ) {}

  /**
   * inizializzo databaseprovider 
   * creo un nuovo storage
   * chiamato nell'init di chat-manager
   * @param tenant 
   */
  initialize(tenant){
    let configStorage = {
      name: tenant,
      storeName: 'settings',
      driverOrder: ['indexeddb','sqlite', 'websql', 'indexeddb', 'localstorage']
    };
    this.storageSettings = new Storage(configStorage);
  }
  /**
   * ritorno data ultimo aggiornamento salvata nel DB locale
   */
  getTimestamp(){
    return this.storageSettings.get('lastUpdate')
    .then(function(lastUpdate) { 
      return lastUpdate;
    });
  }
  /**
   * salvo data ultimo aggiornamento nel DB locale
   */
  setTimestamp(){
    let lastUpdate = getNowTimestamp();
    //console.log("SALVO NEL DB DATA UPDATE:", lastUpdate);
    this.storageSettings.set('lastUpdate',lastUpdate);
  }
  /**
   * ritorno uid ultima conversazione aperta salvata nel DB locale
   */
  getUidLastOpenConversation() {
    //console.log("getUidLastOpenConversation");
    return this.storageSettings.get('uidLastOpenConversation')
  }
  /**
   * salvo uid ultima conversazione aperta nel DB
   * @param uid 
   */
  setUidLastOpenConversation(uid){
    //console.log("SALVO NEL DB UID ULTIMA CHAT APERTA:", uid);
    this.storageSettings.set('uidLastOpenConversation',uid);
  }
  /**
   * ritorno contatti salvati nel DB locale
   * da verificare!!!
   * @param limit 
   */
  getContactsLimit(limit?) {
    let idCurrentUser = firebase.auth().currentUser.uid;
    let contacts = [];
    return this.storage.forEach( (data, key, index) => {
      limit>0?limit:null;
      //console.log("INDEX::", index, limit);
      if (index<limit || !limit){
        console.log("This is the value ------> ", data);
        if(data.uid != idCurrentUser){
          contacts.push({ uid: data.uid, firstname: data.firstname, lastname: data.lastname, fullname: data.fullname, imageurl: data.imageurl });
        }
      } else {
        // NON FUNZIONA!!! 
        //contacts.sort(compareValues('name', 'asc'));
        return Promise.resolve(contacts);
      }
    })
    .then(function() { 
      //console.log("contacts:", contacts); 
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
    //let data = [uid, email, firstname, lastname, fullname, imageurl];
    //this.storage.ready().then(() => {
      //INSERT OR REPLACE
      let value = {
        "imageurl" : (imageurl && imageurl!='undefined')?imageurl:'',
        "email" : (email && email!='undefined')?email:'',
        "firstname" : (firstname && firstname!='undefined')?firstname:'',
        "lastname" : (lastname && lastname!='undefined')?lastname:'',
        "fullname" : (fullname && fullname!='undefined')?fullname:'',
        "uid" : uid
      }
      //this.storage.set(`contacts:${ uid }`,value);
      this.storage.set(uid,value);
    // })
    // .catch((error) => {
    //   console.log("error::", error);
    //   //return contacts;
    // });
  }
  /**
   * rimuovo un contatto dal DB locale
   * @param uid 
   */
  removeContact(uid){
    //this.storage.ready().then(() => {
      this.storage.remove(uid);
    // })
    // .catch((error) => {
    //   console.log("error::", error);
    //   //return contacts;
    // });
  }
}
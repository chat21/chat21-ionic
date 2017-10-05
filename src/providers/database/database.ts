//https://devdactic.com/ionic-sqlite-queries-database/
//http://ionicframework.com/docs/native/sqlite/
//https://stackoverflow.com/questions/42840951/uncaught-in-promise-cordova-not-available-in-ionic-2

import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
import { compareValues, getNowTimestamp } from '../../utils/utils';
import { Config } from 'ionic-angular';
import * as firebase from 'firebase/app';
//import { UserModel } from '../../models/user';

 
@Injectable()
export class DatabaseProvider {
  private storageSettings: Storage;

  constructor(
    private config: Config,
    private storage: Storage, 
    private platform: Platform
  ) {
    let appConfig = config.get("appConfig");
    let tenant = appConfig.tenant;
    let configStorage = {
      name: tenant,
      storeName: 'settings',
      driverOrder: ['indexeddb','sqlite', 'websql', 'indexeddb', 'localstorage']
    };
    this.storageSettings = new Storage(configStorage);
  }
  

  getTimestamp(){
    return this.storageSettings.get('lastUpdate')
    .then(function(lastUpdate) { 
      return lastUpdate;
    });
  }

  setTimestamp(){
    let lastUpdate = getNowTimestamp();
    console.log("SALVO NEL DB DATA UPDATE:", lastUpdate);
    this.storageSettings.set('lastUpdate',lastUpdate);
  }

  getKeys(){
    return this.storage.keys()
    .then(function(data) { 
      //console.log("keys:", data); 
      //contacts.sort(compareValues('name', 'asc'));
      return data;
    });
  }
  getContactsLimit(limit?) {
    let idCurrentUser = firebase.auth().currentUser.uid;
    let contacts = [];
    return this.storage.forEach( (data, key, index) => {
      limit>0?limit:null;
      //console.log("INDEX::", index, limit);
      if (index<limit || !limit){
        //console.log("This is the value", data);
        if(data.uid != idCurrentUser){
          contacts.push({ uid: data.uid, name: data.name, surname: data.surname, fullname: data.fullname, imageurl: data.imageurl });
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

  addContact(uid, name, surname, fullname, imageurl) {
    let data = [uid, uid, name, surname, fullname, imageurl];
    //this.storage.ready().then(() => {
      //INSERT OR REPLACE
      let value = {
        "imageurl" : imageurl,
        "name" : name,
        "surname" : surname,
        "fullname" : fullname,
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
import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// providers
import { DatabaseProvider } from './database/database';
// models
import { UserModel } from '../models/user';
// firebase
import * as firebase from 'firebase/app';
// utils
import { contactsRef, compareValues } from '../utils/utils';
import { environment } from '../environments/environment';

@Injectable()
export class ChatContactsSynchronizer {
    private tenant: string;
    private loggeduser: UserModel;
    private ref: firebase.database.Query;
    private remoteContactsUrl = environment.remoteContactsUrl;
    private SERVER_BASE_URL = environment.SERVER_BASE_URL;

    constructor(
        private config: Config,
        private databaseProvider: DatabaseProvider,
        public http: HttpClient
    ) { 
    }
    /**
     * inizializzo contacts synchronizer
     * @param tenant 
     * @param user 
     */
    initWithTenant(tenant, user) {
        this.tenant = tenant;
        this.loggeduser = user;
        this.databaseProvider.initialize(this.loggeduser, this.tenant);
        return this;
    }
    /**
     * recupero dal db locale la data dell'ultimo aggiornamento
     * sincronizzo i contatti dal nodo firebase 'contacts'
     */
    startSynchro(){
        let that = this;
        console.log("startSynchro: ");
        this.databaseProvider.getTimestamp()
        .then(function(lastUpdate) { 
            console.log("lastUpdate: ", lastUpdate);
            that.loadFirebaseContactsData(lastUpdate);
            // let urlContacts = that.remoteContactsUrl;
            // console.log('urlContacts', urlContacts);
            // if(!that.remoteContactsUrl){
            //     that.loadFirebaseContactsData(lastUpdate);
            // } else if(that.remoteContactsUrl.startsWith('http')){
            //     that.loadContacts(urlContacts);
            // } else if(that.remoteContactsUrl != ''){
            //     urlContacts = that.SERVER_BASE_URL + that.remoteContactsUrl
            //     that.loadContacts(urlContacts);
            // }
        });
    }
    /**
     * creo una reference al nodo contacts
     * filtro per data successiva a ultimo aggiornamento
     * mi sottoscrivo a change, removed, added
     * ref: https://firebase.google.com/docs/reference/js/firebase.database.Query
     * https://stackoverflow.com/questions/41721134/firebase-angularfire2-listening-on-queried-list-child-added
     * https://firebase.google.com/docs/database/web/lists-of-data
     */
    loadFirebaseContactsData(lastUpdate){
        let that = this;
        console.log("lastUpdate:"+lastUpdate, that.tenant);
        const urlNodeConcacts = contactsRef(that.tenant);
        this.ref = firebase.database().ref(urlNodeConcacts);
        this.ref.orderByChild("timestamp").startAt(lastUpdate)
        this.ref.on("child_changed", function(childSnapshot) {
            var childData = childSnapshot.val();
            that.addContact(childData);
        });
        this.ref.on("child_removed", function(childSnapshot) {
            var childData = childSnapshot.val();
            that.removeContact(childData);
        });
        this.ref.on("child_added", function(childSnapshot) {
            var childData = childSnapshot.val();
            that.addContact(childData);
        })
    }

    loadContacts(url){
        let that = this;
        // console.log('LOAD CONTACTS URL', url);
        const token = this.getTokenFromLocalStorage();
        // console.log('Token', token);
        return this.http.get(url, {
            headers: new HttpHeaders().set('Authorization', token),
        })
        // .toPromise()
        // .then(data => {
        //   console.log('----------------------------------> loadContactsResponse:');
        //   console.log(data);
        //   //that.tagsCanned = data;
        //   that.setContacts(data);
        // }).catch(err => {
        //   console.log('error', err);
        // });
    }

    /** GET JWT TOKEN FROM LOCAL STORAGE */
    getTokenFromLocalStorage() {
        var token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWIwZjNmYTU3MDY2ZTAwMTRiZmQ3MWUiLCJlbWFpbCI6ImRhcmlvZGVwYTc1QGdtYWlsLmNvbSIsImZpcnN0bmFtZSI6IkRhcmlvIiwibGFzdG5hbWUiOiJEZSBQYXNjYWxpcyIsImlhdCI6MTU4MzM5OTM0NCwiYXVkIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJpc3MiOiJodHRwczovL3RpbGVkZXNrLmNvbSIsInN1YiI6InVzZXIiLCJqdGkiOiJkNmNmODAzZC1iOGUyLTQ3OGYtYTZkMy1mNDgwNzRhOGEyNGQifQ.7yfH6CNPJFv72Q2IS56T_7FSzyUGorTQHFlkR_-dEKg";
        var user = JSON.parse(localStorage.getItem('user'));
        if(user){
          console.log('user: ', user);
          if(user.token){
              token = user.token;
              console.log('token: ', user.token);
          } 
        }
        return token;
    }

    /** */
    setContacts(data){
        this.databaseProvider.removeAllContact();
        const that = this;
        var listOfContacts = JSON.parse(JSON.stringify(data));
        listOfContacts.sort(compareValues('firstname', 'asc'));      
        console.log("listOfContacts:: ", listOfContacts);
        for(var i=0; i < listOfContacts.length; i++) {
            that.addContact(listOfContacts[i]);
        }
    }
    

    /**
     * completo profilo user con fullname
     * salvo data ultimo aggiornamento nel DB
     * aggiungo oppure aggiorno (sovrascrivo) un utente al DB
     * @param child 
     */
    addContact(child) {
        // console.log("child_added", child);
        let user:UserModel = child;
        let fullname = '';
        if(user['firstname'] && user['firstname'] != undefined){
            fullname += user['firstname']+' '
        }
        if(user['lastname'] && user['lastname'] != undefined){
            fullname += user['lastname']
        }
        user.fullname = fullname;
        // console.log("fullname:",fullname);
        this.databaseProvider.setTimestamp();
        this.databaseProvider.addContact(user.uid, user.email, user.firstname, user.lastname, user.fullname, user.imageurl);  
    }
    /**
     * salvo data ultimo aggiornamento nel DB
     * elimino utente dal DB
     * @param child 
     */
    removeContact(child) {
        // console.log("removeContact", child);
        this.databaseProvider.setTimestamp();
        let user = child;
        this.databaseProvider.removeContact(user.uid);
    }
    /**
     * dispose reference di contacts synchronizer
     */
    dispose() {
        this.ref.off();
    }
}
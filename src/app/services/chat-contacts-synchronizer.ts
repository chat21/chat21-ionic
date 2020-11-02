import { Injectable } from '@angular/core';
// import { Config } from 'ionic-angular';
// providers
import { DatabaseProvider } from './database';
// models
import { UserModel } from '../models/user';
// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
// utils
import { contactsRef } from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class ChatContactsSynchronizer {
    private tenant: string;
    private loggeduser: UserModel;
    private ref: firebase.database.Query;

    constructor(
        //private config: Config,
        private databaseProvider: DatabaseProvider
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
        this.databaseProvider.initialize(this.loggeduser.uid, this.tenant);
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
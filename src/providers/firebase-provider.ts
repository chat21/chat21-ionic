import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
//import { Conversation } from '../models/conversation';
import { DatabaseProvider } from './database/database';
import { UserModel } from '../models/user';
// utils
import { getNowTimestamp } from '../utils/utils';
import * as firebase from 'firebase/app';
 
@Injectable()
export class FirebaseProvider {
    private tenant: string;
    private users;

    constructor(
        private config: Config,
        private databaseprovider: DatabaseProvider
    ) { 
        let appConfig = config.get("appConfig");
        this.tenant = appConfig.tenant;
    }
 
    //https://firebase.google.com/docs/reference/js/firebase.database.Query
    loadFirebaseContactsData(lastUpdate): firebase.database.Query {
        console.log("lastUpdate:"+lastUpdate);
        let urlNodeFirebase = '/apps/'+this.tenant+'/contacts/';
        //this.users = this.db.list(urlNodeFirebase);

        this.users = firebase.database().ref(urlNodeFirebase)
        let that = this;
        this.users.on("child_changed", function(childSnapshot) {
            var childData = childSnapshot.val();
            that.addContact(childData);
        });
        this.users.on("child_removed", function(childSnapshot) {
            var childData = childSnapshot.val();
            that.removeContact(childData);
        });
        this.users.orderByChild("timestamp").startAt(lastUpdate)
        .on("child_added", function(childSnapshot) {
            var childData = childSnapshot.val();
            that.addContact(childData);
        })
        return this.users;
        // https://stackoverflow.com/questions/41721134/firebase-angularfire2-listening-on-queried-list-child-added
        // https://firebase.google.com/docs/database/web/lists-of-data
    }
    
    addContact(child) {
        console.log("child_added", child);
        // aggiungo/aggiorno un utente al DB
        // creo un model e lo aggiungo all'array
        let user = child;
        let fullname = user['firstname']+" "+user['lastname'];
        console.log("fullname:",fullname);
        let contact = new UserModel(user.uid, user.email, user.firstname, user.lastname, fullname, user.imageurl);
        // if (user.uid == this.currentUser.uid){
        //   //salvo l'user corrente
        //   this.currentUserDetail = contact;
        //   return;
        // }
        this.databaseprovider.setTimestamp();
        this.databaseprovider.addContact(contact.uid, contact.email, contact.firstname, contact.lastname, contact.fullname, contact.imageurl);  
    }

    removeContact(child) {
        this.databaseprovider.setTimestamp();
        let user = child;
        this.databaseprovider.removeContact(user.uid);
    }

    // getListConversations(conversationPathDb) {
    //     console.log(" this.conversationPathDb::: ", conversationPathDb);
    //     return this.db.list(conversationPathDb);
    // }
    
    //https://github.com/angular/angularfire2/issues/558
    
    // addItem(name) {
    //     this.db.list('/shoppingItems/').push(name);
    // }
    
    // removeItem(id) {
    //     this.db.list('/shoppingItems/').remove(id);
    // }
}
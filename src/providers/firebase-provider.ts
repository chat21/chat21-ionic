import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Config } from 'ionic-angular';
//import { Conversation } from '../models/conversation';
import { DatabaseProvider } from './database/database';
import { UserModel } from '../models/user';
// utils
import { getNowTimestamp } from '../utils/utils';
 
@Injectable()
export class FirebaseProvider {
    private tenant: string;
    private users: FirebaseListObservable<any>;
    //private listConversations: Array<Conversation> = [];

    constructor(
        private config: Config,
        private db: AngularFireDatabase,
        private databaseprovider: DatabaseProvider
    ) { 
        let appConfig = config.get("appConfig");
        this.tenant = appConfig.tenant;
    }
 
    loadFirebaseContactsData(lastUpdate){
        console.log("lastUpdate:"+lastUpdate);
        let urlNodeFirebase = '/apps/'+this.tenant+'/contacts/';
        console.log('loadFirebaseContactsData: ', urlNodeFirebase);
        this.users = this.db.list(urlNodeFirebase, {
        //   query: {
        //     //in ordine alfabetico per campo child
        //     orderByChild: 'name'
        //   }
        });
        
        this.users.$ref
        .on("child_changed", (child) => {
          //richiamo func update item in sqlite
          this.addContact(child);
          console.log("child_changed", child.key, child.val());
        });
        
        if(lastUpdate){
            this.users.$ref
            .orderByChild("timestamp").startAt(lastUpdate).on("child_added", (child) => {
                //richiamo func add/update item in 
                this.addContact(child);
                console.log("child_update", child.val(), lastUpdate);
              });
        }else{
            this.users.$ref
            .orderByChild("name").on("child_added", (child) => {
                //richiamo func add/update item in 
                this.addContact(child);
                console.log("child_added", child.key, child.val());
              //   if (contactsKey.indexOf(child.key) <= -1){
              //     this.addContact(child);
              //     console.log("child_added", child.key, child.val());
              //   }
              });
        }
        
        
        this.users.$ref
        .on("child_removed", (child) => {
          //richiamo func remove item in sqlite
          this.removeContact(child);
          console.log("child_removed", child.key, child.val());
        });
          
        // https://stackoverflow.com/questions/41721134/firebase-angularfire2-listening-on-queried-list-child-added
        // https://firebase.google.com/docs/database/web/lists-of-data
      }
    
      addContact(child) {
        // aggiungo/aggiorno un utente al DB
        //const items = this.conversationProvider.loadListConversations();
        // creo un model e lo aggiungo all'array
        let user = child.val();
        let fullname = user.name+" "+user.surname;
        console.log("fullname:",fullname);
        
        let contact = new UserModel(user.uid, user.name, user.surname, fullname, user.imageurl);
        // if (user.uid == this.currentUser.uid){
        //   //salvo l'user corrente
        //   this.currentUserDetail = contact;
        //   return;
        // }
        //console.log("this.contacts MAP ::: ", contact);
        //this.databaseprovider.addContact(this.contact['uid'], this.contact['name'], this.contact['lastname'], this.contact['fullname'], this.contact['imageurl'])
        this.databaseprovider.setTimestamp();
        this.databaseprovider.addContact(contact.uid, contact.name, contact.lastname, contact.fullname, contact.imageurl);  
      }
    
      removeContact(child) {
        this.databaseprovider.setTimestamp();
        let user = child.val();
        this.databaseprovider.removeContact(user.uid);
      }

    // getListConversations(conversationPathDb) {
    //     this.listConversations = [];
    //     console.log(" this.conversationPathDb::: ", conversationPathDb);
    //     let response =  this.db.list(conversationPathDb, { preserveSnapshot: true})
    //     .subscribe(snapshots => {
    //         snapshots.forEach(snapshot => {
    //             console.log("snapshot key:",snapshot.key, snapshot.val());

    //         });
    //     })
    //     return this.listConversations;
    // }

    // getListConversations(conversationPathDb) {
    //     this.listConversations = [];
    //     console.log(" this.conversationPathDb::: ", conversationPathDb);
    //     let response =  this.db.list(conversationPathDb, { preserveSnapshot: true})
    //         .subscribe(snapshots=>{
    //             snapshots.forEach(snapshot => {
    //                 console.log("XXXXX",snapshot.key, snapshot.val());
    //                 this.listConversations.push(snapshot.val());
    //                 //return this.listConversations;
    //             });
    //         })
    //         console.log(" listConversations::: ", this.listConversations);
    //         return this.listConversations;
    // }

    getListConversations(conversationPathDb) {
        console.log(" this.conversationPathDb::: ", conversationPathDb);
        return this.db.list(conversationPathDb);
    }
    
    //https://github.com/angular/angularfire2/issues/558
    
    addItem(name) {
        this.db.list('/shoppingItems/').push(name);
    }
    
    removeItem(id) {
        this.db.list('/shoppingItems/').remove(id);
    }
}
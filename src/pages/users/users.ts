import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserModel } from '../../models/user';
//import { GithubUsers } from '../../providers/github-users';
//import { UserDetailsPage } from '../user-details/user-details';
import { Config } from 'ionic-angular';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
import { ListaConversazioniPage } from '../lista-conversazioni/lista-conversazioni';

//import firebase from 'firebase';
import * as firebase from 'firebase/app';
import { DatabaseProvider } from './../../providers/database/database';

import { Platform } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { NavProxyService } from '../../providers/nav-proxy';
import { PARENT_PAGE_USERS } from '../../utils/constants';
import { MessageProvider } from '../../providers/message/message';

import { ConversationProvider } from '../../providers/conversation/conversation';

// utils
import { getFromNow, compareValues } from '../../utils/utils';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

@IonicPage()
@Component({
  selector: 'page-users',
  templateUrl: 'users.html',
})
export class UsersPage {
  private tenant: string;
  private users;//: AngularFireList<any>;
  private contacts: any; //Array<UserModel> = [];
  private contactsOfSearch: any; //Array<UserModel>;
  //private db: AngularFireDatabase;

  private searchTerm: string = '';
  private searchControl: FormControl;
  private searching: any = false;
  private currentUser: firebase.User;
  private myUser: UserModel;
  private parentPage: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    //public afAuth: AngularFireAuth,
    //db: AngularFireDatabase,
    config: Config,
    private navProxy: NavProxyService,
    private databaseprovider: DatabaseProvider,
    private platform: Platform,
    private conversationProvider:ConversationProvider,
    public messageProvider: MessageProvider
  ) 
  {
    

    this.searchControl = new FormControl();
    this.currentUser = firebase.auth().currentUser;
    let appConfig = config.get("appConfig");
    this.tenant = appConfig.tenant;
    //this.db = db;   
    
    if (!this.contacts || this.contacts.lenght == 0){
      //console.log('ngOnInit contacts', this.contacts);
      // apro db locale e recupero tutti gli users ordinati per fullname dalla query firebase
      var that = this;
      this.databaseprovider.getContactsLimit()
      .then(function(data) { 
          //console.log("contacts:", data); 
          that.contacts = data;
          that.contacts.sort(compareValues('name', 'asc'));
          that.contactsOfSearch = that.contacts;
        });
    }
    
  }

  goToChat(uidReciver: string) {
    console.log('**************** goToChat uidReciver:: ',uidReciver);
    // recupero current user id
    let uidSender = firebase.auth().currentUser.uid;
    //creo idConversazione
    let conversationId = this.messageProvider.createConversationId(uidSender, uidReciver);
    
    // controllo se esiste il nodo conversazione
    let that = this;
    //let isNewConversation = 
    this.messageProvider.ifConversationExist()
    .then(function(snapshot) {
      console.log("ifConversationExist?: " + snapshot + " --> "+snapshot.hasChild(conversationId));
      if (!snapshot.hasChild(conversationId)) {
        // se esiste imposto array messaggi
        //conversationId = null;
      }
      that.navCtrl.setRoot(ListaConversazioniPage, {conversationId});
      that.navProxy.pushDetail(DettaglioConversazionePage,{ uidReciver:uidReciver, conversationId:conversationId});
    })
    .catch(function (error) {
      console.log("ifConversationExist failed: " + error.message);
    });
  }

  ngOnInit() {
    console.log('ngOnInit Users', this.contacts, this.contactsOfSearch);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Users', this.contacts, this.searchControl);
    //https://www.joshmorony.com/high-performance-list-filtering-in-ionic-2/
    //this.setFilteredItems();
    
    this.searchControl.valueChanges.debounceTime(2).subscribe(search => {
        if (this.contacts){
          console.log("this.contacts lenght:: ", this.contacts.length);
          this.contactsOfSearch = this.filterItems(this.contacts, this.searchTerm);
          this.contactsOfSearch.sort(compareValues('name', 'asc'));
          this.searching = false;
        }
    });
  }

  // Search for users 
   onSearchInput(){
     console.log("onSearchInput::: ",this.searching);
     this.searching = true;
   }

  filterItems(items,searchTerm){
    //console.log("filterItems::: ",searchTerm);
    return items.filter((item) => {
      //console.log("filterItems::: ", item.fullname.toString().toLowerCase());
      return item.fullname.toString().toLowerCase().indexOf(searchTerm.toString().toLowerCase()) > -1;
    });     
  }

}

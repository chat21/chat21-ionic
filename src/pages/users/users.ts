import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { UserModel } from '../../models/user';
//import { GithubUsers } from '../../providers/github-users';
//import { UserDetailsPage } from '../user-details/user-details';
import { Config } from 'ionic-angular';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
//import firebase from 'firebase';
import * as firebase from 'firebase/app';
import { DatabaseProvider } from './../../providers/database/database';

import { Platform } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { NavProxyService } from '../../providers/nav-proxy';
import { PARENT_PAGE_USERS } from '../../utils/constants';

import { ConversationProvider } from '../../providers/conversation/conversation';

// utils
import { getFromNow, compareValues } from '../../utils/utils';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

/**
 * Generated class for the Users page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-users',
  templateUrl: 'users.html',
})
export class UsersPage {
  tenant: string;
  users: FirebaseListObservable<any>;
  contacts: any; //Array<UserModel> = [];
  contactsOfSearch: any; //Array<UserModel>;
  db: AngularFireDatabase;

  searchTerm: string = '';
  searchControl: FormControl;
  searching: any = false;
  currentUser: firebase.User;
  myUser: UserModel;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    db: AngularFireDatabase,
    config: Config,
    private navProxy: NavProxyService,
    private databaseprovider: DatabaseProvider,
    private platform: Platform,
    private conversationProvider:ConversationProvider
  ) 
  {
    this.searchControl = new FormControl();
    this.currentUser = firebase.auth().currentUser;
    let appConfig = config.get("appConfig");
    this.tenant = appConfig.tenant;
    this.db = db;   
    
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
    let parentPage = PARENT_PAGE_USERS;
    this.navCtrl.pop();
    this.navProxy.pushDetail(DettaglioConversazionePage,{ uidReciver:uidReciver, parentPage:parentPage});
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
  
  // function for get index item in array
  // functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
  //   for (var i = 0; i < arraytosearch.length; i++) {
  //     //console.log("functiontofindIndexByKeyValue::: ", arraytosearch[i][key], valuetosearch);
  //     if (arraytosearch[i][key] == valuetosearch) {
  //       return i;
  //     }
  //   }
  //   return null;
  // }
}

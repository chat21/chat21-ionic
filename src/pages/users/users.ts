import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ViewController, Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
// pages
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
//import { ListaConversazioniPage } from '../lista-conversazioni/lista-conversazioni';
// services
import { DatabaseProvider } from './../../providers/database/database';
import { NavProxyService } from '../../providers/nav-proxy';
// utils
import { compareValues } from '../../utils/utils';
import { REMOTE_CONTACTS_URL } from '../../utils/constants';

import { UserModel } from '../../models/user';

import { environment } from '../../environments/environment';
import { ChatContactsSynchronizer } from '../../providers/chat-contacts-synchronizer';
import { AppConfigProvider } from '../../providers/app-config/app-config';

@IonicPage()
@Component({
  selector: 'page-users',
  templateUrl: 'users.html',
})
export class UsersPage {
  // private tenant: string;
  // private conversationWith: string;
  // private users;//: AngularFireList<any>;
  private contacts: any; //Array<UserModel> = [];
  private contactsOfSearch: any; //Array<UserModel>;
  //private db: AngularFireDatabase;

  private searchTerm: string = '';
  private searchControl: FormControl;
  private searching: any = false;
  
  // private currentUser: firebase.User;
  // private myUser: UserModel;
  // private parentPage: string;

  private loggedUser: UserModel;
  private tenant: string;
  private remoteContactsUrl = environment.remoteContactsUrl;
  private SERVER_BASE_URL = environment.SERVER_BASE_URL;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public events: Events,
    public navProxy: NavProxyService,
    public databaseProvider: DatabaseProvider,
    public contactsSynchronizer: ChatContactsSynchronizer,
    public appConfig: AppConfigProvider
  ) 
  {
    this.tenant = navParams.get('tenant');
    this.loggedUser = navParams.get('loggedUser');
    this.remoteContactsUrl = appConfig.getConfig().remoteContactsUrl;
    this.SERVER_BASE_URL = appConfig.getConfig().SERVER_BASE_URL;
  }
  /**
   * 
   */
  ngOnInit() {
    this.initialize();
  }
  /**
   * quando la pagina è visualizzata
   */
  // ionViewDidLoad() {
  //   console.log('ionViewDidLoad Users', this.contacts, this.searchControl);
  //   //https://www.joshmorony.com/high-performance-list-filtering-in-ionic-2/
  //   //this.setFilteredItems();
  // }
  /**
   * inizializzo search control
   * controllo se esiste array contatti
   * recupero dallo storage locale elenco contatti
   * ordino elenco per fullname
   * mi sincronizzo al campo input con un ritardo di 2 sec
   * se cambia il contenuto del campo input, fitro e ordino array 
   */
  initialize(){
    //this.loadContactFromStorage();
    this.loadContactsFromUrl();
  }

  /** */
  loadContactsFromUrl(){
    if(!this.remoteContactsUrl || this.remoteContactsUrl == ''){
      this.remoteContactsUrl = REMOTE_CONTACTS_URL;
    } 
    let urlContacts = this.remoteContactsUrl;
    if(this.remoteContactsUrl.startsWith('http')){
      this.loadContacts(urlContacts);
    } else if(this.remoteContactsUrl != ''){
      urlContacts = this.SERVER_BASE_URL + this.remoteContactsUrl
      this.loadContacts(urlContacts);
    }
    this.searchControl = new FormControl();
    this.searchControl.valueChanges.debounceTime(2).subscribe(search => {
      if (this.contacts){
        console.log("this.contacts lenght:: ", this.contacts.length);
        this.contactsOfSearch = this.filterItems(this.contacts, this.searchTerm);
        this.contactsOfSearch.sort(compareValues('fullname', 'asc'));
        this.searching = false;
      }
    });
  }

  /** */
  loadContacts(urlContacts){
    var that = this;
    console.log('this.contactsSynchronizer', this.contactsSynchronizer);
    this.contactsSynchronizer.loadContacts(urlContacts)
    .toPromise()
      .then(data => {
        console.log('----------------------------------> loadContactsResponse:');
        console.log(data);
        that.setContacts(data);
      }).catch(err => {
        console.log('error', err);
      });
  }

  
  /** */
  setContacts(data){
    this.contacts = [];
    var listOfContacts = JSON.parse(JSON.stringify(data));
    listOfContacts.sort(compareValues('firstname', 'asc'));      
    console.log("listOfContacts:: ", listOfContacts);
    console.log("contacts:", data); 
    for(var i=0; i < listOfContacts.length; i++) {
      let user:UserModel = listOfContacts[i];
      let fullname = '';
      if(user['firstname'] && user['firstname'] != undefined){
          fullname += user['firstname']+' '
      }
      if(user['lastname'] && user['lastname'] != undefined){
          fullname += user['lastname']
      }
      user.fullname = fullname;
      this.contacts.push(user);
    }
    this.contacts.sort(compareValues('fullname', 'asc'));
    this.contactsOfSearch = this.contacts;
}


  /** */
  loadContactFromStorage(){
    var that = this;
    // this.searchControl = new FormControl();
    console.log("UsersPage:: this.contacts", this.contacts);
    if (!this.contacts || this.contacts.lenght == 0){
      // console.log('ngOnInit contacts', this.contacts);
      // apro db locale e recupero tutti gli users ordinati per fullname dalla query firebase
      this.databaseProvider.initialize(this.loggedUser, this.tenant);
      this.databaseProvider.getContactsLimit()
      .then(function(data) { 
        console.log("contacts:", data); 
        that.contacts = data;
        that.contacts.sort(compareValues('fullname', 'asc'));
        that.contactsOfSearch = that.contacts;
        //that.loadContactsFromUrl();
      });
    }
    // this.searchControl.valueChanges.debounceTime(2).subscribe(search => {
    //   if (that.contacts){
    //     console.log("this.contacts lenght:: ", that.contacts.length);
    //     that.contactsOfSearch = that.filterItems(that.contacts, that.searchTerm);
    //     that.contactsOfSearch.sort(compareValues('fullname', 'asc'));
    //     that.searching = false;
    //   }
    // });
  }

  /**
   * metodo invocato dalla pagina html alla selezione dell'utente
   * imposta conversazione attiva nella pagina elenco conversazioni
   * carica elenco messaggi conversazione nella pagina conversazione
   * @param conversationWith 
   */
  goToChat(conversationWith: string, conversationWithFullname: string) {
    console.log('**************** goToChat conversationWith:: ',conversationWith);
    // this.navCtrl.setRoot(ListaConversazioniPage, {
    //   conversationWith:conversationWith
    // });
    //pubblico id conv attiva e chiudo pagina 
    this.events.publish('uidConvSelected:changed', conversationWith, 'new');
    this.viewCtrl.dismiss();
    this.navProxy.pushDetail(DettaglioConversazionePage,{ 
      conversationWith:conversationWith,
      conversationWithFullname:conversationWithFullname 
    });
  }
  /**
   * chiamato dall'html quando ho il focus sul campo input
   */
  onSearchInput(){
    console.log("onSearchInput::: ",this.searching);
    this.searching = true;
  }
  /**
   * filtro array contatti per parola passata 
   * filtro sul campo fullname
   * @param items 
   * @param searchTerm 
   */
  filterItems(items,searchTerm){
    //console.log("filterItems::: ",searchTerm);
    return items.filter((item) => {
      //console.log("filterItems::: ", item.fullname.toString().toLowerCase());
      return item.fullname.toString().toLowerCase().indexOf(searchTerm.toString().toLowerCase()) > -1;
    });     
  }

}

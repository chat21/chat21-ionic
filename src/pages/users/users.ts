import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ViewController, Events, IonicPage, NavController } from 'ionic-angular';
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
//import { PARENT_PAGE_DETAIL_CONVERSATION } from '../../utils/constants';


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

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    //public navParams: NavParams,
    //public afAuth: AngularFireAuth,
    //db: AngularFireDatabase,
    //config: Config,
    public events: Events,
    public navProxy: NavProxyService,
    public databaseprovider: DatabaseProvider
    //private platform: Platform
  ) 
  {}
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
    var that = this;
    this.searchControl = new FormControl();
    if (!this.contacts || this.contacts.lenght == 0){
      //console.log('ngOnInit contacts', this.contacts);
      // apro db locale e recupero tutti gli users ordinati per fullname dalla query firebase
      this.databaseprovider.getContactsLimit()
      .then(function(data) { 
        //console.log("contacts:", data); 
        that.contacts = data;
        that.contacts.sort(compareValues('fullname', 'asc'));
        that.contactsOfSearch = that.contacts;
      });
    }
    this.searchControl.valueChanges.debounceTime(2).subscribe(search => {
      if (that.contacts){
        console.log("this.contacts lenght:: ", that.contacts.length);
        that.contactsOfSearch = that.filterItems(that.contacts, that.searchTerm);
        that.contactsOfSearch.sort(compareValues('fullname', 'asc'));
        that.searching = false;
      }
    });
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
    this.events.publish('uidConvSelected:changed', conversationWith);
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

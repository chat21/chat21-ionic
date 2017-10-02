import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { Config } from 'ionic-angular';

// firebase
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';

// models
import { ConversationModel } from '../../models/conversation';
import { UserModel } from '../../models/user';

// providers
import { NavProxyService } from '../../providers/nav-proxy';
import { AuthService } from '../../providers/auth-service';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';
import { MessagingService } from '../../providers/messaging-service';
import { ConversationProvider } from '../../providers/conversation/conversation';

// pages
import { LoginPage } from '../authentication/login/login';
import { PlaceholderPage } from '../placeholder/placeholder';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
import { UsersPage } from '../users/users';
import { _MasterPage } from '../_MasterPage';
import { PopoverPage } from '../popover/popover';
import { ProfilePage } from '../profile/profile';

// utils
import { getFromNow, compareValues } from '../../utils/utils';
import { BCK_COLOR_CONVERSATION_SELECTED, BCK_COLOR_CONVERSATION_UNSELECTED } from '../../utils/constants';


// 
import { UserService } from '../../providers/user/user';
import { DatabaseProvider } from './../../providers/database/database';
import { FirebaseProvider } from './../../providers/firebase-provider';


/**
 * Generated class for the ListaConversazioniPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-lista-conversazioni',
  templateUrl: 'lista-conversazioni.html',
})
export class ListaConversazioniPage extends _MasterPage {

  private conversations: Array<any> = [];
  private subscription: Subscription;
  //private currentUser: firebase.User;
  private style_message_welcome: boolean;
  private conversationId: string;
  private bck_color_selected: string;
  private bck_color_unselected:string;

  public tenant: string;
  public users: FirebaseListObservable<any>;
  public currentUserDetail: UserModel;
  private contacts: any;

  constructor(
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public navProxy: NavProxyService,
    public authService: AuthService,
    public chatPresenceHandler: ChatPresenceHandler,
    public msgService: MessagingService,
    public conversationProvider: ConversationProvider,
    public userService: UserService,
    public databaseprovider: DatabaseProvider,
    public db: AngularFireDatabase,
    config: Config,
    private firebaseProvider: FirebaseProvider
  ) {
    super();
    // se vengo da dettaglio conversazione recupero conversationId
    this.conversationId = navParams.get('conversationId');

    this.bck_color_selected = BCK_COLOR_CONVERSATION_SELECTED;
    this.bck_color_unselected = BCK_COLOR_CONVERSATION_UNSELECTED;

    let appConfig = config.get("appConfig");
    this.tenant = appConfig.tenant;
    this.db = db;

    // apro il db e recupero timestamp ultimo aggiornamento
    var that = this;
    this.databaseprovider.getTimestamp()
    .then(function(lastUpdate) { 
      console.log("lastUpdate:", lastUpdate);
      that.firebaseProvider.loadFirebaseContactsData(lastUpdate);
    });
    
  }

  ngOnInit() {
    //verifico se esiste un user e rimango in attesa se cambia lo stato
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        console.log(" this.user::: KOoooooooooooooo");
        // apro la pagina login
        let profileModal = this.modalCtrl.create(LoginPage, null, { enableBackdropDismiss: false });
        profileModal.present();
      } else {
        console.log(" this.user::: OK");
        // setto utente corrente recuperando il dettaglio
        this.userService.setCurrentUserDetails(user.uid, user.email);
        // setto utente connesso
        this.setupMyPresence();
        // imposto token
        this.setToken(user);
        // carico conversazioni
        this.loadListConversations();
      }
    });
  }

  ///// start eventi pagina ////
  onPageWillLeave() {
    this.subscription.unsubscribe();
    //this.events.unsubscribe('user:loggedin', this.loginHandler);
  }
  ///// end eventi pagina ////

  ///// start gestione presence ////
  setupMyPresence() {
    this.chatPresenceHandler.setupMyPresence()
  }
  ///// end gestione presence ////

  ///// start gestione token ////
  setToken(user) {
    //salvo il token nel db
    console.log("setToken::: ", user);
    this.msgService.updateToken(user);
  }
  removeToken() {
    //rimuovo il token dal db
    console.log("removeToken::: ");
    this.msgService.removeToken();
  }
  //// end gestione token ////


  //// start gestione conversazioni ////
  loadListConversations() {
    console.log("loadListConversations::", this.conversationProvider);
    const items = this.conversationProvider.loadListConversations();
    this.conversations = [];

    items.subscribe(snapshot => {
      // if(snapshot.length == 0) {
      //   // se non ci sono conversazioni attive carica elenco utenti
      //   this.navCtrl.push(UsersPage);
      //   return;
      // } 
      this.conversations = [];
      snapshot.forEach(item => {
        let selected: boolean;
        // se conversationId è settato significa che sto iniziando una nw conversazione
        // e vengo da dettaglio_conversazione; seleziono la conversazione cliccata se esiste
        (item.$key == this.conversationId)?selected = true:selected = false;

        const conversation = new ConversationModel(
          item.$key,
          item.convers_with,
          item.convers_with_fullname,
          item.image,
          item.is_new,
          item.last_message_text,
          item.sender,
          item.sender_fullname,
          item.status,
          item.timestamp, 
          selected
        );
        this.conversations.push(conversation);
      });
      this.conversations.reverse(); 
      //visualizzo div content_message_welcome
      this.style_message_welcome = true;
      
      // se ci sono conversazioni e non esiste una conversazione selezionata
      // (primo accesso alla pagina), imposto la prima come conversazione attiva
      if(this.conversations.length>0 && !this.conversationId){
        this.conversationId = this.conversations[0].uid;
        let uidReciver = this.conversations[0].convers_with;
        this.goToConversationDetail(this.conversationId, uidReciver);
      }
      console.log("this.content_message_welcome::",this.style_message_welcome);
    });

  }

  // filtro le conversazioni selezionando quella attiva
  filterConversationsForSetSelected(oldId, nwId){
    //console.log("this.conversations",this.conversations);
    this.conversations.filter(function(item){
      if(item.uid == nwId){
        item.selected = true;
      }
      else if(item.uid == oldId){
        item.selected = false;
      }
    });
    this.conversationId = nwId;
  }
  //// end gestione conversazioni ////


  //// start funzioni invocate dalla pg html ////
  // richiamo la pg di ricerca users
  listUsers(event) {
    //this.navCtrl.setRoot(UsersPage);
    this.navCtrl.push(UsersPage, {
      contacts: ""
    });
  }

  // apro la pg di dettaglio conversazione
  goToConversationDetail(convId: string, uidReciver: string) {
    console.log('goToConversationDetail:: ', convId, this.conversationId);
    // evidenzio conversazione selezionata recuperando id conversazione da event
    this.filterConversationsForSetSelected(this.conversationId, convId);
    this.navProxy.pushDetail(DettaglioConversazionePage, {
      uidReciver: uidReciver
    });
  }

  // formatto data ultimo messaggio
  getTimeLastMessage(timestamp: string) {
    let timestampNumber = parseInt(timestamp) / 1000;
    let time = getFromNow(timestampNumber);
    return time;
  }
  //// end funzioni invocate dalla pg html ////

  //// start gestione menu opzioni ////
  // apro menu opzioni //
  presentPopover(event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: event
    });
    popover.onDidDismiss((data: string) => {
      //alert("popover.onDidDismiss: "+data);
      console.log(" ********* data::: ", data);
      if (data == 'logOut') {
        this.logOut();
      }
      else if (data == 'ProfilePage') {
        this.navCtrl.push(ProfilePage)
      }
    });
  }
  //// end gestione menu opzioni ////

  ///// start gestione logout ////
  logOut() {
    // resetto pagina dettaglio conversazioni
    this.navProxy.pushDetail(PlaceholderPage,{});
    let that = this;
    this.authService.logoutUser()
      .then(function () {
        console.log("logout succeess.")
        // resetto le conversazioni
        that.conversations = [];
        // mi cancello dal nodo precence
        that.chatPresenceHandler.goOffline();
        // rimuovo il token
        that.removeToken();
      })
      .catch(function (error) {
        console.log("logout failed: " + error.message)
      });
  }
  ///// end gestione logout ////

}

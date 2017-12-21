import { Component, NgZone } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
// import { Subscription } from 'rxjs/Subscription';
import { Events } from 'ionic-angular';

// firebase
import * as firebase from 'firebase/app';

// models
import { ConversationModel } from '../../models/conversation';

// providers
import { ConversationProvider } from '../../providers/conversation/conversation';
import { MessageProvider } from '../../providers/message/message';
import { DatabaseProvider } from './../../providers/database/database';
import { FirebaseProvider } from './../../providers/firebase-provider';

// pages
import { LoginPage } from '../authentication/login/login';
import { PlaceholderPage } from '../placeholder/placeholder';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
import { UsersPage } from '../users/users';
import { _MasterPage } from '../_MasterPage';
import { PopoverPage } from '../popover/popover';
import { ProfilePage } from '../profile/profile';

// utils
import { getFromNow } from '../../utils/utils';
import { LABEL_TU, LABEL_MSG_PUSH_START_CHAT, LABEL_MSG_START_CHAT } from '../../utils/constants';


// services
import { UserService } from '../../providers/user/user';
import { ApplicationContext } from '../../providers/application-context/application-context';
import { UploadService } from '../../providers/upload-service/upload-service';
import { NavProxyService } from '../../providers/nav-proxy';
import { AuthService } from '../../providers/auth-service';
import { MessagingService } from '../../providers/messaging-service';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';

@IonicPage()
@Component({
  selector: 'page-lista-conversazioni',
  templateUrl: 'lista-conversazioni.html',
})
export class ListaConversazioniPage extends _MasterPage {
  private conversations: Array<ConversationModel> = [];
  // private subscription: Subscription;
  private styleMessageWelcome: boolean;
  private conversationWith: string;
  private currentUser: firebase.User;
  private uidReciverFromUrl: string;

  // in html
  public LABEL_MSG_START_CHAT = LABEL_MSG_START_CHAT;
  public LABEL_MSG_PUSH_START_CHAT = LABEL_MSG_PUSH_START_CHAT;

  constructor(
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public navProxy: NavProxyService,
    public authService: AuthService,
    public chatPresenceHandler: ChatPresenceHandler,
    public msgService: MessagingService,
    public conversationProvider: ConversationProvider,
    public userService: UserService,
    public databaseprovider: DatabaseProvider,
    public firebaseProvider: FirebaseProvider,
    public events: Events,
    public upSvc: UploadService,
    public zone: NgZone,
    public messageProvider: MessageProvider,
    public applicationContext: ApplicationContext
  ) {
    super();
    // se vengo da dettaglio conversazione
    // o da users con conversazione attiva recupero conversationWith
    this.conversationWith = navParams.get('conversationWith');
    this.uidReciverFromUrl = location.search.split('recipient=')[1];
    events.subscribe('setConversationSelected:change', (nwId) => {
      this.filterConversationsForSetSelected(nwId);
    });
  }

  ngOnInit() {
    // apro il db locale 'storageSettings' e recupero timestamp ultimo aggiornamento
    const that = this;
    
    //// START SINCRO UTENTI DB LOCALE ////
    this.databaseprovider.getTimestamp()
    .then(function(lastUpdate) { 
      const refContacts = that.firebaseProvider.loadFirebaseContactsData(lastUpdate);
      // salvo ref contacts nel singlelton
      console.log(" salvo ref contacts nel singlelton");
      that.applicationContext.setRef(refContacts, 'contacts');
    });
    //// END SINCRO UTENTI DB LOCALE ////

    //// START INIZIALIZZAZIONE USER DOPO IL LOGIN ////
    // creo modale login ma nn la visualizzo
    let profileModal = this.modalCtrl.create(LoginPage, null, { enableBackdropDismiss: false });
    
    firebase.auth().onAuthStateChanged(user => {
      //verifico se esiste un user e rimango in attesa se cambia lo stato
      if (!user) {
        console.log(" USER NON ESISTE ");
        this.navProxy.pushDetail(PlaceholderPage,{});
        console.log(" 1 - AGGIUNGO UN PLACEHOLDER ALLA PG DELLE CONVERSAZIONI ");
        this.applicationContext.setOffAllReferences();
        console.log(" 2 - CANCELLO TUTTE LE REFERENCES DI FIREBASE");
        // resetto le conversazioni
        this.conversations = [];
        console.log(" 3 - RESETTO LE CONVERSAZIONI");
        // mi cancello dal nodo precence
        this.chatPresenceHandler.goOffline();
        console.log(" 4 - CANCELLO L'UTENTE DAL NODO PRESENZE");
        // rimuovo il token prima del logout altrimenti non ho più i permessi
        this.msgService.removeToken();
        console.log(" 5 - RIMUOVO IL TOKEN");
        // visualizzo la pagina login
        profileModal.present();
        console.log(" 6 - APRO LA MODALE DI LOGIN");
        this.conversationWith = null;
        console.log(" 7 - RESETTO CONVERSATIONWITH");
      } else {
        // dismetto modale login se è visibile
        console.log(" 1 - DISMETTO MODALE SE ATTIVA");
        profileModal.dismiss({animate: false, duration: 0})
        // resetto elenco conversazioni
        console.log(" 2 - RESETTO ELENCO CONVERSAZIONI");
        this.conversations = [];
        console.log(" 3 - SETTO CURRENT USER ESISTE: ", user.uid);
        this.currentUser = user;
        // setto current user nel singlelton
        console.log(" 3.1 - setto current user nel singlelton:: ");
        this.applicationContext.setCurrentUser(user);
        // setto utente corrente recuperando il dettaglio
        console.log(" 4 - RECUPERO DETTAGLIO UTENTE CORRENTE");
        this.userService.setCurrentUserDetails(user.uid, user.email);

        ///// start gestione presence ////
        // setto utente connesso
        console.log(" 5 - IMPOSTO STATO CONNESSO UTENTE ");
        this.chatPresenceHandler.setupMyPresence(user.uid);
        ///// end gestione presence ////
        
        ///// start set token ////
        // imposto token
        console.log(" 6 - AGGIORNO IL TOKEN ::: ", user);
        this.msgService.getToken(user);
        //// end gestione token ////

        // carico conversazioni
        console.log(" 7 - CARICO LISTA CONVERSAZIONI ::: ", user);
        this.loadListConversations();
      }
    });
  }

  ///// start eventi pagina ////
  onPageWillLeave() {
    //this.subscription.unsubscribe();
  }
  ///// end eventi pagina ////

  updateTimeLastMessage(){
    const that = this;
    const id = setTimeout(function(){ 
      console.log("::: UPDATE TIME LAST MESSAGE :::");
      that.loadListConversations();
      clearTimeout(id);
    }, 60000); // ogni 60 secondi
    
  }
  
  //// START GESTIONE CONVERSAZIONI ////
  loadListConversations() {
   
    let that = this;
    const itemsListConversations = this.conversationProvider.loadListConversations();
    // setto ref conversations nel singlelton
    console.log(" setto ref conversations nel singlelton ", this.applicationContext);
    this.applicationContext.setRef(itemsListConversations, 'conversations');

    itemsListConversations.on("value", function(snapshot) {
      console.log("::: CAMBIATO VALORE IN CONVERSAZIONI ::: ", snapshot);
      //that.conversations = [];
      const conversationsTEMP = [];
      snapshot.forEach(function(data) {
        console.log("::: CONVERSAZIONE :::", data.key, data.val());
        let item = data.val();
        let selected = false;

        // seleziono la conversazione cliccata se esiste
        if(data.key == that.conversationWith){
          selected = true;
        }

        // setto fullname conversatore 
        let conversation_with_fullname = item.sender_fullname;
        if(item.sender == that.currentUser.uid){
          conversation_with_fullname = item.recipient_fullname;
          item.last_message_text = LABEL_TU + item.last_message_text;
        }


        const time_last_message = that.getTimeLastMessage(item.timestamp);
        // creo conversazione
        const conversation = new ConversationModel(
          data.key,
          conversation_with_fullname,
          item.recipient,
          item.recipient_fullname,
          item.is_new,
          item.last_message_text,
          item.sender,
          item.sender_fullname,
          item.status,
          item.timestamp, 
          time_last_message,
          selected
        );

        // aggiungo conversazione creata all'elenco conversazioni
        conversationsTEMP.push(conversation);
         // carico immagine profilo
         //let idImage = (item.sender != that.currentUser.uid)?item.sender:item.convers_with;
         //let urlImage = urlImagesNodeFirebase+idImage+"-imageProfile.jpg";
         //that.displayImage(data.key,item.recipient);
      });

      //ordino array conversazioni ultima in testa
      conversationsTEMP.reverse(); 
      that.conversations = conversationsTEMP;

      //visualizzo div styleMessageWelcome
      that.styleMessageWelcome = true;
      // se nell'url è stato passato un uidReciverFromUrl vado alla conversazione con id utente passato
      // altrimenti se ci sono conversazioni e non esiste una conversazione selezionata
      // (primo accesso alla pagina), imposto la prima come conversazione attiva
      if(that.conversations.length>0 && that.uidReciverFromUrl){
        that.conversationWith = that.uidReciverFromUrl;
        that.uidReciverFromUrl = null;
        that.goToConversationDetail(that.conversationWith); 
      }
      else if(that.conversations.length>0 && !that.conversationWith) {
        that.goToConversationDetail(that.conversations[0].uid);
      }
      
    });

    this.updateTimeLastMessage();
  }
  //// end gestione conversazioni ////


  // apro la pg di dettaglio conversazione
  goToConversationDetail(conversationWith: string) {
    console.log('goToConversationDetail :: Conversazione con: ' + conversationWith);
    // evidenzio conversazione selezionata recuperando id conversazione da event
    this.filterConversationsForSetSelected(conversationWith);
    this.navProxy.pushDetail(DettaglioConversazionePage, {
      conversationWith: conversationWith
    });
  }

  // filtro le conversazioni selezionando quella attiva
  filterConversationsForSetSelected(nwId){
    let oldId = this.conversationWith;
    this.conversations.filter(function(item){
      if(item.uid == nwId){
        item.selected = true;
      }
      else if(item.uid == oldId){
        item.selected = false;
      }
    });
    this.conversationWith = nwId;
  }

  //// funzioni invocate dalla pg html ////
  // formatto data ultimo messaggio
  getTimeLastMessage(timestamp: string) {
    let timestampNumber = parseInt(timestamp) / 1000;
    let time = getFromNow(timestampNumber);
    return time;
  }
  // richiamo la pg di ricerca users
  listUsers(event) {
    //this.navCtrl.setRoot(UsersPage);
    this.navCtrl.push(UsersPage, {
      contacts: ""
    });
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
        if(this.userService.getCurrentUserDetails()){
          this.navCtrl.push(ProfilePage);
        }
      }
    });
  }
  //// end gestione menu opzioni ////

  ///// start gestione logout ////
  logOut() {
    // resetto pagina dettaglio conversazioni
    this.navProxy.pushDetail(PlaceholderPage,{});
    //let that = this;
    this.authService.logoutUser()
      .then(function () {
        // LE SEGUENTI OPERAZIONI SONO STATE SPOSTATE NEL onAuthStateChanged !!!!

        // console.log("LOGOUT RIUSCITO", firebase.auth().currentUser, this.currentUser);
        // that.applicationContext.setOffAllReferences();
        // console.log("CANCELLO TUTTE LE REFERENCES DI FIREBASE");
        // // resetto le conversazioni
        // that.conversations = [];
        // console.log("RESETTO LE CONVERSAZIONI");
        // // mi cancello dal nodo precence
        // that.chatPresenceHandler.goOffline();
        // console.log("CANCELLO L'UTENTE DAL NODO PRESENZE");
        // // rimuovo il token prima del logout altrimenti non ho più i permessi
        // that.msgService.removeToken();
        // console.log("RIMUOVO IL TOKEN");
      })
      .catch(function (error) {
        console.log("LOGOUT FALLITO: " + error.message)
      });
  }
  ///// end gestione logout ////

  displayImage(key,uidContact){
    this.upSvc.display(uidContact)
    .then((url) => {
      this.zone.run(() => {
        // aggiorno url image in that.conversations
        let index = this.conversations.findIndex(i => i.uid === key);
        console.log("URL333::: ",this.conversations, uidContact, index);
        //this.conversations[index].image = url;
      });
    })
    .catch((error)=>{
      console.log("error::: ",error);
    });
  }
}
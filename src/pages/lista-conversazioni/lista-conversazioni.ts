import { Component, NgZone } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Subscription } from 'rxjs/Subscription';
import { Config, Events } from 'ionic-angular';

// firebase
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

import { UploadService } from '../../providers/upload-service/upload-service';
import { MessageProvider } from '../../providers/message/message';

//import { FileChooser, FilePath, File } from 'ionic-native/file-chooser';

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
  private currentUser: firebase.User;
  private style_message_welcome: boolean;
  private conversationId: string;
  private bck_color_selected: string;
  private bck_color_unselected:string;

  public tenant: string;
  //public users: AngularFireList<any>;
  public currentUserDetail: UserModel;
  private contacts: any;
  //private firstAcces: boolean;

  nativepath: any;
  firestore = firebase.storage();
  imgsource: any;
  private uidReciverFromUrl: string;

  constructor(
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    //public afAuth: AngularFireAuth,
    public navProxy: NavProxyService,
    public authService: AuthService,
    public chatPresenceHandler: ChatPresenceHandler,
    public msgService: MessagingService,
    public conversationProvider: ConversationProvider,
    public userService: UserService,
    public databaseprovider: DatabaseProvider,
    //public db: AngularFireDatabase,
    config: Config,
    private firebaseProvider: FirebaseProvider,
    public events: Events,
    public upSvc: UploadService,
    public zone: NgZone,
    public messageProvider: MessageProvider
  ) {
    super();

    // recupero id recipient passato nell'url della pg
    this.uidReciverFromUrl = location.search.split('recipient=')[1];
   
    // se vengo da dettaglio conversazione
    // o da users con conversazione attiva recupero conversationId
    this.conversationId = navParams.get('conversationId');
    events.subscribe('setConversationSelected:change', (nwId) => {
      this.filterConversationsForSetSelected(nwId);
    });
    //this.firstAcces = true;

    this.bck_color_selected = BCK_COLOR_CONVERSATION_SELECTED;
    this.bck_color_unselected = BCK_COLOR_CONVERSATION_UNSELECTED;

    let appConfig = config.get("appConfig");
    this.tenant = appConfig.tenant;


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
        this.currentUser = user;
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
    this.msgService.getToken(user);
  }
  removeToken() {
    //rimuovo il token dal db
    console.log("removeToken::: ");
    this.msgService.removeToken();
  }
  //// end gestione token ////


  //// start gestione conversazioni ////
  loadListConversations() {

    if ( this.uidReciverFromUrl ){ //&&  this.uidReciverFromUrl=="QkTk3zJUGIW7XWmqUv29p6DeHR32"
      console.log("location.search::::::::::::: ", this.uidReciverFromUrl, location.search);
      let uidSender = firebase.auth().currentUser.uid;
      //creo idConversazione
      this.conversationId = this.messageProvider.createConversationId(uidSender,  this.uidReciverFromUrl);
      console.log("this.conversationId::::::::::::: ", this.conversationId);
    }

    console.log("loadListConversations::");
    let that = this;
    const items = this.conversationProvider.loadListConversations();
    items.on("value", function(snapshot) {
      that.conversations = [];
      snapshot.forEach(function(data) {
        let item = data.val();
        console.log(":::item:::", that.conversationId, data.key, item.recipient);
        let selected: boolean;
        // se conversationId è null significa che sto iniziando una nw conversazione
        // se vengo da dettaglio_conversazione; seleziono la conversazione cliccata se esiste
        //(data.key == that.conversationId)?selected = true:selected = false;
        if(data.key == that.conversationId){
          selected = true;
          item.status = 2;
        } else {
          selected = false;
        }
        const conversation = new ConversationModel(
          data.key,
          item.recipient,
          item.convers_with_fullname,
          item.is_new,
          item.last_message_text,
          item.sender,
          item.sender_fullname,
          item.status,
          item.timestamp, 
          selected
        );
        //this.messageProvider.setStatusConversation(conversation);
        that.conversations.push(conversation);
         // carico immagine profilo
         //let idImage = (item.sender != that.currentUser.uid)?item.sender:item.convers_with;
         //let urlImage = urlImagesNodeFirebase+idImage+"-imageProfile.jpg";
         that.displayImage(data.key,item.recipient);
      });
      //ordino array conversazioni ultima in testa
      that.conversations.reverse(); 
      //visualizzo div content_message_welcome
      that.style_message_welcome = true;
      // se ci sono conversazioni e non esiste una conversazione selezionata
      // (primo accesso alla pagina), imposto la prima come conversazione attiva
      if(that.conversations.length>0 && !that.conversationId){//} && this.firstAcces == true){
        that.conversationId = that.conversations[0].uid;
        let uidReciver = that.conversations[0].recipient;
        that.goToConversationDetail(that.conversationId, uidReciver);
        //this.firstAcces = false;
      }
      else if (that.conversationId){
        that.goToConversationDetail(that.conversationId, that.uidReciverFromUrl);
      }
    });
  }

  //filtro le conversazioni selezionando quella attiva
  filterConversationsForSetSelected(nwId){
    let oldId = this.conversationId;
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
    this.filterConversationsForSetSelected(convId);
    this.navProxy.pushDetail(DettaglioConversazionePage, {
      uidReciver: uidReciver,
      conversationId: this.conversationId
    });
  }

  // apro conversazione con utente passato nella url della pg
  goToConversationDetailFromLocationSearch() {

    let uidReciver = location.search.split('recipient=')[1];
    console.log("location.search::::::::::::: ",uidReciver, location.search);
    if ( uidReciver && uidReciver=="QkTk3zJUGIW7XWmqUv29p6DeHR32"){

    }

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

      this.navProxy.pushDetail(DettaglioConversazionePage, {
        uidReciver: uidReciver,
        conversationId: this.conversationId
      });
    })
    .catch(function (error) {
      console.log("ifConversationExist failed: " + error.message);
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
    let that = this;
    this.authService.logoutUser()
      .then(function () {
        console.log("logout succeess.")
        // resetto le conversazioni
        that.conversations = [];
        // mi cancello dal nodo precence
        that.chatPresenceHandler.goOffline();
        // rimuovo il token prima del logout altrimenti non ho più i permessi
        that.removeToken();
    
      })
      .catch(function (error) {
        console.log("logout failed: " + error.message)
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
        this.conversations[index].image = url;
      });
    })
    .catch((error)=>{
      console.log("error::: ",error);
    });
  }
 

  // store() {
  //   FileChooser.open().then((url) => {
  //     (<any>window).FilePath.resolveNativePath(url, (result) => {
  //       this.nativepath = result;
  //       this.uploadimage();
  //     }
  //     )
  //   })
  // }
 
  // uploadimage() {
  //   (<any>window).resolveLocalFileSystemURL(this.nativepath, (res) => {
  //     res.file((resFile) => {
  //       var reader = new FileReader();
  //       reader.readAsArrayBuffer(resFile);
  //       reader.onloadend = (evt: any) => {
  //         var imgBlob = new Blob([evt.target.result], { type: 'image/jpeg' });
  //         var imageStore = this.firestore.ref().child('image');
  //         imageStore.put(imgBlob).then((res) => {
  //           alert('Upload Success');
  //         }).catch((err) => {
  //           alert('Upload Failed' + err);
  //         })
  //       }
  //     })
  //   })
  // }
 
  


}

import { Component } from '@angular/core';
import { Events, PopoverController, IonicPage, NavController, NavParams, ModalController, Modal } from 'ionic-angular';
// models
import { ConversationModel } from '../../models/conversation';
// pages
import { LoginPage } from '../authentication/login/login';
import { PlaceholderPage } from '../placeholder/placeholder';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
import { UsersPage } from '../users/users';
import { _MasterPage } from '../_MasterPage';
import { PopoverPage } from '../popover/popover';
import { ProfilePage } from '../profile/profile';
// utils
import { convertMessage, windowsMatchMedia } from '../../utils/utils';
import { CURR_VER_PROD, CURR_VER_DEV, LABEL_IMAGE, TYPE_POPUP_LIST_CONVERSATIONS } from '../../utils/constants';
// services
import { ChatManager } from '../../providers/chat-manager/chat-manager';
import { NavProxyService } from '../../providers/nav-proxy';
import { UserService } from '../../providers/user/user';
import { ChatConversationsHandler} from '../../providers/chat-conversations-handler';
import { ChatConversationHandler } from '../../providers/chat-conversation-handler';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage()
@Component({
  selector: 'page-lista-conversazioni',
  templateUrl: 'lista-conversazioni.html',
})
export class ListaConversazioniPage extends _MasterPage {
  private conversations: Array<ConversationModel> = [];

  private uidReciverFromUrl: string;
  private conversationsHandler: ChatConversationsHandler;
  private uidConvSelected: string;
  private profileModal: Modal;
  private BUILD_VERSION: string;

  convertMessage = convertMessage;

  constructor(
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public navProxy: NavProxyService,
    public userService: UserService,
    public chatConversationsHandler: ChatConversationsHandler,
    public conversationHandler: ChatConversationHandler,
    public events: Events,
    public chatManager: ChatManager,
    public databaseProvider: DatabaseProvider
  ) {
    super();
    this.BUILD_VERSION = 'v.' + CURR_VER_PROD + ' b.' + CURR_VER_DEV; // 'b.0.5';
    
    /** RECUPERO ID CONVERSAZIONE
    * se vengo da dettaglio conversazione
    * o da users con conversazione attiva recupero conversationWith
    * //this.conversationWith = navParams.get('conversationWith');
    */
    this.uidConvSelected = navParams.get('conversationWith');
    
    /** RECUPERO IL RECIPIENTID 
    * nel caso in cui viene pasato nell'url della pagina
    * per aprire una conversazione
    */
    let TEMP = location.search.split('recipient=')[1];
    if (TEMP) { this.uidReciverFromUrl = TEMP.split('&')[0]; }

  
    /** SUBSCRIBE USER LOGGED
     * sul LOGIN:
     * 1 - dismetto modale login se è visibile
     * 2 - carico elenco conversazioni
     * sul LOGOUT
     * 1 - aggiungo placeholder alla pg delle conversazioni
     * 2 - resetto array conversazioni 
     * 3 - visualizzo la pg di login
     * 4 - resetto conversationWith
    */
    this.profileModal = this.modalCtrl.create(LoginPage, null, { enableBackdropDismiss: false });
    this.initSubscriptions();
  }

  //// SUBSCRIBTIONS ////
  /** */
  initSubscriptions(){
    this.events.subscribe('loggedUser:login', this.subscribeLoggedUserLogin);
    this.events.subscribe('loggedUser:logout', this.subscribeLoggedUserLogout);
    this.events.subscribe('uidConvSelected:changed', this.subscribeUidConvSelectedChanged); 
  }

  /** subscribeUidConvSelectedChanged
   * quando si clicca su una conversazione (si seleziona) 
   * apro elenco conversazione maessaggi 
  */
  subscribeUidConvSelectedChanged:any = uidConvSelected => {
    console.log('************** subscribeUidConvSelectedChanged', uidConvSelected);
    this.checkMessageListIsOpen(uidConvSelected);
  }

  /** subscribeLoggedUserLogin
   * effettuato il login: 
   * 1 - dismetto modale
   * 2 - carico lista conversazioni
   * 3 - se non ci sono conversazioni carico placeholder
  */
  subscribeLoggedUserLogin:any = (user) => {
    console.log('************** subscribeLoggedUserLogin', user);
    this.profileModal.dismiss({animate: false, duration: 0});
    this.loadListConversations();
  }

  /** subscribeLoggedUserLogout
   * effettuato il logout:
   * 1 - mostro placeholder
   * 2 - resetto array conversazioni
   * 3 - mostro modale login
   * 4 - resetto conversationWith
  */
  subscribeLoggedUserLogout:any = (user) => {
    console.log('************** subscribeLoggedUserLogout', user);
    this.conversations = [];
    this.profileModal.present();
    //this.conversationWith = null;
    this.uidConvSelected = null;
  }
  //// END SUBSCRIBTIONS LIST ////



  /**
  * START GESTIONE CONVERSAZIONI
  * se esiste recupero uidReciverFromUrl passato nell'url
  * init ConversationsHandler e carico elenco conversazioni
  * altrimenti recupero id ultima conversazione aperta salvato nello storage
  * init ConversationsHandler e carico elenco conversazioni
  */
  loadListConversations() {
  //debugger;
    if(this.uidReciverFromUrl){
      this.uidConvSelected = this.uidReciverFromUrl;
      this.uidReciverFromUrl = null;
      this.initConversationsHandler();
    } else {
      const that = this;
      this.databaseProvider.getUidLastOpenConversation()
      .then(function(uid) { 
        console.log('getUidLastOpenConversation:: ' + uid + 'that.uidReciverFromUrl:: ' + that.uidReciverFromUrl);
        that.uidConvSelected = uid;
        that.initConversationsHandler();
      })
      .catch((error)=>{
        console.log("error::: ",error);
      });
    }
  }

  /**
   * SE E' DIVERSO DA this.uidConvSelected
   * 1 - cerco conv con id == this.uidConvSelected e imposto select a FALSE
   * 2 - cerco conv con id == nw uidConvSelected se esiste:  
   * 2.1 - imposto status a 0 come letto
   * 2.2 - seleziono conv selected == TRUE
   * 2.3 - imposto nw uidConvSelected come this.uidConvSelected
   * 2.4 - apro conv
   * 3 salvo id conv nello storage
   * @param uidConvSelected  
   */
  openMessageList(uidConvSelected){
    //debugger;
    console.log('-------------> openMessageList ', uidConvSelected);
    this.uidConvSelected = uidConvSelected;
    const that = this;
    setTimeout(function(){
      var conversationSelected = that.conversations.find(item => item.uid === uidConvSelected);
      if(conversationSelected){
        conversationSelected.status = '0';
        conversationSelected.selected = true;
        that.navProxy.pushDetail(DettaglioConversazionePage, {
          conversationWith: uidConvSelected,
          conversationWithFullname: conversationSelected.conversation_with_fullname,
          channel_type: conversationSelected.channel_type
        });
        that.databaseProvider.setUidLastOpenConversation(uidConvSelected);
      }
      //that.conversationWith = uidConvSelected;
    }, 1000);
  }
  
  /**
   * 
   * @param uidConvSelected 
   */
  checkMessageListIsOpen(uidConvSelected){
    console.log('-------------> checkMessageListIsOpen ', uidConvSelected);
    if(uidConvSelected === this.uidConvSelected && windowsMatchMedia()){
      return;
    } else {
      this.openMessageList(uidConvSelected)
    }
  }

  

  /**
   * se non esiste un handler delle conversazioni ne creo uno nuovo
   * lo salvo in chatmanager
   * e mi sottoscrivo al nodo (connect)
   * inizializzo la pagina
   */
  initConversationsHandler() {
    
    console.log('-------------> initConversationsHandler');
    const tenant = this.chatManager.getTenant();
    const loggedUser = this.chatManager.getLoggedUser();
    let handler = this.chatManager.conversationsHandler;
    if (!handler) {
      console.log('handler NON ESISTE ::');
      handler = this.chatConversationsHandler.initWithTenant(tenant,loggedUser);
      this.chatManager.setConversationsHandler(handler);
      handler.connect();
      handler.uidConvSelected = this.uidConvSelected
      this.conversationsHandler = handler;
      this.conversations = handler.conversations;
    } else {
      console.log('handler ESISTE ::', handler);
      this.conversationsHandler = handler;
    }
    
    
    //console.log('plt::', windowsMatchMedia());
    if(this.uidConvSelected){
      // se visualizzazione è desktop
      if(windowsMatchMedia()) {
        this.openMessageList(this.uidConvSelected);
      }
    } else if(this.conversations.length>0){
      this.uidConvSelected = this.conversations[0].uid;
      // se visualizzazione è desktop
      if(windowsMatchMedia()) {
        this.openMessageList(this.uidConvSelected);
      }
    }
    else {
      // se visualizzazione è desktop
      if(windowsMatchMedia()) {
        this.navProxy.pushDetail(PlaceholderPage,{});
      }
    }
      //this.navProxy.isOn = true;
      //
    

    // if(this.conversations.length <= 0){
    //   this.navProxy.pushDetail(PlaceholderPage,{});
    // }
    
  }
  
  /**
  * apro pagina elenco users 
  * metodo richiamato da html 
  */
  openUsersList(event) {
    //this.navCtrl.setRoot(UsersPage);
    this.navCtrl.push(UsersPage, {
      contacts: ""
    });
  }

  /**
  * apro il menu delle opzioni 
  * (metodo richiamato da html) 
  * alla chiusura controllo su quale opzione ho premuto e attivo l'azione corrispondete
  */
  presentPopover(event) {
    let popover = this.popoverCtrl.create(PopoverPage, {typePopup:TYPE_POPUP_LIST_CONVERSATIONS});
    popover.present({
      ev: event
    });
    popover.onDidDismiss((data: string) => {
      console.log(" ********* data::: ", data);
      if (data == 'logOut') {
        this.logOut();
      }
      else if (data == 'ProfilePage') {
        if(this.chatManager.getLoggedUser()){
          this.navCtrl.push(ProfilePage);
        }
      }
    });
  }

  /**
   * modulo richiamato se premo su logout
   * 1 - aggiungo placeholderPage 
   * 2 - richiamo il logout di firebase
   */
  logOut() {
    //this.navProxy.pushDetail(PlaceholderPage,{});
    this.userService.logoutUser();
  }
  
  
}
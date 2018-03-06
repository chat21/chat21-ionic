import { Component } from '@angular/core';
import { Events, PopoverController, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
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
import { compareValues, windowsMatchMedia, searchIndexInArrayForUid } from '../../utils/utils';
import { LABEL_IMAGE, TYPE_POPUP_LIST_CONVERSATIONS } from '../../utils/constants';
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
  private conversationWith: string;
  private uidReciverFromUrl: string;
  private conversationsHandler: ChatConversationsHandler;
  private uidConvSelected: string;
  private LABEL_IMAGE = LABEL_IMAGE;

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
    // RECUPERO ID CONVERSAZIONE
    // se vengo da dettaglio conversazione
    // o da users con conversazione attiva recupero conversationWith
    this.conversationWith = navParams.get('conversationWith');
    //this.uidReciverFromUrl = (location.search.split('recipient=')[1]).split('&')[0];
    let TEMP = location.search.split('recipient=')[1];
    if (TEMP) { this.uidReciverFromUrl = TEMP.split('&')[0]; }
    //console.log('location.search: ',  this.uidReciverFromUrl);
  
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
    const profileModal = this.modalCtrl.create(LoginPage, null, { enableBackdropDismiss: false });
    
    this.events.subscribe('loggedUser:login', user => {
      console.log('************** LOGGED currentUser:', user);
      profileModal.dismiss({animate: false, duration: 0})
      const that = this;
      this.loadListConversations();
      // se dopo 1 sec nn ci sono conversazioni carico placeholder
      setTimeout(function(){
        console.log('************** that.conversations.length:', that.conversations.length);
        if(that.conversations.length <= 0){
          that.navProxy.pushDetail(PlaceholderPage,{});
        }
      }, 1000);
    });

    this.events.subscribe('loggedUser:logout', user => {
      console.log('************** NN LOGGED currentUser:', user);
      this.navProxy.pushDetail(PlaceholderPage,{});
      this.conversations = [];
      //const profileModal = this.modalCtrl.create(LoginPage, null, { enableBackdropDismiss: false });
      profileModal.present();
      this.conversationWith = null;
    });

    /** SUBSCRIBE CONVERSATIONS LIST
     * sottosrcizione all'elenco delle conversazioni 
     * l'eleco viene aggiornato ogni volta che viene aggiunta una nuova connversazione
     * la nuova conversazione viene aggiunta come primo elemento dell'array in posizione 0
     * apro la pagina della conversazione
     */
    this.events.subscribe('conversations:added', (conversation) => {
      console.log('************** conversations added:', conversation);
      this.conversations.splice(0, 0, conversation);
      //this.conversations = conversations;
      this.goToconversationMessageList(conversation.uid);
    });
    
    this.events.subscribe('conversations:changed', conversation => {
      const index = searchIndexInArrayForUid(this.conversations, conversation.uid);
      console.log("child_changed", index);
      if(this.uidConvSelected == conversation.uid){
        conversation.status = '0';
        conversation.selected = true;
      }
      this.conversations.splice(index, 1, conversation);
      this.conversations.sort(compareValues('timestamp', 'desc'));
    });

    this.events.subscribe('uidConvSelected:changed', uidConvSelected => {
      console.log('************** uidConvSelected:changed:', uidConvSelected);
      // SE E' DIVERSO DA this.uidConvSelected
      // 1 - cerco conv con id == this.uidConvSelected e imposto select a FALSE
      // 2 - cerco conv con id == nw uidConvSelected se esiste:  
      // 2.1 - imposto status a 0 come letto
      // 2.2 - seleziono conv selected == TRUE
      // 2.3 - imposto nw uidConvSelected come this.uidConvSelected
      // 2.4 - apro conv
      // 3 salvo id conv nello storage
      this.openMessageList(uidConvSelected);
    });
  }

  openMessageList(uidConvSelected){
    const that = this;
    console.log('************** openMessageList ********************', uidConvSelected);
    if(uidConvSelected == this.uidConvSelected && windowsMatchMedia()){
      return
    }
    this.uidConvSelected = uidConvSelected;
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
      that.conversationWith = uidConvSelected;
    }, 500);
  }
  

  /**
  * START GESTIONE CONVERSAZIONI
  * carico elenco conversazioni  
  * (al caricamento delle conversazioni -> PUBLIC conversations:update)
  * inizializzo l'handler delle conversazioni
  */
  loadListConversations() {
    const that = this;
    this.databaseProvider.getUidLastOpenConversation()
    .then(function(uid) { 
      console.log('getUidLastOpenConversation:: ' + uid + 'that.uidReciverFromUrl:: ' + that.uidReciverFromUrl);
      if(that.uidReciverFromUrl){
        that.uidConvSelected = that.uidReciverFromUrl;
        that.uidReciverFromUrl = null;
      }
      else if(uid){
        that.uidConvSelected = uid;
      }
      that.initConversationsHandler();
    });
  }

  /**
   * se non esiste un handler delle conversazioni ne creo uno nuovo
   * lo salvo in chatmanager
   * e mi sottoscrivo al nodo (connect)
   * inizializzo la pagina
   */
  initConversationsHandler() {
    console.log('initConversationsHandler ::');
    const tenant = this.chatManager.getTenant();
    const loggedUser = this.chatManager.getLoggedUser();
    let handler = this.chatManager.conversationsHandler;
    
    if (!handler) {
      console.log('handler NON ESISTE ::');
      handler = this.chatConversationsHandler.initWithTenant(tenant,loggedUser);
      this.chatManager.setConversationsHandler(handler);
      handler.connect();
      this.conversationsHandler = handler;
    } else {
      console.log('handler ESISTE ::', handler);
      //this.chatManager.setConversationsHandler(handler);
      //handler.delegateView = self;
      this.conversationsHandler = handler;
    }
  }

  /**
  * metodo richiamato ogni volta che viene aggiunta una nuova conversazione
  * 1 - recupero uid conversazione da aprire passato nell'url ( se esiste )
  * 2 - cerco nell'array conversazioni se esiste una con uid uguale a uid conversazione selezionata
  * 2.1 - ESISTE: apro pagina elenco messaggi
  * 2.2 - NON ESISTE: apro pagina wellcome    
  */
  goToconversationMessageList(uid){
    // se uid == this.uidConvSelected
    console.log('goToconversationMessageList ::', uid);
    if(uid ==  this.uidConvSelected){
      var conversationSelected = this.conversations.find(item => item.uid === uid);
      if(conversationSelected){
        conversationSelected.status = '0';
        conversationSelected.selected = true;
        this.navProxy.pushDetail(DettaglioConversazionePage, {
          conversationWith: uid,
          conversationWithFullname: conversationSelected.conversation_with_fullname,
          channel_type: conversationSelected.channel_type
        });
      } 
    }
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
import { Component, NgZone } from '@angular/core';
import { Events, PopoverController, IonicPage, NavController, NavParams, ModalController, Modal, AlertController } from 'ionic-angular';
// models
import { ConversationModel } from '../../models/conversation';
import { UserModel } from '../../models/user';

// pages
import { LoginPage } from '../authentication/login/login';
import { PlaceholderPage } from '../placeholder/placeholder';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
import { UsersPage } from '../users/users';
import { _MasterPage } from '../_MasterPage';
import { PopoverPage } from '../popover/popover';
import { ProfilePage } from '../profile/profile';
// utils
import { getParameterByName, convertMessage, windowsMatchMedia, isHostname } from '../../utils/utils';
import { TYPE_POPUP_LIST_CONVERSATIONS } from '../../utils/constants';
import * as PACKAGE from '../../../package.json';
// services
import { ChatManager } from '../../providers/chat-manager/chat-manager';
import { NavProxyService } from '../../providers/nav-proxy';
import { UserService } from '../../providers/user/user';
import { ChatConversationsHandler } from '../../providers/chat-conversations-handler';
import { ChatConversationHandler } from '../../providers/chat-conversation-handler';
import { DatabaseProvider } from '../../providers/database/database';
import { GroupService } from '../../providers/group/group';

import { TiledeskConversationProvider } from '../../providers/tiledesk-conversation/tiledesk-conversation';

import { TranslateService } from '@ngx-translate/core';
import { ArchivedConversationsPage } from '../archived-conversations/archived-conversations';
import { ChatArchivedConversationsHandler } from '../../providers/chat-archived-conversations-handler';
import { isGeneratedFile } from '@angular/compiler/src/aot/util';
import { User } from 'firebase';


@IonicPage()
@Component({
  selector: 'page-lista-conversazioni',
  templateUrl: 'lista-conversazioni.html',
})
export class ListaConversazioniPage extends _MasterPage {
  private loggedUser: UserModel;
  private conversations: Array<ConversationModel> = [];
  private archivedConversations: ConversationModel[];
  private tenant: string;
  private numberOpenConv: number = 0;
  private loadingIsActive: boolean = true;
  private numberTotConv: number = 0;

  private uidReciverFromUrl: string;
  private conversationsHandler: ChatConversationsHandler;
  private uidConvSelected: string;
  private profileModal: Modal;
  private BUILD_VERSION: string;
  private isHostname: boolean;
  private timerIdOpenConversation: NodeJS.Timer;

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
    public databaseProvider: DatabaseProvider,
    private groupService: GroupService,
    private tiledeskConversationProvider: TiledeskConversationProvider,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private chatArchivedConversationsHandler: ChatArchivedConversationsHandler
  ) {
    super();
    var that = this;
    this.isHostname = isHostname();
    this.BUILD_VERSION = 'v.' + PACKAGE.version; // 'b.0.5';

    /** RECUPERO ID CONVERSAZIONE
      * se vengo da dettaglio conversazione
      * o da users con conversazione attiva recupero conversationWith
      */
    this.uidConvSelected = navParams.get('conversationWith');
    this.tenant = chatManager.getTenant();
    
    
    /** OPEN CONVERSATION DETAIL (controllo ogni 3 sec) */
    //this.getUidReciverFromUrl();
    this.openConversationInPageDetail();

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
    this.profileModal = this.modalCtrl.create(LoginPage, {tenant: this.tenant}, { enableBackdropDismiss: false });
    this.initSubscriptions();
    this.checkLoadingIsActive(5000);
    if (windowsMatchMedia()) {
      this.navProxy.pushDetail(PlaceholderPage, {});
    }
    //this.openDetailConversation();
  }

  /** RECUPERO IL RECIPIENTID 
    * nel caso in cui viene pasato nell'url della pagina
    * per aprire una conversazione
    * USARE getParameterByName(name) del widget
    */
    // getUidReciverFromUrl(){
    //   try{
    //     let TEMP = getParameterByName('recipient');
    //     if (TEMP) { 
    //       this.uidReciverFromUrl = TEMP; 
    //     }
    //     TEMP = getParameterByName('recipientFullname');
    //     if (TEMP) { 
    //       this.uidReciverFromUrl = TEMP; 
    //     }
    //   } catch (err) {
    //     console.error("-> error:", err)
    //   }
    // }

  // openDetailConversation(){
  //   const that = this;
  //   /** RECUPERO IL RECIPIENTID dall'url */
  //   if(!this.loggedUser){
  //     this.loadingIsActive = false;
  //     return;
  //   }
  //   try {
  //     let TEMP = location.search.split('recipient=')[1];
  //     if (TEMP) { 
  //       this.uidReciverFromUrl = TEMP.split('&')[0]; 
  //       this.setUidConvSelected(this.uidReciverFromUrl);
  //       //this.goToChat(this.uidReciverFromUrl, this.uidReciverFromUrl);
  //     } else {
  //       this.loadingIsActive = false;
  //     }
  //   } catch (err) {
  //     console.error("-> error:", err)
  //     this.loadingIsActive = false;
  //   }
  //   this.showDetailConversation();
  // }

  /** 
   * imposto un setInterval di 3 sec
   * verifico se il num delle conversazioni è aumentato
   * se sono cambiate aggiorno numberTotConv per rifare il controllo
   * altrimenti se esiste già una conversazione con l'utente passato nell'url (uidReciverFromUrl):
   *  - apro dettaglio conversazione 
   *  - altrimenti creo una nuova conversazione
   * cancello intervallo;
   * NOTA: da spostare nella classe di service delle conversazioni e utilizzare con una sottoscrizione
   */
  openConversationInPageDetail(){
    var that = this;
    this.timerIdOpenConversation = setInterval(function() {
      if(that.conversations.length > that.numberTotConv){
        that.numberTotConv = that.conversations.length;
      } else {
        let uidReciverFromUrlTEMP = getParameterByName('recipient');
        if (uidReciverFromUrlTEMP) { 
          that.uidReciverFromUrl = uidReciverFromUrlTEMP; 
        }
        let recipientFullnameTEMP = getParameterByName('recipientFullname');
        if(!recipientFullnameTEMP){
          recipientFullnameTEMP = uidReciverFromUrlTEMP;
        }
        if (that.uidReciverFromUrl && windowsMatchMedia()) {
          console.log('************** conversationsChanged: '+that.conversations.length);
          const conversationSelected = that.conversations.find(item => item.uid === that.uidReciverFromUrl);
          if (conversationSelected) {
            that.setUidConvSelected(conversationSelected.uid);
            that.openMessageList();
          } else {
            that.goToChat(uidReciverFromUrlTEMP, recipientFullnameTEMP);
          }
          that.uidReciverFromUrl = null;
        } else if (that.uidConvSelected && windowsMatchMedia()) {
          that.setUidConvSelected(that.uidConvSelected);
          that.openMessageList();
        }
        clearInterval(that.timerIdOpenConversation);
      }
    }, 2000);
  }


  //// SUBSCRIBTIONS ////
  /** */
  initSubscriptions() {
    //this.events.subscribe('loadedConversationsStorage', this.loadedConversationsStorage);
    this.events.subscribe('conversationsChanged', this.conversationsChanged);
    this.events.subscribe('archivedConversationsChanged', this.archivedConversationsChanged);
    this.events.subscribe('loggedUser:login', this.subscribeLoggedUserLogin);
    this.events.subscribe('loggedUser:logout', this.subscribeLoggedUserLogout);
    this.events.subscribe('uidConvSelected:changed', this.subscribeUidConvSelectedChanged);
  }
  /** 
   * evento richiamato quando ho finito di caricare le conversazioni dallo storage
  */
  // loadedConversationsStorage: any = conversations => {
  //   console.log('************** loadedConversationsStorage');
  //   if(conversations && conversations.length > 0 ){
  //     this.conversations = conversations;
  //     this.numberOpenConv = this.conversationsHandler.countIsNew();
  //   }
  //   this.showDetailConversation();
  // }
  /** 
   * evento richiamato su add, change, remove di una conversazione
   * se uidConvSelected è null (la prima volta che apro la chat)
   * imposto prima conv come uidConvSelected 
  */
  conversationsChanged = (conversations: ConversationModel[]) => {
    var that = this;
    this.conversations = conversations;
    this.numberOpenConv = this.conversationsHandler.countIsNew();
  
    // setTimeout(function () {
    //     // controllo se la conv è aperta 
    //     if (that.uidReciverFromUrl && windowsMatchMedia()) {
    //       console.log('************** conversationsChanged: '+that.conversations.length);
    //       that.setUidConvSelected(that.uidReciverFromUrl);
    //       that.openMessageList();
    //       that.uidReciverFromUrl = null;
    //     } 
    // }, 1000);
    

  }

  /**
   * metodo invocato dalla pagina html alla selezione dell'utente
   * imposta conversazione attiva nella pagina elenco conversazioni
   * carica elenco messaggi conversazione nella pagina conversazione
   * @param conversationWith 
   */
  goToChat(conversationWith: string, conversationWithFullname: string) {
    console.log('**************** goToChat conversationWith:: ',conversationWith);
    //pubblico id conv attiva e chiudo pagina 
    this.events.publish('uidConvSelected:changed', conversationWith, 'new');
    this.navProxy.pushDetail(DettaglioConversazionePage,{ 
      conversationWith:conversationWith,
      conversationWithFullname:conversationWithFullname 
    });
  }


  archivedConversationsChanged = (conversations: ConversationModel[]) => {
    this.archivedConversations = conversations;
  }
  /** subscribeUidConvSelectedChanged
   * evento richiamato quando si seleziona un utente nell'elenco degli user 
   * apro dettaglio conversazione 
  */
  subscribeUidConvSelectedChanged = (uidConvSelected: string, type: string) => {
    this.checkMessageListIsOpen(uidConvSelected, type);
  }
  /** subscribeLoggedUserLogin
   * effettuato il login: 
   * 1 - dismetto modale
   * 2 - carico lista conversazioni
   * 3 - se non ci sono conversazioni carico placeholder
  */
  subscribeLoggedUserLogin = (user: any) => {
    console.log('************** subscribeLoggedUserLogin', user);
    this.loggedUser = user;
    this.checkLoadingIsActive(5000);
    //this.openDetailConversation();
    this.loadListConversations();
    this.profileModal.dismiss({ animate: false, duration: 0 });
  }
  /** subscribeLoggedUserLogout
   * effettuato il logout:
   * 1 - mostro placeholder
   * 2 - resetto array conversazioni
   * 3 - mostro modale login
   * 4 - resetto conversationWith
  */
  subscribeLoggedUserLogout = (user: any) => {
    console.log('************** subscribeLoggedUserLogout', user);
    this.conversations = [];
    this.profileModal.present();
    //this.conversationWith = null;
    this.uidConvSelected = null;
  }
  //// END SUBSCRIBTIONS LIST ////



  ionViewDidLeave() {
    clearTimeout(this.timerIdOpenConversation);  
  }


  /**
  * START GESTIONE CONVERSAZIONI
  * se esiste recupero uidReciverFromUrl passato nell'url
  * init ConversationsHandler e carico elenco conversazioni
  * altrimenti recupero id ultima conversazione aperta salvato nello storage
  * init ConversationsHandler e carico elenco conversazioni
  */
  loadListConversations() {
    const that = this;
    this.databaseProvider.initialize(this.loggedUser, this.tenant);
    console.log('loadListConversations:: ' + this.uidReciverFromUrl);
    if (this.uidReciverFromUrl) {
      this.setUidConvSelected(this.uidReciverFromUrl);
      this.initConversationsHandler();
      //this.uidReciverFromUrl = null;
    } else {
      this.databaseProvider.getUidLastOpenConversation()
      .then(function (uid: string) {
        console.log('getUidLastOpenConversation:: ' + uid);
        that.setUidConvSelected(uid);
        that.initConversationsHandler();
      })
      .catch((error) => {
        that.setUidConvSelected();
        that.initConversationsHandler();
        console.log("error::: ", error);
      });
    }
  }

  /**
   * 
   * @param uidConvSelected 
   */
  setUidConvSelected(uidConvSelected?: string){
    this.uidConvSelected = uidConvSelected;
    this.chatConversationsHandler.uidConvSelected = uidConvSelected;
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
  openMessageList(type?: string) {
    const that = this;
    setTimeout(function () {
      const conversationSelected = that.conversations.find(item => item.uid === that.uidConvSelected);
      if (conversationSelected) {
        console.log('openMessageList::', conversationSelected);
        conversationSelected.is_new = false;
        conversationSelected.status = '0';
        conversationSelected.selected = true;
        that.navProxy.pushDetail(DettaglioConversazionePage, {
          conversationSelected: conversationSelected,
          conversationWith: that.uidConvSelected,
          conversationWithFullname: conversationSelected.conversation_with_fullname,
          channel_type: conversationSelected.channel_type
        });
        that.conversationsHandler.setConversationRead(conversationSelected.uid);
        that.databaseProvider.setUidLastOpenConversation(that.uidConvSelected);
      } else if(!type) {
        if (windowsMatchMedia()) {
          that.navProxy.pushDetail(PlaceholderPage, {});
        }
      }
    }, 200);
    
    // if the conversation from the isConversationClosingMap is waiting to be closed 
    // deny the click on the conversation
    if (this.tiledeskConversationProvider.getClosingConversation(this.uidConvSelected)) return;
  }

  

  /**
   * 
   * @param uidConvSelected 
   */
  checkMessageListIsOpen(uidConvSelected, type?) {
    if (uidConvSelected === this.uidConvSelected && windowsMatchMedia()) {
      console.log("ListaConversazioniPage::checkMessageListIsOpen::if::uidConvSelected", uidConvSelected, "this_uidConvSelected", this.uidConvSelected);
      return;
    } else {
      console.log("ListaConversazioniPage::checkMessageListIsOpen::else::uidConvSelected", uidConvSelected);
      this.setUidConvSelected(uidConvSelected);
      this.openMessageList(type);
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
    // let conversationHandler = this.chatManager.conversationsHandler;
    // let archviedConversationsHandler = this.chatManager.archivedConversationsHandler;

    // if (!this.conversationsHandler) {
      // 1 - init chatConversationsHandler and  archviedConversationsHandler
      this.conversationsHandler = this.chatConversationsHandler.initWithTenant(tenant, loggedUser);
      this.chatArchivedConversationsHandler = this.chatArchivedConversationsHandler.initWithTenant(tenant, loggedUser);
      
      this.chatConversationsHandler.getConversationsFromStorage();
      // 2 - bind conversations to conversationHandler.conversations
      //this.conversations = conversationHandler.conversations;
      //this.archivedConversations = archviedConversationsHandler.conversations;
      // 3 - set uidConvSelected in conversationHandler
      this.conversationsHandler.uidConvSelected = this.uidConvSelected
      this.chatArchivedConversationsHandler.uidConvSelected = this.uidConvSelected
      // 5 - connect conversationHandler and archviedConversationsHandler to firebase event (add, change, remove)
      this.conversationsHandler.connect();
      this.chatArchivedConversationsHandler.connect();
      // 6 - imposto i conversationsHandler globali
      // this.conversationsHandler = conversationHandler;
      // this.chatArchivedConversationsHandler = archviedConversationsHandler;
      // 4 - save conversationHandler in chatManager
      this.chatManager.setConversationsHandler(this.conversationsHandler);
    // }
    // else {
    //   console.log('handler ESISTE ::', this.conversationsHandler);
    // }
  
  }


  /**
   * se mi trovo in visualizzazione desktop (dettaglio conversazione aperto sulla dx)
   *  - se esite uidConvSelected apro il dettaglio conversazione
   *  - altrimenti setto uidConvSelected alla prima conversazione ed apro il dettaglio conversazione
   */
  // showDetailConversation(){
  //   if (this.uidConvSelected) {
  //     console.log('openMessageList 1 ::', this.uidConvSelected);
  //     // se visualizzazione è desktop
  //     if (windowsMatchMedia()) {
  //       this.setUidConvSelected(this.uidConvSelected);
  //       this.openMessageList();
  //     }
  //   } else if (this.conversations.length > 0) {
  //     console.log('openMessageList 2 ::');
  //     // this.uidConvSelected = this.conversations[0].uid;
  //     // se visualizzazione è desktop
  //     if (windowsMatchMedia()) {    
  //       //this.setUidConvSelected(this.uidConvSelected);
  //       this.openMessageList();
  //     }
  //   } else {
  //     console.log('openMessageList 3 ::');
  //     // se visualizzazione è desktop
  //     if (windowsMatchMedia()) {
  //       this.navProxy.pushDetail(PlaceholderPage, {});
  //     }
  //   }
  // }


  //// START HTML ACTIONS////
  /**
  * apro pagina elenco users 
  * (metodo richiamato da html) 
  */
  private openUsersList(event: any) {
    //this.navCtrl.setRoot(UsersPage);
    this.navCtrl.push(UsersPage, {
      contacts: "",
      'tenant': this.tenant,
      'loggedUser': this.loggedUser
    });
  }

  /**
   * Open the archived conversations page
   * (metodo richiamato da html) 
   */
  private openArchivedConversationsPage() {
   
    this.navCtrl.push(ArchivedConversationsPage, {
      'archivedConversations' :  this.archivedConversations,
      'tenant': this.tenant,
      'loggedUser': this.loggedUser
     });
  }

  /**
  * apro il menu delle opzioni 
  * (metodo richiamato da html) 
  * alla chiusura controllo su quale opzione ho premuto e attivo l'azione corrispondete
  */
  private presentPopover(event) {
    const that = this;
    let popover = this.popoverCtrl.create(PopoverPage, { typePopup: TYPE_POPUP_LIST_CONVERSATIONS });
    popover.present({
      ev: event
    });
    popover.onDidDismiss((data: string) => {
      console.log(" ********* data::: ", data);
      if (data == 'logOut') {
        that.logOut();
      } else if (data == 'ProfilePage') {
        if (this.chatManager.getLoggedUser()) {
          this.navCtrl.push(ProfilePage);
        }
      } else if (data == "ArchivedConversationsPage") {
        that.openArchivedConversationsPage();
      }
    });
  }

  /**
   * modulo richiamato se premo su logout
   * 1 - aggiungo placeholderPage 
   * 2 - richiamo il logout di firebase
   */
  private logOut() {
    //this.navProxy.pushDetail(PlaceholderPage,{});
    this.userService.logoutUser();
  }

  /**
   * metodo mostra un placeholder di benvenuto se non ci sono conversazioni
   * ritardato dopo 5 sec per dare il tempo di caricare lo storico delle conversazioni
   * dallo storage locale o da remoto
   * (metodo richiamato da html) 
   */
  private checkLoadingIsActive(time:number) {
    const that = this;
    setTimeout(function () {
      that.loadingIsActive = false;
    }, time);
  }

  /**
   * chiudo conversazione
   * (metodo richiamato da html) 
   * @param conversation 
   */
  private closeConversation(conversation) {
    var conversationId = conversation.uid;
    var isSupportConversation = conversationId.startsWith("support-group");
    if (!isSupportConversation) {
      this.deleteConversation(conversationId, function (result, data) {
        if (result === 'success') {
          console.log("ListaConversazioniPage::closeConversation::deleteConversation::response", data);
        } else if (result === 'error') {
          console.error("ListaConversazioniPage::closeConversation::deleteConversation::error", data);
        }
      });
      // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
    } else {
      // the conversationId is:
      // - the recipientId if it is a direct conversation;
      // - the groupId if it is a group conversation;
      // the groupId can reference:
      // - a normal group;
      // - a support  group if it starts with "support-group"
      this.closeSupportGroup(conversationId, function (result: string, data: any) {
        if (result === 'success') {
          console.log("ListaConversazioniPage::closeConversation::closeSupportGroup::response", data);
        } else if (result === 'error') {
          console.error("ListaConversazioniPage::closeConversation::closeSupportGroup::error", data);
        }
      });
    }
  }

  // close the support group
  // more details availables at 
  // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#close-support-group
  private closeSupportGroup(groupId, callback) {
    var that = this;
    // BEGIN -  REMOVE FROM LOCAL MEMORY 
    this.conversationsHandler.removeByUid(groupId); // remove the item 
    // END -  REMOVE FROM LOCAL MEMORY 
    
    // BEGIN - REMOVE FROM REMOTE 
    //set the conversation from the isConversationClosingMap that is waiting to be closed
    this.tiledeskConversationProvider.setClosingConversation(groupId, true);
    this.groupService.closeGroup(groupId, function(response, error) {
      if (error) {
        // the conversation closing failed: restore the conversation with 
        // conversationId status to false within the isConversationClosingMap
        that.tiledeskConversationProvider.setClosingConversation(groupId, false);
        callback('error', error);
      }
      else {
        callback('success', response);
      }
    });
    // when a conversations is closed shows a placeholder background
    if (groupId === that.uidConvSelected) {
      that.navProxy.pushDetail(PlaceholderPage, {});
    }
  }

  // delete a conversation form the personal timeline
  // more details availables at 
  // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
  private deleteConversation(conversationId, callback) {
    var that = this;
    // END - REMOVE FROM LOCAL MEMORY 
    this.conversationsHandler.removeByUid(conversationId); // remove the item 
    // END - REMOVE FROM LOCAL MEMORY 

    // BEGIN - REMOVE FROM REMOTE 
    // set the conversation from the isConversationClosingMap that is waiting to be closed
    this.tiledeskConversationProvider.setClosingConversation(conversationId, true);
    this.tiledeskConversationProvider.deleteConversation(conversationId, function(response, error) {
      if (error) {
        that.tiledeskConversationProvider.setClosingConversation(conversationId, false);
        callback('error', error);
      }
      else {
        callback('success', response);
      }
    });
    // when a conversations is closed shows a placeholder background
    if (conversationId === this.uidConvSelected) {
      that.navProxy.pushDetail(PlaceholderPage, {});
    }
  }
  //// END HTML ACTIONS////

}
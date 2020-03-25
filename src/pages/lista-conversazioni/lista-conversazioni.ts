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
import { getParameterByName, convertMessage, windowsMatchMedia } from '../../utils/utils';
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
import { environment } from '../../environments/environment';

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
  // private isHostname: boolean;
  private timerIdOpenConversation: NodeJS.Timer;


  private convertMessage = convertMessage;
  private supportMode = environment.supportMode;
  private showPlaceholder = true;

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
    this.BUILD_VERSION = 'v.' + PACKAGE.version;
    this.tenant = this.chatManager.getTenant();
    this.profileModal = this.modalCtrl.create(LoginPage, { tenant: this.tenant }, { enableBackdropDismiss: false });
  }

  ionViewDidEnter(){
    this.initInterface();
    this.events.subscribe('loggedUser:login', this.subscribeLoggedUserLogin);
    this.events.subscribe('loggedUser:logout', this.subscribeLoggedUserLogout);
  }

  ionViewDidLeave() {
    //clearTimeout(this.timerIdOpenConversation);
  }


  /** 
   * ::: subscribeLoggedUserLogin :::
   * effettuato il login: 
   * 1 - imposto loggedUser
   * 2 - dismetto modale
   * 3 - inizializzo elenco conversazioni
  */
  subscribeLoggedUserLogin = (user: any) => {
    // console.log('************** subscribeLoggedUserLogin', user);
    this.loggedUser = user;
    try {
      this.profileModal.dismiss({ animate: false, duration: 0 });
    } catch (err) {
      console.error("-> error:", err)
    }
    this.initialize();
  }


  /**
   * ::: initialize :::
   */
  initialize(){
    this.initVariables();
    this.initConversationsHandler();
    this.initSubscriptions();
  }

  /** 
   * ::: initVariables :::
   * al caricamento della pagina:
   * setto BUILD_VERSION prendendo il valore da PACKAGE
   * recupero conversationWith - se vengo da dettaglio conversazione o da users con conversazione attiva ???? sarà sempre undefined da spostare in ionViewDidEnter
   * recupero tenant
   * imposto recipient se esiste nei parametri passati nell'url 
   * imposto uidConvSelected recuperando id ultima conversazione aperta dallo storage 
  */
  initVariables(){
    var that = this;
    let TEMP = getParameterByName('recipient');
    if (TEMP) {
      this.uidReciverFromUrl = TEMP;
    } 
    this.databaseProvider.initialize(this.loggedUser, this.tenant);
    this.databaseProvider.getUidLastOpenConversation()
    .then(function (uid: string) {
      //console.log('getUidLastOpenConversation:: ' + uid);
      that.setUidConvSelected(uid);
    })
    .catch((error) => {
      that.setUidConvSelected();
      console.log("error::: ", error);
    });
    // console.log('::::BUILD_VERSION:::: ',this.BUILD_VERSION);
    // console.log('::::uidConvSelected:::: ',this.uidConvSelected);
    console.log('::::tenant:::: ',this.tenant);
    console.log('::::uidReciverFromUrl:::: ',this.uidReciverFromUrl);
  }

  /**
   * ::: initInterface :::
   * se sono su mobile nella pagina di dettaglio imposto il placeholder
   */
  initInterface(){
    if (windowsMatchMedia()) {
      this.navProxy.pushDetail(PlaceholderPage, {});
    }
  }

  /**
   * ::: initConversationsHandler :::
   * inizializzo chatConversationsHandler e archviedConversationsHandler
   * recupero le conversazioni salvate nello storage e pubblico l'evento loadedConversationsStorage
   * imposto uidConvSelected in conversationHandler e chatArchivedConversationsHandler
   * e mi sottoscrivo al nodo conversazioni in conversationHandler e chatArchivedConversationsHandler (connect)
   * salvo conversationHandler in chatManager
   */
  initConversationsHandler() {
    console.log('initConversationsHandler -------------> initConversationsHandler');
    ///const tenant = this.chatManager.getTenant();
    ///const loggedUser = this.chatManager.getLoggedUser();

    // 1 - init chatConversationsHandler and  archviedConversationsHandler
    this.conversationsHandler = this.chatConversationsHandler.initWithTenant(this.tenant, this.loggedUser);
    this.chatArchivedConversationsHandler = this.chatArchivedConversationsHandler.initWithTenant(this.tenant, this.loggedUser);

    // 2 - get conversations from storage
    this.chatConversationsHandler.getConversationsFromStorage();

    // 3 - set uidConvSelected in conversationHandler
    this.conversationsHandler.uidConvSelected = this.uidConvSelected
    this.chatArchivedConversationsHandler.uidConvSelected = this.uidConvSelected

    // 5 - connect conversationHandler and archviedConversationsHandler to firebase event (add, change, remove)
    this.conversationsHandler.connect();
    this.chatArchivedConversationsHandler.connect();

    // 6 - save conversationHandler in chatManager
    this.chatManager.setConversationsHandler(this.conversationsHandler);
  }

  /** 
   * ::: initSubscriptions :::
   * mi sottoscrivo a:
   * 1 - elenco conversazioni
   * 2 - elenco conversazioni erchiviate
   * 3 - logout
   * 4 - conversazione selezionata (attiva)
   * 
  */
  initSubscriptions() {
    //this.events.subscribe('loadedConversationsStorage', this.loadedConversationsStorage);
    this.events.subscribe('conversationsChanged', this.conversationsChanged);
    this.events.subscribe('archivedConversationsChanged', this.archivedConversationsChanged);
    this.events.subscribe('uidConvSelected:changed', this.subscribeUidConvSelectedChanged);
  }

  //------------------------------------------------------------------//
  // SUBSCRIPTIONS
  //------------------------------------------------------------------//
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
   * ::: conversationsChanged :::
   * evento richiamato su add, change, remove dell'elenco delle conversazioni
   * 1 - aggiorno elenco conversazioni
   * 2 - aggiorno il conto delle nuove conversazioni
   * 4 - se esiste un uidReciverFromUrl (passato nell'url) 
   *    e se esiste una conversazione con lo stesso id di uidReciverFromUrl 
   *    imposto questa come conversazione attiva (operazione da fare una sola volta al caricamento delle conversazioni) 
   *    e la carico nella pagina di dettaglio e azzero la variabile uidReciverFromUrl!!! 
   * 5 - altrimenti se esiste una conversazione con lo stesso id della conversazione attiva 
   *    e la pagina di dettaglio è vuota (placeholder), carico la conversazione attiva (uidConvSelected) nella pagina di dettaglio 
   *    (operazione da fare una sola volta al caricamento delle conversazioni)
  */
  conversationsChanged = (conversations: ConversationModel[]) => {
    console.log('LISTA CONVERSAZIONI »»»»»»»»» conversationsChanged - CONVERSATIONS: ', this.conversations);
    var that = this;
    this.conversations = conversations;
    this.numberOpenConv = this.conversationsHandler.countIsNew();
    if (that.uidReciverFromUrl) {
      that.setUidConvSelected(that.uidReciverFromUrl);
      let position = conversations.findIndex(i => i.uid === that.uidReciverFromUrl);
      if (position > -1 ) {
        //that.setUidConvSelected(that.uidReciverFromUrl);
        //console.log('TROVATO');
        that.openMessageList();
        that.uidReciverFromUrl = null;
        that.showPlaceholder = false;
      } else if(that.showPlaceholder) {
        //console.log('NN LO TROVO ');
        let TEMP = getParameterByName('recipientFullname');
        if (!TEMP) {
          TEMP = that.uidReciverFromUrl;
        }
        that.navProxy.pushDetail(DettaglioConversazionePage, {
          conversationWith: that.uidConvSelected,
          conversationWithFullname: TEMP
        });
        that.showPlaceholder = false;
      }
    } else {
      if (that.uidConvSelected && that.showPlaceholder === true) {
        const conversationSelected = that.conversations.find(item => item.uid === that.uidConvSelected);
        if (conversationSelected) {
          that.setUidConvSelected(that.uidConvSelected);
          that.openMessageList();
          that.showPlaceholder = false;
        } else {
          that.navProxy.pushDetail(DettaglioConversazionePage, {
            conversationWith: null
          });
        }
      }
      
    }
  }

  /**
   * ::: archivedConversationsChanged :::
   * evento richiamato su add, change, remove dell'elenco delle conversazioni archiviate
   * se id passato è relativo ad una conversazione archiviata:
   * 1 - apro dettaglio conversazione
   * 2 - apro lista conversazioni archiviate
  */
  archivedConversationsChanged = (conversations: ConversationModel[]) => {
    this.archivedConversations = conversations;
    
    if (this.uidReciverFromUrl) {
      let position = conversations.findIndex(i => i.uid === this.uidReciverFromUrl);
      if (position > -1 ) {
        console.log('archivedConversationsChanged -> uidReciverFromUrl');
        this.setUidConvSelected(this.uidReciverFromUrl);
        this.databaseProvider.setUidLastOpenConversation(this.uidConvSelected);
        this.openArchivedConversationsPage();
        // let TEMP = getParameterByName('recipientFullname');
        // if (!TEMP) {
        //   TEMP = this.uidReciverFromUrl;
        // }
        // this.navProxy.pushDetail(DettaglioConversazionePage, {
        //   conversationWith: this.uidConvSelected,
        //   conversationWithFullname: TEMP
        // });
        this.uidReciverFromUrl = null;
        this.showPlaceholder = false;
      } 
    }
  }

  /** 
   * ::: subscribeUidConvSelectedChanged :::
   * evento richiamato quando si seleziona un utente nell'elenco degli user 
   * apro dettaglio conversazione 
  */
  subscribeUidConvSelectedChanged = (uidConvSelected: string, type: string) => {
    this.checkMessageListIsOpen(uidConvSelected, type);
  }
  
  /** 
   * ::: subscribeLoggedUserLogout :::
   * effettuato il logout:
   * 1 - mostro placeholder
   * 2 - resetto array conversazioni
   * 3 - mostro modale login
   * 4 - resetto conversationWith
  */
  subscribeLoggedUserLogout = () => {
    console.log('************** subscribeLoggedUserLogout');
    this.conversations = [];
    this.profileModal.present();
    this.uidConvSelected = null;
  }
  //------------------------------------------------------------------//


  //------------------------------------------------------------------//
  // BEGIN FUNCTIONS
  //------------------------------------------------------------------//
  /**
   * ::: checkMessageListIsOpen :::
   * se la conversazione selezionata NON è già aperta e mi trovo nella versione tablet/desk (>767)
   * imposto uidConvSelected
   * apro dettaglio conversazione
   * @param uidConvSelected 
   */
  checkMessageListIsOpen(uidConvSelected, type?) {
    if (uidConvSelected !== this.uidConvSelected && windowsMatchMedia()) {
      this.setUidConvSelected(uidConvSelected);
      this.openMessageList(type);
    }
  }

  /**
   * ::: setUidConvSelected :::
   * @param uidConvSelected 
   */
  setUidConvSelected(uidConvSelected?: string) {
    this.uidConvSelected = uidConvSelected;
    this.chatConversationsHandler.uidConvSelected = uidConvSelected;
  }

  /**
   * ::: openMessageList :::
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
    console.log('openMessageList:: >>>> conversationSelected ', that.uidConvSelected);
    setTimeout(function () {
      const conversationSelected = that.conversations.find(item => item.uid === that.uidConvSelected);
      if (conversationSelected) {
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
      } else if (!type) {
        if (windowsMatchMedia()) {
          that.navProxy.pushDetail(PlaceholderPage, {});
        }
      }
    }, 0);
    // if the conversation from the isConversationClosingMap is waiting to be closed 
    // deny the click on the conversation
    if (this.tiledeskConversationProvider.getClosingConversation(this.uidConvSelected)) return;
  }
  //------------------------------------------------------------------//


  //------------------------------------------------------------------//
  // BEGIN ACTIONS
  //------------------------------------------------------------------//
  /**
   * ::: goToChat :::
   * 1 - invocato dalla pagina html alla selezione di una conversazione
   * imposta conversazione attiva nella pagina elenco conversazioni e 
   * pubblica id della conversazione selezionata
   * @param conversationWith 
   */
  goToChat(conversationWith: string, conversationWithFullname: string) {
    console.log('**************** goToChat conversationWith:: ', conversationWith);
    this.events.publish('uidConvSelected:changed', conversationWith, 'new');
  }

  /**
  * ::: openUsersList :::
  * apro pagina elenco users 
  * (metodo richiamato da html) 
  */
  private openUsersList(event: any) {
    this.navCtrl.push(UsersPage, {
      contacts: "",
      'tenant': this.tenant,
      'loggedUser': this.loggedUser
    });
  }

  /**
  * ::: presentPopover :::
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
   * ::: openArchivedConversationsPage :::
   * Open the archived conversations page
   * (metodo richiamato da html) 
   */
  private openArchivedConversationsPage() {
    this.navCtrl.push(ArchivedConversationsPage, {
      'archivedConversations': this.archivedConversations,
      'tenant': this.tenant,
      'loggedUser': this.loggedUser
    });
  }

  /**
   * ::: logOut :::
   * modulo richiamato se premo su logout
   * 1 - aggiungo placeholderPage 
   * 2 - richiamo il logout di firebase
   */
  private logOut() {
    //this.navProxy.pushDetail(PlaceholderPage,{});
    this.userService.logoutUser();
  }

  /**
   * ::: checkLoadingIsActive :::
   * metodo mostra un placeholder di benvenuto se non ci sono conversazioni
   * ritardato dopo 5 sec per dare il tempo di caricare lo storico delle conversazioni
   * dallo storage locale o da remoto
   * (metodo richiamato da html) 
   */
  private checkLoadingIsActive(time: number) {
    const that = this;
    setTimeout(function () {
      that.loadingIsActive = false;
    }, time);
  }

  /**
   * ::: closeConversation :::
   * chiudo conversazione
   * (metodo richiamato da html) 
   * the conversationId is:
   * - se è una conversazione diretta: elimino conversazione 
   * - se è una conversazione di gruppo: chiudo conversazione 
   * @param conversation 
   * https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
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
    } else {
      this.closeSupportGroup(conversationId, function (result: string, data: any) {
        if (result === 'success') {
          console.log("ListaConversazioniPage::closeConversation::closeSupportGroup::response", data);
        } else if (result === 'error') {
          console.error("ListaConversazioniPage::closeConversation::closeSupportGroup::error", data);
        }
      });
    }
  }

  /**
   * ::: closeSupportGroup :::
   * 1 - rimuovo l'handler della conversazione
   * imposto la conversazione (isConversationClosingMap) come una conversazione in attesa di essere chiusa 
   * chiudo gruppo
   * @param groupId 
   * @param callback 
   * close the support group
   * https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#close-support-group
   */
  private closeSupportGroup(groupId, callback) {
    var that = this;
    // BEGIN -  REMOVE FROM LOCAL MEMORY 
    this.conversationsHandler.removeByUid(groupId);
    // END -  REMOVE FROM LOCAL MEMORY 

    // BEGIN - REMOVE FROM REMOTE 
    // set the conversation from the isConversationClosingMap that is waiting to be closed
    this.tiledeskConversationProvider.setClosingConversation(groupId, true);
    // close group
    this.groupService.closeGroup(groupId, function (response, error) {
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
  
  /**
   * ::: deleteConversation :::
   * 1 - rimuovo l'handler della conversazione
   * imposto la conversazione (isConversationClosingMap) come una conversazione in attesa di essere chiusa 
   * cancello la conversazione
   * @param conversationId 
   * @param callback 
   * more details availables at 
   * https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
   */
  private deleteConversation(conversationId, callback) {
    var that = this;
    // END - REMOVE FROM LOCAL MEMORY 
    this.conversationsHandler.removeByUid(conversationId); // remove the item 
    // END - REMOVE FROM LOCAL MEMORY 

    // BEGIN - REMOVE FROM REMOTE 
    // set the conversation from the isConversationClosingMap that is waiting to be closed
    this.tiledeskConversationProvider.setClosingConversation(conversationId, true);
    // delete a conversation form the personal timeline
    this.tiledeskConversationProvider.deleteConversation(conversationId, function (response, error) {
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
  //------------------------------------------------------------------//

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
  // openConversationInPageDetail() {
  //   var that = this;
  //   let uidReciverFromUrlTEMP = getParameterByName('recipient');
  //   if (uidReciverFromUrlTEMP) {
  //     that.uidReciverFromUrl = uidReciverFromUrlTEMP;
  //     console.log('LISTA CONVERSAZIONI »»»»»»»»» openConversationInPageDetail - uidReciverFromUrl: ', that.uidReciverFromUrl);
  //   }
  //   let recipientFullnameTEMP = getParameterByName('recipientFullname');
  //   if (!recipientFullnameTEMP) {
  //     recipientFullnameTEMP = uidReciverFromUrlTEMP;
  //   }
  //   if (that.uidReciverFromUrl && windowsMatchMedia()) {
  //     this.events.subscribe('loggedUser:login', (user) => {
  //       // user and time are the same arguments passed in `events.publish(user, time)`
  //       console.log('LISTA CONVERSAZIONI Welcome user: ', user );
  //       that.goToChat(uidReciverFromUrlTEMP, recipientFullnameTEMP);
  //     });
  //   }
  // }

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
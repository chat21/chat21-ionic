import { Component, NgZone } from '@angular/core';
import { Events, PopoverController, IonicPage, NavController, NavParams, ModalController, Modal, AlertController } from 'ionic-angular';
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
import { CURR_VER_PROD, CURR_VER_DEV, TYPE_POPUP_LIST_CONVERSATIONS } from '../../utils/constants';
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

@IonicPage()
@Component({
  selector: 'page-lista-conversazioni',
  templateUrl: 'lista-conversazioni.html',
})
export class ListaConversazioniPage extends _MasterPage {
  private conversations: Array<ConversationModel> = [];
  private archivedConversations: ConversationModel[];

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
    public databaseProvider: DatabaseProvider,
    private groupService: GroupService,
    private tiledeskConversationProvider: TiledeskConversationProvider,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private chatArchivedConversationsHandler: ChatArchivedConversationsHandler
  ) {
    super();
    this.BUILD_VERSION = 'v.' + CURR_VER_PROD + ' b.' + CURR_VER_DEV; // 'b.0.5';

    // /** RECUPERO ID CONVERSAZIONE
    // * se vengo da dettaglio conversazione
    // * o da users con conversazione attiva recupero conversationWith
    // * //this.conversationWith = navParams.get('conversationWith');
    // */
    this.uidConvSelected = navParams.get('conversationWith');
    this.openMessageList(this.uidConvSelected);

    /** RECUPERO IL RECIPIENTID 
    * nel caso in cui viene pasato nell'url della pagina
    * per aprire una conversazione
    * 
    * USARE getParameterByName(name) del widget
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


  ionViewDidEnter(){
    /** RECUPERO ID CONVERSAZIONE
    * se vengo da dettaglio conversazione
    * o da users con conversazione attiva recupero conversationWith
    * //this.conversationWith = navParams.get('conversationWith');
    */
   //this.uidConvSelected = this.navParams.get('conversationWith');
   //this.openMessageList(this.uidConvSelected);
  }
  


  //// SUBSCRIBTIONS ////
  /** */
  initSubscriptions() {
    console.log('************** initSubscriptions ***********************');
    this.events.subscribe('conversationsAdd', this.subscribeConversationsAdd);
    this.events.subscribe('loggedUser:login', this.subscribeLoggedUserLogin);
    this.events.subscribe('loggedUser:logout', this.subscribeLoggedUserLogout);
    this.events.subscribe('uidConvSelected:changed', this.subscribeUidConvSelectedChanged);
    // this.events.subscribe('conversations:changed', this.subscribeConversationsChanged);
  }

  
  /** subscribeUidConvSelectedChanged
   * quando si clicca su una conversazione (si seleziona) 
   * apro elenco conversazione maessaggi 
  */
  subscribeUidConvSelectedChanged: any = uidConvSelected => {
    console.log('************** subscribeUidConvSelectedChanged', uidConvSelected);
    this.checkMessageListIsOpen(uidConvSelected);
  }

  /** subscribeLoggedUserLogin
   * effettuato il login: 
   * 1 - dismetto modale
   * 2 - carico lista conversazioni
   * 3 - se non ci sono conversazioni carico placeholder
  */
  subscribeLoggedUserLogin: any = (user) => {
    console.log('************** subscribeLoggedUserLogin', user);
    this.profileModal.dismiss({ animate: false, duration: 0 });
    this.loadListConversations();
  }

  /** subscribeLoggedUserLogout
   * effettuato il logout:
   * 1 - mostro placeholder
   * 2 - resetto array conversazioni
   * 3 - mostro modale login
   * 4 - resetto conversationWith
  */
  subscribeLoggedUserLogout: any = (user) => {
    console.log('************** subscribeLoggedUserLogout', user);
    this.conversations = [];
    this.profileModal.present();
    //this.conversationWith = null;
    this.uidConvSelected = null;
  }

  subscribeConversationsAdd: any = (conversation) => {
    console.log('************** subscribeConversationsAdd');
    if(this.uidConvSelected == conversation.uid){
      this.events.unsubscribe('conversationsAdd', null);
      this.showDetailConversation();
    }
  }

  // private subscribeConversationsChanged: any = (conversations : ConversationModel[]) => {
  //   console.log('ListaConversazioniPage::subscribeConversationsChanged::conversationsconversations:', conversations);
  //   this.conversations = conversations;
  // }

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
    if (this.uidReciverFromUrl) {
      this.uidConvSelected = this.uidReciverFromUrl;
      this.chatConversationsHandler.uidConvSelected = this.uidConvSelected;
      this.uidReciverFromUrl = null;
      this.initConversationsHandler();
    } else {
      const that = this;
      this.databaseProvider.getUidLastOpenConversation()
        .then(function (uid) {
          console.log('getUidLastOpenConversation:: ' + uid + 'that.uidReciverFromUrl:: ' + that.uidReciverFromUrl);
          that.uidConvSelected = uid;
          that.initConversationsHandler();
        })
        .catch((error) => {
          console.log("error::: ", error);
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
  openMessageList(uidConvSelected) {
    console.log('openMessageList::');
    // if the conversation from the isConversationClosingMap is waiting to be closed 
    // deny the click on the conversation
    if (this.tiledeskConversationProvider.getClosingConversation(uidConvSelected)) return;
    this.uidConvSelected = uidConvSelected;
    this.chatConversationsHandler.uidConvSelected = uidConvSelected;
    const that = this;
    setTimeout(function () {
      var conversationSelected = that.conversations.find(item => item.uid === uidConvSelected);
      if (conversationSelected) {
        console.log('conversationSelected: ', conversationSelected);
        conversationSelected.is_new = false;
        that.conversationsHandler.setConversationRead(conversationSelected.uid);
        conversationSelected.status = '0';
        conversationSelected.selected = true;
        that.navProxy.pushDetail(DettaglioConversazionePage, {
          conversationSelected: conversationSelected,
          conversationWith: uidConvSelected,
          conversationWithFullname: conversationSelected.conversation_with_fullname,
          channel_type: conversationSelected.channel_type
        });
        that.databaseProvider.setUidLastOpenConversation(uidConvSelected);
      }
      //that.conversationWith = uidConvSelected;
    }, 0);
  }

  /**
   * 
   * @param uidConvSelected 
   */
  checkMessageListIsOpen(uidConvSelected) {
    console.log('-------------> checkMessageListIsOpen ', uidConvSelected);
    if (uidConvSelected === this.uidConvSelected && windowsMatchMedia()) {
      console.log("ListaConversazioniPage::checkMessageListIsOpen::if::uidConvSelected", uidConvSelected, "this_uidConvSelected", this.uidConvSelected);
      return;
    } else {
      console.log("ListaConversazioniPage::checkMessageListIsOpen::else::uidConvSelected", uidConvSelected);
      this.openMessageList(uidConvSelected);
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
    let tempArchviedConversationsHandler = this.chatManager.archivedConversationsHandler;;
    if (!handler) {
      console.log('handler NON ESISTE ::');
      handler = this.chatConversationsHandler.initWithTenant(tenant, loggedUser);
      tempArchviedConversationsHandler = this.chatArchivedConversationsHandler.initWithTenant(tenant, loggedUser);
      this.chatManager.setConversationsHandler(handler);
      handler.connect();
      tempArchviedConversationsHandler.connect();
      handler.uidConvSelected = this.uidConvSelected
      this.conversationsHandler = handler;
      this.chatArchivedConversationsHandler = tempArchviedConversationsHandler;
      console.log('handler.conversations ::'+handler.conversations);
      this.conversations = handler.conversations;
      this.archivedConversations = tempArchviedConversationsHandler.conversations;
      this.showDetailConversation();
      // // attach the archived conversations provider
      // this.archivedConversationsProvider.getInstance().init(tenant, loggedUser);
      // this.archivedConversationsProvider.getInstance().connect();
      // this.archivedConversations = this.archivedConversationsProvider.getArchviedConversations();
    } else {
      console.log('handler ESISTE ::', handler);
      this.conversationsHandler = handler;
      this.chatArchivedConversationsHandler = tempArchviedConversationsHandler;
      this.showDetailConversation();
    }

    //this.navProxy.isOn = true;
    //
    // if(this.conversations.length <= 0){
    //   this.navProxy.pushDetail(PlaceholderPage,{});
    // }

  }



  showDetailConversation(){
    //console.log('plt::', windowsMatchMedia());
    if (this.uidConvSelected) {
      console.log('openMessageList 1 ::');
      // se visualizzazione è desktop
      if (windowsMatchMedia()) {
        this.openMessageList(this.uidConvSelected);
      }
    } else if (this.conversations.length > 0) {
      console.log('openMessageList 2 ::');
      this.uidConvSelected = this.conversations[0].uid;
      // se visualizzazione è desktop
      if (windowsMatchMedia()) {
        this.openMessageList(this.uidConvSelected);
      }
    }
    else {
      console.log('openMessageList 3 ::');
      // se visualizzazione è desktop
      if (windowsMatchMedia()) {
        this.navProxy.pushDetail(PlaceholderPage, {});
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
   * Open the archived conversations page
   */
  private openArchivedConversationsPage() {
    // console.log("ListaConversazioniPage::openArchivedConversationsPage::archivedConversations:", this.archivedConversations)
    this.navCtrl.push(ArchivedConversationsPage,
      {
        "archivedConversations" :  this.archivedConversations
      }
    );
  }

  /**
  * apro il menu delle opzioni 
  * (metodo richiamato da html) 
  * alla chiusura controllo su quale opzione ho premuto e attivo l'azione corrispondete
  */
  presentPopover(event) {
    let popover = this.popoverCtrl.create(PopoverPage, { typePopup: TYPE_POPUP_LIST_CONVERSATIONS });
    popover.present({
      ev: event
    });
    popover.onDidDismiss((data: string) => {
      console.log(" ********* data::: ", data);
      if (data == 'logOut') {
        this.logOut();
      } else if (data == 'ProfilePage') {
        if (this.chatManager.getLoggedUser()) {
          this.navCtrl.push(ProfilePage);
        }
      } else if (data == "ArchivedConversationsPage") {
        this.openArchivedConversationsPage();
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


  loadingIsActive() {
    // if(this.conversations && this.conversations.length>0){
    //   return true;
    // } else {
    //   return false;
    // }

    var conv = JSON.stringify(this.conversations);
    // console.log("ListaConversazioniPage::loadingIsActive::conversations", conv);

    return conv && conv.length > 0;
  }

  private closeConversation(conversation) {
    console.log("ListaConversazioniPage::closeConversation::conversation", conversation);

    var conversationId = conversation.uid;
    // console.log("ListaConversazioniPage::closeConversation::conversationId", conversationId);

    var isSupportConversation = conversationId.startsWith("support-group");
    // console.log("ListaConversazioniPage::closeConversation::isSupportConversation", isSupportConversation);

    if (!isSupportConversation) {
      console.log("ListaConversazioniPage::closeConversation:: is not a support group");

      this.deleteConversation(conversationId, function (result, data) {
        if (result === 'success') {
          console.log("ListaConversazioniPage::closeConversation::deleteConversation::response", data);
          // console.log("ListaConversazioniPage::closeConversation::deleteConversation::response::conversation::", conversation);
        } else if (result === 'error') {
          console.error("ListaConversazioniPage::closeConversation::deleteConversation::error", data);
          // console.error("ListaConversazioniPage::closeConversation::deleteConversation::error::conversation::", conversation);
        }
      });

      // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
    } else {
      console.log("ListaConversazioniPage::closeConversation::closeConversation:: is a support group");

      // the conversationId is:
      // - the recipientId if it is a direct conversation;
      // - the groupId if it is a group conversation;
      // the groupId can reference:
      // - a normal group;
      // - a support  group if it starts with "support-group"
      this.closeSupportGroup(conversationId, function (result, data) {
        if (result === 'success') {
          console.log("ListaConversazioniPage::closeConversation::closeSupportGroup::response", data);
          // console.log("ListaConversazioniPage::closeConversation::closeSupportGroup::response::conversation::", conversation);

        } else if (result === 'error') {
          console.error("ListaConversazioniPage::closeConversation::closeSupportGroup::error", data);
          // console.error("ListaConversazioniPage::closeConversation::closeSupportGroup::error::conversation::", conversation);
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
    // console.log("performClosingConversation::conversations::BEFORE", JSON.stringify(this.conversationsHandler.conversations) )
    this.conversationsHandler.removeByUid(groupId); // remove the item 
    this.conversations = this.conversationsHandler.conversations; // update conversations
    // console.log("performClosingConversation::conversations::AFTER", JSON.stringify(this.conversationsHandler.conversations))
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
      // .subscribe(response => {
      //   callback('success', response);
      // }, errMsg => {
      //   // the conversation closing failed: restore the conversation with
      //   // conversationId status to false within the isConversationClosingMap
      //   that.tiledeskConversationProvider.setClosingConversation(groupId, false);
      //   callback('error', errMsg);
      // }, () => {
      //   console.log("ListaConversazioniPage::closeSupportGroup::completition");
      // });
    // END - REMOVE FROM REMOTE 

    // when a conversations is closed shows a placeholder background
    if (groupId === that.uidConvSelected) {
      that.navProxy.pushDetail(PlaceholderPage, {});
    }
  }

  // delete a conversation form the personal timeline
  // more details availables at 
  // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
  private deleteConversation(conversationId, callback) {
    // console.log("ListaConversazioniPage::deleteConversation::conversationId", conversationId);

    var that = this;

    // END - REMOVE FROM LOCAL MEMORY 
    // console.log("deleteConversation::conversations::BEFORE", JSON.stringify(this.conversationsHandler.conversations))
    this.conversationsHandler.removeByUid(conversationId); // remove the item 
    this.conversations = this.conversationsHandler.conversations; // update conversations
    // console.log("deleteConversation::conversations::AFTER", JSON.stringify(this.conversationsHandler.conversations))
    // END - REMOVE FROM LOCAL MEMORY 

    // BEGIN - REMOVE FROM REMOTE 
    //set the conversation from the isConversationClosingMap that is waiting to be closed
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
    //   .subscribe(response => {
    //     callback('success', response);
    //   }, errMsg => {
    //     // the conversation closing failed: restore the conversation with
    //     // conversationId status to false within the isConversationClosingMap
    //     that.tiledeskConversationProvider.setClosingConversation(conversationId, false);
    //     callback('error', errMsg);
    //   }, () => {
    //     console.log("ListaConversazioniPage::deleteConversation::completition");
    //   });
    // // END - REMOVE FROM REMOTE 

    // when a conversations is closed shows a placeholder background
    if (conversationId === that.uidConvSelected) {
      that.navProxy.pushDetail(PlaceholderPage, {});
    }
  }

  // avatarPlaceholder(conversation_with_fullname) {
  //   var arrayName = conversation_with_fullname.split(" ");
  //   var initials = '';
  //   arrayName.forEach(member => {
  //     if(member.trim().length > 1 && initials.length < 3){
  //       initials += member.substring(0,1).toUpperCase();
  //     }
  //   });
  //   return initials;
  // }

  // getColorBck(){
  //   var arrayBckColor = ['#fba76f', '#80d066', '#73cdd0', '#ecd074', '#6fb1e4', '#f98bae'];
  //   var num = Math.floor(Math.random() * 6);
  //   return arrayBckColor[num];
  // }


  

}
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';

// models
import { UserModel } from '../../models/user';

// handlers
import { ChatConversationHandler } from '../chat-conversation-handler';
import { ChatConversationsHandler } from '../chat-conversations-handler';
import { ChatArchivedConversationsHandler } from '../chat-archived-conversations-handler';
import { ChatContactsSynchronizer } from '../chat-contacts-synchronizer';

// utils
import { isHostname } from '../../utils/utils';


/*
  Generated class for the ChatManagerProvider provider.
  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
/**
 * CHAT MANAGER ...
 */
export class ChatManager {
  private tenant: string;
  public handlers: ChatConversationHandler[];
  private loggedUser: UserModel;
  public conversationsHandler: ChatConversationsHandler;
  public archivedConversationsHandler: ChatArchivedConversationsHandler;
  public contactsSynchronizer: ChatContactsSynchronizer;
  public openInfoConversation: boolean;


  constructor(
    public events: Events,
    public chatContactsSynchronizer: ChatContactsSynchronizer
  ) {
    this.init();
  }
  /**
   * inizializza chatmanager
   */
  init(){
    this.handlers = [];
    this.openInfoConversation = true;
    console.log('************* init  ***', this.handlers);
  }
  /**
   * ritorna istanza di chatmanager
   */
  getInstance() {
    return this;
  }
  /**
   * configura App: chiamato da app.component
   * setto tenant
   * setto loggedUser
   * @param app_id 
   */
  configureWithAppId(app_id) {
    this.tenant = app_id;
    this.loggedUser = null;
    this.handlers = [];
  }

  // onOpenCloseInfoConversation(){
  //   this.openInfoConversation = !this.openInfoConversation;
  // }
  /**
   * return tenant
   */
  getTenant(): string {
    return this.tenant;
  }
  /**
   * return current user detail
   */
  getLoggedUser(): UserModel {
    return this.loggedUser;
  }

  /**
   * 
   */
  getOpenInfoConversation(): boolean {
    return this.openInfoConversation;
  }
  /**
   * dispose all references
   * dispose refereces messaggi di ogni conversazione
   * dispose reference conversazioni
   * dispose reference sincronizzazione contatti
   */
  dispose(){
    console.log(" 1 - setOffAllReferences");
    this.setOffAllReferences();
    console.log(" 2 - disposeConversationsHandler");
    if(this.conversationsHandler){this.disposeConversationsHandler();}
    console.log(" 3 - disposeArchivedConversationsHandler");
    if (this.archivedConversationsHandler) { this.disposeConversationsHandler(); }
    console.log(" 4 - disposeContactsSynchronizer");
    if(this.contactsSynchronizer){this.disposeContactsSynchronizer();}
    console.log(" OKK ");
    this.conversationsHandler = null;
    this.contactsSynchronizer = null;
  }

  /**
   * invocato da user.ts al LOGIN:
   * LOGIN:
   * 1 - imposto lo stato di connessione utente
   * 2 - aggiungo il token
   * 3 - pubblico stato loggedUser come login
   */
  goOnLine(user){
    this.loggedUser = user;
    // console.log(" 1 - IMPOSTO STATO CONNESSO UTENTE ");
    // //this.chatPresenceHandler.setupMyPresence(user.uid);
    // console.log(" 2 - AGGIORNO IL TOKEN ::: ", user);
    // //this.msgService.getToken(user);
    //console.log(" 3 - PUBBLICO STATO LOGGEDUSER: LOGIN");
    //this.conversationsHandler = this.chatConversationsHandler.initWithTenant(this.tenant, this.loggedUser);
    if(isHostname() === false) {
      console.log(" goOnLine: isHostname", isHostname());
      this.initContactsSynchronizer();
    }
    this.events.publish('loggedUser:login', this.loggedUser);
  }

  private newMethod() {
    return false;
  }

  /**
   * invocato da user.ts al LOGOUT:
   * 1 - cancello tutte le references
   * 2 - pubblico stato loggedUser come logout
   */
  goOffLine(){
    this.loggedUser = null;
    console.log(" 1 - CANCELLO TUTTE LE REFERENCES DI FIREBASE");
    //console.log(" 2 - CANCELLO L'UTENTE DAL NODO PRESENZE");
    //this.chatPresenceHandler.goOffline();
    //console.log(" 3 - RIMUOVO IL TOKEN");
    //this.msgService.removeToken();
    this.dispose();
    console.log(" 4 - PUBBLICO STATO LOGGEDUSER: LOGOUT");
    this.events.publish('loggedUser:logout', null);
  }

  /// START metodi gestione messaggi conversazione ////
  /**
   * aggiungo la conversazione all'array delle conversazioni
   * chiamato dall'inizialize di dettaglio-conversazione.ts
   * @param handler 
   */
  addConversationHandler(handler) {
    console.log(" -----> addConversationHandler",handler);
    this.handlers.push(handler);
  }
  /**
   * rimuovo dall'array degli handlers delle conversazioni una conversazione
   * al momento non è utilizzato!!!
   * @param conversationId 
   */
  removeConversationHandler(conversationId) {
    console.log(" -----> removeConversationHandler: ",conversationId);
    const index = this.handlers.findIndex(i => i.conversationWith === conversationId); 
    this.handlers.splice(index, 1);
  }
  /**
   * cerco e ritorno una conversazione dall'array delle conversazioni
   * con conversationId coincidente con conversationId passato
   * chiamato dall'inizialize di dettaglio-conversazione.ts
   * @param conversationId 
   */
  getConversationHandlerByConversationId(conversationId):any {
    const resultArray =  this.handlers.filter(function(handler) {
      console.log('FILTRO::: ***', conversationId, handler.conversationWith);
      return handler.conversationWith == conversationId;
    });
    console.log('getConversationHandlerByConversationId ***', conversationId, resultArray, this.handlers);
    if (resultArray.length == 0){
      return null;
    }
    return resultArray[0];
    //return this.handlers.find(item => item.conversationWith == conversationId);
  }
  /**
   * elimino tutti gli hendler presenti nell'array handlers
   * dopo aver cancellato la reference per ogni handlers
   */
  setOffAllReferences(){
    this.handlers.forEach(function(data) {
      let item = data.messagesRef;
      item.ref.off();
    });
    this.handlers = [];
  }
  /// END metodi gestione messaggi conversazione ////

  /// START metodi gestione conversazioni ////
  /**
   * Salvo il CONVERSATIONS handler dopo averlo creato nella lista conversazioni
   * @param handler 
   */
  setConversationsHandler(handler){
    this.conversationsHandler = handler;
  }
  /**
   * elimino la reference dell'handler delle conversazioni
   */
  disposeConversationsHandler(){
    console.log(" 2 - this.conversationsHandler:: ", this.conversationsHandler);
    this.conversationsHandler.dispose();
  }
  /// END metodi gestione conversazioni ////

  /// START metodi sincronizzazione contatti ////
  /**
   * creo handler sincronizzazione contatti se ancora nn esiste
   * inizio la sincronizzazione
   */
  initContactsSynchronizer() {
    console.log(" initContactsSynchronizer:: ", this.contactsSynchronizer, this.tenant, this.loggedUser);
    if (!this.contactsSynchronizer) {
      this.contactsSynchronizer = this.chatContactsSynchronizer.initWithTenant(this.tenant, this.loggedUser);
      //this.contactsSynchronizer = this.createContactsSynchronizerForUser();
        this.contactsSynchronizer.startSynchro();
    } else {
        this.contactsSynchronizer.startSynchro();
    }
  }
  /**
   * elimino la reference dell'handler della sincronizzazione contatti
   */
  disposeContactsSynchronizer(){
    this.contactsSynchronizer.dispose();
  }
  /// END metodi sincronizzazione contatti ////

  

}

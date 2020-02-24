import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { ConversationModel } from '../../models/conversation';
import { convertMessage } from '../../utils/utils';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
import { NavProxyService } from '../../providers/nav-proxy';
import { DatabaseProvider } from '../../providers/database/database';
import { UserModel } from '../../models/user';

@IonicPage()
@Component({
  selector: 'page-archived-conversations',
  templateUrl: 'archived-conversations.html',
})
export class ArchivedConversationsPage {
  private loggedUser: UserModel;
  private tenant: string;

  // the list of th archived conversations
  private archivedConversations: ConversationModel[];
  private conversationSelected: ConversationModel;

  // used within the html template
  private convertMessage = convertMessage;

  private areArchivedConversationsAvailable : boolean;
  private uidConvSelected : string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private navProxy: NavProxyService,
    private databaseProvider: DatabaseProvider,
    private events: Events
  ) {
    this.areArchivedConversationsAvailable = false;
    this.tenant = navParams.get('tenant');
    this.loggedUser = navParams.get('loggedUser');
    this.databaseProvider.initialize(this.loggedUser, this.tenant);
    const that = this;
    this.databaseProvider.getUidLastOpenConversation()
    .then(function (uid: string) {
      that.uidConvSelected = uid;
      that.inizialize();
    })
    .catch((error: any) => {
      console.log("error::: ", error);
    });
  }

  ionViewDidEnter(){
    console.log('ArchivedConversationsPage ionViewDidEnter');
    if(this.uidConvSelected){
      this.inizialize();
    }
  }

  ionViewWillUnload() {
    this.archivedConversations = []; // clear the archived conversations list
  }

  inizialize(){
    console.log('ArchivedConversationsPage this.uidConvSelected::', this.uidConvSelected);
    // get the list of archived conversations from the navigation and preload the archived conversations list
    this.archivedConversations = this.navParams.get('archivedConversations');
    // update the archvied conversations availability
    this.areArchivedConversationsAvailable = this.archivedConversations && this.archivedConversations.length > 0;
    this.openMessageList(this.archivedConversations[this.uidConvSelected]);
  }

  
  // click on a single conversation
  private onArchivedConversationClicked(archivedConversation) {
    // set the current conversation selected within the ui
    this.uidConvSelected = archivedConversation.uid;
    // // popping the current page
    // this.navCtrl.pop().then(() => {
    // open the new page
    this.openMessageList(archivedConversation);
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
  openMessageList(archivedConversation) {
    const that = this;
    setTimeout(function () {
      const archivedConversation = that.archivedConversations.find(item => item.uid === that.uidConvSelected);
      if (archivedConversation) {
      //if (archivedConversation) {
        archivedConversation.is_new = false;
        archivedConversation.status = '0';
        archivedConversation.selected = true;
        that.navProxy.pushDetail(DettaglioConversazionePage, {
          conversationWith: archivedConversation.uid,
          conversationWithFullname: archivedConversation.conversation_with_fullname,
          channel_type: archivedConversation.channel_type
        });
        that.databaseProvider.setUidLastOpenConversation(archivedConversation.uid);
        that.events.publish('uidConvSelected:changed', archivedConversation.uid, 'archived');
        that.conversationSelected = archivedConversation;
      }
    }, 0);
  }


}
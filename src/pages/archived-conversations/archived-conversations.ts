import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { ConversationModel } from '../../models/conversation';
import { convertMessage } from '../../utils/utils';
import { DettaglioConversazionePage } from '../dettaglio-conversazione/dettaglio-conversazione';
import { NavProxyService } from '../../providers/nav-proxy';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage()
@Component({
  selector: 'page-archived-conversations',
  templateUrl: 'archived-conversations.html',
})
export class ArchivedConversationsPage {

  // the list of th archived conversations
  private archivedConversations : ConversationModel[];

  // used within the html template
  convertMessage = convertMessage;

  private areArchivedConversationsAvailable : boolean;

  private uidConvSelected : string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private navProxy: NavProxyService,
    private databaseProvider: DatabaseProvider,
    private events: Events,
  ) {
    this.areArchivedConversationsAvailable = false; // default value
  }

  ionViewDidLoad() {
   
    // get the list of archived conversations from the navigation and preload the archived conversations list
    this.archivedConversations = this.navParams.get('archivedConversations');
    // console.log("ArchivedConversationsPage::ionViewDidLoad::archivedConversations:", archivedConversations);

    // update the archvied conversations availability
    this.areArchivedConversationsAvailable = this.archivedConversations && this.archivedConversations.length > 0;
    // console.log("ArchivedConversationsPage::ionViewDidLoad::areArchivedConversationsAvailable:", this.areArchivedConversationsAvailable);
  }

  ionViewWillUnload() {
    this.archivedConversations = []; // clear the archived conversations list
  }

  // click on a single conversation
  private onArchivedConversationClicked(archivedConversation) {
    console.log("ArchivedConversationsPage::onArchivedConversationClicked::archivedConversation:", archivedConversation);

    var that = this;

    // set the current conversation selected within the ui
    this.uidConvSelected = archivedConversation.uid;

    // // popping the current page
    // this.navCtrl.pop().then(() => {

      // open the new page
      that.openMessageList(archivedConversation);

    // }, (err) => {
    //   // something didn't work
    //   console.error(err);
    // });
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
    // setTimeout(function () {
      if (archivedConversation) {

        archivedConversation.is_new = false;

        archivedConversation.status = '0';
        archivedConversation.selected = true;
        that.navProxy.pushDetail(DettaglioConversazionePage, {
          conversationWith: archivedConversation.uid,
          conversationWithFullname: archivedConversation.conversation_with_fullname,
          channel_type: archivedConversation.channel_type
        });
        that.databaseProvider.setUidLastOpenConversation(archivedConversation.uid);
        that.events.publish('uidConvSelected:changed', archivedConversation.uid);
      }
    // }, 1000);
  }

}
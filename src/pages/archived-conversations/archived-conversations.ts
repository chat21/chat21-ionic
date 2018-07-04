import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ArchivedConversationsProvider } from '../../providers/archived-conversations/archived-conversations';
import { ConversationModel } from '../../models/conversation';
import { ChatManager } from '../../providers/chat-manager/chat-manager';

@IonicPage()
@Component({
  selector: 'page-archived-conversations',
  templateUrl: 'archived-conversations.html',
})
export class ArchivedConversationsPage {

  private archivedConversations : ConversationModel[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private archivedConversationsProvider : ArchivedConversationsProvider,
    private chatManager : ChatManager
  ) {

    // // get the list of archived conversations from the navigation and preload the archived conversations list
    // this.archivedConversations = this.navParams.get('archivedConversations');
    // // console.log("ArchivedConversationsPage::constructor::archivedConversations:", this.archivedConversations);

    // init the provider
    this.archivedConversationsProvider.getInstance().init(this.chatManager.getTenant(), this.chatManager.getLoggedUser());

    // attach the provider
    this.archivedConversationsProvider.getInstance().connect();

  }

  ionViewDidLoad() {
    // update the list of archived conversations from the provider
    this.archivedConversations = this.archivedConversationsProvider.getArchviedConversations();
    // console.log("ArchivedConversationsPage::ionViewDidLoad::archivedConversations:", this.archivedConversations);
  }

  ionViewWillUnload() {
    // detach the archived conversation provider
    this.archivedConversationsProvider.dispose();
  }

  ionViewDidLeave() {
    // detach the archived conversation provider
    this.archivedConversationsProvider.dispose();
  }

  private onArchivedConversationClicked(archivedConversation) {
    console.log("ArchivedConversationsPage::onArchivedConversationClicked::archivedConversation:", archivedConversation);
  }

}

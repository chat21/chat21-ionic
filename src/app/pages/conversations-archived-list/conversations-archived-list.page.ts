import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { DatabaseProvider } from './../../services/database';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { NavProxyService } from 'src/app/services/nav-proxy.service';
// utils
import { checkPlatformIsMobile } from '../../../chat21-core/utils/utils';
import { Router } from '@angular/router';
@Component({
  selector: 'app-conversations-archived-list',
  templateUrl: './conversations-archived-list.page.html',
  styleUrls: ['./conversations-archived-list.page.scss'],
})
export class ConversationsArchivedListPage implements OnInit {

  @Input() listConversations: Array<ConversationModel>;
  @Input() limit?: number
  @Input() styleMap: Map<string, string>;
  @Input() translationMap: Map< string, string>;

  public uidConvSelected: string;
  public conversationSelected: ConversationModel;

  constructor(private modalController: ModalController,
              private navService: NavProxyService,
              private router: Router,
              private databaseProvider: DatabaseProvider,
              private archivedConversationsHandlerService: ArchivedConversationsHandlerService) { }

  ngOnInit() {
    console.log('conversationnn', this.translationMap)
  }

  /** */
  async onClose() {
    const isModalOpened = await this.modalController.getTop();
    if (isModalOpened) {
      this.modalController.dismiss({ confirmed: true });
    } else {
      this.navService.pop();
    }
  }

  onConversationSelected(conversation: ConversationModel){
    //console.log('returnSelectedConversation::', conversation)
    this.navigateByUrl(conversation.uid)
  }

  onImageLoaded(conversation: ConversationModel){
    // let conversation_with_fullname = conversation.sender_fullname;
    // let conversation_with = conversation.sender; 
    // if (conversation.sender === this.loggedUserUid) {
    //   conversation_with = conversation.recipient;
    //   conversation_with_fullname = conversation.recipient_fullname;
    // } else if (conversation.channel_type === TYPE_GROUP) {
    //     conversation_with = conversation.recipient;
    //     conversation_with_fullname = conversation.sender_fullname;
    //     // conv.last_message_text = conv.last_message_text;
    // }
    // conversation.image= this.imageRepoService.getImagePhotoUrl(FIREBASESTORAGE_BASE_URL_IMAGE, conversation_with)
  }

  onConversationLoaded(conversation: ConversationModel){
    // const keys = [ 'YOU' ];
    // const translationMap = this.translateService.translateLanguage(keys);
    // if (conversation.sender === this.loggedUserUid) {
    //   conversation.last_message_text = translationMap.get('YOU') + ': ' + conversation.last_message_text;
    // }
  }


  navigateByUrl(uidConvSelected: string) {
    this.setUidConvSelected(uidConvSelected);
    if (checkPlatformIsMobile()) {
      console.log('PLATFORM_MOBILE 1', this.navService);
      // this.router.navigateByUrl('conversations-list');
    } else {
      console.log('PLATFORM_DESKTOP 2', this.navService);
      let pageUrl = 'conversation-detail/' + this.uidConvSelected;
      if (this.conversationSelected && this.conversationSelected.conversation_with_fullname) {
        pageUrl = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname;
      }
      // let pageUrl = 'detail/' + this.uidConvSelected;
      // if (this.conversationSelected && this.conversationSelected.conversation_with_fullname) {
      //   pageUrl = 'detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname;
      // }
      console.log('setUidConvSelected navigateByUrl--->: ', pageUrl);
      this.router.navigateByUrl(pageUrl);

      // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      // this.router.onSameUrlNavigation = 'reload';
      // this.router.navigateByUrl(pageUrl);

    }
  }


  setUidConvSelected(uidConvSelected?: string) {
    this.uidConvSelected = uidConvSelected;
    this.archivedConversationsHandlerService.uidConvSelected = uidConvSelected;
    if (uidConvSelected) {
      const conversationSelected = this.listConversations.find(item => item.uid === this.uidConvSelected);
      if (conversationSelected) {
        console.log('la conv ' + this.conversationSelected + ' è già stata caricata');
        this.conversationSelected = conversationSelected;
        console.log('setUidConvSelected: ', this.conversationSelected);
        this.databaseProvider.setUidLastOpenConversation(uidConvSelected);
        localStorage.setItem('conversationSelected', JSON.stringify(this.conversationSelected));
      }
    }
  }

}

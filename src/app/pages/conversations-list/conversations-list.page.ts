import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
// config
import { environment } from '../../../environments/environment';

// models
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { UserModel } from 'src/chat21-core/models/user';

// utils
import { isInArray, checkPlatformIsMobile, presentModal, closeModal, convertMessage, isGroup, } from '../../../chat21-core/utils/utils';

import { EventsService } from '../../services/events-service';
import PerfectScrollbar from 'perfect-scrollbar'; // https://github.com/mdbootstrap/perfect-scrollbar

// services
import { DatabaseProvider } from '../../services/database';
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service';
import { ChatManager } from 'src/chat21-core/providers/chat-manager';
import { NavProxyService } from '../../services/nav-proxy.service';
import { TiledeskService } from '../../services/tiledesk/tiledesk.service';
import { ConversationDetailPage } from '../conversation-detail/conversation-detail.page';
import { ContactsDirectoryPage } from '../contacts-directory/contacts-directory.page';
import { ProfileInfoPage } from '../profile-info/profile-info.page';
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { AppConfigProvider } from '../../services/app-config';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'app-conversations-list',
  templateUrl: './conversations-list.page.html',
  styleUrls: ['./conversations-list.page.scss'],
})
export class ConversationListPage implements OnInit {
  private subscriptions: Array<string>;
  public tenant: string;
  public loggedUserUid: string;
  public conversations: Array<ConversationModel> = [];
  public archivedConversations: Array<ConversationModel> = [];
  public uidConvSelected: string;
  public conversationSelected: ConversationModel;
  public uidReciverFromUrl: string;
  public showPlaceholder = true;
  public numberOpenConv = 0;
  public loadingIsActive = true;
  public supportMode = environment.supportMode;

  public convertMessage = convertMessage;
  private isShowMenuPage = false;
  private logger: LoggerService = LoggerInstance.getInstance()
  translationMapConversation: Map<string, string>;
  stylesMap: Map<string, string>;

  public conversationType = 'active'
  headerTitle: string

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavProxyService,
    public events: EventsService,
    public modalController: ModalController,
    public databaseProvider: DatabaseProvider,
    public conversationsHandlerService: ConversationsHandlerService,
    public archivedConversationsHandlerService: ArchivedConversationsHandlerService,
    public chatManager: ChatManager,
    public messagingAuthService: MessagingAuthService,
    public imageRepoService: ImageRepoService,
    private translateService: CustomTranslateService,
    public tiledeskService: TiledeskService,
    public tiledeskAuthService: TiledeskAuthService,
    public appConfigProvider: AppConfigProvider,
  ) {
    this.listenToAppCompConvsLengthOnInitConvs()
    this.listenToLogoutEvent();
    this.listenToNotificationCLick()
  }

  // -----------------------------------------------
  // @ Lifehooks
  // -----------------------------------------------
  ngOnInit() { }

  ionViewWillEnter() {
    this.logger.log('[CONVS-LIST-PAGE] ionViewWillEnter uidConvSelected', this.uidConvSelected);
    this.listnerStart();
  }

  ionViewDidEnter() { }

  listenToNotificationCLick() {
    const that = this;
    navigator.serviceWorker.addEventListener('message', function (event) {
      that.logger.log('[CONVS-LIST-PAGE] listenToNotificationCLick - Received a message from service worker event data: ', event.data);
      that.logger.log('[CONVS-LIST-PAGE] listenToNotificationCLick - Received a message from service worker event data data: ', event.data['data']);
      that.logger.log('[CONVS-LIST-PAGE] listenToNotificationCLick - Received a message from service worker event data data typeof: ', typeof event.data['data']);
      let uidConvSelected = ''
      if (typeof event.data['data'] === 'string') {
        uidConvSelected = event.data['data']
      } else {
        uidConvSelected = event.data['data']['recipient']
      }

      that.logger.log('[CONVS-LIST-PAGE] listenToNotificationCLick - Received a message from service worker event dataObjct uidConvSelected: ', uidConvSelected);
      that.logger.log('[CONVS-LIST-PAGE] listenToNotificationCLick - Received a message from service worker that.conversations: ', that.conversations);
      const conversationSelected = that.conversations.find(item => item.uid === uidConvSelected);
      if (conversationSelected) {

        that.conversationSelected = conversationSelected;
        that.logger.log('[CONVS-LIST-PAGE] listenToNotificationCLick- Received a message from service worker event conversationSelected: ', that.conversationSelected);

        that.navigateByUrl('active', uidConvSelected)
      }
    });
  }


  private listnerStart() {
    const that = this;
    this.chatManager.BSStart.subscribe((data: any) => {
      this.logger.log('[CONVS-LIST-PAGE] ***** BSStart Current user *****', data);
      if (data) {
        that.initialize();
      }
    });
  }


  // ------------------------------------------------------------------ //
  // Init convrsation handler
  // ------------------------------------------------------------------ //
  initConversationsHandler() {
    this.conversations = this.conversationsHandlerService.conversations;
    this.logger.log('[CONVS-LIST-PAGE] - CONVERSATIONS ', this.conversations)
    // save conversationHandler in chatManager
    this.chatManager.setConversationsHandler(this.conversationsHandlerService);
    this.showPlaceholder = false;
  }



  initArchivedConversationsHandler() {
    const keysConversation = ['CLOSED'];
    this.translationMapConversation = this.translateService.translateLanguage(keysConversation);

    this.archivedConversationsHandlerService.subscribeToConversations(() => {
      this.logger.log('[CONVS-LIST-PAGE]-CONVS - conversations archived length ', this.archivedConversations.length)

    });

    this.archivedConversations = this.archivedConversationsHandlerService.archivedConversations;
    this.logger.log('[CONVS-LIST-PAGE] archived conversation', this.archivedConversations)

    // save archivedConversationsHandlerService in chatManager
    this.chatManager.setArchivedConversationsHandler(this.archivedConversationsHandlerService);

    this.logger.log('[CONVS-LIST-PAGE]-CONVS SubscribeToConversations - conversations archived length ', this.archivedConversations.length)
    if (!this.archivedConversations || this.archivedConversations.length === 0) {
      this.loadingIsActive = false;
    }

  }


  // ----------------------------------------------------------------------------------------------------
  // To display "No conversation yet" MESSAGE in conversazion list 
  // this.loadingIsActive is set to false only if on init there are not conversation
  // otherwise loadingIsActive remains set to true and the message "No conversation yet" is not displayed
  // to fix this
  // - for the direct conversation  
  // ---------------------------------------------------------------------------------------------------- 
  listenToAppCompConvsLengthOnInitConvs() {
    this.events.subscribe('appcompSubscribeToConvs:loadingIsActive', (loadingIsActive) => {
      this.logger.log('[CONVS-LIST-PAGE]-CONVS loadingIsActive', loadingIsActive);
      if (loadingIsActive === false) {
        this.loadingIsActive = false
      }
    });
  }

  listenToLogoutEvent() {
    this.events.subscribe('profileInfoButtonClick:logout', (hasclickedlogout) => {
      this.logger.log('[CONVS-LIST-PAGE]-CONVS loadingIsActive hasclickedlogout', hasclickedlogout);
      if (hasclickedlogout === true) {
        this.loadingIsActive = false
      }
    });
  }





  // ------------------------------------------------------------------ 
  //  SUBSCRIPTIONS
  // ------------------------------------------------------------------
  initSubscriptions() {
    let key = '';


    key = 'loggedUser:logout';
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key);
      this.events.subscribe(key, this.subscribeLoggedUserLogout);
    }

    // key = 'readAllMessages';
    // if (!isInArray(key, this.subscriptions)) {
    //   this.subscriptions.push(key);
    //   this.events.subscribe(key, this.readAllMessages);
    // }

    key = 'profileInfoButtonClick:changed';
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key);
      this.events.subscribe(key, this.subscribeProfileInfoButtonClicked);
    }

    // this.conversationsHandlerService.readAllMessages.subscribe((conversationId: string) => {
    //   this.logger.log('[CONVS-LIST-PAGE] ***** readAllMessages *****', conversationId);
    //   this.readAllMessages(conversationId);
    // });

    this.conversationsHandlerService.conversationAdded.subscribe((conversation: ConversationModel) => {
      this.logger.log('[CONVS-LIST-PAGE] ***** conversationsAdded *****', conversation);
      // that.conversationsChanged(conversations);
      if (conversation) {
        this.onImageLoaded(conversation)
        this.onConversationLoaded(conversation)
      }
    });

    this.conversationsHandlerService.conversationChanged.subscribe((conversation: ConversationModel) => {
      this.logger.log('[CONVS-LIST-PAGE] ***** subscribeConversationChanged *****', conversation);
      // that.conversationsChanged(conversations)
      if (conversation) {
        this.onImageLoaded(conversation)
        this.onConversationLoaded(conversation)
      }
    });

    this.conversationsHandlerService.conversationRemoved.subscribe((conversation: ConversationModel) => {
      this.logger.log('[CONVS-LIST-PAGE] ***** conversationsRemoved *****', conversation);
    });
  }

  // ------------------------------------------------------------------------------------
  // @ SUBSCRIBE TO LOGGED USER LOGOUT ??????????? SEEMS NOT USED ?????????????????
  // ------------------------------------------------------------------------------------
  subscribeLoggedUserLogout = () => {
    this.conversations = [];
    this.uidConvSelected = null;
    this.logger.log('[CONVS-LIST-PAGE] - subscribeLoggedUserLogout conversations ', this.conversations);
    this.logger.log('[CONVS-LIST-PAGE] - subscribeLoggedUserLogout uidConvSelected ', this.uidConvSelected);
  }



  // ------------------------------------------------------------------------------------
  // @ SUBSCRIBE TO CONVERSATION CHANGED  ??????????? SEEMS NOT USED ?????????????????
  // ------------------------------------------------------------------------------------
  conversationsChanged = (conversations: ConversationModel[]) => {
    this.numberOpenConv = this.conversationsHandlerService.countIsNew();
    this.logger.log('[CONVS-LIST-PAGE] - conversationsChanged - NUMB OF CONVERSATIONS: ', this.numberOpenConv);
    // console.log('conversationsChanged »»»»»»»»» uidConvSelected', that.conversations[0], that.uidConvSelected);
    if (this.uidConvSelected && !this.conversationSelected) {
      const conversationSelected = this.conversations.find(item => item.uid === this.uidConvSelected);
      if (conversationSelected) {
        this.conversationSelected = conversationSelected;
        this.setUidConvSelected(this.uidConvSelected);
      }
    }
  }


  /**
   * ::: subscribeChangedConversationSelected :::
   * evento richiamato quando si seleziona un utente nell'elenco degli user
   * apro dettaglio conversazione
   */
  subscribeChangedConversationSelected = (user: UserModel, type: string) => {
    this.logger.log('[CONVS-LIST-PAGE]  ************** subscribeUidConvSelectedChanged navigateByUrl', user, type);
    this.uidConvSelected = user.uid;
    this.logger.log('[CONVS-LIST-PAGE]  ************** uidConvSelected ', this.uidConvSelected);
    // this.conversationsHandlerService.uidConvSelected = user.uid;
    const conversationSelected = this.conversations.find(item => item.uid === this.uidConvSelected);
    if (conversationSelected) {
      this.logger.log('[CONVS-LIST-PAGE] --> uidConvSelected: ', this.conversationSelected, this.uidConvSelected);
      this.conversationSelected = conversationSelected;
    }
    // this.router.navigateByUrl('conversation-detail/' + user.uid + '?conversationWithFullname=' + user.fullname);
  }

  /**
   * ::: subscribeProfileInfoButtonClicked :::
   * evento richiamato quando si seleziona bottone profile-info-modal
   */
  subscribeProfileInfoButtonClicked = (event: string) => {
    this.logger.log('[CONVS-LIST-PAGE] ************** subscribeProfileInfoButtonClicked: ', event);
    if (event === 'displayArchived') {
      this.initArchivedConversationsHandler();
      // this.openArchivedConversationsModal()
      this.conversationType = 'archived'

      // let storedArchivedConv = localStorage.getItem('activeConversationSelected');
      const keys = ['LABEL_ARCHIVED'];
      this.headerTitle = this.translateService.translateLanguage(keys).get(keys[0]);

    } else if (event === 'displayContact') {
      this.conversationType = 'archived'
      const keys = ['LABEL_CONTACTS'];
      this.headerTitle = this.translateService.translateLanguage(keys).get(keys[0]);
    }
  }

  onBackButtonFN(event) {
    this.conversationType = 'active'

    // let storedActiveConv = localStorage.getItem('activeConversationSelected');
    // // console.log('ConversationListPage - storedActiveConv: ', storedActiveConv);
    // if (storedActiveConv) {
    //   let storedActiveConvObjct = JSON.parse(storedActiveConv)
    //   console.log('ConversationListPage - storedActiveConv Objct: ', storedActiveConvObjct);
    //   this.navigateByUrl('active', storedActiveConvObjct.uid)
    // } else {
    //   // da implementare se nn c'è stata nessuna conv attive selezionata 
    // }

  }


  // ------------------------------------------------------------------//
  // END SUBSCRIPTIONS
  // ------------------------------------------------------------------//

  // :: handler degli eventi in output per i componenti delle modali
  // ::::: vedi ARCHIVED-CONVERSATION-LIST --> MODALE
  // initHandlerEventEmitter() {
  //   this.onConversationSelectedHandler.subscribe(conversation => {
  //     console.log('ConversationListPage - onversaation selectedddd', conversation)
  //     this.onConversationSelected(conversation)
  //   })

  //   this.onImageLoadedHandler.subscribe(conversation => {
  //     this.onImageLoaded(conversation)
  //   })

  //   this.onConversationLoadedHandler.subscribe(conversation => {
  //     this.onConversationLoaded(conversation)
  //   })
  // }



  // ------------------------------------------------------------------//
  // BEGIN FUNCTIONS
  // ------------------------------------------------------------------//
  /**
   * ::: initialize :::
   */
  initialize() {
    // this.tenant = environment.tenant;
    this.tenant = this.appConfigProvider.getConfig().tenant
    this.logger.log('[CONVS-LIST-PAGE] this.tenant', this.tenant)
    this.loggedUserUid = this.tiledeskAuthService.getCurrentUser().uid;
    this.subscriptions = [];
    this.initConversationsHandler();
    this.databaseProvider.initialize(this.loggedUserUid, this.tenant);
    this.initVariables();
    this.initSubscriptions();
    // this.initHandlerEventEmitter();
  }


  /**
   * ::: initVariables :::
   * al caricamento della pagina:
   * setto BUILD_VERSION prendendo il valore da PACKAGE
   * recupero conversationWith -
   * se vengo da dettaglio conversazione o da users con conversazione attiva ???? sarà sempre undefined da spostare in ionViewDidEnter
   * recupero tenant
   * imposto recipient se esiste nei parametri passati nell'url
   * imposto uidConvSelected recuperando id ultima conversazione aperta dallo storage
   */
  initVariables() {


    this.logger.log('[CONVS-LIST-PAGE] uidReciverFromUrl:: ' + this.uidReciverFromUrl);
    this.logger.log('[CONVS-LIST-PAGE] loggedUserUid:: ' + this.loggedUserUid);
    this.logger.log('[CONVS-LIST-PAGE] tenant:: ' + this.tenant);
    if (this.route.component['name'] !== "ConversationListPage") {
      const IDConv = this.route.snapshot.firstChild.paramMap.get('IDConv');
      this.logger.log('[CONVS-LIST-PAGE] conversationWith: ', IDConv);
      if (IDConv) {
        this.setUidConvSelected(IDConv);
      } else {

        this.logger.log('[CONVS-LIST-PAGE] conversationWith: ', IDConv);
      }
    }
  }



  /**
   * ::: setUidConvSelected :::
   */
  setUidConvSelected(uidConvSelected: string, conversationType?: string,) {
    this.logger.log('[CONVS-LIST-PAGE] setuidCOnvSelected', uidConvSelected)
    this.uidConvSelected = uidConvSelected;
    // this.conversationsHandlerService.uidConvSelected = uidConvSelected;
    if (uidConvSelected) {
      let conversationSelected;
      if (conversationType === 'active') {
        conversationSelected = this.conversations.find(item => item.uid === this.uidConvSelected);
      } else if (conversationType === 'archived') {
        conversationSelected = this.archivedConversations.find(item => item.uid === this.uidConvSelected);
      }
      if (conversationSelected) {
        this.logger.log('[CONVS-LIST-PAGE] conversationSelected', conversationSelected);
        this.logger.log('[CONVS-LIST-PAGE] la conv ', this.conversationSelected, ' è già stata caricata');
        this.conversationSelected = conversationSelected;
        this.logger.log('[CONVS-LIST-PAGE] setUidConvSelected: ', this.conversationSelected);
      }
    }
  }

  onConversationSelected(conversation: ConversationModel) {
    //console.log('returnSelectedConversation::', conversation)
    if (conversation.archived) {
      this.navigateByUrl('archived', conversation.uid)
    } else {
      this.navigateByUrl('active', conversation.uid)
    }

  }

  onImageLoaded(conversation: any) {
    this.logger.log('[CONVS-LIST-PAGE] onImageLoaded', conversation)
    let conversation_with_fullname = conversation.sender_fullname;
    let conversation_with = conversation.sender;
    if (conversation.sender === this.loggedUserUid) {
      conversation_with = conversation.recipient;
      conversation_with_fullname = conversation.recipient_fullname;
    } else if (isGroup(conversation)) {
      // conversation_with_fullname = conv.sender_fullname;
      // conv.last_message_text = conv.last_message_text;
      conversation_with = conversation.recipient;
      conversation_with_fullname = conversation.recipient_fullname;
    }
    conversation.image = this.imageRepoService.getImagePhotoUrl(conversation_with)
  }

  onConversationLoaded(conversation: ConversationModel) {
    this.logger.log('[CONVS-LIST-PAGE] onConversationLoaded ', conversation)
    const keys = ['YOU'];
    const translationMap = this.translateService.translateLanguage(keys);
    // Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly in the convesations list

    var regex = /<br\s*[\/]?>/gi;
    if (conversation && conversation.last_message_text) {
      conversation.last_message_text = conversation.last_message_text.replace(regex, "")

      //FIX-BUG: 'YOU: YOU: YOU: text' on last-message-text in conversation-list
      if (conversation.sender === this.loggedUserUid && !conversation.last_message_text.includes(': ')) {
        this.logger.log('[CONVS-LIST-PAGE] onConversationLoaded', conversation)
        conversation.last_message_text = translationMap.get('YOU') + ': ' + conversation.last_message_text;
      }
    }
  }
  // ?????? 
  navigateByUrl(converationType: string, uidConvSelected: string) {
    this.logger.log('[CONVS-LIST-PAGE] navigateByUrl uidConvSelected: ', uidConvSelected);
    this.logger.log('[CONVS-LIST-PAGE] navigateByUrl run  this.setUidConvSelected');
    this.logger.log('[CONVS-LIST-PAGE] navigateByUrl this.uidConvSelected ', this.uidConvSelected);
    this.logger.log('[CONVS-LIST-PAGE] navigateByUrl this.conversationSelected ', this.conversationSelected)

    this.setUidConvSelected(uidConvSelected, converationType);
    if (checkPlatformIsMobile()) {
      this.logger.log('[CONVS-LIST-PAGE] PLATFORM_MOBILE 1', this.navService);
      let pageUrl = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname + '/' + converationType;
      this.logger.log('[CONVS-LIST-PAGE] pageURL', pageUrl)
      this.router.navigateByUrl(pageUrl);
    } else {
      this.logger.log('[CONVS-LIST-PAGE] PLATFORM_DESKTOP 2', this.navService);
      let pageUrl = 'conversation-detail/' + this.uidConvSelected;
      if (this.conversationSelected && this.conversationSelected.conversation_with_fullname) {
        pageUrl = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname + '/' + converationType;
      }
      this.logger.log('[CONVS-LIST-PAGE] setUidConvSelected navigateByUrl--->: ', pageUrl);
      this.router.navigateByUrl(pageUrl);
    }
  }


  // ---------------------------------------------------------
  // Opens the list of contacts for direct convs
  // ---------------------------------------------------------
  openContactsDirectory(event: any) {
    const TOKEN = this.tiledeskAuthService.getTiledeskToken();
    this.logger.log('[CONVS-LIST-PAGE] openContactsDirectory', TOKEN);
    if (checkPlatformIsMobile()) {
      presentModal(this.modalController, ContactsDirectoryPage, { token: TOKEN });
    } else {
      this.navService.push(ContactsDirectoryPage, { token: TOKEN });
    }
  }

  closeContactsDirectory() {
    try {
      closeModal(this.modalController);
    } catch (err) {
      this.logger.error('[CONVS-LIST-PAGE] closeContactsDirectory -> error:', err);
    }
  }

  // ---------------------------------------------------------
  // Opens logged user profile modal
  // ---------------------------------------------------------
  openProfileInfo(event: any) {
    const TOKEN = this.messagingAuthService.getToken();
    this.logger.log('[CONVS-LIST-PAGE] open ProfileInfoPage TOKEN ', TOKEN);
    if (checkPlatformIsMobile()) {
      presentModal(this.modalController, ProfileInfoPage, { token: TOKEN })
    } else {
      this.navService.push(ProfileInfoPage, { token: TOKEN })
    }
  }



  // ----------------------------------------------------------------------------------------------
  // onCloseConversation
  // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
  // ----------------------------------------------------------------------------------------------
  onCloseConversation(conversation: ConversationModel) {
    // -------------------------------------------------------------------------------------
    // Fix the display of the message "No conversation yet" when a conversation is archived 
    // but there are others in the list (happens when loadingIsActive is set to false because 
    // when is called the initConversationsHandler method there is not conversations)
    // -------------------------------------------------------------------------------------
    this.loadingIsActive = false;
    // console.log('CONVS - CONV-LIST-PAGE onCloseConversation CONVS: ', conversation)
    this.logger.log('[CONVS-LIST-PAGE] onCloseConversation loadingIsActive: ', this.loadingIsActive)

    const conversationId = conversation.uid;

    this.logger.log('[CONVS-LIST-PAGE] onCloseConversation conversationId: ', conversationId)
    const conversationId_segments = conversationId.split('-');
    this.logger.log('[CONVS-LIST-PAGE] - conversationId_segments: ', conversationId_segments);
    const project_id = conversationId_segments[2]
    this.logger.log('[CONVS-LIST-PAGE] - conversationWith_segments project_id: ', project_id);

    if (conversationId.startsWith("support-group")) {

      // const projectId = conversation.attributes.projectId
      const tiledeskToken = this.tiledeskAuthService.getTiledeskToken();
      this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation projectId: ', project_id)

      this.tiledeskService.closeSupportGroup(tiledeskToken, project_id, conversationId).subscribe(res => {

        this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup RES', res);
      }, (error) => {
        this.logger.error('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup - ERROR  ', error);
      }, () => {
        this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup * COMPLETE *');
        this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation (closeSupportGroup) CONVS ', this.conversations)
        this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation (closeSupportGroup) CONVS LENGHT ', this.conversations.length)
      });
    } else {

      this.conversationsHandlerService.archiveConversation(conversationId)
    }
  }



  public generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }

  // ------------------------------------------------------------------
  // !!! Not used methods !!!
  // ------------------------------------------------------------------

  // /**
  //  * ::: openArchivedConversationsPage :::
  //  * Open the archived conversations page
  //  * (metodo richiamato da html)
  //  */
  // openArchivedConversationsPage() {
  //   this.logger.log('[CONVS-LIST-PAGE] openArchivedConversationsPage');
  // }


  // // info page
  // returnCloseInfoPage() {
  //   this.logger.log('[CONVS-LIST-PAGE] returnCloseInfoPage');
  //   // this.isShowMenuPage = false;
  //   this.initialize();

  // }


  // private navigatePage() {
  //   this.logger.log('[CONVS-LIST-PAGE] navigatePage:: >>>> conversationSelected ', this.conversationSelected);
  //   let urlPage = 'detail/';
  //   if (this.conversationSelected) {
  //     // urlPage = 'conversation-detail/' + this.uidConvSelected;
  //     urlPage = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname;
  //     // this.openDetailsWithState(this.conversationSelected);
  //   }
  //   // else {
  //   //   this.router.navigateByUrl('detail');
  //   // }

  //   const navigationExtras: NavigationExtras = {
  //     state: {
  //       conversationSelected: this.conversationSelected
  //     }
  //   };
  //   this.navService.openPage(urlPage, ConversationDetailPage, navigationExtras);
  // }


  // openDetailsWithState(conversationSelected) {
  //   console.log('openDetailsWithState:: >>>> conversationSelected ', conversationSelected);
  //   let navigationExtras: NavigationExtras = {
  //     state: {
  //       conversationSelected: conversationSelected
  //     }
  //   };
  //   this.router.navigate(['conversation-detail/' + this.uidConvSelected], navigationExtras);
  // }

  // /**
  //  * ::: subscribeLoggedUserLogin :::
  //  * effettuato il login:
  //  * 1 - imposto loggedUser
  //  * 2 - dismetto modale
  //  * 3 - inizializzo elenco conversazioni
  //  */
  // subscribeLoggedUserLogin = (user: any) => {
  //   console.log('3 ************** subscribeLoggedUserLogin', user);
  //   this.loggedUser = user;
  //   try {
  //     closeModal(this.modalController);
  //   } catch (err) {
  //     console.error('-> error:', err);
  //   }
  //   this.initialize();
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



    // ------------------------------------------------------------------------------------
  // ::: readAllMessages :::  ??????????? SEEMS NOT USED ?????????????????
  // when all chat messages are displayed,
  // that is when in the conversation detail I go to the bottom of the page,
  // the readAllMessages event is triggered and is intercepted in the conversation list
  // and modify the current conversation by bringing is_new to false
  // ------------------------------------------------------------------------------------
  // readAllMessages = (uid: string) => {
  //   this.logger.log('[CONVS-LIST-PAGE] readAllMessages', uid);
  //   const conversationSelected = this.conversations.find(item => item.uid === this.uidConvSelected);
  //   if (conversationSelected) {
  //     conversationSelected.is_new = false;
  //     conversationSelected.status = '0';
  //     conversationSelected.selected = true;
  //   }
  // }
}

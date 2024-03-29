import { URL_SOUND_LIST_CONVERSATION } from './../../../chat21-core/utils/constants'
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Directive,
  HostListener,
  ChangeDetectorRef,
  Renderer2,
} from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import {
  ModalController,
  ToastController,
  PopoverController,
  Platform,
  ActionSheetController,
  NavController,
  IonContent,
  IonTextarea,
  IonButton,
} from '@ionic/angular'

// models
import { UserModel } from 'src/chat21-core/models/user'
import { MessageModel } from 'src/chat21-core/models/message'
import { ConversationModel } from 'src/chat21-core/models/conversation'
import { GroupModel } from 'src/chat21-core/models/group'

// services
import { ChatManager } from 'src/chat21-core/providers/chat-manager'
import { AppConfigProvider } from '../../services/app-config'

import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service'
import { TypingService } from 'src/chat21-core/providers/abstract/typing.service'
import { ConversationHandlerBuilderService } from 'src/chat21-core/providers/abstract/conversation-handler-builder.service'
import { GroupsHandlerService } from 'src/chat21-core/providers/abstract/groups-handler.service'
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service'
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service'
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service'
import { ConversationHandlerService } from 'src/chat21-core/providers/abstract/conversation-handler.service'
import { ContactsService } from 'src/app/services/contacts/contacts.service'
import { CannedResponsesService } from '../../services/canned-responses/canned-responses.service'
import { compareValues, htmlEntities } from '../../../chat21-core/utils/utils'
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service'
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service'
import { CreateCannedResponsePage } from 'src/app/pages/create-canned-response/create-canned-response.page'
// utils
import {
  TYPE_MSG_TEXT,
  MESSAGE_TYPE_INFO,
  MESSAGE_TYPE_MINE,
  MESSAGE_TYPE_OTHERS,
} from '../../../chat21-core/utils/constants'
import {
  checkPlatformIsMobile,
  checkWindowWidthIsLessThan991px,
  setConversationAvatar,
  setChannelType,
} from '../../../chat21-core/utils/utils'
import {
  isFirstMessage,
  isInfo,
  isMine,
  messageType,
} from 'src/chat21-core/utils/utils-message'

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service'
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance'

import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { TiledeskService } from '../../services/tiledesk/tiledesk.service'
import { NetworkService } from '../../services/network-service/network.service'
import { EventsService } from '../../services/events-service'
import { ScrollbarThemeDirective } from 'src/app/utils/scrollbar-theme.directive'

@Component({
  selector: 'app-conversation-detail',
  templateUrl: './conversation-detail.page.html',
  styleUrls: ['./conversation-detail.page.scss'],
})
export class ConversationDetailPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('ionContentChatArea', { static: false })
  ionContentChatArea: IonContent
  @ViewChild('rowMessageTextArea', { static: false }) rowTextArea: ElementRef
  @ViewChild('noCannedTitle', { static: false }) noCannedTitle: ElementRef


  // @ViewChild('info_content', { static: false }) info_content_child : InfoContentComponent;

  showButtonToBottom = false // indica lo stato del pulsante per scrollare la chat (showed/hidden)
  NUM_BADGES = 0 // numero di messaggi non letti
  COLOR_GREEN = '#24d066' // colore presence active da spostare nelle costanti
  COLOR_RED = '#db4437' // colore presence none da spostare nelle costanti

  private unsubscribe$: Subject<any> = new Subject<any>()
  private subscriptions: Array<any>
  public tenant: string
  public loggedUser: UserModel
  public conversationWith: string
  public conversationWithFullname: string
  public messages: Array<MessageModel> = []
  public groupDetail: GroupModel
  public messageSelected: any
  public channelType: string
  public online: boolean
  public lastConnectionDate: string
  public showMessageWelcome: boolean
  public openInfoConversation = false
  public openInfoMessage: boolean // check is open info message
  public isMobile = false
  public isLessThan991px = false // nk added
  public isTyping = false
  public nameUserTypingNow: string

  public heightMessageTextArea = ''
  public translationMap: Map<string, string>
  public conversationAvatar: any
  public membersConversation: any
  public member: UserModel
  public urlConversationSupportGroup: any
  public isFileSelected: boolean
  public showIonContent = false
  public conv_type: string

  public tagsCanned: any = []
  public tagsCannedCount: number
  public tagsCannedFilter: any = []
  public HIDE_CANNED_RESPONSES: boolean = false

  public window: any = window
  public styleMap: Map<string, string> = new Map()

  MESSAGE_TYPE_INFO = MESSAGE_TYPE_INFO
  MESSAGE_TYPE_MINE = MESSAGE_TYPE_MINE
  MESSAGE_TYPE_OTHERS = MESSAGE_TYPE_OTHERS

  arrowkeyLocation = -1
  public_Key: any;
  areVisibleCAR: boolean;
  support_mode: boolean;
  //SOUND
  setTimeoutSound: any;
  audio: any;
  isOpenInfoConversation: boolean;
  USER_HAS_OPENED_CLOSE_INFO_CONV: boolean = false;
  isHovering: boolean = false;
  conversation_count: number;
  showSpinner: boolean = true;
  dropEvent: any;
  conversation: any;
  USER_ROLE: string;
  isMine = isMine
  isInfo = isInfo
  isFirstMessage = isFirstMessage
  messageType = messageType
  // info_content_child_enabled: boolean = false
  private logger: LoggerService = LoggerInstance.getInstance();

  public isOnline: boolean = true;
  public checkInternet: boolean;
  public msgCount: number;
  public disableTextarea: boolean;

  /**
   * Constructor
   * @param route
   * @param chatManager
   * @param actionSheetCtrl
   * @param platform
   * @param customTranslateService
   * @param appConfigProvider
   * @param modalController
   * @param typingService
   * @param tiledeskAuthService
   * @param conversationsHandlerService
   * @param archivedConversationsHandlerService
   * @param conversationHandlerService
   * @param groupService
   * @param contactsService
   * @param conversationHandlerBuilderService
   * @param linkifyService
   * @param logger
   * @param cannedResponsesService
   * @param imageRepoService
   * @param presenceService
   * @param toastController
   */
  constructor(
    private route: ActivatedRoute,
    public chatManager: ChatManager,
    public actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    private customTranslateService: CustomTranslateService,
    public appConfigProvider: AppConfigProvider,
    public modalController: ModalController,
    public typingService: TypingService,
    public tiledeskAuthService: TiledeskAuthService,
    public conversationsHandlerService: ConversationsHandlerService,
    public archivedConversationsHandlerService: ArchivedConversationsHandlerService,
    public conversationHandlerService: ConversationHandlerService,
    public groupService: GroupsHandlerService,
    public contactsService: ContactsService,
    public conversationHandlerBuilderService: ConversationHandlerBuilderService,
    public cannedResponsesService: CannedResponsesService,
    public imageRepoService: ImageRepoService,
    public presenceService: PresenceService,
    public toastController: ToastController,
    public tiledeskService: TiledeskService,
    private networkService: NetworkService,
    private events: EventsService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    // Change list on date change
    this.route.paramMap.subscribe((params) => {
      this.logger.log('[CONVS-DETAIL] - constructor -> params: ', params)
      this.conversationWith = params.get('IDConv')
      this.conversationWithFullname = params.get('FullNameConv')
      this.conv_type = params.get('Convtype')

      this.events.publish('supportconvid:haschanged', this.conversationWith)
    })
  }

  // -----------------------------------------------------------
  // @ Lifehooks
  // -----------------------------------------------------------
  ngOnInit() {
    // this.logger.log('[CONVS-DETAIL] > ngOnInit - window.location: ', window.location);
    // this.logger.log('[CONVS-DETAIL] > ngOnInit - fileUploadAccept: ', this.appConfigProvider.getConfig().fileUploadAccept);
    // const accept_files = this.appConfigProvider.getConfig().fileUploadAccept;
    // this.logger.log('[CONVS-DETAIL] > ngOnInit - fileUploadAccept typeof accept_files ', typeof accept_files);
    // const accept_files_array = accept_files.split(',')
    // this.logger.log('[CONVS-DETAIL] > ngOnInit - fileUploadAccept accept_files_array ', accept_files_array);
    // this.logger.log('[CONVS-DETAIL] > ngOnInit - fileUploadAccept accept_files_array typeof: ', typeof accept_files_array);

    // accept_files_array.forEach(accept_file => {
    //   this.logger.log('[CONVS-DETAIL] > ngOnInit - fileUploadAccept accept_file ', accept_file);
    //   const accept_file_segment = accept_file.split('/')
    //   this.logger.log('[CONVS-DETAIL] > ngOnInit - fileUploadAccept accept_file_segment ', accept_file_segment);
    //   if (accept_file_segment[1] === '*') {

    //   }
    // });
    this.getConversations();
    this.watchToConnectionStatus();
    this.getOSCODE();
    this.getStoredProjectAndUserRole();
  }

  getStoredProjectAndUserRole() {
    const stored_project = localStorage.getItem('last_project')
    // console.log('[SIDEBAR] stored_project ', stored_project)
    if (stored_project && stored_project !== undefined) {
      const project = JSON.parse(stored_project)
      // this.logger.log('[CONVS-DETAIL]  project ', project)

      // this.project_id = project.id_project.id
      // this.logger.log('[CONVS-DETAIL] project_id ', this.project_id)

      this.USER_ROLE = project.role;
      // this.USER_ROLE = 'agent';
      this.logger.log('[CONVS-DETAIL]  USER_ROLE ', this.USER_ROLE)
    }
  }

  getConversations() {
    this.conversationsHandlerService.conversationAdded.subscribe((conv) => {
      // console.log('[CONVS-DETAIL]  - conv  ', conv)
      const conversations = this.conversationsHandlerService.conversations
      // console.log('[CONVS-DETAIL] conversations', conversations);
      this.conversation_count = conversations.length
      this.logger.log('[CONVS-DETAIL] conversation_count', this.conversation_count)
    })

    this.conversationsHandlerService.conversationChanged.subscribe((conv) => {
      // console.log('[CONVS-DETAIL]  - conv  ', conv)
      const conversations = this.conversationsHandlerService.conversations
      // console.log('[CONVS-DETAIL] conversations', conversations);
      this.conversation_count = conversations.length
      this.logger.log(
        '[CONVS-DETAIL] conversation_count',
        this.conversation_count,
      )
    })

    this.conversationsHandlerService.conversationRemoved.subscribe((conv) => {
      // console.log('[CONVS-DETAIL]  - conv  ', conv)
      const conversations = this.conversationsHandlerService.conversations
      // console.log('[CONVS-DETAIL] conversations', conversations);
      this.conversation_count = conversations.length
      this.logger.log(
        '[CONVS-DETAIL] conversation_count',
        this.conversation_count,
      )
    })

    setTimeout(() => {
      this.showSpinner = false
    }, 3000)
  }

  getOSCODE() {
    this.support_mode = null
    if (this.appConfigProvider.getConfig().supportMode === true || this.appConfigProvider.getConfig().supportMode === 'true') {
      this.support_mode = true
    } else if (this.appConfigProvider.getConfig().supportMode === false || this.appConfigProvider.getConfig().supportMode === 'false') {
      this.support_mode = false
    } else if (!this.appConfigProvider.getConfig().supportMode) {
      this.support_mode = false
    }
    this.logger.log('[CONVS-DETAIL] AppConfigService getAppConfig support_mode', this.support_mode)
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    this.logger.log('[CONVS-DETAIL] AppConfigService getAppConfig public_Key', this.public_Key)

    if (this.public_Key) {
      let keys = this.public_Key.split('-')
      this.logger.log('[CONVS-DETAIL] PUBLIC-KEY - public_Key keys', keys)

      keys.forEach((key) => {
        if (key.includes('CAR')) {
          let car = key.split(':')
          if (car[1] === 'F') {
            this.areVisibleCAR = false
            this.logger.log(
              '[CONVS-DETAIL] PUBLIC-KEY - areVisibleCAR',
              this.areVisibleCAR,
            )
          } else {
            this.areVisibleCAR = true
            this.logger.log(
              '[CONVS-DETAIL] PUBLIC-KEY - areVisibleCAR',
              this.areVisibleCAR,
            )
          }
        }
      })

      if (!this.public_Key.includes('CAR')) {
        this.areVisibleCAR = false
        this.logger.log(
          '[CONVS-DETAIL] PUBLIC-KEY - areVisibleCAR',
          this.areVisibleCAR,
        )
      }
    } else {
      this.areVisibleCAR = false
    }
  }

  watchToConnectionStatus() {
    this.networkService.checkInternetFunc().subscribe((isOnline) => {
      this.checkInternet = isOnline
      // console.log('[CONVS-LIST-PAGE] - watchToConnectionStatus - isOnline', this.checkInternet)

      // checking internet connection
      if (this.checkInternet == true) {
        this.isOnline = true
      } else {
        this.isOnline = false
      }
    })
  }

  ngAfterViewInit() {
    this.logger.log('[CONVS-DETAIL] > ngAfterViewInit')
  }

  ngOnDestroy() {
    this.logger.log('[CONVS-DETAIL] > ngOnDestroy')
  }

  ngOnChanges() {
    this.logger.log('[CONVS-DETAIL] > ngOnChanges')
  }

  ionViewWillEnter() {
    // this.info_content_child_enabled = true;
    this.logger.log('[CONVS-DETAIL] TEST > ionViewWillEnter - convId ', this.conversationWith)
    this.loggedUser = this.tiledeskAuthService.getCurrentUser()
    this.logger.log('[CONVS-DETAIL] ionViewWillEnter loggedUser: ', this.loggedUser)
    this.listnerStart()
  }

  ionViewDidEnter() {
    this.logger.log('[CONVS-DETAIL] > ionViewDidEnter')
    // this.info_content_child_enabled = true;
  }

  // Unsubscibe when new page transition end
  ionViewWillLeave() {
    this.logger.log('[CONVS-DETAIL] > ionViewWillLeave')

    // this.logger.log('[CONVS-DETAIL] > ionViewWillLeave info_content_child ', this.info_content_child)
    // if (this.info_content_child) {
    //   this.logger.log('[CONVS-DETAIL] > HERE YES')
    //   this.info_content_child.destroy();
    // }

    // this.logger.log('[CONVS-DETAIL] TEST > ionViewWillLeave info_content_child_enabled ', this.info_content_child_enabled , 'convId ', this.conversationWith)
    this.unsubescribeAll()
  }

  // reloadTree() {
  //   this.info_content_child_enabled = false;
  //   // now notify angular to check for updates
  //   this.changeDetector.detectChanges();
  //   // change detection should remove the component now
  //   // then we can enable it again to create a new instance
  //   this.info_content_child_enabled = true;
  // }

  private listnerStart() {
    const that = this
    this.chatManager.BSStart.subscribe((data: any) => {
      this.logger.log('[CONVS-DETAIL] - BSStart data:', data)
      if (data) {
        that.initialize()
      }
    })
  }

  // --------------------------------------------------
  //  @ Inizialize
  // --------------------------------------------------
  initialize() {
    // this.logger.log('[CONVS-DETAIL] x conversationWith getConversationDetail', this.conversationWith)
    // this.logger.log('[CONVS-DETAIL] x conversationsHandlerService getConversationDetail', this.conversationsHandlerService)
    // this.logger.log('[CONVS-DETAIL] x this.conv_type getConversationDetail', this.conv_type)

    // if (this.conversationWith && this.conversationsHandlerService && this.conv_type === 'active') {
    //   this.conversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
    //     this.logger.log('[CONVS-DETAIL] x conversationsHandlerService getConversationDetail', this.conversationWith, conv)
    //   })
    // }
    // else { //get conversation from 'conversations' firebase node
    //   this.archivedConversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
    //     this.logger.log('[CONVS-DETAIL] x archivedConversationsHandlerService getConversationDetail', this.conversationWith, conv)

    //   })
    // }

    this.loggedUser = this.tiledeskAuthService.getCurrentUser()
    this.logger.log('[CONVS-DETAIL] - initialize -> loggedUser: ', this.loggedUser)
    this.translations()
    // this.conversationSelected = localStorage.getItem('conversationSelected');
    this.showButtonToBottom = false
    this.showMessageWelcome = false

    const appconfig = this.appConfigProvider.getConfig()
    // this.tenant = appconfig.tenant;
    this.tenant = appconfig.firebaseConfig.tenant
    this.logger.log('[CONVS-DETAIL] - initialize -> firebaseConfig tenant ', this.tenant)

    this.logger.log('[CONVS-DETAIL] - initialize -> conversationWith: ', this.conversationWith, ' -> conversationWithFullname: ', this.conversationWithFullname)
    this.subscriptions = []
    this.setHeightTextArea()
    this.tagsCanned = [] // list of canned

    this.messages = [] // list messages of conversation
    this.isFileSelected = false // indicates if a file has been selected (image to upload)
    this.openInfoMessage = false // indicates whether the info message panel is open

    if (checkPlatformIsMobile()) {
      this.isMobile = true
      // this.openInfoConversation = false; // indica se è aperto il box info conversazione
      this.logger.log('[CONVS-DETAIL] - initialize -> checkPlatformIsMobile isMobile? ', this.isMobile)
    } else {
      this.isMobile = false
      this.logger.log(
        '[CONVS-DETAIL] - initialize -> checkPlatformIsMobile isMobile? ',
        this.isMobile,
      )
      // this.openInfoConversation = true;
    }

    if (this.isMobile === false) {
      if (checkWindowWidthIsLessThan991px()) {
        this.logger.log(
          '[CONVS-DETAIL] - initialize -> checkWindowWidthIsLessThan991px ',
          checkWindowWidthIsLessThan991px(),
        )
        this.openInfoConversation = false // indica se è aperto il box info conversazione
        this.isOpenInfoConversation = false
        this.logger.log(
          '[CONVS-DETAIL] - initialize -> openInfoConversation ',
          this.openInfoConversation,
          ' -> isOpenInfoConversation ',
          this.isOpenInfoConversation,
        )
      } else {
        this.logger.log(
          '[CONVS-DETAIL] - initialize -> checkWindowWidthIsLessThan991px ',
          checkWindowWidthIsLessThan991px(),
        )
        this.openInfoConversation = true
        this.isOpenInfoConversation = true
        this.logger.log(
          '[CONVS-DETAIL] - initialize -> openInfoConversation ',
          this.openInfoConversation,
          ' -> isOpenInfoConversation ',
          this.isOpenInfoConversation,
        )
      }
    }

    this.online = false
    this.lastConnectionDate = ''

    // init handler vengono prima delle sottoscrizioni!
    // this.initConversationsHandler(); // nk
    if (this.conversationWith) {
      this.disableTextarea = false
      this._getProjectIdByConversationWith(this.conversationWith)
      this.initConversationHandler()
      this.initGroupsHandler()
      this.initSubscriptions()
    }
    this.addEventsKeyboard()
    this.startConversation()
    this.updateConversationBadge() // AGGIORNO STATO DELLA CONVERSAZIONE A 'LETTA' (is_new = false)
  }

  _getProjectIdByConversationWith(conversationWith: string) {
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()

    this.tiledeskService
      .getProjectIdByConvRecipient(tiledeskToken, conversationWith)
      .subscribe(
        (res) => {
          this.logger.log('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT RES', res)
          if (res) {
            const projectId = res.id_project
            this.logger.log('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT projectId ', projectId)
            this.getProjectById(tiledeskToken, projectId)
          }
        },
        (error) => {
          this.logger.error('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT - ERROR  ', error)
        },
        () => {
          this.logger.log(
            '[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT * COMPLETE *',
          )
        },
      )
  }

  getProjectById(tiledeskToken, projectId) {
    this.tiledeskService.getProjectById(tiledeskToken, projectId).subscribe(
      (res) => {
        this.logger.log('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT RES', res)
        if (res) {
          const projectId = res.id_project
          this.logger.log(
            '[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT projectId ',
            projectId,
          )
        }
      },
      (error) => {
        this.logger.error(
          '[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT - ERROR  ',
          error,
        )
        if ((error.error.msg = 'you dont belong to the project.')) {
          this.disableTextarea = true
        }
      },
      () => {
        this.logger.log(
          '[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT * COMPLETE *',
        )
      },
    )
  }

  returnOpenCloseInfoConversation(openInfoConversation: boolean) {
    this.logger.log(
      '[CONVS-DETAIL] returnOpenCloseInfoConversation - openInfoConversation ',
      openInfoConversation,
    )
    this.resizeTextArea()
    this.openInfoMessage = false
    this.openInfoConversation = openInfoConversation
    this.isOpenInfoConversation = openInfoConversation
    this.USER_HAS_OPENED_CLOSE_INFO_CONV = true
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerWidth = event.target.innerWidth
    if (newInnerWidth < 991) {
      if (this.USER_HAS_OPENED_CLOSE_INFO_CONV === false) {
        this.openInfoConversation = false
        this.isOpenInfoConversation = false
      }
    }
  }

  // --------------------------------------------------------
  // translations
  // translationMap passed to components in the html file
  // --------------------------------------------------------
  public translations() {
    const keys = [
      'LABEL_AVAILABLE',
      'LABEL_NOT_AVAILABLE',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_TO',
      'LABEL_LAST_ACCESS',
      'ARRAY_DAYS',
      'LABEL_ACTIVE_NOW',
      'LABEL_IS_WRITING',
      'LABEL_INFO_ADVANCED',
      'ID_CONVERSATION',
      'UPLOAD_FILE_ERROR',
      'LABEL_ENTER_MSG',
      'LABEL_ENTER_MSG_SHORT',
      'LABEL_ENTER_MSG_SHORTER',
      'ONLY_IMAGE_FILES_ARE_ALLOWED_TO_PASTE',
      'FAILED_TO_UPLOAD_THE_FORMAT_IS NOT_SUPPORTED',
      'NO_INFORMATION_AVAILABLE',
      'CONTACT_ID',
      'USER_ID',
      'UPLOAD',
      'CANNED_RESPONSES',
      'NO_CANNED_RESPONSES',
      'YES_CANNED_RESPONSES',
      'THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE',
      'TO_CREATE_THEM_GO_TO_THE_PROJECT',
      "AddNewCannedResponse"
    ]

    this.translationMap = this.customTranslateService.translateLanguage(keys)
    this.logger.log(
      '[CONVS-DETAIL] x this.translationMap ',
      this.translationMap,
    )
  }

  // --------------------------------------------------------
  // setTranslationMapForConversationHandler
  // --------------------------------------------------------
  private setTranslationMapForConversationHandler(): Map<string, string> {
    const keys = [
      'INFO_SUPPORT_USER_ADDED_SUBJECT',
      'INFO_SUPPORT_USER_ADDED_YOU_VERB',
      'INFO_SUPPORT_USER_ADDED_COMPLEMENT',
      'INFO_SUPPORT_USER_ADDED_VERB',
      'INFO_SUPPORT_CHAT_REOPENED',
      'INFO_SUPPORT_CHAT_CLOSED',
      'INFO_A_NEW_SUPPORT_REQUEST_HAS_BEEN_ASSIGNED_TO_YOU',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_LAST_ACCESS',
      'LABEL_TO',
      'ARRAY_DAYS',
    ]
    return this.customTranslateService.translateLanguage(keys)
  }

  // -------------------------------------------------------------------------------------
  // * retrieving the handler from chatManager
  // * if it DOESN'T EXIST I create a handler and connect and store it in the chatmanager
  // * if IT EXISTS I connect
  // * Upload the messages
  // * I wait x sec if no messages arrive I display msg wellcome
  // -------------------------------------------------------------------------------------
  initConversationHandler() {
    const translationMap = this.setTranslationMapForConversationHandler()
    this.showMessageWelcome = false
    const handler: ConversationHandlerService = this.chatManager.getConversationHandlerByConversationId(
      this.conversationWith,
    )
    this.logger.log(
      '[CONVS-DETAIL] - initConversationHandler - handler ',
      handler,
      ' conversationWith ',
      this.conversationWith,
    )
    if (!handler) {
      this.conversationHandlerService = this.conversationHandlerBuilderService.build()
      this.conversationHandlerService.initialize(
        this.conversationWith,
        this.conversationWithFullname,
        this.loggedUser,
        this.tenant,
        translationMap,
      )
      this.conversationHandlerService.connect()
      this.logger.log(
        '[CONVS-DETAIL] - initConversationHandler - NEW handler - conversationHandlerService',
        this.conversationHandlerService,
      )
      this.messages = this.conversationHandlerService.messages
      this.logger.log(
        '[CONVS-DETAIL] - initConversationHandler - messages: ',
        this.messages,
      )
      this.chatManager.addConversationHandler(this.conversationHandlerService)

      // // wait 8 second and then display the message if there are no messages
      const that = this
      this.logger.log('[CONVS-DETAIL] - initConversationHandler that.messages  ', that.messages)
      this.logger.log('[CONVS-DETAIL] - initConversationHandler that.messages.length  ', that.messages.length)
      this.msgCount = that.messages.length
      setTimeout(() => {
        if (!that.messages || that.messages.length === 0) {
          this.showIonContent = true
          that.showMessageWelcome = true
          this.logger.log('[CONVS-DETAIL] - initConversationHandler - showMessageWelcome: ', that.showMessageWelcome)
        }
      }, 8000)
    } else {
      this.logger.log('[CONVS-DETAIL] - initConversationHandler (else) - conversationHandlerService ', this.conversationHandlerService, ' handler', handler)
      this.conversationHandlerService = handler
      this.messages = this.conversationHandlerService.messages
      this.logger.log('[CONVS-DETAIL] - initConversationHandler (else) - this.messages: ', this.messages)
      this.logger.log('[CONVS-DETAIL] - initConversationHandler (else) - this.showMessageWelcome: ', this.showMessageWelcome)
    }
    this.logger.log('[CONVS-DETAIL] - initConversationHandler (else) - message ', this.messages, ' showIonContent', this.showIonContent)
  }

  initGroupsHandler() {
    if (
      this.conversationWith.startsWith('support-group') ||
      this.conversationWith.startsWith('group-')
    ) {
      this.groupService.initialize(this.tenant, this.loggedUser.uid)
      this.logger.log('[CONVS-DETAIL] - initGroupsHandler - tenant', this.tenant, ' loggedUser UID', this.loggedUser.uid)
    }
  }

  private setAttributes(): any {
    const attributes: any = {
      client: navigator.userAgent,
      sourcePage: location.href,
    }

    //TODO: servono ???
    if (this.loggedUser && this.loggedUser.email) {
      attributes.userEmail = this.loggedUser.email
    }
    if (this.loggedUser && this.loggedUser.fullname) {
      attributes.userFullname = this.loggedUser.fullname
    }

    return attributes
  }

  // ---------------------------------
  // startConversation
  // ---------------------------------
  startConversation() {
    //  console.log( '[CONVS-DETAIL] - startConversation conversationWith: ', this.conversationWith )
    if (this.conversationWith) {
      this.channelType = setChannelType(this.conversationWith)
      this.logger.log('[CONVS-DETAIL] - startConversation channelType : ', this.channelType)
      // this.selectInfoContentTypeComponent();
      this.setHeaderContent()
    }
  }

  setHeaderContent() {
    //   this.logger.log('[CONVS-DETAIL] - setHeaderContent conversationWith', this.conversationWith)
    //   this.logger.log('[CONVS-DETAIL] - setHeaderContent conversationsHandlerService', this.conversationsHandlerService)
    //   this.logger.log('[CONVS-DETAIL] - setHeaderContent conv_type', this.conv_type)
    if (
      this.conversationWith &&
      this.conversationsHandlerService &&
      this.conv_type === 'active'
    ) {
      this.logger.log('[CONVS-DETAIL] - setHeaderContent getConversationDetail CALLING')
      this.conversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
        if (conv) {
          // console.log( '[CONVS-DETAIL] - setHeaderContent getConversationDetail (active)', this.conversationWith, conv )
          this.conversationAvatar = setConversationAvatar(
            conv.conversation_with,
            conv.conversation_with_fullname,
            conv.channel_type,
          )
        }
        this.logger.log('[CONVS-DETAIL] - setHeaderContent > conversationAvatar: ', this.conversationAvatar)
      },
      )
    } else {
      //get conversation from 'conversations' firebase node
      this.archivedConversationsHandlerService.getConversationDetail(
        this.conversationWith,
        (conv) => {
          if (conv) {
            // console.log('[CONVS-DETAIL] - setHeaderContent getConversationDetail (archived)', this.conversationWith, 'CONVS', conv)
            this.conversationAvatar = setConversationAvatar(
              conv.conversation_with,
              conv.conversation_with_fullname,
              conv.channel_type,
            )
          }
        },
      )
    }

    // this.conversationAvatar = setConversationAvatar(
    //   this.conversationWith,
    //   this.conversationWithFullname,
    //   this.channelType
    // );
    // this.logger.log('[CONVS-DETAIL] - setHeaderContent > conversationAvatar: ', this.conversationAvatar);
  }

  returnSendMessage(e: any) {
    this.logger.log('[CONVS-DETAIL] - returnSendMessage event', e, ' - conversationWith', this.conversationWith)

    this.logger.log('[CONVS-DETAIL] - returnSendMessage event message', e.message)
    try {
      let message = ''
      if (e.message) {
        message = e.message
      }
      const type = e.type
      const metadata = e.metadata

      this.sendMessage(message, type, metadata)
    } catch (err) {
      this.logger.error('[CONVS-DETAIL] - returnSendMessage error: ', err)
    }
  }

  /**
   * SendMessage
   * @param msg
   * @param type
   * @param metadata
   * @param additional_attributes
   */
  sendMessage(
    msg: string,
    type: string,
    metadata?: any,
    additional_attributes?: any,
  ) {
    this.logger.log('[CONVS-DETAIL] - SEND MESSAGE - MSG: ', msg)
    this.logger.log('[CONVS-DETAIL] - SEND MESSAGE - type: ', type)
    this.logger.log('[CONVS-DETAIL] - SEND MESSAGE - metadata: ', metadata)
    let fullname = this.loggedUser.uid
    if (this.loggedUser.fullname) {
      fullname = this.loggedUser.fullname
    }

    const g_attributes = this.setAttributes()
    // added <any> to resolve the Error occurred during the npm installation: Property 'userFullname' does not exist on type '{}'
    const attributes = <any>{}
    if (g_attributes) {
      for (const [key, value] of Object.entries(g_attributes)) {
        attributes[key] = value
      }
    }
    if (additional_attributes) {
      for (const [key, value] of Object.entries(additional_attributes)) {
        attributes[key] = value
      }
    }

    // || type === 'image'
    if (type === 'file') {
      if (msg) {
        // msg = msg + '<br>' + 'File: ' + metadata.src;
        msg = `[${metadata.name}](${metadata.src})` + '\n' + msg
      } else {
        // msg = 'File: ' + metadata.src;
        // msg =  `<a href=${metadata.src} download>
        //   ${metadata.name}
        // </a>`

        // msg = ![file-image-placehoder](./assets/images/file-alt-solid.png) + [${metadata.name}](${metadata.src})
        msg = `[${metadata.name}](${metadata.src})`
      }
    }

    // else if (type === 'image') {
    //   if (msg) {
    //     // msg = msg + '<br>' + 'File: ' + metadata.src;
    //     msg = metadata.name + '\n' + msg

    //   } else {

    //     msg = metadata.name
    //   }

    // }

    metadata ? (metadata = metadata) : (metadata = '')
    this.logger.log('[CONVS-DETAIL] - SEND MESSAGE msg: ', msg, ' - messages: ', this.messages, ' - loggedUser: ', this.loggedUser)

    if ((msg && msg.trim() !== '') || type !== TYPE_MSG_TEXT) {
      this.conversationHandlerService.sendMessage(
        msg,
        type,
        metadata,
        this.conversationWith,
        this.conversationWithFullname,
        this.loggedUser.uid,
        fullname,
        this.channelType,
        attributes,
      )
    }
  }
  // ----------------------------------------------------------
  // InitSubscriptions BS subscriptions
  // ----------------------------------------------------------
  initSubscriptions() {
    this.logger.log('[CONVS-DETAIL] - initSubscriptions: ', this.subscriptions)

    const that = this
    let subscription: any
    let subscriptionKey: string

    subscriptionKey = 'BSConversationsChanged'
    subscription = this.subscriptions.find(
      (item) => item.key === subscriptionKey,
    )
    if (!subscription) {
      subscription = this.conversationsHandlerService.conversationChanged.subscribe(
        (data: ConversationModel) => {
          this.logger.log('[CONVS-DETAIL] subscribe BSConversationsChanged data ', data, ' this.loggedUser.uid:', this.loggedUser.uid)

          if (data && data.sender !== this.loggedUser.uid) {
            this.logger.log('[CONVS-DETAIL] subscribe to BSConversationsChange data sender ', data.sender)
            this.logger.log('[CONVS-DETAIL] subscribe to BSConversationsChange this.loggedUser.uid ', this.loggedUser.uid)
            this.logger.log('[CONVS-DETAIL] subscribe to BSConversationsChange is_new ', data.is_new)
            this.logger.log('[CONVS-DETAIL] subscribe to  BSConversationsChange showButtonToBottom ', this.showButtonToBottom)
            // UPDATE THE CONVERSATION TO 'READ' IF IT IS ME WHO WRITES THE LAST MESSAGE OF THE CONVERSATION
            // AND IF THE POSITION OF THE SCROLL IS AT THE END
            if (!this.showButtonToBottom && data.is_new) {
              // ARE AT THE END
              this.updateConversationBadge()
            }
          }
        },
      )
      const subscribe = { key: subscriptionKey, value: subscription }
      this.subscriptions.push(subscribe)
    }

    subscriptionKey = 'messageAdded'
    subscription = this.subscriptions.find(
      (item) => item.key === subscriptionKey,
    )
    if (!subscription) {
      this.logger.log('[CONVS-DETAIL] subscribe to messageAdded - conversationHandlerService', this.conversationHandlerService)
      subscription = this.conversationHandlerService.messageAdded.subscribe(
        (msg: any) => {
          this.logger.log('[CONVS-DETAIL] subscribe to messageAdded - msg ', msg)
          if (msg) {
            that.newMessageAdded(msg)
          }
        },
      )
      const subscribe = { key: subscriptionKey, value: subscription }
      this.subscriptions.push(subscribe)
    }

    // IS USED ?
    subscriptionKey = 'messageChanged'
    subscription = this.subscriptions.find(
      (item) => item.key === subscriptionKey,
    )
    if (!subscription) {
      this.logger.log('[CONVS-DETAIL] subscribe to messageChanged')
      subscription = this.conversationHandlerService.messageChanged.subscribe(
        (msg: any) => {
          this.logger.log(
            '[CONVS-DETAIL] subscribe to messageChanged - msg ',
            msg,
          )
        },
      )
      const subscribe = { key: subscriptionKey, value: subscription }
      this.subscriptions.push(subscribe)
    }

    subscriptionKey = 'messageRemoved'
    subscription = this.subscriptions.find(
      (item) => item.key === subscriptionKey,
    )
    if (!subscription) {
      this.logger.log('[CONVS-DETAIL] subscribe to messageRemoved')
      subscription = this.conversationHandlerService.messageRemoved.subscribe(
        (messageId: any) => {
          this.logger.log('[CONVS-DETAIL] subscribe to messageRemoved - messageId ', messageId)
        },
      )
      const subscribe = { key: subscriptionKey, value: subscription }
      this.subscriptions.push(subscribe)
    }

    // subscriptionKey = 'onGroupChange';
    // subscription = this.subscriptions.find(item => item.key === subscriptionKey);
    // if (!subscription) {
    // subscription =
    if (this.conversationWith.startsWith('group-')) {
      this.groupService
        .onGroupChange(this.conversationWith)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (groupDetail: any) => {
            this.groupDetail = groupDetail
            this.logger.log('[CONVS-DETAIL] subscribe to onGroupChange - groupDetail ', this.groupDetail)
          },
          (error) => {
            this.logger.error('[CONVS-DETAIL] subscribe to onGroupChange  - ERROR  ', error)
          },
          () => {
            this.logger.log('[CONVS-DETAIL] subscribe to onGroupChange  /* COMPLETE */')
            this.groupDetail = null
          },
        )
    }
    // const subscribe = { key: subscriptionKey, value: subscription };
    // this.subscriptions.push(subscribe);
    // }
  }

  // -------------------------------------------------
  // addEventsKeyboard
  // -------------------------------------------------
  addEventsKeyboard() {
    window.addEventListener('keyboardWillShow', () => {
      this.logger.log('[CONVS-DETAIL] - Keyboard will Show')
    })
    window.addEventListener('keyboardDidShow', () => {
      this.logger.log('[CONVS-DETAIL] - Keyboard is Shown')
    })
    window.addEventListener('keyboardWillHide', () => {
      this.logger.log('[CONVS-DETAIL] - Keyboard will Hide')
    })
    window.addEventListener('keyboardDidHide', () => {
      this.logger.log('[CONVS-DETAIL] - Keyboard is Hidden')
    })
  }

  // ----------------------------------------------------------------
  // @ Unsubscribe all subscribed events (called in ionViewWillLeave)
  // ----------------------------------------------------------------
  unsubescribeAll() {
    this.logger.log('[CONVS-DETAIL] unsubescribeAll 1: ', this.subscriptions)
    if (this.subscriptions) {
      this.logger.log('[CONVS-DETAIL] unsubescribeAll 2: ', this.subscriptions)
      this.subscriptions.forEach((subscription) => {
        subscription.value.unsubscribe() // vedere come fare l'unsubscribe!!!!
      })
      this.subscriptions = []

      // https://www.w3schools.com/jsref/met_element_removeeventlistener.asp
      window.removeEventListener('keyboardWillShow', null)
      window.removeEventListener('keyboardDidShow', null)
      window.removeEventListener('keyboardWillHide', null)
      window.removeEventListener('keyboardDidHide', null)
    }

    this.unsubscribe$.next()
    this.unsubscribe$.complete()
    // this.conversationHandlerService.dispose();
  }

  /**
   * newMessageAdded
   * @param message
   */
  newMessageAdded(message: MessageModel) {
    if (message) {
      this.logger.log('[CONVS-DETAIL] - newMessageAdded message ', message)

      if (message.isSender) {
        this.scrollBottom(0)
      } else if (!message.isSender) {
        if (this.showButtonToBottom) {
          // NON SONO ALLA FINE
          this.NUM_BADGES++
        } else {
          //SONO ALLA FINE
          this.scrollBottom(0)
        }
      }
    }
  }

  updateConversationBadge() {
    if (
      this.conversationWith &&
      this.conversationsHandlerService &&
      this.conv_type === 'active'
    ) {
      this.conversationsHandlerService.setConversationRead(
        this.conversationWith,
      )
    } else if (
      this.conversationWith &&
      this.archivedConversationsHandlerService &&
      this.conv_type === 'archived'
    ) {
      this.archivedConversationsHandlerService.setConversationRead(
        this.conversationWith,
      )
    }
  }

  // -----------------------------------------------------------
  // OUTPUT-EVENT handler
  // -----------------------------------------------------------
  logScrollStart(event: any) {
    this.logger.log('[CONVS-DETAIL] logScrollStart: ', event)
  }

  logScrolling(event: any) {
    // EVENTO IONIC-NATIVE: SCATTA SEMPRE, QUINDI DECIDO SE MOSTRARE O MENO IL BADGE
    // this.logger.log('[CONVS-DETAIL] logScrolling: ', event);
    this.detectBottom()
  }

  logScrollEnd(event: any) {
    // this.logger.log('[CONVS-DETAIL] logScrollEnd: ', event);
  }

  returnChangeTextArea(e: any) {
    this.logger.log('[CONVS-DETAIL] returnChangeTextArea event', e)
    try {
      let height: number = e.offsetHeight
      if (height < 50) {
        height = 50
      }

      this.heightMessageTextArea = height.toString() //e.target.scrollHeight + 20;
      const message = e.msg
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea heightMessageTextArea ', this.heightMessageTextArea)

      this.logger.log('[CONVS-DETAIL] returnChangeTextArea e.detail.value', e.msg)
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea loggedUser uid:', this.loggedUser.uid)
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea loggedUser firstname:', this.loggedUser.firstname)
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea conversationSelected uid:', this.conversationWith)
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea channelType:', this.channelType)
      let idCurrentUser = ''
      let userFullname = ''

      // serve x mantenere la compatibilità con le vecchie chat
      // if (this.channelType === TYPE_DIRECT) {
      //   userId = this.loggedUser.uid;
      // }
      idCurrentUser = this.loggedUser.uid

      if (
        this.loggedUser.firstname &&
        this.loggedUser.firstname !== undefined
      ) {
        userFullname = this.loggedUser.firstname
      }

      if (message !== '') {
        this.typingService.setTyping(this.conversationWith, message, idCurrentUser, userFullname)
      }

      // ----------------------------------------------------------
      // DISPLAY CANNED RESPONSES if message.lastIndexOf("/")
      // ----------------------------------------------------------
      if (this.areVisibleCAR && this.support_mode === true) {
        setTimeout(() => {
          if (this.conversationWith.startsWith('support-group')) {
            const pos = message.lastIndexOf('/')
            this.logger.log('[CONVS-DETAIL] - returnChangeTextArea - canned responses pos of / (using lastIndexOf) ', pos)

            if (pos === -1) {
              this.tagsCannedFilter = []
              this.HIDE_CANNED_RESPONSES = true
            }
            // test
            // var rest = message.substring(0, message.lastIndexOf("/") + 1);
            // var last = message.substring(message.lastIndexOf("/") + 1, message.length);
            // console.log('[CONVS-DETAIL] - returnChangeTextArea rest', rest);
            // console.log('[CONVS-DETAIL] - returnChangeTextArea last', last);
            // console.log('[CONVS-DETAIL] - returnChangeTextArea last', last.length);
            // if (last.length === 1 && last.trim() === '') {
            //   console.log('[CONVS-DETAIL] - returnChangeTextArea last is a white space ');
            // } else if (last.length === 1 && last.trim() !== '') {
            //   console.log('[CONVS-DETAIL] - returnChangeTextArea last is NOT space ');
            // }

            if (pos >= 0) {
              var strSearch = message.substr(pos + 1)
              this.logger.log('[CONVS-DETAIL] - returnChangeTextArea - canned responses strSearch ', strSearch)

              // --------------------------------------------
              // Load canned responses
              // --------------------------------------------
              this.loadTagsCanned(strSearch, this.conversationWith)

              // ------------------------------------------------------------------------------------------------------------------------------------------
              // Hide / display Canned when the SLASH has POSITION POS 0 and checking if there is a space after the SLASH (in this case it will be hidden)
              // ------------------------------------------------------------------------------------------------------------------------------------------

              var after_slash = message.substring(
                message.lastIndexOf('/') + 1,
                message.length,
              )
              if (
                pos === 0 &&
                after_slash.length === 1 &&
                after_slash.trim() === ''
              ) {
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea after_slash --> there is a white space after ')
                this.HIDE_CANNED_RESPONSES = true
                this.tagsCannedFilter = []
              } else if (pos === 0 && after_slash.length === 0) {
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea after_slash --> there is NOT a white space after')
                this.HIDE_CANNED_RESPONSES = false
              }

              if (pos > 0) {
                // ------------------------------------------------------------------------------------------------------------------------------------------
                // Hide / display Canned when the SLASH has POSITION POS > and checking if there is a space after the SLASH (in this case they it be hidden)
                // and if there is not a space before the SLASH (in this it will be hidden)
                // ------------------------------------------------------------------------------------------------------------------------------------------

                let beforeSlash = message.substr(pos - 1)
                let afterSlash = message.substr(pos + 1)
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea * POS ', pos)

                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea  --> beforeSlash', beforeSlash)
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea  --> afterSlash', afterSlash)
                var afterSlashParts = afterSlash.split('/')
                var beforeSlashParts = beforeSlash.split('/')
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea  --> afterSlash parts', afterSlashParts)
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea  --> beforeSlash parts', beforeSlashParts)

                if (beforeSlashParts.length === 2) {
                  if (
                    beforeSlashParts[0].indexOf(' ') >= 0 &&
                    afterSlashParts[0] === ''
                  ) {
                    this.HIDE_CANNED_RESPONSES = false
                    this.logger.log(
                      '[CONVS-DETAIL] - returnChangeTextArea  --> beforeSlash there is a white space After Not',
                    )
                    // if (beforeSlashParts[0].indexOf(' ') >= 0 && afterSlashParts[0].indexOf(' ') >= 0)
                  } else if (
                    beforeSlashParts[0].indexOf(' ') < 0 &&
                    afterSlashParts[0] === ''
                  ) {
                    this.HIDE_CANNED_RESPONSES = true
                    this.tagsCannedFilter = []
                    this.logger.log('[CONVS-DETAIL] - returnChangeTextArea  --> beforeSlash not thete is a white space After Not')
                  } else if (
                    beforeSlashParts[0].indexOf(' ') >= 0 &&
                    afterSlashParts[0] === ' '
                  ) {
                    this.logger.log('[CONVS-DETAIL] - returnChangeTextArea  --> beforeSlash not thete is a white space After YES')
                    this.HIDE_CANNED_RESPONSES = true
                    this.tagsCannedFilter = []
                  }
                }
              }
            } else {
              this.tagsCannedFilter = []
            }
          }
        }, 300)
      }
      // ./ CANNED RESPONSES //
    } catch (err) {
      this.logger.error('[CONVS-DETAIL] - returnChangeTextArea - error: ', err)
    }
  }

  // ----------------------------------------------------------
  // @ CANNED RESPONSES methods
  // ----------------------------------------------------------
  loadTagsCanned(strSearch, conversationWith) {
    this.logger.log('[CONVS-DETAIL] - loadTagsCanned strSearch ', strSearch)
    this.logger.log('[CONVS-DETAIL] - loadTagsCanned groupDetail ', this.groupDetail)
    this.logger.log('[CONVS-DETAIL] - loadTagsCanned conversationWith ', conversationWith)

    const conversationWith_segments = conversationWith.split('-')
    // Removes the last element of the array if is = to the separator
    if (
      conversationWith_segments[conversationWith_segments.length - 1] === ''
    ) {
      conversationWith_segments.pop()
    }

    if (conversationWith_segments.length === 4) {
      const lastArrayElement =
        conversationWith_segments[conversationWith_segments.length - 1]
      this.logger.log('[CONVS-DETAIL] - lastArrayElement ', lastArrayElement)
      this.logger.log('[CONVS-DETAIL] - lastArrayElement length', lastArrayElement.length)
      if (lastArrayElement.length !== 32) {
        conversationWith_segments.pop()
      }
    }

    this.logger.log('[CONVS-DETAIL] - loadTagsCanned conversationWith_segments ', conversationWith_segments)
    let projectId = ''

    if (conversationWith_segments.length === 4) {
      projectId = conversationWith_segments[2]
      this.logger.log('[CONVS-DETAIL] - loadTagsCanned projectId ', projectId)

      this.getAndShowCannedResponses(strSearch, projectId)
    } else {
      this.getProjectIdByConversationWith(strSearch, this.conversationWith)
    }
  }

  getProjectIdByConversationWith(strSearch, conversationWith: string) {
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()

    this.tiledeskService
      .getProjectIdByConvRecipient(tiledeskToken, conversationWith)
      .subscribe(
        (res) => {
          this.logger.log('[CONVS-DETAIL] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT RES', res)
          if (res) {
            const projectId = res.id_project
            this.logger.log('[CONVS-DETAIL] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT projectId ', projectId)
            if (projectId) {
              this.getAndShowCannedResponses(strSearch, projectId)
            }
          }
        },
        (error) => {
          this.logger.error('[CONVS-DETAIL] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT - ERROR  ', error)
        },
        () => {
          this.logger.log('[CONVS-DETAIL] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT * COMPLETE *')
        },
      )
  }

  getAndShowCannedResponses(strSearch, projectId) {
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log(
      '[CONVS-DETAIL] - loadTagsCanned tagsCanned.length',
      this.tagsCanned.length,
    )
    //if(this.tagsCanned.length <= 0 ){
    this.tagsCanned = []
    this.cannedResponsesService
      .getCannedResponses(tiledeskToken, projectId)
      .subscribe(
        (res) => {
          this.logger.log('[CONVS-DETAIL] - loadTagsCanned  getCannedResponses RES', res)

          this.tagsCanned = res
          this.tagsCannedCount = res.length
          this.logger.log('[CONVS-DETAIL] - loadTagsCanned  getCannedResponses tagsCannedCount', this.tagsCannedCount)
          if (this.HIDE_CANNED_RESPONSES === false) {
            this.showTagsCanned(strSearch)
          }
        },
        (error) => {
          this.logger.error('[CONVS-DETAIL] - loadTagsCanned  getCannedResponses - ERROR  ', error)
        },
        () => {
          this.logger.log('[CONVS-DETAIL] - loadTagsCanned  getCannedResponses * COMPLETE *')
        },
      )
  }

  showTagsCanned(strSearch) {
    this.logger.log('[CONVS-DETAIL] - showTagsCanned strSearch ', strSearch)
    this.tagsCannedFilter = []
    var tagsCannedClone = JSON.parse(JSON.stringify(this.tagsCanned))
    this.logger.log('[CONVS-DETAIL] - showTagsCanned tagsCannedClone ', tagsCannedClone)
    //this.logger.log("that.contacts lenght:: ", strSearch);
    this.tagsCannedFilter = this.filterItems(tagsCannedClone, strSearch)
    this.logger.log('[CONVS-DETAIL] - showTagsCanned tagsCannedFilter ', this.tagsCannedFilter)

    this.tagsCannedFilter.sort(compareValues('title', 'asc'))
    var strReplace = strSearch
    if (strSearch.length > 0) {
      strReplace = "<b class='highlight-search-string'>" + strSearch + '</b>'
    }
    for (var i = 0; i < this.tagsCannedFilter.length; i++) {
      let text = htmlEntities(this.tagsCannedFilter[i].text);
      // const textCanned = "<div class='cannedText'>" + this.replacePlaceholderInCanned(this.tagsCannedFilter[i].text) + '</div>'
      const textCanned = "<div class='cannedText'>" + this.replacePlaceholderInCanned(text) + '</div>'
      let title = htmlEntities(this.tagsCannedFilter[i].title)
      // this.tagsCannedFilter[i].title = "<div class='cannedContent'><div class='cannedTitle'>" + this.tagsCannedFilter[i].title.toString().replace(strSearch, strReplace.trim()) + '</div>' + textCanned + '</div>'
      this.tagsCannedFilter[i].title = "<div class='cannedContent'><div class='cannedTitle'>" + title.toString().replace(strSearch, strReplace.trim()) + '</div>' + textCanned + '</div>'

    }
    if (this.tagsCannedCount === 0) {
      // const button = this.renderer.createElement('button');
      // const buttonText = this.renderer.createText('Click me');
      // this.renderer.appendChild(button, buttonText);
      // console.log('[CONVS-DETAIL] - this.el.nativeElement ', this.el.nativeElement)
      // this.renderer.listen(button, 'click', () => { alert('hi'); });
      // let nocanned = {}
      // if (this.USER_ROLE !== 'agent') {
      const nocanned = {
        // "<div class='cannedContent'><div class='cannedTitle nocannedTitle #noCannedTitle'>" + this.translationMap.get('THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE') + ".</div><div class='cannedText'>" + this.translationMap.get('TO_CREATE_THEM_GO_TO_THE_PROJECT') + '</div></div>'
        // <div class='cannedText no-canned-available-text'>" + this.translationMap.get('AddNewCannedResponse') + '</div>
        title:
          "<div class='cannedContent'><div class='cannedTitle nocannedTitle #noCannedTitle'>" + this.translationMap.get('THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE') + ".</div></div>",
        text: 'There are no canned responses available',
      }
      // } else if (this.USER_ROLE === 'agent') {
      //   nocanned = {
      //     // "<div class='cannedContent'><div class='cannedTitle nocannedTitle #noCannedTitle'>" + this.translationMap.get('THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE') + ".</div><div class='cannedText'>" + this.translationMap.get('TO_CREATE_THEM_GO_TO_THE_PROJECT') + '</div></div>'
      //     title:
      //       "<div class='cannedContent'><div class='cannedTitle nocannedTitle #noCannedTitle'>" + this.translationMap.get('THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE') + ".</div></div>",
      //     text: 'There are no canned responses available',
      //   }
      // }
      this.tagsCannedFilter.push(nocanned)
    }
  }

  toggleSidebar() {
    // console.log('[CONVS-DETAIL] has clicked test')
  }

  filterItems(items, searchTerm) {
    this.logger.log('[CONVS-DETAIL] filterItems tagsCannedClone ', items, ' searchTerm: ', searchTerm)
    //this.logger.log("filterItems::: ",searchTerm);
    return items.filter((item) => {
      //this.logger.log("filterItems::: ", item.title.toString().toLowerCase());
      this.logger.log('[CONVS-DETAIL] filtered tagsCannedClone item ', item)
      return (
        item.title
          .toString()
          .toLowerCase()
          .indexOf(searchTerm.toString().toLowerCase()) > -1
      )
    })
  }

  replacePlaceholderInCanned(str) {
    this.logger.log('[CONVS-DETAIL] - replacePlaceholderInCanned str ', str)
    str = str.replace('$recipient_name', this.conversationWithFullname)
    if (this.loggedUser && this.loggedUser.fullname) {
      str = str.replace('$agent_name', this.loggedUser.fullname)
    }
    return str
  }

  replaceTagInMessage(canned, event) {
    if (this.tagsCannedCount > 0) {
      // console.log('[CONVS-DETAIL] replaceTagInMessage  event ', event)
      // console.log('[CONVS-DETAIL] replaceTagInMessage  canned ', canned)
      // console.log('[CONVS-DETAIL] replaceTagInMessage  canned title', canned.title)
      // console.log('[CONVS-DETAIL] replaceTagInMessage  canned contains nocannedTitle', canned.title.includes('nocannedTitle'))

      const elTextArea = this.rowTextArea['el']
      const textArea = elTextArea.getElementsByTagName('ion-textarea')[0]

      // console.log('[CONVS-DETAIL] replaceTagInMessage  textArea ', textArea)
      // console.log('[CONVS-DETAIL] replaceTagInMessage  textArea value', textArea.value,)

      // var lastChar =  textArea.value.substr(-1); // Selects the last character
      // if (lastChar === '/') {
      //   textArea.value = textArea.value.substring(0, textArea.value.length() - 1);
      // }
      // this.insertAtCursor(this.textArea, textArea.value)

      this.arrowkeyLocation = -1
      this.tagsCannedFilter = []
      this.logger.log('[CONVS-DETAIL] replaceTagInMessage  canned text ', canned.text)

      // replace text
      var pos = textArea.value.lastIndexOf('/')
      var strSearch = textArea.value.substr(pos)
      this.logger.log('[CONVS-DETAIL] replaceTagInMessage strSearch ', strSearch)

      var strTEMP = textArea.value.replace(strSearch, canned.text)
      strTEMP = this.replacePlaceholderInCanned(strTEMP)
      this.logger.log('[CONVS-DETAIL] replaceTagInMessage strSearch ', strTEMP)
      // strTEMP = this.replacePlaceholderInCanned(strTEMP);
      // textArea.value = '';
      // that.messageString = strTEMP;
      textArea.value = strTEMP
      setTimeout(() => {
        // textArea.focus();
        textArea.setFocus()
        this.resizeTextArea()
      }, 200)
    }
    else {
      this.logger.log('[CONVS-DETAIL] THERE IS NOT CANNED ', canned.text)
    }
  }

  async presentCreateCannedResponseModal(): Promise<any> {
    const elTextArea = this.rowTextArea['el']
    const textArea = elTextArea.getElementsByTagName('ion-textarea')[0]
    textArea.value = ''

    // console.log('[CONVS-DETAIL] PRESENT CREATE CANNED RESPONSE MODAL ')
    const attributes = { conversationWith: this.conversationWith }
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: CreateCannedResponsePage,
      componentProps: attributes,
      swipeToClose: false,
      backdropDismiss: false,
    })
    modal.onDidDismiss().then((dataReturned: any) => {
      this.logger.log('[CONVS-DETAIL] ', dataReturned.data)
    })

    return await modal.present()
  }

  hasClickedOpenCannedResponses($event) {
    this.logger.log('[CONVS-DETAIL] - hasClickedOpenCannedResponses ', $event)
    const elTextArea = this.rowTextArea['el']
    const textArea = elTextArea.getElementsByTagName('ion-textarea')[0]

    this.logger.log('[CONVS-DETAIL] hasClickedOpenCannedResponses  textArea ', textArea)
    // console.log("[CONVS-DETAIL] hasClickedOpenCannedResponses  textArea value", textArea.value)
    var lastChar = textArea.value[textArea.value.length - 1]
    // console.log('[CONVS-DETAIL] hasClickedOpenCannedResponses lastChar', lastChar)
    if (lastChar !== '/') {
      this.insertAtCursor(textArea, '/')
    }
    // console.log('[CONVS-DETAIL] hasClickedOpenCannedResponses textArea.value', textArea.value)
    // setTimeout(() => {
    //   // if (textArea.value === '/') {
    //     // textArea.focus();
    //     textArea.setFocus();
    //   // }
    // }, 1500);

    this.setCaretPosition(textArea)
  }

  setCaretPosition(ctrl) {
    ctrl.value.trim()
    ctrl.setFocus()
  }

  insertAtCursor(myField, myValue) {
    this.logger.log('[CONVS-DETAIL] - insertAtCursor - myValue ', myValue)
    this.logger.log('[CONVS-DETAIL] - insertAtCursor - myField ', myField)

    // myValue = ' ' + myValue;

    // console.log('[CONVS-DETAIL] - GET TEXT AREA - Here yes myValue ', myValue);
    // console.log('[CONVS-DETAIL] - GET TEXT AREA - Here yes textArea value length', myField.value.length);

    if (myField.value.length > 0) {
      myValue = ' ' + myValue
    }

    //IE support
    if (myField.selection) {
      myField.focus()
      let sel = myField.selection.createRange()
      sel.text = myValue
      // this.cannedResponseMessage = sel.text;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart
      this.logger.log('[CONVS-DETAIL] - insertAtCursor - startPos ', startPos)

      var endPos = myField.selectionEnd
      this.logger.log('[CONVS-DETAIL] - insertAtCursor - endPos ', endPos)

      myField.value =
        myField.value.substring(0, startPos) +
        myValue +
        myField.value.substring(endPos, myField.value.length)

      // place cursor at end of text in text input element
      myField.focus()
      var val = myField.value //store the value of the element
      myField.value = '' //clear the value of the element
      myField.value = val + ' ' //set that value back.

      // this.cannedResponseMessage = myField.value;

      // this.texareaIsEmpty = false;
      // myField.select();
    } else {
      myField.value += myValue
      // this.cannedResponseMessage = myField.value;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // this.logger.log("CONVERSATION-DETAIL handleKeyboardEvent  event.key ", event.key);

    if (this.tagsCannedFilter.length > 0) {
      if (event.key === 'ArrowDown') {
        this.arrowkeyLocation++
        if (this.arrowkeyLocation === this.tagsCannedFilter.length) {
          this.arrowkeyLocation--
        }
        // this.replaceTagInMessage(this.tagsCannedFilter[this.arrowkeyLocation])
      } else if (event.key === 'ArrowUp') {
        if (this.arrowkeyLocation > 0) {
          this.arrowkeyLocation--
        } else if (this.arrowkeyLocation < 0) {
          this.arrowkeyLocation++
        }
        // this.replaceTagInMessage(this.tagsCannedFilter[this.arrowkeyLocation])
      }

      if (event.key === 'Enter') {
        const canned_selected = this.tagsCannedFilter[this.arrowkeyLocation]
        this.logger.log(
          '[CONVS-DETAIL] replaceTagInMessage  canned_selected ',
          canned_selected,
        )
        if (canned_selected) {
          this.replaceTagInMessage(canned_selected, 'enter')
          // event.preventDefault();
          // return false;
        }
      }
    }
  }
  // ----------------------------------------------------------
  // ./end CANNED RESPONSES methods
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // @ Rule of sound message
  // * if I send it -> NO SOUND
  // * if I'm not in the conversation -> SOUND
  // * if I'm in the conversation at the bottom of the page -> NO SOUND
  // * otherwise -> SOUND
  // ----------------------------------------------------------
  soundMessage() {
    const that = this
    this.audio = new Audio()
    // this.audio.src = '/assets/sounds/pling.mp3';
    this.audio.src = URL_SOUND_LIST_CONVERSATION
    this.audio.load()
    this.logger.log(
      '[CONVS-DETAIL] soundMessage conversation this.audio',
      this.audio,
    )
    clearTimeout(this.setTimeoutSound)
    this.setTimeoutSound = setTimeout(function () {
      that.audio
        .play()
        .then(() => {
          // Audio is playing.
          this.logger.log(
            '[CONVS-DETAIL] soundMessag that.audio.src ',
            that.audio.src,
          )
        })
        .catch((error) => {
          that.logger.error(error)
        })
    }, 1000)
  }

  returnOnBeforeMessageRender(event) {
    //this.onBeforeMessageRender.emit(event)
  }

  returnOnAfterMessageRender(event) {
    // this.onAfterMessageRender.emit(event)
  }

  returnOnMenuOption(event: boolean) {
    // this.isMenuShow = event;
  }

  returnOnScrollContent(event: boolean) { }

  returnOnAttachmentButtonClicked(event: any) {
    this.logger.debug('[CONV-COMP] eventbutton', event)
    if (!event || !event.target.type) {
      return
    }
    switch (event.target.type) {
      case 'url':
        try {
          this.openLink(event.target.button)
        } catch (err) {
          this.logger.error('[CONV-COMP] url > Error :' + err)
        }
        return
      case 'action':
        try {
          this.actionButton(event.target.button)
        } catch (err) {
          this.logger.error('[CONV-COMP] action > Error :' + err)
        }
        return false
      case 'text':
        try {
          const text = event.target.button.value
          const metadata = { button: true }
          this.sendMessage(text, TYPE_MSG_TEXT, metadata)
        } catch (err) {
          this.logger.error('[CONV-COMP] text > Error :' + err)
        }
      default:
        return
    }
  }

  onImageRenderedFN(event) {
    const imageRendered = event
    if (this.showButtonToBottom) {
      this.scrollBottom(0)
    }
  }

  private openLink(event: any) {
    const link = event.link ? event.link : ''
    const target = event.target ? event.target : ''
    if (target === 'self' || target === 'parent') {
      window.open(link, '_parent')
    } else {
      window.open(link, '_blank')
    }
  }

  private actionButton(event: any) {
    // console.log(event);
    const action = event.action ? event.action : ''
    const message = event.value ? event.value : ''
    const subtype = event.show_reply ? '' : 'info'

    const attributes = {
      action: action,
      subtype: subtype,
    }
    this.sendMessage(message, TYPE_MSG_TEXT, null, attributes)
    this.logger.debug('[CONV-COMP] > action :')
  }

  addUploadingBubbleEvent(event: boolean) {
    this.logger.log('[CONVS-DETAIL] addUploadingBubbleEvent event', event)
    if (event === true) {
      this.scrollBottom(0)
    }
  }

  onPresentModalScrollToBottom(event: boolean) {
    this.logger.log('[CONVS-DETAIL] onPresentModalScrollToBottom event', event)
    if (event === true) {
      this.scrollBottom(0)
    }
  }

  // -------------- START SCROLL/RESIZE  -------------- //
  /** */
  resizeTextArea() {
    try {
      const elTextArea = this.rowTextArea['el']
      const that = this
      setTimeout(() => {
        const textArea = elTextArea.getElementsByTagName('ion-textarea')[0]
        if (textArea) {
          this.logger.log('[CONVS-DETAIL] resizeTextArea textArea ', textArea)
          const txtValue = textArea.value
          textArea.value = ' '
          textArea.value = txtValue
        }
      }, 0)
      setTimeout(() => {
        if (elTextArea) {
          this.logger.log(
            '[CONVS-DETAIL] resizeTextArea elTextArea.offsetHeight ',
            elTextArea.offsetHeight,
          )
          that.heightMessageTextArea = elTextArea.offsetHeight
        }
      }, 100)
    } catch (err) {
      this.logger.error('[CONVS-DETAIL] resizeTextArea - error: ', err)
    }
  }

  /**
   * scrollBottom
   * @param time
   */
  private scrollBottom(time: number) {
    this.showIonContent = true
    if (this.ionContentChatArea) {
      setTimeout(() => {
        this.ionContentChatArea.scrollToBottom(time)
      }, 0)
      // nota: se elimino il settimeout lo scrollToBottom non viene richiamato!!!!!
    }
  }

  /**
   * detectBottom
   */
  async detectBottom() {
    const scrollElement = await this.ionContentChatArea.getScrollElement()

    if (
      scrollElement.scrollTop <
      scrollElement.scrollHeight - scrollElement.clientHeight
    ) {
      //NON SONO ALLA FINE --> mostra badge
      this.showButtonToBottom = true
    } else {
      // SONO ALLA FINE --> non mostrare badge,
      this.showButtonToBottom = false
    }
  }

  /**
   * Scroll to bottom of page after a short delay.
   * FIREBY BY: click event ScrollToBottom bottom-right icon button
   */
  public actionScrollBottom() {
    this.logger.log(
      '[CONVS-DETAIL] actionScrollBottom - ionContentChatArea: ',
      this.ionContentChatArea,
    )
    // const that = this;
    this.showButtonToBottom = false
    this.updateConversationBadge()
    this.NUM_BADGES = 0
    setTimeout(() => {
      this.ionContentChatArea.scrollToBottom(0)
      // this.conversationsHandlerService.readAllMessages.next(this.conversationWith);
    }, 0)
  }

  /**
   * Scroll to top of the page after a short delay.
   */
  scrollTop() {
    this.logger.log('[CONVS-DETAIL] scrollTop')
    this.ionContentChatArea.scrollToTop(100)
  }

  /** */
  setHeightTextArea() {
    try {
      if (this.rowTextArea) {
        this.heightMessageTextArea = this.rowTextArea['el'].offsetHeight
        this.logger.log(
          '[CONVS-DETAIL] setHeightTextArea - heightMessageTextArea: ',
          this.heightMessageTextArea,
        )
      }
    } catch (e) {
      this.logger.error('[CONVS-DETAIL] setHeightTextArea - ERROR ', e)
      // this.heightMessageTextArea = '50';
      this.heightMessageTextArea = '57' // NK edited
    }
  }
  checkAcceptedFile(draggedFileMimeType) {
    let isAcceptFile = false
    this.logger.log(
      '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept: ',
      this.appConfigProvider.getConfig().fileUploadAccept,
    )
    const accept_files = this.appConfigProvider.getConfig().fileUploadAccept
    this.logger.log(
      '[CONVS-DETAIL] > checkAcceptedFile - mimeType: ',
      draggedFileMimeType,
    )
    if (accept_files === '*/*') {
      isAcceptFile = true
      return isAcceptFile
    } else if (accept_files !== '*/*') {
      this.logger.log(
        '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept typeof accept_files ',
        typeof accept_files,
      )
      const accept_files_array = accept_files.split(',')
      this.logger.log(
        '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_files_array ',
        accept_files_array,
      )
      this.logger.log(
        '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_files_array typeof: ',
        typeof accept_files_array,
      )

      accept_files_array.forEach((accept_file) => {
        this.logger.log(
          '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_file ',
          accept_file,
        )
        const accept_file_segment = accept_file.split('/')
        this.logger.log(
          '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_file_segment ',
          accept_file_segment,
        )
        if (accept_file_segment[1] === '*') {
          if (draggedFileMimeType.startsWith(accept_file_segment[0])) {
            isAcceptFile = true
            this.logger.log(
              '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile',
              isAcceptFile,
            )
            return isAcceptFile
          } else {
            isAcceptFile = false
            this.logger.log(
              '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile',
              isAcceptFile,
            )
            return isAcceptFile
          }
        } else if (accept_file_segment[1] !== '*') {
          if (draggedFileMimeType === accept_file) {
            isAcceptFile = true
            this.logger.log(
              '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile',
              isAcceptFile,
            )
            return isAcceptFile
          }
        }
        return isAcceptFile
      })
      return isAcceptFile
    }
  }
  // -------------------------------------------------------------
  // DRAG FILE
  // -------------------------------------------------------------
  // DROP (WHEN THE FILE IS RELEASED ON THE DROP ZONE)
  drop(ev: any) {
    ev.preventDefault()
    ev.stopPropagation()

    this.logger.log('[CONVS-DETAIL] ----> FILE - DROP ev ', ev)
    const fileList = ev.dataTransfer.files
    this.logger.log(
      '[CONVS-DETAIL] ----> FILE - DROP ev.dataTransfer.files ',
      fileList,
    )
    this.isHovering = false
    this.logger.log(
      '[CONVS-DETAIL] ----> FILE - DROP isHovering ',
      this.isHovering,
    )
    if (fileList.length > 0) {
      const file: File = fileList[0]
      this.logger.log('[CONVS-DETAIL] ----> FILE - DROP file ', file)

      var mimeType = fileList[0].type
      this.logger.log(
        '[CONVS-DETAIL] ----> FILE - DROP mimeType files ',
        mimeType,
      )

      // if (mimeType.startsWith("image") || mimeType.startsWith("application")) {
      // this.logger.log('[CONVS-DETAIL] ----> FILE - DROP mimeType files: ', this.appConfigProvider.getConfig().fileUploadAccept);
      // this.checkAcceptedFile(mimeType);
      const isAccepted = this.checkAcceptedFile(mimeType)
      this.logger.log(
        '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile FILE - DROP',
        isAccepted,
      )
      if (isAccepted === true) {
        this.handleDropEvent(ev)
      } else {
        this.logger.log(
          '[CONVS-DETAIL] ----> FILE - DROP mimeType files ',
          mimeType,
          'NOT SUPPORTED FILE TYPE',
        )
        this.presentToastOnlyImageFilesAreAllowedToDrag()
      }
    }
  }

  handleDropEvent(ev) {
    this.logger.log('[CONVS-DETAIL] ----> FILE - HANDLE DROP  EVENT ', ev)
    this.dropEvent = ev
  }

  // DRAG OVER (WHEN HOVER OVER ON THE "DROP ZONE")
  allowDrop(ev: any) {
    ev.preventDefault()
    ev.stopPropagation()
    this.logger.log('[CONVS-DETAIL] ----> FILE - (dragover) allowDrop ev ', ev)
    this.isHovering = true
    this.logger.log(
      '[CONVS-DETAIL] ----> FILE - (dragover) allowDrop isHovering ',
      this.isHovering,
    )
  }

  // DRAG LEAVE (WHEN LEAVE FROM THE DROP ZONE)
  drag(ev: any) {
    ev.preventDefault()
    ev.stopPropagation()
    this.logger.log('[CONVS-DETAIL] ----> FILE - (dragleave) drag ev ', ev)
    this.isHovering = false
    this.logger.log(
      '[CONVS-DETAIL] ----> FILE - FILE - (dragleave) drag his.isHovering ',
      this.isHovering,
    )
  }

  async presentToastOnlyImageFilesAreAllowedToDrag() {
    const toast = await this.toastController.create({
      message: this.translationMap.get(
        'FAILED_TO_UPLOAD_THE_FORMAT_IS_NOT_SUPPORTED',
      ),
      duration: 5000,
      color: 'danger',
      cssClass: 'toast-custom-class',
    })
    toast.present()
  }
}
// END ALL //

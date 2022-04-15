import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigProvider } from 'src/app/services/app-config';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from 'src/app/services/events-service';
import { tranlatedLanguage } from '../../../chat21-core/utils/constants';

// utils
import { avatarPlaceholder, getColorBck } from 'src/chat21-core/utils/utils-user';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  private logger: LoggerService = LoggerInstance.getInstance();

  USER_ROLE: string;
  SIDEBAR_IS_SMALL = true
  IS_AVAILABLE: boolean;
  user: any;
  IS_BUSY: boolean;

  isVisibleAPP: boolean;
  isVisibleANA: boolean;
  isVisibleACT: boolean;
  photo_profile_URL: string;
  project_id: string;
  DASHBOARD_URL: string;
  // HAS_CLICKED_OPEN_USER_DETAIL: boolean = false
  public translationMap: Map<string, string>;
  public_Key: any;
  conversations_lbl: string;
  contacts_lbl: string;
  apps_lbl: string;
  analytics_lbl: string;
  activities_lbl: string;
  history_lbl: string;
  settings_lbl: string;
  countClickOnOpenUserDetailSidebar: number = 0
  USER_PHOTO_PROFILE_EXIST: boolean;
  currentUser: any;
  dashboard_home_url: string;
  dashboard_bots_url: string;
  dashboard_convs_url: string;
  dashboard_contacts_url: string;
  dashboard_app_url: string;
  dashboard_analytics_url: string;
  dashboard_activities_url: string;
  dashboard_history_url: string;
  dashboard_settings_url: string;
  constructor(
    public imageRepoService: ImageRepoService,
    public appStorageService: AppStorageService,
    public appConfig: AppConfigProvider,
    private translateService: CustomTranslateService,
    private messagingAuthService: MessagingAuthService,
    public wsService: WebsocketService,
    public appConfigProvider: AppConfigProvider,
    private translate: TranslateService,
    public events: EventsService,

  ) { }

  ngOnInit() {
    this.DASHBOARD_URL = this.appConfig.getConfig().dashboardUrl + '#/project/';
    // console.log('[SIDEBAR] DASHBOARD_URL ', this.DASHBOARD_URL)
    this.getStoredProjectAndUserRole()
    this.subcribeToAuthStateChanged()
    this.listenTocurrentProjectUserUserAvailability$()
    this.getOSCODE();
    this.getCurrentChatLangAndTranslateLabels();

    // this.loggedUser = this.chatManager.getCurrentUser();
    // if (this.loggedUser) {
    //   this.itemAvatar = {
    //     imageurl: this.imageRepoService.getImagePhotoUrl(this.loggedUser.uid),
    //     avatar: this.loggedUser.avatar,
    //     color: this.loggedUser.color,
    //     online: this.loggedUser.online,
    //     lastConnection: this.loggedUser.lastConnection,
    //     status: '',
    //     width: '35px',
    //     height: '35px'
    //   };
    // }


  }


  getStoredProjectAndUserRole() {
    const stored_project = localStorage.getItem('last_project')
    // console.log('[SIDEBAR] stored_project ', stored_project)
    if (stored_project) {
      const project = JSON.parse(stored_project)
      this.logger.log('[SIDEBAR] project ', project)

      this.project_id = project.id_project.id
      this.logger.log('[SIDEBAR] project_id ', this.project_id)

      this.USER_ROLE = project.role;
      this.logger.log('[SIDEBAR] USER_ROLE ', this.USER_ROLE)
      this.buildURLs(this.USER_ROLE)
    }
  }

  buildURLs(USER_ROLE) {
    this.dashboard_home_url = this.DASHBOARD_URL + this.project_id + '/home'
    this.dashboard_bots_url = this.DASHBOARD_URL + this.project_id + '/bots'
    this.dashboard_convs_url = this.DASHBOARD_URL + this.project_id + '/wsrequests'
    this.dashboard_contacts_url = this.DASHBOARD_URL + this.project_id + '/contacts'
    this.dashboard_app_url = this.DASHBOARD_URL + this.project_id + '/app-store'
    this.dashboard_analytics_url = this.DASHBOARD_URL + this.project_id + '/analytics'
    this.dashboard_activities_url = this.DASHBOARD_URL + this.project_id + '/activities'
    this.dashboard_history_url = this.DASHBOARD_URL + this.project_id + '/history'
    this.dashboard_settings_url = ''
    if (USER_ROLE !== 'agent') {
      this.dashboard_settings_url = this.DASHBOARD_URL + this.project_id + '/widget-set-up'
    } else if (USER_ROLE === 'agent') {
      this.dashboard_settings_url = this.DASHBOARD_URL + this.project_id + '/cannedresponses'
    }

  }

  subcribeToAuthStateChanged() {
    this.messagingAuthService.BSAuthStateChanged.subscribe((state) => {
      this.logger.log('[SIDEBAR] BSAuthStateChanged ', state)

      if (state === 'online') {
        this.currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
        this.logger.log('[SIDEBAR] currentUser ', this.currentUser)
        if (this.currentUser) {
          this.createUserAvatar(this.currentUser)
          this.photo_profile_URL = this.imageRepoService.getImagePhotoUrl(this.currentUser.uid)
          this.logger.log('[SIDEBAR] photo_profile_URL ', this.photo_profile_URL)
          this.checkIfExistPhotoProfile(this.photo_profile_URL)
        }

      }
    })
  }

  checkIfExistPhotoProfile(imageUrl) {
    this.verifyImageURL(imageUrl, (imageExists) => {

      if (imageExists === true) {
        this.USER_PHOTO_PROFILE_EXIST = true;
        this.logger.log('[SIDEBAR] photo_profile_URL IMAGE EXIST ', imageExists)

      } else {
        this.USER_PHOTO_PROFILE_EXIST = false;
        this.logger.log('[SIDEBAR] photo_profile_URL IMAGE EXIST ', imageExists)
      }
    })
  }

  createUserAvatar(currentUser) {
    this.logger.log('[SIDEBAR] - createProjectUserAvatar ', currentUser)
    let fullname = ''
    if (currentUser && currentUser.firstname && currentUser.lastname) {
      fullname = currentUser.firstname + ' ' + currentUser.lastname
      currentUser['fullname_initial'] = avatarPlaceholder(fullname)
      currentUser['fillColour'] = getColorBck(fullname)
    } else if (currentUser && currentUser.firstname) {
      fullname = currentUser.firstname
      currentUser['fullname_initial'] = avatarPlaceholder(fullname)
      currentUser['fillColour'] = getColorBck(fullname)
    } else {
      currentUser['fullname_initial'] = 'N/A'
      currentUser['fillColour'] = 'rgb(98, 100, 167)'
    }
  }

  verifyImageURL(image_url, callBack) {
    const img = new Image();
    img.src = image_url;
    img.onload = function () {
      callBack(true);
    };
    img.onerror = function () {
      callBack(false);
    };
  }

  getCurrentChatLangAndTranslateLabels() {
    const browserLang = this.translate.getBrowserLang();
    const currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
    // console.log('[SIDEBAR] - ngOnInit - currentUser ', currentUser)
    // console.log('[SIDEBAR] - ngOnInit - browserLang ', browserLang)
    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid
      // console.log('[SIDEBAR] - ngOnInit - currentUserId ', currentUserId)
    }

    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
    // console.log('[SIDEBAR] stored_preferred_lang: ', stored_preferred_lang);

    let chat_lang = '';
    if (browserLang && !stored_preferred_lang) {
      chat_lang = browserLang
      this.logger.log('[SIDEBAR] chat_lang: ', chat_lang);
    } else if (browserLang && stored_preferred_lang) {
      chat_lang = stored_preferred_lang
      this.logger.log('[SIDEBAR] chat_lang: ', chat_lang);
    }
    if (tranlatedLanguage.includes(chat_lang)) {
      this.logger.log('[SIDEBAR] tranlatedLanguage includes', chat_lang, ': ', tranlatedLanguage.includes(chat_lang))
      this.translate.use(chat_lang);
    } else {
      this.logger.log('[SIDEBAR] tranlatedLanguage includes', chat_lang, ': ', tranlatedLanguage.includes(chat_lang))
      this.translate.use('en');
    }
    this.translateLabels()
  }


  translateLabels() {
    this.getConversationsTranslation();
    this.getContactsTranslation();
    this.getActivitiesTranslation();
    this.getAppsTranslation();
    this.getAnalyticsTranslation();
    this.getHistoryTranslation();
    this.getSettingsTranslation()
  }

  getConversationsTranslation() {
    this.translate.get('Conversations')
      .subscribe((text: string) => {
        // console.log('[SIDEBAR] - translate Conversations', text)
        this.conversations_lbl = text
      });
  }

  getContactsTranslation() {
    this.translate.get('LABEL_CONTACTS')
      .subscribe((text: string) => {
        // console.log('[SIDEBAR] - translate Contacts', text)
        this.contacts_lbl = text
      });
  }

  getAppsTranslation() {
    this.translate.get('Apps')
      .subscribe((text: string) => {
        // console.log('[SIDEBAR] - translate Apps', text)
        this.apps_lbl = text
      });
  }

  getAnalyticsTranslation() {
    this.translate.get('Analytics')
      .subscribe((text: string) => {
        // console.log('[SIDEBAR] - translate Analytics', text)
        this.analytics_lbl = text
      });
  }

  getActivitiesTranslation() {
    this.translate.get('Activities')
      .subscribe((text: string) => {
        // console.log('[SIDEBAR] - translate Activities', text)
        this.activities_lbl = text
      });
  }

  getHistoryTranslation() {
    this.translate.get('History')
      .subscribe((text: string) => {
        // console.log('[SIDEBAR] - translate History', text)
        this.history_lbl = text
      });
  }

  getSettingsTranslation() {
    this.translate.get('Settings')
      .subscribe((text: string) => {
        // console.log('[SIDEBAR] - translate Settings', text)
        this.settings_lbl = text
      });
  }

  getOSCODE() {
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[SIDEBAR] AppConfigService getAppConfig public_Key', this.public_Key);

    if (this.public_Key) {
      let keys = this.public_Key.split("-");
      this.logger.log('[SIDEBAR] PUBLIC-KEY - public_Key keys', keys)

      keys.forEach(key => {

        if (key.includes("ANA")) {

          let ana = key.split(":");

          if (ana[1] === "F") {
            this.isVisibleANA = false;
          } else {
            this.isVisibleANA = true;
          }
        }

        if (key.includes("ACT")) {
          let act = key.split(":");
          if (act[1] === "F") {
            this.isVisibleACT = false;
          } else {
            this.isVisibleACT = true;
          }
        }

        if (key.includes("APP")) {
          let lbs = key.split(":");
          if (lbs[1] === "F") {
            this.isVisibleAPP = false;
          } else {
            this.isVisibleAPP = true;
          }
        }
      });


      if (!this.public_Key.includes("ANA")) {
        this.isVisibleANA = false;
      }

      if (!this.public_Key.includes("ACT")) {
        this.isVisibleACT = false;
      }


      if (!this.public_Key.includes("APP")) {
        this.isVisibleAPP = false;
      }

    } else {
      this.isVisibleANA = false;
      this.isVisibleACT = false;
      this.isVisibleAPP = false;
    }


  }

  listenTocurrentProjectUserUserAvailability$() {
    this.wsService.currentProjectUserAvailability$.subscribe((projectUser) => {
      this.logger.log('[SIDEBAR] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS RES ', projectUser);

      this.IS_AVAILABLE = projectUser['user_available']
      this.IS_BUSY = projectUser['isBusy']
      // if (project.id_project._id === projectUser['id_project']) {
      //   project['ws_projct_user_available'] = projectUser['user_available'];
      //   project['ws_projct_user_isBusy'] = projectUser['isBusy']
      //   if (this.translationMap) {
      //     if (projectUser['user_available'] === true) {
      //       this.avaialble_status_for_tooltip = this.translationMap.get('CHANGE_TO_YOUR_STATUS_TO_UNAVAILABLE')
      //     } else {
      //       this.avaialble_status_for_tooltip = this.translationMap.get('CHANGE_TO_YOUR_STATUS_TO_AVAILABLE')
      //     }
      //   }
      // }

    }, (error) => {
      this.logger.error('[SIDEBAR] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
    }, () => {
      this.logger.log('[SIDEBAR] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
    })
  }

  openUserDetailSidePanel() {
    this.countClickOnOpenUserDetailSidebar++
    this.logger.log('[SIDEBAR-CHAT] countClickOnOpenUserDetailSidebar', this.countClickOnOpenUserDetailSidebar)
    this.logger.log('[SIDEBAR-CHAT] OPEN UESER DTLS SIDE PANEL')
    // this.HAS_CLICKED_OPEN_USER_DETAIL = true
    // console.log('[SIDEBAR-CHAT] OPEN USER DTLS SIDE PANEL ', this.HAS_CLICKED_OPEN_USER_DETAIL)
    const elSidebarUserDtls = <HTMLElement>document.querySelector('#user-details');
    this.logger.log('[SIDEBAR] OPEN USER DTLS SIDE PANEL elSidebarUserDtls ', elSidebarUserDtls)

    // if (elSidebarUserDtls) {
    //   elSidebarUserDtls.classList.add("active");
    //   this.events.publish('userdetailsidebar:opened', true);
    // }
    if (elSidebarUserDtls && this.countClickOnOpenUserDetailSidebar === 1) {
      elSidebarUserDtls.classList.add("active");
    }
    if (elSidebarUserDtls && this.countClickOnOpenUserDetailSidebar > 1) {
      // console.log('[SIDEBAR] this.countClickOnOpenUserDetailSidebar HERE', this.countClickOnOpenUserDetailSidebar)
      if (elSidebarUserDtls.classList.contains('active')) {
        this.logger.log('[SIDEBAR-CHAT] elSidebarUserDtls contains class ACTIVE', elSidebarUserDtls)
        elSidebarUserDtls.classList.remove("active");
      } else if (!elSidebarUserDtls.classList.contains('active')) {
        this.logger.log('[SIDEBAR-CHAT] elSidebarUserDtls NOT contains class ACTIVE', elSidebarUserDtls)
        elSidebarUserDtls.classList.add("active");
      }
    }
  }

  // onCloseUserDetailsSidebar($event) {
  // this.logger.log('[SIDEBAR-CHAT] HAS_CLICKED_CLOSE_USER_DETAIL ', $event)
  // this.HAS_CLICKED_OPEN_USER_DETAIL = $event
  // const elemNavbar = <HTMLElement>document.querySelector('.navbar-absolute');
  // this.logger.log('[SIDEBAR] elemNavBar ', elemNavbar)
  // if (elemNavbar) {
  //   elemNavbar.classList.remove("navbar-absolute-custom-class")
  // }

  // const elemNavbarBrand = <HTMLElement>document.querySelector('.navbar-brand');
  // this.logger.log('[SIDEBAR] elemNavbarBrand ', elemNavbarBrand)
  // if (elemNavbarBrand) {
  //   elemNavbarBrand.classList.remove("navbar-brand-z-index-zero")
  // }
  // }



  goToHome() {
    let url = this.DASHBOARD_URL + this.project_id + '/home'
    this.dashboard_home_url = url;
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToBots() {
    let url = this.DASHBOARD_URL + this.project_id + '/bots'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToConversations() {
    let url = this.DASHBOARD_URL + this.project_id + '/wsrequests'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToContacts() {
    let url = this.DASHBOARD_URL + this.project_id + '/contacts'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToAppStore() {
    let url = this.DASHBOARD_URL + this.project_id + '/app-store'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }


  goToAnalytics() {
    let url = this.DASHBOARD_URL + this.project_id + '/analytics'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }


  goToActivities() {
    let url = this.DASHBOARD_URL + this.project_id + '/activities'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToHistory() {
    let url = this.DASHBOARD_URL + this.project_id + '/history'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToWidgetSetUpOrToCannedResponses() {
    if (this.USER_ROLE !== 'agent') {
      this.goToWidgetSetUp()
    } else if (this.USER_ROLE === 'agent') {
      this.goToSettings_CannedResponses()
    }
  }

  goToWidgetSetUp() {
    let url = this.DASHBOARD_URL + this.project_id + '/widget-set-up'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToSettings_CannedResponses() {
    let url = this.DASHBOARD_URL + this.project_id + '/cannedresponses'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }



  public translations() {
    const keys = [
      'Available',
      'Unavailable',
      'Busy',
      'VIEW_ALL_CONVERSATIONS',
      'CONVERSATIONS_IN_QUEUE',
      'CONVERSATION_IN_QUEUE',
      'NO_CONVERSATION_IN_QUEUE',
      'PINNED_PROJECT',
      'CHANGE_PINNED_PROJECT',
      "CHANGE_TO_YOUR_STATUS_TO_AVAILABLE",
      "CHANGE_TO_YOUR_STATUS_TO_UNAVAILABLE"
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }


  changeAvailabilityState(IS_AVAILABLE) {

  }













}





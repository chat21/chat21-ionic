import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { skip } from 'rxjs/operators';
import { AppConfigProvider } from 'src/app/services/app-config';
import { EventsService } from 'src/app/services/events-service';


@Component({
  selector: 'app-sidebar-user-details',
  templateUrl: './sidebar-user-details.component.html',
  styleUrls: ['./sidebar-user-details.component.scss'],
})
export class SidebarUserDetailsComponent implements OnInit, OnChanges {
  HAS_CLICKED_OPEN_USER_DETAIL: boolean = false;
  // @Output() onCloseUserDetailsSidebar = new EventEmitter();


  public browserLang: string;
  private logger: LoggerService = LoggerInstance.getInstance()
  chat_lang: string
  flag_url: string;
  photo_profile_URL: string;
  IS_BUSY: boolean;
  IS_AVAILABLE: boolean;
  USER_ROLE: boolean;
  USER_ROLE_LABEL: string;
  IS_BUSY_msg: string;
  IS_AVAILABLE_msg: string;
  IS_UNAVAILABLE_msg: string;
  SUBSCRIPTION_PAYMENT_PROBLEM_msg: string;
  THE_PLAN_HAS_EXPIRED_msg: string;
  PAYD_PLAN_NAME_PRO_msg: string;
  PAYD_PLAN_NAME_ENTERPRISE_msg: string;
  PRO_PLAN_TRIAL_msg: string;
  FREE_PLAN_msg: string;
  profile_name_translated: string;
  SubscriptionPaymentProblem: string;
  user: any
  projectID: any
  tiledeskToken: string;
  prjct_name: string;
  plan_type: string;
  _prjct_profile_name: string;

  isVisiblePAY: boolean;
  public_Key: any
  plan_name: string;
  plan_subscription_is_active: boolean;
  constructor(
    private translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public imageRepoService: ImageRepoService,
    public appStorageService: AppStorageService,
    private messagingAuthService: MessagingAuthService,
    public wsService: WebsocketService,
    public appConfigProvider: AppConfigProvider,
    public events: EventsService,
    private eRef: ElementRef,
  ) { }

  ngOnInit() {
    this.getCurrentChatLangAndTranslateLabels();
    this.subcribeToAuthStateChanged();
    this.listenTocurrentProjectUserUserAvailability$();
    this.getCurrentStoredProject();
    this.getOSCODE();
    this.listenOpenUserSidebarEvent();
  }

  listenOpenUserSidebarEvent() {
    this.events.subscribe('userdetailsidebar:opened', (openUserDetailsSidebar) => {
    console.log('[SIDEBAR-USER-DETAILS] - listenOpenUserSidebarEvent - openUserDetailsSidebar', openUserDetailsSidebar);
    this.HAS_CLICKED_OPEN_USER_DETAIL = true;
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    console.log('[SIDEBAR-USER-DETAILS] clickout event.target)', event.target)
    console.log('[SIDEBAR-USER-DETAILS] clickout event.target)', event.target.id)
    const clicked_element_id = event.target.id
    if (this.eRef.nativeElement.contains(event.target)) {
      console.log('[SIDEBAR-USER-DETAILS] clicked inside')
    } else {
      console.log('[SIDEBAR-USER-DETAILS] HAS_CLICKED_OPEN_USER_DETAIL ', this.HAS_CLICKED_OPEN_USER_DETAIL)
      if (this.HAS_CLICKED_OPEN_USER_DETAIL === true) {
        if (!clicked_element_id.startsWith("sidebaravatar")) {
          this.closeUserDetailSidePanel();
        }
        console.log('[SIDEBAR-USER-DETAILS] clicked outside')
      }
    }
  }

  getCurrentChatLangAndTranslateLabels() {
    this.browserLang = this.translate.getBrowserLang();
    const currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
    console.log('[SIDEBAR-USER-DETAILS] - ngOnInit - currentUser ', currentUser)
    console.log('[SIDEBAR-USER-DETAILS] - ngOnInit - browserLang ', this.browserLang)
    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid
      console.log('[SIDEBAR-USER-DETAILS] - ngOnInit - currentUserId ', currentUserId)
    }

    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
    console.log('[SIDEBAR-USER-DETAILS] stored_preferred_lang: ', stored_preferred_lang);


    this.chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      this.chat_lang = this.browserLang
      this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"

      console.log('[SIDEBAR-USER-DETAILS] flag_url: ', this.flag_url);
      console.log('[SIDEBAR-USER-DETAILS] chat_lang: ', this.chat_lang);
    } else if (this.browserLang && stored_preferred_lang) {
      this.chat_lang = stored_preferred_lang
      this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"
      console.log('[SIDEBAR-USER-DETAILS] flag_url: ', this.flag_url);
      console.log('[SIDEBAR-USER-DETAILS] chat_lang: ', this.chat_lang);
    }

    this.translate.use(this.chat_lang);
    this.translateLabels()
  }

  translateLabels() {
    this.getAvailableTranslation();
    this.getUnavailableTranslation();
    this.getIsBusyTranslation();
    this.getSubscriptionPaymentProblemTranslation();
    this.getThePlanHasExpiredTranslation();
  }


  getOSCODE() {
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    console.log('[SIDEBAR-USER-DETAILS] AppConfigService getAppConfig public_Key', this.public_Key);
    console.log('[SIDEBAR-USER-DETAILS] AppConfigService getAppConfig', this.appConfigProvider.getConfig());
    if (this.public_Key) {
      let keys = this.public_Key.split("-");
      this.logger.log('[SIDEBAR-USER-DETAILS] PUBLIC-KEY - public_Key keys', keys)

      keys.forEach(key => {
        if (key.includes("PAY")) {

          let pay = key.split(":");

          if (pay[1] === "F") {
            this.isVisiblePAY = false;
          } else {
            this.isVisiblePAY = true;
          }
        }
      });

      if (!this.public_Key.includes("PAY")) {
        this.isVisiblePAY = false;
      }
    } else {
      this.isVisiblePAY = false;
    }
  }

  getAvailableTranslation() {
    this.translate.get('Available')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.IS_AVAILABLE_msg = text
      });
  }
  getUnavailableTranslation() {
    this.translate.get('Unavailable')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.IS_UNAVAILABLE_msg = text
      });
  }

  getIsBusyTranslation() {
    this.translate.get('Busy')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.IS_BUSY_msg = text
      });
  }

  getSubscriptionPaymentProblemTranslation() {
    this.translate.get('SubscriptionPaymentProblem')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.SUBSCRIPTION_PAYMENT_PROBLEM_msg = text
      });
  }

  getThePlanHasExpiredTranslation() {
    this.translate.get('ThePlanHasExpired')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.THE_PLAN_HAS_EXPIRED_msg = text
      });
  }


  getCurrentStoredProject() {
    try {
      const project = localStorage.getItem('last_project')


      if (project) {
        const projectObjct = JSON.parse(localStorage.getItem('last_project'))
        console.log('[SIDEBAR-USER-DETAILS] - GET STORED PROJECT ', projectObjct)

        this.projectID = projectObjct['id_project']['_id']
        console.log('[SIDEBAR-USER-DETAILS] - GET STORED PROJECT > PROJECT ID ', this.projectID);

        this.prjct_name = projectObjct['id_project']['name']
        console.log('[SIDEBAR-USER-DETAILS] - GET STORED PROJECT > PROJECT NAME ', this.prjct_name);

        this.plan_type = projectObjct['id_project']['profile']['type'];
        console.log('[SIDEBAR-USER-DETAILS] - GET STORED PROJECT > PLAN TYPE ', this.plan_type);

        const trial_expired = projectObjct['id_project']['trialExpired']
        console.log('[SIDEBAR-USER-DETAILS] - GET STORED PROJECT > TRIAL EXPIRED ', trial_expired);

        const profile_name = projectObjct['id_project']['profile']['name'];
        console.log('[SIDEBAR-USER-DETAILS] - GET STORED PROJECT > PROFILE NAME ', profile_name);

        this.plan_name = projectObjct['id_project']['profile']['name'];
        this.plan_subscription_is_active = projectObjct['id_project']['isActiveSubscription'];
        
        if (this.plan_type === 'free') {

          if (trial_expired === false) {
            this.getProPlanTrialTranslation();
          } else if (trial_expired === true) {
            this.getFreePlanTranslation();
          }
        } else if (this.plan_type === 'payment' && profile_name === 'pro') {
          this.getProPlanTranslation();
        } else if (this.plan_type === 'payment' && profile_name === 'enterprise') {
          this.getEnterprisePlanTranslation();
        }

      }

    } catch (err) {
      console.error('[SIDEBAR-USER-DETAILS] - GET STORED PROJECT ERR ', err)
    }

    try {
      this.tiledeskToken = this.appStorageService.getItem('tiledeskToken');
      console.log('[SIDEBAR-USER-DETAILS] - GET STORED TOKEN ', this.tiledeskToken)
    } catch (err) {
      console.error('[SIDEBAR-USER-DETAILS] - GET STORED TOKEN ', err)
    }
  }


  getProPlanTrialTranslation() {
    // this.profile_name_translated = this.PRO_PLAN_TRIAL_msg;
    this.translate.get('ProPlanTrial')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.profile_name_translated = text
      });
  }

  getFreePlanTranslation() {
    // this.profile_name_translated = this.FREE_PLAN_msg;
    this.translate.get('FreePlan')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.profile_name_translated = text
      });
  }

  getProPlanTranslation() {
    // this.profile_name_translated = this.PAYD_PLAN_NAME_PRO_msg;
    this.translate.get('PaydPlanNamePro')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.profile_name_translated = text
      });
  }

  getEnterprisePlanTranslation() {
    // this.profile_name_translated = this.PAYD_PLAN_NAME_ENTERPRISE_msg;
    this.translate.get('PaydPlanNameEnterprise')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.profile_name_translated = text
      });
  }



  listenTocurrentProjectUserUserAvailability$() {
    this.wsService.currentProjectUserAvailability$
      .pipe(skip(1))
      .subscribe((projectUser) => {
        console.log('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS RES ', projectUser);

        if (projectUser) {
          this.IS_AVAILABLE = projectUser['user_available']
          this.IS_BUSY = projectUser['isBusy']
          this.USER_ROLE = projectUser['role']
          console.log('[SIDEBAR-USER-DETAILS] -translateUserRole  1', this.USER_ROLE)
          this.translateUserRole(this.USER_ROLE)
        }

    

      }, (error) => {
        this.logger.error('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
      }, () => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
      })
  }

  translateUserRole(role) {
    console.log('[SIDEBAR-USER-DETAILS] -translateUserRole ', role)
    this.translate.get(role)
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        console.log('[SIDEBAR-USER-DETAILS] - GET GTTTTTN ', text)
        this.USER_ROLE_LABEL = text
      });


  }


  ngOnChanges() {
    console.log('[SIDEBAR-USER-DETAILS] HAS_CLICKED_OPEN_USER_DETAIL', this.HAS_CLICKED_OPEN_USER_DETAIL)
    var element = document.getElementById('user-details');
    console.log('[SIDEBAR-USER-DETAILS] element', element)
    if (this.HAS_CLICKED_OPEN_USER_DETAIL === true) {
      element.classList.add("active");
    }
  }

  subcribeToAuthStateChanged() {
    this.messagingAuthService.BSAuthStateChanged.subscribe((state) => {
      console.log('[SIDEBAR] BSAuthStateChanged ', state)

      if (state === 'online') {
        const currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
        console.log('[SIDEBAR-USER-DETAILS] currentUser ', currentUser)
        if (currentUser) {
          this.user = currentUser;
          this.photo_profile_URL = this.imageRepoService.getImagePhotoUrl(currentUser.uid)
          console.log('[SIDEBAR-USER-DETAILS] photo_profile_URL ', this.photo_profile_URL)
        }

      }
    })
  }

  closeUserDetailSidePanel() {
    var element = document.getElementById('user-details');
    element.classList.remove("active");
    console.log('[SIDEBAR-USER-DETAILS] element', element);
    this.HAS_CLICKED_OPEN_USER_DETAIL === true
    // this.onCloseUserDetailsSidebar.emit(false);
  }



  changeAvailabilityStateInUserDetailsSidebar(available) {
    console.log('[SIDEBAR-USER-DETAILS] - changeAvailabilityState projectid', this.projectID, ' available 1: ', available);

    //   available = !available
    //   console.log('[SIDEBAR-USER-DETAILS] - changeAvailabilityState projectid', this.projectID, ' available 2 : ', available);

    this.wsService.updateCurrentUserAvailability(this.tiledeskToken, this.projectID, available)
      .subscribe((projectUser: any) => {

        console.log('[SIDEBAR-USER-DETAILS] - PROJECT-USER UPDATED ', projectUser)

        // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
        // this.usersService.availability_btn_clicked(true)

        // if (this.project['id_project']._id === projectUser.id_project) {
        //   this.project['ws_projct_user_available'] = projectUser.user_available;
        //   // this.project['ws_projct_user_isBusy'] = projectUser['isBusy']
        // }

      }, (error) => {
        console.error('[SIDEBAR-USER-DETAILS] - PROJECT-USER UPDATED - ERROR  ', error);

      }, () => {
        console.log('[SIDEBAR-USER-DETAILS] - PROJECT-USER UPDATED  * COMPLETE *');

      });
  }

  public onLogout() {
    // this.authService.logout();
    this.closeUserDetailSidePanel()
    // pubblico evento
    this.events.publish('profileInfoButtonClick:logout', true);
  }


}

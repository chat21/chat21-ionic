import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';

@Component({
  selector: 'app-sidebar-user-details',
  templateUrl: './sidebar-user-details.component.html',
  styleUrls: ['./sidebar-user-details.component.scss'],
})
export class SidebarUserDetailsComponent implements OnInit, OnChanges {
  @Input() HAS_CLICKED_OPEN_USER_DETAIL: boolean = false;
  // @Output() onCloseUserDetailsSidebar = new EventEmitter();


  public browserLang: string;
  private logger: LoggerService = LoggerInstance.getInstance()
  chat_lang: string
  flag_url: string;
  photo_profile_URL: string;
  IS_BUSY: boolean;
  IS_AVAILABLE: boolean;
  USER_ROLE: boolean;
  public translationMap: Map<string, string>;
  IS_BUSY_msg: string;
  IS_AVAILABLE_msg: string;
  IS_UNAVAILABLE_msg: string;
  SUBSCRIPTION_PAYMENT_PROBLEM_msg:string;
  THE_PLAN_HAS_EXPIRED_msg:string;
  SubscriptionPaymentProblem
  user: any
  projectID: any
  tiledeskToken: string;
  prjct_name: string;
  plan_type: string;
  _prjct_profile_name: string;




  constructor(
    private translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public imageRepoService: ImageRepoService,
    public appStorageService: AppStorageService,
    private messagingAuthService: MessagingAuthService,
    public wsService: WebsocketService,
    private translateService: CustomTranslateService,
  ) { }

  ngOnInit() {
    this.getCurrentChatLang();
    this.subcribeToAuthStateChanged();
    this.listenTocurrentProjectUserUserAvailability$();
    this.translations();
    this.getCurrentStoredProject();
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

        if (this.plan_type === 'free') {

          if (trial_expired === false) {
            this.getProPlanTrialTranslation();
          } else {
            this.getPaidPlanTranslation(profile_name);
          }
        } else if (this.plan_type === 'payment') {
          this.getPaidPlanTranslation(profile_name);
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
    this.translate.get('ProPlanTrial')
      .subscribe((translation: any) => {
        this._prjct_profile_name = translation;

        console.log('[SIDEBAR-USER-DETAILS] PLAN NAME ', this._prjct_profile_name)
      });
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this._prjct_profile_name = text;
        console.log('[SIDEBAR-USER-DETAILS] PLAN NAME ', this._prjct_profile_name)
      });
  }

  public translations() {
    const keys = [
      'Available',
      'Unavailable',
      'Busy',
      'SubscriptionPaymentProblem',
      'ThePlanHasExpired'
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
    console.log('[SIDEBAR-USER-DETAILS] -  translationMap', this.translationMap);
    this.IS_BUSY_msg = this.translationMap.get('Busy')
    console.log('[SIDEBAR-USER-DETAILS] -  this.IS_BUSY_msg', this.IS_BUSY_msg);
    this.IS_AVAILABLE_msg = this.translationMap.get('Available')
    this.IS_UNAVAILABLE_msg = this.translationMap.get('Unavailable')
    this.SUBSCRIPTION_PAYMENT_PROBLEM_msg = this.translationMap.get('SubscriptionPaymentProblem');
    this.THE_PLAN_HAS_EXPIRED_msg = this.translationMap.get('ThePlanHasExpired');
  }


  listenTocurrentProjectUserUserAvailability$() {
    this.wsService.currentProjectUserAvailability$.subscribe((projectUser) => {
      console.log('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS RES ', projectUser);

      this.IS_AVAILABLE = projectUser['user_available']
      this.IS_BUSY = projectUser['isBusy']
      this.USER_ROLE = projectUser['role']
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
      this.logger.error('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
    }, () => {
      this.logger.log('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
    })
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
          this.photo_profile_URL = this.imageRepoService.getImagePhotoUrl(currentUser.uid)
          console.log('[SIDEBAR-USER-DETAILS] photo_profile_URL ', this.photo_profile_URL)
        }

      }
    })
  }

  closeUserDetailSidePanel() {
    var element = document.getElementById('user-details');
    element.classList.remove("active");
    console.log('[SIDEBAR-USER-DETAILS] element', element)
    // this.onCloseUserDetailsSidebar.emit(false);
  }

  getCurrentChatLang() {
    this.browserLang = this.translate.getBrowserLang();
    const currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
    console.log('[SIDEBAR-USER-DETAILS] - ngOnInit - currentUser ', currentUser)
    console.log('[SIDEBAR-USER-DETAILS] - ngOnInit - browserLang ', this.browserLang)
    let currentUserId = ''
    if (currentUser) {
      this.user = currentUser;
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


  onChangeAvailabilityStatus($event) {
    console.log('[SIDEBAR-USER-DETAILS] - onChangeAvailabilityStatus ', $event);
  }



}

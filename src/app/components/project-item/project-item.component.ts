import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { WebSocketJs } from 'src/app/services/websocket/websocket-js';

@Component({
  selector: 'app-project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.scss'],
})
export class ProjectItemComponent implements OnInit {
  @Output() projectIdEvent = new EventEmitter<string>()

  private unsubscribe$: Subject<any> = new Subject<any>();
  project: any;
  tiledeskToken: string;

  unservedRequestCount: number = 0;
  currentUserRequestCount: number;
  ROLE_IS_AGENT: boolean;
  currentUserId: string;
  public translationMap: Map<string, string>;
  private logger: LoggerService = LoggerInstance.getInstance();
  window_width_is_60: boolean;
  newInnerWidth: any;

  constructor(
    public wsService: WebsocketService,
    public appStorageService: AppStorageService,
    private translateService: CustomTranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public tiledeskService: TiledeskService,
    public webSocketJs: WebSocketJs,
  ) { }

  ngOnInit() {
    this.getLastProjectStoredAndSubscToWSAvailabilityAndConversations();
    this.getStoredToken();
    this.getStoredCurrenUser();
    this.translations();
    this.listenToPostMsgs();
    this.onInitWindowWidth();

  }

  listenToPostMsgs() {
    window.addEventListener("message", (event) => {
      // console.log("[PROJECT-ITEM] post message event ", event);

      if (event && event.data && event.data) {
        // console.log("[PROJECT-ITEM] message event data  ", event.data);
        if (event.data === 'hasChangedProject') {
          this.unservedRequestCount = 0;
          if (this.project) {
            this.webSocketJs.unsubscribe('/' + this.project.id_project._id + '/requests');  
          }
          this.getLastProjectStoredAndSubscToWSAvailabilityAndConversations();
          
        }
      }
    })
  }

  public translations() {
    const keys = [
      'Available',
      'Unavailable',
      'Busy'
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerWidth = event.target.innerWidth;
    this.logger.log('[PROJECT-ITEM] - INNER WIDTH ', this.newInnerWidth)

    // if (this.newInnerWidth <= 150) {
    //   this.window_width_is_60 = true;
    // } else {
    //   this.window_width_is_60 = false;
    // }
  }

  onInitWindowWidth(): any {
    const actualWidth = window.innerWidth;
    this.logger.log('[PROJECT-ITEM] - ACTUAL Width ', actualWidth);


   
    // if (actualWidth <= 150) {
    //   this.window_width_is_60 = true;
    // } else {
    //   this.window_width_is_60 = false;
    // }
  }



  getStoredToken() {
    this.tiledeskToken = this.appStorageService.getItem('tiledeskToken');
    this.logger.log('[PROJECT-ITEM] - STORED TILEDEK TOKEN ', this.tiledeskToken)

  }

  getStoredCurrenUser() {
    const storedCurrentUser = this.appStorageService.getItem('currentUser');
    this.logger.log('[PROJECT-ITEM] - STORED CURRENT USER ', storedCurrentUser)
    if (storedCurrentUser) {
      const currentUser = JSON.parse(storedCurrentUser)
      this.logger.log('[PROJECT-ITEM] - STORED CURRENT USER OBJCT', currentUser);
      this.currentUserId = currentUser.uid
      this.logger.log('[PROJECT-ITEM] - CURRENT USER ID', this.currentUserId);
    }
  }

  getLastProjectStoredAndSubscToWSAvailabilityAndConversations() {
    let stored_project = ''
    try {
      stored_project = localStorage.getItem('last_project')
      this.logger.log('PROJECT-ITEM - THERE IS A STORED PROJECT ', stored_project)
    } catch (err) {
      this.logger.error('Get local storage LAST PROJECT ', err)
    }


    if (!stored_project) {
      this.logger.log('PROJECT-ITEM - THERE IS NOT STORED LAST PROJECT ', stored_project)
      const tiledeskToken = this.appStorageService.getItem('tiledeskToken');
      this.logger.log('[INFO-CONTENT-COMP] - GET PROJECTS - tiledeskToken', tiledeskToken);
      this.tiledeskService.getProjects(tiledeskToken).subscribe(projects => {
        this.logger.log('[INFO-CONTENT-COMP] - GET PROJECTS - RES', projects);

        this.logger.log('[INFO-CONTENT-COMP] - GET PROJECTS - RES this.project', this.project);

        localStorage.setItem('last_project', JSON.stringify(projects[0]))
        if (projects[0]) {
          this.project = projects[0];
          this.doProjectSubscriptions(this.project)
        }

      }, (error) => {
        this.logger.error('[INFO-CONTENT-COMP] - GET PROJECTS - ERROR  ', error);

      }, () => {
        this.logger.log('[INFO-CONTENT-COMP] - GET PROJECTS * COMPLETE *');

      });
    }


    if (stored_project) {
      this.logger.log('PROJECT-ITEM - THERE IS STORED LAST PROJECT ', stored_project)
      if (stored_project) {
        this.project = JSON.parse(stored_project)
      }
      this.doProjectSubscriptions(this.project)
      this.logger.log('[PROJECT-ITEM] - LAST PROJECT PARSED ', this.project)
    }


  }

  doProjectSubscriptions(project) {
    this.logger.log('[PROJECT-ITEM] doProjectSubscriptions project ', project)
    if (project) {
      const user_role = this.project.role
      this.logger.log('[PROJECT-ITEM] - user_role ', user_role)
      this.projectIdEvent.emit(project.id_project._id)


      if (user_role === 'agent') {
        this.ROLE_IS_AGENT = true;

      } else {
        this.ROLE_IS_AGENT = false;
      }


      this.logger.log('[PROJECT-ITEM] - LAST PROJECT PARSED > user_role ', user_role)
      this.wsService.subscriptionToWsCurrentProjectUserAvailability(project.id_project._id, this.project._id);
      this.listenTocurrentProjectUserUserAvailability$(project)

      this.wsService.subscriptionToWsConversations(project.id_project._id)
      // this.updateCurrentUserRequestCount();
      this.updateUnservedRequestCount();

    }
  }

  listenTocurrentProjectUserUserAvailability$(project) {
    this.wsService.currentProjectUserAvailability$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectUser) => {
        this.logger.log('[PROJECT-ITEM] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS RES ', projectUser);

        if (project.id_project._id === projectUser['id_project']) {
          project['ws_projct_user_available'] = projectUser['user_available'];
          project['ws_projct_user_isBusy'] = projectUser['isBusy']
        }

      }, (error) => {
        this.logger.error('[PROJECT-ITEM] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
      }, () => {
        this.logger.log('[PROJECT-ITEM] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
      })
  }

  changeAvailabilityState(projectid, available) {
    this.logger.log('[PROJECT-ITEM] - changeAvailabilityState projectid', projectid, ' available: ', available);

    available = !available
    this.logger.log('[PROJECT-ITEM] - changeAvailabilityState projectid', projectid, ' available: ', available);

    this.wsService.updateCurrentUserAvailability(this.tiledeskToken, projectid, available)
      .subscribe((projectUser: any) => {

        this.logger.log('[PROJECT-ITEM] - PROJECT-USER UPDATED ', projectUser)

        // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
        // this.usersService.availability_btn_clicked(true)

        if (this.project['id_project']._id === projectUser.id_project) {
          this.project['ws_projct_user_available'] = projectUser.user_available;
          // this.project['ws_projct_user_isBusy'] = projectUser['isBusy']
        }

      }, (error) => {
        this.logger.error('[PROJECT-ITEM] - PROJECT-USER UPDATED - ERROR  ', error);

      }, () => {
        this.logger.log('[PROJECT-ITEM] - PROJECT-USER UPDATED  * COMPLETE *');

      });
  }

  updateUnservedRequestCount() {
    console.log('[PROJECT-ITEM] updateUnservedRequestCount ')
    // this.requestsService.requestsList_bs.subscribe((requests) => {
    this.wsService.wsRequestsList$
      .subscribe((requests) => {
        // console.log('[PROJECT-ITEM] requests ', requests)
        if (requests) {
          let count = 0;
          requests.forEach(r => {
            // this.logger.log('NAVBAR - UPDATE-UNSERVED-REQUEST-COUNT request agents', r.agents)
            // *bug fix: when the user is an agent also for the unserved we have to consider if he is present in agents
            // && this.ROLE_IS_AGENT === true
            if (r['status'] === 100 ) {
              if (this.hasmeInAgents(r['agents']) === true) {
                count = count + 1;
              }
            }
            // if (r['status'] === 100 && this.ROLE_IS_AGENT === false) {
            //   count = count + 1;
            // }
          });
          this.unservedRequestCount = count;
          console.log('[PROJECT-ITEM] UNSERVED REQUEST COUNT - RES ', this.unservedRequestCount)
        }
      }, error => {
        this.logger.error('[PROJECT-ITEM] UNSERVED REQUEST COUNT * error * ', error)
      }, () => {
        this.logger.log('[PROJECT-ITEM] UNSERVED REQUEST COUNT */* COMPLETE */*')
      })
  }

  hasmeInAgents(agents) {
    if (agents) {
      for (let j = 0; j < agents.length; j++) {
        // this.logger.log('[PROJECT-ITEM] hasmeInAgents currentUserId  ', this.currentUserId)
        // this.logger.log('[PROJECT-ITEM] hasmeInAgents agent  ', agents[j].id_user)
        if (this.currentUserId === agents[j].id_user) {
          // this.logger.log('[PROJECT-ITEM] hasmeInAgents ')
          return true
        }
      }
    } else {
      this.logger.log('[PROJECT-ITEM] hasmeInAgents OOPS!!! AGENTS THERE ARE NOT ')
    }
  }

  updateCurrentUserRequestCount() {
    // this.requestsService.requestsList_bs.subscribe((requests) => {
    this.wsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requests) => {
        if (requests) {
          let count = 0;
          requests.forEach(r => {

            // const membersArray = Object.keys(r.members);
            const participantsArray = r['participants'] // new used with ws 
            // this.logger.log('[NAVBAR] »» WIDGET updateCurrentUserRequestCount REQUEST currentUserRequestCount membersArray ', membersArray);

            // const currentUserIsInParticipants = membersArray.includes(this.user._id);
            const currentUserIsInParticipants = participantsArray.includes(this.currentUserId); // new used with ws 

            // this.logger.log('[NAVBAR] »» WIDGET updateCurrentUserRequestCount REQUEST currentUserRequestCount currentUserIsInParticipants ', currentUserIsInParticipants);
            if (currentUserIsInParticipants === true) {
              count = count + 1;
            }
          });
          this.currentUserRequestCount = count;
          this.logger.log('[PROJECT-ITEM] CURRENT USER REQUEST COUNT - RES', this.currentUserRequestCount);
        }
      }, error => {
        this.logger.error('[PROJECT-ITEM] CURRENT USER REQUEST COUNT * error * ', error)
      }, () => {
        this.logger.log('[PROJECT-ITEM] CURRENT USER REQUEST COUNT */* COMPLETE */*')
      })

  }



}



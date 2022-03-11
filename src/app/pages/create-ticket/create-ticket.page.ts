import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service'
import { TiledeskService } from '../../services/tiledesk/tiledesk.service'
import { zip } from 'rxjs'
import { AppConfigProvider } from 'src/app/services/app-config'
import { CreateRequesterPage } from 'src/app/pages/create-requester/create-requester.page'
import * as uuid from 'uuid';
import { EventsService } from 'src/app/services/events-service'
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.page.html',
  styleUrls: ['./create-ticket.page.scss'],
})
export class CreateTicketPage implements OnInit {
  selectedPriority: string;
  assignee_id: string;
  assignee_participants_id: string;
  assignee_dept_id: string;
  loadingAssignee: boolean = true;
  loadingRequesters: boolean = true;
  prjctID: string;
  tiledeskToken: string;
  selectedRequester: any;
  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  id_for_view_requeter_dtls: string;
  requester_type: string;
  projectUserAndLeadsArray = [];
  projectUserBotsAndDeptsArray = [];
  ticket_subject: string;
  ticket_message: string;
  departments: any;
  internal_request_id: string;
  showSpinnerCreateTicket: boolean = false; 
  ticketCreationCompleted: boolean = false;
  dashboard_base_url: string
  priority = [
      {
        id: 1,
        name: 'urgent',
        avatar: 'assets/images/priority_icons/urgent_v2.svg'
      },
      {
        id: 2,
        name: 'high',
        avatar: 'assets/images/priority_icons/high_v2.svg '
      },
      {
        id: 3,
        name: 'medium',
        avatar: 'assets/images/priority_icons/medium_v2.svg'
      },
      {
        id: 4,
        name: 'low',
        avatar: 'assets/images/priority_icons/low_v2.svg'
      },
    ];

  logger: LoggerService = LoggerInstance.getInstance();
  constructor(
    public modalController: ModalController,
    public tiledeskService: TiledeskService,
    public tiledeskAuthService: TiledeskAuthService,
    public appConfigProvider: AppConfigProvider,
    public events: EventsService
  ) {}

  ngOnInit() {
    this.getUploadEngine()
    this.dashboard_base_url = this.appConfigProvider.getConfig().dashboardUrl
    this.selectedPriority = this.priority[2].name
    this.logger.log('[CREATE-TICKET]', this.selectedPriority)

    const stored_project = localStorage.getItem('last_project')
    const storedPrjctObjct = JSON.parse(stored_project)
    this.logger.log('[CREATE-TICKET] storedPrjctObjct ', storedPrjctObjct)
    if (storedPrjctObjct) {
      this.prjctID = storedPrjctObjct.id_project.id
      this.logger.log('[CREATE-TICKET] this.prjctID ', this.prjctID)
    }
    this.tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CREATE-TICKET] tiledeskToken ', this.tiledeskToken)

    this.getProjectUsersAndContacts(this.prjctID, this.tiledeskToken)
    this.getProjectUserBotsAndDepts(this.prjctID, this.tiledeskToken)
  }

  getUploadEngine() {
    if (this.appConfigProvider.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true
      const firebase_conf = this.appConfigProvider.getConfig().firebaseConfig
      this.storageBucket = firebase_conf['storageBucket']
      this.logger.log('[CREATE-TICKET] - IMAGE STORAGE',  this.storageBucket, '- usecase firebase: ', this.UPLOAD_ENGINE_IS_FIREBASE)
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false
      this.baseUrl = this.appConfigProvider.getConfig().apiUrl
      this.logger.log('[WS-REQUESTS-LIST] - IMAGE STORAGE ',this.baseUrl,'- usecase firebase: ', this.UPLOAD_ENGINE_IS_FIREBASE)
    }
  }

  // -------------------------------------------------------------------------------------------
  // Create the array of the project-users and contacts displayed in the combo box  "Requester"
  // -------------------------------------------------------------------------------------------
  getProjectUsersAndContacts(projctid: string, tiledesktoken: string) {
    const projectUsers = this.tiledeskService.getProjectUsersByProjectId(
      projctid,
      tiledesktoken,
    )
    const leads = this.tiledeskService.getAllLeadsActiveWithLimit(
      projctid,
      tiledesktoken,
      10000,
    )

    zip(projectUsers, leads).subscribe(
      ([_prjctUsers, _leads]) => {
        this.logger.log('[CREATE-TICKET] GET PROJECT-USER RES ', _prjctUsers)
        this.logger.log('[CREATE-TICKET] GET ALL ACTIVE LEADS (LIMIT 10000) RES ', _leads.leads)

        if (_prjctUsers) {
          _prjctUsers.forEach((p_user) => {
            this.projectUserAndLeadsArray.push({
              id: p_user.id_user._id,
              name: p_user.id_user.firstname + ' ' + p_user.id_user.lastname,
              role: p_user.role,
              email: p_user.id_user.email,
              requestertype: 'agent',
              requester_id: p_user._id,
            })
          })
        }

        if (_leads && _leads.leads) {
          _leads.leads.forEach((lead) => {
            let e_mail = 'n/a'
            if (lead.email) {
              e_mail = lead.email
            }
            this.projectUserAndLeadsArray.push({
              id: lead.lead_id,
              name: lead.fullname,
              role: 'lead',
              email: e_mail,
              requestertype: 'lead',
              requester_id: lead._id,
            })
            // this.projectUserAndLeadsArray = this.projectUserAndLeadsArray.slice(0);
          })
        }

        this.logger.log( '[CREATE-TICKET] - GET P-USERS-&-LEADS - PROJECT-USER-&-LEAD-ARRAY: ', this.projectUserAndLeadsArray)

        // component will not detect a change. Instead you need to do: this.items = [...this.items, {id: 1, name: 'New item'}]; // https://www.npmjs.com/package/@ng-select/ng-select/v/3.7.3
        // Resolves the "NO ITEMS FOUND" bug displayed in the template select
        // this workaround is used for "change detection" because the spread operator is available with "es6" but the target in the tsconfig.json file is "es5"
        this.projectUserAndLeadsArray = this.projectUserAndLeadsArray.slice(0) // the array returned by slice(0) is identical to the input, which basically means it's a cheap way to duplicate an array.
      },
      (error) => {
        this.loadingRequesters = false
        this.logger.error('[CREATE-TICKET] - GET P-USERS-&-LEADS - ERROR: ', error)
      },
      () => {
        this.loadingRequesters = false
        this.logger.log('[CREATE-TICKET] - GET P-USERS-&-LEADS * COMPLETE *')
      },
    )
  }

  customSearchFn(term: string, item: any) {
    // console.log( '[CREATE-TICKET] - GET P-USERS-&-LEADS - customSearchFn term : ',  term)

    term = term.toLocaleLowerCase()
    // console.log('[CREATE-TICKET] - GET P-USERS-&-LEADS - customSearchFn item : ',item)
    // console.log('[CREATE-TICKET] - GET P-USERS-&-LEADS - customSearchFn item.name.toLocaleLowerCase().indexOf(term) : ',item.name.toLocaleLowerCase().indexOf(term) > -1)

    return (
      item.name.toLocaleLowerCase().indexOf(term) > -1 || item.email.toLocaleLowerCase().indexOf(term) > -1
    )
  }

  // used nella select requester OF CREATE TICKET
  selectRequester($event) {
    this.logger.log('[CREATE-TICKET] - SELECT REQUESTER event', $event)
    this.logger.log('[CREATE-TICKET] - SELECT REQUESTER ID', this.selectedRequester)
    this.logger.log('[CREATE-TICKET] - SELECT REQUESTER $event requester_id ', $event.requester_id)
    this.logger.log('[CREATE-TICKET] - SELECT REQUESTER $event requestertype ', $event.requestertype)
    this.id_for_view_requeter_dtls =  $event.requester_id
    this.requester_type = $event.requestertype
    
    // const hasFound = this.projectUserAndLeadsArray.filter((obj: any) => {
    //   return obj.id === this.selectedRequester
    // })

    // console.log('[CREATE-TICKET] - hasFound REQUESTER ', hasFound)

    // if (hasFound.length > 0)
    //   (this.id_for_view_requeter_dtls = hasFound[0]['requester_id']),
    //     console.log(
    //       '[CREATE-TICKET] - hasFound REQUESTER id_for_view_requeter_dtls',
    //       this.id_for_view_requeter_dtls,
    //     )

    // if (hasFound[0]['requestertype'] === 'agent') {
    //   this.requester_type = 'agent'
    //   console.log(
    //     '[CREATE-TICKET]- hasFound REQUESTER requester_type',
    //     this.requester_type,
    //   )
    // } else {
    //   this.requester_type = 'lead'
    //   console.log(
    //     '[CREATE-TICKET] - hasFound REQUESTER requester_type',
    //     this.requester_type,
    //   )
    // }
  }

  openRequesterDetails() {
    if (this.selectedRequester) {
      if (this.requester_type === "agent") {
        
        this.logger.log('[CREATE-TICKET] - openRequesterDetails ', this.requester_type, ' details')
        const url = this.dashboard_base_url + '#/project/'  + this.prjctID +  '/user/edit/' + this.id_for_view_requeter_dtls
        this.logger.log('[CREATE-TICKET] - openRequesterDetails URL', url)
        window.open(url, '_blank');

      } else if (this.requester_type === "lead") {

        this.logger.log('[CREATE-TICKET] - openRequesterDetails ', this.requester_type, ' details')
        const url = this.dashboard_base_url + '#/project/'  + this.prjctID +  '/contact/' + this.id_for_view_requeter_dtls
        this.logger.log('[CREATE-TICKET] - openRequesterDetails URL', url)
        window.open(url, '_blank');
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Create the array of the project-users, the bots and of the departments displayed in the combo box "Select Assignee"
  // -------------------------------------------------------------------------------------------------------------------
  getProjectUserBotsAndDepts(projctid: string, tiledesktoken: string) {
    // this.loadingAssignee = true;
    const projectUsers = this.tiledeskService.getProjectUsersByProjectId( projctid, tiledesktoken)
    const bots = this.tiledeskService.getAllBotByProjectId(projctid, tiledesktoken)
    const depts = this.tiledeskService.getDeptsByProjectId(projctid, tiledesktoken)

    zip(projectUsers, bots, depts).subscribe(
      ([_prjctUsers, _bots, _depts]) => {
        this.logger.log( '[CREATE-TICKET] - GET P-USERS-&-BOTS-&-DEPTS - PROJECT USERS : ',   _prjctUsers )
        this.logger.log( '[CREATE-TICKET] - GET P-USERS-&-BOTS-&-DEPTS - BOTS : ',  _bots)
        this.logger.log( '[CREATE-TICKET] - GET P-USERS-&-BOTS-&-DEPTS - DEPTS: ',_depts)
        this.departments = _depts
        this.logger.log( '[CREATE-TICKET] - GET P-USERS-&-BOTS-&-DEPTS - this.departments: ',this.departments)
        // projectUserAndLeadsArray

        if (_prjctUsers) {
          _prjctUsers.forEach((p_user) => {
            this.projectUserBotsAndDeptsArray.push({ id: p_user.id_user._id, name: p_user.id_user.firstname + ' ' +   p_user.id_user.lastname +  ' (' +   p_user.role + ')' })
          })
        }

        if (_bots) {
          _bots.forEach((bot) => {
            if (bot['trashed'] === false && bot['type'] !== 'identity') {
              this.projectUserBotsAndDeptsArray.push({
                id: 'bot_' + bot._id,
                name: bot.name + ' (bot)',
              })
            }
          })
        }

        if (_depts) {
          _depts.forEach((dept) => {
            this.projectUserBotsAndDeptsArray.push({
              id: dept._id,
              name: dept.name + ' (dept)',
            })
          })
        }

        this.logger.log('[CREATE-TICKET] - GET P-USERS-&-BOTS-&-DEPTS ARRAY: ',this.projectUserBotsAndDeptsArray )

        this.projectUserBotsAndDeptsArray = this.projectUserBotsAndDeptsArray.slice(0)
      },
      (error) => {
        this.loadingAssignee = false
        this.logger.error('[CREATE-TICKET] - GET P-USERS-&-BOTS-&-DEPTS - ERROR: ', error)
      },
      () => {
        this.loadingAssignee = false
        this.logger.log('[CREATE-TICKET] - GET P-USERS-&-BOTS-&-DEPTS * COMPLETE *')
      },
    )
  }

  selectedAssignee() {
    this.logger.log('[CREATE-TICKET] - SELECT ASSIGNEE: ', this.assignee_id);
    this.logger.log('[CREATE-TICKET] - DEPTS: ', this.departments);

    const hasFound = this.departments.filter((obj: any) => {
      return obj.id === this.assignee_id;
    });

    this.logger.log("[CREATE-TICKET] - SELECT ASSIGNEE HAS FOUND IN DEPTS: ", hasFound);

    if (hasFound.length === 0) {

      this.assignee_dept_id = undefined
      this.assignee_participants_id = this.assignee_id
    } else {

      this.assignee_dept_id = this.assignee_id
      this.assignee_participants_id = undefined
    }
  }

  onChangeSelectedPriority(selectedPriority) {
    this.logger.log('[CREATE-TICKET] onChangeSelectedPriority selectedPriority ', selectedPriority)
    this.selectedPriority = selectedPriority;
  }

  createTicket() {
    // if (this.ticketCreationCompleted === false) {
      // this.hasClickedCreateNewInternalRequest = true
      this.showSpinnerCreateTicket = true
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest - ticket_message ', this.ticket_message);
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest - assignee_dept_id ', this.assignee_dept_id);
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest - assignee_participants_id ', this.assignee_participants_id);
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest - ticket_subject', this.ticket_subject);

      const uiid = uuid.v4();
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest - uiid', uiid);
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest - uiid typeof', typeof uiid);
      const uiid_no_dashes = uiid.replace(/-/g, "");;
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest - uiid_no_dash', uiid_no_dashes);
      // Note: the request id must be in the form "support-group-" + "-" + "project_id" + "uid" <- uid without dash
      // this.logger.log('% WsRequestsList createTicket - UUID', uiid);
      this.internal_request_id = 'support-group-' + this.prjctID + '-' + uiid_no_dashes
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest - internal_request_id', this.internal_request_id);
      // (request_id:string, subject: string, message:string, departmentid: string)
      this.tiledeskService.createInternalRequest(this.selectedRequester,
        this.internal_request_id,
        this.ticket_subject,
        this.ticket_message,
        this.assignee_dept_id,
        this.assignee_participants_id,
        this.selectedPriority,
        this.prjctID,
        this.tiledeskToken
      ).subscribe((newticket: any) => {
        this.logger.log('[WS-REQUESTS-LIST] create internalRequest - RES ', newticket);

      }, error => {
        this.showSpinnerCreateTicket = false
        this.logger.error('[WS-REQUESTS-LIST] create internalRequest  - ERROR: ', error);
      }, () => {
        this.logger.log('[WS-REQUESTS-LIST] create internalRequest * COMPLETE *')
        this.showSpinnerCreateTicket = false;
        this.ticketCreationCompleted = true
        // this.closeModalCreateTicketModal()

        // this.events.publish('closeModalCreateTicket', true)
      });
    // } 
    // else {
    //   this.closeModalCreateTicketModal() 
    // }
  }

  async closeModalCreateTicketModal() {
    this.logger.log('[CREATE-TICKET] modalController', this.modalController)
    this.logger.log('[CREATE-TICKET] .getTop()', this.modalController.getTop())
    await this.modalController.getTop()
    this.modalController.dismiss({ confirmed: true })
  }

  async presentModalAddNewRequester(): Promise<any> {
    // this.closeModalCreateTicketModal()
    const attributes = {
      projectUserAndLeadsArray: this.projectUserAndLeadsArray,
    }
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: CreateRequesterPage,
      componentProps: attributes,
      swipeToClose: false,
      backdropDismiss: false,
    })
    modal.onDidDismiss().then((dataReturned: any) => {
      // 
      this.logger.log('[CREATE-TICKET] ', dataReturned.data)
      this.logger.log('[CREATE-TICKET] PRJCT-USERS-&-LEADS-ARRAY RETURNED FROM CREATE REQUESTER',dataReturned.data.updatedProjectUserAndLeadsArray)
      this.logger.log('[CREATE-TICKET] CREATED LEAD ID RETURNED FROM CREATE REQUESTER', dataReturned.data.selectedRequester)

      if (dataReturned.data && dataReturned.data.selectedRequester) {
        this.selectedRequester = dataReturned.data.selectedRequester
      }

      if (dataReturned.data && dataReturned.data.requester_type) {
        this.requester_type = dataReturned.data.requester_type
      }

      if (dataReturned.data && dataReturned.data.requester_id) {
       const requester_id = dataReturned.data.requester_id;
       this.logger.log('[CREATE-TICKET] REQUESTER ID RERETURNED FROM CREATE REQUESTER', requester_id)
       this.id_for_view_requeter_dtls = requester_id

      }

      if ( dataReturned.data && dataReturned.data.updatedProjectUserAndLeadsArray) {
        this.projectUserAndLeadsArray = dataReturned.data.updatedProjectUserAndLeadsArray
        this.projectUserAndLeadsArray = this.projectUserAndLeadsArray.slice(0)
      }
    })

    return await modal.present()
  }
}

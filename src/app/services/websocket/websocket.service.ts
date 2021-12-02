import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebSocketJs } from "./websocket-js";
import { AppConfigProvider } from '../app-config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private apiUrl: string;
  public currentProjectUserAvailability$: BehaviorSubject<[]> = new BehaviorSubject<[]>([])

  wsService: WebSocketJs;
  wsRequestsList: any;
  public wsRequestsList$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);

  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public webSocketJs: WebSocketJs,
    public http: HttpClient,
    public appConfigProvider: AppConfigProvider

  ) {
    this.apiUrl = appConfigProvider.getConfig().apiUrl;
    // SERVER_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/'
    // CHAT IONIC API URL https://tiledesk-server-pre.herokuapp.com/"
  }


  subscriptionToWsCurrentProjectUserAvailability(projectid, prjctuserid) {
    var self = this;
    const path = '/' + projectid + '/project_users/' + prjctuserid
    this.logger.log('[WS-SERV] - SUBSCR (REF) TO WS CURRENT USERS PATH: ', path);

    return new Promise(function (resolve, reject) {

      self.webSocketJs.ref(path, 'subscriptionToWsCurrentUser_allProject',
        function (data, notification) {
          // console.log("[WS-SERV] SUBSCR TO WS CURRENT PROJECT-USER AVAILABILITY - CREATE - data ", data);
          resolve(data)
          // self.currentUserWsAvailability$.next(data.user_available);
          self.currentProjectUserAvailability$.next(data)

        }, function (data, notification) {
          resolve(data)
          // console.log("[WS-SERV] SUBSCR TO WS CURRENT PROJECT-USER AVAILABILITY - UPDATE - data ", data);
          self.currentProjectUserAvailability$.next(data)

        }, function (data, notification) {
          resolve(data)
          if (data) {
            // console.log("[WS-SERV] SUBSCR TO WS CURRENT PROJECT-USER AVAILABILITY - UPDATE - data", data);
          }
        });

    })
  }

  public updateCurrentUserAvailability(token: string, projectId: string, user_is_available: boolean) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    const body = { 'user_available': user_is_available };

    const url = this.apiUrl + projectId + '/project_users/';

    this.logger.log('[WS-SERV] - UPDATE CURRENT PROJECT-USER AVAILABILITY (PUT) URL ', url);
    return this.http
      .put(url, body, httpOptions)
      .pipe(map((res: any) => {
        this.logger.log('[WS-SERV] - UPDATE CURRENT PROJECT-USER AVAILABILITY (PUT) ', res);
        return res
      }))
  }

  subscriptionToWsConversations(project_id) {
    this.logger.log("[WS-SERV] - CALLED SUBSC TO WS CONVS - PROJECT ID ", project_id);
    var self = this;
    this.wsRequestsList = [];

    this.webSocketJs.ref('/' + project_id + '/requests', 'getCurrentProjectAndSubscribeTo_WsRequests',

      function (data, notification) {
        // self.logger.log("[WS-SERV] - CONVS - CREATE DATA ", data);
        if (data) {
          // ------------------------------------------------
          // @ Agents - pass in data agents get from snapshot
          // ------------------------------------------------
          if (data.snapshot && data.snapshot.agents) {

            data.agents = data['snapshot']["agents"]
          } else if (data.agents) {
            // ---------------------------------------------------------------
            // @ Agents - else (if exist agents in data) pass agents from data
            // ---------------------------------------------------------------
            data.agents = data.agents
          }

          // ---------------------------------------------
          // @ Lead - pass in data lead get from snapshot
          // ----------------------------------------------
          if (data.snapshot && data.snapshot.lead) {

            data.lead = data['snapshot']["lead"];

          } else {
            // ---------------------------------------------------------------------
            // @ Lead - else (if exist lead in attributes) pass lead from attributes
            // ---------------------------------------------------------------------
            if (data['attributes'] && data['attributes'] !== undefined) {

              if (data['attributes']['userFullname'] && data['attributes']['userEmail'] && data['attributes']['requester_id']) {
                data.lead = { 'fullname': data['attributes']['userFullname'], 'email': data['attributes']['userEmail'], 'lead_id': data['attributes']['requester_id'] }
              }
              // ---------------------------------------------------------
              // @ Lead - else (if exist lead in data) pass lead from data
              // ---------------------------------------------------------
              else if (data.lead) {
                data.lead = data.lead
              }
            } else if (data.lead) {
              data.lead = data.lead;
            }
          }

          // -----------------------------------------------------
          // @ Requester pass in data requester get from snapshot
          // -----------------------------------------------------
          if (data.snapshot && data.snapshot.requester) {

            data.requester = data['snapshot']["requester"]

          } else if (data.requester) {
            // ---------------------------------------------------------------------
            // @ Lead - else (if exist requester in data) pass requester from data
            // ---------------------------------------------------------------------
            data.requester = data.requester
          }

          // ------------------------------------------------------
          // @ Department pass in data department get from snapshot
          // ------------------------------------------------------
          if (data.snapshot && data.snapshot.department) {

            data.department = data['snapshot']["department"]

          } else if (data.department) {
            // ----------------------------------------------------------------------------
            // @ Department - else (if exist department in data) pass department from data
            // ----------------------------------------------------------------------------
            data.department = data.department
          }
        }

        // https://stackoverflow.com/questions/36719477/array-push-and-unique-items
        const index = self.wsRequestsList.findIndex((e) => e.id === data.id);

        if (index === -1) {
          self.addWsRequests(data)
          // self.logger.log("[WS-REQUESTS-SERV] - CREATE - ADD REQUESTS");
        } else {
          // self.logger.log("[WS-REQUESTS-SERV] - CREATE - REQUEST ALREADY EXIST - NOT ADD");
        }

      }, function (data, notification) {

        // self.logger.log("[WS-SERV] - CONVS - UPDATE DATA ", data);

        // -------------------------------------------------------
        // @ Agents (UPDATE) pass in data agents get from snapshot
        // -------------------------------------------------------
        if (data.snapshot && data.snapshot.agents) {
          data.agents = data['snapshot']["agents"]
        } else if (data.agents) {
          // ---------------------------------------------------------------
          // @ Agents - else (if exist agents in data) pass agents from data
          // ---------------------------------------------------------------
          data.agents = data.agents
        }
        self.updateWsRequests(data)


      }, function (data, notification) {
        // self.logger.log("[WS-SERV] - CONVS  - ON-DATA - DATA ", data);

      }
    );
  }

  /**
  * REQUESTS publish @ the CREATE
  * 
  * @param request 
  */
  addWsRequests(request: Request) {
    if (request !== null && request !== undefined) {
      this.wsRequestsList.push(request);
    }

    if (this.wsRequestsList) {
      // -----------------------------------------------------------------------------------------------------
      // publish all REQUESTS 
      // -----------------------------------------------------------------------------------------------------
        this.wsRequestsList$.next(this.wsRequestsList);
    }
  }

  /**
  * REQUESTS - publish @ the UPDATE
  * overwrite the request in the requests-list with the upcoming request if the id is the same
  * remove the request from the requests-list if the status is === 1000 (i.e. archived request)
  * 
  * @param request 
  */
  updateWsRequests(request: any) {

    // QUANDO UNA RICHIESTA VIENE EMESSA CON preflight = true non passa dal ON CREATE
    // sull ON UPDATE VENGONO AGGIORNATE SOLO LE RICHIESTE CHE VERIFICANO LA condizione request._id === this.wsRequestsList[i]._id
    // PER PUBBLICARE LE RICHIESTE CHE LA CUI PROPRIETà preflight = true E AGGIORNATA A FALSE (E CHE QUINDI è DA VISUALIZZARE) CERCO
    // L'ESISTENZA DELL'ID NELLA wsRequestsList
    // const hasFound = this.wsRequestsList.filter((obj: any) => {
    //   return obj._id === request._id;
    // });
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- service ON-UPATE hasFound IN wsRequestsList: ", hasFound , 'THE REQUEST ID', request._id);

    const index = this.wsRequestsList.findIndex((e) => e.id === request.id);
    if (index === -1) {

      this.wsRequestsList.push(request);
      this.wsRequestsList$.next(this.wsRequestsList);

    } else {
      this.logger.log("[WS-SERV] - ON-UPATE - THE CONV NOT EXIST ");
    }


    for (let i = 0; i < this.wsRequestsList.length; i++) {
      if (request._id === this.wsRequestsList[i]._id) {

        if (request.status !== 1000) {

          // --------------------------
          // UPATE AN EXISTING REQUESTS
          // --------------------------
          this.logger.log("[WS-SERV] - UPDATE AN EXISTING CONV ");

          this.wsRequestsList[i] = request

        } else if (request.status === 1000) {

          this.wsRequestsList.splice(i, 1);

        }

        if (this.wsRequestsList) {
          this.wsRequestsList$.next(this.wsRequestsList);
          this.logger.log("[WS-SERV] -  ON-UPATE CONVS LIST ", this.wsRequestsList);
        }
      }
    }
  }


}
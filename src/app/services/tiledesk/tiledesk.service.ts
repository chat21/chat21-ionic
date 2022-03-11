import { Injectable } from '@angular/core';
import { AppConfigProvider } from '../app-config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';


@Injectable({
  providedIn: 'root'
})
export class TiledeskService {

  private apiUrl: string;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public http: HttpClient,
    public appConfigProvider: AppConfigProvider
  ) {
    this.apiUrl = appConfigProvider.getConfig().apiUrl;
    // const projectUrl = this.apiUrl + 'projects/'
    // console.log('[TILEDESK-SERVICE] projectUrl' ,projectUrl  )
  }


  // CLOSE SUPPORT GROUP
  public closeSupportGroup(token: string, projectid: string, supportgroupid: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    const body = {};
    // console.log('CLOUD FUNCT CLOSE SUPPORT GROUP REQUEST BODY ', body);
    // https://tiledesk-server-pre.herokuapp.com/
    // const url = 'https://tiledesk-server-pre.herokuapp.com/' + this.project_id + '/requests/' + group_id + '/close';
    const url = this.apiUrl + projectid + '/requests/' + supportgroupid + '/close';

    this.logger.log('[TILEDESK-SERVICE] - closeSupportGroup URL ', url);
    return this.http
      .put(url, body, httpOptions)
      .pipe(map((res: any) => {
        this.logger.log('[TILEDESK-SERVICE] - closeSupportGroup - RES ', res);
        return res
      }))
  }

  // http://tiledesk-server-pre.herokuapp.com/requests_util/lookup/id_project/support-group-60ffe291f725db00347661ef-b4cb6875785c4a23b27244fe498eecf44
  public getProjectIdByConvRecipient(token: string ,conversationWith: string ) {
    const lookupUrl = this.apiUrl + 'requests_util/lookup/id_project/' + conversationWith;

    this.logger.log('[TILEDESK-SERVICE] GET PROJECTID BY CONV RECIPIENT - URL ', lookupUrl);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    return this.http
      .get(lookupUrl, httpOptions)
      .pipe(map((res: any) => {
        this.logger.log('[TILEDESK-SERVICE] GET PROJECTID BY CONV RECIPIENT - RES ', res);
        return res
      }))
  }

  public getProjects(token: string) {
    const url = this.apiUrl + 'projects/';
    this.logger.log('[TILEDESK-SERVICE] - GET PROJECTS URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    return this.http
    .get(url, httpOptions)
    .pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] GET PROJECTS - RES ', res);
      return res
    }))
  }


  public getProjectById( token: string , id: string) {
    const url = this.apiUrl + 'projects/' + id;
    this.logger.log('[TILEDESK-SERVICE] - GET PROJECT BY ID URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };
    return this.http
    .get(url, httpOptions)
    .pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] GET PROJECT BY ID URL - RES ', res);
      return res
    }))
  }


  public getProjectUsersByProjectId(project_id: string, token: string) {
    const url = this.apiUrl + project_id + '/project_users/';
    this.logger.log('[TILEDESK-SERVICE] - GET PROJECT-USER URL', url);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };
    return this.http
    .get(url, httpOptions)
    .pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - GET PROJECT-USER RES ', res);
      return res
    }))
  }

  public getAllLeadsActiveWithLimit(project_id: string, token: string, limit: number) {
    const url = this.apiUrl + project_id + '/leads?limit=' + limit + '&with_fullname=true';
    this.logger.log('[TILEDESK-SERVICE] - GET ALL ACTIVE LEADS (LIMIT 10000) -  URL', url);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };
    return this.http
    .get(url, httpOptions)
    .pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - GET ALL ACTIVE LEADS (LIMIT 10000) ', res);
      return res
    }))
  }


  // ---------------------------------------------
  // @ Create new project user to get new lead ID
  // ---------------------------------------------
  public createNewProjectUserToGetNewLeadID(project_id: string, token: string) {
    const url = this.apiUrl + project_id + '/project_users/'
    this.logger.log('[TILEDESK-SERVICE] - CREATE NEW PROJECT USER TO GET NEW LEAD ID url ', url);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };
    const body = {};
    return this.http
      .post(url, body, httpOptions)
      .pipe(map((res: any) => {
        this.logger.log('[TILEDESK-SERVICE] - CREATE NEW PROJECT USER TO GET NEW LEAD ID url ', res);
        return res
      }))
  }

  // ---------------------------------------------
  // @ Create new lead 
  // ---------------------------------------------
  public createNewLead(leadid: string, fullname: string, leademail: string, project_id: string, token: string) {
    const url = this.apiUrl + project_id + '/leads/'
    this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD url ', url);
   
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    const body = { 'lead_id': leadid, 'fullname': fullname, 'email': leademail };
    this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD ', body);

    return this.http
    .post(url, body, httpOptions)
    .pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD RES ', res);
      return res
    }))
  }

  // -------------------------------------------------------------------------------------
  // @ Get all bots of the project (with all=true the response return also the identity bot) 
  // -------------------------------------------------------------------------------------
  public getAllBotByProjectId(project_id: string, token: string) {
   
    const url = this.apiUrl + project_id + '/faq_kb?all=true'
    this.logger.log('[TILEDESK-SERVICE] - GET ALL BOTS BY PROJECT ID - URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    return this.http
    .get(url, httpOptions)
    .pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - GET ALL BOTS BY PROJECT ID - RES ', res);
      return res
    }))
  }

  // -------------------------------------------------------------------------------------
  // @ Get all DEPTS of the project
  // -------------------------------------------------------------------------------------
  public getDeptsByProjectId(project_id: string, token: string) {
   
    const url = this.apiUrl + project_id + '/departments/allstatus';
    this.logger.log('[TILEDESK-SERVICE] - GET DEPTS (ALL STATUS) - URL', url);
   
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    return this.http
    .get(url, httpOptions)
    .pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - GET DEPTS (ALL STATUS) - RES ', res);
      return res
    }))
  }

    // -----------------------------------------------------------------------------------------
  // @ Create ticket
  // -----------------------------------------------------------------------------------------
  createInternalRequest(requester_id: string, request_id: string, subject: string, message: string, departmentid: string, participantid: string, ticketpriority: string, project_id: string, token: string) {
    
    const url = this.apiUrl + project_id + '/requests/' + request_id + '/messages'
    this.logger.log('[WS-REQUESTS-SERV] - CREATE INTERNAL REQUEST URL ', url)
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };
    // this.logger.log('JOIN FUNCT OPTIONS  ', options);
    let body = {}
    body = { 'sender': requester_id, 'subject': subject, 'text': message, 'departmentid': departmentid, 'channel': { 'name': 'form' }, 'priority': ticketpriority };
    if (participantid !== undefined) {
      body['participants'] = [participantid]
    } else {
      body['participants'] = participantid
    }
    // , 'participants': [participantid]

    this.logger.log('[WS-REQUESTS-SERV] - CREATE INTERNAL REQUEST body ', body);
    return this.http
    .post(url, body, httpOptions)
    .pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD RES ', res);
      return res
    }))
  }
  




}

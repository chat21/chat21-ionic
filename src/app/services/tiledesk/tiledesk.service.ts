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

  




}

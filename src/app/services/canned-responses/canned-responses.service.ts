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
export class CannedResponsesService {

  private apiUrl: string;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public http: HttpClient,
    public appConfigProvider: AppConfigProvider
  ) {
   
    this.logger.log('[CANNED-RESPONSES-SERVICE] HELLO !');
    this.apiUrl = appConfigProvider.getConfig().apiUrl;
    this.logger.log('[CANNED-RESPONSES-SERVICE] apiUrl ', this.apiUrl);
  }


  public getCannedResponses(token: string, projectid: string) {

    const cannedResponsesURL = this.apiUrl + projectid + "/canned/";
    this.logger.log('[CANNED-RESPONSES-SERVICE] getCannedResponses - URL ', cannedResponsesURL);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    return this.http
      .get(cannedResponsesURL, httpOptions)
      .pipe(map((res: any) => {
        this.logger.log('[CANNED-RESPONSES-SERVICE] getCannedResponses - RES ', res);
        return res
      }))
  }

}

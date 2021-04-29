import { Injectable } from '@angular/core';
import { AppConfigProvider } from '../app-config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class CannedResponsesService {
  private apiUrl: string;

  constructor(
    public http: HttpClient,
    public appConfigProvider: AppConfigProvider
  ) {

    console.log('CannedResponsesService HELLO  !');
    this.apiUrl = appConfigProvider.getConfig().apiUrl;
    console.log('CannedResponsesService apiUrl ', this.apiUrl);
  }


  public getCannedResponses(token: string, projectid: string) {

    const cannedResponsesURL = this.apiUrl + projectid + "/canned/";
    console.log('CONVERSATION-DETAIL getCannedResponses (CannedResponsesService) - URL ', cannedResponsesURL);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    return this.http
      .get(cannedResponsesURL, httpOptions)
      .pipe(map((res: any) => {
        console.log('CONVERSATION-DETAIL getCannedResponses (CannedResponsesService) - RES ', res);
        return res
      }))
  }

}

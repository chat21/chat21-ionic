import { Injectable } from '@angular/core';
import { AppConfigProvider } from '../app-config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class TiledeskService {
  private apiUrl: string;
  constructor(
    public http: HttpClient,
    public appConfigProvider: AppConfigProvider
  ) { 
    this.apiUrl = appConfigProvider.getConfig().apiUrl;
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
  
      console.log('CONV-LIST-PAGE (tiledesk.service) - closeSupportGroup URL ', url);
      return this.http
        .put(url, body, httpOptions)
        .pipe(map((res: any) => {
          console.log('CONV-LIST-PAGE (tiledesk.service) - closeSupportGroup - RES ', res);
          return res
        }))
    }
}

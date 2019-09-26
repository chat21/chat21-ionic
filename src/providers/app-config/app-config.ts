import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class AppConfigProvider {
  private appConfig: any;

  constructor(public http: HttpClient) {
    // console.log('Hello AppConfigProvider Provider');
    this.appConfig = environment;
  }

  loadAppConfig() {
    // return this.http.get(this.appConfig.apiUrl + 'settings')
    return this.http.get(this.appConfig.remoteConfigUrl)
      .toPromise()
      .then(data => {
        this.appConfig.firebase = data;
      }).catch(err => {
        console.log('error loadAppConfig' + err);
      });
  }

  getConfig() {
    return this.appConfig;
  }

}
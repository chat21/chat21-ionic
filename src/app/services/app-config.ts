import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

// Logger
// import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
// import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Injectable({ providedIn: 'root' })
export class AppConfigProvider {
  private appConfig: any;
  // private logger: LoggerService = LoggerInstance.getInstance()

  constructor(public http: HttpClient) {
    this.appConfig = environment;
    console.log('AppConfigProvider constructor environment:: ', environment);
  }

  /** */
  loadAppConfig() {
    const that = this;
    return this.http.get(this.appConfig.remoteConfigUrl).toPromise().then(data => {
        that.appConfig = data;
      }).catch(err => {
        console.log('error loadAppConfig' + err);
      });
  }

  /** */
  getConfig() {
    return this.appConfig;
  }
  

}

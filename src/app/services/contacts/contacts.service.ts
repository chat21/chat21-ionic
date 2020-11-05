import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { UserModel } from 'src/app/models/user';
import { ContactsDirectoryService } from '../contacts-directory.service';

import { environment } from 'src/environments/environment';

export const CONTACTS_URL = environment.SERVER_BASE_URL + 'chat21/contacts';

@Injectable({
  providedIn: 'root'
})

export class ContactsService {

  private urlRemoteContacts: string;

  constructor(
    public http: HttpClient
  ) {
    console.log('ContactsService');
    this.urlRemoteContacts = environment.remoteContactsUrl;
  }


  // initialize() {}

  /** */
  public loadContactsFromUrl(token: string) {
    if (this.urlRemoteContacts.startsWith('http') && token) {
      const that = this;
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          Authorization: token
        })
      };
      const postData = {
      };
      console.log('urlRemoteContacts:: url ', this.urlRemoteContacts);
      this.http
      .get(this.urlRemoteContacts, httpOptions)
      .subscribe(users => {
        console.log('urlRemoteContacts:: data ', users);
        // that.createCompleteUser(user);
      }, error => {
        console.log('urlRemoteContacts:: error ', error);
      });
    }
  }

  // /**
  //  *
  //  * https://www.freakyjolly.com/ionic-httpclient-crud-service-tutorial-to-consume-restful-server-api/#.X3bPCpMzY3g
  //  */
  // loadContactsFromUrl(remoteContactsUrl: string, token: string): Observable<UserModel> {
  //   console.log('loadContactsFromUrl', remoteContactsUrl, token);
  //   if (remoteContactsUrl.startsWith('http') && token !== '') {
  //     return this.loadContacts(remoteContactsUrl, token);
  //   }
  //   return;
  // }

  // private loadContacts(url: string, token: string) {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       Authorization: token
  //     })
  //   };
  //   return this.http
  //   .get<UserModel>(url, httpOptions)
  //   .pipe(
  //     retry(2),
  //     catchError(this.handleError)
  //   );
  // }

}

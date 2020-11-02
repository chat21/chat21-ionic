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

export class TiledeskContactsDirectoryService extends ContactsDirectoryService {

  private customToken: string;

  constructor(
    public http: HttpClient
  ) {
    super();
    console.log('TiledeskContactsDirectoryService');
    // this.customToken = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWIwZjNmYTU3MDY2ZTAwMTRiZmQ3MWUiLCJlbWFpbCI6ImRhcmlvZGVwYTc1QGdtYWlsLmNvbSIsImZpcnN0bmFtZSI6IkRhcmlvIiwibGFzdG5hbWUiOiJEZSBQYXNjYWxpcyIsImlhdCI6MTYwMTg3ODUwOSwiYXVkIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJpc3MiOiJodHRwczovL3RpbGVkZXNrLmNvbSIsInN1YiI6InVzZXIiLCJqdGkiOiI1NWU2YzQ3MC0wZmVlLTQ5ZDktYmFlZi0wZjNkYmUwMDgyZjUifQ.ltUurOpBiokkpcnckfc1hA2Z_O_VuDoCpQrS5T8U10k';
  }

  /**
   *
   */
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: ''
    })
  };

  /**
   *
   * @param error
   */
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  }

  /**
   *
   * https://www.freakyjolly.com/ionic-httpclient-crud-service-tutorial-to-consume-restful-server-api/#.X3bPCpMzY3g
   */
  loadContactsFromUrl(remoteContactsUrl: string, token: string): Observable<UserModel> {
    console.log('loadContactsFromUrl', remoteContactsUrl, token);
    if (remoteContactsUrl.startsWith('http') && token !== '') {
      return this.loadContacts(remoteContactsUrl, token);
    }
    return;
  }

  private loadContacts(url: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };
    return this.http
    .get<UserModel>(url, httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

}

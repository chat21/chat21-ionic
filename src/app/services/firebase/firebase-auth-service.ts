import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';

// services
import { EventsService } from '../events-service';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })

export class FirebaseAuthService extends AuthService {

  authStateChanged: BehaviorSubject<any>; // = new BehaviorSubject<any>([]);
  persistence: string;
  SERVER_BASE_URL: string;

  private tenant: string;
  public token: any;
  public user: any;

  private URL_TILEDESK_SIGNIN: string;
  private URL_TILEDESK_CREATE_CUSTOM_TOKEN: string;

  constructor(
    private events: EventsService,
    public http: HttpClient
  ) {
    super();
  }

  /**
   *
   */
  initialize(tenant: string) {
    this.tenant = tenant;
    this.URL_TILEDESK_SIGNIN = this.SERVER_BASE_URL + 'auth/signin';
    this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'chat21/firebase/auth/createCustomToken';
    console.log(' ---------------- login con token url ---------------- ');
    this.checkIsAuth();
    this.onAuthStateChanged();
  }


  /**
   * checkIsAuth
   */
  checkIsAuth() {
    const tiledeskTokenTEMP = localStorage.getItem('tiledeskToken');
    console.log(' ---------------- AuthService initialize ---------------- ');
    if (tiledeskTokenTEMP && tiledeskTokenTEMP !== undefined) {
      console.log(' ---------------- SONO già loggato ---------------- ');
      this.createCustomToken(tiledeskTokenTEMP);
    } else {
      console.log(' ---------------- NON sono loggato ---------------- ');
    }
  }

  /**
   *
   */
  getUser(): firebase.User {
    return firebase.auth().currentUser;
  }


  /** */
  getToken(): string {
    console.log('UserService::getToken');
    return this.token;
  }

  // ********************* START FIREBASE AUTH ********************* //
  /**
   * FIREBASE: onAuthStateChanged
   */
  onAuthStateChanged() {
    console.log('UserService::onAuthStateChanged');
    const taht = this;
    firebase.auth().onAuthStateChanged(user => {
      console.log(' onAuthStateChanged', user);
      if (!user) {
        console.log(' 1 - PASSO OFFLINE AL CHAT MANAGER');
        taht.authStateChanged.next(null);
        // taht.events.publish('go-off-line');
      } else {
        console.log(' 2 - PASSO ONLINE AL CHAT MANAGER');
        taht.authStateChanged.next(user);
        // taht.events.publish('go-on-line', user);
      }
    });
  }


  /** */
  updateTokenOnAuthStateIsLogin() {
    const taht = this;
    firebase.auth().currentUser.getIdToken(false)
    .then((token) => {
      console.log('idToken.', token);
      taht.token = token;
    }).catch((error) => {
      console.log('idToken error: ', error);
    });
  }

  /**
   * FIREBASE: signInWithCustomToken
   * @param token
   */
  signInWithCustomToken(token: string): any {
    console.log('signInWithCustomToken:', token);
    const that = this;
    let firebasePersistence;
    switch (this.persistence) {
      case 'SESSION': {
        firebasePersistence = firebase.auth.Auth.Persistence.SESSION;
        break;
      }
      case 'LOCAL': {
        firebasePersistence = firebase.auth.Auth.Persistence.LOCAL;
        break;
      }
      case 'NONE': {
        firebasePersistence = firebase.auth.Auth.Persistence.NONE;
        break;
      }
      default: {
        firebasePersistence = firebase.auth.Auth.Persistence.NONE;
        break;
      }
    }
    return firebase.auth().setPersistence(firebasePersistence)
    .then( async () => {
      return firebase.auth().signInWithCustomToken(token)
      .then( async (response) => {
        that.setUserAndToken(response);
        that.events.publish('firebase-sign-in-with-custom-token', response, null);
      })
      .catch((error) => {
        console.error('Error: ', error);
        that.events.publish('firebase-sign-in-with-custom-token', null, error);
      });
    })
    .catch((error) => {
      console.error('Error: ', error);
      that.events.publish('firebase-sign-in-with-custom-token', null, error);
    });
  }

  /**
   * FIREBASE: createUserWithEmailAndPassword
   * @param email
   * @param password
   * @param firstname
   * @param lastname
   */
  createUserWithEmailAndPassword(email: string, password: string): any {
    const that = this;
    return firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((response) => {
      console.log('firebase-create-user-with-email-and-password');
      that.events.publish('firebase-create-user-with-email-and-password', response);
      return response;
    })
    .catch((error) => {
        console.log('error: ', error.message);
        return error;
    });
  }

  /**
   * FIREBASE: sendPasswordResetEmail
   */
  sendPasswordResetEmail(email: string): any {
    const that = this;
    return firebase.auth().sendPasswordResetEmail(email).
    then(() => {
      console.log('firebase-send-password-reset-email');
      that.events.publish('firebase-send-password-reset-email', email);
    }).catch((error) => {
      console.log('error: ', error);
    });
  }

  /**
   * FIREBASE: signOut
   */
  async signOut() {
    const that = this;
    try {
      await firebase.auth().signOut();
      console.log('firebase-sign-out');
      that.events.publish('firebase-sign-out');
    } catch (error) {
      console.log('error: ', error);
    }
  }

  /**
   * FIREBASE: currentUser delete
   */
  delete() {
    const that = this;
    const user = firebase.auth().currentUser;
    user.delete().then(() => {
      console.log('firebase-current-user-delete');
      that.events.publish('firebase-current-user-delete');
    }).catch((error) => {
      console.log('error: ', error);
    });
  }

// ********************* END FIREBASE AUTH ********************* //





// ********************* TILEDESK AUTH ********************* //
  /**
   *
   * @param email
   * @param password
   */
  signInWithEmailAndPassword(email: string, password: string) {
    console.log('signInWithEmailAndPassword', email, password);
    this.signIn(this.URL_TILEDESK_SIGNIN, email, password);
  }

  /**
   * https://www.techiediaries.com/ionic-http-post/
   * @param url
   * @param emailVal
   * @param pswVal
   */
  private signIn(url: string, emailVal: string, pswVal: string) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('Accept', 'application/json');
    httpHeaders.append('Content-Type', 'application/json' );
    const requestOptions = { headers: httpHeaders };
    const postData = {
      email: emailVal,
      password: pswVal
    };
    const that = this;
    this.http.post(url, postData, requestOptions)
      .subscribe(data => {
        if (data['success'] && data['token']) {
          const tiledeskToken = data['token'];
          localStorage.setItem('tiledeskToken', tiledeskToken);
          that.createCustomToken(tiledeskToken);
        }
      }, error => {
        console.log(error);
        that.events.publish('sign-in', null, error);
      });
  }

  /**
   *
   * @param token
   */
  private createCustomToken(tiledeskToken: string) {
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: tiledeskToken
    });
    const responseType = 'text';
    const postData = {};
    const that = this;
    this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType})
    .subscribe(data =>  {
      that.signInWithCustomToken(data);
    }, error => {
      console.log(error);
      that.events.publish('sign-in', null, error);
    });
  }


  /**
   *
   * @param resp
   */
  private setUserAndToken(resp: any) {
    try {
      if (resp.token) {
        this.token = resp.token;
      }
      if (resp.user) {
        this.user = resp.user;
        this.events.publish('sign-in', resp.user, null);
      }
    } catch (error) {
      console.log('error: ', error);
      this.events.publish('sign-in', null, error);
    }
  }

  /**
   *
   * @param error
   */
  // handleError(error: HttpErrorResponse) {
  //   if (error.error instanceof ErrorEvent) {
  //     console.error('An error occurred:', error.error.message);
  //   } else {
  //     console.error(
  //       `Backend returned code ${error.status}, ` +
  //       `body was: ${error.error}`);
  //   }
  //   return throwError(
  //     'Something bad happened; please try again later.');
  // }



}

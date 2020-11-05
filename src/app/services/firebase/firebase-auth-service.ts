import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';

// services
// import { EventsService } from '../events-service';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })

export class FirebaseAuthService extends AuthService {

  authStateChanged: BehaviorSubject<any>;
  // firebaseSignInWithCustomToken: BehaviorSubject<any>;

  persistence: string;
  SERVER_BASE_URL: string;

  public tiledeskToken: string;
  public firebaseToken: string;
  public user: any;

  private URL_TILEDESK_SIGNIN: string;
  private URL_TILEDESK_CREATE_CUSTOM_TOKEN: string;

  constructor(
    // private events: EventsService,
    public http: HttpClient,
    public route: ActivatedRoute
  ) {
    super();
  }

  /**
   *
   */
  initialize() {
    this.URL_TILEDESK_SIGNIN = this.SERVER_BASE_URL + 'auth/signin';
    this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'chat21/firebase/auth/createCustomToken';
    console.log(' ---------------- AuthService initialize ---------------- ');
    this.checkIsAuth();
    this.onAuthStateChanged();
  }


  /**
   * checkIsAuth
   */
  checkIsAuth() {
    console.log(' ---------------- AuthService checkIsAuth ---------------- ');
    this.tiledeskToken = localStorage.getItem('tiledeskToken');

    const that = this;
    this.route.queryParams.subscribe(params => {
      console.log('queryParams -->', params );
      if (params.tiledeskToken) {
        that.tiledeskToken = params.tiledeskToken;
      }
      if (that.tiledeskToken) {
        console.log(' ---------------- MI LOGGO CON UN TOKEN ESISTENTE NEL LOCAL STORAGE O PASSATO NEI PARAMS URL ---------------- ');
        that.createCustomToken();
      } else {
        console.log(' ---------------- NON sono loggato ---------------- ');
      }
    });
  }

  /**
   *
   */
  getUser(): firebase.User {
    return firebase.auth().currentUser;
  }


  /** */
  getToken(): string {
    console.log('UserService::getFirebaseToken', this.firebaseToken);
    return this.firebaseToken;
  }

  getTiledeskToken(): string {
    console.log('UserService::tiledeskToken', this.tiledeskToken);
    return this.tiledeskToken;
  }

  // ********************* START FIREBASE AUTH ********************* //
  /**
   * FIREBASE: onAuthStateChanged
   */
  onAuthStateChanged() {
    console.log('UserService::onAuthStateChanged');
    const that = this;
    firebase.auth().onAuthStateChanged(user => {
      console.log(' onAuthStateChanged', user);
      if (!user) {
        console.log(' 1 - PASSO OFFLINE AL CHAT MANAGER');
        that.authStateChanged.next(null);
      } else {
        console.log(' 2 - PASSO ONLINE AL CHAT MANAGER');
        that.authStateChanged.next(user);
      }
    });
  }


  /** */
  updateTokenOnAuthStateIsLogin() {
    const taht = this;
    firebase.auth().currentUser.getIdToken(false)
    .then((token) => {
      console.log('firebaseToken.', token);
      taht.firebaseToken = token;
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
        that.user = response.user;
        // that.firebaseSignInWithCustomToken.next(response);
      })
      .catch((error) => {
        console.error('Error: ', error);
        // that.firebaseSignInWithCustomToken.next(null);
      });
    })
    .catch((error) => {
      console.error('Error: ', error);
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
      // that.firebaseCreateUserWithEmailAndPassword.next(response);
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
      // that.firebaseSendPasswordResetEmail.next(email);
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
      // that.firebaseSignOut.next();
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
      // that.firebaseCurrentUserDelete.next();
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
          that.tiledeskToken = data['token'];
          localStorage.setItem('tiledeskToken', that.tiledeskToken);
          that.createCustomToken();
        }
      }, error => {
        console.log(error);
      });
  }

  /**
   *
   * @param token
   */
  private createCustomToken() {
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: this.tiledeskToken
    });
    const responseType = 'text';
    const postData = {};
    const that = this;
    this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType})
    .subscribe(data =>  {
      that.firebaseToken = data;
      localStorage.setItem('firebaseToken', that.firebaseToken);
      that.signInWithCustomToken(data);
    }, error => {
      console.log(error);
    });
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

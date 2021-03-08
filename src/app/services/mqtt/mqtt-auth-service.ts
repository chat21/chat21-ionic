import { Injectable, ɵConsole } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';

// services
// import { EventsService } from '../events-service';
import { AuthService } from '../auth.service';
import { Chat21Service } from '../chat-service';

declare var Chat21Client: any;


@Injectable({ providedIn: 'root' })

export class MQTTAuthService extends AuthService {

  authStateChanged: BehaviorSubject<any>; // = new BehaviorSubject<any>([]);
  persistence: string;
  SERVER_BASE_URL: string;

  private tenant: string;
  public token: any;
  public user: any;
  private currentUser: any;

  private URL_TILEDESK_SIGNIN: string;
  private URL_TILEDESK_CREATE_CUSTOM_TOKEN: string;

  constructor(
    public http: HttpClient,
    public chat21Service: Chat21Service
  ) {
    super();
  }

  /**
   *
   */
  initialize(tenant: string) {
    this.tenant = tenant;
    this.URL_TILEDESK_SIGNIN = this.SERVER_BASE_URL + 'auth/signin';
    this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = environment.chat21Config.loginServiceEndpoint;
    // this.SERVER_BASE_URL + 'chat21/firebase/auth/createCustomToken';
    console.log(' ---------------- login con token url ---------------- ');
    this.checkIsAuth();
    // this.onAuthStateChanged();
  }

  checkIsAuth() {
    const tiledeskTokenTEMP = localStorage.getItem('tiledeskToken');
    if (tiledeskTokenTEMP && tiledeskTokenTEMP !== undefined) {
      this.getCustomToken(tiledeskTokenTEMP);
    } else {
      console.log(' ---------------- NON sono loggato ---------------- ');
    }
  }

  /**
   *
   */
  getUser(): any {
    return this.currentUser;
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
  // onAuthStateChanged() {
  //   console.log('UserService::onAuthStateChanged');
  //   const that = this;
  //   firebase.auth().onAuthStateChanged(user => {
  //     console.log(' onAuthStateChanged', user);
  //     if (!user) {
  //       console.log(' 1 - PASSO OFFLINE AL CHAT MANAGER');
  //       that.authStateChanged.next(null);
  //       // taht.events.publish('go-off-line');
  //     } else {
  //       console.log(' 2 - PASSO ONLINE AL CHAT MANAGER');
  //       that.currentUser = user;
  //       that.authStateChanged.next(user);
  //       // taht.events.publish('go-on-line', user);
  //     }
  //   });
  // }


  // /** */
  // updateTokenOnAuthStateIsLogin() {
  //   const taht = this;
  //   firebase.auth().currentUser.getIdToken(false)
  //   .then((token) => {
  //     console.log('idToken.', token);
  //     taht.token = token;
  //   }).catch((error) => {
  //     console.log('idToken error: ', error);
  //   });
  // }

  // /**
  //  * @param token
  //  */
  // signInWithCustomToken(token: string): any {
  //   console.log('signInWithCustomToken:', token);
  //   const that = this;
  //   let firebasePersistence;
  //   switch (this.persistence) {
  //     case 'SESSION': {
  //       firebasePersistence = firebase.auth.Auth.Persistence.SESSION;
  //       break;
  //     }
  //     case 'LOCAL': {
  //       firebasePersistence = firebase.auth.Auth.Persistence.LOCAL;
  //       break;
  //     }
  //     case 'NONE': {
  //       firebasePersistence = firebase.auth.Auth.Persistence.NONE;
  //       break;
  //     }
  //     default: {
  //       firebasePersistence = firebase.auth.Auth.Persistence.NONE;
  //       break;
  //     }
  //   }
  //   return firebase.auth().setPersistence(firebasePersistence)
  //   .then( async () => {
  //     return firebase.auth().signInWithCustomToken(token)
  //     .then( async (response) => {
  //       that.setUserAndToken(response);
  //       that.events.publish('firebase-sign-in-with-custom-token', response, null);
  //     })
  //     .catch((error) => {
  //       console.error('Error: ', error);
  //       that.events.publish('firebase-sign-in-with-custom-token', null, error);
  //     });
  //   })
  //   .catch((error) => {
  //     console.error('Error: ', error);
  //     that.events.publish('firebase-sign-in-with-custom-token', null, error);
  //   });
  // }

  // createUserWithEmailAndPassword(email: string, password: string): any {
  //   const that = this;
  //   return firebase.auth().createUserWithEmailAndPassword(email, password)
  //   .then((response) => {
  //     console.log('firebase-create-user-with-email-and-password');
  //     that.events.publish('firebase-create-user-with-email-and-password', response);
  //     return response;
  //   })
  //   .catch((error) => {
  //       console.log('error: ', error.message);
  //       return error;
  //   });
  // }

  // sendPasswordResetEmail(email: string): any {
  //   const that = this;
  //   return firebase.auth().sendPasswordResetEmail(email).
  //   then(() => {
  //     console.log('firebase-send-password-reset-email');
  //     that.events.publish('firebase-send-password-reset-email', email);
  //   }).catch((error) => {
  //     console.log('error: ', error);
  //   });
  // }

  // async signOut() {
    // const that = this;
    // try {
    //   await firebase.auth().signOut();
    //   console.log('firebase-sign-out');
    //   that.events.publish('firebase-sign-out');
    // } catch (error) {
    //   console.log('error: ', error);
    // }
  // }

  // delete() {
  //   const that = this;
  //   const user = firebase.auth().currentUser;
  //   user.delete().then(() => {
  //     console.log('firebase-current-user-delete');
  //     that.events.publish('firebase-current-user-delete');
  //   }).catch((error) => {
  //     console.log('error: ', error);
  //   });
  // }

// ********************* END FIREBASE AUTH ********************* //





// ********************* TILEDESK AUTH ********************* //
  signInWithEmailAndPassword(email: string, password: string) {
    console.log('signInWithEmailAndPassword', email, password);
    this.signIn(this.URL_TILEDESK_SIGNIN, email, password);
  }

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
        console.log("data:", JSON.stringify(data));
        if (data['success'] && data['token']) {
          const tiledeskToken = data['token'];
          localStorage.setItem('tiledeskToken', tiledeskToken);
          that.getCustomToken(tiledeskToken);
          // that.firebaseCreateCustomToken(tiledeskToken);
        }
      }, error => {
        console.log(error);
      });
  }

  // private createCustomToken(tiledeskToken: string) {
  //   const headers = new HttpHeaders({
  //     'Content-type': 'application/json',
  //     Authorization: tiledeskToken
  //   });
  //   const responseType = 'text';
  //   const postData = {};
  //   const that = this;
  //   this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType})
  //   .subscribe(data =>  {
  //     that.getCustomToken(data);
  //   }, error => {
  //     console.log(error);
  //   });
  // }

  getCustomToken(tiledeskToken: string): any {
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: tiledeskToken
    });
    const responseType = 'text';
    const postData = {};
    const that = this;
    this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType})
    .subscribe(data =>  {
      const result = JSON.parse(data);
      that.connectMQTT(result);
    }, error => {
      console.log(error);
    });
  }

  connectMQTT(result: any): any {
    console.log('result:', result);
    const userid = result.userid;
    const chatOptions = environment.chat21Config;
    console.log('chatOptions:', chatOptions);
    this.chat21Service.initChat(chatOptions);
    this.chat21Service.chatClient.connect(userid, result.token, () => {
      console.log('Chat connected.');
      const uid = userid;
      let firstname = result["firstname"]
      let lastname = result["lastname"]
      let fullname = result["fullname"]
      // let user = new UserModel(uid, '', firstname, lastname, fullname, '');
      const user = {
        uid: userid
      };
      console.log('User signed in:', user);
      this.authStateChanged.next(user);
    });
  }


  // private firebaseCreateCustomToken(tiledeskToken: string) {
  //   console.log('getting firebase custom token with tiledesk token', tiledeskToken);
  //   const headers = new HttpHeaders({
  //     'Content-type': 'application/json',
  //     Authorization: tiledeskToken
  //   });
  //   const responseType = 'text';
  //   const postData = {};
  //   const that = this;
  //   const url = this.SERVER_BASE_URL + 'chat21/firebase/auth/createCustomToken';
  //   console.log('firebase custom token URL', url);
  //   this.http.post(url, postData, { headers, responseType})
  //   .subscribe(data =>  {
  //     console.log('got firebase custom token', data);
  //     that.firebaseSignInWithCustomToken(data);
  //   }, error => {
  //     console.log('error while getting firebase token!');
  //     console.log(error);
  //   });
  // }

  // firebaseSignInWithCustomToken(token: string): any {
  //   console.log('connecting to firebase with token', token);
  //   const that = this;
  //   let firebasePersistence;
  //   switch (this.persistence) {
  //     case 'SESSION': {
  //       firebasePersistence = firebase.auth.Auth.Persistence.SESSION;
  //       break;
  //     }
  //     case 'LOCAL': {
  //       firebasePersistence = firebase.auth.Auth.Persistence.LOCAL;
  //       break;
  //     }
  //     case 'NONE': {
  //       firebasePersistence = firebase.auth.Auth.Persistence.NONE;
  //       break;
  //     }
  //     default: {
  //       firebasePersistence = firebase.auth.Auth.Persistence.NONE;
  //       break;
  //     }
  //   }
  //   return firebase.auth().setPersistence(firebasePersistence)
  //   .then( async () => {
  //     return firebase.auth().signInWithCustomToken(token)
  //     .then( async (response) => {
  //       console.log('connected on firebase');
  //     })
  //     .catch((error) => {
  //       console.error('Error: ', error);
  //     });
  //   })
  //   .catch((error) => {
  //     console.error('Error: ', error);
  //   });
  // }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';
// firebase
// import * as firebase from 'firebase/app';
import firebase from "firebase/app";
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';

// services
import { MessagingAuthService } from '../abstract/messagingAuth.service';
// import { ImageRepoService } from '../abstract/image-repo.service';
// import { FirebaseImageRepoService } from './firebase-image-repo';

// models
import { UserModel } from '../../models/user';

// utils
import {
  avatarPlaceholder,
  getColorBck,
} from '../../utils/utils-user';
import { resolve } from 'url';
import { CustomLogger } from '../logger/customLogger';
import { AppStorageService } from '../abstract/app-storage.service';
import { LoggerInstance } from '../logger/loggerInstance';
import { LoggerService } from '../abstract/logger.service';


import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators'
import { Network } from '@ionic-native/network/ngx';
// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseAuthService extends MessagingAuthService {


  // BehaviorSubject
  BSAuthStateChanged: BehaviorSubject<any>;
  BSSignOut: BehaviorSubject<any>;
  // firebaseSignInWithCustomToken: BehaviorSubject<any>;

  // public params
  // private persistence: string;
  public SERVER_BASE_URL: string;

  // private
  private URL_TILEDESK_SIGNIN: string;
  private URL_TILEDESK_SIGNIN_ANONYMOUSLY: string;
  private URL_TILEDESK_CREATE_CUSTOM_TOKEN: string;
  private URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN: string;
  //TODO-GAB
  // private imageRepo: ImageRepoService = new FirebaseImageRepoService();

  private firebaseToken: string;
  private logger: LoggerService = LoggerInstance.getInstance()

  status = 'ONLINE';
  isConnected = true;

  constructor(
    public http: HttpClient,
    private network: Network,
    private connectionService: ConnectionService
  ) {
    super();
  }

  /**
   *
   */
  initialize() {

    this.SERVER_BASE_URL = this.getBaseUrl();
    this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'chat21/firebase/auth/createCustomToken';
    this.logger.info('[FIREBASEAuthSERVICE] - initialize URL_TILEDESK_CREATE_CUSTOM_TOKEN ', this.URL_TILEDESK_CREATE_CUSTOM_TOKEN)
    // this.URL_TILEDESK_SIGNIN = this.SERVER_BASE_URL + 'auth/signin';
    // this.URL_TILEDESK_SIGNIN_ANONYMOUSLY = this.SERVER_BASE_URL + 'auth/signinAnonymously'
    // this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'auth/signinWithCustomToken';
    // this.checkIsAuth();

    // this.createOnline$().subscribe((isOnline) =>{
    //   console.log('FIREBASEAuthSERVICE] isOnline ', isOnline);
    //   if (isOnline === true ) {
    //     this.onAuthStateChanged();
    //   }
    // }) 
    this.checkInternetConnection()

    this.onAuthStateChanged();
  }

  checkInternetConnection () {
    this.logger.log('[FIREBASEAuthSERVICE] - checkInternetConnection');
    // let connectSubscription = this.network.onConnect().subscribe(() => {
    //   this.logger.log('[FIREBASEAuthSERVICE] - network connected!');
    //   // We just got a connection but we need to wait briefly
    //    // before we determine the connection type. Might need to wait.
    //   // prior to doing any api requests as well.
    //   setTimeout(() => {
    //     if (this.network.type === 'wifi') {
    //       this.logger.log('[FIREBASEAuthSERVICE] - we got a wifi connection, woohoo!');
    //     }
    //   }, 3000);
    // });

   
      this.connectionService.monitor().subscribe(isConnected => {
        this.isConnected = isConnected;
        this.logger.log('[FIREBASEAuthSERVICE] - checkInternetConnection isConnected', isConnected);
        if (this.isConnected) {
          this.status = "ONLINE";

          // this.onAuthStateChanged();
          firebase.auth().onAuthStateChanged(user => {
            this.logger.log('[FIREBASEAuthSERVICE] checkInternetConnection onAuthStateChanged', user)
          })
        }
        else {
          this.status = "OFFLINE";
          // this.onAuthStateChanged();
          firebase.auth().onAuthStateChanged(user => {
            this.logger.log('[FIREBASEAuthSERVICE] checkInternetConnection onAuthStateChanged', user)
          })
        }
      })
    
  
  }

  // createOnline$() {
  //   return merge<boolean>(
  //     fromEvent(window, 'offline').pipe(map(() => false)),
  //     fromEvent(window, 'online').pipe(map(() => true)),
  //     new Observable((sub: Observer<boolean>) => {
  //       sub.next(navigator.onLine);
  //       sub.complete();
  //     }));
  // }

  /**
   * checkIsAuth
   */
  // checkIsAuth() {
  //   this.logger.printDebug(' ---------------- AuthService checkIsAuth ---------------- ')
  //   this.tiledeskToken = this.appStorage.getItem('tiledeskToken')
  //   this.currentUser = JSON.parse(this.appStorage.getItem('currentUser'));
  //   if (this.tiledeskToken) {
  //     this.logger.printDebug(' ---------------- MI LOGGO CON UN TOKEN ESISTENTE NEL LOCAL STORAGE O PASSATO NEI PARAMS URL ---------------- ')
  //     this.createFirebaseCustomToken();
  //   }  else {
  //     this.logger.printDebug(' ---------------- NON sono loggato ---------------- ')
  //     // this.BSAuthStateChanged.next('offline');
  //   }

  //   // da rifattorizzare il codice seguente!!!
  //   // const that = this;
  //   // this.route.queryParams.subscribe(params => {
  //   //   if (params.tiledeskToken) {
  //   //     that.tiledeskToken = params.tiledeskToken;
  //   //   }
  //   // });
  // }


  /** */
  getToken(): string {
    return this.firebaseToken;
  }


  // ********************* START FIREBASE AUTH ********************* //
  /**
   * FIREBASE: onAuthStateChanged
   */
  onAuthStateChanged() {
    const that = this;
    firebase.auth().onAuthStateChanged(user => {
      this.logger.log('[FIREBASEAuthSERVICE] onAuthStateChanged', user)
      if (!user) {
        this.logger.log('[FIREBASEAuthSERVICE] 1 - PASSO OFFLINE AL CHAT MANAGER')
        that.BSAuthStateChanged.next('offline');
      } else {
        this.logger.log('[FIREBASEAuthSERVICE] 2 - PASSO ONLINE AL CHAT MANAGER')
        that.BSAuthStateChanged.next('online');
      }
    });
  }

  /**
   * FIREBASE: signInWithCustomToken
   * @param token
   */
  signInFirebaseWithCustomToken(token: string): Promise<any> {
    const that = this;
    let firebasePersistence;
    console.log('FB-AUTH firebasePersistence', this.getPersistence()) 
    switch (this.getPersistence()) {
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
    return firebase.auth().setPersistence(firebasePersistence).then(async () => {
      return firebase.auth().signInWithCustomToken(token).then(async () => {
        // that.firebaseSignInWithCustomToken.next(response);
      }).catch((error) => {
        that.logger.error('[FIREBASEAuthSERVICE] signInFirebaseWithCustomToken Error: ', error);
        // that.firebaseSignInWithCustomToken.next(null);
      });
    }).catch((error) => {
      that.logger.error('[FIREBASEAuthSERVICE] signInFirebaseWithCustomToken Error: ', error);
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
    return firebase.auth().createUserWithEmailAndPassword(email, password).then((response) => {
      that.logger.debug('[FIREBASEAuthSERVICE] CRATE USER WITH EMAIL: ', email, ' & PSW: ', password);
      // that.firebaseCreateUserWithEmailAndPassword.next(response);
      return response;
    }).catch((error) => {
      that.logger.error('[FIREBASEAuthSERVICE] createUserWithEmailAndPassword error: ', error.message);
      return error;
    });
  }


  /**
   * FIREBASE: sendPasswordResetEmail
   */
  sendPasswordResetEmail(email: string): any {
    const that = this;
    return firebase.auth().sendPasswordResetEmail(email).then(() => {
      that.logger.debug('[FIREBASEAuthSERVICE] firebase-send-password-reset-email');
      // that.firebaseSendPasswordResetEmail.next(email);
    }).catch((error) => {
      that.logger.error('[FIREBASEAuthSERVICE] sendPasswordResetEmail error: ', error);
    });
  }

  /**
   * FIREBASE: signOut
   */
  private signOut() {
    const that = this;
    firebase.auth().signOut().then(() => {
      that.logger.log('[FIREBASEAuthSERVICE] signOut firebase-sign-out');
      // cancello token
      // this.appStorage.removeItem('tiledeskToken');
      //localStorage.removeItem('firebaseToken');
      that.BSSignOut.next(true);
    }).catch((error) => {
      that.logger.error('[FIREBASEAuthSERVICE] signOut error: ', error);
    });
  }


  /**
   * FIREBASE: currentUser delete
   */
  delete() {
    const that = this;
    firebase.auth().currentUser.delete().then(() => {
      that.logger.debug('[FIREBASEAuthSERVICE] firebase-current-user-delete');
      // that.firebaseCurrentUserDelete.next();
    }).catch((error) => {
      that.logger.error('[FIREBASEAuthSERVICE] delete error: ', error);
    });
  }

  // ********************* END FIREBASE AUTH ********************* //


  /**
   *
   * @param token
   */
  createCustomToken(tiledeskToken: string) {
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: tiledeskToken
    });
    const responseType = 'text';
    const postData = {};
    const that = this;
    this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType }).subscribe(data => {
      that.firebaseToken = data;
      //localStorage.setItem('firebaseToken', that.firebaseToken);
      that.signInFirebaseWithCustomToken(data)
    }, error => {
      that.logger.error('[FIREBASEAuthSERVICE] createFirebaseCustomToken ERR ', error)
    });
  }

  logout() {
    this.logger.log('[FIREBASEAuthSERVICE] logout');
    // cancello token firebase dal local storage e da firebase
    // dovrebbe scattare l'evento authchangeStat
    this.signOut();
  }

}

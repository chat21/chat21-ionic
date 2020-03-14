import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';

import * as firebase from 'firebase/app';


// singlenton
import { UserService } from '../providers/user/user';

/*
  Generated class for the AuthService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
/**
 * DESC PROVIDER
 */
export class AuthService {

  tenant: string;
  public token: any;
  public fireAuth: firebase.auth.Auth;
  public userProfile: firebase.database.Reference;
  public urlNodeFirebase: string;

  constructor(
    //private afAuth: AngularFireAuth, 
    private config: Config, 
    private storage: Storage,
    private userService:UserService
  ) {
    console.log('Hello AuthService Provider');
    // recupero tenant
    // console.log('ionViewDidLoad First');
    // this.userProvider.log(); // log First singleton data
    // this.userProvider.set("First singleton data")

    let appConfig = config.get("appConfig");
    this.tenant = appConfig.tenant;

    this.fireAuth = firebase.auth();
    this.urlNodeFirebase = '/apps/'+this.tenant+'/contacts/';
    this.userProfile = firebase.database().ref(this.urlNodeFirebase);
    //this.afAuth.authState.subscribe();

    // this.afAuth.authState.subscribe((user: firebase.User) => {
    //   this.currentUser = user;
    // });
  }
  
  //Start Firebase Auth//

  // GetUser
  getUser(): firebase.User {
    return this.fireAuth.currentUser;
  }
 

  // Create User Anonymous
  // createAnonymousUser(): firebase.Promise<any> {
  //   return this.fireAuth.signInAnonymously();
  // }

  // Login with Email
  doLoginFirebase(email: string, password: string): any {
    return this.fireAuth.signInWithEmailAndPassword(email, password);
    var token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTU4Mzc0Mzk0NiwiZXhwIjoxNTgzNzQ3NTQ2LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1hMHIxNkBjaGF0MjEtcHJlLTAxLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstYTByMTZAY2hhdDIxLXByZS0wMS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6IjVhYjBmM2ZhNTcwNjZlMDAxNGJmZDcxZSJ9.JuNGrLuEU2Re5HB1xD1U7HR34QTYrJFp1IzCn-nAndTrzEzXrHjQYn-v4oidUiEVaWiBi-B0XnSlly_-3n34vpujlK7wKwgf4Vb6gPbvCoPIoodDXV1VgOSKwKEmQO1v5_YxJyKAWVTNOIr5CnkCCGiXEgZwtY9WDF_pA1EqMrAI3T8sjKMJEwKcCKXZgahGboXIV90j8ojxmGXFcSpOhEW2OSntH8IwNWm7Jo1dtwEWu5XWqnRr9WaaTL2xVyRYjqk6Sn-yBmAi80AsK6AnOxn9bhEit18ThRM-mIakVDxywQXk16lS_iZ10Hd5QlBsOcv0r5cOYCQ3G82LmHqX7A';
    return this.fireAuth.signInWithCustomToken(token)
  }


  authenticateFirebaseCustomToken(token1) {
    var token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTU4MjExMjg5MSwiZXhwIjoxNTgyMTE2NDkxLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1hMHIxNkBjaGF0MjEtcHJlLTAxLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstYTByMTZAY2hhdDIxLXByZS0wMS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6IjVhYjBmM2ZhNTcwNjZlMDAxNGJmZDcxZSJ9.Llje-vrKd2j4wPnZP6pRccPj04Fq5YFGa_tkWb6WO2lwcu4-OWkI0f8hfHk39jUKkWHTFDSAJWRJQo4VnuojplkB8ZKBloynD1OgMl4aM7Ou6W0z5mvKwiOLTmeVzErNgPMv5C-AoZeucLQN8PahuP_W8SD-7q8lxHnHAQrI-4R_8fdW4njAKuskPYkIxa5n0GpJk0J5-3hwPTNjsZTfwP0J7c9tVFI4_2XhqbjhKloa5W2LsH6X3YXTQ9SXBRt7vJ6ujsOggrcvpKWNql33XG2yy9d1zCd1OOaxHgtc6f-1hWmlga-WPKkDvPLPJ4ZdF4QHqKTnSLeNQhmC-xiDDA';
    const that = this;
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
      // Sign-out successful.
      return this.fireAuth.signInWithCustomToken(token)
      .then(function(response) {
        this.g.wdLog(['obsLoggedUser - authService.authenticateFirebaseCustomToken']);
        // that.getToken();????
        return response;
      })
      .catch(function(error) {
          const errorCode = error.code;
          const errorMessage = error.message;
      });
    })
    .catch(function(error) {
      console.error('Error setting firebase auth persistence', error);
    });
  }
  
  // Signin with Facebook
  // signInWithFacebook(): any {
  //   return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
  //   .then(res => console.log(res));
  // }


  // Register User with Email
  register(email: string, password: string, firstname: string, lastname: string): any {
    return this.fireAuth.createUserWithEmailAndPassword(email, password); 
  }

  // delete account
  delete(){
    var user = firebase.auth().currentUser;
    user.delete().then(function() {
      // User deleted.
      console.log("delete OK ");
    }).catch(function(error) {
      // An error happened.
      console.log("delete with error: ",error);
    });
  }

  // Reset Password
  resetPassword(email: string): any {
    return this.fireAuth.sendPasswordResetEmail(email);
  }
  
  logoutUser() {
    console.log("AuthService::logoutUser")

    return firebase.auth().signOut()
    //return this.afAuth.auth.signOut();
    // .then((res) => {
    //   console.log("logout1",res);
    //   console.log("logout2", this.getUser());
    // })
    // .catch(function(error) {
    //   console.log("logout failed: " + error.message)
    // });
  }
  //End Firebase Auth//
}
